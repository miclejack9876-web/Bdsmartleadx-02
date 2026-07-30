-- ============================================================================
-- BdSmartLeadX-02 Production Database Schema Migration
-- Migration: 00001_initial_schema.sql
-- Description: Core schema, tables, triggers, indexes, and RLS security policies
-- Target Database: Supabase PostgreSQL
-- ============================================================================

-- 1. EXTENSIONS & FUNCTIONS SETUP
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Automatic updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. CORE TABLES DEFINITION

-- ----------------------------------------------------------------------------
-- Table: roles
-- Description: System user roles definition
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- Table: profiles
-- Description: User account profiles linked to Supabase auth.users
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    department TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- Table: user_wallets
-- Description: Financial wallet balance and earnings tracking per user
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    balance NUMERIC(14, 4) NOT NULL DEFAULT 0.0000 CHECK (balance >= 0),
    pending_balance NUMERIC(14, 4) NOT NULL DEFAULT 0.0000 CHECK (pending_balance >= 0),
    total_earned NUMERIC(14, 4) NOT NULL DEFAULT 0.0000 CHECK (total_earned >= 0),
    total_withdrawn NUMERIC(14, 4) NOT NULL DEFAULT 0.0000 CHECK (total_withdrawn >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- Table: wallet_transactions
-- Description: Immutable wallet ledger transactions
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES public.user_wallets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('credit', 'debit', 'payout', 'referral_bonus', 'deposit', 'withdrawal', 'adjustment')),
    amount NUMERIC(14, 4) NOT NULL,
    balance_after NUMERIC(14, 4) NOT NULL,
    reference_id TEXT,
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- Table: offers
-- Description: Lead generation campaigns and offer definitions
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    payout NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (payout >= 0),
    category TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- Table: offer_clicks
-- Description: Tracking clicks on active offers
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.offer_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    referer TEXT,
    sub_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- Table: submissions
-- Description: Lead conversion and offer submission entries
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    click_id UUID REFERENCES public.offer_clicks(id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    payout_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (payout_amount >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- Table: withdrawals
-- Description: User payout requests
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    wallet_id UUID NOT NULL REFERENCES public.user_wallets(id) ON DELETE CASCADE,
    amount NUMERIC(14, 4) NOT NULL CHECK (amount > 0),
    payout_method VARCHAR(50) NOT NULL,
    payout_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
    admin_notes TEXT,
    processed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- Table: deposit_requests
-- Description: Funds deposit requests from users or advertisers
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.deposit_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(14, 4) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(50) NOT NULL,
    transaction_reference TEXT NOT NULL,
    payment_details JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- Table: referrals
-- Description: User referral hierarchy and tracking
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referee_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    referral_code VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'rewarded')),
    commission_rate NUMERIC(5, 2) NOT NULL DEFAULT 5.00 CHECK (commission_rate >= 0),
    total_earned NUMERIC(14, 4) NOT NULL DEFAULT 0.0000 CHECK (total_earned >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- Table: notifications
-- Description: User in-app notifications system
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'system')),
    is_read BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- Table: app_settings
-- Description: Global application configurations and feature flags
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. UPDATED_AT TRIGGERS ATTACHMENT
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_wallets_updated_at BEFORE UPDATE ON public.user_wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wallet_transactions_updated_at BEFORE UPDATE ON public.wallet_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON public.offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_offer_clicks_updated_at BEFORE UPDATE ON public.offer_clicks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON public.submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_withdrawals_updated_at BEFORE UPDATE ON public.withdrawals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deposit_requests_updated_at BEFORE UPDATE ON public.deposit_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON public.referrals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON public.app_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON public.user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON public.wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON public.wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_offers_status ON public.offers(status);
CREATE INDEX IF NOT EXISTS idx_offer_clicks_offer_id ON public.offer_clicks(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_clicks_user_id ON public.offer_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON public.submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_offer_id ON public.submissions(offer_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON public.withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_user_id ON public.deposit_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_status ON public.deposit_requests(status);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee_id ON public.referrals(referee_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_unread ON public.notifications(user_id) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON public.app_settings(key);

-- 5. ROW LEVEL SECURITY (RLS) & HELPER FUNCTIONS

-- Helper function: Check if current authenticated user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES DEFINITION

-- 1. roles
CREATE POLICY "roles_select_policy" ON public.roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "roles_insert_policy" ON public.roles FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "roles_update_policy" ON public.roles FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "roles_delete_policy" ON public.roles FOR DELETE TO authenticated USING (public.is_admin());

-- 2. profiles
CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "profiles_insert_policy" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id OR public.is_admin());
CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id OR public.is_admin()) WITH CHECK (auth.uid() = id OR public.is_admin());
CREATE POLICY "profiles_delete_policy" ON public.profiles FOR DELETE TO authenticated USING (public.is_admin());

-- 3. user_wallets
CREATE POLICY "user_wallets_select_policy" ON public.user_wallets FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "user_wallets_insert_policy" ON public.user_wallets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "user_wallets_update_policy" ON public.user_wallets FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "user_wallets_delete_policy" ON public.user_wallets FOR DELETE TO authenticated USING (public.is_admin());

-- 4. wallet_transactions
CREATE POLICY "wallet_transactions_select_policy" ON public.wallet_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "wallet_transactions_insert_policy" ON public.wallet_transactions FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "wallet_transactions_update_policy" ON public.wallet_transactions FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "wallet_transactions_delete_policy" ON public.wallet_transactions FOR DELETE TO authenticated USING (public.is_admin());

-- 5. offers
CREATE POLICY "offers_select_policy" ON public.offers FOR SELECT TO authenticated USING (status = 'active' OR public.is_admin());
CREATE POLICY "offers_insert_policy" ON public.offers FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "offers_update_policy" ON public.offers FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "offers_delete_policy" ON public.offers FOR DELETE TO authenticated USING (public.is_admin());

-- 6. offer_clicks
CREATE POLICY "offer_clicks_select_policy" ON public.offer_clicks FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "offer_clicks_insert_policy" ON public.offer_clicks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL OR public.is_admin());
CREATE POLICY "offer_clicks_update_policy" ON public.offer_clicks FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "offer_clicks_delete_policy" ON public.offer_clicks FOR DELETE TO authenticated USING (public.is_admin());

-- 7. submissions
CREATE POLICY "submissions_select_policy" ON public.submissions FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "submissions_insert_policy" ON public.submissions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "submissions_update_policy" ON public.submissions FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "submissions_delete_policy" ON public.submissions FOR DELETE TO authenticated USING (public.is_admin());

-- 8. withdrawals
CREATE POLICY "withdrawals_select_policy" ON public.withdrawals FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "withdrawals_insert_policy" ON public.withdrawals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "withdrawals_update_policy" ON public.withdrawals FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "withdrawals_delete_policy" ON public.withdrawals FOR DELETE TO authenticated USING (public.is_admin());

-- 9. deposit_requests
CREATE POLICY "deposit_requests_select_policy" ON public.deposit_requests FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "deposit_requests_insert_policy" ON public.deposit_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "deposit_requests_update_policy" ON public.deposit_requests FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "deposit_requests_delete_policy" ON public.deposit_requests FOR DELETE TO authenticated USING (public.is_admin());

-- 10. referrals
CREATE POLICY "referrals_select_policy" ON public.referrals FOR SELECT TO authenticated USING (auth.uid() = referrer_id OR auth.uid() = referee_id OR public.is_admin());
CREATE POLICY "referrals_insert_policy" ON public.referrals FOR INSERT TO authenticated WITH CHECK (auth.uid() = referrer_id OR public.is_admin());
CREATE POLICY "referrals_update_policy" ON public.referrals FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "referrals_delete_policy" ON public.referrals FOR DELETE TO authenticated USING (public.is_admin());

-- 11. notifications
CREATE POLICY "notifications_select_policy" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "notifications_insert_policy" ON public.notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "notifications_update_policy" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "notifications_delete_policy" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.is_admin());

-- 12. app_settings
CREATE POLICY "app_settings_select_policy" ON public.app_settings FOR SELECT USING (is_public = true OR public.is_admin());
CREATE POLICY "app_settings_insert_policy" ON public.app_settings FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "app_settings_update_policy" ON public.app_settings FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "app_settings_delete_policy" ON public.app_settings FOR DELETE TO authenticated USING (public.is_admin());

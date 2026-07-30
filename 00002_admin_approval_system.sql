-- ============================================================================
-- Migration: 00002_admin_approval_system.sql
-- Project: BdSmartLeadX-02
-- Description: Adds strict Admin Approval system for user registrations.
-- ============================================================================

-- 1. Add approval columns to public.profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(30) NOT NULL DEFAULT 'pending' 
CHECK (approval_status IN ('pending', 'approved', 'rejected'));

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT false;

-- Automatically approve any existing admin profiles
UPDATE public.profiles 
SET approval_status = 'approved', is_approved = true 
WHERE role = 'admin';

-- 2. Create function to automatically handle new user registration in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    approval_status,
    is_approved,
    is_active
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    'user',
    'pending',
    false,
    true
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;

  -- Create wallet for new user
  INSERT INTO public.user_wallets (user_id, balance, pending_balance, currency)
  VALUES (NEW.id, 0.00, 0.00, 'USD')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Enable RLS on public.profiles and set approval management policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Allow admins full access to view and update profiles for approvals
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles" 
ON public.profiles FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

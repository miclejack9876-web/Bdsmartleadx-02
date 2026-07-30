-- ============================================================================
-- Migration: 00003_task_submissions_system.sql
-- Description: Adds 4-screenshot submission fields, target_app_url, wallet rewards, and sample data.
-- ============================================================================

-- 1. Ensure offers table has target_app_url
ALTER TABLE public.offers 
ADD COLUMN IF NOT EXISTS target_app_url TEXT,
ADD COLUMN IF NOT EXISTS max_completions INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS current_completions INTEGER DEFAULT 0;

-- 2. Add 4 screenshot URL columns to public.submissions
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS screenshot_1_url TEXT,
ADD COLUMN IF NOT EXISTS screenshot_2_url TEXT,
ADD COLUMN IF NOT EXISTS screenshot_3_url TEXT,
ADD COLUMN IF NOT EXISTS screenshot_4_url TEXT,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 3. Function to handle reward payout when submission is approved
CREATE OR REPLACE FUNCTION public.approve_task_submission(
  p_submission_id UUID,
  p_reviewer_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_submission RECORD;
  v_offer RECORD;
  v_payout NUMERIC(14,4);
BEGIN
  -- Fetch submission
  SELECT * INTO v_submission FROM public.submissions WHERE id = p_submission_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found';
  END IF;

  IF v_submission.status = 'approved' THEN
    RETURN TRUE; -- Already approved
  END IF;

  v_payout := COALESCE(v_submission.payout_amount, 1.0000);
  IF v_payout <= 0 THEN
    v_payout := 1.0000;
  END IF;

  -- Update submission status to approved
  UPDATE public.submissions 
  SET status = 'approved', updated_at = NOW() 
  WHERE id = p_submission_id;

  -- Update offer completion counter
  UPDATE public.offers 
  SET current_completions = current_completions + 1, updated_at = NOW() 
  WHERE id = v_submission.offer_id;

  -- Ensure worker wallet exists and credit +1 Surfing Balance
  INSERT INTO public.user_wallets (user_id, balance, total_earned, currency)
  VALUES (v_submission.user_id, v_payout, v_payout, 'USD')
  ON CONFLICT (user_id) DO UPDATE 
  SET 
    balance = public.user_wallets.balance + v_payout,
    total_earned = public.user_wallets.total_earned + v_payout,
    updated_at = NOW();

  -- Record wallet transaction
  INSERT INTO public.wallet_transactions (
    wallet_id,
    user_id,
    type,
    amount,
    balance_after,
    reference_id,
    description,
    status
  )
  SELECT 
    w.id,
    v_submission.user_id,
    'credit',
    v_payout,
    w.balance,
    p_submission_id::text,
    'Task Completion Reward (+1 Surfing Balance)',
    'completed'
  FROM public.user_wallets w
  WHERE w.user_id = v_submission.user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Enable RLS and setup open policies for submissions and offers
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read offers" ON public.offers;
CREATE POLICY "Allow authenticated read offers" ON public.offers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert offers" ON public.offers;
CREATE POLICY "Allow authenticated insert offers" ON public.offers FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow users to view submissions" ON public.submissions;
CREATE POLICY "Allow users to view submissions" ON public.submissions FOR SELECT USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM public.offers WHERE offers.id = submissions.offer_id AND offers.created_by = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

DROP POLICY IF EXISTS "Allow users to submit tasks" ON public.submissions;
CREATE POLICY "Allow users to submit tasks" ON public.submissions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow offer owner or admin to update submission" ON public.submissions;
CREATE POLICY "Allow offer owner or admin to update submission" ON public.submissions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.offers WHERE offers.id = submissions.offer_id AND offers.created_by = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

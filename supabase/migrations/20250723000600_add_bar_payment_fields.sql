-- Add MoMo and Revolut fields and onboarding_status to bars
ALTER TABLE bars
  ADD COLUMN IF NOT EXISTS momo_code text,
  ADD COLUMN IF NOT EXISTS revolut_link text,
  ADD COLUMN IF NOT EXISTS onboarding_status text DEFAULT 'pending';

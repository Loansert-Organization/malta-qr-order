-- Add MoMo and Revolut fields and onboarding_status to bars
ALTER TABLE bars
  ADD COLUMN IF NOT EXISTS momo_code text,
  ADD COLUMN IF NOT EXISTS revolut_link text,
  ADD COLUMN IF NOT EXISTS onboarding_status text DEFAULT 'pending';

-- Ensure menu_items table exists
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bar_id uuid REFERENCES bars(id) ON DELETE CASCADE,
  name text,
  description text,
  price numeric,
  category text,
  subcategory text,
  image_url text,
  available boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Create table for bars pending onboarding
CREATE TABLE IF NOT EXISTS bars_pending_onboarding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bar_name text NOT NULL,
  contact_person text,
  phone_number text,
  country text,
  city text,
  gps_location text,
  created_at timestamp with time zone DEFAULT now()
);

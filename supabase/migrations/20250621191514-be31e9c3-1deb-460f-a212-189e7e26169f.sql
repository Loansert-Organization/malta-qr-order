
-- Create the bars table to store Malta bar information
CREATE TABLE public.bars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  contact_number text,
  rating numeric,
  review_count integer,
  location_gps point,
  google_place_id text UNIQUE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Add RLS policies for the bars table
ALTER TABLE public.bars ENABLE ROW LEVEL SECURITY;

-- Policy to allow reading bars data for all users
CREATE POLICY "Allow public read access to bars" 
  ON public.bars 
  FOR SELECT 
  USING (true);

-- Policy to allow admin users to insert/update bars data
CREATE POLICY "Allow admin insert/update bars" 
  ON public.bars 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create index for better performance on location queries
CREATE INDEX idx_bars_location_gps ON public.bars USING GIST (location_gps);
CREATE INDEX idx_bars_google_place_id ON public.bars (google_place_id);

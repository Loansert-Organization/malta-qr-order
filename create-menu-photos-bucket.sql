-- Create the menu_photos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu_photos', 'menu_photos', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Enable RLS on bucket
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'menu_photos');

CREATE POLICY "Service role write access" ON storage.objects
FOR INSERT TO service_role
WITH CHECK (bucket_id = 'menu_photos');

CREATE POLICY "Service role update access" ON storage.objects
FOR UPDATE TO service_role
USING (bucket_id = 'menu_photos');

-- Create image_errors table
CREATE TABLE IF NOT EXISTS image_errors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id uuid REFERENCES menu_items(id),
  reason text,
  timestamp timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE image_errors ENABLE ROW LEVEL SECURITY;

-- Policy for service role
CREATE POLICY "Service role full access" ON image_errors
FOR ALL TO service_role
USING (true); 
-- Create storage buckets for menu images and bar logos
INSERT INTO storage.buckets (id, name, public, avif_autodetection, allowed_mime_types)
VALUES 
  ('menu_images', 'menu_images', true, false, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('bar-logos', 'bar-logos', true, false, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Allow anonymous upload menu images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'menu_images');

CREATE POLICY "Allow anonymous update menu images" ON storage.objects
  FOR UPDATE WITH CHECK (bucket_id = 'menu_images');

CREATE POLICY "Allow anonymous delete menu images" ON storage.objects
  FOR DELETE USING (bucket_id = 'menu_images');

CREATE POLICY "Allow public read menu images" ON storage.objects
  FOR SELECT USING (bucket_id = 'menu_images');

CREATE POLICY "Allow anonymous upload bar logos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'bar-logos');

CREATE POLICY "Allow anonymous update bar logos" ON storage.objects
  FOR UPDATE WITH CHECK (bucket_id = 'bar-logos');

CREATE POLICY "Allow anonymous delete bar logos" ON storage.objects
  FOR DELETE USING (bucket_id = 'bar-logos');

CREATE POLICY "Allow public read bar logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'bar-logos'); 
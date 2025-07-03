-- Create storage bucket for bar photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('bar_photos', 'bar_photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for public access
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'bar_photos');
CREATE POLICY "Authenticated can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'bar_photos');
CREATE POLICY "Authenticated can update" ON storage.objects FOR UPDATE USING (bucket_id = 'bar_photos');
CREATE POLICY "Authenticated can delete" ON storage.objects FOR DELETE USING (bucket_id = 'bar_photos'); 
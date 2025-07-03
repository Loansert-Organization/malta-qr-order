-- Check if Il-Fortizza and Zion Bar & Restaurant exist in the database
SELECT id, name, address, lat, lng, google_rating as rating, review_count, google_place_id, has_menu
FROM public.bars
WHERE name IN ('Il-Fortizza', 'Zion Bar & Restaurant');

-- Insert bars if they don't exist
INSERT INTO public.bars (name, address, location, lat, lng, country, has_menu)
VALUES 
  ('Il-Fortizza', 'Il-Fortizza, Is-Swieqi, Malta', ST_GeogFromText('POINT(14.5071812 35.9142324)'), 35.9142324, 14.5071812, 'Malta', false),
  ('Zion Bar & Restaurant', 'St Thomas Bay, Marsaskala, Malta', ST_GeogFromText('POINT(14.563192 35.8540592)'), 35.8540592, 14.563192, 'Malta', false)
ON CONFLICT (name) DO NOTHING;

-- Check bar_photos table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bar_photos' AND table_schema = 'public'
ORDER BY ordinal_position; 
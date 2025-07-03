-- Insert Il-Fortizza and Zion Bar & Restaurant with Google Maps data
-- Based on the Google Maps URLs provided

-- Insert Il-Fortizza
INSERT INTO public.bars (
    name, 
    address, 
    lat, 
    lng, 
    country, 
    google_place_id,
    google_rating,
    has_menu
) 
VALUES (
    'Il-Fortizza',
    'Il-Fortizza, Is-Swieqi, Malta',
    35.9142324,
    14.5071812,
    'Malta',
    'ChIJzSnWwzxFDhMRCcDdeYXnDcI',
    NULL, -- Will need to be fetched via API
    false
)
ON CONFLICT (name) 
DO UPDATE SET
    address = EXCLUDED.address,
    lat = EXCLUDED.lat,
    lng = EXCLUDED.lng,
    google_place_id = EXCLUDED.google_place_id,
    updated_at = NOW();

-- Insert Zion Bar & Restaurant
INSERT INTO public.bars (
    name, 
    address, 
    lat, 
    lng, 
    country, 
    google_place_id,
    google_rating,
    has_menu
) 
VALUES (
    'Zion Bar & Restaurant',
    'St Thomas Bay, Marsaskala, Malta',
    35.8540592,
    14.563192,
    'Malta',
    'ChIJlQztqH2xDhMRI2pSqM-mMtc',
    NULL, -- Will need to be fetched via API
    false
)
ON CONFLICT (name) 
DO UPDATE SET
    address = EXCLUDED.address,
    lat = EXCLUDED.lat,
    lng = EXCLUDED.lng,
    google_place_id = EXCLUDED.google_place_id,
    updated_at = NOW();

-- Verify the insertions
SELECT 
    id,
    name, 
    address, 
    lat, 
    lng, 
    google_place_id,
    google_rating,
    review_count,
    has_menu,
    created_at,
    updated_at
FROM public.bars 
WHERE name IN ('Il-Fortizza', 'Zion Bar & Restaurant');

-- Note: To fetch photos and additional data (rating, review count), 
-- you'll need to call the Supabase Edge Function 'fetch-multiple-photos-enhanced'
-- with the bar IDs from the above query 
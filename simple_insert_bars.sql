-- Simple insert for Il-Fortizza and Zion Bar & Restaurant
-- Using data from the Google Maps URLs provided

-- Insert Il-Fortizza
INSERT INTO public.bars (
    name, 
    address, 
    latitude, 
    longitude, 
    country, 
    google_place_id,
    has_menu
) 
VALUES (
    'Il-Fortizza',
    'Il-Fortizza, Is-Swieqi, Malta',
    35.9142324,
    14.5071812,
    'Malta',
    'ChIJzSnWwzxFDhMRCcDdeYXnDcI',
    false
)
ON CONFLICT (name) DO NOTHING;

-- Insert Zion Bar & Restaurant
INSERT INTO public.bars (
    name, 
    address, 
    latitude, 
    longitude, 
    country, 
    google_place_id,
    has_menu
) 
VALUES (
    'Zion Bar & Restaurant',
    'St Thomas Bay, Marsaskala, Malta',
    35.8540592,
    14.563192,
    'Malta',
    'ChIJlQztqH2xDhMRI2pSqM-mMtc',
    false
)
ON CONFLICT (name) DO NOTHING;

-- Verify the bars were inserted
SELECT id, name, address, latitude, longitude, country, google_place_id, has_menu
FROM public.bars
WHERE name IN ('Il-Fortizza', 'Zion Bar & Restaurant'); 
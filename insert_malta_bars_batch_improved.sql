-- IMPROVED SQL script to insert Malta bars/restaurants into the bars table
-- This script is optimized for the actual database schema used in the project
-- Uses ON CONFLICT to prevent duplicates based on the name column

-- Ensure the bars table has a unique constraint on the name column
-- (Uncomment if not already set)
-- ALTER TABLE bars ADD CONSTRAINT unique_bar_name UNIQUE (name);

-- Insert statements with proper schema alignment and conflict handling
INSERT INTO bars (
    id,
    name,
    address,
    contact_number,
    rating,
    review_count,
    latitude,
    longitude,
    google_place_id,
    created_at,
    updated_at,
    website_url,
    has_menu,
    country,
    is_active
) VALUES 
    (gen_random_uuid(), 'Aqualuna Lido Bistro', NULL, NULL, NULL, 0, NULL, NULL, NULL, NOW(), NOW(), NULL, false, 'Malta', true),
    (gen_random_uuid(), '516 Black Bull', NULL, NULL, NULL, 0, NULL, NULL, NULL, NOW(), NOW(), NULL, false, 'Malta', true),
    (gen_random_uuid(), 'Brown''s Kitchen', NULL, NULL, NULL, 0, NULL, NULL, NULL, NOW(), NOW(), NULL, false, 'Malta', true),
    (gen_random_uuid(), 'Bus Stop Lounge', NULL, NULL, NULL, 0, NULL, NULL, NULL, NOW(), NOW(), NULL, false, 'Malta', true),
    (gen_random_uuid(), 'Cafe Cuba St Julians', NULL, NULL, NULL, 0, NULL, NULL, NULL, NOW(), NOW(), NULL, false, 'Malta', true),
    (gen_random_uuid(), 'Cuba Campus Hub', NULL, NULL, NULL, 0, NULL, NULL, NULL, NOW(), NOW(), NULL, false, 'Malta', true),
    (gen_random_uuid(), 'Cuba Shoreline', NULL, NULL, NULL, 0, NULL, NULL, NULL, NOW(), NOW(), NULL, false, 'Malta', true),
    (gen_random_uuid(), 'Doma Marsascala', NULL, NULL, NULL, 0, NULL, NULL, NULL, NOW(), NOW(), NULL, false, 'Malta', true),
    (gen_random_uuid(), 'Exiles', NULL, NULL, NULL, 0, NULL, NULL, NULL, NOW(), NOW(), NULL, false, 'Malta', true),
    (gen_random_uuid(), 'Felice Brasserie', NULL, NULL, NULL, 0, NULL, NULL, NULL, NOW(), NOW(), NULL, false, 'Malta', true),
    (gen_random_uuid(), 'Fortizza', NULL, NULL, NULL, 0, NULL, NULL, NULL, NOW(), NOW(), NULL, false, 'Malta', true),
    (gen_random_uuid(), 'House of Flavors', NULL, NULL, NULL, 0, NULL, NULL, NULL, NOW(), NOW(), NULL, false, 'Malta', true),
    (gen_random_uuid(), 'Kings Gate', NULL, NULL, NULL, 0, NULL, NULL, NULL, NOW(), NOW(), NULL, false, 'Malta', true),
    (gen_random_uuid(), 'Mamma Mia', NULL, NULL, NULL, 0, NULL, NULL, NULL, NOW(), NOW(), NULL, false, 'Malta', true),
    (gen_random_uuid(), 'Medasia Fusion Lounge', NULL, NULL, NULL, 0, NULL, NULL, NULL, NOW(), NOW(), NULL, false, 'Malta', true),
    (gen_random_uuid(), 'Okurama Asian Fusion', NULL, NULL, NULL, 0, NULL, NULL, NULL, NOW(), NOW(), NULL, false, 'Malta', true),
    (gen_random_uuid(), 'Paparazzi 29', NULL, NULL, NULL, 0, NULL, NULL, NULL, NOW(), NOW(), NULL, false, 'Malta', true),
    (gen_random_uuid(), 'Peperino Pizza Cucina Verace', NULL, NULL, NULL, 0, NULL, NULL, NULL, NOW(), NOW(), NULL, false, 'Malta', true),
    (gen_random_uuid(), 'Sakura Japanese Cuisine Lounge', NULL, NULL, NULL, 0, NULL, NULL, NULL, NOW(), NOW(), NULL, false, 'Malta', true),
    (gen_random_uuid(), 'Spinola Cafe Lounge St Julians', NULL, NULL, NULL, 0, NULL, NULL, NULL, NOW(), NOW(), NULL, false, 'Malta', true),
    (gen_random_uuid(), 'Surfside', NULL, NULL, NULL, 0, NULL, NULL, NULL, NOW(), NOW(), NULL, false, 'Malta', true),
    (gen_random_uuid(), 'Tex Mex American Bar Grill Paceville', NULL, NULL, NULL, 0, NULL, NULL, NULL, NOW(), NOW(), NULL, false, 'Malta', true),
    (gen_random_uuid(), 'The Brew Bar Grill', NULL, NULL, NULL, 0, NULL, NULL, NULL, NOW(), NOW(), NULL, false, 'Malta', true),
    (gen_random_uuid(), 'The Londoner British Pub Sliema', NULL, NULL, NULL, 0, NULL, NULL, NULL, NOW(), NOW(), NULL, false, 'Malta', true),
    (gen_random_uuid(), 'Victoria Gastro Pub', NULL, NULL, NULL, 0, NULL, NULL, NULL, NOW(), NOW(), NULL, false, 'Malta', true),
    (gen_random_uuid(), 'Zion Reggae Bar', NULL, NULL, NULL, 0, NULL, NULL, NULL, NOW(), NOW(), NULL, false, 'Malta', true)
ON CONFLICT (name) 
DO UPDATE SET 
    updated_at = NOW(),
    is_active = true,
    country = EXCLUDED.country
WHERE bars.name = EXCLUDED.name;

-- Query to verify the insertions and show the results
SELECT 
    name, 
    country,
    is_active,
    has_menu,
    created_at 
FROM bars 
WHERE name IN (
    'Aqualuna Lido Bistro', '516 Black Bull', 'Brown''s Kitchen', 'Bus Stop Lounge',
    'Cafe Cuba St Julians', 'Cuba Campus Hub', 'Cuba Shoreline', 'Doma Marsascala',
    'Exiles', 'Felice Brasserie', 'Fortizza', 'House of Flavors', 'Kings Gate',
    'Mamma Mia', 'Medasia Fusion Lounge', 'Okurama Asian Fusion', 'Paparazzi 29',
    'Peperino Pizza Cucina Verace', 'Sakura Japanese Cuisine Lounge',
    'Spinola Cafe Lounge St Julians', 'Surfside', 'Tex Mex American Bar Grill Paceville',
    'The Brew Bar Grill', 'The Londoner British Pub Sliema', 'Victoria Gastro Pub',
    'Zion Reggae Bar'
)
ORDER BY name;

-- Optional: Show count of total bars in Malta after insertion
SELECT COUNT(*) as total_malta_bars 
FROM bars 
WHERE country = 'Malta' AND is_active = true;
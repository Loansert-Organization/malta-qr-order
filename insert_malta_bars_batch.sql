-- SQL script to insert bars/restaurants into the bars table
-- This script uses ON CONFLICT to prevent duplicates based on the name column

-- First, ensure the bars table has a unique constraint on the name column
-- (Run this only if not already set)
-- ALTER TABLE bars ADD CONSTRAINT unique_bar_name UNIQUE (name);

-- Insert statements with ON CONFLICT handling
INSERT INTO bars (
    id,
    name,
    address,
    contact_number,
    rating,
    review_count,
    location_gps,
    google_place_id,
    created_at,
    updated_at,
    website_url,
    has_menu
) VALUES 
    (gen_random_uuid(), 'Aqualuna Lido Bistro', NULL, NULL, NULL, 0, NULL, NULL, NOW(), NOW(), NULL, false),
    (gen_random_uuid(), '516 Black Bull', NULL, NULL, NULL, 0, NULL, NULL, NOW(), NOW(), NULL, false),
    (gen_random_uuid(), 'Brown''s Kitchen', NULL, NULL, NULL, 0, NULL, NULL, NOW(), NOW(), NULL, false),
    (gen_random_uuid(), 'Bus Stop Lounge', NULL, NULL, NULL, 0, NULL, NULL, NOW(), NOW(), NULL, false),
    (gen_random_uuid(), 'Cafe Cuba St Julians', NULL, NULL, NULL, 0, NULL, NULL, NOW(), NOW(), NULL, false),
    (gen_random_uuid(), 'Cuba Campus Hub', NULL, NULL, NULL, 0, NULL, NULL, NOW(), NOW(), NULL, false),
    (gen_random_uuid(), 'Cuba Shoreline', NULL, NULL, NULL, 0, NULL, NULL, NOW(), NOW(), NULL, false),
    (gen_random_uuid(), 'Doma Marsascala', NULL, NULL, NULL, 0, NULL, NULL, NOW(), NOW(), NULL, false),
    (gen_random_uuid(), 'Exiles', NULL, NULL, NULL, 0, NULL, NULL, NOW(), NOW(), NULL, false),
    (gen_random_uuid(), 'Felice Brasserie', NULL, NULL, NULL, 0, NULL, NULL, NOW(), NOW(), NULL, false),
    (gen_random_uuid(), 'Fortizza', NULL, NULL, NULL, 0, NULL, NULL, NOW(), NOW(), NULL, false),
    (gen_random_uuid(), 'House of Flavors', NULL, NULL, NULL, 0, NULL, NULL, NOW(), NOW(), NULL, false),
    (gen_random_uuid(), 'Kings Gate', NULL, NULL, NULL, 0, NULL, NULL, NOW(), NOW(), NULL, false),
    (gen_random_uuid(), 'Mamma Mia', NULL, NULL, NULL, 0, NULL, NULL, NOW(), NOW(), NULL, false),
    (gen_random_uuid(), 'Medasia Fusion Lounge', NULL, NULL, NULL, 0, NULL, NULL, NOW(), NOW(), NULL, false),
    (gen_random_uuid(), 'Okurama Asian Fusion', NULL, NULL, NULL, 0, NULL, NULL, NOW(), NOW(), NULL, false),
    (gen_random_uuid(), 'Paparazzi 29', NULL, NULL, NULL, 0, NULL, NULL, NOW(), NOW(), NULL, false),
    (gen_random_uuid(), 'Peperino Pizza Cucina Verace', NULL, NULL, NULL, 0, NULL, NULL, NOW(), NOW(), NULL, false),
    (gen_random_uuid(), 'Sakura Japanese Cuisine Lounge', NULL, NULL, NULL, 0, NULL, NULL, NOW(), NOW(), NULL, false),
    (gen_random_uuid(), 'Spinola Cafe Lounge St Julians', NULL, NULL, NULL, 0, NULL, NULL, NOW(), NOW(), NULL, false),
    (gen_random_uuid(), 'Surfside', NULL, NULL, NULL, 0, NULL, NULL, NOW(), NOW(), NULL, false),
    (gen_random_uuid(), 'Tex Mex American Bar Grill Paceville', NULL, NULL, NULL, 0, NULL, NULL, NOW(), NOW(), NULL, false),
    (gen_random_uuid(), 'The Brew Bar Grill', NULL, NULL, NULL, 0, NULL, NULL, NOW(), NOW(), NULL, false),
    (gen_random_uuid(), 'The Londoner British Pub Sliema', NULL, NULL, NULL, 0, NULL, NULL, NOW(), NOW(), NULL, false),
    (gen_random_uuid(), 'Victoria Gastro Pub', NULL, NULL, NULL, 0, NULL, NULL, NOW(), NOW(), NULL, false),
    (gen_random_uuid(), 'Zion Reggae Bar', NULL, NULL, NULL, 0, NULL, NULL, NOW(), NOW(), NULL, false)
ON CONFLICT (name) 
DO UPDATE SET 
    updated_at = NOW()
WHERE bars.name = EXCLUDED.name;

-- Alternative version using a more defensive approach without unique constraint
-- This checks for existing records before inserting

/*
-- Insert only if name doesn't exist
INSERT INTO bars (
    id, name, address, contact_number, rating, review_count, 
    location_gps, google_place_id, created_at, updated_at, website_url, has_menu
)
SELECT 
    gen_random_uuid(), bar_name, NULL, NULL, NULL, 0, 
    NULL, NULL, NOW(), NOW(), NULL, false
FROM (
    VALUES 
        ('Aqualuna Lido Bistro'),
        ('516 Black Bull'),
        ('Brown''s Kitchen'),
        ('Bus Stop Lounge'),
        ('Cafe Cuba St Julians'),
        ('Cuba Campus Hub'),
        ('Cuba Shoreline'),
        ('Doma Marsascala'),
        ('Exiles'),
        ('Felice Brasserie'),
        ('Fortizza'),
        ('House of Flavors'),
        ('Kings Gate'),
        ('Mamma Mia'),
        ('Medasia Fusion Lounge'),
        ('Okurama Asian Fusion'),
        ('Paparazzi 29'),
        ('Peperino Pizza Cucina Verace'),
        ('Sakura Japanese Cuisine Lounge'),
        ('Spinola Cafe Lounge St Julians'),
        ('Surfside'),
        ('Tex Mex American Bar Grill Paceville'),
        ('The Brew Bar Grill'),
        ('The Londoner British Pub Sliema'),
        ('Victoria Gastro Pub'),
        ('Zion Reggae Bar')
) AS new_bars(bar_name)
WHERE NOT EXISTS (
    SELECT 1 FROM bars WHERE bars.name = new_bars.bar_name
);
*/

-- Query to verify the insertions
-- SELECT name, created_at FROM bars ORDER BY created_at DESC LIMIT 30;
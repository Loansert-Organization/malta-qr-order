-- SQL Migration for Uploading Restaurant Menus
-- Correctly uses bar_id and the actual menu_items table schema

-- First, create a menu for each bar if it doesn't exist
DO $$
DECLARE
    bar_record RECORD;
    menu_id UUID;
BEGIN
    FOR bar_record IN 
        SELECT id, name FROM public.bars 
        WHERE name IN (
            'The Londoner British Pub Sliema',
            'Mamma Mia',
            'The Brew Bar Grill'
        )
    LOOP
        -- Check if a vendor exists for this bar
        IF NOT EXISTS (SELECT 1 FROM public.vendors WHERE name = bar_record.name) THEN
            -- Create vendor for the bar
            INSERT INTO public.vendors (name, slug, business_name, is_active)
            VALUES (bar_record.name, LOWER(REPLACE(bar_record.name, ' ', '-')), bar_record.name, true);
        END IF;
        
        -- Get or create menu
        SELECT id INTO menu_id 
        FROM public.menus 
        WHERE vendor_id = (SELECT id FROM public.vendors WHERE name = bar_record.name)
        LIMIT 1;
        
        IF menu_id IS NULL THEN
            INSERT INTO public.menus (vendor_id, name, active)
            SELECT id, 'Main Menu', true
            FROM public.vendors 
            WHERE name = bar_record.name
            RETURNING id INTO menu_id;
        END IF;
    END LOOP;
END $$;

-- Clear existing menu items for these bars to avoid duplicates
DELETE FROM public.menu_items
WHERE bar_id IN (
    SELECT id FROM public.bars WHERE name IN (
        'The Londoner British Pub Sliema',
        'Mamma Mia', 
        'The Brew Bar Grill'
    )
);

-- Insert menu items for The Londoner British Pub Sliema
INSERT INTO public.menu_items (bar_id, menu_id, name, description, price, category, subcategory, available)
SELECT 
    b.id as bar_id,
    m.id as menu_id,
    item.name,
    item.description,
    item.price,
    item.category,
    item.subcategory,
    true as available
FROM public.bars b
JOIN public.vendors v ON v.name = b.name
JOIN public.menus m ON m.vendor_id = v.id
CROSS JOIN (VALUES
    -- STARTERS
    ('Vegetable Spring Rolls (V)', 'Served with sweet chilli dip', 7.95, 'Food', 'STARTERS'),
    ('Meat Balls', 'Beef and pork mince balls with jus', 9.95, 'Food', 'STARTERS'),
    ('Fish Cod Goujons', 'Served with lemon mayonnaise', 9.95, 'Food', 'STARTERS'),
    ('Chicken Satay Skewers', 'Served with peanut sauce dip', 10.95, 'Food', 'STARTERS'),
    ('Southern Fried Chicken Strips', 'Served with red white dip', 10.95, 'Food', 'STARTERS'),
    ('Mini Angus Cheese Burgers (4 Pieces)', NULL, 12.95, 'Food', 'STARTERS'),
    ('Traditional Nachos (V)', 'Cheese sauce, jalapeño, tomato salsa', 12.95, 'Food', 'STARTERS'),
    ('Deep Fried Calamari', 'Breaded, served with tartar sauce and lemon wedge', 14.95, 'Food', 'STARTERS'),
    ('Chicken & Spianata Nachos', 'Diced chicken, onions, salami spianata, nacho cheese sauce', 15.95, 'Food', 'STARTERS'),
    ('Grilled Lamb Kofta', 'Served with yoghurt mint dip', 10.95, 'Food', 'STARTERS'),
    
    -- NIBBLES
    ('Ultimate Garlic Bread (V)', 'Soft tear and share buns with garlic butter', 6.95, 'Food', 'NIBBLES'),
    ('Ultimate Garlic Bread with Cheese (V)', 'Soft tear and share buns with garlic butter and cheese', 7.95, 'Food', 'NIBBLES'),
    ('Proper Stealth Fries (V)', NULL, 5.5, 'Food', 'NIBBLES'),
    ('Cheese Stealth Fries (V) (H)', 'Served with curry ketchup', 5.95, 'Food', 'NIBBLES'),
    ('Beer Battered Onion Rings (V)', 'Served with spicy mayo', 8.5, 'Food', 'NIBBLES'),
    ('Spicy Pork Sausages', NULL, 7.5, 'Food', 'NIBBLES'),
    ('Fish Cod Bites', 'Served with tartar sauce', 9.95, 'Food', 'NIBBLES'),
    ('Fish Popcorn', 'Served with curry ketchup', 9.95, 'Food', 'NIBBLES'),
    ('Crispy Chicken Wings', 'Served with sweet chilli dip', 11.95, 'Food', 'NIBBLES'),
    ('Camembert Cheese Bites', NULL, 9.95, 'Food', 'NIBBLES'),
    ('Traditional Focaccia (V)', 'Cherry tomatoes, black olives, rosemary, and olive oil', 9.95, 'Food', 'NIBBLES'),
    ('Cheesy Bruschetta (V)', 'Tomatoes, garlic, basil, and melted cheese', 6.95, 'Food', 'NIBBLES'),
    ('Bruschetta (V)', 'Tomatoes, garlic, and basil', 5.95, 'Food', 'NIBBLES'),
    
    -- SALADS
    ('Royal Chicken Caesar', 'Grilled chicken, lettuce, bacon, parmesan, croutons, tomatoes, caesar dressing', 15.95, 'Food', 'SALADS'),
    ('Royal Salmon Caesar', 'Oven baked salmon fillet, ricotta, lettuce, cucumbers, onions, peppers, black olives, parmesan, croutons, tomatoes, caesar dressing', 17.95, 'Food', 'SALADS')
) AS item(name, description, price, category, subcategory)
WHERE b.name = 'The Londoner British Pub Sliema';

-- Note: This is a partial migration. The full menu items would be too long for a single query.
-- You can run additional INSERT statements for the remaining items. 
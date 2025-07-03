-- Complete menu insertion for The Londoner Pub Sliema
-- Part 1: Setup and initial categories

DO $$
DECLARE
    v_bar_id UUID;
    v_vendor_id UUID;
    v_menu_id UUID;
BEGIN
    -- Get or create bar
    SELECT id INTO v_bar_id FROM public.bars WHERE name = 'The Londoner Pub Sliema';
    IF v_bar_id IS NULL THEN
        INSERT INTO public.bars (name, location, lat, lng, country, google_rating) 
        VALUES ('The Londoner Pub Sliema', ST_GeogFromText('POINT(14.5076 35.9150)'), 35.9150, 14.5076, 'Malta', 4.5)
        RETURNING id INTO v_bar_id;
    END IF;
    
    -- Create vendor
    SELECT id INTO v_vendor_id FROM public.vendors WHERE name = 'The Londoner Pub Sliema';
    IF v_vendor_id IS NULL THEN
        INSERT INTO public.vendors (name, slug, business_name, is_active)
        VALUES ('The Londoner Pub Sliema', 'the-londoner-pub-sliema', 'The Londoner Pub Sliema', true)
        RETURNING id INTO v_vendor_id;
    END IF;
    
    -- Create menu
    SELECT id INTO v_menu_id FROM public.menus WHERE vendor_id = v_vendor_id;
    IF v_menu_id IS NULL THEN
        INSERT INTO public.menus (vendor_id, name, active)
        VALUES (v_vendor_id, 'Main Menu', true)
        RETURNING id INTO v_menu_id;
    END IF;
    
    -- Clear existing items
    DELETE FROM public.menu_items WHERE bar_id = v_bar_id;
    
    -- Insert STARTERS
    INSERT INTO public.menu_items (bar_id, menu_id, name, description, price, category, subcategory, available) VALUES
    (v_bar_id, v_menu_id, 'Vegetable Spring Rolls (V)', 'Served with sweet chilli dip', 7.95, 'Food', 'STARTERS', true),
    (v_bar_id, v_menu_id, 'Meat Balls', 'Beef and pork mince balls with jus', 9.95, 'Food', 'STARTERS', true),
    (v_bar_id, v_menu_id, 'Fish Cod Goujons', 'Served with lemon mayonnaise', 9.95, 'Food', 'STARTERS', true),
    (v_bar_id, v_menu_id, 'Chicken Satay Skewers', 'Served with peanut sauce dip', 10.95, 'Food', 'STARTERS', true),
    (v_bar_id, v_menu_id, 'Southern Fried Chicken Strips', 'Served with red white dip', 10.95, 'Food', 'STARTERS', true),
    (v_bar_id, v_menu_id, 'Mini Angus Cheese Burgers (4 Pieces)', NULL, 12.95, 'Food', 'STARTERS', true),
    (v_bar_id, v_menu_id, 'Traditional Nachos (V)', 'Cheese sauce, jalapeño, tomato salsa', 12.95, 'Food', 'STARTERS', true),
    (v_bar_id, v_menu_id, 'Deep Fried Calamari', 'Breaded, served with tartar sauce and lemon wedge', 14.95, 'Food', 'STARTERS', true),
    (v_bar_id, v_menu_id, 'Chicken & Spianata Nachos', 'Diced chicken, onions, salami spianata, nacho cheese sauce', 15.95, 'Food', 'STARTERS', true),
    (v_bar_id, v_menu_id, 'Grilled Lamb Kofta', 'Served with yoghurt mint dip', 10.95, 'Food', 'STARTERS', true);
    
    -- Insert NIBBLES
    INSERT INTO public.menu_items (bar_id, menu_id, name, description, price, category, subcategory, available) VALUES
    (v_bar_id, v_menu_id, 'Ultimate Garlic Bread (V)', 'Soft tear and share buns with garlic butter', 6.95, 'Food', 'NIBBLES', true),
    (v_bar_id, v_menu_id, 'Ultimate Garlic Bread with Cheese (V)', 'Soft tear and share buns with garlic butter and cheese', 7.95, 'Food', 'NIBBLES', true),
    (v_bar_id, v_menu_id, 'Proper Stealth Fries (V)', NULL, 5.5, 'Food', 'NIBBLES', true),
    (v_bar_id, v_menu_id, 'Cheese Stealth Fries (V) (H)', 'Served with curry ketchup', 5.95, 'Food', 'NIBBLES', true),
    (v_bar_id, v_menu_id, 'Beer Battered Onion Rings (V)', 'Served with spicy mayo', 8.5, 'Food', 'NIBBLES', true),
    (v_bar_id, v_menu_id, 'Spicy Pork Sausages', NULL, 7.5, 'Food', 'NIBBLES', true),
    (v_bar_id, v_menu_id, 'Fish Cod Bites', 'Served with tartar sauce', 9.95, 'Food', 'NIBBLES', true),
    (v_bar_id, v_menu_id, 'Fish Popcorn', 'Served with curry ketchup', 9.95, 'Food', 'NIBBLES', true),
    (v_bar_id, v_menu_id, 'Crispy Chicken Wings', 'Served with sweet chilli dip', 11.95, 'Food', 'NIBBLES', true),
    (v_bar_id, v_menu_id, 'Camembert Cheese Bites', NULL, 9.95, 'Food', 'NIBBLES', true),
    (v_bar_id, v_menu_id, 'Traditional Focaccia (V)', 'Cherry tomatoes, black olives, rosemary, and olive oil', 9.95, 'Food', 'NIBBLES', true),
    (v_bar_id, v_menu_id, 'Cheesy Bruschetta (V)', 'Tomatoes, garlic, basil, and melted cheese', 6.95, 'Food', 'NIBBLES', true),
    (v_bar_id, v_menu_id, 'Bruschetta (V)', 'Tomatoes, garlic, and basil', 5.95, 'Food', 'NIBBLES', true);
    
    RAISE NOTICE 'Inserted STARTERS and NIBBLES for The Londoner Pub Sliema';
END $$;

-- Part 2: Continue with remaining categories
DO $$
DECLARE
    v_bar_id UUID;
    v_menu_id UUID;
BEGIN
    -- Get IDs
    SELECT b.id, m.id INTO v_bar_id, v_menu_id
    FROM public.bars b
    JOIN public.vendors v ON v.name = b.name
    JOIN public.menus m ON m.vendor_id = v.id
    WHERE b.name = 'The Londoner Pub Sliema';
    
    -- Insert SALADS
    INSERT INTO public.menu_items (bar_id, menu_id, name, description, price, category, subcategory, available) VALUES
    (v_bar_id, v_menu_id, 'Royal Chicken Caesar', 'Grilled chicken, lettuce, bacon, parmesan, croutons, tomatoes, caesar dressing', 15.95, 'Food', 'SALADS', true),
    (v_bar_id, v_menu_id, 'Royal Salmon Caesar', 'Oven baked salmon fillet, ricotta, lettuce, cucumbers, onions, peppers, black olives, parmesan, croutons, tomatoes, caesar dressing', 17.95, 'Food', 'SALADS', true);
    
    -- Insert PLATTERS
    INSERT INTO public.menu_items (bar_id, menu_id, name, description, price, category, subcategory, available) VALUES
    (v_bar_id, v_menu_id, 'West End Oriental Platter', '4 pork ribs, meatballs, 2 vegetable spring rolls, fish bites, 2 lamb koftas, 4 chicken wings, fish popcorn, 2 chicken satays, stealth fries, garlic bread, and dips', 39.95, 'Food', 'PLATTERS', true),
    (v_bar_id, v_menu_id, 'Seafood & Fish Platter', 'Fish bites, deep fried calamari, fish popcorn, scampi, Londoner fish & chips, garlic bread, and dips', 39.95, 'Food', 'PLATTERS', true),
    (v_bar_id, v_menu_id, 'Drinker''s Favourite', '2 mini beef burgers, 2 lamb koftas, 4 chicken wings, spiced honey pork sausages, 2 chicken strips, 4 pork ribs, meatballs, garlic bread, 4 onion rings, and stealth fries smothered in melted cheese', 42.95, 'Food', 'PLATTERS', true),
    (v_bar_id, v_menu_id, 'Cold Cuts & Cheese Platter', 'Selection of Italian cold cuts and British cheeses, served with olives, mixed fruit & nuts, water biscuits, and grissini', 32.95, 'Food', 'PLATTERS', true),
    (v_bar_id, v_menu_id, 'The Londoner Platter', '8 pork ribs, 2 spiced honey pork sausages, 8 chicken wings, meatballs, Southern fried chicken strips, gourmet coleslaw, and stealth fries', 42.95, 'Food', 'PLATTERS', true);
    
    -- Insert PIES
    INSERT INTO public.menu_items (bar_id, menu_id, name, description, price, category, subcategory, available) VALUES
    (v_bar_id, v_menu_id, 'Steak & Kidney Pie', 'Braised beef and kidney, side salad, garlic bread, and your choice of stealth fries or mashed potatoes', 16.95, 'Food', 'PIES', true),
    (v_bar_id, v_menu_id, 'Chicken & Leek Pie', 'Garlic herb chicken and leek, side salad, garlic bread, and your choice of stealth fries or mashed potatoes', 16.95, 'Food', 'PIES', true),
    (v_bar_id, v_menu_id, 'Shepherd''s Pie', 'Slow cooked lamb mince, mashed potatoes, and side salad', 14.95, 'Food', 'PIES', true);
    
    -- Insert FISH
    INSERT INTO public.menu_items (bar_id, menu_id, name, description, price, category, subcategory, available) VALUES
    (v_bar_id, v_menu_id, 'The Londoner Fish & Chips', 'Beer battered haddock with stealth fries, mushy peas, and homemade tartare sauce', 16.95, 'Food', 'FISH', true),
    (v_bar_id, v_menu_id, 'Scampi & Chips', 'Breaded scampi with stealth fries and homemade tartare sauce', 13.95, 'Food', 'FISH', true),
    (v_bar_id, v_menu_id, 'Oven Baked Salmon Fillet', 'Served with fresh salad, boiled potatoes, and lemon butter sauce', 18.95, 'Food', 'FISH', true);
    
    -- Insert STEAKS
    INSERT INTO public.menu_items (bar_id, menu_id, name, description, price, category, subcategory, available) VALUES
    (v_bar_id, v_menu_id, 'Sirloin Steak', 'Served with mushroom, grilled tomato, side salad, stealth fries, and your choice of sauce', 26.95, 'Food', 'STEAKS', true),
    (v_bar_id, v_menu_id, 'T-Bone Steak', 'Served with mushroom, grilled tomato, side salad, stealth fries, and your choice of sauce', 29.95, 'Food', 'STEAKS', true),
    (v_bar_id, v_menu_id, 'Chicken & Pork Combo', 'Chicken thigh fillet and pork chop served with peppers, onions, rosemary jus, side salad, and stealth fries', 18.95, 'Food', 'STEAKS', true),
    (v_bar_id, v_menu_id, 'Gammon Steak', 'Served with fried egg, mushroom, grilled tomato, side salad, stealth fries, and gravy', 17.95, 'Food', 'STEAKS', true),
    (v_bar_id, v_menu_id, 'Butterfly Chicken Breast', 'Served with mushroom, grilled tomato, side salad, stealth fries, and your choice of sauce', 17.95, 'Food', 'STEAKS', true),
    (v_bar_id, v_menu_id, 'XXL Pork Ribs Full Rack', 'Served with coleslaw and stealth fries', 26.95, 'Food', 'STEAKS', true),
    (v_bar_id, v_menu_id, 'BBQ 1/2 Chicken', 'Served with side salad and stealth fries', 17.95, 'Food', 'STEAKS', true);
    
    RAISE NOTICE 'Successfully completed menu insertion for The Londoner Pub Sliema';
END $$; 
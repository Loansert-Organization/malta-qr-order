-- Step 1: Insert bars if they don't exist
-- Using dummy coordinates for Malta (Sliema area)
INSERT INTO public.bars (name, location, lat, lng, country, google_rating) 
VALUES 
    ('The Londoner British Pub Sliema', ST_GeogFromText('POINT(14.5076 35.9150)'), 35.9150, 14.5076, 'Malta', 4.5),
    ('Mamma Mia', ST_GeogFromText('POINT(14.5100 35.9170)'), 35.9170, 14.5100, 'Malta', 4.3),
    ('The Brew Bar Grill', ST_GeogFromText('POINT(14.5090 35.9160)'), 35.9160, 14.5090, 'Malta', 4.4)
ON CONFLICT DO NOTHING;

-- Step 2: Insert menu items for The Londoner British Pub Sliema
DO $$
DECLARE
    v_bar_id UUID;
    v_vendor_id UUID;
    v_menu_id UUID;
BEGIN
    -- Get bar ID
    SELECT id INTO v_bar_id FROM public.bars WHERE name = 'The Londoner British Pub Sliema';
    
    -- Create vendor if needed
    SELECT id INTO v_vendor_id FROM public.vendors WHERE name = 'The Londoner British Pub Sliema';
    IF v_vendor_id IS NULL THEN
        INSERT INTO public.vendors (name, slug, business_name, is_active)
        VALUES ('The Londoner British Pub Sliema', 'the-londoner-british-pub-sliema', 'The Londoner British Pub Sliema', true)
        RETURNING id INTO v_vendor_id;
    END IF;
    
    -- Create menu if needed
    SELECT id INTO v_menu_id FROM public.menus WHERE vendor_id = v_vendor_id;
    IF v_menu_id IS NULL THEN
        INSERT INTO public.menus (vendor_id, name, active)
        VALUES (v_vendor_id, 'Main Menu', true)
        RETURNING id INTO v_menu_id;
    END IF;
    
    -- Clear existing items
    DELETE FROM public.menu_items WHERE bar_id = v_bar_id;
    
    -- Insert menu items (partial list for testing)
    INSERT INTO public.menu_items (bar_id, menu_id, name, description, price, category, subcategory, available)
    VALUES
    -- STARTERS
    (v_bar_id, v_menu_id, 'Vegetable Spring Rolls (V)', 'Served with sweet chilli dip', 7.95, 'Food', 'STARTERS', true),
    (v_bar_id, v_menu_id, 'Meat Balls', 'Beef and pork mince balls with jus', 9.95, 'Food', 'STARTERS', true),
    (v_bar_id, v_menu_id, 'Fish Cod Goujons', 'Served with lemon mayonnaise', 9.95, 'Food', 'STARTERS', true);
    
    RAISE NOTICE 'Successfully inserted menu items for The Londoner British Pub Sliema';
END $$;

-- Step 3: Insert menu items for Mamma Mia
DO $$
DECLARE
    v_bar_id UUID;
    v_vendor_id UUID;
    v_menu_id UUID;
BEGIN
    -- Get bar ID
    SELECT id INTO v_bar_id FROM public.bars WHERE name = 'Mamma Mia';
    
    -- Create vendor if needed
    SELECT id INTO v_vendor_id FROM public.vendors WHERE name = 'Mamma Mia';
    IF v_vendor_id IS NULL THEN
        INSERT INTO public.vendors (name, slug, business_name, is_active)
        VALUES ('Mamma Mia', 'mamma-mia', 'Mamma Mia', true)
        RETURNING id INTO v_vendor_id;
    END IF;
    
    -- Create menu if needed
    SELECT id INTO v_menu_id FROM public.menus WHERE vendor_id = v_vendor_id;
    IF v_menu_id IS NULL THEN
        INSERT INTO public.menus (vendor_id, name, active)
        VALUES (v_vendor_id, 'Main Menu', true)
        RETURNING id INTO v_menu_id;
    END IF;
    
    -- Clear existing items
    DELETE FROM public.menu_items WHERE bar_id = v_bar_id;
    
    -- Insert menu items for Mamma Mia
    INSERT INTO public.menu_items (bar_id, menu_id, name, description, price, category, subcategory, available)
    VALUES
    -- STARTERS  
    (v_bar_id, v_menu_id, 'Bruschetta Al Pomodoro', 'Toasted bread, fresh tomatoes, garlic, basil, olive oil', 7.95, 'Food', 'STARTERS', true),
    (v_bar_id, v_menu_id, 'Burrata', 'Fresh burrata cheese, cherry tomatoes, basil, olive oil', 13.95, 'Food', 'STARTERS', true),
    (v_bar_id, v_menu_id, 'Calamari Fritti', 'Deep fried squid rings, tartar sauce', 11.95, 'Food', 'STARTERS', true);
    
    RAISE NOTICE 'Successfully inserted menu items for Mamma Mia';
END $$;

-- Note: This is a simplified version. The full menu data would be too large for a single script.
-- You can run additional INSERT statements for the remaining menu items. 
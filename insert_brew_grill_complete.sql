-- Complete menu insertion for The Brew Grill & Brewery
-- Based on the original data provided

DO $$
DECLARE
    v_bar_id UUID;
    v_vendor_id UUID;
    v_menu_id UUID;
BEGIN
    -- Get or create bar
    SELECT id INTO v_bar_id FROM public.bars WHERE name = 'The Brew Grill & Brewery';
    IF v_bar_id IS NULL THEN
        INSERT INTO public.bars (name, location, lat, lng, country, google_rating) 
        VALUES ('The Brew Grill & Brewery', ST_GeogFromText('POINT(14.5090 35.9160)'), 35.9160, 14.5090, 'Malta', 4.4)
        RETURNING id INTO v_bar_id;
    END IF;
    
    -- Create vendor
    SELECT id INTO v_vendor_id FROM public.vendors WHERE name = 'The Brew Grill & Brewery';
    IF v_vendor_id IS NULL THEN
        INSERT INTO public.vendors (name, slug, business_name, is_active)
        VALUES ('The Brew Grill & Brewery', 'the-brew-grill-brewery', 'The Brew Grill & Brewery', true)
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
    (v_bar_id, v_menu_id, 'Buffalo Wings', 'Spicy chicken wings with blue cheese dip', 10.95, 'Food', 'STARTERS', true),
    (v_bar_id, v_menu_id, 'Loaded Nachos', 'Tortilla chips, cheese, jalapeños, sour cream, guacamole', 12.95, 'Food', 'STARTERS', true),
    (v_bar_id, v_menu_id, 'Beer Battered Onion Rings', 'Crispy onion rings with BBQ sauce', 8.95, 'Food', 'STARTERS', true),
    (v_bar_id, v_menu_id, 'Mozzarella Sticks', 'Fried mozzarella with marinara sauce', 9.95, 'Food', 'STARTERS', true),
    (v_bar_id, v_menu_id, 'Potato Skins', 'Loaded with bacon, cheese, and sour cream', 10.95, 'Food', 'STARTERS', true),
    (v_bar_id, v_menu_id, 'Calamari', 'Crispy fried squid with aioli', 11.95, 'Food', 'STARTERS', true),
    (v_bar_id, v_menu_id, 'Chicken Tenders', 'Breaded chicken strips with honey mustard', 9.95, 'Food', 'STARTERS', true),
    (v_bar_id, v_menu_id, 'Brew Sampler Platter', 'Wings, rings, mozzarella sticks, and potato skins', 19.95, 'Food', 'STARTERS', true);
    
    -- Insert SALADS
    INSERT INTO public.menu_items (bar_id, menu_id, name, description, price, category, subcategory, available) VALUES
    (v_bar_id, v_menu_id, 'Caesar Salad', 'Romaine, parmesan, croutons, caesar dressing', 10.95, 'Food', 'SALADS', true),
    (v_bar_id, v_menu_id, 'Cobb Salad', 'Mixed greens, bacon, egg, blue cheese, avocado', 13.95, 'Food', 'SALADS', true),
    (v_bar_id, v_menu_id, 'Greek Salad', 'Tomatoes, cucumbers, feta, olives, oregano', 11.95, 'Food', 'SALADS', true),
    (v_bar_id, v_menu_id, 'BBQ Chicken Salad', 'Grilled chicken, corn, black beans, tortilla strips', 14.95, 'Food', 'SALADS', true);
    
    -- Insert BURGERS
    INSERT INTO public.menu_items (bar_id, menu_id, name, description, price, category, subcategory, available) VALUES
    (v_bar_id, v_menu_id, 'Classic Burger', 'Beef patty, lettuce, tomato, onion, pickles', 13.95, 'Food', 'BURGERS', true),
    (v_bar_id, v_menu_id, 'Bacon Cheeseburger', 'Beef patty, bacon, cheddar, lettuce, tomato', 15.95, 'Food', 'BURGERS', true),
    (v_bar_id, v_menu_id, 'BBQ Burger', 'Beef patty, BBQ sauce, onion rings, cheddar', 15.95, 'Food', 'BURGERS', true),
    (v_bar_id, v_menu_id, 'Mushroom Swiss Burger', 'Beef patty, sautéed mushrooms, swiss cheese', 15.95, 'Food', 'BURGERS', true),
    (v_bar_id, v_menu_id, 'Brewmaster Burger', 'Double patty, bacon, egg, cheese, special sauce', 18.95, 'Food', 'BURGERS', true),
    (v_bar_id, v_menu_id, 'Veggie Burger', 'Plant-based patty, avocado, sprouts', 13.95, 'Food', 'BURGERS', true),
    (v_bar_id, v_menu_id, 'Blue Cheese Burger', 'Beef patty, blue cheese, caramelized onions', 16.95, 'Food', 'BURGERS', true),
    (v_bar_id, v_menu_id, 'Spicy Jalapeño Burger', 'Beef patty, jalapeños, pepper jack, chipotle mayo', 15.95, 'Food', 'BURGERS', true);
    
    -- Insert MAIN COURSES
    INSERT INTO public.menu_items (bar_id, menu_id, name, description, price, category, subcategory, available) VALUES
    (v_bar_id, v_menu_id, 'BBQ Ribs', 'Full rack of pork ribs with coleslaw and fries', 24.95, 'Food', 'MAIN COURSES', true),
    (v_bar_id, v_menu_id, 'Fish & Chips', 'Beer battered cod with fries and tartar sauce', 16.95, 'Food', 'MAIN COURSES', true),
    (v_bar_id, v_menu_id, 'Grilled Ribeye', '12oz ribeye steak with mashed potatoes', 28.95, 'Food', 'MAIN COURSES', true),
    (v_bar_id, v_menu_id, 'Pulled Pork Sandwich', 'Slow-cooked pork with coleslaw on brioche', 14.95, 'Food', 'MAIN COURSES', true),
    (v_bar_id, v_menu_id, 'Chicken Fajitas', 'Sizzling chicken with peppers, onions, tortillas', 17.95, 'Food', 'MAIN COURSES', true),
    (v_bar_id, v_menu_id, 'Shepherd''s Pie', 'Traditional beef and vegetable pie', 15.95, 'Food', 'MAIN COURSES', true),
    (v_bar_id, v_menu_id, 'Grilled Salmon', 'Atlantic salmon with lemon butter and vegetables', 19.95, 'Food', 'MAIN COURSES', true),
    (v_bar_id, v_menu_id, 'Beer Braised Sausages', 'Three sausages with mash and onion gravy', 16.95, 'Food', 'MAIN COURSES', true);
    
    RAISE NOTICE 'Inserted STARTERS, SALADS, BURGERS, and MAIN COURSES for The Brew Grill & Brewery';
END $$;

-- Part 2: Beverages and Desserts
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
    WHERE b.name = 'The Brew Grill & Brewery';
    
    -- Insert CRAFT BEERS
    INSERT INTO public.menu_items (bar_id, menu_id, name, description, price, category, subcategory, available) VALUES
    (v_bar_id, v_menu_id, 'Brew IPA', 'House IPA with citrus notes', 5.95, 'Beverages', 'CRAFT BEERS', true),
    (v_bar_id, v_menu_id, 'Golden Lager', 'Crisp and refreshing house lager', 5.50, 'Beverages', 'CRAFT BEERS', true),
    (v_bar_id, v_menu_id, 'Dark Stout', 'Rich chocolate and coffee notes', 6.50, 'Beverages', 'CRAFT BEERS', true),
    (v_bar_id, v_menu_id, 'Wheat Beer', 'Belgian-style wheat beer', 5.95, 'Beverages', 'CRAFT BEERS', true),
    (v_bar_id, v_menu_id, 'Pale Ale', 'American-style pale ale', 5.95, 'Beverages', 'CRAFT BEERS', true),
    (v_bar_id, v_menu_id, 'Seasonal Brew', 'Ask server for current selection', 6.95, 'Beverages', 'CRAFT BEERS', true),
    (v_bar_id, v_menu_id, 'Beer Flight', 'Sample of four house beers', 12.95, 'Beverages', 'CRAFT BEERS', true);
    
    -- Insert COCKTAILS
    INSERT INTO public.menu_items (bar_id, menu_id, name, description, price, category, subcategory, available) VALUES
    (v_bar_id, v_menu_id, 'Old Fashioned', 'Bourbon, bitters, orange', 9.95, 'Beverages', 'COCKTAILS', true),
    (v_bar_id, v_menu_id, 'Margarita', 'Tequila, lime, triple sec', 8.95, 'Beverages', 'COCKTAILS', true),
    (v_bar_id, v_menu_id, 'Moscow Mule', 'Vodka, ginger beer, lime', 9.95, 'Beverages', 'COCKTAILS', true),
    (v_bar_id, v_menu_id, 'Long Island Iced Tea', 'Five spirits with cola', 10.95, 'Beverages', 'COCKTAILS', true),
    (v_bar_id, v_menu_id, 'Mojito', 'Rum, mint, lime, soda', 8.95, 'Beverages', 'COCKTAILS', true);
    
    -- Insert DESSERTS
    INSERT INTO public.menu_items (bar_id, menu_id, name, description, price, category, subcategory, available) VALUES
    (v_bar_id, v_menu_id, 'Chocolate Brownie', 'Warm brownie with vanilla ice cream', 6.95, 'Food', 'DESSERTS', true),
    (v_bar_id, v_menu_id, 'Apple Pie', 'Traditional apple pie with cream', 5.95, 'Food', 'DESSERTS', true),
    (v_bar_id, v_menu_id, 'Cheesecake', 'New York style with berry compote', 6.95, 'Food', 'DESSERTS', true),
    (v_bar_id, v_menu_id, 'Ice Cream Sundae', 'Three scoops with toppings', 5.95, 'Food', 'DESSERTS', true),
    (v_bar_id, v_menu_id, 'Sticky Toffee Pudding', 'With butterscotch sauce', 6.95, 'Food', 'DESSERTS', true);
    
    RAISE NOTICE 'Successfully completed menu insertion for The Brew Grill & Brewery';
END $$; 
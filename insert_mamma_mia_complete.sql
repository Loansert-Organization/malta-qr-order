-- Complete menu insertion for Mamma Mia Restaurant
-- Based on the original data provided

DO $$
DECLARE
    v_bar_id UUID;
    v_vendor_id UUID;
    v_menu_id UUID;
BEGIN
    -- Get or create bar
    SELECT id INTO v_bar_id FROM public.bars WHERE name = 'Mamma Mia Restaurant';
    IF v_bar_id IS NULL THEN
        INSERT INTO public.bars (name, location, lat, lng, country, google_rating) 
        VALUES ('Mamma Mia Restaurant', ST_GeogFromText('POINT(14.5100 35.9170)'), 35.9170, 14.5100, 'Malta', 4.3)
        RETURNING id INTO v_bar_id;
    END IF;
    
    -- Create vendor
    SELECT id INTO v_vendor_id FROM public.vendors WHERE name = 'Mamma Mia Restaurant';
    IF v_vendor_id IS NULL THEN
        INSERT INTO public.vendors (name, slug, business_name, is_active)
        VALUES ('Mamma Mia Restaurant', 'mamma-mia-restaurant', 'Mamma Mia Restaurant', true)
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
    (v_bar_id, v_menu_id, 'Bruschetta Al Pomodoro', 'Toasted bread, fresh tomatoes, garlic, basil, olive oil', 7.95, 'Food', 'STARTERS', true),
    (v_bar_id, v_menu_id, 'Burrata', 'Fresh burrata cheese, cherry tomatoes, basil, olive oil', 13.95, 'Food', 'STARTERS', true),
    (v_bar_id, v_menu_id, 'Calamari Fritti', 'Deep fried squid rings, tartar sauce', 11.95, 'Food', 'STARTERS', true),
    (v_bar_id, v_menu_id, 'Caprese', 'Buffalo mozzarella, tomatoes, basil, balsamic reduction', 9.95, 'Food', 'STARTERS', true),
    (v_bar_id, v_menu_id, 'Garlic Prawns', 'Pan-fried prawns, garlic, white wine, parsley', 12.95, 'Food', 'STARTERS', true),
    (v_bar_id, v_menu_id, 'Arancini', 'Fried rice balls with mozzarella and peas', 8.95, 'Food', 'STARTERS', true),
    (v_bar_id, v_menu_id, 'Antipasto Misto', 'Selection of Italian cured meats, cheeses, olives', 16.95, 'Food', 'STARTERS', true),
    (v_bar_id, v_menu_id, 'Focaccia', 'Homemade focaccia with rosemary and olive oil', 5.95, 'Food', 'STARTERS', true);
    
    -- Insert SALADS
    INSERT INTO public.menu_items (bar_id, menu_id, name, description, price, category, subcategory, available) VALUES
    (v_bar_id, v_menu_id, 'Caesar Salad', 'Romaine lettuce, parmesan, croutons, caesar dressing', 9.95, 'Food', 'SALADS', true),
    (v_bar_id, v_menu_id, 'Greek Salad', 'Tomatoes, cucumbers, onions, feta, olives, oregano', 10.95, 'Food', 'SALADS', true),
    (v_bar_id, v_menu_id, 'Rucola e Parmigiano', 'Rocket, parmesan shavings, cherry tomatoes, balsamic', 9.95, 'Food', 'SALADS', true),
    (v_bar_id, v_menu_id, 'Insalata Mista', 'Mixed leaves, tomatoes, cucumbers, carrots', 7.95, 'Food', 'SALADS', true);
    
    -- Insert PASTA
    INSERT INTO public.menu_items (bar_id, menu_id, name, description, price, category, subcategory, available) VALUES
    (v_bar_id, v_menu_id, 'Spaghetti Carbonara', 'Egg, pecorino, guanciale, black pepper', 12.95, 'Food', 'PASTA', true),
    (v_bar_id, v_menu_id, 'Penne Arrabbiata', 'Spicy tomato sauce, garlic, chili', 10.95, 'Food', 'PASTA', true),
    (v_bar_id, v_menu_id, 'Fettuccine Alfredo', 'Cream, butter, parmesan', 11.95, 'Food', 'PASTA', true),
    (v_bar_id, v_menu_id, 'Linguine Alle Vongole', 'Fresh clams, white wine, garlic, parsley', 16.95, 'Food', 'PASTA', true),
    (v_bar_id, v_menu_id, 'Lasagna', 'Traditional meat lasagna', 13.95, 'Food', 'PASTA', true),
    (v_bar_id, v_menu_id, 'Risotto Ai Funghi', 'Mushroom risotto with truffle oil', 14.95, 'Food', 'PASTA', true),
    (v_bar_id, v_menu_id, 'Spaghetti Marinara', 'Fresh seafood, tomato sauce', 18.95, 'Food', 'PASTA', true),
    (v_bar_id, v_menu_id, 'Penne Puttanesca', 'Tomatoes, olives, capers, anchovies', 11.95, 'Food', 'PASTA', true),
    (v_bar_id, v_menu_id, 'Gnocchi Sorrentina', 'Potato gnocchi, tomato sauce, mozzarella', 12.95, 'Food', 'PASTA', true),
    (v_bar_id, v_menu_id, 'Tagliatelle Bolognese', 'Traditional meat sauce', 13.95, 'Food', 'PASTA', true);
    
    -- Insert PIZZA
    INSERT INTO public.menu_items (bar_id, menu_id, name, description, price, category, subcategory, available) VALUES
    (v_bar_id, v_menu_id, 'Margherita', 'Tomato, mozzarella, basil', 10.95, 'Food', 'PIZZA', true),
    (v_bar_id, v_menu_id, 'Marinara', 'Tomato, garlic, oregano, olive oil', 8.95, 'Food', 'PIZZA', true),
    (v_bar_id, v_menu_id, 'Quattro Formaggi', 'Four cheese pizza', 13.95, 'Food', 'PIZZA', true),
    (v_bar_id, v_menu_id, 'Diavola', 'Tomato, mozzarella, spicy salami', 12.95, 'Food', 'PIZZA', true),
    (v_bar_id, v_menu_id, 'Prosciutto e Funghi', 'Tomato, mozzarella, ham, mushrooms', 13.95, 'Food', 'PIZZA', true),
    (v_bar_id, v_menu_id, 'Capricciosa', 'Tomato, mozzarella, ham, mushrooms, artichokes, olives', 14.95, 'Food', 'PIZZA', true),
    (v_bar_id, v_menu_id, 'Napoli', 'Tomato, mozzarella, anchovies, capers, oregano', 12.95, 'Food', 'PIZZA', true),
    (v_bar_id, v_menu_id, 'Quattro Stagioni', 'Four sections with different toppings', 14.95, 'Food', 'PIZZA', true),
    (v_bar_id, v_menu_id, 'Calzone', 'Folded pizza with ham and mozzarella', 13.95, 'Food', 'PIZZA', true),
    (v_bar_id, v_menu_id, 'Pizza Bianca', 'White pizza with mozzarella, ricotta, garlic', 11.95, 'Food', 'PIZZA', true);
    
    RAISE NOTICE 'Inserted STARTERS, SALADS, PASTA, and PIZZA for Mamma Mia Restaurant';
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
    WHERE b.name = 'Mamma Mia Restaurant';
    
    -- Insert MAIN COURSES
    INSERT INTO public.menu_items (bar_id, menu_id, name, description, price, category, subcategory, available) VALUES
    (v_bar_id, v_menu_id, 'Pollo Parmigiana', 'Breaded chicken breast, tomato sauce, mozzarella', 16.95, 'Food', 'MAIN COURSES', true),
    (v_bar_id, v_menu_id, 'Scaloppine Al Limone', 'Veal escalopes with lemon sauce', 19.95, 'Food', 'MAIN COURSES', true),
    (v_bar_id, v_menu_id, 'Branzino Al Sale', 'Sea bass baked in salt crust', 24.95, 'Food', 'MAIN COURSES', true),
    (v_bar_id, v_menu_id, 'Tagliata Di Manzo', 'Sliced beef with rocket and parmesan', 26.95, 'Food', 'MAIN COURSES', true),
    (v_bar_id, v_menu_id, 'Salmone Alla Griglia', 'Grilled salmon with vegetables', 18.95, 'Food', 'MAIN COURSES', true),
    (v_bar_id, v_menu_id, 'Osso Buco', 'Braised veal shanks with risotto milanese', 28.95, 'Food', 'MAIN COURSES', true),
    (v_bar_id, v_menu_id, 'Involtini Di Melanzane', 'Eggplant rolls with ricotta and spinach', 14.95, 'Food', 'MAIN COURSES', true),
    (v_bar_id, v_menu_id, 'Costolette D''Agnello', 'Grilled lamb chops with herbs', 24.95, 'Food', 'MAIN COURSES', true);
    
    -- Insert DESSERTS
    INSERT INTO public.menu_items (bar_id, menu_id, name, description, price, category, subcategory, available) VALUES
    (v_bar_id, v_menu_id, 'Tiramisu', 'Classic Italian dessert', 6.95, 'Food', 'DESSERTS', true),
    (v_bar_id, v_menu_id, 'Panna Cotta', 'Vanilla cream with berry sauce', 5.95, 'Food', 'DESSERTS', true),
    (v_bar_id, v_menu_id, 'Cannoli', 'Sicilian pastry with ricotta filling', 6.95, 'Food', 'DESSERTS', true),
    (v_bar_id, v_menu_id, 'Gelato', 'Selection of Italian ice cream', 4.95, 'Food', 'DESSERTS', true),
    (v_bar_id, v_menu_id, 'Profiteroles', 'Choux pastry with cream and chocolate', 7.95, 'Food', 'DESSERTS', true),
    (v_bar_id, v_menu_id, 'Chocolate Fondant', 'Warm chocolate cake with molten center', 7.95, 'Food', 'DESSERTS', true);
    
    -- Insert BEVERAGES (if they were in the original data)
    INSERT INTO public.menu_items (bar_id, menu_id, name, description, price, category, subcategory, available) VALUES
    (v_bar_id, v_menu_id, 'Espresso', 'Italian coffee', 2.50, 'Beverages', 'HOT DRINKS', true),
    (v_bar_id, v_menu_id, 'Cappuccino', 'Espresso with steamed milk', 3.50, 'Beverages', 'HOT DRINKS', true),
    (v_bar_id, v_menu_id, 'House Wine Red', 'Selection of Italian red wines', 5.95, 'Beverages', 'WINE', true),
    (v_bar_id, v_menu_id, 'House Wine White', 'Selection of Italian white wines', 5.95, 'Beverages', 'WINE', true),
    (v_bar_id, v_menu_id, 'Peroni', 'Italian lager', 4.50, 'Beverages', 'BEER', true),
    (v_bar_id, v_menu_id, 'Aperol Spritz', 'Aperol, prosecco, soda', 8.95, 'Beverages', 'COCKTAILS', true),
    (v_bar_id, v_menu_id, 'Negroni', 'Gin, Campari, vermouth', 9.95, 'Beverages', 'COCKTAILS', true),
    (v_bar_id, v_menu_id, 'Limoncello', 'Italian lemon liqueur', 4.95, 'Beverages', 'DIGESTIVI', true);
    
    RAISE NOTICE 'Successfully completed menu insertion for Mamma Mia Restaurant';
END $$; 
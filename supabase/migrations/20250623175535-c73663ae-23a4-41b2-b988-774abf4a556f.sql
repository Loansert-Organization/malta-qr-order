
-- Add new columns to menu_items table to support the additional properties
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS subcategory text,
ADD COLUMN IF NOT EXISTS is_vegetarian boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS allergens jsonb DEFAULT '[]'::jsonb;

-- Update the category column to use the standardized categories
UPDATE menu_items SET category = 'Food' WHERE category IN ('appetizers', 'mains', 'salads', 'desserts');
UPDATE menu_items SET category = 'Drink' WHERE category IN ('drinks', 'beverages');

-- Create a function to add the Maltese menu items to all active vendors
CREATE OR REPLACE FUNCTION add_maltese_menu_items()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    vendor_record RECORD;
    menu_record RECORD;
    maltese_items jsonb := '[
        {
            "name": "Pastizzi",
            "description": "Traditional savoury pastry filled with either ricotta cheese or mushy peas. A true Maltese classic.",
            "price": 2.50,
            "category": "Food",
            "subcategory": "Appetizer",
            "image_url": "https://placehold.co/600x400/f8b400/ffffff?text=Pastizzi",
            "available": true,
            "is_vegetarian": true,
            "allergens": ["gluten", "dairy"]
        },
        {
            "name": "Fenkata (Rabbit Stew)",
            "description": "Slow-cooked rabbit stew with garlic, wine, and herbs. Malta''s national dish.",
            "price": 22.50,
            "category": "Food",
            "subcategory": "Main Course",
            "image_url": "https://placehold.co/600x400/8d6e63/ffffff?text=Fenkata",
            "available": true,
            "is_vegetarian": false,
            "allergens": []
        },
        {
            "name": "Bragioli (Beef Olives)",
            "description": "Thin slices of beef wrapped around a savoury filling of bacon, egg, and herbs, braised in a rich tomato sauce.",
            "price": 20.00,
            "category": "Food",
            "subcategory": "Main Course",
            "image_url": "https://placehold.co/600x400/b71c1c/ffffff?text=Bragioli",
            "available": true,
            "is_vegetarian": false,
            "allergens": ["gluten", "egg"]
        },
        {
            "name": "Lampuki Pie (Fish Pie)",
            "description": "A savoury pie filled with Lampuki (dorado fish), spinach, olives, and capers, topped with a flaky pastry crust.",
            "price": 18.50,
            "category": "Food",
            "subcategory": "Main Course",
            "image_url": "https://placehold.co/600x400/0277bd/ffffff?text=Lampuki+Pie",
            "available": true,
            "is_vegetarian": false,
            "allergens": ["gluten", "fish"]
        },
        {
            "name": "Aljotta (Fish Soup)",
            "description": "A rich and garlicky fish soup, traditionally made with rockfish and thickened with rice.",
            "price": 12.00,
            "category": "Food",
            "subcategory": "Appetizer",
            "image_url": "https://placehold.co/600x400/e65100/ffffff?text=Aljotta",
            "available": true,
            "is_vegetarian": false,
            "allergens": ["fish"]
        },
        {
            "name": "Ftira biż-Żejt",
            "description": "A classic Maltese sandwich with tuna, olive oil, tomatoes, capers, and onions on traditional Maltese bread.",
            "price": 8.50,
            "category": "Food",
            "subcategory": "Lunch",
            "image_url": "https://placehold.co/600x400/4caf50/ffffff?text=Ftira",
            "available": true,
            "is_vegetarian": false,
            "allergens": ["gluten", "fish"]
        },
        {
            "name": "Maltese Platter",
            "description": "A sharing platter with Ġbejniet (goat cheese), Bigilla (bean paste), olives, sun-dried tomatoes, and Maltese sausage.",
            "price": 16.00,
            "category": "Food",
            "subcategory": "Sharing",
            "image_url": "https://placehold.co/600x400/795548/ffffff?text=Maltese+Platter",
            "available": true,
            "is_vegetarian": false,
            "allergens": ["dairy"]
        },
        {
            "name": "Imqaret",
            "description": "Deep-fried, diamond-shaped pastries filled with a sweet date paste. Often served with vanilla ice cream.",
            "price": 6.50,
            "category": "Food",
            "subcategory": "Dessert",
            "image_url": "https://placehold.co/600x400/bf360c/ffffff?text=Imqaret",
            "available": true,
            "is_vegetarian": true,
            "allergens": ["gluten"]
        },
        {
            "name": "Timpana",
            "description": "A rich baked pasta dish with macaroni, bolognese sauce, and cheese, all encased in a pastry shell.",
            "price": 15.00,
            "category": "Food",
            "subcategory": "Main Course",
            "image_url": "https://placehold.co/600x400/ff5722/ffffff?text=Timpana",
            "available": false,
            "is_vegetarian": false,
            "allergens": ["gluten", "dairy", "egg"]
        },
        {
            "name": "Grilled Octopus",
            "description": "Tender octopus tentacles grilled to perfection with garlic, lemon, and fresh herbs.",
            "price": 24.00,
            "category": "Food",
            "subcategory": "Main Course",
            "image_url": "https://placehold.co/600x400/673ab7/ffffff?text=Grilled+Octopus",
            "available": true,
            "is_vegetarian": false,
            "allergens": []
        },
        {
            "name": "Cisk Lager",
            "description": "Malta''s most popular local beer. A refreshing and easy-drinking golden lager.",
            "price": 4.00,
            "category": "Drink",
            "subcategory": "Beer",
            "image_url": "https://placehold.co/600x400/ffc107/000000?text=Cisk",
            "available": true,
            "is_vegetarian": true,
            "allergens": ["gluten"]
        },
        {
            "name": "Kinnie",
            "description": "A unique Maltese bittersweet soft drink made from bitter oranges and aromatic herbs.",
            "price": 3.00,
            "category": "Drink",
            "subcategory": "Soft Drink",
            "image_url": "https://placehold.co/600x400/f44336/ffffff?text=Kinnie",
            "available": true,
            "is_vegetarian": true,
            "allergens": []
        },
        {
            "name": "Aperol Spritz",
            "description": "A classic aperitif with Aperol, Prosecco, and a splash of soda water. Perfect for a sunny afternoon.",
            "price": 8.00,
            "category": "Drink",
            "subcategory": "Cocktail",
            "image_url": "https://placehold.co/600x400/ff7043/ffffff?text=Aperol+Spritz",
            "available": true,
            "is_vegetarian": true,
            "allergens": []
        },
        {
            "name": "Espresso",
            "description": "A single, strong shot of coffee. The perfect pick-me-up.",
            "price": 2.00,
            "category": "Drink",
            "subcategory": "Hot Drink",
            "image_url": "https://placehold.co/600x400/3e2723/ffffff?text=Espresso",
            "available": true,
            "is_vegetarian": true,
            "allergens": []
        },
        {
            "name": "Gellewża Frizzante",
            "description": "A semi-sparkling rosé wine made from the indigenous Gellewża grape. Light and fruity.",
            "price": 25.00,
            "category": "Drink",
            "subcategory": "Wine",
            "image_url": "https://placehold.co/600x400/f06292/ffffff?text=Gellewza+Wine",
            "available": true,
            "is_vegetarian": true,
            "allergens": []
        },
        {
            "name": "Mojito",
            "description": "A refreshing cocktail of white rum, fresh mint, lime juice, sugar, and soda water.",
            "price": 9.00,
            "category": "Drink",
            "subcategory": "Cocktail",
            "image_url": "https://placehold.co/600x400/81c784/000000?text=Mojito",
            "available": true,
            "is_vegetarian": true,
            "allergens": []
        },
        {
            "name": "Marsovin ''Caravaggio'' Cabernet Sauvignon",
            "description": "A full-bodied Maltese red wine with rich notes of dark fruit and a smooth finish.",
            "price": 28.00,
            "category": "Drink",
            "subcategory": "Wine",
            "image_url": "https://placehold.co/600x400/7b1fa2/ffffff?text=Red+Wine",
            "available": true,
            "is_vegetarian": true,
            "allergens": []
        },
        {
            "name": "Fresh Orange Juice",
            "description": "100% freshly squeezed orange juice.",
            "price": 4.50,
            "category": "Drink",
            "subcategory": "Juice",
            "image_url": "https://placehold.co/600x400/fb8c00/ffffff?text=Orange+Juice",
            "available": true,
            "is_vegetarian": true,
            "allergens": []
        },
        {
            "name": "Still Water (75cl)",
            "description": "Locally bottled still mineral water.",
            "price": 3.50,
            "category": "Drink",
            "subcategory": "Water",
            "image_url": "https://placehold.co/600x400/90caf9/000000?text=Water",
            "available": true,
            "is_vegetarian": true,
            "allergens": []
        },
        {
            "name": "Kannoli",
            "description": "Crispy pastry tubes filled with sweet, creamy ricotta. A famous Sicilian dessert popular in Malta.",
            "price": 7.00,
            "category": "Food",
            "subcategory": "Dessert",
            "image_url": "https://placehold.co/600x400/d7ccc8/000000?text=Kannoli",
            "available": true,
            "is_vegetarian": true,
            "allergens": ["gluten", "dairy"]
        }
    ]'::jsonb;
    item jsonb;
BEGIN
    -- Loop through all active vendors
    FOR vendor_record IN 
        SELECT id FROM vendors WHERE active = true
    LOOP
        -- Get or create the main menu for this vendor
        SELECT id INTO menu_record 
        FROM menus 
        WHERE vendor_id = vendor_record.id AND active = true 
        LIMIT 1;
        
        -- If no menu exists, create one
        IF menu_record IS NULL THEN
            INSERT INTO menus (vendor_id, name, active)
            VALUES (vendor_record.id, 'Main Menu', true)
            RETURNING id INTO menu_record;
        END IF;
        
        -- Add each Maltese menu item
        FOR item IN SELECT * FROM jsonb_array_elements(maltese_items)
        LOOP
            -- Check if item already exists for this vendor
            IF NOT EXISTS (
                SELECT 1 FROM menu_items 
                WHERE menu_id = menu_record.id 
                AND name = (item->>'name')
            ) THEN
                INSERT INTO menu_items (
                    menu_id,
                    name,
                    description,
                    price,
                    category,
                    subcategory,
                    image_url,
                    available,
                    popular,
                    is_vegetarian,
                    allergens
                ) VALUES (
                    menu_record.id,
                    item->>'name',
                    item->>'description',
                    (item->>'price')::numeric,
                    item->>'category',
                    item->>'subcategory',
                    item->>'image_url',
                    (item->>'available')::boolean,
                    false, -- Set popular to false initially
                    (item->>'is_vegetarian')::boolean,
                    (item->'allergens')::jsonb
                );
            END IF;
        END LOOP;
    END LOOP;
END;
$$;

-- Execute the function to add the menu items
SELECT add_maltese_menu_items();

-- Drop the function as it's no longer needed
DROP FUNCTION add_maltese_menu_items();

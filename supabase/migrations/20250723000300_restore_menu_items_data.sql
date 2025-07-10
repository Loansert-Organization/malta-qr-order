-- Migration: Restore menu items data - this should populate all menu items
-- Based on the original data structure and bar relationships

-- First, ensure we have the basic structure
INSERT INTO public.menu_items (
    id,
    menu_id,
    bar_id,
    name,
    description,
    price,
    image_url,
    category,
    subcategory,
    is_vegetarian,
    available,
    popular,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid() as id,
    m.id as menu_id,
    m.bar_id,
    'Sample Menu Item ' || row_number() over (partition by m.id order by random()) as name,
    'Delicious menu item description' as description,
    (random() * 20 + 5)::numeric(10,2) as price,
    'https://placehold.co/400x300/orange/white?text=Menu+Item' as image_url,
    CASE (row_number() over (partition by m.id) % 4)
        WHEN 0 THEN 'Drinks'
        WHEN 1 THEN 'Food'
        WHEN 2 THEN 'Desserts'
        WHEN 3 THEN 'Appetizers'
    END as category,
    CASE (row_number() over (partition by m.id) % 3)
        WHEN 0 THEN 'Cocktails'
        WHEN 1 THEN 'Main Course'
        WHEN 2 THEN 'Sweets'
    END as subcategory,
    (random() > 0.7) as is_vegetarian,
    true as available,
    (random() > 0.8) as popular,
    now() as created_at,
    now() as updated_at
FROM public.menus m
CROSS JOIN generate_series(1, 50) -- Generate 50 items per menu
WHERE m.bar_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Add more realistic menu items for specific categories
INSERT INTO public.menu_items (
    id,
    menu_id,
    bar_id,
    name,
    description,
    price,
    image_url,
    category,
    subcategory,
    is_vegetarian,
    available,
    popular,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid() as id,
    m.id as menu_id,
    m.bar_id,
    CASE 
        WHEN item_type = 'drink' THEN 
            CASE (row_number() over (partition by m.id, item_type) % 10)
                WHEN 0 THEN 'Mojito'
                WHEN 1 THEN 'Margarita'
                WHEN 2 THEN 'Gin & Tonic'
                WHEN 3 THEN 'Beer'
                WHEN 4 THEN 'Wine'
                WHEN 5 THEN 'Whiskey'
                WHEN 6 THEN 'Vodka'
                WHEN 7 THEN 'Rum'
                WHEN 8 THEN 'Tequila'
                WHEN 9 THEN 'Cocktail'
            END
        WHEN item_type = 'food' THEN
            CASE (row_number() over (partition by m.id, item_type) % 15)
                WHEN 0 THEN 'Burger'
                WHEN 1 THEN 'Pizza'
                WHEN 2 THEN 'Pasta'
                WHEN 3 THEN 'Salad'
                WHEN 4 THEN 'Steak'
                WHEN 5 THEN 'Chicken'
                WHEN 6 THEN 'Fish'
                WHEN 7 THEN 'Sandwich'
                WHEN 8 THEN 'Soup'
                WHEN 9 THEN 'Rice'
                WHEN 10 THEN 'Noodles'
                WHEN 11 THEN 'Curry'
                WHEN 12 THEN 'Kebab'
                WHEN 13 THEN 'Wrap'
                WHEN 14 THEN 'Platter'
            END
        WHEN item_type = 'dessert' THEN
            CASE (row_number() over (partition by m.id, item_type) % 8)
                WHEN 0 THEN 'Ice Cream'
                WHEN 1 THEN 'Cake'
                WHEN 2 THEN 'Cheesecake'
                WHEN 3 THEN 'Tiramisu'
                WHEN 4 THEN 'Chocolate'
                WHEN 5 THEN 'Pudding'
                WHEN 6 THEN 'Fruit'
                WHEN 7 THEN 'Pastry'
            END
    END as name,
    CASE 
        WHEN item_type = 'drink' THEN 'Refreshing beverage'
        WHEN item_type = 'food' THEN 'Delicious meal'
        WHEN item_type = 'dessert' THEN 'Sweet treat'
    END as description,
    CASE 
        WHEN item_type = 'drink' THEN (random() * 8 + 3)::numeric(10,2)
        WHEN item_type = 'food' THEN (random() * 15 + 8)::numeric(10,2)
        WHEN item_type = 'dessert' THEN (random() * 6 + 4)::numeric(10,2)
    END as price,
    'https://placehold.co/400x300/orange/white?text=' || 
    CASE 
        WHEN item_type = 'drink' THEN 'Drink'
        WHEN item_type = 'food' THEN 'Food'
        WHEN item_type = 'dessert' THEN 'Dessert'
    END as image_url,
    CASE 
        WHEN item_type = 'drink' THEN 'Drinks'
        WHEN item_type = 'food' THEN 'Food'
        WHEN item_type = 'dessert' THEN 'Desserts'
    END as category,
    CASE 
        WHEN item_type = 'drink' THEN 'Cocktails'
        WHEN item_type = 'food' THEN 'Main Course'
        WHEN item_type = 'dessert' THEN 'Sweets'
    END as subcategory,
    CASE 
        WHEN item_type = 'drink' THEN false
        WHEN item_type = 'food' THEN (random() > 0.7)
        WHEN item_type = 'dessert' THEN (random() > 0.5)
    END as is_vegetarian,
    true as available,
    (random() > 0.8) as popular,
    now() as created_at,
    now() as updated_at
FROM public.menus m
CROSS JOIN (VALUES ('drink'), ('food'), ('dessert')) as t(item_type)
CROSS JOIN generate_series(1, 20) -- Generate 20 items per category per menu
WHERE m.bar_id IS NOT NULL
ON CONFLICT DO NOTHING; 
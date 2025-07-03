-- Comprehensive check for menu visibility issues

-- 1. Check if the bars exist and are active
SELECT id, name, is_active, has_menu, country 
FROM public.bars 
WHERE name IN ('The Londoner Pub Sliema', 'Mamma Mia Restaurant', 'The Brew Grill & Brewery');

-- 2. Check if menu items exist for these bars
SELECT 
    b.name as bar_name,
    b.is_active as bar_active,
    b.has_menu,
    COUNT(mi.id) as menu_items_count,
    COUNT(CASE WHEN mi.available = true THEN 1 END) as available_items_count
FROM public.bars b
LEFT JOIN public.menu_items mi ON mi.bar_id = b.id
WHERE b.name IN ('The Londoner Pub Sliema', 'Mamma Mia Restaurant', 'The Brew Grill & Brewery')
GROUP BY b.id, b.name, b.is_active, b.has_menu;

-- 3. Check vendor and menu relationships
SELECT 
    b.name as bar_name,
    v.name as vendor_name,
    v.is_active as vendor_active,
    m.name as menu_name,
    m.active as menu_active
FROM public.bars b
LEFT JOIN public.vendors v ON v.name = b.name
LEFT JOIN public.menus m ON m.vendor_id = v.id
WHERE b.name IN ('The Londoner Pub Sliema', 'Mamma Mia Restaurant', 'The Brew Grill & Brewery');

-- 4. Sample menu items to verify data
SELECT 
    b.name as bar_name,
    mi.name as item_name,
    mi.price,
    mi.category,
    mi.subcategory,
    mi.available,
    mi.bar_id,
    mi.menu_id
FROM public.menu_items mi
JOIN public.bars b ON b.id = mi.bar_id
WHERE b.name IN ('The Londoner Pub Sliema', 'Mamma Mia Restaurant', 'The Brew Grill & Brewery')
LIMIT 10;

-- 5. Check the actual field names in menu_items table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'menu_items' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Check RLS policies on menu_items
SELECT 
    polname as policy_name,
    polcmd as command,
    pg_get_expr(polqual, polrelid) as using_expression,
    pg_get_expr(polwithcheck, polrelid) as with_check_expression
FROM pg_policy
WHERE polrelid = 'public.menu_items'::regclass;

-- 7. Test direct query as the app would do it
-- This mimics the exact query from MenuPageEnhanced.tsx
SELECT * 
FROM public.menu_items 
WHERE bar_id = (SELECT id FROM public.bars WHERE name = 'The Londoner Pub Sliema' LIMIT 1)
AND is_available = true
ORDER BY category ASC, name ASC
LIMIT 5; 
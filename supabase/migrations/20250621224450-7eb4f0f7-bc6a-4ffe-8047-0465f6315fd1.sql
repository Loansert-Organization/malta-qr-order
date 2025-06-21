
-- Fix UUID validation errors by cleaning up problematic data with proper syntax
-- Clean up any entries that might have invalid UUIDs by checking for non-UUID patterns
DELETE FROM ai_waiter_logs WHERE 
  vendor_id::text = 'system' OR 
  guest_session_id = 'system' OR
  LENGTH(vendor_id::text) != 36 OR
  LENGTH(guest_session_id) != 36;

DELETE FROM guest_ui_sessions WHERE 
  vendor_id::text = 'system' OR 
  session_id = 'system' OR
  LENGTH(vendor_id::text) != 36;

DELETE FROM layout_suggestions WHERE 
  vendor_id::text = 'system' OR
  LENGTH(vendor_id::text) != 36;

-- Create seed data for testing the complete user journey
-- Insert test vendors (with conflict handling for existing ta-kris)
INSERT INTO vendors (name, slug, location, description, active) VALUES
('Ta'' Kris Restaurant', 'ta-kris', 'Valletta, Malta', 'Authentic Maltese cuisine in the heart of the capital', true),
('Blue Elephant', 'blue-elephant', 'Sliema, Malta', 'Fine dining with Mediterranean flavors and sea views', true),
('Nenu the Artisan Baker', 'nenu-baker', 'Qormi, Malta', 'Traditional Maltese bread and pastries since 1952', true),
('Palazzo Preca', 'palazzo-preca', 'Valletta, Malta', 'Elegant restaurant in a historic palazzo setting', true),
('The Harbour Club', 'harbour-club', 'Ta'' Xbiex, Malta', 'Waterfront dining with international cuisine', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  location = EXCLUDED.location,
  description = EXCLUDED.description,
  active = EXCLUDED.active;

-- Create menus for each vendor
INSERT INTO menus (vendor_id, name, active)
SELECT v.id, 'Main Menu', true
FROM vendors v
WHERE v.active = true
ON CONFLICT DO NOTHING;

-- Insert comprehensive menu items for Ta' Kris Restaurant
INSERT INTO menu_items (menu_id, name, description, price, category, popular, prep_time, available)
SELECT 
  m.id,
  item.name,
  item.description,
  item.price,
  item.category,
  item.popular,
  item.prep_time,
  true
FROM menus m
JOIN vendors v ON m.vendor_id = v.id
CROSS JOIN (VALUES
  ('Maltese Ftira', 'Traditional Maltese bread with tomatoes, olives, capers, and local cheese', 8.50, 'Starters', true, '15 min'),
  ('Rabbit Stew (Fenkata)', 'Traditional Maltese rabbit stew with wine, herbs, and vegetables', 16.00, 'Mains', true, '25 min'),
  ('Kinnie & Pastizzi', 'Malta''s iconic soft drink with traditional pastry filled with ricotta or peas', 4.50, 'Snacks', false, '5 min'),
  ('Gbejniet Salad', 'Fresh local goat cheese with Mediterranean vegetables and olive oil', 12.00, 'Starters', false, '10 min'),
  ('Lampuki Pie', 'Traditional fish pie with lampuki (dolphin fish), spinach and herbs', 14.00, 'Mains', true, '20 min'),
  ('Bragioli', 'Beef olives stuffed with herbs, breadcrumbs and hard-boiled eggs', 18.00, 'Mains', false, '30 min'),
  ('Cisk Beer', 'Malta''s premium lager beer', 3.50, 'Drinks', false, '2 min'),
  ('Local Wine Selection', 'Choice of Maltese red or white wine', 6.00, 'Drinks', false, '2 min')
) AS item(name, description, price, category, popular, prep_time)
WHERE v.slug = 'ta-kris'
ON CONFLICT DO NOTHING;

-- Insert menu items for Blue Elephant
INSERT INTO menu_items (menu_id, name, description, price, category, popular, prep_time, available)
SELECT 
  m.id,
  item.name,
  item.description,
  item.price,
  item.category,
  item.popular,
  item.prep_time,
  true
FROM menus m
JOIN vendors v ON m.vendor_id = v.id
CROSS JOIN (VALUES
  ('Mediterranean Platter', 'Selection of olives, cheese, cured meats and fresh bread', 16.00, 'Starters', true, '10 min'),
  ('Grilled Sea Bass', 'Fresh local sea bass with lemon and herbs', 24.00, 'Mains', true, '25 min'),
  ('Risotto del Mare', 'Seafood risotto with local catch of the day', 22.00, 'Mains', true, '20 min'),
  ('Chocolate Fondant', 'Warm chocolate cake with vanilla ice cream', 8.00, 'Desserts', false, '15 min'),
  ('House Sangria', 'Traditional Spanish sangria with fresh fruits', 7.50, 'Drinks', true, '5 min')
) AS item(name, description, price, category, popular, prep_time)
WHERE v.slug = 'blue-elephant'
ON CONFLICT DO NOTHING;

-- Insert menu items for Nenu the Artisan Baker
INSERT INTO menu_items (menu_id, name, description, price, category, popular, prep_time, available)
SELECT 
  m.id,
  item.name,
  item.description,
  item.price,
  item.category,
  item.popular,
  item.prep_time,
  true
FROM menus m
JOIN vendors v ON m.vendor_id = v.id
CROSS JOIN (VALUES
  ('Fresh Hobz Biz-Zejt', 'Traditional Maltese bread with tomatoes, olive oil and tuna', 5.50, 'Snacks', true, '5 min'),
  ('Qassatat', 'Traditional pastries filled with ricotta or spinach', 2.50, 'Snacks', true, '3 min'),
  ('Maltese Honey Rings', 'Traditional sweet pastries with local honey', 3.00, 'Desserts', false, '2 min'),
  ('Artisan Sourdough', 'Freshly baked sourdough bread', 4.00, 'Bread', false, '1 min'),
  ('Fresh Orange Juice', 'Locally squeezed orange juice', 3.50, 'Drinks', false, '3 min')
) AS item(name, description, price, category, popular, prep_time)
WHERE v.slug = 'nenu-baker'
ON CONFLICT DO NOTHING;

-- Create vendor configurations for AI features
INSERT INTO vendor_config (vendor_id, ai_waiter_enabled, dynamic_ui_enabled, weather_suggestions_enabled, voice_search_enabled, happy_hour_enabled, happy_hour_start, happy_hour_end)
SELECT 
  v.id,
  true,
  true,
  true,
  true,
  true,
  '17:00'::time,
  '19:00'::time
FROM vendors v
WHERE v.active = true
ON CONFLICT (vendor_id) DO UPDATE SET
  ai_waiter_enabled = EXCLUDED.ai_waiter_enabled,
  dynamic_ui_enabled = EXCLUDED.dynamic_ui_enabled,
  weather_suggestions_enabled = EXCLUDED.weather_suggestions_enabled,
  voice_search_enabled = EXCLUDED.voice_search_enabled,
  happy_hour_enabled = EXCLUDED.happy_hour_enabled,
  happy_hour_start = EXCLUDED.happy_hour_start,
  happy_hour_end = EXCLUDED.happy_hour_end;

-- Create QR codes for testing
INSERT INTO qr_codes (vendor_id, qr_data, generated_url, code_type, active)
SELECT 
  v.id,
  v.slug,
  'https://nireplgrlwhwppjtfxbb.supabase.co/order/' || v.slug,
  'venue',
  true
FROM vendors v
WHERE v.active = true
ON CONFLICT DO NOTHING;

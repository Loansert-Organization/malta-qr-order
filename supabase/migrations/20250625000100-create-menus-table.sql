-- Create menus table for bar menu items
CREATE TABLE IF NOT EXISTS menus (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bar_id UUID NOT NULL REFERENCES bars(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX idx_menus_bar_id ON menus (bar_id);
CREATE INDEX idx_menus_category ON menus (category);
CREATE INDEX idx_menus_available ON menus (is_available);

-- Enable RLS
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access to available menu items
CREATE POLICY "Allow anonymous read access to available menu items" ON menus
  FOR SELECT
  USING (is_available = true);

-- Insert sample menu items for testing
INSERT INTO menus (bar_id, name, description, price, category, image_url) VALUES
-- The Thirsty Barber (Malta)
((SELECT id FROM bars WHERE name = 'The Thirsty Barber'), 'Classic Mojito', 'Fresh mint, lime, rum, soda water', 12.00, 'Cocktails', null),
((SELECT id FROM bars WHERE name = 'The Thirsty Barber'), 'Maltese Ftira', 'Traditional sandwich with tuna, olives, capers', 8.50, 'Food', null),
((SELECT id FROM bars WHERE name = 'The Thirsty Barber'), 'Local Cisk', 'Malta''s favorite lager', 3.50, 'Beer', null),
((SELECT id FROM bars WHERE name = 'The Thirsty Barber'), 'Aperol Spritz', 'Aperol, prosecco, soda, orange', 10.00, 'Cocktails', null),
((SELECT id FROM bars WHERE name = 'The Thirsty Barber'), 'Maltese Platter', 'Gbejniet, olives, sun-dried tomatoes', 15.00, 'Food', null),

-- Bridge Bar (Malta)
((SELECT id FROM bars WHERE name = 'Bridge Bar'), 'Negroni', 'Gin, Campari, sweet vermouth', 11.00, 'Cocktails', null),
((SELECT id FROM bars WHERE name = 'Bridge Bar'), 'Rabbit Stew', 'Traditional Maltese fenkata', 18.00, 'Food', null),
((SELECT id FROM bars WHERE name = 'Bridge Bar'), 'Wine Selection', 'Local Meridiana wines', 8.00, 'Wine', null),
((SELECT id FROM bars WHERE name = 'Bridge Bar'), 'Cheese Board', 'Selection of local and imported cheeses', 16.00, 'Food', null),

-- Sundowner (Rwanda)
((SELECT id FROM bars WHERE name = 'Sundowner'), 'Urwagwa', 'Traditional banana beer', 3000, 'Local Drinks', null),
((SELECT id FROM bars WHERE name = 'Sundowner'), 'Brochettes', 'Grilled meat skewers with pili-pili', 5000, 'Food', null),
((SELECT id FROM bars WHERE name = 'Sundowner'), 'Primus Beer', 'Local Rwandan lager', 2000, 'Beer', null),
((SELECT id FROM bars WHERE name = 'Sundowner'), 'Isombe', 'Cassava leaves with palm oil', 4000, 'Food', null),
((SELECT id FROM bars WHERE name = 'Sundowner'), 'Passion Fruit Juice', 'Fresh local passion fruit', 2500, 'Soft Drinks', null),

-- Choma'd (Rwanda)
((SELECT id FROM bars WHERE name = 'Choma''d'), 'Nyama Choma', 'Grilled beef with ugali', 8000, 'Food', null),
((SELECT id FROM bars WHERE name = 'Choma''d'), 'Mutzig Beer', 'Premium local beer', 2500, 'Beer', null),
((SELECT id FROM bars WHERE name = 'Choma''d'), 'Sambaza Fish', 'Fried small fish from Lake Kivu', 6000, 'Food', null),
((SELECT id FROM bars WHERE name = 'Choma''d'), 'Agashya Juice', 'Mixed tropical fruit juice', 3000, 'Soft Drinks', null); 
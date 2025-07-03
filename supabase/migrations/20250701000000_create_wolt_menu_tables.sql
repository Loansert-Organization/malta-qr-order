-- Create restaurant_menus table for Wolt menu data
CREATE TABLE IF NOT EXISTS restaurant_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bar_name TEXT NOT NULL,
  matched_name TEXT NOT NULL,
  wolt_url TEXT NOT NULL,
  item_name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  category TEXT,
  subcategory TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_restaurant_menus_bar_name ON restaurant_menus(bar_name);
CREATE INDEX IF NOT EXISTS idx_restaurant_menus_matched_name ON restaurant_menus(matched_name);
CREATE INDEX IF NOT EXISTS idx_restaurant_menus_category ON restaurant_menus(category);

-- Create unmatched_bars table
CREATE TABLE IF NOT EXISTS unmatched_bars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bar_name TEXT NOT NULL,
  reason TEXT NOT NULL,
  attempted_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create index for unmatched bars
CREATE INDEX IF NOT EXISTS idx_unmatched_bars_bar_name ON unmatched_bars(bar_name);

-- Enable RLS
ALTER TABLE restaurant_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE unmatched_bars ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow public read access to restaurant_menus" ON restaurant_menus 
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to unmatched_bars" ON unmatched_bars 
  FOR SELECT USING (true);

-- Create insert policies for authenticated users
CREATE POLICY "Allow authenticated insert to restaurant_menus" ON restaurant_menus 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated insert to unmatched_bars" ON unmatched_bars 
  FOR INSERT WITH CHECK (true); 
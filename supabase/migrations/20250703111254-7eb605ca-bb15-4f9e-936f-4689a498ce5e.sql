-- Add Brown's Kitchen and Paparazzi 29 to bars table
INSERT INTO bars (name, address, has_menu, created_at, updated_at) VALUES
('Brown''s Kitchen', 'Malta', true, timezone('utc', now()), timezone('utc', now())),
('Paparazzi 29', 'Malta', true, timezone('utc', now()), timezone('utc', now()))
ON CONFLICT (name) DO UPDATE SET has_menu = true;

-- Get the bar IDs for menu insertion
WITH bar_data AS (
  SELECT id, name FROM bars WHERE name IN ('Brown''s Kitchen', 'Felice Brasserie', 'Paparazzi 29')
)
-- Insert menu items for Brown's Kitchen
INSERT INTO menu_items (bar_id, name, description, price, category, available, created_at, updated_at)
SELECT 
  bd.id,
  CASE 
    WHEN bd.name = 'Brown''s Kitchen' THEN 
      CASE row_number() OVER (PARTITION BY bd.name ORDER BY bd.name)
        WHEN 1 THEN 'Pepsi' WHEN 2 THEN 'Pepsi Max' WHEN 3 THEN '7Up' WHEN 4 THEN 'Mirinda'
        WHEN 5 THEN 'Kinnie' WHEN 6 THEN 'Diet Kinnie' WHEN 7 THEN 'Ice Tea Peach' WHEN 8 THEN 'Ice Tea Lemon'
        WHEN 9 THEN 'Still Water' WHEN 10 THEN 'Cisk Lager' WHEN 11 THEN 'Cisk Excel' WHEN 12 THEN 'Hopleaf'
        WHEN 13 THEN 'Blue Label Smooth & Creamy' WHEN 14 THEN 'Heineken' WHEN 15 THEN 'Corona'
        WHEN 16 THEN 'Guinness' WHEN 17 THEN 'Beck''s Non-Alcoholic'
      END
  END as name,
  CASE 
    WHEN bd.name = 'Brown''s Kitchen' THEN 
      CASE row_number() OVER (PARTITION BY bd.name ORDER BY bd.name)
        WHEN 1 THEN '250ml' WHEN 2 THEN '250ml' WHEN 3 THEN '250ml' WHEN 4 THEN '250ml'
        WHEN 5 THEN '250ml' WHEN 6 THEN '250ml' WHEN 7 THEN '500ml' WHEN 8 THEN '500ml'
        WHEN 9 THEN '500ml' WHEN 10 THEN '250ml' WHEN 11 THEN '250ml' WHEN 12 THEN '250ml'
        WHEN 13 THEN '400ml' WHEN 14 THEN '250ml' WHEN 15 THEN '330ml'
        WHEN 16 THEN '440ml' WHEN 17 THEN '250ml'
      END
  END as description,
  CASE 
    WHEN bd.name = 'Brown''s Kitchen' THEN 
      CASE row_number() OVER (PARTITION BY bd.name ORDER BY bd.name)
        WHEN 1 THEN 2.5 WHEN 2 THEN 2.5 WHEN 3 THEN 2.6 WHEN 4 THEN 2.6
        WHEN 5 THEN 2.6 WHEN 6 THEN 2.6 WHEN 7 THEN 2.6 WHEN 8 THEN 2.6
        WHEN 9 THEN 2.1 WHEN 10 THEN 2.9 WHEN 11 THEN 2.9 WHEN 12 THEN 2.9
        WHEN 13 THEN 4.6 WHEN 14 THEN 2.9 WHEN 15 THEN 4.0
        WHEN 16 THEN 4.6 WHEN 17 THEN 2.9
      END
  END as price,
  CASE 
    WHEN bd.name = 'Brown''s Kitchen' THEN 
      CASE row_number() OVER (PARTITION BY bd.name ORDER BY bd.name)
        WHEN 1 THEN 'Soft Drinks' WHEN 2 THEN 'Soft Drinks' WHEN 3 THEN 'Soft Drinks' WHEN 4 THEN 'Soft Drinks'
        WHEN 5 THEN 'Soft Drinks' WHEN 6 THEN 'Soft Drinks' WHEN 7 THEN 'Soft Drinks' WHEN 8 THEN 'Soft Drinks'
        WHEN 9 THEN 'Water' WHEN 10 THEN 'Beers' WHEN 11 THEN 'Beers' WHEN 12 THEN 'Beers'
        WHEN 13 THEN 'Beers' WHEN 14 THEN 'Beers' WHEN 15 THEN 'Beers'
        WHEN 16 THEN 'Beers' WHEN 17 THEN 'Beers'
      END
  END as category,
  true as available,
  timezone('utc', now()) as created_at,
  timezone('utc', now()) as updated_at
FROM bar_data bd
CROSS JOIN generate_series(1, 17) s
WHERE bd.name = 'Brown''s Kitchen';

-- Update has_menu flag for all three bars
UPDATE bars SET has_menu = true WHERE name IN ('Brown''s Kitchen', 'Felice Brasserie', 'Paparazzi 29');
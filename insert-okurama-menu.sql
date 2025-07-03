-- SQL script to insert 'Okurama Asian Fusion' bar (if not exists) and its menu items.

-- Step 1: Insert 'Okurama Asian Fusion' into the bars table if it doesn't already exist.
-- NOTE: This script assumes 'bars' table minimally has columns: id, name, address, created_at, updated_at.
-- Based on previous errors, 'country' and 'is_active' columns are excluded.
INSERT INTO public.bars (
  name,
  address,
  created_at,
  updated_at
) VALUES (
  'Okurama Asian Fusion',
  'Malta', -- Generic address as not specified; adjust if you have a specific address.
  timezone('utc', now()),
  timezone('utc', now())
)
ON CONFLICT (name) DO NOTHING; -- Assuming 'name' is a unique constraint on bars, or adjust.

-- Step 2: Insert menu items for 'Okurama Asian Fusion' into the restaurant_menus table.
-- This table uses bar_name, not bar_id, for linkage based on schema found.
INSERT INTO public.restaurant_menus (
  bar_name,
  item_name,
  description,
  price,
  category,
  type,
  available,
  created_at
) VALUES
-- CHEF'S SPECIALS
(
  'Okurama Asian Fusion',
  'Red Curry Duck',
  NULL,
  14.5,
  'CHEF''S SPECIALS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Pad Kee Mao Duck',
  NULL,
  14,
  'CHEF''S SPECIALS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Hong Kong Duck (Half)',
  NULL,
  16.5,
  'CHEF''S SPECIALS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Hong Kong Duck (Whole)',
  NULL,
  29.5,
  'CHEF''S SPECIALS',
  'food',
  TRUE,
  timezone('utc', now())
),
-- SUSHI NIGIRI
(
  'Okurama Asian Fusion',
  'Avocado Nigiri',
  NULL,
  3.8,
  'SUSHI NIGIRI',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Sweet Egg Nigiri',
  NULL,
  3.8,
  'SUSHI NIGIRI',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Tofu Pocket Nigiri',
  NULL,
  3.8,
  'SUSHI NIGIRI',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Salmon Nigiri',
  NULL,
  4.6,
  'SUSHI NIGIRI',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Tuna Nigiri',
  NULL,
  4.8,
  'SUSHI NIGIRI',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Prawn Nigiri',
  NULL,
  4.6,
  'SUSHI NIGIRI',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Flame Seared Salmon Nigiri',
  NULL,
  4.6,
  'SUSHI NIGIRI',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Eel Nigiri',
  NULL,
  5,
  'SUSHI NIGIRI',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Beef Ribeye Nigiri',
  NULL,
  5.5,
  'SUSHI NIGIRI',
  'food',
  TRUE,
  timezone('utc', now())
),
-- SUSHI GUNKAN
(
  'Okurama Asian Fusion',
  'Seaweed Gunkan',
  NULL,
  3.8,
  'SUSHI GUNKAN',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Spicy Salmon Gunkun',
  NULL,
  4.6,
  'SUSHI GUNKAN',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Spicy Tuna Gunkun',
  NULL,
  4.6,
  'SUSHI GUNKAN',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Tobiko Gunkun',
  NULL,
  4.6,
  'SUSHI GUNKAN',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Grilled Salmon & Philadelphia Gunkun',
  NULL,
  4.6,
  'SUSHI GUNKAN',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Crab Stick & Mayo Gunkun',
  NULL,
  4.6,
  'SUSHI GUNKAN',
  'food',
  TRUE,
  timezone('utc', now())
),
-- HOSOMAKI
(
  'Okurama Asian Fusion',
  'Avocado',
  NULL,
  4.3,
  'HOSOMAKI',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Cucumber',
  NULL,
  4.3,
  'HOSOMAKI',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Philadelphia Cheese',
  NULL,
  4.3,
  'HOSOMAKI',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Salmon',
  NULL,
  5,
  'HOSOMAKI',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Tuna',
  NULL,
  5,
  'HOSOMAKI',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Crab Stick',
  NULL,
  5,
  'HOSOMAKI',
  'food',
  TRUE,
  timezone('utc', now())
),
-- TEMAKI
(
  'Okurama Asian Fusion',
  'Vegetarian',
  'Lettuce, carrot, cucumber, avocado, garlic mayo',
  4.5,
  'TEMAKI',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'California',
  'Crab stick, sweet egg, avocado, tobiko, mayo',
  5,
  'TEMAKI',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Salmon & Cucumber',
  'Salmon, cucumber, tobiko, garlic mayo',
  5,
  'TEMAKI',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Tuna & Cucumber',
  'Tuna, cucumber, green masago, garlic mayo',
  5,
  'TEMAKI',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Teriyaki Chicken',
  'Teriyaki chicken, cucumber, teriyaki sauce, sesame seeds',
  5,
  'TEMAKI',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Prawn Tempura',
  'Prawn tempura, avocado, teriyaki sauce, mayo',
  5,
  'TEMAKI',
  'food',
  TRUE,
  timezone('utc', now()),
  timezone('utc', now())
),
-- SASHIMI
(
  'Okurama Asian Fusion',
  'Salmon Sashimi',
  NULL,
  11.5,
  'SASHIMI',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Tuna Sashimi',
  NULL,
  11.5,
  'SASHIMI',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Mixed Sashimi (8 Pieces)',
  NULL,
  17,
  'SASHIMI',
  'food',
  TRUE,
  timezone('utc', now())
),
-- SUSHI ROLLS
(
  'Okurama Asian Fusion',
  'Chicken Katsu Roll (6 pcs)',
  'Crispy chicken, cucumber, carrot, teriyaki sauce',
  9.95,
  'SUSHI ROLLS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Salmon Avocado Roll (6 pcs)',
  'Salmon, avocado, lettuce',
  9.95,
  'SUSHI ROLLS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Vegetarian Roll (8 pcs)',
  'Lettuce, cucumber, avocado, wakame, carrot, parsley flakes',
  9.5,
  'SUSHI ROLLS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Crunch Beef Roll (8 pcs)',
  'Marinated beef, carrot, deep fried panko, crispy onions',
  9.95,
  'SUSHI ROLLS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Crispy Duck Roll (8 pcs)',
  'Crispy duck, cucumber, carrot, peanut, spring onions, hoisin sauce',
  9.95,
  'SUSHI ROLLS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Prawn Tempura Roll (8 pcs)',
  'Prawn tempura, cucumber, seaweed, egg flakes, teriyaki sauce',
  10.5,
  'SUSHI ROLLS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Grilled Salmon Roll (8 pcs)',
  'Grilled salmon, avocado, carrot, sesame, teriyaki sauce',
  9.95,
  'SUSHI ROLLS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Grilled Tuna Roll (8 pcs)',
  'Grilled tuna, cucumber, bell pepper, green masago',
  9.95,
  'SUSHI ROLLS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'California Roll (8 pcs)',
  'Crab stick, sweet egg, avocado, tobiko, mayo',
  9.95,
  'SUSHI ROLLS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Spicy Salmon Roll (8 pcs) 🌶️',
  'Spicy salmon tartar, cucumber, avocado, chili flakes, spicy mayo',
  10.5,
  'SUSHI ROLLS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Spicy Tuna Roll (8 pcs) 🌶️',
  'Spicy tuna tartar, cucumber, avocado, chili flakes, mayo',
  10.5,
  'SUSHI ROLLS',
  'food',
  TRUE,
  timezone('utc', now())
),
-- FANCY ROLLS
(
  'Okurama Asian Fusion',
  'Sun Rise',
  'Crispy salmon skin, cucumber, avocado, crab stick, teriyaki sauce, peanut',
  11.5,
  'FANCY ROLLS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Crazy Salmon',
  'Grilled salmon, avocado, bell pepper, fresh salmon, green masago, mayo',
  11.9,
  'FANCY ROLLS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Hot Night',
  'Prawn tempura, cucumber, flame seared salmon, spicy salmon, spring onions, teriyaki sauce',
  11.9,
  'FANCY ROLLS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Red Monster',
  'Crab stick, mayo, tobiko, avocado, cucumber, salmon, teriyaki sauce, spring onions',
  11.9,
  'FANCY ROLLS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Alaska Roll',
  'Salmon, Philadelphia cheese, avocado, prawn, mayo, teriyaki sauce',
  11.9,
  'FANCY ROLLS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Tokyo Dragon',
  'Salmon, boiled carrot, avocado, grilled eel, teriyaki sauce, spring onions',
  12.5,
  'FANCY ROLLS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Rainbow Roll',
  'Prawn tempura, cucumber, topped with tuna, salmon, avocado',
  12.5,
  'FANCY ROLLS',
  'food',
  TRUE,
  timezone('utc', now())
),
-- SUSHI PLATTERS
(
  'Okurama Asian Fusion',
  'Platter 1 (16 pcs)',
  'Avocado nigiri, tofu pocket nigiri, tuna hosomaki, salmon Philadelphia roll, California roll',
  18,
  'SUSHI PLATTERS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Platter 2 (24 pcs)',
  'Seared salmon nigiri, prawn nigiri, salmon hosomaki, spicy salmon roll, prawn tempura roll',
  28.5,
  'SUSHI PLATTERS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Platter 3 (30 pcs)',
  'Salmon nigiri, tuna nigiri, Philadelphia hosomaki, chicken katsu roll, grilled tuna roll, hot night roll',
  36.5,
  'SUSHI PLATTERS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Platter 4 (34 pcs)',
  'Seared salmon nigiri, tuna nigiri, prawn nigiri, ribeye nigiri, salmon hosomaki, grilled tuna roll, California roll, prawn tempura roll',
  42.5,
  'SUSHI PLATTERS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Platter 5 (48 pcs)',
  'Various rolls, hosomaki, and nigiri selection',
  56.5,
  'SUSHI PLATTERS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'Okurama Asian Fusion',
  'Platter 6 (60 pcs)',
  'Large variety of rolls, hosomaki, and nigiri',
  72,
  'SUSHI PLATTERS',
  'food',
  TRUE,
  timezone('utc', now())
)
ON CONFLICT (bar_name, item_name, category) DO NOTHING; 
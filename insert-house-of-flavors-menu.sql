-- SQL script to insert 'House of Flavors' bar (if not exists) and its menu items.

-- Step 1: Insert 'House of Flavors' into the bars table if it doesn't already exist.
-- Assumes 'bars' table minimally has columns: id, name, address, created_at, updated_at.
INSERT INTO public.bars (
  name,
  address,
  created_at,
  updated_at
) VALUES (
  'House of Flavors',
  'Malta', -- Generic address as not specified; adjust if you have a specific address.
  timezone('utc', now()),
  timezone('utc', now())
)
ON CONFLICT (name) DO NOTHING; -- Assuming 'name' is a unique constraint on bars, or adjust.

-- Step 2: Insert menu items for 'House of Flavors' into the public.restaurant_menus table.
-- This table uses 'bar_name' (TEXT) for linkage.
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
-- BREAKFAST
(
  'House of Flavors',
  'English Breakfast',
  'Eggs, bacon, sausages, baked beans, tomatoes, toast',
  7.5,
  'BREAKFAST',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Omelettes',
  'Choose one: ham, cheese, onion, tomatoes, mushroom, salmon topping; served with toast',
  6.5,
  'BREAKFAST',
  'food',
  TRUE,
  timezone('utc', now())
),
-- SNACKS
(
  'House of Flavors',
  'Ftira Bajd U Laham',
  'Maltese ftira, sliced beef, fried eggs, caramelized onions',
  7,
  'SNACKS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Parma Ham',
  'Rucola, cherry tomatoes, parmesan shavings',
  6.5,
  'SNACKS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Tuna',
  'Tuna, olives, capers, tomatoes, ġbejna, onions, kunserva, fresh mint',
  5.5,
  'SNACKS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Chicken & Bacon',
  'Chicken, bacon, lettuce, tomatoes, mango mayo',
  6,
  'SNACKS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Smoked Salmon',
  'Smoked salmon, Philadelphia cheese, tomatoes, rucola',
  8,
  'SNACKS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Chips',
  NULL,
  3,
  'SNACKS',
  'food',
  TRUE,
  timezone('utc', now())
),
-- TOASTIE
(
  'House of Flavors',
  'Ham & Cheese Toast',
  NULL,
  3.5,
  'TOASTIE',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Bacon, Cheese & Egg Toast',
  NULL,
  4.5,
  'TOASTIE',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Cheese & Tomato Toast',
  NULL,
  3.5,
  'TOASTIE',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Egg & Cheese Toast',
  NULL,
  3,
  'TOASTIE',
  'food',
  TRUE,
  timezone('utc', now())
),
-- FOCACCIA
(
  'House of Flavors',
  'Italian',
  'Tomatoes, parmesan, mozzarella di bufala, parma ham, rucola',
  15.5,
  'FOCACCIA',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Bruschetta',
  'Tomato, onions, basil, olive oil',
  8,
  'FOCACCIA',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Classic (V)',
  'Caramelized onions, rosemary',
  9,
  'FOCACCIA',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Garden Focaccia (V)',
  'Tomato sauce, vegan red pesto, grilled vegetables',
  10,
  'FOCACCIA',
  'food',
  TRUE,
  timezone('utc', now())
),
-- PLATTERS
(
  'House of Flavors',
  'Asian Platter',
  'Duck spring rolls, samosas, prawns, chicken satay, pakoras, dumplings, prawn crackers, sweet & sour chicken',
  29,
  'PLATTERS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Mediterranean Platter',
  'Mozzarella, goat cheese, parmesan, bigilla, parma ham, stuffed olives, sun dried tomatoes, Galletti, nuts, grapes',
  35,
  'PLATTERS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Maltese Platter',
  'Maltese sausage, bigilla, tuna ftira, stuffed olives, sundried tomatoes, ġbejna, Galletti',
  30,
  'PLATTERS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Meat Board',
  'Full rack of ribs, Maltese sausages, rabbit liver, wings, chicken breast, horse meat stew, chef's choice meat',
  75,
  'PLATTERS',
  'food',
  TRUE,
  timezone('utc', now())
),
-- SALADS
(
  'House of Flavors',
  'Smoked Salmon Salad',
  'Smoked salmon, goma wakame, lemon & mango dressing',
  15,
  'SALADS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Parma Salad',
  'Mixed greens, mozzarella di bufala, parma ham, ground nuts',
  15,
  'SALADS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Vegan Salad (V)',
  'Vegan patty, croutons, tomatoes, nuts, caramelized onions',
  14,
  'SALADS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Classic Chicken Salad',
  'Lettuce, tomatoes, bacon, croutons, Caesar dressing',
  14.5,
  'SALADS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Greek Feta Salad',
  'Tomatoes, cucumber, olives, herb oil',
  14,
  'SALADS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Beef Salad',
  'Beef tagliata, grilled peppers, cherry tomatoes, mixed greens, nuts, sesame seeds',
  15,
  'SALADS',
  'food',
  TRUE,
  timezone('utc', now())
),
-- PASTA
(
  'House of Flavors',
  'Linguine Scoglio',
  'Mixed seafood',
  16.5,
  'PASTA',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Spaghetti Octopus',
  'Local octopus, tomato, herbs',
  15.5,
  'PASTA',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Lobster Pappardelle',
  'Half lobster, shallots, rosemary, white wine, cream sauce',
  28,
  'PASTA',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Ravioli Ricotta',
  '14 pieces of local ricotta ravioli, tomato sauce, ġbejna',
  13,
  'PASTA',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Penne Ragu',
  'Beef ragu sauce',
  13,
  'PASTA',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Spaghetti Rabbit',
  'Rabbit sauce, peas',
  13.5,
  'PASTA',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Spaghetti Tagliata',
  '180g beef tagliata, garlic, cherry tomatoes',
  14,
  'PASTA',
  'food',
  TRUE,
  timezone('utc', now())
),
-- BURGERS
(
  'House of Flavors',
  'House Of Flavors Burger',
  'Beef patty, Philadelphia cheese, mozzarella di bufala, tomatoes, pistachio cream',
  14.5,
  'BURGERS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Crispy Chicken Burger',
  'Breaded chicken breast, Caesar dressing, bacon, lettuce, tomato',
  12.5,
  'BURGERS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Cheese & Beef Burger',
  'Beef patty, cheese, caramelized onions',
  12,
  'BURGERS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Naughty Vegan Burger (V)',
  'Cauliflower, chickpeas, fennel, couscous patty, Thai curry sauce',
  14,
  'BURGERS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Blue Cheese Burger',
  'Angus beef patty, parma ham, blue cheese, lettuce, tomato',
  12.5,
  'BURGERS',
  'food',
  TRUE,
  timezone('utc', now())
),
-- MAIN COURSES
(
  'House of Flavors',
  'Braised Pork Ribs',
  'Slow cooked, braised with beer, Tennessee or BBQ sauce',
  18,
  'MAIN COURSES',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Beef Tagliata',
  'Rucola, parmesan, cherry tomatoes',
  26,
  'MAIN COURSES',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Grilled Chicken Breast',
  'Mozzarella di bufala, parma ham',
  19.5,
  'MAIN COURSES',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Baked Salmon',
  'Sundried tomato pesto glaze',
  22,
  'MAIN COURSES',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Ribeye Steak',
  '300g prime ribeye',
  31,
  'MAIN COURSES',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Horse Meat Stew',
  'Slow cooked in tomato sauce',
  17.5,
  'MAIN COURSES',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Octopus Stew',
  'Octopus, tomato, herbs',
  23,
  'MAIN COURSES',
  'food',
  TRUE,
  timezone('utc', now())
),
-- INDIAN DISHES
(
  'House of Flavors',
  'Chicken Masala',
  'Chicken, yogurt, masala spices, onions, tomato sauce',
  11,
  'INDIAN DISHES',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Lamb Rogan Josh',
  'Beef, onions, garlic, Indian spices',
  12,
  'INDIAN DISHES',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Pulao Basmati Rice',
  'Basmati rice, Indian spices',
  7,
  'INDIAN DISHES',
  'food',
  TRUE,
  timezone('utc', now())
),
-- CHINESE DISHES
(
  'House of Flavors',
  'Sweet & Sour Chicken',
  'Chicken, tangy sauce',
  14.85,
  'CHINESE DISHES',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Crispy Beef',
  'Beef, broccoli, Asian sauce',
  16,
  'CHINESE DISHES',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'House of Flavors',
  'Peking Duck (Half)',
  'Classic crispy duck',
  19.3,
  'CHINESE DISHES',
  'food',
  TRUE,
  timezone('utc', now())
)
ON CONFLICT (bar_name, item_name, category) DO NOTHING; 
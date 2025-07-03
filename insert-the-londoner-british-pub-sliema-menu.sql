-- SQL script to insert 'The Londoner British Pub Sliema' bar (if not exists) and its menu items.

-- Step 1: Insert 'The Londoner British Pub Sliema' into the bars table if it doesn't already exist.
INSERT INTO public.bars (
  name,
  address,
  created_at,
  updated_at
) VALUES (
  'The Londoner British Pub Sliema',
  'Sliema, Malta', -- Specific address based on restaurant name
  timezone('utc', now()),
  timezone('utc', now())
)
ON CONFLICT (name) DO NOTHING;

-- Step 2: Insert menu items for 'The Londoner British Pub Sliema' into the public.restaurant_menus table.
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
-- STARTERS
(
  'The Londoner British Pub Sliema',
  'Vegetable Spring Rolls (V)',
  'Served with sweet chilli dip',
  7.95,
  'STARTERS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Meat Balls',
  'Beef and pork mince balls with jus',
  9.95,
  'STARTERS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Fish Cod Goujons',
  'Served with lemon mayonnaise',
  9.95,
  'STARTERS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Chicken Satay Skewers',
  'Served with peanut sauce dip',
  10.95,
  'STARTERS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Southern Fried Chicken Strips',
  'Served with red white dip',
  10.95,
  'STARTERS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Mini Angus Cheese Burgers (4 Pieces)',
  NULL,
  12.95,
  'STARTERS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Traditional Nachos (V)',
  'Cheese sauce, jalapeño, tomato salsa',
  12.95,
  'STARTERS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Deep Fried Calamari',
  'Breaded, served with tartar sauce and lemon wedge',
  14.95,
  'STARTERS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Chicken & Spianata Nachos',
  'Diced chicken, onions, salami spianata, nacho cheese sauce',
  15.95,
  'STARTERS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Grilled Lamb Kofta',
  'Served with yoghurt mint dip',
  10.95,
  'STARTERS',
  'food',
  TRUE,
  timezone('utc', now())
),
-- NIBBLES
(
  'The Londoner British Pub Sliema',
  'Ultimate Garlic Bread (V)',
  'Soft tear and share buns with garlic butter',
  6.95,
  'NIBBLES',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Ultimate Garlic Bread with Cheese (V)',
  'Soft tear and share buns with garlic butter and cheese',
  7.95,
  'NIBBLES',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Proper Stealth Fries (V)',
  NULL,
  5.5,
  'NIBBLES',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Cheese Stealth Fries (V) (H)',
  'Served with curry ketchup',
  5.95,
  'NIBBLES',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Beer Battered Onion Rings (V)',
  'Served with spicy mayo',
  8.5,
  'NIBBLES',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Spicy Pork Sausages',
  NULL,
  7.5,
  'NIBBLES',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Fish Cod Bites',
  'Served with tartar sauce',
  9.95,
  'NIBBLES',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Fish Popcorn',
  'Served with curry ketchup',
  9.95,
  'NIBBLES',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Crispy Chicken Wings',
  'Served with sweet chilli dip',
  11.95,
  'NIBBLES',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Camembert Cheese Bites',
  NULL,
  9.95,
  'NIBBLES',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Traditional Focaccia (V)',
  'Cherry tomatoes, black olives, rosemary, and olive oil',
  9.95,
  'NIBBLES',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Cheesy Bruschetta (V)',
  'Tomatoes, garlic, basil, and melted cheese',
  6.95,
  'NIBBLES',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Bruschetta (V)',
  'Tomatoes, garlic, and basil',
  5.95,
  'NIBBLES',
  'food',
  TRUE,
  timezone('utc', now())
),
-- SALADS
(
  'The Londoner British Pub Sliema',
  'Royal Chicken Caesar',
  'Grilled chicken, lettuce, bacon, parmesan, croutons, tomatoes, caesar dressing',
  15.95,
  'SALADS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Royal Salmon Caesar',
  'Oven baked salmon fillet, ricotta, lettuce, cucumbers, onions, peppers, black olives, parmesan, croutons, tomatoes, caesar dressing',
  17.95,
  'SALADS',
  'food',
  TRUE,
  timezone('utc', now())
),
-- PLATTERS
(
  'The Londoner British Pub Sliema',
  'West End Oriental Platter',
  '4 pork ribs, meatballs, 2 vegetable spring rolls, fish bites, 2 lamb koftas, 4 chicken wings, fish popcorn, 2 chicken satays, stealth fries, garlic bread, and dips',
  39.95,
  'PLATTERS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Seafood & Fish Platter',
  'Fish bites, deep fried calamari, fish popcorn, scampi, Londoner fish & chips, garlic bread, and dips',
  39.95,
  'PLATTERS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Drinker's Favourite',
  '2 mini beef burgers, 2 lamb koftas, 4 chicken wings, spiced honey pork sausages, 2 chicken strips, 4 pork ribs, meatballs, garlic bread, 4 onion rings, and stealth fries smothered in melted cheese',
  42.95,
  'PLATTERS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Cold Cuts & Cheese Platter',
  'Selection of Italian cold cuts and British cheeses, served with olives, mixed fruit & nuts, water biscuits, and grissini',
  32.95,
  'PLATTERS',
  'food',
  TRUE,
  timezone('utc', now())
),
-- FISH & CHIPS
(
  'The Londoner British Pub Sliema',
  'The Londoner Fish & Chips',
  'Beer battered cod, mushy peas, tartar sauce & stealth fries',
  19.95,
  'FISH & CHIPS',
  'food',
  TRUE,
  timezone('utc', now())
),
-- HOT DOG
(
  'The Londoner British Pub Sliema',
  'Londoner Hot Dog',
  'Grilled frankfurter, crispy onions, melted cheese, Heinz baked beans, and stealth fries',
  12.95,
  'HOT DOG',
  'food',
  TRUE,
  timezone('utc', now())
),
-- CLASSICS
(
  'The Londoner British Pub Sliema',
  'Bangers & Mash',
  'Cumberland sausages, mashed potatoes, and onion gravy',
  14.95,
  'CLASSICS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Half Roast Chicken in a Basket',
  'Served with gravy and stealth fries',
  16.95,
  'CLASSICS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Chicken Tikka Masala (H)',
  'Served with basmati rice and pita bread',
  16.95,
  'CLASSICS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Oven Baked Salmon Fillet',
  'Served with mashed potatoes, fresh vegetables, and tarragon sauce',
  23.95,
  'CLASSICS',
  'food',
  TRUE,
  timezone('utc', now())
),
-- PASTA
(
  'The Londoner British Pub Sliema',
  'Baked Potato Gnocchi',
  'Creamy dolcelatte cheese sauce, walnuts, red Leicester, and melted cheddar cheese',
  13.5,
  'PASTA',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Garganelli Chicken Tartufo',
  'Chicken, mushrooms, spring onions, garlic, white wine, and truffle cream',
  15.5,
  'PASTA',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Garganelli Beef Porcini',
  'Beef chunks, porcini mushrooms, red wine, garlic, spring onions, jus, cream, and grana shavings',
  15.95,
  'PASTA',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Strozzapreti Salmon',
  'Fresh salmon, garlic, spring onions, cherry tomatoes, Pernod, cream, and tomato sauce',
  15.95,
  'PASTA',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Tortellini in Puff Pastry',
  'Meat tortellini, onions, garlic, Portobello mushrooms, bacon, white wine, and cream',
  14.95,
  'PASTA',
  'food',
  TRUE,
  timezone('utc', now())
),
-- BURGERS
(
  'The Londoner British Pub Sliema',
  'Miss Chicken Classy',
  'Grilled chicken breast, camembert cheese, bacon, and mango chutney',
  16.95,
  'BURGERS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'The Londoner',
  'Angus beef, cheese, lettuce, tomatoes, and fried onions',
  16.95,
  'BURGERS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'The Big Crusty',
  'Angus beef patty, fried crusty cheese, bacon, onion chutney, Branston pickles, and BBQ sauce',
  17.95,
  'BURGERS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Sir Wellington',
  'Angus beef patty, Portobello mushrooms, BBQ sauce, Branston pickles, smoked cheese, and onion chutney',
  17.95,
  'BURGERS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Westie Burger',
  'Angus beef patty, smoked cheese, crunchy peanut butter, bacon, fried onions, maple syrup, lettuce, and tomato',
  17.95,
  'BURGERS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'The Big Ben',
  'Angus beef patty, deep fried chicken fillet, fried crusty cheese, crispy bacon, onion chutney, and BBQ sauce',
  19.95,
  'BURGERS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Breaded Chicken Burger',
  'Shallow fried breaded chicken fillets, smoked cheese, lettuce, tomatoes, and curry ketchup',
  15.95,
  'BURGERS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'The Veggie (V)',
  'A mixture of onions, carrots, sweetcorn, broccoli, mashed potato & crispy coating',
  11.95,
  'BURGERS',
  'food',
  TRUE,
  timezone('utc', now())
),
-- GRILLS
(
  'The Londoner British Pub Sliema',
  '280g Fresh Grilled Chicken Breast',
  'Served with seasonal vegetables and stealth fries',
  19.95,
  'GRILLS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Rack of Sticky Pork Loin Ribs',
  'Southern honey and Jack Daniels sauce with stealth fries',
  17.95,
  'GRILLS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'The King's Beef Tagliata',
  '300g Beef flank steak, rucola, parmesan shavings, baby potatoes, and cherry tomatoes',
  27.95,
  'GRILLS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Fresh Pure Angus Rib Eye',
  '300g Grilled steak, seasonal vegetables, and stealth fries',
  29.95,
  'GRILLS',
  'food',
  TRUE,
  timezone('utc', now())
),
-- PIES
(
  'The Londoner British Pub Sliema',
  'Chicken, Mushroom & Bacon Pie',
  'Smoked bacon, chicken velouté, chicken breast, and mushrooms',
  14.95,
  'PIES',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Steak & Guinness Pie',
  'Beef chunks, Guinness ale, root vegetables, and gravy',
  14.95,
  'PIES',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Shepherd's Pie',
  'Slow cooked lamb mince, mashed potatoes, and side salad',
  14.95,
  'PIES',
  'food',
  TRUE,
  timezone('utc', now())
),
-- KIDS MENU
(
  'The Londoner British Pub Sliema',
  'Chicken Nuggets & Chips',
  NULL,
  10.95,
  'KIDS MENU',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Penne with Tomato Sauce',
  NULL,
  9.95,
  'KIDS MENU',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Hot Dog, Chips & Baked Beans',
  NULL,
  9.95,
  'KIDS MENU',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Fish & Chips',
  NULL,
  12.95,
  'KIDS MENU',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Burger & Chips',
  NULL,
  12.95,
  'KIDS MENU',
  'food',
  TRUE,
  timezone('utc', now())
),
-- DESSERTS
(
  'The Londoner British Pub Sliema',
  'Snickers',
  'Oven caramelized chocolate cream, roasted peanuts, and nutty chocolate',
  6.5,
  'DESSERTS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Oreo',
  'Dark crunchy biscuits with milky white chocolate mousse',
  6.5,
  'DESSERTS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Nutella Tart',
  'Served with panna',
  6.5,
  'DESSERTS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Apple Crumble',
  'Served with warm custard',
  6.5,
  'DESSERTS',
  'food',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Alison's Soft Baked Milk Chocolate Cookie',
  NULL,
  6.95,
  'DESSERTS',
  'food',
  TRUE,
  timezone('utc', now())
),
-- COLD BEVERAGES
(
  'The Londoner British Pub Sliema',
  'Panna Small Still Water',
  NULL,
  2.6,
  'COLD BEVERAGES',
  'drinks',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'San Pellegrino Small',
  NULL,
  2.6,
  'COLD BEVERAGES',
  'drinks',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Coca Cola (330ml)',
  NULL,
  2.6,
  'COLD BEVERAGES',
  'drinks',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Coke Zero (330ml)',
  NULL,
  2.6,
  'COLD BEVERAGES',
  'drinks',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Kinnie (330ml)',
  NULL,
  2.6,
  'COLD BEVERAGES',
  'drinks',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Diet Kinnie (330ml)',
  NULL,
  2.6,
  'COLD BEVERAGES',
  'drinks',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Sprite (330ml)',
  NULL,
  2.6,
  'COLD BEVERAGES',
  'drinks',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Sprite Zero (330ml)',
  NULL,
  2.6,
  'COLD BEVERAGES',
  'drinks',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Fanta (330ml)',
  NULL,
  2.6,
  'COLD BEVERAGES',
  'drinks',
  TRUE,
  timezone('utc', now())
),
-- BEERS
(
  'The Londoner British Pub Sliema',
  'Cisk Lager (330ml)',
  NULL,
  3.05,
  'BEERS',
  'drinks',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Cisk Excel (330ml)',
  NULL,
  3.05,
  'BEERS',
  'drinks',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Cisk Chill Lemon (330ml)',
  NULL,
  3.05,
  'BEERS',
  'drinks',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Cisk Chill Berry (330ml)',
  NULL,
  3.05,
  'BEERS',
  'drinks',
  TRUE,
  timezone('utc', now())
),
-- WHITE WINES
(
  'The Londoner British Pub Sliema',
  'Donato Chardonnay',
  NULL,
  15.95,
  'WHITE WINES',
  'drinks',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Glicine Corvo',
  NULL,
  20.95,
  'WHITE WINES',
  'drinks',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Gavi Di Gavi',
  NULL,
  24.5,
  'WHITE WINES',
  'drinks',
  TRUE,
  timezone('utc', now())
),
-- RED WINES
(
  'The Londoner British Pub Sliema',
  'Marenzio Merlot',
  NULL,
  15.95,
  'RED WINES',
  'drinks',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Valpolicella Classico DOC',
  NULL,
  18.95,
  'RED WINES',
  'drinks',
  TRUE,
  timezone('utc', now())
),
(
  'The Londoner British Pub Sliema',
  'Malbec',
  NULL,
  21.95,
  'RED WINES',
  'drinks',
  TRUE,
  timezone('utc', now())
)
ON CONFLICT (bar_name, item_name, category) DO NOTHING; 
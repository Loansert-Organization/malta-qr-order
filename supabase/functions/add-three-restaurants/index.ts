import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Complete menu data for all three restaurants
const restaurantMenus = {
  "Brown's Kitchen": [
    { name: 'Pepsi', description: '250ml', price: 2.5, category: 'Soft Drinks', type: 'drink' },
    { name: 'Pepsi Max', description: '250ml', price: 2.5, category: 'Soft Drinks', type: 'drink' },
    { name: '7Up', description: '250ml', price: 2.6, category: 'Soft Drinks', type: 'drink' },
    { name: 'Mirinda', description: '250ml', price: 2.6, category: 'Soft Drinks', type: 'drink' },
    { name: 'Kinnie', description: '250ml', price: 2.6, category: 'Soft Drinks', type: 'drink' },
    { name: 'Diet Kinnie', description: '250ml', price: 2.6, category: 'Soft Drinks', type: 'drink' },
    { name: 'Ice Tea Peach', description: '500ml', price: 2.6, category: 'Soft Drinks', type: 'drink' },
    { name: 'Ice Tea Lemon', description: '500ml', price: 2.6, category: 'Soft Drinks', type: 'drink' },
    { name: 'Still Water', description: '500ml', price: 2.1, category: 'Water', type: 'drink' },
    { name: 'Cisk Lager', description: '250ml', price: 2.9, category: 'Beers', type: 'drink' },
    { name: 'Cisk Excel', description: '250ml', price: 2.9, category: 'Beers', type: 'drink' },
    { name: 'Hopleaf', description: '250ml', price: 2.9, category: 'Beers', type: 'drink' },
    { name: 'Blue Label Smooth & Creamy', description: '400ml', price: 4.6, category: 'Beers', type: 'drink' },
    { name: 'Heineken', description: '250ml', price: 2.9, category: 'Beers', type: 'drink' },
    { name: 'Corona', description: '330ml', price: 4.0, category: 'Beers', type: 'drink' },
    { name: 'Guinness', description: '440ml', price: 4.6, category: 'Beers', type: 'drink' },
    { name: 'Beck\'s Non-Alcoholic', description: '250ml', price: 2.9, category: 'Beers', type: 'drink' }
  ],
  "Felice Brasserie": [
    // Breakfast
    { name: 'Eggs Royal', description: 'Smoked salmon, capers, hollandaise sauce, dill', price: 11, category: 'Breakfast', type: 'food' },
    { name: 'Eggs Benedict', description: 'Crispy bacon, mushrooms, hollandaise sauce, chives', price: 10, category: 'Breakfast', type: 'food' },
    { name: 'Eggs Florentine', description: 'Baby spinach, daikon, hollandaise sauce, chives', price: 9.5, category: 'Breakfast', type: 'food' },
    { name: 'Avocado Toast', description: 'Sourdough bread, rucola, fried egg, cherry tomatoes, radish, cucumber, olives, pumpkin seeds, dill sauce, fermented red onions', price: 14, category: 'Breakfast', type: 'food' },
    { name: 'Omelette with Mushroom & Mozzarella', description: '', price: 10, category: 'Breakfast', type: 'food' },
    { name: 'Scrambled Eggs & Mushroom Fricassée', description: '', price: 10.5, category: 'Breakfast', type: 'food' },
    { name: 'Fit Omelette', description: 'Egg whites, baby spinach, cherry tomatoes', price: 12, category: 'Breakfast', type: 'food' },
    { name: 'Vegan Plate', description: 'Sweet potato purée, tofu, mushroom, baby spinach, avocado, peanut butter, granola', price: 13.5, category: 'Breakfast', type: 'food' },
    { name: 'French Toast Maison', description: 'Cinnamon, brown sugar, butter, seasonal fruits', price: 10.5, category: 'Breakfast', type: 'food' },
    { name: 'Felice English Breakfast Platter', description: 'Fried eggs, bacon, mushrooms, Italian sausage, hash brown, beans, strawberry jam, butter', price: 12.5, category: 'Breakfast', type: 'food' },
    { name: 'Acai Bowl', description: 'Seasonal fruits, granola crumbs, coconut flakes', price: 12.5, category: 'Breakfast', type: 'food' },
    { name: 'Croissant', description: 'Butter, strawberry jam', price: 4.5, category: 'Breakfast', type: 'food' },
    { name: 'Pancakes', description: 'Strawberry and maple syrup', price: 9.5, category: 'Breakfast', type: 'food' },
    
    // Starters
    { name: 'Cheese & Cold Cut Platter', description: 'Spicy salami, prosciutto, bresaola, gorgonzola, blueberry, red pepper cheese, black pepper cheese, jam, fruit', price: 41, category: 'Starters', type: 'food' },
    { name: 'Fried Goat Cheese', description: 'Sour pomegranate sauce, parmesan, red paprika, walnuts, arugula, bread crumbs', price: 14, category: 'Starters', type: 'food' },
    { name: 'Butter Shrimp with Tomato Sauce', description: '', price: 18, category: 'Starters', type: 'food' },
    { name: 'Beef Carpaccio', description: 'Black Angus tenderloin carpaccio, white truffle base mustard, bread crumbs, parmigiano', price: 16, category: 'Starters', type: 'food' },
    { name: 'Tuna Tartare', description: 'Fresh tuna, wasabi vinaigrette, avocado', price: 19.5, category: 'Starters', type: 'food' },
    
    // Salads
    { name: 'Chicken Caesar Salad', description: 'Caesar sauce, baby lettuce, croutons, parmesan, chicken', price: 19, category: 'Salads', type: 'food' },
    { name: 'Quinoa & Shrimp Salad', description: 'Mediterranean greens, lemon vinaigrette, tomato, cucumber, orange, Cajun spicy shrimps', price: 24, category: 'Salads', type: 'food' },
    { name: 'All Green Avocado & Shrimp Salad', description: 'Arugula, avocado, cucumber, celery, edamame, dill, lemon vinaigrette', price: 21.5, category: 'Salads', type: 'food' },
    { name: 'Crispy Artichoke Salad', description: 'Mediterranean greens, sour plum sauce, walnut, bresaola, oranges, strawberries, parmesan', price: 16, category: 'Salads', type: 'food' },
    { name: 'Beetroot Salad with Goat Cheese', description: 'Baby spinach, mustard vinaigrette', price: 14, category: 'Salads', type: 'food' },
    { name: 'Greek Salad', description: 'Cucumber, tomato, bell pepper, olives, feta cheese, red onion, lemon vinaigrette', price: 14, category: 'Salads', type: 'food' },
    
    // Pasta
    { name: 'Lobster Spaghetti', description: 'Lobster, cream sauce, parsley, basil, garlic', price: 38.5, category: 'Pasta', type: 'food' },
    { name: 'Spaghetti Pistachio Burrata', description: 'Guanciale', price: 29.5, category: 'Pasta', type: 'food' },
    { name: 'Seafood Spaghetti', description: 'Calamari, octopus, vongole, shrimps', price: 24, category: 'Pasta', type: 'food' },
    { name: 'Spaghetti Bolognese (Traditional)', description: '', price: 19, category: 'Pasta', type: 'food' },
    { name: 'Spaghetti Bolognese (Wagyu)', description: '', price: 26, category: 'Pasta', type: 'food' },
    { name: 'Rigatoni "King Carbonara"', description: 'Guanciale', price: 18.5, category: 'Pasta', type: 'food' },
    
    // Risotto
    { name: 'Seafood Risotto', description: 'White sauce, calamari, octopus, vongole, shrimps, parmesan, parsley', price: 24, category: 'Risotto', type: 'food' },
    { name: 'Truffled Risotto', description: 'Mushrooms, parsley, parmesan', price: 18, category: 'Risotto', type: 'food' },
    { name: 'Pumpkin Risotto', description: 'Crispy bacon, parsley, parmesan, sriracha', price: 19, category: 'Risotto', type: 'food' },
    
    // Pizza
    { name: 'Margherita Burrata', description: 'Tomato sauce, mozzarella fior di latte, burrata, basil', price: 18, category: 'Pizza', type: 'food' },
    { name: 'Capricciosa', description: 'Tomato sauce, mozzarella, prosciutto cotto, mushrooms, artichoke cream, basil, bell peppers, olives', price: 18.5, category: 'Pizza', type: 'food' },
    { name: '4 Formaggi', description: 'Mozzarella, grana padano, gorgonzola, fontina', price: 17, category: 'Pizza', type: 'food' },
    { name: 'Pizza Beef Carpaccio', description: 'Tomato sauce, beef carpaccio, rucola, grana padano', price: 26, category: 'Pizza', type: 'food' },
    
    // Grill Delicacies
    { name: 'Café de Paris Steak & Truffle Fries', description: '220g steak with truffle fries', price: 34, category: 'Grill Delicacies', type: 'food' },
    { name: 'Felice Steak', description: 'Black Angus tenderloin, cauliflower purée, mushroom, homemade demiglace, baby carrot, asparagus', price: 52, category: 'Grill Delicacies', type: 'food' },
    { name: 'Lamb Chop', description: 'Mashed eggplant, tahini, melted butter, sweet chillies (240g)', price: 38.5, category: 'Grill Delicacies', type: 'food' },
    { name: 'Ribeye & Potato Purée', description: '250g ribeye, baby carrots, asparagus, demi-glace sauce', price: 35, category: 'Grill Delicacies', type: 'food' },
    
    // Seafood
    { name: 'Grilled Seabass with Cucumber Roll', description: 'Fresh seabass, cucumber slices, dill sauce, berries (180g)', price: 24, category: 'Seafood', type: 'food' },
    { name: 'Teriyaki Salmon & Black Rice', description: '180g black rice, teriyaki sauce, sesame, seaweed', price: 26.5, category: 'Seafood', type: 'food' },
    
    // Burgers
    { name: 'R.I.B. Burger', description: 'Mushroom, prime rib, cheddar sauce, French fries (200g)', price: 27, category: 'Burgers', type: 'food' },
    { name: 'Perfect Wagyu Burger', description: 'Truffle mayo, relish sauce, balsamic-infused red onions, cheddar cheese & truffle parsley French fries (200g)', price: 28.5, category: 'Burgers', type: 'food' },
    
    // Use Your Hands
    { name: 'Beef Quesadilla', description: 'Tortilla bread, bell pepper, red onion, Cajun spices, oregano, butter cheese, cheddar cheese', price: 21.5, category: 'Use Your Hands', type: 'food' },
    { name: 'Chicken Burger with Ponzu & Japanese Mayo', description: 'Fried chicken, coleslaw, French fries, sriracha', price: 18.5, category: 'Use Your Hands', type: 'food' },
    { name: 'Fish & Chips', description: 'Fried cod fish, tartare sauce, lemon, French fries', price: 20.5, category: 'Use Your Hands', type: 'food' },
    { name: 'Fried Calamari with Tartare Sauce', description: 'Served with red onion salad', price: 17, category: 'Use Your Hands', type: 'food' },
    { name: 'Fried Coconut Chicken', description: 'Honey & mustard sauce, coconut flakes', price: 17, category: 'Use Your Hands', type: 'food' },
    { name: 'Fried Cheese Sticks', description: 'Breadcrumbs, sweet & chili sauce', price: 12, category: 'Use Your Hands', type: 'food' },
    
    // Drinks
    { name: 'Negroni', description: '', price: 12.5, category: 'Cocktails', type: 'drink' },
    { name: 'Cosmopolitan', description: '', price: 12.5, category: 'Cocktails', type: 'drink' },
    { name: 'Espresso Martini', description: '', price: 12.5, category: 'Cocktails', type: 'drink' },
    { name: 'Paloma', description: '', price: 12.5, category: 'Cocktails', type: 'drink' },
    { name: 'Amaretto Sour', description: '', price: 12.5, category: 'Cocktails', type: 'drink' },
    { name: 'Royal Bermuda Yacht Club', description: '', price: 12.5, category: 'Cocktails', type: 'drink' },
    { name: 'Aperol Spritz', description: '', price: 12.5, category: 'Happy Hour Cocktails', type: 'drink' },
    { name: 'Limoncello Spritz', description: '', price: 12.5, category: 'Happy Hour Cocktails', type: 'drink' },
    { name: 'Peach Bellini', description: '', price: 12.5, category: 'Happy Hour Cocktails', type: 'drink' },
    { name: 'Moscow Mule', description: '', price: 12.5, category: 'Happy Hour Cocktails', type: 'drink' },
    { name: 'Mojito', description: '', price: 12.5, category: 'Happy Hour Cocktails', type: 'drink' },
    { name: 'Coca-Cola', description: '500ml', price: 3.1, category: 'Soft Drinks', type: 'drink' },
    { name: 'Coca-Cola Zero', description: '500ml', price: 3.1, category: 'Soft Drinks', type: 'drink' },
    { name: 'Sprite', description: '500ml', price: 3.1, category: 'Soft Drinks', type: 'drink' },
    { name: 'Fanta', description: '500ml', price: 3.1, category: 'Soft Drinks', type: 'drink' },
    { name: 'Ice Tea Peach', description: '500ml', price: 3.1, category: 'Soft Drinks', type: 'drink' },
    { name: 'Ice Tea Lemon', description: '500ml', price: 3.1, category: 'Soft Drinks', type: 'drink' },
    { name: 'Kinnie', description: '500ml', price: 3.1, category: 'Soft Drinks', type: 'drink' },
    { name: 'Diet Kinnie', description: '500ml', price: 3.1, category: 'Soft Drinks', type: 'drink' }
  ],
  "Paparazzi 29": [
    // Pizzas
    { name: 'First Timer', description: 'Tomato sauce, mozzarella, olives, oregano', price: 12.5, category: 'Pizza', type: 'food' },
    { name: 'Magic', description: 'Tomato sauce, mozzarella, mushrooms', price: 13.2, category: 'Pizza', type: 'food' },
    { name: 'Ham Actor', description: 'Tomato sauce, mozzarella, mushrooms, ham, hard-boiled eggs', price: 15, category: 'Pizza', type: 'food' },
    { name: 'Napoleon', description: 'Tomato sauce, mozzarella, anchovies, olives', price: 13.7, category: 'Pizza', type: 'food' },
    { name: 'Diva', description: 'Tomato sauce, mozzarella, ham, chicken, BBQ sauce', price: 16.2, category: 'Pizza', type: 'food' },
    { name: 'Meaty', description: 'Tomato sauce, mozzarella, onions, peas, chicken, beef, Maltese sausage, pork', price: 16.9, category: 'Pizza', type: 'food' },
    { name: 'Pep Me Up', description: 'Tomato sauce, mozzarella, peperoni, salami, onions, peas', price: 13.7, category: 'Pizza', type: 'food' },
    { name: 'Face Off', description: 'Tomato sauce, mozzarella, pepperoni, oregano', price: 13.7, category: 'Pizza', type: 'food' },
    { name: 'Jockey', description: 'Mozzarella, mushrooms, blue cheese, honey, walnuts, rucola', price: 15.7, category: 'Pizza', type: 'food' },
    { name: 'The Coach', description: 'Tomato sauce, mozzarella, roasted peppers, mushrooms, onions, aubergines, courgettes, goat cheese', price: 15.7, category: 'Pizza', type: 'food' },
    { name: 'Super Sock', description: 'Mascarpone, blue cheese, goat cheese, mozzarella, grana padano', price: 16.2, category: 'Pizza', type: 'food' },
    { name: 'Renato', description: 'Tomato sauce, mozzarella, Parma ham, rucola, grana padano shavings', price: 16.2, category: 'Pizza', type: 'food' },
    { name: 'Moby Dick', description: 'Tomato sauce, onions, olives, tuna, prawns, mussels, cherry tomatoes, oregano, king prawn', price: 16.2, category: 'Pizza', type: 'food' },
    { name: 'Awesome', description: 'Tomato sauce, mozzarella, onions, Maltese sausage, sundried tomatoes, olives, goat cheese', price: 15.7, category: 'Pizza', type: 'food' },
    { name: 'Tunes', description: 'Tomato sauce, mozzarella, tuna, hard-boiled eggs, olives', price: 14.4, category: 'Pizza', type: 'food' },
    { name: 'Miss Piggy', description: 'Mascarpone, mozzarella, onions, sweet corn, cherry tomatoes, crispy bacon', price: 15, category: 'Pizza', type: 'food' },
    { name: 'Margherita', description: 'Mozzarella fior di latte, marinara sauce, basil', price: 11, category: 'Pizza', type: 'food' },
    { name: 'Pepperoni', description: 'Mozzarella fior di latte, marinara sauce, pepperoni, red onions', price: 13, category: 'Pizza', type: 'food' },
    { name: 'Maltija', description: 'Mozzarella fior di latte, marinara sauce, Maltese sausage, sundried tomatoes, red onions, bacon', price: 13, category: 'Pizza', type: 'food' },
    { name: 'Mare E Monti', description: 'Mozzarella fior di latte, marinara sauce, clams, squid, mussels, king prawns, garlic, olive oil', price: 15, category: 'Pizza', type: 'food' },
    
    // Pasta
    { name: 'Pillow Talk', description: 'Ravioli stuffed with fresh ricotta served with a light tomato sauce', price: 12.5, category: 'Pasta', type: 'food' },
    { name: 'Red Light', description: 'Penne in a light tomato sauce, garlic, basil', price: 12.5, category: 'Pasta', type: 'food' },
    { name: 'Queen of Desert', description: 'Spaghetti in a light tomato sauce, garlic, chili', price: 12.5, category: 'Pasta', type: 'food' },
    { name: 'Popeye\'s', description: 'Fusilli in cream, bacon, mushrooms, spinach, parmesan cheese', price: 15.7, category: 'Pasta', type: 'food' },
    { name: 'Behind Closed Doors', description: 'Penne in cream, bacon, mushrooms, chicken, parmesan cheese', price: 15.7, category: 'Pasta', type: 'food' },
    { name: 'Oscar', description: 'Penne with parmesan cheese, walnuts, mascarpone, blue cheese, cherry tomatoes', price: 16.2, category: 'Pasta', type: 'food' },
    { name: 'Yeah Baby', description: 'Penne with smoked salmon, prawns, spinach, creamy cheese sauce', price: 16.2, category: 'Pasta', type: 'food' },
    { name: 'Streaker', description: 'Tagliatelle in a cream and tomato sauce with chicken, pesto, parmesan cheese', price: 16.2, category: 'Pasta', type: 'food' },
    { name: 'Beefy', description: 'Spaghetti with a rich Bolognese sauce', price: 16.2, category: 'Pasta', type: 'food' },
    { name: 'District 9', description: 'Spaghetti with mussels, calamari, prawns, tuna, olives, garlic, light tomato sauce', price: 18.2, category: 'Pasta', type: 'food' },
    { name: 'Blue Movie', description: 'Penne in cream with Maltese sausage, spinach, blue cheese, garlic, chili', price: 16.2, category: 'Pasta', type: 'food' },
    { name: 'Sing', description: 'Spaghetti in a cream sauce with chicken, onions, garlic, chorizo, Cajun spice', price: 16.2, category: 'Pasta', type: 'food' },
    { name: 'Zalzettu', description: 'Penne in a rose sauce, Maltese sausage, green peppers, sundried tomatoes, goat cheese', price: 16.2, category: 'Pasta', type: 'food' },
    { name: 'No Sandro', description: 'Spaghetti, onions, garlic, mussels, clams', price: 18.7, category: 'Pasta', type: 'food' },
    { name: 'Spaghetti Bolognese', description: 'Minced beef, carrots, onions, garlic', price: 12, category: 'Pasta', type: 'food' },
    { name: 'Chicken & Bacon Penne', description: 'Chicken chunks, bacon bits, garlic, onion, mushrooms, grana, cream', price: 14, category: 'Pasta', type: 'food' },
    { name: 'Ravioli', description: 'Ricotta, parsley, polpa, garlic, onions, basil', price: 12, category: 'Pasta', type: 'food' },
    { name: 'Strozzapreti Manzo', description: 'Beef, cream, mushrooms, onion, garlic, grana, cherry tomatoes', price: 16, category: 'Pasta', type: 'food' },
    
    // Salads
    { name: 'Buffalo Bill', description: 'Buffalo mozzarella, cherry tomatoes, Parma ham, rucola, basil oil, breadsticks', price: 15.7, category: 'Salads', type: 'food' },
    { name: 'Maltese Falcon', description: 'Grilled chicken breast, lettuce, rucola, walnuts, grapes, walnut dressing', price: 17.5, category: 'Salads', type: 'food' },
    { name: 'Tuna with Love', description: 'Tuna, feta cheese, eggs, black olives, sundried tomatoes, fresh salad, lemon, basil oil', price: 16.2, category: 'Salads', type: 'food' },
    { name: 'Julius Sees Her', description: 'Grilled chicken breast, lettuce, cherry tomatoes, parmesan shavings, croutons, Caesar dressing', price: 17.5, category: 'Salads', type: 'food' },
    { name: 'Who\'s Smoking?', description: 'Smoked salmon, fresh salad, pink peppercorn, lemon, dill dressing', price: 17.5, category: 'Salads', type: 'food' },
    { name: 'Holy Cow!', description: 'Roast beef, fresh salad, sweet corn, asparagus, Grana shavings, sweet chili dressing, breadsticks', price: 17.5, category: 'Salads', type: 'food' },
    { name: 'Adultery', description: 'Chicken taco salad, crispy bacon, honey, mayo, mustard dressing', price: 17.5, category: 'Salads', type: 'food' },
    
    // Burgers
    { name: 'The Player', description: 'Classic beef burger in a bun', price: 15, category: 'Burgers', type: 'food' },
    { name: 'Whole Lotta Bacon', description: 'Beef burger with bacon and cheese', price: 17.5, category: 'Burgers', type: 'food' },
    { name: 'Overdose', description: 'Beef burger with melted blue cheese or cheddar', price: 16.9, category: 'Burgers', type: 'food' },
    { name: 'Sweetheart', description: 'Beef burger with sweet chili, fried onions, and melted cheddar', price: 16.9, category: 'Burgers', type: 'food' },
    { name: 'Uncle Fester', description: 'Beef burger topped with fresh mozzarella and pesto', price: 17.5, category: 'Burgers', type: 'food' },
    { name: 'OH Peri!', description: 'Crispy breaded Peri Peri chicken fillet burger, topped with guacamole', price: 17.5, category: 'Burgers', type: 'food' },
    { name: 'HANZIR!', description: 'Maltese ftira stuffed with roast beef or pulled pork, served with onions, pickled red cabbage, and mango chutney', price: 18.2, category: 'Burgers', type: 'food' },
    { name: 'The Gardener', description: 'Vegetable burger coated in crunchy bread crumbs, served with rucola and cherry tomatoes', price: 16.9, category: 'Burgers', type: 'food' },
    { name: 'Wing It', description: 'Chicken burger topped with BBQ sauce and bacon', price: 17.5, category: 'Burgers', type: 'food' },
    { name: 'Burger', description: '270g burger, cheddar, bacon, lettuce, tomato', price: 16, category: 'Burgers', type: 'food' },
    
    // Drinks
    { name: 'Coca-Cola (300ml)', description: '', price: 2.6, category: 'Beverages', type: 'drink' },
    { name: 'Coca-Cola Zero (300ml)', description: '', price: 2.6, category: 'Beverages', type: 'drink' },
    { name: 'Kinnie (330ml)', description: '', price: 2.6, category: 'Beverages', type: 'drink' },
    { name: 'Diet Kinnie (330ml)', description: '', price: 2.6, category: 'Beverages', type: 'drink' },
    { name: 'Sprite (330ml)', description: '', price: 2.6, category: 'Beverages', type: 'drink' },
    { name: 'Sprite Zero (330ml)', description: '', price: 2.6, category: 'Beverages', type: 'drink' },
    { name: 'Fanta (330ml)', description: '', price: 2.6, category: 'Beverages', type: 'drink' },
    { name: 'Rauch Ice Tea Peach (330ml)', description: '', price: 2.6, category: 'Beverages', type: 'drink' },
    { name: 'Rauch Ice Tea Lemon (330ml)', description: '', price: 2.6, category: 'Beverages', type: 'drink' },
    { name: 'Still Water', description: '', price: 1.6, category: 'Beverages', type: 'drink' },
    { name: 'Sparkling Water', description: '', price: 2.1, category: 'Beverages', type: 'drink' },
    { name: 'Blue Label (500ml)', description: '', price: 5.1, category: 'Beer', type: 'drink' },
    { name: 'Skol (500ml)', description: '', price: 3.8, category: 'Beer', type: 'drink' },
    { name: 'Corona (355ml)', description: '', price: 4.1, category: 'Beer', type: 'drink' },
    { name: 'Sol (330ml)', description: '', price: 4.1, category: 'Beer', type: 'drink' },
    { name: 'Guinness (500ml)', description: '', price: 5.1, category: 'Beer', type: 'drink' },
    { name: 'Cisk (250ml)', description: '', price: 2.8, category: 'Beer', type: 'drink' },
    { name: 'Cisk Excel (250ml)', description: '', price: 2.8, category: 'Beer', type: 'drink' },
    { name: 'Heineken (250ml)', description: '', price: 3.1, category: 'Beer', type: 'drink' },
    { name: 'Shandy (330ml)', description: '', price: 3.1, category: 'Beer', type: 'drink' },
    { name: 'Thatchers Cider (500ml)', description: 'Choose from Haze, Orange, Classic, Rose', price: 5.1, category: 'Beer', type: 'drink' }
  ]
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Starting restaurant data import...');
    
    // Step 1: Add/update bars
    for (const restaurantName of Object.keys(restaurantMenus)) {
      const { error: barError } = await supabase
        .from('bars')
        .upsert([{
          name: restaurantName,
          address: 'Malta',
          has_menu: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }], { 
          onConflict: 'name',
          ignoreDuplicates: false 
        });

      if (barError) {
        console.error(`Error adding bar ${restaurantName}:`, barError);
        continue;
      }
      console.log(`✅ Added/updated bar: ${restaurantName}`);
    }

    // Step 2: Get bar IDs
    const { data: bars, error: fetchError } = await supabase
      .from('bars')
      .select('id, name')
      .in('name', Object.keys(restaurantMenus));

    if (fetchError || !bars) {
      throw new Error(`Failed to fetch bars: ${fetchError?.message}`);
    }

    // Step 3: Clear existing menu items and add new ones
    let totalItemsAdded = 0;
    
    for (const bar of bars) {
      const menuItems = restaurantMenus[bar.name];
      if (!menuItems || menuItems.length === 0) continue;

      // Clear existing items for this bar
      const { error: deleteError } = await supabase
        .from('menu_items')
        .delete()
        .eq('bar_id', bar.id);

      if (deleteError) {
        console.warn(`Warning: Could not clear existing items for ${bar.name}:`, deleteError);
      }

      // Prepare items for insertion
      const itemsToInsert = menuItems.map(item => ({
        bar_id: bar.id,
        name: item.name,
        description: item.description || null,
        price: item.price,
        category: item.category,
        available: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      // Insert in batches to avoid size limits
      const batchSize = 50;
      for (let i = 0; i < itemsToInsert.length; i += batchSize) {
        const batch = itemsToInsert.slice(i, i + batchSize);
        
        const { error: insertError } = await supabase
          .from('menu_items')
          .insert(batch);

        if (insertError) {
          console.error(`Error inserting batch for ${bar.name}:`, insertError);
        } else {
          totalItemsAdded += batch.length;
          console.log(`✅ Added ${batch.length} items for ${bar.name} (batch ${Math.floor(i/batchSize) + 1})`);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully imported ${bars.length} restaurants with ${totalItemsAdded} menu items total`,
        restaurants: bars.map(b => b.name),
        totalItems: totalItemsAdded
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Import error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to import restaurant data'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
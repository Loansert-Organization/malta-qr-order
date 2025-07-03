-- SQL script to insert a list of new bars into the public.bars table.
-- This script ensures no duplicates are inserted if bars with the same name already exist.

INSERT INTO public.bars (
  name,
  address,
  created_at,
  updated_at
) VALUES
('Aqualuna Lido', 'Malta', timezone('utc', now()), timezone('utc', now())),
('Bistro 516', 'Malta', timezone('utc', now()), timezone('utc', now())),
('Black Bull', 'Malta', timezone('utc', now()), timezone('utc', now())),
('Brown's Kitchen', 'Malta', timezone('utc', now()), timezone('utc', now())),
('Bus Stop Lounge', 'Malta', timezone('utc', now()), timezone('utc', now())),
('Cafe Cuba St Julians', 'St Julians, Malta', timezone('utc', now()), timezone('utc', now())),
('Cuba Campus Hub', 'Malta', timezone('utc', now()), timezone('utc', now())),
('Cuba Shoreline', 'Malta', timezone('utc', now()), timezone('utc', now())),
('Doma Marsascala', 'Marsascala, Malta', timezone('utc', now()), timezone('utc', now())),
('Exiles', 'Malta', timezone('utc', now()), timezone('utc', now())),
('Felice Brasserie', 'Malta', timezone('utc', now()), timezone('utc', now())),
('Fortizza', 'Malta', timezone('utc', now()), timezone('utc', now())),
('House of Flavors', 'Malta', timezone('utc', now()), timezone('utc', now())),
('Kings Gate', 'Malta', timezone('utc', now()), timezone('utc', now())),
('Mamma Mia', 'Malta', timezone('utc', now()), timezone('utc', now())),
('Medasia Fusion Lounge', 'Malta', timezone('utc', now()), timezone('utc', now())),
('Okurama Asian Fusion', 'Malta', timezone('utc', now()), timezone('utc', now())),
('Paparazzi 29', 'Malta', timezone('utc', now()), timezone('utc', now())),
('Peperino Pizza Cucina Verace', 'Malta', timezone('utc', now()), timezone('utc', now())),
('Sakura Japanese Cuisine Lounge', 'Malta', timezone('utc', now()), timezone('utc', now())),
('Spinola Cafe Lounge St Julians', 'St Julians, Malta', timezone('utc', now()), timezone('utc', now())),
('Surfside', 'Malta', timezone('utc', now()), timezone('utc', now())),
('Tex Mex American Bar Grill Paceville', 'Paceville, Malta', timezone('utc', now()), timezone('utc', now())),
('The Brew Bar Grill', 'Malta', timezone('utc', now()), timezone('utc', now())),
('The Londoner British Pub Sliema', 'Sliema, Malta', timezone('utc', now()), timezone('utc', now())),
('Victoria Gastro Pub', 'Malta', timezone('utc', now()), timezone('utc', now())),
('Zion Reggae Bar', 'Malta', timezone('utc', now()), timezone('utc', now()))
ON CONFLICT (name) DO NOTHING; 
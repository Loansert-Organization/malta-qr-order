-- Ensure bars have menu flag set
UPDATE public.bars 
SET has_menu = true
WHERE name IN (
    'The Londoner Pub Sliema', 
    'Mamma Mia Restaurant', 
    'The Brew Grill & Brewery'
);

-- Verify the update
SELECT id, name, has_menu, country 
FROM public.bars 
WHERE name IN (
    'The Londoner Pub Sliema', 
    'Mamma Mia Restaurant', 
    'The Brew Grill & Brewery'
); 
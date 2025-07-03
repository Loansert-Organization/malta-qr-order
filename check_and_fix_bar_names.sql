-- First, let's check what bars exist with similar names
SELECT id, name FROM public.bars 
WHERE name ILIKE '%londoner%' 
   OR name ILIKE '%mamma%' 
   OR name ILIKE '%brew%';

-- If the bars don't exist, insert them
-- Note: Using ON CONFLICT (name) won't work because there's no unique constraint on name
-- So we'll check first, then insert if needed

DO $$
DECLARE
    v_londoner_exists BOOLEAN;
    v_mamma_exists BOOLEAN;
    v_brew_exists BOOLEAN;
BEGIN
    -- Check if bars exist
    SELECT EXISTS(SELECT 1 FROM public.bars WHERE name ILIKE '%londoner%pub%sliema%') INTO v_londoner_exists;
    SELECT EXISTS(SELECT 1 FROM public.bars WHERE name ILIKE '%mamma%mia%') INTO v_mamma_exists;
    SELECT EXISTS(SELECT 1 FROM public.bars WHERE name ILIKE '%brew%bar%grill%') INTO v_brew_exists;
    
    -- Insert The Londoner if it doesn't exist
    IF NOT v_londoner_exists THEN
        INSERT INTO public.bars (name, location, lat, lng, country, google_rating) 
        VALUES ('The Londoner Pub Sliema', ST_GeogFromText('POINT(14.5076 35.9150)'), 35.9150, 14.5076, 'Malta', 4.5);
        RAISE NOTICE 'Inserted The Londoner Pub Sliema';
    END IF;
    
    -- Insert Mamma Mia if it doesn't exist
    IF NOT v_mamma_exists THEN
        INSERT INTO public.bars (name, location, lat, lng, country, google_rating) 
        VALUES ('Mamma Mia', ST_GeogFromText('POINT(14.5100 35.9170)'), 35.9170, 14.5100, 'Malta', 4.3);
        RAISE NOTICE 'Inserted Mamma Mia';
    END IF;
    
    -- Insert The Brew Bar Grill if it doesn't exist
    IF NOT v_brew_exists THEN
        INSERT INTO public.bars (name, location, lat, lng, country, google_rating) 
        VALUES ('The Brew Bar Grill', ST_GeogFromText('POINT(14.5090 35.9160)'), 35.9160, 14.5090, 'Malta', 4.4);
        RAISE NOTICE 'Inserted The Brew Bar Grill';
    END IF;
END $$;

-- Now let's check again what we have
SELECT id, name FROM public.bars 
WHERE name ILIKE '%londoner%' 
   OR name ILIKE '%mamma%' 
   OR name ILIKE '%brew%'; 
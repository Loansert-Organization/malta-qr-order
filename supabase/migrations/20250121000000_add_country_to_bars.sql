-- Add country field to bars table
-- Migration: 20250121000000_add_country_to_bars

-- Add country column
ALTER TABLE bars ADD COLUMN IF NOT EXISTS country text DEFAULT 'Malta';

-- Update existing Malta bars
UPDATE bars 
SET country = 'Malta' 
WHERE address ILIKE '%Malta%';

-- Update existing Rwanda/Kigali bars  
UPDATE bars 
SET country = 'Rwanda' 
WHERE address ILIKE '%Rwanda%' OR address ILIKE '%Kigali%';

-- Add index for country filtering
CREATE INDEX IF NOT EXISTS idx_bars_country ON bars(country);

-- Update RLS policies to allow filtering by country
DROP POLICY IF EXISTS "Allow public read on bars" ON bars;
CREATE POLICY "Allow public read on bars" ON bars FOR SELECT USING (true); 
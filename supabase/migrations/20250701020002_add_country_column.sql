-- Add country column to bars table for better filtering
ALTER TABLE bars ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Malta';

-- Create index for faster filtering by country
CREATE INDEX IF NOT EXISTS idx_bars_country ON bars(country);

-- Update existing bars to have Malta as default country
UPDATE bars SET country = 'Malta' WHERE country IS NULL;

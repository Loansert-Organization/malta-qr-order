-- Add country column to bars table
ALTER TABLE bars ADD COLUMN IF NOT EXISTS country TEXT;

-- Add photos column to store multiple Google Maps photos as JSON array
ALTER TABLE bars ADD COLUMN IF NOT EXISTS photos JSONB; 
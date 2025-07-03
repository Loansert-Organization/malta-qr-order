-- Add photo_url column to bars table for Google Maps images
-- Migration: add_photo_url_to_bars

BEGIN;

-- Add photo_url column
ALTER TABLE bars ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Add other useful Google Maps columns
ALTER TABLE bars ADD COLUMN IF NOT EXISTS latitude NUMERIC;
ALTER TABLE bars ADD COLUMN IF NOT EXISTS longitude NUMERIC;
ALTER TABLE bars ADD COLUMN IF NOT EXISTS photo_ref TEXT;

-- Create index for better performance on photo_url queries
CREATE INDEX IF NOT EXISTS idx_bars_photo_url ON bars(photo_url);

-- Update updated_at timestamp
UPDATE bars SET updated_at = timezone('utc'::text, now()) WHERE photo_url IS NULL;

COMMIT;

-- Show success message
SELECT 
    'Photo URL column added successfully' as status,
    COUNT(*) as total_bars,
    COUNT(photo_url) as bars_with_photos
FROM bars;

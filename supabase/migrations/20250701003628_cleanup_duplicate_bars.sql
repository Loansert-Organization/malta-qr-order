-- Remove duplicate bars based on name and address similarity
-- Keep only the first occurrence (oldest) of each unique bar

BEGIN;

-- Create a temporary table to identify duplicates
CREATE TEMP TABLE bars_to_keep AS
SELECT DISTINCT ON (
  LOWER(TRIM(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s]', '', 'g'))),
  LOWER(TRIM(REGEXP_REPLACE(address, '[^a-zA-Z0-9\s]', '', 'g')))
) 
  id,
  name,
  address,
  created_at
FROM bars
WHERE name IS NOT NULL AND address IS NOT NULL
ORDER BY 
  LOWER(TRIM(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s]', '', 'g'))),
  LOWER(TRIM(REGEXP_REPLACE(address, '[^a-zA-Z0-9\s]', '', 'g'))),
  created_at ASC;

-- Delete all bars except those we want to keep
DELETE FROM bars 
WHERE id NOT IN (SELECT id FROM bars_to_keep)
  AND name IS NOT NULL 
  AND address IS NOT NULL;

-- Also remove duplicates based on Google Place ID
DELETE FROM bars a
USING bars b
WHERE a.id > b.id
  AND a.google_place_id = b.google_place_id
  AND a.google_place_id IS NOT NULL;

-- Clean up any remaining exact name duplicates in same area
DELETE FROM bars a
USING bars b
WHERE a.id > b.id
  AND LOWER(TRIM(a.name)) = LOWER(TRIM(b.name))
  AND LOWER(TRIM(a.address)) LIKE LOWER(TRIM(SUBSTRING(b.address, 1, 20))) || '%';

COMMIT;

-- Show cleanup results
SELECT 
  'Cleanup completed' as status,
  COUNT(*) as total_bars_remaining,
  COUNT(DISTINCT LOWER(TRIM(name))) as unique_names,
  COUNT(DISTINCT LOWER(TRIM(address))) as unique_addresses
FROM bars;

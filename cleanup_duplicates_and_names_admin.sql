-- ADMIN-LEVEL DUPLICATE CLEANUP + BAR NAME CLEANING
-- Run this in Supabase Dashboard -> SQL Editor with admin privileges
-- This will:
-- 1. Remove trailing numbers from bar names (e.g., "Bar CBD Pub 11" -> "Bar CBD Pub")
-- 2. Remove ALL duplicate bars, keeping only ONE instance of each unique cleaned name

BEGIN;

-- Step 1: Show current statistics
SELECT 
    'BEFORE CLEANUP' as status,
    COUNT(*) as total_bars,
    COUNT(DISTINCT name) as unique_names_with_numbers,
    COUNT(DISTINCT TRIM(REGEXP_REPLACE(name, '\s+\d+$', '', 'g'))) as unique_names_after_cleaning
FROM bars 
WHERE name IS NOT NULL;

-- Step 2: Show sample of how names will be cleaned
SELECT 
    'SAMPLE NAME CLEANING' as status,
    name as original_name,
    TRIM(REGEXP_REPLACE(name, '\s+\d+$', '', 'g')) as cleaned_name
FROM bars 
WHERE name IS NOT NULL 
  AND name ~ '\s+\d+$'
ORDER BY name
LIMIT 10;

-- Step 3: Update all bar names to remove trailing numbers
UPDATE bars 
SET name = TRIM(REGEXP_REPLACE(name, '\s+\d+$', '', 'g'))
WHERE name IS NOT NULL 
  AND name ~ '\s+\d+$';

-- Step 4: Show statistics after name cleaning
SELECT 
    'AFTER NAME CLEANING' as status,
    COUNT(*) as total_bars,
    COUNT(DISTINCT name) as unique_names,
    (COUNT(*) - COUNT(DISTINCT name)) as duplicates_to_remove
FROM bars 
WHERE name IS NOT NULL;

-- Step 5: Create temporary table with bars to keep (oldest of each cleaned name)
CREATE TEMP TABLE bars_to_keep AS
SELECT DISTINCT ON (TRIM(name)) 
    id,
    name,
    created_at
FROM bars
WHERE name IS NOT NULL 
ORDER BY TRIM(name), created_at ASC;

-- Step 6: Show what we're keeping
SELECT 
    'BARS TO KEEP' as status,
    COUNT(*) as unique_bars_to_keep
FROM bars_to_keep;

-- Step 7: Delete all bars NOT in the keep list
DELETE FROM bars 
WHERE name IS NOT NULL 
  AND id NOT IN (SELECT id FROM bars_to_keep);

-- Step 8: Also clean up any NULL or empty name bars
DELETE FROM bars 
WHERE name IS NULL 
   OR TRIM(name) = '';

-- Step 9: Show final statistics
SELECT 
    'AFTER COMPLETE CLEANUP' as status,
    COUNT(*) as total_bars_remaining,
    COUNT(DISTINCT name) as unique_names,
    COUNT(*) - COUNT(DISTINCT name) as remaining_duplicates
FROM bars;

-- Step 10: Verify no duplicates remain
SELECT 
    'REMAINING DUPLICATES CHECK' as status,
    name,
    COUNT(*) as count
FROM bars 
WHERE name IS NOT NULL
GROUP BY name 
HAVING COUNT(*) > 1
ORDER BY count DESC, name;

-- Step 11: Show sample of cleaned data
SELECT 
    'SAMPLE CLEANED DATA' as status,
    name,
    address,
    created_at
FROM bars 
WHERE name IS NOT NULL
ORDER BY name 
LIMIT 20;

COMMIT;

-- Final verification query (run separately if needed)
-- SELECT 
--     COUNT(*) as final_total,
--     COUNT(DISTINCT name) as final_unique,
--     'SUCCESS: All numbers removed and duplicates cleaned' as message
-- FROM bars 
-- WHERE name IS NOT NULL;

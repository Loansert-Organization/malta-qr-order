-- ADMIN-LEVEL DUPLICATE CLEANUP FOR BARS TABLE
-- Run this in Supabase Dashboard -> SQL Editor with admin privileges
-- This will remove ALL duplicate bars, keeping only ONE instance of each unique name

BEGIN;

-- Step 1: Show current statistics
SELECT 
    'BEFORE CLEANUP' as status,
    COUNT(*) as total_bars,
    COUNT(DISTINCT name) as unique_names,
    (COUNT(*) - COUNT(DISTINCT name)) as duplicates_to_remove
FROM bars 
WHERE name IS NOT NULL;

-- Step 2: Create temporary table with bars to keep (oldest of each name)
CREATE TEMP TABLE bars_to_keep AS
SELECT DISTINCT ON (TRIM(name)) 
    id,
    name,
    created_at
FROM bars
WHERE name IS NOT NULL 
ORDER BY TRIM(name), created_at ASC;

-- Step 3: Show what we're keeping
SELECT 
    'BARS TO KEEP' as status,
    COUNT(*) as unique_bars_to_keep
FROM bars_to_keep;

-- Step 4: Delete all bars NOT in the keep list
DELETE FROM bars 
WHERE name IS NOT NULL 
  AND id NOT IN (SELECT id FROM bars_to_keep);

-- Step 5: Also clean up any NULL or empty name bars
DELETE FROM bars 
WHERE name IS NULL 
   OR TRIM(name) = '';

-- Step 6: Show final statistics
SELECT 
    'AFTER CLEANUP' as status,
    COUNT(*) as total_bars_remaining,
    COUNT(DISTINCT name) as unique_names,
    COUNT(*) - COUNT(DISTINCT name) as remaining_duplicates
FROM bars;

-- Step 7: Verify no duplicates remain
SELECT 
    name,
    COUNT(*) as count
FROM bars 
WHERE name IS NOT NULL
GROUP BY name 
HAVING COUNT(*) > 1
ORDER BY count DESC, name;

-- Step 8: Show sample of cleaned data
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
--     'SUCCESS: All duplicates removed' as message
-- FROM bars 
-- WHERE name IS NOT NULL;

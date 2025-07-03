-- Check what columns exist in the bars table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bars' AND table_schema = 'public'
ORDER BY ordinal_position; 
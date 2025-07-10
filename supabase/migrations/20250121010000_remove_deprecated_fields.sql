-- Remove deprecated fields from users table (bars)
ALTER TABLE users DROP COLUMN IF EXISTS revolut_link;
ALTER TABLE users DROP COLUMN IF EXISTS logo_url;
ALTER TABLE users DROP COLUMN IF EXISTS website_url;

-- Remove deprecated fields from menu_items table
ALTER TABLE menu_items DROP COLUMN IF EXISTS description;
ALTER TABLE menu_items DROP COLUMN IF EXISTS preparation_time;
ALTER TABLE menu_items DROP COLUMN IF EXISTS rating;
ALTER TABLE menu_items DROP COLUMN IF EXISTS popularity;

-- Update any existing references to use category instead of description
-- This is handled in the application code 
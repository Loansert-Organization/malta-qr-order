-- Add review fields to menus table
ALTER TABLE menus ADD COLUMN IF NOT EXISTS is_reviewed BOOLEAN DEFAULT false;
ALTER TABLE menus ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE menus ADD COLUMN IF NOT EXISTS reviewed_by UUID;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_menus_is_reviewed ON menus(is_reviewed);
CREATE INDEX IF NOT EXISTS idx_menus_bar_id_is_reviewed ON menus(bar_id, is_reviewed); 
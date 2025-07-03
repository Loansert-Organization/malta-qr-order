-- Migration to add menu accountability features

BEGIN;

-- 1. Add 'has_menu' column to the 'bars' table
ALTER TABLE public.bars
ADD COLUMN IF NOT EXISTS has_menu BOOLEAN DEFAULT FALSE NOT NULL;

-- 2. Add an index for faster lookups on the new column
CREATE INDEX IF NOT EXISTS idx_bars_has_menu ON public.bars(has_menu);

-- 3. Create a function to update the 'has_menu' flag on the 'bars' table.
-- This function will be triggered when items are added to or removed from the 'menu_items' table.
CREATE OR REPLACE FUNCTION public.update_bar_has_menu_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_bar_id UUID;
  v_menu_item_count INT;
BEGIN
  -- Determine the bar_id from the operation
  IF TG_OP = 'DELETE' THEN
    v_bar_id := OLD.bar_id;
  ELSE
    v_bar_id := NEW.bar_id;
  END IF;

  -- Recalculate the number of menu items for the affected bar
  SELECT COUNT(*)
  INTO v_menu_item_count
  FROM public.menu_items
  WHERE bar_id = v_bar_id;

  -- Update the has_menu flag on the bars table
  UPDATE public.bars
  SET has_menu = (v_menu_item_count > 0)
  WHERE id = v_bar_id;

  RETURN NULL; -- Trigger function doesn't need to return a row
END;
$$;

-- 4. Create a trigger that calls the function after any change to 'menu_items'.
-- This handles inserts, updates (if bar_id changes), and deletes.
DROP TRIGGER IF EXISTS trg_update_bar_has_menu ON public.menu_items;
CREATE TRIGGER trg_update_bar_has_menu
  AFTER INSERT OR UPDATE OR DELETE ON public.menu_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_bar_has_menu_status();

-- 5. Update RLS policies to make the new column readable by the public.
-- The RLS policy is the primary mechanism for granting access.

-- Re-apply the row-level security policies to ensure they are active.
DROP POLICY IF EXISTS "Allow public read access to bars" ON public.bars;
CREATE POLICY "Allow public read access to bars"
ON public.bars FOR SELECT
TO anon, authenticated
USING (is_active = true);

DROP POLICY IF EXISTS "Allow admin access to all bars" ON public.bars;
CREATE POLICY "Allow admin access to all bars"
ON public.bars FOR ALL
TO service_role
USING (true);

COMMIT; 
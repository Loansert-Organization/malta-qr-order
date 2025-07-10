-- Migration: Populate menu_items.bar_id using menus.bar_id and add compatibility vendor_id column

-- 1. Ensure bar_id column exists in menu_items
ALTER TABLE public.menu_items
    ADD COLUMN IF NOT EXISTS bar_id uuid;

-- 2. Bulk populate bar_id where NULL, joining via menu_id → menus.bar_id
UPDATE public.menu_items mi
SET    bar_id = m.bar_id
FROM   public.menus m
WHERE  mi.bar_id IS NULL
  AND  mi.menu_id = m.id;

-- 3. Add vendor_id column for compatibility if needed
ALTER TABLE public.menu_items
    ADD COLUMN IF NOT EXISTS vendor_id uuid;

-- 4. Sync trigger so vendor_id and bar_id mirror each other
CREATE OR REPLACE FUNCTION public.sync_menuitem_vendor_bar()
RETURNS trigger AS $$
BEGIN
    IF NEW.vendor_id IS NOT NULL AND NEW.bar_id IS NULL THEN
        NEW.bar_id := NEW.vendor_id;
    ELSIF NEW.vendor_id IS NULL AND NEW.bar_id IS NOT NULL THEN
        NEW.vendor_id := NEW.bar_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_menuitem_vendor_bar ON public.menu_items;
CREATE TRIGGER trg_sync_menuitem_vendor_bar
BEFORE INSERT OR UPDATE ON public.menu_items
FOR EACH ROW EXECUTE FUNCTION public.sync_menuitem_vendor_bar(); 
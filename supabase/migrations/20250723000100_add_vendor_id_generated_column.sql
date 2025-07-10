-- Migration: Add compatibility column vendor_id to menus as generated column aliasing bar_id
-- Allows legacy code that inserts or queries menus.vendor_id to continue functioning.
-- Writes to vendor_id will automatically populate bar_id via trigger.

-- 1. Add vendor_id column if not exists (nullable temp)
ALTER TABLE public.menus
    ADD COLUMN IF NOT EXISTS vendor_id uuid;

-- 2. Ensure vendor_id stays in sync with bar_id using triggers
CREATE OR REPLACE FUNCTION public.sync_vendor_id_to_bar_id()
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

-- Attach trigger for INSERT and UPDATE
DROP TRIGGER IF EXISTS trg_sync_vendor_id ON public.menus;
CREATE TRIGGER trg_sync_vendor_id
BEFORE INSERT OR UPDATE ON public.menus
FOR EACH ROW EXECUTE FUNCTION public.sync_vendor_id_to_bar_id(); 
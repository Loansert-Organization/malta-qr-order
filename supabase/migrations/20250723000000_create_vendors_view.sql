-- Migration: Create compatibility view 'vendors' mapping to 'users' with role 'bar' or 'vendor'
-- This view allows legacy application code that still queries the 'vendors' table
-- to continue functioning after the vendors table has been removed.

CREATE OR REPLACE VIEW public.vendors AS
SELECT
    u.id,
    u.name                           AS name,
    u.name                           AS business_name,
    lower(regexp_replace(u.name, '[^a-z0-9]+', '-', 'g')) AS slug,
    u.address,
    u.city                           AS location,
    u.country,
    u.contact_number                 AS phone_number,
    u.is_active                      AS active,
    u.is_active,
    u.is_onboarded,
    u.created_at,
    u.updated_at
FROM public.users u
WHERE u.role IN ('bar', 'vendor'); 
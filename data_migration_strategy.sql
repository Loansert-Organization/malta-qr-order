-- =============================================================================
-- DATA MIGRATION STRATEGY FOR MALTA QR ORDER SYSTEM
-- =============================================================================
-- This document outlines the step-by-step migration strategy for removing
-- deprecated fields from vendors (users table) and menu_items tables

-- =============================================================================
-- PHASE 1: DATA ARCHIVAL AND BACKUP
-- =============================================================================

-- Step 1.1: Create backup tables for deprecated vendor fields
CREATE TABLE IF NOT EXISTS vendor_fields_backup (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL,
    backup_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Payment fields
    website TEXT,
    revolut_link TEXT,
    revolut_payment_link TEXT,
    stripe_account_id TEXT,
    stripe_link TEXT,
    
    -- Metadata fields
    logo_url TEXT,
    description TEXT,
    category TEXT,
    opening_hours TEXT,
    current_wait_time INTEGER,
    
    -- Location fields
    location_geo GEOGRAPHY(POINT),
    location_text TEXT,
    
    -- Contact fields
    email TEXT,
    contact_person TEXT,
    
    -- Relationship fields
    user_id UUID,
    owner_id UUID,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    backup_reason TEXT DEFAULT 'Schema refactoring - deprecated fields removal'
);

-- Step 1.2: Create backup table for deprecated menu item fields
CREATE TABLE IF NOT EXISTS menu_item_fields_backup (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID NOT NULL,
    backup_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Deprecated fields
    prep_time INTEGER,
    source_url TEXT,
    dietary_tags TEXT[],
    allergens TEXT[],
    category_id UUID,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    backup_reason TEXT DEFAULT 'Schema refactoring - deprecated fields removal'
);

-- Step 1.3: Archive current data
INSERT INTO vendor_fields_backup (
    vendor_id,
    website,
    revolut_link,
    revolut_payment_link,
    stripe_account_id,
    stripe_link,
    logo_url,
    description,
    category,
    opening_hours,
    current_wait_time,
    location_geo,
    location_text,
    email,
    contact_person,
    user_id,
    owner_id
)
SELECT 
    id as vendor_id,
    website,
    revolut_link,
    revolut_payment_link,
    stripe_account_id,
    stripe_link,
    logo_url,
    description,
    category,
    opening_hours,
    current_wait_time,
    location_geo,
    location_text,
    email,
    contact_person,
    user_id,
    owner_id
FROM public.users 
WHERE role = 'vendor'
AND (
    website IS NOT NULL OR
    revolut_link IS NOT NULL OR
    revolut_payment_link IS NOT NULL OR
    stripe_account_id IS NOT NULL OR
    stripe_link IS NOT NULL OR
    logo_url IS NOT NULL OR
    description IS NOT NULL OR
    category IS NOT NULL OR
    opening_hours IS NOT NULL OR
    current_wait_time IS NOT NULL OR
    location_geo IS NOT NULL OR
    location_text IS NOT NULL OR
    email IS NOT NULL OR
    contact_person IS NOT NULL OR
    user_id IS NOT NULL OR
    owner_id IS NOT NULL
);

INSERT INTO menu_item_fields_backup (
    menu_item_id,
    prep_time,
    source_url,
    dietary_tags,
    allergens,
    category_id
)
SELECT 
    id as menu_item_id,
    prep_time,
    source_url,
    dietary_tags,
    allergens,
    category_id
FROM public.menu_items
WHERE 
    prep_time IS NOT NULL OR
    source_url IS NOT NULL OR
    dietary_tags IS NOT NULL OR
    allergens IS NOT NULL OR
    category_id IS NOT NULL;

-- =============================================================================
-- PHASE 2: APPLICATION CODE UPDATE VALIDATION
-- =============================================================================

-- Step 2.1: Create validation queries to ensure no active usage
-- These queries should return 0 results if migration is safe

-- Check for any active references to deprecated vendor fields
SELECT 
    'ACTIVE_VENDOR_FIELD_USAGE' as check_type,
    COUNT(*) as usage_count,
    'Vendors with website' as description
FROM public.users 
WHERE role = 'vendor' AND website IS NOT NULL AND website != ''

UNION ALL

SELECT 
    'ACTIVE_VENDOR_FIELD_USAGE' as check_type,
    COUNT(*) as usage_count,
    'Vendors with revolut_link' as description
FROM public.users 
WHERE role = 'vendor' AND revolut_link IS NOT NULL AND revolut_link != ''

UNION ALL

SELECT 
    'ACTIVE_VENDOR_FIELD_USAGE' as check_type,
    COUNT(*) as usage_count,
    'Vendors with stripe_account_id' as description
FROM public.users 
WHERE role = 'vendor' AND stripe_account_id IS NOT NULL AND stripe_account_id != ''

UNION ALL

SELECT 
    'ACTIVE_VENDOR_FIELD_USAGE' as check_type,
    COUNT(*) as usage_count,
    'Vendors with logo_url' as description
FROM public.users 
WHERE role = 'vendor' AND logo_url IS NOT NULL AND logo_url != ''

UNION ALL

SELECT 
    'ACTIVE_VENDOR_FIELD_USAGE' as check_type,
    COUNT(*) as usage_count,
    'Vendors with description' as description
FROM public.users 
WHERE role = 'vendor' AND description IS NOT NULL AND description != ''

UNION ALL

SELECT 
    'ACTIVE_VENDOR_FIELD_USAGE' as check_type,
    COUNT(*) as usage_count,
    'Vendors with email' as description
FROM public.users 
WHERE role = 'vendor' AND email IS NOT NULL AND email != '';

-- Check for any active references to deprecated menu item fields
SELECT 
    'ACTIVE_MENU_ITEM_FIELD_USAGE' as check_type,
    COUNT(*) as usage_count,
    'Menu items with prep_time' as description
FROM public.menu_items
WHERE prep_time IS NOT NULL

UNION ALL

SELECT 
    'ACTIVE_MENU_ITEM_FIELD_USAGE' as check_type,
    COUNT(*) as usage_count,
    'Menu items with source_url' as description
FROM public.menu_items
WHERE source_url IS NOT NULL AND source_url != ''

UNION ALL

SELECT 
    'ACTIVE_MENU_ITEM_FIELD_USAGE' as check_type,
    COUNT(*) as usage_count,
    'Menu items with dietary_tags' as description
FROM public.menu_items
WHERE dietary_tags IS NOT NULL AND array_length(dietary_tags, 1) > 0

UNION ALL

SELECT 
    'ACTIVE_MENU_ITEM_FIELD_USAGE' as check_type,
    COUNT(*) as usage_count,
    'Menu items with allergens' as description
FROM public.menu_items
WHERE allergens IS NOT NULL AND array_length(allergens, 1) > 0

UNION ALL

SELECT 
    'ACTIVE_MENU_ITEM_FIELD_USAGE' as check_type,
    COUNT(*) as usage_count,
    'Menu items with category_id' as description
FROM public.menu_items
WHERE category_id IS NOT NULL;

-- =============================================================================
-- PHASE 3: GRADUAL COLUMN REMOVAL
-- =============================================================================

-- Step 3.1: Remove vendor payment fields (if safe)
-- Execute these only after confirming no active usage

-- ALTER TABLE public.users DROP COLUMN IF EXISTS website;
-- ALTER TABLE public.users DROP COLUMN IF EXISTS revolut_link;
-- ALTER TABLE public.users DROP COLUMN IF EXISTS revolut_payment_link;
-- ALTER TABLE public.users DROP COLUMN IF EXISTS stripe_account_id;
-- ALTER TABLE public.users DROP COLUMN IF EXISTS stripe_link;

-- Step 3.2: Remove vendor metadata fields (if safe)
-- ALTER TABLE public.users DROP COLUMN IF EXISTS logo_url;
-- ALTER TABLE public.users DROP COLUMN IF EXISTS description;
-- ALTER TABLE public.users DROP COLUMN IF EXISTS category;
-- ALTER TABLE public.users DROP COLUMN IF EXISTS opening_hours;
-- ALTER TABLE public.users DROP COLUMN IF EXISTS current_wait_time;

-- Step 3.3: Remove vendor location fields (if safe)
-- ALTER TABLE public.users DROP COLUMN IF EXISTS location_geo;
-- ALTER TABLE public.users DROP COLUMN IF EXISTS location_text;

-- Step 3.4: Remove vendor contact fields (if safe)
-- ALTER TABLE public.users DROP COLUMN IF EXISTS email;
-- ALTER TABLE public.users DROP COLUMN IF EXISTS contact_person;

-- Step 3.5: Remove vendor relationship fields (if safe)
-- ALTER TABLE public.users DROP COLUMN IF EXISTS user_id;
-- ALTER TABLE public.users DROP COLUMN IF EXISTS owner_id;

-- Step 3.6: Remove menu item deprecated fields (if safe)
-- ALTER TABLE public.menu_items DROP COLUMN IF EXISTS prep_time;
-- ALTER TABLE public.menu_items DROP COLUMN IF EXISTS source_url;
-- ALTER TABLE public.menu_items DROP COLUMN IF EXISTS dietary_tags;
-- ALTER TABLE public.menu_items DROP COLUMN IF EXISTS allergens;
-- ALTER TABLE public.menu_items DROP COLUMN IF EXISTS category_id;

-- =============================================================================
-- PHASE 4: INDEX AND CONSTRAINT CLEANUP
-- =============================================================================

-- Step 4.1: Remove indexes on deprecated columns
-- These commands should be executed after column removal

-- Example index removal (adjust based on actual index names):
-- DROP INDEX IF EXISTS idx_users_website;
-- DROP INDEX IF EXISTS idx_users_revolut_link;
-- DROP INDEX IF EXISTS idx_users_stripe_account_id;
-- DROP INDEX IF EXISTS idx_users_logo_url;
-- DROP INDEX IF EXISTS idx_users_description;
-- DROP INDEX IF EXISTS idx_users_category;
-- DROP INDEX IF EXISTS idx_users_opening_hours;
-- DROP INDEX IF EXISTS idx_users_current_wait_time;
-- DROP INDEX IF EXISTS idx_users_location_geo;
-- DROP INDEX IF EXISTS idx_users_location_text;
-- DROP INDEX IF EXISTS idx_users_email;
-- DROP INDEX IF EXISTS idx_users_contact_person;
-- DROP INDEX IF EXISTS idx_users_user_id;
-- DROP INDEX IF EXISTS idx_users_owner_id;

-- DROP INDEX IF EXISTS idx_menu_items_prep_time;
-- DROP INDEX IF EXISTS idx_menu_items_source_url;
-- DROP INDEX IF EXISTS idx_menu_items_dietary_tags;
-- DROP INDEX IF EXISTS idx_menu_items_allergens;
-- DROP INDEX IF EXISTS idx_menu_items_category_id;

-- Step 4.2: Update foreign key constraints
-- Remove any foreign key constraints that reference deprecated fields

-- Example foreign key removal:
-- ALTER TABLE public.users DROP CONSTRAINT IF EXISTS fk_users_user_id;
-- ALTER TABLE public.users DROP CONSTRAINT IF EXISTS fk_users_owner_id;
-- ALTER TABLE public.menu_items DROP CONSTRAINT IF EXISTS fk_menu_items_category_id;

-- =============================================================================
-- PHASE 5: TRIGGER AND FUNCTION CLEANUP
-- =============================================================================

-- Step 5.1: List triggers that need updating
SELECT 
    'TRIGGERS_TO_UPDATE' as phase,
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table IN ('users', 'menu_items')
AND (
    action_statement LIKE '%website%' OR
    action_statement LIKE '%revolut_link%' OR
    action_statement LIKE '%stripe_account_id%' OR
    action_statement LIKE '%logo_url%' OR
    action_statement LIKE '%description%' OR
    action_statement LIKE '%category%' OR
    action_statement LIKE '%opening_hours%' OR
    action_statement LIKE '%current_wait_time%' OR
    action_statement LIKE '%location_geo%' OR
    action_statement LIKE '%location_text%' OR
    action_statement LIKE '%email%' OR
    action_statement LIKE '%contact_person%' OR
    action_statement LIKE '%user_id%' OR
    action_statement LIKE '%owner_id%' OR
    action_statement LIKE '%prep_time%' OR
    action_statement LIKE '%source_url%' OR
    action_statement LIKE '%dietary_tags%' OR
    action_statement LIKE '%allergens%' OR
    action_statement LIKE '%category_id%'
);

-- Step 5.2: List functions that need updating
SELECT 
    'FUNCTIONS_TO_UPDATE' as phase,
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND (
    routine_definition LIKE '%website%' OR
    routine_definition LIKE '%revolut_link%' OR
    routine_definition LIKE '%stripe_account_id%' OR
    routine_definition LIKE '%logo_url%' OR
    routine_definition LIKE '%description%' OR
    routine_definition LIKE '%category%' OR
    routine_definition LIKE '%opening_hours%' OR
    routine_definition LIKE '%current_wait_time%' OR
    routine_definition LIKE '%location_geo%' OR
    routine_definition LIKE '%location_text%' OR
    routine_definition LIKE '%email%' OR
    routine_definition LIKE '%contact_person%' OR
    routine_definition LIKE '%user_id%' OR
    routine_definition LIKE '%owner_id%' OR
    routine_definition LIKE '%prep_time%' OR
    routine_definition LIKE '%source_url%' OR
    routine_definition LIKE '%dietary_tags%' OR
    routine_definition LIKE '%allergens%' OR
    routine_definition LIKE '%category_id%'
);

-- =============================================================================
-- PHASE 6: VERIFICATION AND ROLLBACK PLAN
-- =============================================================================

-- Step 6.1: Verification queries after migration
SELECT 
    'POST_MIGRATION_VERIFICATION' as phase,
    'Vendor table structure' as check_type,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'

UNION ALL

SELECT 
    'POST_MIGRATION_VERIFICATION' as phase,
    'Menu items table structure' as check_type,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'menu_items' AND table_schema = 'public'

UNION ALL

SELECT 
    'POST_MIGRATION_VERIFICATION' as phase,
    'Vendor count' as check_type,
    COUNT(*) as record_count
FROM public.users 
WHERE role = 'vendor'

UNION ALL

SELECT 
    'POST_MIGRATION_VERIFICATION' as phase,
    'Menu items count' as check_type,
    COUNT(*) as record_count
FROM public.menu_items;

-- Step 6.2: Rollback verification
SELECT 
    'ROLLBACK_VERIFICATION' as phase,
    'Backup vendor records' as check_type,
    COUNT(*) as backup_count
FROM vendor_fields_backup

UNION ALL

SELECT 
    'ROLLBACK_VERIFICATION' as phase,
    'Backup menu item records' as check_type,
    COUNT(*) as backup_count
FROM menu_item_fields_backup;

-- =============================================================================
-- ROLLBACK PROCEDURE (if needed)
-- =============================================================================

-- If rollback is needed, execute these commands in reverse order:

-- Step R1: Restore vendor fields
/*
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS revolut_link TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS revolut_payment_link TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stripe_link TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS opening_hours TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS current_wait_time INTEGER;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS location_geo GEOGRAPHY(POINT);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS location_text TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS contact_person TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS owner_id UUID;
*/

-- Step R2: Restore menu item fields
/*
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS prep_time INTEGER;
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS dietary_tags TEXT[];
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS allergens TEXT[];
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS category_id UUID;
*/

-- Step R3: Restore data from backup
/*
UPDATE public.users 
SET 
    website = vfb.website,
    revolut_link = vfb.revolut_link,
    revolut_payment_link = vfb.revolut_payment_link,
    stripe_account_id = vfb.stripe_account_id,
    stripe_link = vfb.stripe_link,
    logo_url = vfb.logo_url,
    description = vfb.description,
    category = vfb.category,
    opening_hours = vfb.opening_hours,
    current_wait_time = vfb.current_wait_time,
    location_geo = vfb.location_geo,
    location_text = vfb.location_text,
    email = vfb.email,
    contact_person = vfb.contact_person,
    user_id = vfb.user_id,
    owner_id = vfb.owner_id
FROM vendor_fields_backup vfb
WHERE public.users.id = vfb.vendor_id;

UPDATE public.menu_items 
SET 
    prep_time = mifb.prep_time,
    source_url = mifb.source_url,
    dietary_tags = mifb.dietary_tags,
    allergens = mifb.allergens,
    category_id = mifb.category_id
FROM menu_item_fields_backup mifb
WHERE public.menu_items.id = mifb.menu_item_id;
*/

-- =============================================================================
-- MIGRATION CHECKLIST
-- =============================================================================

/*
MIGRATION CHECKLIST:

□ Phase 1: Data Archival
  □ Create backup tables
  □ Archive current data
  □ Verify backup integrity

□ Phase 2: Application Code Update
  □ Update frontend components
  □ Update backend API endpoints
  □ Update TypeScript interfaces
  □ Update Edge Functions
  □ Update AI agents

□ Phase 3: Database Migration
  □ Run analysis queries
  □ Verify no active usage
  □ Remove columns gradually
  □ Test after each removal

□ Phase 4: Cleanup
  □ Remove indexes
  □ Update constraints
  □ Update triggers
  □ Update functions

□ Phase 5: Verification
  □ Run post-migration tests
  □ Verify data integrity
  □ Test all functionality
  □ Monitor for errors

□ Phase 6: Documentation
  □ Update API documentation
  □ Update database schema docs
  □ Update deployment guides
  □ Archive migration logs
*/ 
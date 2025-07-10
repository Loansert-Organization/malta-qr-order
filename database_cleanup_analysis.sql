-- =============================================================================
-- DATABASE CLEANUP ANALYSIS FOR MALTA QR ORDER SYSTEM
-- =============================================================================
-- This script analyzes current usage patterns and validates migration safety
-- for removing deprecated fields from vendors (users table) and menu_items tables

-- =============================================================================
-- 1. VENDOR TABLE ANALYSIS (users table where role='vendor')
-- =============================================================================

-- Check current vendor count and active status
SELECT 
    'VENDOR_COUNT_ANALYSIS' as analysis_type,
    COUNT(*) as total_vendors,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_vendors,
    COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_vendors,
    COUNT(CASE WHEN is_onboarded = true THEN 1 END) as onboarded_vendors
FROM public.users 
WHERE role = 'vendor';

-- Analyze deprecated vendor fields usage
SELECT 
    'DEPRECATED_VENDOR_FIELDS_ANALYSIS' as analysis_type,
    'Payment Fields' as field_category,
    COUNT(CASE WHEN website IS NOT NULL AND website != '' THEN 1 END) as website_count,
    COUNT(CASE WHEN revolut_link IS NOT NULL AND revolut_link != '' THEN 1 END) as revolut_link_count,
    COUNT(CASE WHEN revolut_payment_link IS NOT NULL AND revolut_payment_link != '' THEN 1 END) as revolut_payment_link_count,
    COUNT(CASE WHEN stripe_account_id IS NOT NULL AND stripe_account_id != '' THEN 1 END) as stripe_account_id_count,
    COUNT(CASE WHEN stripe_link IS NOT NULL AND stripe_link != '' THEN 1 END) as stripe_link_count
FROM public.users 
WHERE role = 'vendor'

UNION ALL

SELECT 
    'DEPRECATED_VENDOR_FIELDS_ANALYSIS' as analysis_type,
    'Metadata Fields' as field_category,
    COUNT(CASE WHEN logo_url IS NOT NULL AND logo_url != '' THEN 1 END) as logo_url_count,
    COUNT(CASE WHEN description IS NOT NULL AND description != '' THEN 1 END) as description_count,
    COUNT(CASE WHEN category IS NOT NULL AND category != '' THEN 1 END) as category_count,
    COUNT(CASE WHEN opening_hours IS NOT NULL AND opening_hours != '' THEN 1 END) as opening_hours_count,
    COUNT(CASE WHEN current_wait_time IS NOT NULL THEN 1 END) as current_wait_time_count
FROM public.users 
WHERE role = 'vendor'

UNION ALL

SELECT 
    'DEPRECATED_VENDOR_FIELDS_ANALYSIS' as analysis_type,
    'Location Fields' as field_category,
    COUNT(CASE WHEN location_geo IS NOT NULL THEN 1 END) as location_geo_count,
    COUNT(CASE WHEN location_text IS NOT NULL AND location_text != '' THEN 1 END) as location_text_count,
    0 as placeholder1,
    0 as placeholder2,
    0 as placeholder3
FROM public.users 
WHERE role = 'vendor'

UNION ALL

SELECT 
    'DEPRECATED_VENDOR_FIELDS_ANALYSIS' as analysis_type,
    'Contact Fields' as field_category,
    COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as email_count,
    COUNT(CASE WHEN contact_person IS NOT NULL AND contact_person != '' THEN 1 END) as contact_person_count,
    0 as placeholder1,
    0 as placeholder2,
    0 as placeholder3
FROM public.users 
WHERE role = 'vendor'

UNION ALL

SELECT 
    'DEPRECATED_VENDOR_FIELDS_ANALYSIS' as analysis_type,
    'Relationship Fields' as field_category,
    COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as user_id_count,
    COUNT(CASE WHEN owner_id IS NOT NULL THEN 1 END) as owner_id_count,
    0 as placeholder1,
    0 as placeholder2,
    0 as placeholder3
FROM public.users 
WHERE role = 'vendor';

-- Check for any vendors that heavily use deprecated fields
SELECT 
    'HIGH_USAGE_VENDORS' as analysis_type,
    id,
    name,
    business_name,
    CASE WHEN website IS NOT NULL AND website != '' THEN 'YES' ELSE 'NO' END as has_website,
    CASE WHEN revolut_link IS NOT NULL AND revolut_link != '' THEN 'YES' ELSE 'NO' END as has_revolut,
    CASE WHEN stripe_account_id IS NOT NULL AND stripe_account_id != '' THEN 'YES' ELSE 'NO' END as has_stripe,
    CASE WHEN logo_url IS NOT NULL AND logo_url != '' THEN 'YES' ELSE 'NO' END as has_logo,
    CASE WHEN description IS NOT NULL AND description != '' THEN 'YES' ELSE 'NO' END as has_description,
    CASE WHEN email IS NOT NULL AND email != '' THEN 'YES' ELSE 'NO' END as has_email
FROM public.users 
WHERE role = 'vendor'
AND (
    (website IS NOT NULL AND website != '') OR
    (revolut_link IS NOT NULL AND revolut_link != '') OR
    (stripe_account_id IS NOT NULL AND stripe_account_id != '') OR
    (logo_url IS NOT NULL AND logo_url != '') OR
    (description IS NOT NULL AND description != '') OR
    (email IS NOT NULL AND email != '')
)
ORDER BY name;

-- =============================================================================
-- 2. MENU_ITEMS TABLE ANALYSIS
-- =============================================================================

-- Check current menu items count and distribution
SELECT 
    'MENU_ITEMS_COUNT_ANALYSIS' as analysis_type,
    COUNT(*) as total_menu_items,
    COUNT(CASE WHEN available = true THEN 1 END) as available_items,
    COUNT(CASE WHEN available = false THEN 1 END) as unavailable_items,
    COUNT(CASE WHEN popular = true THEN 1 END) as popular_items,
    COUNT(CASE WHEN featured = true THEN 1 END) as featured_items
FROM public.menu_items;

-- Analyze deprecated menu item fields usage
SELECT 
    'DEPRECATED_MENU_ITEM_FIELDS_ANALYSIS' as analysis_type,
    COUNT(CASE WHEN prep_time IS NOT NULL THEN 1 END) as prep_time_count,
    COUNT(CASE WHEN source_url IS NOT NULL AND source_url != '' THEN 1 END) as source_url_count,
    COUNT(CASE WHEN dietary_tags IS NOT NULL AND array_length(dietary_tags, 1) > 0 THEN 1 END) as dietary_tags_count,
    COUNT(CASE WHEN allergens IS NOT NULL AND array_length(allergens, 1) > 0 THEN 1 END) as allergens_count,
    COUNT(CASE WHEN category_id IS NOT NULL THEN 1 END) as category_id_count
FROM public.menu_items;

-- Check for menu items that heavily use deprecated fields
SELECT 
    'HIGH_USAGE_MENU_ITEMS' as analysis_type,
    id,
    name,
    bar_id,
    CASE WHEN prep_time IS NOT NULL THEN 'YES' ELSE 'NO' END as has_prep_time,
    CASE WHEN source_url IS NOT NULL AND source_url != '' THEN 'YES' ELSE 'NO' END as has_source_url,
    CASE WHEN dietary_tags IS NOT NULL AND array_length(dietary_tags, 1) > 0 THEN 'YES' ELSE 'NO' END as has_dietary_tags,
    CASE WHEN allergens IS NOT NULL AND array_length(allergens, 1) > 0 THEN 'YES' ELSE 'NO' END as has_allergens,
    CASE WHEN category_id IS NOT NULL THEN 'YES' ELSE 'NO' END as has_category_id
FROM public.menu_items
WHERE 
    prep_time IS NOT NULL OR
    (source_url IS NOT NULL AND source_url != '') OR
    (dietary_tags IS NOT NULL AND array_length(dietary_tags, 1) > 0) OR
    (allergens IS NOT NULL AND array_length(allergens, 1) > 0) OR
    category_id IS NOT NULL
ORDER BY name
LIMIT 20;

-- =============================================================================
-- 3. FOREIGN KEY RELATIONSHIP ANALYSIS
-- =============================================================================

-- Check for foreign key dependencies on deprecated fields
SELECT 
    'FOREIGN_KEY_ANALYSIS' as analysis_type,
    'menu_items.category_id' as field_name,
    COUNT(*) as dependent_records
FROM public.menu_items 
WHERE category_id IS NOT NULL

UNION ALL

SELECT 
    'FOREIGN_KEY_ANALYSIS' as analysis_type,
    'users.user_id' as field_name,
    COUNT(*) as dependent_records
FROM public.users 
WHERE role = 'vendor' AND user_id IS NOT NULL

UNION ALL

SELECT 
    'FOREIGN_KEY_ANALYSIS' as analysis_type,
    'users.owner_id' as field_name,
    COUNT(*) as dependent_records
FROM public.users 
WHERE role = 'vendor' AND owner_id IS NOT NULL;

-- =============================================================================
-- 4. INDEX USAGE ANALYSIS
-- =============================================================================

-- Check for indexes on deprecated columns
SELECT 
    'INDEX_ANALYSIS' as analysis_type,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('users', 'menu_items')
AND (
    indexdef LIKE '%website%' OR
    indexdef LIKE '%revolut_link%' OR
    indexdef LIKE '%stripe_account_id%' OR
    indexdef LIKE '%logo_url%' OR
    indexdef LIKE '%description%' OR
    indexdef LIKE '%category%' OR
    indexdef LIKE '%opening_hours%' OR
    indexdef LIKE '%current_wait_time%' OR
    indexdef LIKE '%location_geo%' OR
    indexdef LIKE '%location_text%' OR
    indexdef LIKE '%email%' OR
    indexdef LIKE '%contact_person%' OR
    indexdef LIKE '%user_id%' OR
    indexdef LIKE '%owner_id%' OR
    indexdef LIKE '%prep_time%' OR
    indexdef LIKE '%source_url%' OR
    indexdef LIKE '%dietary_tags%' OR
    indexdef LIKE '%allergens%' OR
    indexdef LIKE '%category_id%'
);

-- =============================================================================
-- 5. TRIGGER AND FUNCTION ANALYSIS
-- =============================================================================

-- Check for triggers that reference deprecated fields
SELECT 
    'TRIGGER_ANALYSIS' as analysis_type,
    trigger_name,
    event_manipulation,
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

-- =============================================================================
-- 6. DATA INTEGRITY VALIDATION
-- =============================================================================

-- Check for data integrity issues
SELECT 
    'DATA_INTEGRITY_CHECK' as analysis_type,
    'Vendors without essential fields' as check_type,
    COUNT(*) as issue_count
FROM public.users 
WHERE role = 'vendor' 
AND (name IS NULL OR name = '' OR business_name IS NULL OR business_name = '')

UNION ALL

SELECT 
    'DATA_INTEGRITY_CHECK' as analysis_type,
    'Menu items without essential fields' as check_type,
    COUNT(*) as issue_count
FROM public.menu_items
WHERE name IS NULL OR name = '' OR price IS NULL OR price <= 0

UNION ALL

SELECT 
    'DATA_INTEGRITY_CHECK' as analysis_type,
    'Orphaned menu items' as check_type,
    COUNT(*) as issue_count
FROM public.menu_items mi
LEFT JOIN public.bars b ON mi.bar_id = b.id
WHERE b.id IS NULL;

-- =============================================================================
-- 7. MIGRATION SAFETY ASSESSMENT
-- =============================================================================

-- Calculate migration safety score
WITH vendor_usage AS (
    SELECT 
        COUNT(*) as total_vendors,
        COUNT(CASE WHEN website IS NOT NULL AND website != '' THEN 1 END) as website_users,
        COUNT(CASE WHEN revolut_link IS NOT NULL AND revolut_link != '' THEN 1 END) as revolut_users,
        COUNT(CASE WHEN stripe_account_id IS NOT NULL AND stripe_account_id != '' THEN 1 END) as stripe_users,
        COUNT(CASE WHEN logo_url IS NOT NULL AND logo_url != '' THEN 1 END) as logo_users,
        COUNT(CASE WHEN description IS NOT NULL AND description != '' THEN 1 END) as description_users,
        COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as email_users
    FROM public.users 
    WHERE role = 'vendor'
),
menu_usage AS (
    SELECT 
        COUNT(*) as total_menu_items,
        COUNT(CASE WHEN prep_time IS NOT NULL THEN 1 END) as prep_time_items,
        COUNT(CASE WHEN source_url IS NOT NULL AND source_url != '' THEN 1 END) as source_url_items,
        COUNT(CASE WHEN dietary_tags IS NOT NULL AND array_length(dietary_tags, 1) > 0 THEN 1 END) as dietary_tags_items,
        COUNT(CASE WHEN allergens IS NOT NULL AND array_length(allergens, 1) > 0 THEN 1 END) as allergens_items,
        COUNT(CASE WHEN category_id IS NOT NULL THEN 1 END) as category_id_items
    FROM public.menu_items
)
SELECT 
    'MIGRATION_SAFETY_ASSESSMENT' as analysis_type,
    v.total_vendors,
    v.website_users,
    v.revolut_users,
    v.stripe_users,
    v.logo_users,
    v.description_users,
    v.email_users,
    m.total_menu_items,
    m.prep_time_items,
    m.source_url_items,
    m.dietary_tags_items,
    m.allergens_items,
    m.category_id_items,
    CASE 
        WHEN v.website_users = 0 AND v.revolut_users = 0 AND v.stripe_users = 0 
             AND v.logo_users = 0 AND v.description_users = 0 AND v.email_users = 0
             AND m.prep_time_items = 0 AND m.source_url_items = 0 
             AND m.dietary_tags_items = 0 AND m.allergens_items = 0 AND m.category_id_items = 0
        THEN 'SAFE - No deprecated fields in use'
        WHEN v.website_users <= 5 AND v.revolut_users <= 5 AND v.stripe_users <= 5 
             AND v.logo_users <= 5 AND v.description_users <= 5 AND v.email_users <= 5
             AND m.prep_time_items <= 10 AND m.source_url_items <= 10 
             AND m.dietary_tags_items <= 10 AND m.allergens_items <= 10 AND m.category_id_items <= 10
        THEN 'LOW_RISK - Minimal usage of deprecated fields'
        ELSE 'HIGH_RISK - Significant usage of deprecated fields'
    END as migration_risk_level
FROM vendor_usage v, menu_usage m;

-- =============================================================================
-- 8. RECOMMENDATIONS
-- =============================================================================

SELECT 
    'MIGRATION_RECOMMENDATIONS' as analysis_type,
    'Phase 1: Archive all data before removal' as recommendation,
    'Create backup tables for all deprecated fields' as action,
    'HIGH' as priority

UNION ALL

SELECT 
    'MIGRATION_RECOMMENDATIONS' as analysis_type,
    'Phase 2: Update application code' as recommendation,
    'Remove all references to deprecated fields in frontend and backend' as action,
    'HIGH' as priority

UNION ALL

SELECT 
    'MIGRATION_RECOMMENDATIONS' as analysis_type,
    'Phase 3: Remove columns gradually' as recommendation,
    'Remove one field at a time, testing after each removal' as action,
    'MEDIUM' as priority

UNION ALL

SELECT 
    'MIGRATION_RECOMMENDATIONS' as analysis_type,
    'Phase 4: Update indexes and constraints' as recommendation,
    'Remove indexes on deprecated columns and update foreign keys' as action,
    'MEDIUM' as priority

UNION ALL

SELECT 
    'MIGRATION_RECOMMENDATIONS' as analysis_type,
    'Phase 5: Clean up triggers and functions' as recommendation,
    'Update or remove triggers/functions that reference deprecated fields' as action,
    'LOW' as priority

UNION ALL

SELECT 
    'MIGRATION_RECOMMENDATIONS' as analysis_type,
    'Phase 6: Comprehensive testing' as recommendation,
    'Test all functionality with simplified schema' as action,
    'HIGH' as priority; 
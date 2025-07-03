# Menu Visibility Issue Summary

## Root Cause Identified

The menus are not appearing in the client app due to a **column name mismatch**:

### Issue 1: Wrong Column Name in Client Code ✅ FIXED
- **Client app** (MenuPageEnhanced.tsx) was querying for `is_available`
- **Database schema** actually has column named `available`
- **Fix Applied**: Changed `.eq('is_available', true)` to `.eq('available', true)` in MenuPageEnhanced.tsx

### Issue 2: Bar Has Menu Flag (Need to Set)
- Bars need `has_menu = true` for menu indicator to show
- Note: `is_active` column doesn't exist in the base bars table schema

## Actions Taken

1. **Fixed the client code** to use correct column name `available` instead of `is_available`
2. **Created SQL script** to ensure bars are active:

```sql
UPDATE public.bars 
SET has_menu = true
WHERE name IN (
    'The Londoner Pub Sliema', 
    'Mamma Mia Restaurant', 
    'The Brew Grill & Brewery'
);
```

## Next Steps

1. **Test the client app** - The menus should now appear when visiting the bar pages
2. **Run the SQL update** to ensure bars are active if they're not showing in the bar list
3. **Verify RLS policies** - The menu_items table should allow public read access

## How to Test

1. Visit `/client` in your app
2. Search for one of the bars: "The Londoner", "Mamma Mia", or "The Brew"
3. Click on the bar to view its menu
4. Menu items should now be visible

## Database Schema Reference

The correct `menu_items` table columns are:
- `bar_id` (UUID) - links to bars table
- `menu_id` (UUID) - links to menus table  
- `name` (string)
- `description` (string)
- `price` (number)
- `category` (string)
- `subcategory` (string)
- `available` (boolean) - NOT `is_available`! 
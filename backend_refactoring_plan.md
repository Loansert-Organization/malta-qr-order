# Backend Refactoring Plan - Malta QR Order System

## Overview
This document outlines the comprehensive backend refactoring required to remove deprecated fields from the Malta QR Order system. The refactoring focuses on Edge Functions, API endpoints, and backend services.

## Phase 1: Edge Functions Refactoring

### 1.1 Functions Requiring Updates

#### High Priority (Core Business Logic)
- `ai-waiter-chat/index.ts` - Remove `dietary_tags` and `allergens` references
- `ai-sommelier/index.ts` - Remove `description` and `tags` references  
- `vendor-analytics/index.ts` - Remove `category` references
- `embed-menu-items/index.ts` - Remove `dietary_tags` and `allergens` references
- `ai-insights-generator/index.ts` - Remove `description` references

#### Medium Priority (Data Processing)
- `extract-menu-items/index.ts` - Remove `source_url` and `description` references
- `upload-menu-data/index.ts` - Remove `description` references
- `bulk-populate-malta-bars/index.ts` - Remove `website_url` references
- `fetch-bars-from-google-maps/index.ts` - Remove `website_url` references
- `health-check-bars/index.ts` - Remove `website_url` references

#### Low Priority (Utilities)
- `generate-poster/index.ts` - Remove `description` references
- `fix-image-urls/index.ts` - Remove `website_url` references
- `fetch-multiple-photos-enhanced/index.ts` - Remove `website_url` references

### 1.2 Specific Changes Required

#### AI Waiter Chat Function
```typescript
// BEFORE
.select(`
  id, name, description, price, category, dietary_tags, available,
  menus!inner(vendor_id)
`)

// AFTER  
.select(`
  id, name, price, category, available,
  menus!inner(vendor_id)
`)
```

#### AI Sommelier Function
```typescript
// BEFORE
`${item.name} (${item.menu_categories?.name}) - ${item.price_local} RWF - ${item.description || 'No description'} - Tags: ${item.tags?.join(', ') || 'none'}`

// AFTER
`${item.name} (${item.menu_categories?.name}) - ${item.price_local} RWF`
```

#### Vendor Analytics Function
```typescript
// BEFORE
.select('business_name, category')

// AFTER
.select('business_name')
```

#### Embed Menu Items Function
```typescript
// BEFORE
.select('id, name, description, category, price, dietary_tags, allergens')

// AFTER
.select('id, name, category, price')
```

### 1.3 Data Migration Functions

#### Functions to Update or Remove
- `bulk-populate-malta-bars/index.ts` - Update to not use `website_url`
- `fetch-bars-from-google-maps/index.ts` - Update to not use `website_url`
- `health-check-bars/index.ts` - Update to not use `website_url`
- `fix-image-urls/index.ts` - Update to not use `website_url`

## Phase 2: API Service Updates

### 2.1 Menu Service Refactoring

#### Current Issues
- References to `prep_time`, `source_url`, `dietary_tags`, `allergens`, `category_id`
- Complex filtering logic using deprecated fields

#### Required Changes
```typescript
// src/services/menuService.ts

// BEFORE
async getMenuItems(vendorId: string, category?: string): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('vendor_id', vendorId)
    .eq('available', true)
    .order('category')
    .order('name');
}

// AFTER
async getMenuItems(vendorId: string, category?: string): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('id, name, price, category, available, image_url')
    .eq('vendor_id', vendorId)
    .eq('available', true)
    .order('category')
    .order('name');
}
```

### 2.2 Vendor Service Refactoring

#### Current Issues
- References to `website`, `revolut_link`, `stripe_account_id`, `logo_url`, `description`, `email`
- Complex vendor data fetching with deprecated fields

#### Required Changes
```typescript
// src/services/vendorService.ts

// BEFORE
async getVendor(vendorId: string): Promise<Vendor> {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', vendorId)
    .single();
}

// AFTER
async getVendor(vendorId: string): Promise<Vendor> {
  const { data, error } = await supabase
    .from('vendors')
    .select('id, name, business_name, slug, is_active, is_onboarded, created_at, updated_at')
    .eq('id', vendorId)
    .single();
}
```

## Phase 3: Database Query Updates

### 3.1 Supabase Client Updates

#### Frontend Query Updates
```typescript
// BEFORE - Vendor queries
const { data: vendor } = await supabase
  .from('vendors')
  .select('name, location, description')
  .eq('id', vendor_id)
  .single();

// AFTER - Vendor queries
const { data: vendor } = await supabase
  .from('vendors')
  .select('name, business_name')
  .eq('id', vendor_id)
  .single();
```

#### Menu Item Query Updates
```typescript
// BEFORE - Menu item queries
const { data: menuItems } = await supabase
  .from('menu_items')
  .select('name, category, price, popular, available, prep_time, dietary_tags, allergens')

// AFTER - Menu item queries
const { data: menuItems } = await supabase
  .from('menu_items')
  .select('name, category, price, popular, available')
```

### 3.2 Hook Updates

#### useVendorData Hook
```typescript
// src/hooks/useOrderDemo/useVendorData.ts

// BEFORE
const { data: vendorData, error: vendorError } = await supabase
  .from('vendors')
  .select('*')
  .eq('slug', slug)
  .eq('active', true)
  .maybeSingle();

// AFTER
const { data: vendorData, error: vendorError } = await supabase
  .from('vendors')
  .select('id, name, business_name, slug, is_active, is_onboarded')
  .eq('slug', slug)
  .eq('is_active', true)
  .maybeSingle();
```

## Phase 4: Type Definition Updates

### 4.1 API Types Refactoring

#### Vendor Interface
```typescript
// src/types/api.ts

// BEFORE
export interface Vendor {
  id: string;
  name: string;
  business_name: string;
  slug: string;
  website?: string;
  revolut_link?: string;
  revolut_payment_link?: string;
  stripe_account_id?: string;
  stripe_link?: string;
  logo_url?: string;
  description?: string;
  category?: string;
  opening_hours?: string;
  current_wait_time?: number;
  location_geo?: any;
  location_text?: string;
  email?: string;
  contact_person?: string;
  user_id?: string;
  owner_id?: string;
  is_active: boolean;
  is_onboarded: boolean;
  created_at: string;
  updated_at: string;
}

// AFTER
export interface Vendor {
  id: string;
  name: string;
  business_name: string;
  slug: string;
  is_active: boolean;
  is_onboarded: boolean;
  created_at: string;
  updated_at: string;
}
```

#### Menu Item Interface
```typescript
// BEFORE
export interface MenuItem {
  id: string;
  menu_id: string;
  category_id?: string | null;
  name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  category?: string | null;
  available: boolean;
  popular: boolean;
  featured: boolean;
  prep_time?: string | null;
  dietary_tags?: string[];
  allergens?: string[];
  nutritional_info?: NutritionalInfo;
  customization_options?: CustomizationOption[];
  bar_id?: string | null;
  source_url?: string | null;
  inventory_count?: number | null;
  calories?: number | null;
  spice_level?: 1 | 2 | 3 | 4 | 5;
  created_at: string;
  updated_at: string;
}

// AFTER
export interface MenuItem {
  id: string;
  menu_id: string;
  name: string;
  price: number;
  image_url?: string | null;
  category?: string | null;
  available: boolean;
  popular: boolean;
  featured: boolean;
  nutritional_info?: NutritionalInfo;
  customization_options?: CustomizationOption[];
  bar_id?: string | null;
  inventory_count?: number | null;
  calories?: number | null;
  spice_level?: 1 | 2 | 3 | 4 | 5;
  created_at: string;
  updated_at: string;
}
```

## Phase 5: Migration Strategy

### 5.1 Deployment Order
1. **Update Type Definitions** - Ensure all interfaces are updated first
2. **Update Edge Functions** - Deploy updated functions one by one
3. **Update Frontend Services** - Update service layer queries
4. **Update Frontend Components** - Remove deprecated field usage
5. **Database Migration** - Execute column removal scripts
6. **Cleanup** - Remove unused code and functions

### 5.2 Testing Strategy
1. **Unit Tests** - Test each updated function individually
2. **Integration Tests** - Test API endpoints with updated schemas
3. **End-to-End Tests** - Test complete user workflows
4. **Rollback Plan** - Ensure ability to revert changes if needed

### 5.3 Monitoring
1. **Error Monitoring** - Watch for any broken references
2. **Performance Monitoring** - Ensure queries remain efficient
3. **User Feedback** - Monitor for any user-reported issues

## Phase 6: Cleanup Tasks

### 6.1 Code Cleanup
- Remove unused imports and variables
- Update JSDoc comments and documentation
- Remove deprecated function parameters
- Clean up unused utility functions

### 6.2 Documentation Updates
- Update API documentation
- Update deployment guides
- Update developer onboarding docs
- Update database schema documentation

## Implementation Checklist

### Edge Functions
- [ ] Update `ai-waiter-chat/index.ts`
- [ ] Update `ai-sommelier/index.ts`
- [ ] Update `vendor-analytics/index.ts`
- [ ] Update `embed-menu-items/index.ts`
- [ ] Update `ai-insights-generator/index.ts`
- [ ] Update `extract-menu-items/index.ts`
- [ ] Update `upload-menu-data/index.ts`
- [ ] Update `bulk-populate-malta-bars/index.ts`
- [ ] Update `fetch-bars-from-google-maps/index.ts`
- [ ] Update `health-check-bars/index.ts`
- [ ] Update `generate-poster/index.ts`
- [ ] Update `fix-image-urls/index.ts`
- [ ] Update `fetch-multiple-photos-enhanced/index.ts`

### Services
- [ ] Update `menuService.ts`
- [ ] Update `vendorService.ts`
- [ ] Update all hook files
- [ ] Update API client queries

### Types
- [ ] Update `Vendor` interface
- [ ] Update `MenuItem` interface
- [ ] Update related type definitions
- [ ] Remove unused interfaces

### Testing
- [ ] Update unit tests
- [ ] Update integration tests
- [ ] Update E2E tests
- [ ] Test all user workflows

### Documentation
- [ ] Update API docs
- [ ] Update deployment guides
- [ ] Update developer docs
- [ ] Archive migration logs

## Risk Assessment

### High Risk
- AI functions may break if they depend on removed fields
- Analytics may show incomplete data during transition
- User experience may be affected if fields are actively used

### Medium Risk
- Some Edge Functions may need complete rewrites
- Performance may be affected during migration
- Rollback complexity if issues arise

### Low Risk
- Type definition updates are straightforward
- Most deprecated fields appear to be unused
- Database migration is reversible with backups

## Success Criteria

1. **Zero Broken References** - No code references to deprecated fields
2. **Maintained Functionality** - All features work as expected
3. **Improved Performance** - Queries are more efficient
4. **Clean Codebase** - Reduced complexity and maintenance burden
5. **Updated Documentation** - All docs reflect current schema 
// Menu Service for Malta QR Order platform
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { OrderSchema, ValidatedOrder } from '@/lib/security';

// =============================================================================
// MENU SERVICE CONFIGURATION
// =============================================================================

interface MenuServiceConfig {
  enableLogging: boolean;
  cacheTimeout: number;
  retryAttempts: number;
}

const DEFAULT_CONFIG: MenuServiceConfig = {
  enableLogging: import.meta.env.DEV,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  retryAttempts: 3,
};

// =============================================================================
// MENU TYPES
// =============================================================================

export interface MenuSyncRequest {
  vendorId: string;
  source: 'file' | 'url' | 'api' | 'manual';
  data?: {
    fileContent?: string;
    url?: string;
    apiEndpoint?: string;
    menuItems?: Array<{
      name: string;
      description?: string;
      price: number;
      category: string;
      image_url?: string;
    }>;
  };
  options?: {
    overwrite?: boolean;
    validateOnly?: boolean;
    dryRun?: boolean;
  };
}

export interface MenuSyncResponse {
  success: boolean;
  syncedItems: number;
  errors: Array<{ item: string; error: string }>;
  warnings: Array<{ item: string; warning: string }>;
  summary: {
    total: number;
    created: number;
    updated: number;
    skipped: number;
    failed: number;
  };
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image_url?: string;
  available: boolean;
  featured: boolean;
  dietary_tags?: string[];
  allergens?: string[];
  prep_time?: string;
  calories?: number;
  spice_level?: 1 | 2 | 3 | 4 | 5;
}

// =============================================================================
// MENU SERVICE CLASS
// =============================================================================

export class MenuService {
  private config: MenuServiceConfig;
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();

  constructor(config: Partial<MenuServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // =============================================================================
  // CORE MENU FUNCTION CALLER
  // =============================================================================

  private async callMenuFunction<T>(
    functionName: string,
    payload: Record<string, unknown>,
    retryCount = 0
  ): Promise<T> {
    try {
      if (this.config.enableLogging) {
        console.log(`🍽️ Calling menu function: ${functionName}`, payload);
      }

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) {
        throw new Error(`Menu function error: ${error.message}`);
      }

      if (this.config.enableLogging) {
        console.log(`✅ Menu function ${functionName} response:`, data);
      }

      return data as T;
    } catch (error) {
      if (retryCount < this.config.retryAttempts) {
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.callMenuFunction(functionName, payload, retryCount + 1);
      }

      console.error(`❌ Menu function ${functionName} failed after ${retryCount + 1} retries:`, error);
      throw error;
    }
  }

  // =============================================================================
  // MENU SYNC OPERATIONS
  // =============================================================================

  async syncMenuData(syncRequest: MenuSyncRequest): Promise<MenuSyncResponse> {
    try {
      const response = await this.callMenuFunction('sync-menu-data', {
        vendor_id: syncRequest.vendorId,
        source: syncRequest.source,
        data: syncRequest.data || {},
        options: syncRequest.options || {},
        timestamp: new Date().toISOString(),
      });

      // Clear cache for this vendor
      this.clearCache(`menu_${syncRequest.vendorId}`);

      return {
        success: response.success || false,
        syncedItems: response.synced_items || 0,
        errors: response.errors || [],
        warnings: response.warnings || [],
        summary: response.summary || {
          total: 0,
          created: 0,
          updated: 0,
          skipped: 0,
          failed: 0,
        },
      };
    } catch (error) {
      console.error('Menu sync failed:', error);
      toast.error('Menu sync failed. Please try again.');
      throw error;
    }
  }

  // =============================================================================
  // MENU DATA OPERATIONS
  // =============================================================================

  async getMenuItems(vendorId: string, category?: string): Promise<MenuItem[]> {
    const cacheKey = `menu_${vendorId}_${category || 'all'}`;
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached as MenuItem[];
    }

    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('vendor_id', vendorId)
        .eq('available', true)
        .order('category')
        .order('name');

      if (error) {
        throw error;
      }

      let items = data || [];
      
      // Filter by category if specified
      if (category) {
        items = items.filter(item => item.category === category);
      }

      // Cache the result
      this.setCache(cacheKey, items);

      return items;
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
      return [];
    }
  }

  async getMenuCategories(vendorId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('category')
        .eq('vendor_id', vendorId)
        .eq('available', true);

      if (error) {
        throw error;
      }

      const categories = [...new Set(data?.map(item => item.category).filter(Boolean))];
      return categories.sort();
    } catch (error) {
      console.error('Failed to fetch menu categories:', error);
      return [];
    }
  }

  async getFeaturedItems(vendorId: string): Promise<MenuItem[]> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('vendor_id', vendorId)
        .eq('featured', true)
        .eq('available', true)
        .order('name');

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch featured items:', error);
      return [];
    }
  }

  // =============================================================================
  // MENU IMPORT OPERATIONS
  // =============================================================================

  async importFromFile(vendorId: string, fileContent: string): Promise<MenuSyncResponse> {
    return this.syncMenuData({
      vendorId,
      source: 'file',
      data: { fileContent },
    });
  }

  async importFromUrl(vendorId: string, url: string): Promise<MenuSyncResponse> {
    return this.syncMenuData({
      vendorId,
      source: 'url',
      data: { url },
    });
  }

  async importFromAPI(vendorId: string, apiEndpoint: string): Promise<MenuSyncResponse> {
    return this.syncMenuData({
      vendorId,
      source: 'api',
      data: { apiEndpoint },
    });
  }

  async importManual(vendorId: string, menuItems: MenuItem[]): Promise<MenuSyncResponse> {
    return this.syncMenuData({
      vendorId,
      source: 'manual',
      data: { menuItems },
    });
  }

  // =============================================================================
  // MENU EXTRACTION OPERATIONS
  // =============================================================================

  async extractMenuFromWolt(vendorId: string, woltUrl: string): Promise<MenuSyncResponse> {
    try {
      const response = await this.callMenuFunction('wolt-menu-extractor', {
        vendor_id: vendorId,
        wolt_url: woltUrl,
        timestamp: new Date().toISOString(),
      });

      return {
        success: response.success || false,
        syncedItems: response.extracted_items || 0,
        errors: response.errors || [],
        warnings: response.warnings || [],
        summary: response.summary || {
          total: 0,
          created: 0,
          updated: 0,
          skipped: 0,
          failed: 0,
        },
      };
    } catch (error) {
      console.error('Wolt menu extraction failed:', error);
      throw error;
    }
  }

  async extractMenuFromImage(vendorId: string, imageUrl: string): Promise<MenuSyncResponse> {
    try {
      const response = await this.callMenuFunction('extract-menu-items', {
        vendor_id: vendorId,
        image_url: imageUrl,
        timestamp: new Date().toISOString(),
      });

      return {
        success: response.success || false,
        syncedItems: response.extracted_items || 0,
        errors: response.errors || [],
        warnings: response.warnings || [],
        summary: response.summary || {
          total: 0,
          created: 0,
          updated: 0,
          skipped: 0,
          failed: 0,
        },
      };
    } catch (error) {
      console.error('Menu image extraction failed:', error);
      throw error;
    }
  }

  // =============================================================================
  // MENU GENERATION OPERATIONS
  // =============================================================================

  async generateHomeFeedMenu(vendorId: string, context?: Record<string, unknown>): Promise<MenuItem[]> {
    try {
      const response = await this.callMenuFunction('generate-home-feed-menu', {
        vendor_id: vendorId,
        context: context || {},
        timestamp: new Date().toISOString(),
      });

      return response.menu_items || [];
    } catch (error) {
      console.error('Failed to generate home feed menu:', error);
      return [];
    }
  }

  async generateMenuImage(vendorId: string, menuItems: MenuItem[]): Promise<string | null> {
    try {
      const response = await this.callMenuFunction('generate-menu-image', {
        vendor_id: vendorId,
        menu_items: menuItems,
        timestamp: new Date().toISOString(),
      });

      return response.image_url || null;
    } catch (error) {
      console.error('Failed to generate menu image:', error);
      return null;
    }
  }

  // =============================================================================
  // CACHE MANAGEMENT
  // =============================================================================

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.config.cacheTimeout;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  private clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  async validateMenuData(menuItems: MenuItem[]): Promise<{
    valid: boolean;
    errors: Array<{ item: string; error: string }>;
  }> {
    const errors: Array<{ item: string; error: string }> = [];

    for (const item of menuItems) {
      if (!item.name || item.name.trim().length === 0) {
        errors.push({ item: item.name || 'Unknown', error: 'Name is required' });
      }

      if (item.price <= 0) {
        errors.push({ item: item.name, error: 'Price must be greater than 0' });
      }

      if (item.name && item.name.length > 100) {
        errors.push({ item: item.name, error: 'Name too long (max 100 characters)' });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  formatPrice(price: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  }

  getSpiceLevelLabel(level: number): string {
    const labels = ['', 'Mild', 'Medium', 'Hot', 'Very Hot', 'Extreme'];
    return labels[level] || '';
  }

  getDietaryTags(): string[] {
    return [
      'Vegetarian',
      'Vegan',
      'Gluten-Free',
      'Dairy-Free',
      'Nut-Free',
      'Halal',
      'Kosher',
      'Organic',
      'Local',
      'Seasonal',
    ];
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const menuService = new MenuService();

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

export const syncMenuData = menuService.syncMenuData.bind(menuService);
export const getMenuItems = menuService.getMenuItems.bind(menuService);
export const getMenuCategories = menuService.getMenuCategories.bind(menuService);
export const getFeaturedItems = menuService.getFeaturedItems.bind(menuService);
export const importFromFile = menuService.importFromFile.bind(menuService);
export const importFromUrl = menuService.importFromUrl.bind(menuService);
export const importFromAPI = menuService.importFromAPI.bind(menuService);
export const importManual = menuService.importManual.bind(menuService); 
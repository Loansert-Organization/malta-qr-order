import { supabase } from '@/integrations/supabase/client';
import Fuse from 'fuse.js';

interface WoltRestaurant {
  name: string;
  slug: string;
  url: string;
}

interface MenuItem {
  item_name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  subcategory: string | null;
}

interface MatchResult {
  input_name: string;
  matched_name: string;
  wolt_url: string;
  match_score: number;
  match_type: 'exact' | 'fuzzy' | 'not_found';
}

export class WoltMenuExtractor {
  private readonly WOLT_BASE_URL = 'https://wolt.com/mt';
  private readonly FUZZY_THRESHOLD = 0.85;
  
  // Normalize restaurant names for better matching
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special chars
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  }

  // Fetch all restaurants from Wolt Malta
  async fetchWoltRestaurants(): Promise<WoltRestaurant[]> {
    console.log('🔍 Fetching Wolt Malta restaurants...');
    
    try {
      // Note: In production, this would use Puppeteer or Playwright
      // For now, we'll simulate with a fetch to avoid CORS issues
      const response = await fetch('/api/wolt-proxy/restaurants');
      const data = await response.json();
      
      return data.restaurants.map((r: any) => ({
        name: r.name,
        slug: r.slug,
        url: `${this.WOLT_BASE_URL}/restaurant/${r.slug}`
      }));
    } catch (error) {
      console.error('Error fetching Wolt restaurants:', error);
      return [];
    }
  }

  // Match input bars with Wolt restaurants using fuzzy matching
  matchBarsWithWolt(inputBars: string[], woltRestaurants: WoltRestaurant[]): Map<string, MatchResult> {
    console.log('🎯 Matching bars with Wolt restaurants...');
    
    const matches = new Map<string, MatchResult>();
    
    // Configure Fuse.js for fuzzy searching
    const fuse = new Fuse(woltRestaurants, {
      keys: ['name'],
      threshold: 0.15, // Lower is more strict
      includeScore: true,
      ignoreLocation: true,
      shouldSort: true
    });

    for (const inputBar of inputBars) {
      const normalizedInput = this.normalizeText(inputBar);
      
      // First check for exact match
      const exactMatch = woltRestaurants.find(
        w => this.normalizeText(w.name) === normalizedInput
      );
      
      if (exactMatch) {
        matches.set(inputBar, {
          input_name: inputBar,
          matched_name: exactMatch.name,
          wolt_url: exactMatch.url,
          match_score: 1.0,
          match_type: 'exact'
        });
        continue;
      }
      
      // Fuzzy search
      const fuzzyResults = fuse.search(inputBar);
      
      if (fuzzyResults.length > 0 && fuzzyResults[0].score! <= (1 - this.FUZZY_THRESHOLD)) {
        const bestMatch = fuzzyResults[0].item;
        matches.set(inputBar, {
          input_name: inputBar,
          matched_name: bestMatch.name,
          wolt_url: bestMatch.url,
          match_score: 1 - fuzzyResults[0].score!,
          match_type: 'fuzzy'
        });
      } else {
        matches.set(inputBar, {
          input_name: inputBar,
          matched_name: '',
          wolt_url: '',
          match_score: 0,
          match_type: 'not_found'
        });
      }
    }
    
    return matches;
  }

  // Extract menu items from a Wolt restaurant page
  async extractMenuItems(restaurantUrl: string): Promise<MenuItem[]> {
    console.log(`📋 Extracting menu from: ${restaurantUrl}`);
    
    try {
      // In production, use Puppeteer/Playwright for dynamic content
      const response = await fetch(`/api/wolt-proxy/menu?url=${encodeURIComponent(restaurantUrl)}`);
      const data = await response.json();
      
      const menuItems: MenuItem[] = [];
      
      // Parse Wolt's menu structure
      for (const category of data.categories || []) {
        for (const item of category.items || []) {
          menuItems.push({
            item_name: item.name,
            description: item.description || null,
            price: item.price / 100, // Wolt stores prices in cents
            image_url: item.image_url || null,
            category: category.name || null,
            subcategory: item.subcategory || null
          });
        }
      }
      
      return menuItems;
    } catch (error) {
      console.error(`Error extracting menu from ${restaurantUrl}:`, error);
      return [];
    }
  }

  // Save matched restaurant and menu to Supabase
  async saveToSupabase(match: MatchResult, menuItems: MenuItem[]) {
    console.log(`💾 Saving ${match.matched_name} with ${menuItems.length} items...`);
    
    try {
      // Save each menu item
      for (const item of menuItems) {
        const { error } = await supabase
          .from('restaurant_menus')
          .insert({
            bar_name: match.input_name,
            matched_name: match.matched_name,
            wolt_url: match.wolt_url,
            item_name: item.item_name,
            description: item.description,
            price: item.price,
            image_url: item.image_url,
            category: item.category,
            subcategory: item.subcategory
          });
          
        if (error) {
          console.error(`Error saving menu item: ${error.message}`);
        }
      }
      
      return true;
    } catch (error) {
      console.error(`Error saving to Supabase:`, error);
      return false;
    }
  }

  // Save unmatched bars
  async saveUnmatchedBar(barName: string, reason: string) {
    try {
      await supabase
        .from('unmatched_bars')
        .insert({
          bar_name: barName,
          reason: reason,
          attempted_at: new Date().toISOString()
        });
    } catch (error) {
      console.error(`Error saving unmatched bar:`, error);
    }
  }

  // Main extraction process
  async extractAllMenus(inputBars: string[]) {
    console.log('🚀 Starting Wolt menu extraction...');
    
    const stats = {
      totalBars: inputBars.length,
      matchedBars: 0,
      unmatchedBars: 0,
      totalMenuItems: 0
    };
    
    // Step 1: Fetch Wolt restaurants
    const woltRestaurants = await this.fetchWoltRestaurants();
    console.log(`Found ${woltRestaurants.length} restaurants on Wolt Malta`);
    
    // Step 2: Match bars
    const matches = this.matchBarsWithWolt(inputBars, woltRestaurants);
    
    // Step 3: Process each match
    for (const [barName, match] of matches) {
      if (match.match_type === 'not_found') {
        stats.unmatchedBars++;
        await this.saveUnmatchedBar(barName, 'No match found on Wolt');
        console.log(`❌ Not found: ${barName}`);
        continue;
      }
      
      // Extract menu items
      const menuItems = await this.extractMenuItems(match.wolt_url);
      
      if (menuItems.length > 0) {
        const saved = await this.saveToSupabase(match, menuItems);
        if (saved) {
          stats.matchedBars++;
          stats.totalMenuItems += menuItems.length;
          console.log(`✅ Saved: ${match.matched_name} (${menuItems.length} items)`);
        }
      } else {
        await this.saveUnmatchedBar(barName, 'No menu items found');
        console.log(`⚠️ No menu items: ${match.matched_name}`);
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n📊 Extraction Complete!');
    console.log(`Total bars: ${stats.totalBars}`);
    console.log(`Matched: ${stats.matchedBars}`);
    console.log(`Unmatched: ${stats.unmatchedBars}`);
    console.log(`Total menu items: ${stats.totalMenuItems}`);
    
    return stats;
  }
} 
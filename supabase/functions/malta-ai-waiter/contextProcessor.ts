import { LocationContext, LayoutHints, MenuItem } from './types.ts';

export class ContextProcessor {
  static buildMaltaContextualInfo(
    message: string,
    locationContext?: LocationContext,
    vendorLocation?: string
  ): string {
    let contextualInfo = `User message: ${message}`;
    
    // Add Malta-specific location context
    if (vendorLocation) {
      contextualInfo += `\nRestaurant location: ${vendorLocation}, Malta`;
      
      // Add area-specific context
      if (vendorLocation.toLowerCase().includes('valletta')) {
        contextualInfo += `\nArea context: Historic capital city with UNESCO World Heritage sites, popular with tourists and locals for traditional dining`;
      } else if (vendorLocation.toLowerCase().includes('sliema')) {
        contextualInfo += `\nArea context: Modern seaside town, popular for shopping and dining with sea views`;
      } else if (vendorLocation.toLowerCase().includes('st. julian')) {
        contextualInfo += `\nArea context: Entertainment district known for nightlife, restaurants, and bars`;
      } else if (vendorLocation.toLowerCase().includes('mdina')) {
        contextualInfo += `\nArea context: Silent city, medieval fortress town with historic atmosphere`;
      } else if (vendorLocation.toLowerCase().includes('gozo')) {
        contextualInfo += `\nArea context: Sister island of Malta, known for rural charm and traditional cuisine`;
      }
    }
    
    if (locationContext?.nearbyBars?.length) {
      contextualInfo += `\nNearby popular venues in Malta: ${locationContext.nearbyBars.map(b => `${b.name} (${b.rating?.toFixed(1)}★)`).join(', ')}`;
    }

    // Malta-specific time context
    const now = new Date();
    const hour = now.getHours();
    const timeContext = this.getMaltaTimeContext(hour);
    contextualInfo += `\nTime context: ${timeContext}`;

    // Add Malta cultural context
    contextualInfo += `\nCultural context: Malta has unique culinary traditions including ftira bread, ġbejna cheese, rabbit dishes, and local wines. Kinnie is the national soft drink.`;

    return contextualInfo;
  }

  static getMaltaTimeContext(hour: number): string {
    if (hour >= 6 && hour < 11) {
      return 'morning - traditional Maltese breakfast time with ftira and coffee';
    } else if (hour >= 11 && hour < 15) {
      return 'lunch time - popular for traditional Maltese dishes and business meals';
    } else if (hour >= 15 && hour < 18) {
      return 'afternoon - perfect for light snacks, pastizzi, and Kinnie';
    } else if (hour >= 18 && hour < 22) {
      return 'evening dining - main meal time in Malta with wine and local specialties';
    } else if (hour >= 22 || hour < 6) {
      return 'late evening - time for drinks, light bites, and socializing';
    }
    return 'dining time';
  }

  static extractSuggestedItems(gptResponse: string, menuItems: MenuItem[]): MenuItem[] {
    const suggestions: MenuItem[] = [];
    
    // Look for menu items mentioned in the response
    menuItems.forEach(item => {
      const itemName = item.name.toLowerCase();
      const responseText = gptResponse.toLowerCase();
      
      // Check if item is mentioned by name or description
      if (responseText.includes(itemName) || 
          responseText.includes(item.category?.toLowerCase() || '')) {
        suggestions.push(item);
      }
    });

    // If no specific items found, suggest popular or available items
    if (suggestions.length === 0) {
      const popularItems = menuItems.filter(item => item.popular && item.available);
      const availableItems = menuItems.filter(item => item.available);
      
      suggestions.push(...(popularItems.length > 0 ? popularItems : availableItems).slice(0, 3));
    }

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }

  static generateMaltaLayoutSuggestions(
    locationContext?: LocationContext, 
    timeContext?: string,
    vendorLocation?: string
  ): LayoutHints {
    const hour = new Date().getHours();
    
    let cardStyle: 'vertical' | 'horizontal' = 'vertical';
    let highlight: 'popular' | 'price' = 'popular';
    const animation: 'subtle' | 'none' = 'subtle';

    // Malta-specific layout logic
    if (vendorLocation?.toLowerCase().includes('valletta')) {
      cardStyle = 'vertical'; // More formal, traditional
      highlight = 'popular';
    } else if (vendorLocation?.toLowerCase().includes('st. julian')) {
      cardStyle = 'horizontal'; // More casual, modern
      highlight = hour >= 18 ? 'popular' : 'price';
    } else if (vendorLocation?.toLowerCase().includes('sliema')) {
      cardStyle = 'vertical';
      highlight = 'price'; // Shopping area, price-conscious
    }

    // Time-based adjustments
    if (hour >= 18 && hour <= 22) {
      highlight = 'popular'; // Dinner time, show popular items
    } else if (hour >= 11 && hour <= 15) {
      highlight = 'price'; // Lunch time, show value
    }

    return {
      cardStyle,
      highlight,
      animation,
      maltaTheme: true
    };
  }

  static getTimeContext(): string {
    const hour = new Date().getHours();
    return this.getMaltaTimeContext(hour);
  }

  // Keep existing methods for backward compatibility
  static buildContextualInfo(
    message: string,
    locationContext?: LocationContext
  ): string {
    return this.buildMaltaContextualInfo(message, locationContext);
  }

  static generateLayoutSuggestions(locationContext?: LocationContext): LayoutHints {
    return this.generateMaltaLayoutSuggestions(locationContext);
  }
}

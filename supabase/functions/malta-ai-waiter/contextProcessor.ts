
import { LocationContext, LayoutHints, MenuItem } from './types.ts';

export class ContextProcessor {
  static buildContextualInfo(
    message: string,
    locationContext?: LocationContext
  ): string {
    let contextualInfo = `User message: ${message}`;
    
    if (locationContext?.vendorLocation) {
      contextualInfo += `\nLocation context: Currently in ${locationContext.vendorLocation}`;
    }
    
    if (locationContext?.nearbyBars?.length) {
      contextualInfo += `\nNearby popular venues: ${locationContext.nearbyBars.map(b => `${b.name} (${b.rating?.toFixed(1)}★)`).join(', ')}`;
    }

    // Time-based recommendations
    const hour = new Date().getHours();
    const timeContext = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    contextualInfo += `\nTime context: ${timeContext}`;

    return contextualInfo;
  }

  static extractSuggestedItems(gptResponse: string, menuItems: MenuItem[]): MenuItem[] {
    return menuItems.filter(item => {
      const itemMentioned = gptResponse.toLowerCase().includes(item.name.toLowerCase());
      return itemMentioned;
    }).slice(0, 3);
  }

  static generateLayoutSuggestions(locationContext?: LocationContext): LayoutHints {
    const hour = new Date().getHours();
    const timeContext = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

    return {
      cardStyle: locationContext?.area === 'Valletta' ? 'vertical' : 'horizontal',
      highlight: timeContext === 'evening' ? 'popular' : 'price',
      animation: 'subtle',
      maltaTheme: true
    };
  }

  static getTimeContext(): string {
    const hour = new Date().getHours();
    return hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  }
}

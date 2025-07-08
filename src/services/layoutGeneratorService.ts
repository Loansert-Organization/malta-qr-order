import { supabase } from '@/integrations/supabase/client';
import { LayoutContext, DynamicLayout, AIRouterRequest } from '@/types/layout';
import { vendorConfigService } from './vendorConfigService';

class LayoutGeneratorService {
  async callAIRouter(request: AIRouterRequest) {
    const { data, error } = await supabase.functions.invoke('ai-router', {
      body: request
    });

    if (error) {
      console.error('AI Router error:', error);
      return null;
    }

    return data;
  }

  buildLayoutPrompt(context: LayoutContext, vendorConfig: Record<string, unknown>): string {
    let prompt = `Generate a dynamic menu layout for a restaurant in Malta. Current context:
- Time: ${context.time_of_day} on ${context.day_of_week}
- Location: ${context.location || 'Malta'}`;

    if (context.weather) {
      prompt += `\n- Weather: ${context.weather}`;
    }

    if (vendorConfig?.happy_hour_enabled) {
      const now = new Date();
      const currentTime = now.getHours() * 100 + now.getMinutes();
      const startTime = vendorConfigService.timeToNumber(vendorConfig.happy_hour_start);
      const endTime = vendorConfigService.timeToNumber(vendorConfig.happy_hour_end);
      
      if (currentTime >= startTime && currentTime <= endTime) {
        prompt += `\n- Happy Hour is ACTIVE (${vendorConfig.happy_hour_start} - ${vendorConfig.happy_hour_end})`;
      }
    }

    if (context.user_preferences) {
      prompt += `\n- User preferences: ${JSON.stringify(context.user_preferences)}`;
    }

    prompt += `\n\nGenerate a JSON layout with these sections:
- hero_section: Dynamic title, subtitle, CTA based on time/context
- menu_sections: Prioritized sections (Popular, Drinks, Mains, etc.)
- promotional_zones: Active promotions based on context
- ui_enhancements: Visual styling suggestions

Focus on Malta hospitality warmth and local appeal.`;

    return prompt;
  }

  getDefaultLayout(): DynamicLayout {
    return {
      hero_section: {
        title: "Welcome to Our Restaurant",
        subtitle: "Discover authentic flavors",
        cta_text: "Explore Menu",
        background_theme: "warm",
        show_promo: false
      },
      menu_sections: [
        { id: 'popular', title: 'Popular Items', priority: 1, display_style: 'grid' },
        { id: 'mains', title: 'Main Courses', priority: 2, display_style: 'list' },
        { id: 'drinks', title: 'Beverages', priority: 3, display_style: 'carousel' },
        { id: 'desserts', title: 'Desserts', priority: 4, display_style: 'grid' }
      ],
      promotional_zones: [],
      ui_enhancements: {
        animations: ['fadeIn', 'slideUp'],
        color_scheme: 'warm',
        card_style: 'elevated'
      }
    };
  }
}

export const layoutGeneratorService = new LayoutGeneratorService();

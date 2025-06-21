
import { supabase } from '@/integrations/supabase/client';

export interface LayoutContext {
  vendor_id: string;
  session_id?: string;
  time_of_day: 'morning' | 'afternoon' | 'evening' | 'night';
  day_of_week: string;
  location?: string;
  weather?: string;
  user_preferences?: {
    dietary_restrictions?: string[];
    favorite_categories?: string[];
    price_sensitivity?: 'low' | 'medium' | 'high';
  };
  order_history?: any[];
}

export interface DynamicLayout {
  hero_section: {
    title: string;
    subtitle: string;
    cta_text: string;
    background_theme: string;
    show_promo: boolean;
  };
  menu_sections: {
    id: string;
    title: string;
    priority: number;
    display_style: 'grid' | 'carousel' | 'list';
    item_limit?: number;
  }[];
  promotional_zones: {
    type: 'happy_hour' | 'weather_based' | 'time_based' | 'personalized';
    content: string;
    active: boolean;
  }[];
  ui_enhancements: {
    animations: string[];
    color_scheme: string;
    card_style: string;
  };
}

class LayoutService {
  async generateDynamicLayout(context: LayoutContext): Promise<DynamicLayout | null> {
    try {
      console.log('Generating dynamic layout for context:', context);

      // Check for cached layout first
      const cachedLayout = await this.getCachedLayout(context);
      if (cachedLayout && this.isLayoutFresh(cachedLayout.created_at)) {
        console.log('Using cached layout');
        return cachedLayout.layout_config as DynamicLayout;
      }

      // Get vendor configuration
      const vendorConfig = await this.getVendorConfig(context.vendor_id);
      if (!vendorConfig?.dynamic_ui_enabled) {
        console.log('Dynamic UI disabled for vendor');
        return this.getDefaultLayout();
      }

      // Generate new layout using AI Router
      const aiResponse = await this.callAIRouter({
        model: 'gpt-4o',
        task: 'layout_generation',
        context: {
          vendor_id: context.vendor_id,
          session_id: context.session_id,
          time_context: `${context.time_of_day} on ${context.day_of_week}`,
          location: context.location,
          weather: context.weather,
          user_preferences: context.user_preferences
        },
        prompt: this.buildLayoutPrompt(context, vendorConfig),
        config: {
          temperature: 0.3,
          max_tokens: 800,
          fallback_model: 'gpt-4o'
        }
      });

      if (aiResponse?.content) {
        try {
          const layout = JSON.parse(aiResponse.content);
          await this.cacheLayout(context, layout);
          return layout;
        } catch (parseError) {
          console.error('Failed to parse AI layout response:', parseError);
        }
      }

      return this.getDefaultLayout();
    } catch (error) {
      console.error('Layout generation error:', error);
      return this.getDefaultLayout();
    }
  }

  private async callAIRouter(request: any) {
    const { data, error } = await supabase.functions.invoke('ai-router', {
      body: request
    });

    if (error) {
      console.error('AI Router error:', error);
      return null;
    }

    return data;
  }

  private buildLayoutPrompt(context: LayoutContext, vendorConfig: any): string {
    let prompt = `Generate a dynamic menu layout for a restaurant in Malta. Current context:
- Time: ${context.time_of_day} on ${context.day_of_week}
- Location: ${context.location || 'Malta'}`;

    if (context.weather) {
      prompt += `\n- Weather: ${context.weather}`;
    }

    if (vendorConfig.happy_hour_enabled) {
      const now = new Date();
      const currentTime = now.getHours() * 100 + now.getMinutes();
      const startTime = this.timeToNumber(vendorConfig.happy_hour_start);
      const endTime = this.timeToNumber(vendorConfig.happy_hour_end);
      
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

  private async getCachedLayout(context: LayoutContext) {
    const { data } = await supabase
      .from('layout_suggestions')
      .select('*')
      .eq('vendor_id', context.vendor_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return data;
  }

  private async cacheLayout(context: LayoutContext, layout: DynamicLayout) {
    await supabase.from('layout_suggestions').insert({
      vendor_id: context.vendor_id,
      context_data: context,
      layout_config: layout,
      ai_model_used: 'gpt-4o'
    });
  }

  private async getVendorConfig(vendorId: string) {
    const { data } = await supabase
      .from('vendor_config')
      .select('*')
      .eq('vendor_id', vendorId)
      .single();

    return data;
  }

  private isLayoutFresh(createdAt: string): boolean {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMinutes = (now.getTime() - created.getTime()) / (1000 * 60);
    return diffMinutes < 30; // Cache for 30 minutes
  }

  private timeToNumber(timeString: string): number {
    if (!timeString) return 0;
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 100 + minutes;
  }

  private getDefaultLayout(): DynamicLayout {
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

export const layoutService = new LayoutService();

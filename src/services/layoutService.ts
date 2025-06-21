
import { LayoutContext, DynamicLayout } from '@/types/layout';
import { layoutCacheService } from './layoutCacheService';
import { layoutGeneratorService } from './layoutGeneratorService';
import { vendorConfigService } from './vendorConfigService';

class LayoutService {
  async generateDynamicLayout(context: LayoutContext): Promise<DynamicLayout | null> {
    try {
      console.log('Generating dynamic layout for context:', context);

      // Check for cached layout first
      const cachedLayout = await layoutCacheService.getCachedLayout(context);
      if (cachedLayout && layoutCacheService.isLayoutFresh(cachedLayout.created_at)) {
        console.log('Using cached layout');
        return layoutCacheService.parseLayoutConfig(cachedLayout.layout_config);
      }

      // Get vendor configuration
      const vendorConfig = await vendorConfigService.getVendorConfig(context.vendor_id);
      if (!vendorConfig?.dynamic_ui_enabled) {
        console.log('Dynamic UI disabled for vendor');
        return layoutGeneratorService.getDefaultLayout();
      }

      // Generate new layout using AI Router
      const aiResponse = await layoutGeneratorService.callAIRouter({
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
        prompt: layoutGeneratorService.buildLayoutPrompt(context, vendorConfig),
        config: {
          temperature: 0.3,
          max_tokens: 800,
          fallback_model: 'gpt-4o'
        }
      });

      if (aiResponse?.content) {
        try {
          const layout = JSON.parse(aiResponse.content);
          await layoutCacheService.cacheLayout(context, layout);
          return layout;
        } catch (parseError) {
          console.error('Failed to parse AI layout response:', parseError);
        }
      }

      return layoutGeneratorService.getDefaultLayout();
    } catch (error) {
      console.error('Layout generation error:', error);
      return layoutGeneratorService.getDefaultLayout();
    }
  }
}

export const layoutService = new LayoutService();
export { LayoutContext, DynamicLayout } from '@/types/layout';

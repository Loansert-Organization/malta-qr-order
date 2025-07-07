import { supabase } from '@/integrations/supabase/client';
import { LayoutContext, DynamicLayout } from '@/types/layout';

class LayoutCacheService {
  async getCachedLayout(context: LayoutContext) {
    const { data } = await supabase
      .from('layout_suggestions')
      .select('*')
      .eq('vendor_id', context.vendor_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return data;
  }

  async cacheLayout(context: LayoutContext, layout: DynamicLayout) {
    try {
      const insertData = {
        vendor_id: context.vendor_id,
        context_data: context,
        layout_config: layout,
        ai_model_used: 'gpt-4o'
      };

      const { error } = await supabase
        .from('layout_suggestions')
        .insert(insertData);

      if (error) {
        console.error('Failed to cache layout:', error);
      }
    } catch (error) {
      console.error('Error caching layout:', error);
    }
  }

  isLayoutFresh(createdAt: string): boolean {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMinutes = (now.getTime() - created.getTime()) / (1000 * 60);
    return diffMinutes < 30; // Cache for 30 minutes
  }

  parseLayoutConfig(layoutConfig: unknown): DynamicLayout | null {
    try {
      if (typeof layoutConfig === 'string') {
        return JSON.parse(layoutConfig) as DynamicLayout;
      } else if (typeof layoutConfig === 'object' && layoutConfig !== null) {
        return layoutConfig as DynamicLayout;
      }
      return null;
    } catch (error) {
      console.error('Failed to parse layout config:', error);
      return null;
    }
  }
}

export const layoutCacheService = new LayoutCacheService();

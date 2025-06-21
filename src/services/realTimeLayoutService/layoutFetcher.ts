
import { supabase } from '@/integrations/supabase/client';
import { DynamicLayout } from '@/types/layout';
import { layoutValidator } from './layoutValidator';

export class LayoutFetcher {
  async getLatestLayout(vendorId: string): Promise<DynamicLayout | null> {
    try {
      const { data } = await supabase
        .from('layout_suggestions')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!data) return null;

      return layoutValidator.parseLayoutConfig(data.layout_config);
    } catch (error) {
      console.error('Error fetching latest layout:', error);
      return null;
    }
  }
}

export const layoutFetcher = new LayoutFetcher();

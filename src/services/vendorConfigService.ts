
import { supabase } from '@/integrations/supabase/client';

class VendorConfigService {
  async getVendorConfig(vendorId: string) {
    const { data } = await supabase
      .from('vendor_config')
      .select('*')
      .eq('vendor_id', vendorId)
      .maybeSingle();

    return data;
  }

  timeToNumber(timeString: string): number {
    if (!timeString) return 0;
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 100 + minutes;
  }
}

export const vendorConfigService = new VendorConfigService();

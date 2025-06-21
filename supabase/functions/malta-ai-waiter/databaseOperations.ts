
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Vendor, MenuItem, ProcessingMetadata } from './types.ts';

export class DatabaseOperations {
  private supabase: any;

  constructor(supabaseUrl: string, supabaseServiceKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  async getVendorData(vendorSlug: string): Promise<Vendor | null> {
    const { data: vendor } = await this.supabase
      .from('vendors')
      .select(`
        id,
        name,
        location,
        menus!inner(
          id,
          menu_items(*)
        )
      `)
      .eq('slug', vendorSlug)
      .eq('menus.active', true)
      .single();

    return vendor;
  }

  async logInteraction(
    vendorId: string,
    guestSessionId: string,
    messageType: 'user' | 'assistant',
    content: string,
    aiModelUsed: string,
    processingMetadata: ProcessingMetadata,
    suggestions?: MenuItem[]
  ): Promise<void> {
    await this.supabase.from('ai_waiter_logs').insert({
      vendor_id: vendorId,
      guest_session_id: guestSessionId,
      message_type: messageType,
      content: content,
      ai_model_used: aiModelUsed,
      processing_metadata: processingMetadata,
      suggestions: suggestions || undefined
    });
  }
}

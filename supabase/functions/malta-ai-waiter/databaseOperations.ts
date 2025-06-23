
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Vendor, MenuItem, ProcessingMetadata } from './types.ts';

const SYSTEM_UUID = '00000000-0000-0000-0000-000000000001';
const ANONYMOUS_UUID = '00000000-0000-0000-0000-000000000002';

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
    // Ensure we use proper UUIDs, not strings
    const effectiveVendorId = vendorId === 'system' ? SYSTEM_UUID : vendorId;
    const effectiveGuestSessionId = guestSessionId === 'system' ? ANONYMOUS_UUID : guestSessionId;

    await this.supabase.from('ai_waiter_logs').insert({
      vendor_id: effectiveVendorId,
      guest_session_id: effectiveGuestSessionId,
      message_type: messageType,
      content: content,
      ai_model_used: aiModelUsed,
      processing_metadata: processingMetadata,
      suggestions: suggestions || undefined
    });
  }

  async logSystemError(component: string, error: string, metadata: any): Promise<void> {
    await this.supabase.from('system_logs').insert({
      log_type: 'ai_error',
      component,
      message: error,
      metadata,
      severity: 'error'
    });
  }
}

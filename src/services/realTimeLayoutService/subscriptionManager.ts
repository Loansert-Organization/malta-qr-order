
import { supabase } from '@/integrations/supabase/client';
import { DynamicLayout } from '@/types/layout';
import { LayoutUpdate } from './types';
import { layoutValidator } from './layoutValidator';

export class SubscriptionManager {
  private activeSubscriptions: Map<string, any> = new Map();
  private layoutUpdateCallbacks: Map<string, ((layout: DynamicLayout) => void)[]> = new Map();

  subscribeToLayoutUpdates(vendorId: string, callback: (layout: DynamicLayout) => void) {
    console.log('Subscribing to real-time layout updates for vendor:', vendorId);

    // Add callback to the list
    const callbacks = this.layoutUpdateCallbacks.get(vendorId) || [];
    callbacks.push(callback);
    this.layoutUpdateCallbacks.set(vendorId, callbacks);

    // Create subscription if it doesn't exist
    if (!this.activeSubscriptions.has(vendorId)) {
      const channel = supabase.channel(`vendor_${vendorId}_layout_updates`);
      
      channel
        .on('broadcast', { event: 'layout_update' }, (payload) => {
          console.log('Received real-time layout update:', payload);
          this.handleLayoutUpdate(vendorId, payload.payload);
        })
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'layout_suggestions',
          filter: `vendor_id=eq.${vendorId}`
        }, (payload) => {
          console.log('New layout suggestion from database:', payload);
          this.handleDatabaseLayoutUpdate(vendorId, payload.new);
        })
        .subscribe((status) => {
          console.log('Layout subscription status:', status);
        });

      this.activeSubscriptions.set(vendorId, channel);
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.layoutUpdateCallbacks.get(vendorId) || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
        this.layoutUpdateCallbacks.set(vendorId, callbacks);
      }

      // If no more callbacks, close the subscription
      if (callbacks.length === 0) {
        const channel = this.activeSubscriptions.get(vendorId);
        if (channel) {
          supabase.removeChannel(channel);
          this.activeSubscriptions.delete(vendorId);
          this.layoutUpdateCallbacks.delete(vendorId);
        }
      }
    };
  }

  private handleLayoutUpdate(vendorId: string, updateData: LayoutUpdate) {
    try {
      const layout: DynamicLayout = JSON.parse(updateData.layout_data);
      const callbacks = this.layoutUpdateCallbacks.get(vendorId) || [];
      
      callbacks.forEach(callback => {
        try {
          callback(layout);
        } catch (error) {
          console.error('Error in layout update callback:', error);
        }
      });
    } catch (error) {
      console.error('Failed to parse layout update:', error);
    }
  }

  private handleDatabaseLayoutUpdate(vendorId: string, layoutSuggestion: any) {
    try {
      const layout = layoutValidator.parseLayoutConfig(layoutSuggestion.layout_config);
      if (!layout) {
        console.error('Invalid layout configuration structure');
        return;
      }

      const callbacks = this.layoutUpdateCallbacks.get(vendorId) || [];
      
      callbacks.forEach(callback => {
        try {
          callback(layout);
        } catch (error) {
          console.error('Error in database layout update callback:', error);
        }
      });
    } catch (error) {
      console.error('Failed to process database layout update:', error);
    }
  }

  getActiveSubscriptionsCount(): number {
    return this.activeSubscriptions.size;
  }

  cleanup() {
    console.log('Cleaning up real-time layout service subscriptions');
    
    this.activeSubscriptions.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    
    this.activeSubscriptions.clear();
    this.layoutUpdateCallbacks.clear();
  }
}

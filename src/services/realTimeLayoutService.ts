
import { supabase } from '@/integrations/supabase/client';
import { DynamicLayout } from '@/types/layout';

export interface LayoutUpdate {
  vendor_id: string;
  layout_data: string;
  timestamp: string;
  confidence_score?: number;
}

class RealTimeLayoutService {
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
      let layout: DynamicLayout;
      
      if (typeof layoutSuggestion.layout_config === 'string') {
        layout = JSON.parse(layoutSuggestion.layout_config);
      } else if (layoutSuggestion.layout_config && typeof layoutSuggestion.layout_config === 'object') {
        // Type assertion with proper validation
        const config = layoutSuggestion.layout_config as any;
        if (this.isValidDynamicLayout(config)) {
          layout = config as DynamicLayout;
        } else {
          console.error('Invalid layout configuration structure');
          return;
        }
      } else {
        console.error('Layout configuration is not in expected format');
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

  private isValidDynamicLayout(obj: any): boolean {
    return obj && 
           typeof obj === 'object' && 
           'hero_section' in obj && 
           'menu_sections' in obj && 
           'promotional_zones' in obj && 
           'ui_enhancements' in obj;
  }

  async triggerLayoutRegeneration(vendorId: string, context?: any) {
    try {
      console.log('Triggering layout regeneration for vendor:', vendorId);
      
      const response = await supabase.functions.invoke('ai-router', {
        body: {
          model: 'gpt-4o',
          task: 'layout_generation',
          context: {
            vendor_id: vendorId,
            session_id: context?.session_id || 'realtime_trigger',
            time_context: `${this.getTimeOfDay()} on ${this.getDayOfWeek()}`,
            location: context?.location || 'Malta',
            weather: context?.weather,
            user_preferences: context?.user_preferences,
            trigger_type: 'real_time_update'
          },
          prompt: 'Generate an updated dynamic layout based on current context and recent user interactions',
          config: {
            temperature: 0.4,
            max_tokens: 1200,
            real_time: true
          }
        }
      });

      if (response.error) {
        console.error('Layout regeneration failed:', response.error);
        return false;
      }

      console.log('Layout regeneration triggered successfully');
      return true;
    } catch (error) {
      console.error('Error triggering layout regeneration:', error);
      return false;
    }
  }

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

      if (typeof data.layout_config === 'string') {
        return JSON.parse(data.layout_config);
      }
      
      if (this.isValidDynamicLayout(data.layout_config)) {
        return data.layout_config as DynamicLayout;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching latest layout:', error);
      return null;
    }
  }

  private getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    if (hour < 22) return 'evening';
    return 'night';
  }

  private getDayOfWeek(): string {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' });
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

export const realTimeLayoutService = new RealTimeLayoutService();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    realTimeLayoutService.cleanup();
  });
}

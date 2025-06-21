
import { supabase } from '@/integrations/supabase/client';
import { timeUtils } from './timeUtils';

export class AITrigger {
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
            time_context: `${timeUtils.getTimeOfDay()} on ${timeUtils.getDayOfWeek()}`,
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
}

export const aiTrigger = new AITrigger();

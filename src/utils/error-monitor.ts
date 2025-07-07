import { supabase } from '@/integrations/supabase/client';

export class ErrorMonitorService {
  async logError(error: Error, context?: Record<string, unknown>): Promise<void> {
    try {
      await supabase.from('error_logs').insert([{
        error_type: error.name || 'Unknown',
        error_message: error.message,
        stack_trace: error.stack,
        severity: 'medium',
        context: context || {},
        resolved: false
      }]);
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }

  async getRecentErrors(limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get recent errors:', error);
      return [];
    }
  }

  async resolveError(errorId: string): Promise<void> {
    try {
      await supabase
        .from('error_logs')
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq('id', errorId);
    } catch (error) {
      console.error('Failed to resolve error:', error);
    }
  }
}

export const errorMonitorService = new ErrorMonitorService();
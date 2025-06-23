
import { supabase } from '@/integrations/supabase/client';

export type LogLevel = 'info' | 'warning' | 'error';

export interface SystemLogParams {
  log_type: string;
  component: string;
  message: string;
  severity?: LogLevel;
  metadata?: Record<string, any>;
}

export async function logSystemEvent(params: SystemLogParams) {
  try {
    await supabase.from('system_logs').insert({
      log_type: params.log_type,
      component: params.component,
      message: params.message,
      severity: params.severity || 'info',
      metadata: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : null
    });
  } catch (error) {
    console.error('Failed to log system event:', error);
  }
}

export async function getRecentLogs(limit = 100) {
  const { data, error } = await supabase
    .from('system_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch system logs:', error);
    return [];
  }

  return data || [];
}

export async function getLogsByComponent(component: string, limit = 50) {
  const { data, error } = await supabase
    .from('system_logs')
    .select('*')
    .eq('component', component)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch component logs:', error);
    return [];
  }

  return data || [];
}

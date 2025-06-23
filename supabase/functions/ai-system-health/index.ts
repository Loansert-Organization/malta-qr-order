
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('🔍 AI System Health Check Starting...')

    // Check AI Waiter Logs Health
    const { data: aiLogs, error: aiLogsError } = await supabase
      .from('ai_waiter_logs')
      .select('id, created_at, ai_model_used, satisfaction_score')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(100)

    // Check Error Logs for AI-related issues
    const { data: errorLogs, error: errorLogsError } = await supabase
      .from('error_logs')
      .select('id, error_type, severity, created_at')
      .like('error_type', '%ai%')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    // Check System Metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('system_metrics')
      .select('name, value, timestamp')
      .in('name', ['ai_response_time', 'ai_success_rate', 'ai_error_rate'])
      .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString())

    const healthReport = {
      timestamp: new Date().toISOString(),
      overall_status: 'healthy',
      components: {
        ai_waiter: {
          status: aiLogsError ? 'unhealthy' : 'healthy',
          total_sessions: aiLogs?.length || 0,
          average_satisfaction: aiLogs?.reduce((acc, log) => acc + (log.satisfaction_score || 0), 0) / (aiLogs?.length || 1),
          models_used: [...new Set(aiLogs?.map(log => log.ai_model_used).filter(Boolean))],
          last_activity: aiLogs?.[0]?.created_at || null
        },
        error_tracking: {
          status: errorLogsError ? 'degraded' : 'healthy',
          ai_related_errors: errorLogs?.length || 0,
          critical_errors: errorLogs?.filter(log => log.severity === 'critical').length || 0,
          recent_error_types: [...new Set(errorLogs?.map(log => log.error_type) || [])]
        },
        performance_metrics: {
          status: metricsError ? 'degraded' : 'healthy',
          metrics_collected: metrics?.length || 0,
          last_metric_time: metrics?.[0]?.timestamp || null
        }
      },
      recommendations: []
    }

    // Generate recommendations based on health data
    if (healthReport.components.ai_waiter.average_satisfaction < 3) {
      healthReport.recommendations.push('AI Waiter satisfaction is low - review conversation quality')
      healthReport.overall_status = 'degraded'
    }

    if (healthReport.components.error_tracking.critical_errors > 0) {
      healthReport.recommendations.push('Critical AI errors detected - immediate attention required')
      healthReport.overall_status = 'unhealthy'
    }

    if (healthReport.components.ai_waiter.total_sessions === 0) {
      healthReport.recommendations.push('No recent AI Waiter activity - check system availability')
      healthReport.overall_status = 'degraded'
    }

    // Log health check to system metrics
    await supabase.from('system_metrics').insert({
      name: 'ai_system_health_score',
      value: healthReport.overall_status === 'healthy' ? 100 : 
             healthReport.overall_status === 'degraded' ? 75 : 25,
      timestamp: new Date().toISOString(),
      tags: { component: 'ai_system_health' }
    })

    console.log('✅ AI System Health Check Complete:', healthReport.overall_status)

    return new Response(
      JSON.stringify(healthReport),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('❌ AI System Health Check Failed:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString(),
        overall_status: 'unhealthy'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})

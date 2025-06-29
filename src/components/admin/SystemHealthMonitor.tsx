import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, AlertCircle, XCircle, RefreshCw, Activity } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';

interface HealthStatus {
  service_name: string;
  status: 'healthy' | 'degraded' | 'down';
  last_check: string;
  response_time_ms: number | null;
  error_message: string | null;
}

const SystemHealthMonitor = () => {
  const { toast } = useToast();
  const [healthStatuses, setHealthStatuses] = useState<HealthStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    fetchHealthStatus();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('system-health')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_health' }, () => {
        fetchHealthStatus();
      })
      .subscribe();

    // Auto-refresh every 30 seconds
    const interval = setInterval(checkAllServices, 30000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const fetchHealthStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('system_health')
        .select('*')
        .order('service_name');

      if (error) throw error;
      setHealthStatuses(data || []);
    } catch (error) {
      console.error('Error fetching health status:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAllServices = async () => {
    setChecking(true);
    
    try {
      // Check Supabase Database
      const dbStart = Date.now();
      const { error: dbError } = await supabase.from('bars').select('id').limit(1);
      const dbTime = Date.now() - dbStart;
      
      await updateServiceHealth('supabase_database', !dbError, dbTime, dbError?.message);

      // Check Supabase Auth
      const authStart = Date.now();
      const { error: authError } = await supabase.auth.getSession();
      const authTime = Date.now() - authStart;
      
      await updateServiceHealth('supabase_auth', !authError, authTime, authError?.message);

      // Check Edge Functions
      const edgeStart = Date.now();
      try {
        const response = await supabase.functions.invoke('rate-limiter', {
          method: 'GET'
        });
        const edgeTime = Date.now() - edgeStart;
        await updateServiceHealth('edge_functions', response.error === null, edgeTime, response.error?.message);
      } catch (error) {
        await updateServiceHealth('edge_functions', false, Date.now() - edgeStart, error.message);
      }

      // Check AI Tools
      const aiStart = Date.now();
      try {
        const { data, error } = await supabase.functions.invoke('ai-system-health');
        const aiTime = Date.now() - aiStart;
        await updateServiceHealth('ai_tools', !error, aiTime, error?.message);
      } catch (error) {
        await updateServiceHealth('ai_tools', false, Date.now() - aiStart, error.message);
      }

      toast({
        title: "Health Check Complete",
        description: "All services have been checked",
      });

      fetchHealthStatus();
    } catch (error) {
      console.error('Error checking services:', error);
      toast({
        title: "Error",
        description: "Failed to check some services",
        variant: "destructive"
      });
    } finally {
      setChecking(false);
    }
  };

  const updateServiceHealth = async (
    serviceName: string, 
    isHealthy: boolean, 
    responseTime: number,
    errorMessage?: string
  ) => {
    const status = isHealthy ? 'healthy' : responseTime > 1000 ? 'degraded' : 'down';
    
    await supabase
      .from('system_health')
      .update({
        status,
        last_check: new Date().toISOString(),
        response_time_ms: responseTime,
        error_message: errorMessage || null
      })
      .eq('service_name', serviceName);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'down':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'degraded':
        return <Badge className="bg-yellow-100 text-yellow-800">Degraded</Badge>;
      case 'down':
        return <Badge className="bg-red-100 text-red-800">Down</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getServiceDisplayName = (serviceName: string) => {
    const displayNames: Record<string, string> = {
      'supabase_database': 'Database',
      'supabase_auth': 'Authentication',
      'supabase_storage': 'File Storage',
      'edge_functions': 'Edge Functions',
      'ai_tools': 'AI Services',
      'payment_gateway': 'Payment Gateway'
    };
    return displayNames[serviceName] || serviceName;
  };

  const overallHealth = healthStatuses.every(s => s.status === 'healthy') 
    ? 'healthy' 
    : healthStatuses.some(s => s.status === 'down') 
    ? 'down' 
    : 'degraded';

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading system health...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {getStatusIcon(overallHealth)}
              <span className="text-sm font-medium">
                {overallHealth === 'healthy' ? 'All Systems Operational' : 
                 overallHealth === 'down' ? 'System Issues Detected' : 
                 'Performance Degraded'}
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={checkAllServices}
              disabled={checking}
            >
              {checking ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Check Now
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {healthStatuses.map((service) => (
            <div key={service.service_name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                {getStatusIcon(service.status)}
                <div>
                  <p className="font-medium">{getServiceDisplayName(service.service_name)}</p>
                  <p className="text-sm text-gray-500">
                    Last checked: {new Date(service.last_check).toLocaleTimeString()}
                    {service.response_time_ms && ` • ${service.response_time_ms}ms`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(service.status)}
                {service.error_message && (
                  <span className="text-xs text-red-600" title={service.error_message}>
                    ⚠️
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemHealthMonitor; 
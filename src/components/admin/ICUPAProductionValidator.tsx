
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Server, 
  Database, 
  Shield, 
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ValidationResult {
  component: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  details?: string[];
}

interface SystemHealth {
  overall_status: 'healthy' | 'degraded' | 'unhealthy';
  components: {
    ai_waiter: {
      status: string;
      total_sessions: number;
      average_satisfaction: number;
    };
    error_tracking: {
      status: string;
      ai_related_errors: number;
    };
    performance_metrics: {
      status: string;
      metrics_collected: number;
    };
  };
  recommendations: string[];
}

const ICUPAProductionValidator: React.FC = () => {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const runValidation = async () => {
    setIsValidating(true);
    const results: ValidationResult[] = [];

    try {
      // Test database connectivity
      const { data: vendors, error: vendorsError } = await supabase
        .from('vendors')
        .select('id, name')
        .limit(1);

      results.push({
        component: 'Database Connectivity',
        status: vendorsError ? 'fail' : 'pass',
        message: vendorsError ? 'Database connection failed' : 'Database accessible',
        details: vendorsError ? [vendorsError.message] : undefined
      });

      // Test AI system health
      try {
        const { data: healthData, error: healthError } = await supabase.functions.invoke('ai-system-health');
        
        if (healthError) {
          results.push({
            component: 'AI System Health',
            status: 'warning',
            message: 'AI health check service unavailable',
            details: [healthError.message]
          });
        } else {
          setSystemHealth(healthData);
          results.push({
            component: 'AI System Health',
            status: healthData.overall_status === 'healthy' ? 'pass' : 'warning',
            message: `AI system is ${healthData.overall_status}`,
            details: healthData.recommendations
          });
        }
      } catch (error) {
        results.push({
          component: 'AI System Health',
          status: 'fail',
          message: 'AI health check failed',
          details: ['Edge function may not be deployed']
        });
      }

      // Test support system
      try {
        const testTicket = {
          customer_id: 'system-test-user',
          subject: 'System Validation Test',
          description: 'Automated test ticket for production validation',
          priority: 'low' as const,
          category: 'technical' as const,
          status: 'open' as const
        };

        const { error: ticketError } = await supabase
          .from('support_tickets')
          .insert(testTicket);

        results.push({
          component: 'Support System',
          status: ticketError ? 'fail' : 'pass',
          message: ticketError ? 'Support ticket creation failed' : 'Support system operational',
          details: ticketError ? [ticketError.message] : undefined
        });

        // Clean up test ticket
        if (!ticketError) {
          await supabase
            .from('support_tickets')
            .delete()
            .eq('customer_id', 'system-test-user');
        }
      } catch (error) {
        results.push({
          component: 'Support System',
          status: 'fail',
          message: 'Support system test failed'
        });
      }

      // Test security audits
      const { data: audits, error: auditsError } = await supabase
        .from('security_audits')
        .select('id, audit_score')
        .order('created_at', { ascending: false })
        .limit(1);

      results.push({
        component: 'Security Audits',
        status: auditsError ? 'fail' : 'pass',
        message: auditsError ? 'Security audit system unavailable' : 'Security monitoring active',
        details: audits && audits.length > 0 ? [`Latest audit score: ${audits[0].audit_score}/100`] : undefined
      });

      setValidationResults(results);
      
      const failCount = results.filter(r => r.status === 'fail').length;
      const warningCount = results.filter(r => r.status === 'warning').length;
      
      toast({
        title: "Production Validation Complete",
        description: `${results.length - failCount - warningCount} passed, ${warningCount} warnings, ${failCount} failed`,
        variant: failCount > 0 ? "destructive" : warningCount > 0 ? "default" : "default"
      });

    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Failed to complete production validation",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'fail':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  useEffect(() => {
    runValidation();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            ICUPA Production System Validation
          </CardTitle>
          <CardDescription>
            Comprehensive validation of all production systems and services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Button 
              onClick={runValidation} 
              disabled={isValidating}
              className="flex items-center gap-2"
            >
              {isValidating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Activity className="h-4 w-4" />
              )}
              {isValidating ? 'Validating...' : 'Run Validation'}
            </Button>
          </div>

          <Tabs defaultValue="results" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="results">Validation Results</TabsTrigger>
              <TabsTrigger value="health">System Health</TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {validationResults.map((result, index) => (
                  <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <div className="font-medium">{result.component}</div>
                        <div className="text-sm text-gray-600">{result.message}</div>
                        {result.details && result.details.length > 0 && (
                          <ul className="mt-2 text-xs text-gray-500">
                            {result.details.map((detail, i) => (
                              <li key={i}>• {detail}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                    <Badge variant={getStatusColor(result.status)}>
                      {result.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="health" className="space-y-4">
              {systemHealth ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Database className="h-4 w-4" />
                          <h4 className="font-medium">AI Waiter</h4>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div>Status: {systemHealth.components.ai_waiter.status}</div>
                          <div>Sessions: {systemHealth.components.ai_waiter.total_sessions}</div>
                          <div>Satisfaction: {systemHealth.components.ai_waiter.average_satisfaction.toFixed(1)}/5</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-4 w-4" />
                          <h4 className="font-medium">Error Tracking</h4>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div>Status: {systemHealth.components.error_tracking.status}</div>
                          <div>AI Errors: {systemHealth.components.error_tracking.ai_related_errors}</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="h-4 w-4" />
                          <h4 className="font-medium">Performance</h4>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div>Status: {systemHealth.components.performance_metrics.status}</div>
                          <div>Metrics: {systemHealth.components.performance_metrics.metrics_collected}</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {systemHealth.recommendations.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1 text-sm">
                          {systemHealth.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <AlertTriangle className="h-3 w-3 mt-0.5 text-yellow-600" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  No health data available. Run validation to check system health.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ICUPAProductionValidator;


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2,
  Server,
  Shield,
  BarChart3,
  Users,
  Headphones
} from 'lucide-react';
import { icupaProductionSystem } from '@/services/icupaProductionSystem';
import { useToast } from '@/hooks/use-toast';

interface ValidationResult {
  component: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

const ICUPAProductionValidator: React.FC = () => {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  const runValidation = async () => {
    setIsValidating(true);
    setValidationResults([]);
    
    const results: ValidationResult[] = [];

    // Test Analytics Service
    try {
      const analytics = await icupaProductionSystem.getAnalytics().getDashboardData();
      results.push({
        component: 'Analytics Service',
        status: 'success',
        message: `Analytics data loaded successfully. ${analytics.orders.total} total orders`,
        details: analytics
      });
    } catch (error) {
      results.push({
        component: 'Analytics Service',
        status: 'error',
        message: `Analytics failed: ${error}`,
        details: { error }
      });
    }

    // Test Health Check Service
    try {
      const health = await icupaProductionSystem.getHealthCheck().performHealthCheck();
      results.push({
        component: 'Health Check Service',
        status: health.overall === 'healthy' ? 'success' : 'warning',
        message: `System health: ${health.overall}. ${health.services.length} services checked`,
        details: health
      });
    } catch (error) {
      results.push({
        component: 'Health Check Service',
        status: 'error',
        message: `Health check failed: ${error}`,
        details: { error }
      });
    }

    // Test Security Audit Service
    try {
      const audit = await icupaProductionSystem.getSecurityAudit().runComprehensiveAudit();
      results.push({
        component: 'Security Audit Service',
        status: audit.score >= 80 ? 'success' : 'warning',
        message: `Security score: ${audit.score}/100. ${audit.issues.length} issues found`,
        details: audit
      });
    } catch (error) {
      results.push({
        component: 'Security Audit Service',
        status: 'error',
        message: `Security audit failed: ${error}`,
        details: { error }
      });
    }

    // Test Support Service
    try {
      const testTicket = await icupaProductionSystem.getSupport().createTicket({
        customer_id: 'test_customer',
        subject: 'Production System Test',
        description: 'This is a test ticket to validate the support system',
        priority: 'low',
        category: 'technical'
      });
      results.push({
        component: 'Support Service',
        status: 'success',
        message: `Support system working. Test ticket created: ${testTicket}`,
        details: { ticketId: testTicket }
      });
    } catch (error) {
      results.push({
        component: 'Support Service',
        status: 'error',
        message: `Support system failed: ${error}`,
        details: { error }
      });
    }

    // Test Monitoring Service
    try {
      const metrics = await icupaProductionSystem.getMonitoring().collectMetrics();
      results.push({
        component: 'Monitoring Service',
        status: 'success',
        message: `Monitoring active. ${metrics.length} metrics collected`,
        details: metrics
      });
    } catch (error) {
      results.push({
        component: 'Monitoring Service',
        status: 'error',
        message: `Monitoring failed: ${error}`,
        details: { error }
      });
    }

    setValidationResults(results);
    setIsValidating(false);

    // Show summary toast
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    
    toast({
      title: 'ICUPA Production Validation Complete',
      description: `${successCount} components validated, ${errorCount} errors found`,
      variant: errorCount > 0 ? 'destructive' : 'default'
    });
  };

  useEffect(() => {
    runValidation();
  }, []);

  const getStatusIcon = (status: ValidationResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: ValidationResult['status']) => {
    switch (status) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            ICUPA Production System Validation
          </CardTitle>
          <CardDescription>
            Comprehensive validation of all production system components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Button onClick={runValidation} disabled={isValidating}>
              {isValidating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                'Run Validation'
              )}
            </Button>
            {validationResults.length > 0 && (
              <div className="text-sm text-gray-600">
                {validationResults.filter(r => r.status === 'success').length} successful, {' '}
                {validationResults.filter(r => r.status === 'error').length} errors
              </div>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {validationResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <div className="font-medium">{result.component}</div>
                        <div className="text-sm text-gray-600">{result.message}</div>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(result.status)}>
                      {result.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="services" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {validationResults
                  .filter(r => ['Analytics Service', 'Support Service'].includes(r.component))
                  .map((result, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(result.status)}
                            <div>
                              <div className="font-medium">{result.component}</div>
                              <div className="text-sm text-gray-600">{result.message}</div>
                            </div>
                          </div>
                          <Badge variant={getStatusColor(result.status)}>
                            {result.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {validationResults
                  .filter(r => ['Health Check Service', 'Monitoring Service'].includes(r.component))
                  .map((result, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(result.status)}
                            <div>
                              <div className="font-medium">{result.component}</div>
                              <div className="text-sm text-gray-600">{result.message}</div>
                            </div>
                          </div>
                          <Badge variant={getStatusColor(result.status)}>
                            {result.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {validationResults
                  .filter(r => r.component === 'Security Audit Service')
                  .map((result, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(result.status)}
                            <div>
                              <div className="font-medium">{result.component}</div>
                              <div className="text-sm text-gray-600">{result.message}</div>
                            </div>
                          </div>
                          <Badge variant={getStatusColor(result.status)}>
                            {result.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ICUPAProductionValidator;

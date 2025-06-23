
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2,
  Database,
  Users,
  ShoppingCart,
  Wifi
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

const CoreAppTester: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const runTests = async () => {
    setIsRunning(true);
    setTests([]);
    
    const testResults: TestResult[] = [];

    // Test 1: Database Connection
    try {
      const { data, error } = await supabase.from('vendors').select('count').limit(1);
      testResults.push({
        name: 'Database Connection',
        status: error ? 'error' : 'success',
        message: error ? `Connection failed: ${error.message}` : 'Database connected successfully',
        details: { data, error }
      });
    } catch (error) {
      testResults.push({
        name: 'Database Connection',
        status: 'error',
        message: `Connection error: ${error}`,
        details: { error }
      });
    }

    // Test 2: Authentication System
    try {
      const { data: { session } } = await supabase.auth.getSession();
      testResults.push({
        name: 'Authentication System',
        status: 'success',
        message: session ? 'User authenticated' : 'Anonymous session active',
        details: { hasSession: !!session }
      });
    } catch (error) {
      testResults.push({
        name: 'Authentication System',
        status: 'error',
        message: `Auth error: ${error}`,
        details: { error }
      });
    }

    // Test 3: Vendor Data Access
    try {
      const { data: vendors, error } = await supabase
        .from('vendors')
        .select('id, name, active')
        .limit(5);
      
      testResults.push({
        name: 'Vendor Data Access',
        status: error ? 'error' : 'success',
        message: error ? `Data access failed: ${error.message}` : `Found ${vendors?.length || 0} vendors`,
        details: { vendors, error }
      });
    } catch (error) {
      testResults.push({
        name: 'Vendor Data Access',
        status: 'error',
        message: `Vendor query error: ${error}`,
        details: { error }
      });
    }

    // Test 4: Menu Items Access
    try {
      const { data: items, error } = await supabase
        .from('menu_items')
        .select('id, name, price, available')
        .limit(5);
      
      testResults.push({
        name: 'Menu Items Access',
        status: error ? 'error' : 'success',
        message: error ? `Menu access failed: ${error.message}` : `Found ${items?.length || 0} menu items`,
        details: { items, error }
      });
    } catch (error) {
      testResults.push({
        name: 'Menu Items Access',
        status: 'error',
        message: `Menu query error: ${error}`,
        details: { error }
      });
    }

    // Test 5: Orders System
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('id, status, total_amount')
        .limit(5);
      
      testResults.push({
        name: 'Orders System',
        status: error ? 'error' : 'success',
        message: error ? `Orders access failed: ${error.message}` : `Found ${orders?.length || 0} orders`,
        details: { orders, error }
      });
    } catch (error) {
      testResults.push({
        name: 'Orders System',
        status: 'error',
        message: `Orders query error: ${error}`,
        details: { error }
      });
    }

    // Test 6: Production Tables
    try {
      const { data: tickets, error } = await supabase
        .from('support_tickets')
        .select('count')
        .limit(1);
      
      testResults.push({
        name: 'Production Tables',
        status: error ? 'error' : 'success',
        message: error ? `Production tables failed: ${error.message}` : 'Production tables accessible',
        details: { tickets, error }
      });
    } catch (error) {
      testResults.push({
        name: 'Production Tables',
        status: 'error',
        message: `Production tables error: ${error}`,
        details: { error }
      });
    }

    setTests(testResults);
    setIsRunning(false);

    // Show summary toast
    const successCount = testResults.filter(t => t.status === 'success').length;
    const errorCount = testResults.filter(t => t.status === 'error').length;
    
    toast({
      title: 'Core App Tests Complete',
      description: `${successCount} passed, ${errorCount} failed`,
      variant: errorCount > 0 ? 'destructive' : 'default'
    });
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Core App Functionality Test
          </CardTitle>
          <CardDescription>
            Testing essential ICUPA functionality and database connectivity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button onClick={runTests} disabled={isRunning}>
                {isRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  'Run Tests'
                )}
              </Button>
              {tests.length > 0 && (
                <div className="text-sm text-gray-600">
                  {tests.filter(t => t.status === 'success').length} passed, {' '}
                  {tests.filter(t => t.status === 'error').length} failed
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {tests.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <div className="font-medium">{test.name}</div>
                    <div className="text-sm text-gray-600">{test.message}</div>
                  </div>
                </div>
                <Badge variant={getStatusColor(test.status)}>
                  {test.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoreAppTester;

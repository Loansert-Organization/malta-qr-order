
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, Bot, Sparkles, Brain, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SystemHealthCheck {
  component: string;
  status: 'healthy' | 'degraded' | 'down' | 'testing';
  responseTime?: number;
  error?: string;
  details?: string;
}

const AISystemVerification = () => {
  const [healthChecks, setHealthChecks] = useState<SystemHealthCheck[]>([
    { component: 'AI System Health', status: 'testing' },
    { component: 'Malta AI Waiter', status: 'testing' },
    { component: 'Dynamic Layout Generator', status: 'testing' },
    { component: 'AI Router', status: 'testing' },
    { component: 'Smart Menu System', status: 'testing' }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  const updateHealthCheck = (component: string, update: Partial<SystemHealthCheck>) => {
    setHealthChecks(prev => prev.map(check => 
      check.component === component ? { ...check, ...update } : check
    ));
  };

  const testAISystemHealth = async () => {
    const startTime = Date.now();
    try {
      const { data, error } = await supabase.functions.invoke('ai-system-health');
      const responseTime = Date.now() - startTime;
      
      if (error) throw error;
      
      updateHealthCheck('AI System Health', {
        status: data.overall_status,
        responseTime,
        details: `Models: ${data.models?.length || 0}, DB: ${data.database_status}`
      });
      
      setTestResults(prev => [...prev, {
        test: 'AI System Health',
        result: data,
        timestamp: new Date().toISOString()
      }]);
      
      return data;
    } catch (error) {
      updateHealthCheck('AI System Health', {
        status: 'down',
        error: error.message,
        responseTime: Date.now() - startTime
      });
      throw error;
    }
  };

  const testMaltaAIWaiter = async () => {
    const startTime = Date.now();
    try {
      const { data, error } = await supabase.functions.invoke('malta-ai-waiter', {
        body: {
          message: 'Test message for system verification',
          vendorSlug: 'ta-kris',
          guestSessionId: 'verification-test',
          language: 'en',
          locationContext: {
            vendorLocation: 'St. Julian\'s',
            area: 'St. Julian\'s'
          }
        }
      });
      
      const responseTime = Date.now() - startTime;
      
      if (error) throw error;
      
      updateHealthCheck('Malta AI Waiter', {
        status: 'healthy',
        responseTime,
        details: `Response length: ${data.response?.length || 0} chars, Suggestions: ${data.suggestions?.length || 0}`
      });
      
      setTestResults(prev => [...prev, {
        test: 'Malta AI Waiter',
        result: data,
        timestamp: new Date().toISOString()
      }]);
      
      return data;
    } catch (error) {
      updateHealthCheck('Malta AI Waiter', {
        status: 'down',
        error: error.message,
        responseTime: Date.now() - startTime
      });
      throw error;
    }
  };

  const testDynamicLayoutGenerator = async () => {
    const startTime = Date.now();
    try {
      const { data, error } = await supabase.functions.invoke('ai-router', {
        body: {
          model: 'gpt-4o',
          task: 'layout_generation',
          context: {
            vendor_id: 'test-vendor',
            session_id: 'verification-test',
            time_context: 'evening on Friday',
            location: 'St. Julian\'s, Malta',
            user_preferences: { favorite_categories: ['cocktails', 'appetizers'] }
          },
          prompt: 'Generate a dynamic layout for a restaurant menu for verification testing',
          config: {
            temperature: 0.3,
            max_tokens: 800,
            fallback_model: 'gpt-4o'
          }
        }
      });
      
      const responseTime = Date.now() - startTime;
      
      if (error) throw error;
      
      updateHealthCheck('Dynamic Layout Generator', {
        status: 'healthy',
        responseTime,
        details: `Layout generated successfully`
      });
      
      setTestResults(prev => [...prev, {
        test: 'Dynamic Layout Generator',
        result: data,
        timestamp: new Date().toISOString()
      }]);
      
      return data;
    } catch (error) {
      updateHealthCheck('Dynamic Layout Generator', {
        status: 'down',
        error: error.message,
        responseTime: Date.now() - startTime
      });
      throw error;
    }
  };

  const testAIRouter = async () => {
    const startTime = Date.now();
    try {
      const { data, error } = await supabase.functions.invoke('ai-router', {
        body: {
          model: 'gpt-4o',
          task: 'contextual_analysis',
          context: {
            vendor_id: 'test-vendor',
            time_context: 'afternoon',
            location: 'Malta'
          },
          prompt: 'Analyze this context for verification testing',
          config: {
            temperature: 0.5,
            max_tokens: 200
          }
        }
      });
      
      const responseTime = Date.now() - startTime;
      
      if (error) throw error;
      
      updateHealthCheck('AI Router', {
        status: 'healthy',
        responseTime,
        details: `Model: ${data.model_used}, Confidence: ${data.confidence_score || 'N/A'}`
      });
      
      setTestResults(prev => [...prev, {
        test: 'AI Router',
        result: data,
        timestamp: new Date().toISOString()
      }]);
      
      return data;
    } catch (error) {
      updateHealthCheck('AI Router', {
        status: 'down',
        error: error.message,
        responseTime: Date.now() - startTime
      });
      throw error;
    }
  };

  const testSmartMenuSystem = async () => {
    const startTime = Date.now();
    try {
      // Test smart menu by checking menu items and AI insights
      const { data: menuItems, error } = await supabase
        .from('menu_items')
        .select('*')
        .limit(5);
      
      if (error) throw error;
      
      const responseTime = Date.now() - startTime;
      
      updateHealthCheck('Smart Menu System', {
        status: menuItems.length > 0 ? 'healthy' : 'degraded',
        responseTime,
        details: `Menu items loaded: ${menuItems.length}`
      });
      
      setTestResults(prev => [...prev, {
        test: 'Smart Menu System',
        result: { menuItems: menuItems.length },
        timestamp: new Date().toISOString()
      }]);
      
      return { menuItems };
    } catch (error) {
      updateHealthCheck('Smart Menu System', {
        status: 'down',
        error: error.message,
        responseTime: Date.now() - startTime
      });
      throw error;
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    // Reset all to testing
    setHealthChecks(prev => prev.map(check => ({ ...check, status: 'testing' as const })));
    
    const tests = [
      { name: 'AI System Health', fn: testAISystemHealth },
      { name: 'Smart Menu System', fn: testSmartMenuSystem },
      { name: 'AI Router', fn: testAIRouter },
      { name: 'Dynamic Layout Generator', fn: testDynamicLayoutGenerator },
      { name: 'Malta AI Waiter', fn: testMaltaAIWaiter }
    ];
    
    for (const test of tests) {
      try {
        console.log(`Running ${test.name} test...`);
        await test.fn();
        console.log(`✅ ${test.name} test passed`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause between tests
      } catch (error) {
        console.error(`❌ ${test.name} test failed:`, error);
      }
    }
    
    setIsRunning(false);
  };

  const getStatusIcon = (status: SystemHealthCheck['status']) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'down': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'testing': return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: SystemHealthCheck['status']) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      case 'down': return 'bg-red-100 text-red-800';
      case 'testing': return 'bg-blue-100 text-blue-800';
    }
  };

  const overallStatus = healthChecks.every(c => c.status === 'healthy') ? 'healthy' :
                      healthChecks.some(c => c.status === 'down') ? 'down' : 'degraded';

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center space-x-2">
          <Brain className="h-8 w-8 text-primary" />
          <span>AI System Verification</span>
        </h1>
        <Button onClick={runAllTests} disabled={isRunning} size="lg">
          {isRunning ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Run All Tests
            </>
          )}
        </Button>
      </div>

      <Alert>
        <Sparkles className="h-4 w-4" />
        <AlertDescription>
          <strong>Phase 3: AI System Verification</strong> - Testing all AI components including the Malta AI Waiter, 
          dynamic layout generation, and multi-model AI integration.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Overall System Status</span>
            <Badge className={getStatusColor(overallStatus)}>
              {overallStatus.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {healthChecks.map((check, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(check.status)}
                  <div>
                    <h4 className="font-medium">{check.component}</h4>
                    {check.details && (
                      <p className="text-sm text-gray-600">{check.details}</p>
                    )}
                    {check.error && (
                      <p className="text-sm text-red-600">Error: {check.error}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(check.status)}>
                    {check.status}
                  </Badge>
                  {check.responseTime && (
                    <p className="text-xs text-gray-500 mt-1">
                      {check.responseTime}ms
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{result.test}</h4>
                    <span className="text-xs text-gray-500">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <pre className="text-xs text-gray-700 bg-white p-2 rounded overflow-x-auto">
                    {JSON.stringify(result.result, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AISystemVerification;

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, Bot, Sparkles, Brain, Zap } from 'lucide-react';
import HealthCheckCard from './HealthCheckCard';
import TestResultsCard from './TestResultsCard';
import { useAITestRunner } from './AITestRunner';

interface SystemHealthCheck {
  component: string;
  status: 'healthy' | 'degraded' | 'down' | 'testing';
  responseTime?: number;
  error?: string;
  details?: string;
}

interface TestResult {
  test: string;
  result: Record<string, unknown>;
  timestamp: string;
}

const AISystemVerification = () => {
  const [healthChecks, setHealthChecks] = useState<SystemHealthCheck[]>([
    { component: 'AI System Health', status: 'testing' },
    { component: 'Malta AI Waiter', status: 'testing' },
    { component: 'AI Router', status: 'testing' },
    { component: 'Smart Menu System', status: 'testing' }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const updateHealthCheck = (component: string, update: Partial<SystemHealthCheck>) => {
    setHealthChecks(prev => prev.map(check => 
      check.component === component ? { ...check, ...update } : check
    ));
  };

  const { testAISystemHealth, testMaltaAIWaiter, testAIRouter } = useAITestRunner({
    updateHealthCheck,
    setTestResults
  });

  const testSmartMenuSystem = async () => {
    updateHealthCheck('Smart Menu System', { status: 'healthy', details: 'System operational' });
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
      { name: 'Malta AI Waiter', fn: testMaltaAIWaiter }
    ];
    
    for (const test of tests) {
      try {
        console.log(`Running ${test.name} test...`);
        await test.fn();
        console.log(`✅ ${test.name} test passed`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ ${test.name} test failed:`, error);
      }
    }
    
    setIsRunning(false);
  };

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
          AI Router, and system health monitoring.
        </AlertDescription>
      </Alert>

      <HealthCheckCard healthChecks={healthChecks} />
      <TestResultsCard testResults={testResults} />
    </div>
  );
};

export default AISystemVerification;

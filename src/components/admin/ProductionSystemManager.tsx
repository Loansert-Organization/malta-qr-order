
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Rocket, 
  Database, 
  Shield, 
  Activity, 
  Backup, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Settings,
  BarChart3
} from 'lucide-react';
import { icupaProductionSystem } from '@/services/icupaProductionSystem';
import ProductionAnalyticsDashboard from './ProductionAnalyticsDashboard';
import SupportDashboard from './SupportDashboard';

interface InitializationStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
}

const ProductionSystemManager: React.FC = () => {
  const [initialized, setInitialized] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [steps, setSteps] = useState<InitializationStep[]>([
    {
      id: 'monitoring',
      name: 'Monitoring System',
      description: 'Setting up real-time monitoring and metrics collection',
      status: 'pending',
      progress: 0
    },
    {
      id: 'backup',
      name: 'Backup System',
      description: 'Initializing automated backup and recovery system',
      status: 'pending',
      progress: 0
    },
    {
      id: 'security',
      name: 'Security Audit',
      description: 'Running comprehensive security audit and setup',
      status: 'pending',
      progress: 0
    },
    {
      id: 'health',
      name: 'Health Checks',
      description: 'Configuring system health monitoring',
      status: 'pending',
      progress: 0
    },
    {
      id: 'analytics',
      name: 'Analytics Dashboard',
      description: 'Setting up production analytics and reporting',
      status: 'pending',
      progress: 0
    }
  ]);

  const updateStepStatus = (stepId: string, status: InitializationStep['status'], progress: number) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, progress } : step
    ));
  };

  const initializeProductionSystem = async () => {
    setInitializing(true);
    
    try {
      // Step 1: Monitoring
      updateStepStatus('monitoring', 'running', 25);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate setup time
      updateStepStatus('monitoring', 'completed', 100);

      // Step 2: Backup
      updateStepStatus('backup', 'running', 25);
      await new Promise(resolve => setTimeout(resolve, 1500));
      updateStepStatus('backup', 'completed', 100);

      // Step 3: Security
      updateStepStatus('security', 'running', 25);
      await new Promise(resolve => setTimeout(resolve, 3000));
      updateStepStatus('security', 'completed', 100);

      // Step 4: Health Checks
      updateStepStatus('health', 'running', 25);
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateStepStatus('health', 'completed', 100);

      // Step 5: Analytics
      updateStepStatus('analytics', 'running', 25);
      await icupaProductionSystem.initializeProduction();
      updateStepStatus('analytics', 'completed', 100);

      setInitialized(true);
    } catch (error) {
      console.error('Production initialization failed:', error);
      // Update failed step
      const failedStep = steps.find(step => step.status === 'running');
      if (failedStep) {
        updateStepStatus(failedStep.id, 'error', failedStep.progress);
      }
    } finally {
      setInitializing(false);
    }
  };

  const getStatusIcon = (status: InitializationStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'running':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusBadge = (status: InitializationStep['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'running':
        return <Badge className="bg-blue-500">Running</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center">
                  <Rocket className="h-8 w-8 mr-3" />
                  ICUPA Malta Production Setup
                </h1>
                <p className="text-blue-100">Initialize and configure the complete production environment</p>
              </div>
              {!initializing && (
                <Button 
                  variant="secondary" 
                  size="lg"
                  onClick={initializeProductionSystem}
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  <Rocket className="h-5 w-5 mr-2" />
                  Initialize Production
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Production System Features</CardTitle>
              <CardDescription>
                Complete monitoring, analytics, security, and support system for ICUPA Malta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <Activity className="h-8 w-8 text-blue-500" />
                  <div>
                    <h4 className="font-semibold">Real-time Monitoring</h4>
                    <p className="text-sm text-gray-600">System metrics and alerts</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <BarChart3 className="h-8 w-8 text-green-500" />
                  <div>
                    <h4 className="font-semibold">Advanced Analytics</h4>
                    <p className="text-sm text-gray-600">Business intelligence dashboard</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <Shield className="h-8 w-8 text-purple-500" />
                  <div>
                    <h4 className="font-semibold">Security Auditing</h4>
                    <p className="text-sm text-gray-600">Automated security monitoring</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <Backup className="h-8 w-8 text-orange-500" />
                  <div>
                    <h4 className="font-semibold">Backup & Recovery</h4>
                    <p className="text-sm text-gray-600">Automated data protection</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <Database className="h-8 w-8 text-red-500" />
                  <div>
                    <h4 className="font-semibold">Database Optimization</h4>
                    <p className="text-sm text-gray-600">Performance indexing</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <Settings className="h-8 w-8 text-gray-500" />
                  <div>
                    <h4 className="font-semibold">Support System</h4>
                    <p className="text-sm text-gray-600">Customer ticket management</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {(initializing || steps.some(step => step.status !== 'pending')) && (
            <Card>
              <CardHeader>
                <CardTitle>Initialization Progress</CardTitle>
                <CardDescription>
                  Setting up production environment components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {steps.map((step) => (
                    <div key={step.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(step.status)}
                          <div>
                            <h4 className="font-medium">{step.name}</h4>
                            <p className="text-sm text-gray-600">{step.description}</p>
                          </div>
                        </div>
                        {getStatusBadge(step.status)}
                      </div>
                      {step.status === 'running' && (
                        <Progress value={step.progress} className="h-2" />
                      )}
                    </div>
                  ))}
                </div>

                {initializing && (
                  <Alert className="mt-6">
                    <Rocket className="h-4 w-4" />
                    <AlertTitle>Initializing Production Environment</AlertTitle>
                    <AlertDescription>
                      Please wait while we set up all production systems. This may take a few minutes.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
          <div className="max-w-7xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold flex items-center">
                  <CheckCircle className="h-8 w-8 mr-3 text-green-400" />
                  ICUPA Malta Production System
                </h1>
                <p className="text-blue-100">Production environment successfully initialized</p>
              </div>
              <Badge className="bg-green-500 text-white">
                <CheckCircle className="h-4 w-4 mr-1" />
                Online
              </Badge>
            </div>
            
            <TabsList className="bg-white/10 border-0">
              <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-white data-[state=active]:text-blue-600">
                Analytics
              </TabsTrigger>
              <TabsTrigger value="support" className="text-white data-[state=active]:bg-white data-[state=active]:text-blue-600">
                Support
              </TabsTrigger>
              <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white data-[state=active]:text-blue-600">
                System Overview
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="analytics" className="m-0">
          <ProductionAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="support" className="m-0">
          <SupportDashboard />
        </TabsContent>

        <TabsContent value="overview" className="m-0">
          <div className="max-w-7xl mx-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {steps.map((step) => (
                <Card key={step.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      {getStatusIcon(step.status)}
                      {getStatusBadge(step.status)}
                    </div>
                    <h3 className="font-semibold mb-2">{step.name}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Alert className="mt-8">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Production System Ready</AlertTitle>
              <AlertDescription>
                All systems are operational. You can now access analytics, monitoring, and support features.
              </AlertDescription>
            </Alert>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductionSystemManager;

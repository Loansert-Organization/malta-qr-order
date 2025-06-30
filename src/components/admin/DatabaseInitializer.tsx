import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, Database, MapPin, Bell } from 'lucide-react';
import { databaseInitializer } from '@/services/databaseInitializer';
import { useToast } from '@/hooks/use-toast';

const DatabaseInitializer: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [initResults, setInitResults] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const { toast } = useToast();

  const handleInitialize = async () => {
    setIsInitializing(true);
    try {
      const results = await databaseInitializer.initializeCompleteBackend();
      setInitResults(results);
      
      if (results.success) {
        toast({
          title: "Backend Initialized Successfully! 🎉",
          description: "Database integration is now complete with Malta bars data.",
        });
      } else {
        toast({
          title: "Initialization Issues",
          description: "Some components may not be fully set up. Check the details below.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Initialization Failed",
        description: "There was an error setting up the backend integration.",
        variant: "destructive"
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    try {
      const results = await databaseInitializer.testBackendIntegration();
      setTestResults(results);
      
      if (results.success) {
        toast({
          title: "All Tests Passed! ✅",
          description: "Backend integration is working perfectly.",
        });
      } else {
        toast({
          title: "Some Tests Failed",
          description: "Check the test results for details.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Unable to run backend integration tests.",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const StatusBadge: React.FC<{ status: boolean; label: string }> = ({ status, label }) => (
    <Badge variant={status ? "default" : "destructive"} className="flex items-center gap-1">
      {status ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {label}
    </Badge>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Backend Database Integration
          </CardTitle>
          <CardDescription>
            Initialize and test the complete backend integration including Malta bars data, 
            notifications system, and WhatsApp AI agent database setup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button 
              onClick={handleInitialize}
              disabled={isInitializing}
              className="flex items-center gap-2"
            >
              {isInitializing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              {isInitializing ? 'Initializing...' : 'Initialize Backend'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleTest}
              disabled={isTesting}
              className="flex items-center gap-2"
            >
              {isTesting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              {isTesting ? 'Testing...' : 'Test Integration'}
            </Button>
          </div>

          {initResults && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Initialization Results
                  <StatusBadge status={initResults.success} label={initResults.success ? "Success" : "Issues"} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Database Connection
                    </span>
                    <StatusBadge 
                      status={initResults.details.database_accessible} 
                      label={initResults.details.database_accessible ? "Connected" : "Failed"} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Malta Bars Data
                    </span>
                    <StatusBadge 
                      status={initResults.details.bars_data.success} 
                      label={`${initResults.details.bars_data.count} bars`} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Notifications System
                    </span>
                    <StatusBadge 
                      status={initResults.details.notifications.success} 
                      label={`${initResults.details.notifications.count} created`} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      💬 WhatsApp Tables
                    </span>
                    <StatusBadge 
                      status={initResults.details.whatsapp_ready} 
                      label={initResults.details.whatsapp_ready ? "Ready" : "Pending"} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {testResults && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Integration Test Results
                  <StatusBadge status={testResults.success} label={testResults.success ? "All Passed" : "Issues Found"} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(testResults.tests).map(([key, status]) => (
                    key !== 'error' && (
                      <div key={key} className="flex items-center justify-between">
                        <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                        <StatusBadge 
                          status={status as boolean} 
                          label={status ? "Pass" : "Fail"} 
                        />
                      </div>
                    )
                  ))}
                  
                  {testResults.tests.error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">
                        <strong>Error:</strong> {testResults.tests.error}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseInitializer;

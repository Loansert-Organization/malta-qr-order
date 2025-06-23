
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Globe, Menu, Brain, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AutomationControlPanelProps {
  isRunning: boolean;
  progress: number;
  onStartAutomation: (jobType: string) => void;
}

const AutomationControlPanel: React.FC<AutomationControlPanelProps> = ({
  isRunning,
  progress,
  onStartAutomation
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Malta Bars Automation Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Google Maps API configured!</strong> Ready to fetch Malta establishments data.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => onStartAutomation('google_maps_fetch')}
            disabled={isRunning}
            className="flex items-center gap-2 h-16 flex-col"
            variant={isRunning ? "secondary" : "default"}
          >
            <Globe className="h-5 w-5" />
            <div className="text-center">
              <div className="font-medium">Fetch from Google Maps</div>
              <div className="text-xs opacity-75">Collect bar data from Malta</div>
            </div>
          </Button>
          
          <Button
            onClick={() => onStartAutomation('website_discovery')}
            disabled={isRunning}
            className="flex items-center gap-2 h-16 flex-col"
            variant={isRunning ? "secondary" : "default"}
          >
            <Globe className="h-5 w-5" />
            <div className="text-center">
              <div className="font-medium">Discover Websites</div>
              <div className="text-xs opacity-75">Find establishment websites</div>
            </div>
          </Button>
          
          <Button
            onClick={() => onStartAutomation('menu_extraction')}
            disabled={isRunning}
            className="flex items-center gap-2 h-16 flex-col"
            variant={isRunning ? "secondary" : "default"}
          >
            <Menu className="h-5 w-5" />
            <div className="text-center">
              <div className="font-medium">Extract Menus</div>
              <div className="text-xs opacity-75">Parse menu items from websites</div>
            </div>
          </Button>
        </div>
        
        {isRunning && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Processing automation...</span>
              <span className="font-mono text-primary">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full h-3" />
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                🔄 Automation is running in the background. This may take several minutes depending on the amount of data to process.
              </p>
            </div>
          </div>
        )}

        {!isRunning && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-sm text-green-800">
              ✅ System ready. Click any automation button above to start fetching Malta establishments data.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AutomationControlPanel;

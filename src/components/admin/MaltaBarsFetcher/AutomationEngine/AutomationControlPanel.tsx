
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Globe, Menu, Brain, AlertCircle } from 'lucide-react';
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
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Make sure your Google Maps API key is configured in Supabase secrets before running the automation.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => onStartAutomation('google_maps_fetch')}
            disabled={isRunning}
            className="flex items-center gap-2 h-12"
            variant={isRunning ? "secondary" : "default"}
          >
            <Globe className="h-4 w-4" />
            <div className="text-left">
              <div className="font-medium">Fetch from Google Maps</div>
              <div className="text-xs opacity-75">Collect bar data from Malta</div>
            </div>
          </Button>
          
          <Button
            onClick={() => onStartAutomation('website_discovery')}
            disabled={isRunning}
            className="flex items-center gap-2 h-12"
            variant={isRunning ? "secondary" : "default"}
          >
            <Globe className="h-4 w-4" />
            <div className="text-left">
              <div className="font-medium">Discover Websites</div>
              <div className="text-xs opacity-75">Find establishment websites</div>
            </div>
          </Button>
          
          <Button
            onClick={() => onStartAutomation('menu_extraction')}
            disabled={isRunning}
            className="flex items-center gap-2 h-12"
            variant={isRunning ? "secondary" : "default"}
          >
            <Menu className="h-4 w-4" />
            <div className="text-left">
              <div className="font-medium">Extract Menus</div>
              <div className="text-xs opacity-75">Parse menu items from websites</div>
            </div>
          </Button>
        </div>
        
        {isRunning && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Processing automation...</span>
              <span className="font-mono">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full h-2" />
            <p className="text-xs text-muted-foreground">
              This may take several minutes depending on the amount of data to process.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AutomationControlPanel;

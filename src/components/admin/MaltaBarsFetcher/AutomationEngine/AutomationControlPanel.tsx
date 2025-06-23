
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Globe, Menu, Brain } from 'lucide-react';

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => onStartAutomation('google_maps_fetch')}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            <Globe className="h-4 w-4" />
            Fetch from Google Maps
          </Button>
          
          <Button
            onClick={() => onStartAutomation('website_discovery')}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            <Globe className="h-4 w-4" />
            Discover Websites
          </Button>
          
          <Button
            onClick={() => onStartAutomation('menu_extraction')}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            <Menu className="h-4 w-4" />
            Extract Menus
          </Button>
        </div>
        
        {isRunning && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Processing...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AutomationControlPanel;

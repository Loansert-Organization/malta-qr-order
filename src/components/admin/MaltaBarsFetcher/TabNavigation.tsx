
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Database, 
  Settings, 
  FileText, 
  Activity, 
  HardDrive,
  Bot,
  BarChart3
} from 'lucide-react';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'overview', label: 'Bars Overview', icon: Database },
  { id: 'control', label: 'Control Panel', icon: Settings },
  { id: 'automation', label: 'AI Automation', icon: Bot },
  { id: 'analytics', label: 'Menu Analytics', icon: BarChart3 },
  { id: 'logs', label: 'Operation Logs', icon: FileText },
  { id: 'health', label: 'Health Monitor', icon: Activity },
  { id: 'data', label: 'Data Management', icon: HardDrive },
];

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex flex-wrap gap-2 p-1 bg-gray-100 rounded-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            size="sm"
            onClick={() => onTabChange(tab.id)}
            className="flex items-center gap-2"
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </Button>
        );
      })}
    </div>
  );
};

export default TabNavigation;

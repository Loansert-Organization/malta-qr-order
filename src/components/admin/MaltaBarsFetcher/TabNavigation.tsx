
import React from 'react';
import { TabType } from './types';

interface TabNavigationProps {
  activeTab: TabType;
  barsCount: number;
  logsCount: number;
  onTabChange: (tab: TabType) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  barsCount,
  logsCount,
  onTabChange
}) => {
  const tabs = [
    { key: 'bars' as const, label: `Bars (${barsCount})` },
    { key: 'logs' as const, label: `Operation Logs (${logsCount})` },
    { key: 'scheduling' as const, label: 'Scheduling' },
    { key: 'health' as const, label: 'Health & Monitoring' },
    { key: 'management' as const, label: 'Data Management' },
    { key: 'testing' as const, label: 'Testing Suite' },
    { key: 'analytics' as const, label: 'Analytics' }
  ];

  return (
    <div className="flex space-x-1 border-b overflow-x-auto">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`px-4 py-2 font-medium text-sm rounded-t-lg whitespace-nowrap ${
            activeTab === tab.key 
              ? 'bg-white border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

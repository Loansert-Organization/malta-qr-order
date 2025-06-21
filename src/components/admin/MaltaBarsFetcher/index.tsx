
import React from 'react';
import TabNavigation from './TabNavigation';
import BarsTable from './BarsTable';
import ControlPanel from './ControlPanel';
import OperationLogs from './OperationLogs';
import HealthMonitoring from './HealthMonitoring';
import DataManagement from './DataManagement';
import AutomationEngine from './AutomationEngine';
import MenuAnalytics from './MenuAnalytics';

interface MaltaBarsFetcherProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MaltaBarsFetcher: React.FC<MaltaBarsFetcherProps> = ({ activeTab, onTabChange }) => {
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <BarsTable />;
      case 'control':
        return <ControlPanel />;
      case 'automation':
        return <AutomationEngine />;
      case 'analytics':
        return <MenuAnalytics />;
      case 'logs':
        return <OperationLogs />;
      case 'health':
        return <HealthMonitoring />;
      case 'data':
        return <DataManagement />;
      default:
        return <BarsTable />;
    }
  };

  return (
    <div className="space-y-6">
      <TabNavigation activeTab={activeTab} onTabChange={onTabChange} />
      {renderTabContent()}
    </div>
  );
};

export default MaltaBarsFetcher;

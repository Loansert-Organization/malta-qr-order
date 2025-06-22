
import React from 'react';
import { BarsTable } from './BarsTable';
import { ControlPanel } from './ControlPanel';
import AutomationEngine from './AutomationEngine';
import MenuAnalytics from './MenuAnalytics';
import { OperationLogs } from './OperationLogs';
import { HealthMonitoring } from './HealthMonitoring';
import { DataManagement } from './DataManagement';
import { Bar, FetchLog, HealthMetrics } from './types';

interface TabContentRendererProps {
  activeTab: string;
  bars: Bar[];
  isLoading: boolean;
  healthMetrics: HealthMetrics | null;
  lastFetchResult: string;
  operationLogs: FetchLog[];
  onFetchBars: (incremental?: boolean) => void;
  onRefreshAll: () => void;
  onHealthCheck: () => void;
  onExportData: () => void;
  onCleanupDuplicates: () => void;
}

export const TabContentRenderer: React.FC<TabContentRendererProps> = ({
  activeTab,
  bars,
  isLoading,
  healthMetrics,
  lastFetchResult,
  operationLogs,
  onFetchBars,
  onRefreshAll,
  onHealthCheck,
  onExportData,
  onCleanupDuplicates
}) => {
  switch (activeTab) {
    case 'overview':
      return <BarsTable bars={bars} />;
    case 'control':
      return (
        <ControlPanel
          isLoading={isLoading}
          bars={bars}
          healthMetrics={healthMetrics}
          lastFetchResult={lastFetchResult}
          onFetchBars={onFetchBars}
          onRefreshAll={onRefreshAll}
          onHealthCheck={onHealthCheck}
        />
      );
    case 'automation':
      return <AutomationEngine />;
    case 'analytics':
      return <MenuAnalytics />;
    case 'logs':
      return <OperationLogs fetchLogs={operationLogs} />;
    case 'health':
      return <HealthMonitoring healthMetrics={healthMetrics} />;
    case 'data':
      return (
        <DataManagement
          isLoading={isLoading}
          onExportData={onExportData}
          onCleanupDuplicates={onCleanupDuplicates}
        />
      );
    default:
      return <BarsTable bars={bars} />;
  }
};

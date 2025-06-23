
import React, { useState } from 'react';
import TabNavigation from './TabNavigation';
import { TabContentRenderer } from './TabContentRenderer';
import { useMaltaBarsFetcher } from './hooks/useMaltaBarsFetcher';

const MaltaBarsFetcher: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const {
    bars,
    isLoading,
    lastFetchResult,
    healthMetrics,
    operationLogs,
    handleFetchBars,
    handleRefreshAll,
    handleHealthCheck,
    handleExportData,
    handleCleanupDuplicates
  } = useMaltaBarsFetcher();

  return (
    <div className="space-y-6">
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <TabContentRenderer
        activeTab={activeTab}
        bars={bars}
        isLoading={isLoading}
        healthMetrics={healthMetrics}
        lastFetchResult={lastFetchResult}
        operationLogs={operationLogs}
        onFetchBars={handleFetchBars}
        onRefreshAll={handleRefreshAll}
        onHealthCheck={handleHealthCheck}
        onExportData={handleExportData}
        onCleanupDuplicates={handleCleanupDuplicates}
      />
    </div>
  );
};

export default MaltaBarsFetcher;

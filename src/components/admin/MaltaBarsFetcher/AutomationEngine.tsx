
import React from 'react';
import { useAutomationEngine } from './AutomationEngine/useAutomationEngine';
import AutomationControlPanel from './AutomationEngine/AutomationControlPanel';
import AutomationJobHistory from './AutomationEngine/AutomationJobHistory';

const AutomationEngine = () => {
  const {
    jobs,
    isRunning,
    progress,
    startAutomation,
    fetchJobs
  } = useAutomationEngine();

  return (
    <div className="space-y-6">
      <AutomationControlPanel
        isRunning={isRunning}
        progress={progress}
        onStartAutomation={startAutomation}
      />
      
      <AutomationJobHistory
        jobs={jobs}
        isRunning={isRunning}
        onRefresh={fetchJobs}
      />
    </div>
  );
};

export default AutomationEngine;

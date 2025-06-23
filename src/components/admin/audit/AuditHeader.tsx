
import React from 'react';
import { Button } from '@/components/ui/button';

interface AuditHeaderProps {
  onRunAudit: () => void;
  isRunningAudit: boolean;
}

const AuditHeader: React.FC<AuditHeaderProps> = ({ onRunAudit, isRunningAudit }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">ICUPA Malta Fullstack Audit Report</h1>
        <p className="text-gray-600">Comprehensive production readiness analysis</p>
      </div>
      <Button onClick={onRunAudit} disabled={isRunningAudit}>
        {isRunningAudit ? 'Running Audit...' : 'Run New Audit'}
      </Button>
    </div>
  );
};

export default AuditHeader;

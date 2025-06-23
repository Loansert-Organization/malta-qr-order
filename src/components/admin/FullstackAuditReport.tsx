
import React from 'react';
import AuditHeader from './audit/AuditHeader';
import AuditProgress from './audit/AuditProgress';
import AuditSummaryCards from './audit/AuditSummaryCards';
import AuditReadinessAlert from './audit/AuditReadinessAlert';
import AuditCategoryCard from './audit/AuditCategoryCard';
import AuditFinalReport from './audit/AuditFinalReport';
import { useAuditEngine } from './audit/useAuditEngine';

const FullstackAuditReport: React.FC = () => {
  const { auditReport, isRunningAudit, auditProgress, runFullAudit } = useAuditEngine();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <AuditHeader onRunAudit={runFullAudit} isRunningAudit={isRunningAudit} />
      
      <AuditProgress isRunningAudit={isRunningAudit} auditProgress={auditProgress} />

      {auditReport && (
        <>
          <AuditSummaryCards summary={auditReport.summary} />

          <AuditReadinessAlert productionReadinessScore={auditReport.summary.productionReadinessScore} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(auditReport.categories).map(([category, findings]) => (
              <AuditCategoryCard 
                key={category} 
                category={category} 
                findings={findings} 
              />
            ))}
          </div>

          <AuditFinalReport 
            summary={auditReport.summary} 
            timestamp={auditReport.timestamp} 
          />
        </>
      )}
    </div>
  );
};

export default FullstackAuditReport;

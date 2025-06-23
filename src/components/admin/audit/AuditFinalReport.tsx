
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface AuditSummary {
  totalFindings: number;
  criticalIssues: number;
  readyItems: number;
  brokenItems: number;
  productionReadinessScore: number;
}

interface AuditFinalReportProps {
  summary: AuditSummary;
  timestamp: string;
}

const AuditFinalReport: React.FC<AuditFinalReportProps> = ({ summary, timestamp }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Final Production Readiness Assessment</CardTitle>
        <CardDescription>Generated at {new Date(timestamp).toLocaleString()}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded">
              <div className="text-lg font-semibold text-green-600">
                ✅ {summary.readyItems} Ready
              </div>
              <div className="text-sm text-gray-600">Fully functional</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-lg font-semibold text-yellow-600">
                🟡 {summary.totalFindings - summary.readyItems - summary.brokenItems} Need Fixing
              </div>
              <div className="text-sm text-gray-600">Minor improvements</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-lg font-semibold text-red-600">
                🔴 {summary.brokenItems} Broken
              </div>
              <div className="text-sm text-gray-600">Critical issues</div>
            </div>
          </div>

          {summary.productionReadinessScore >= 90 ? (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>🎉 Production Ready!</AlertTitle>
              <AlertDescription>
                System achieved {summary.productionReadinessScore}% readiness score. 
                ICUPA Malta is ready for production deployment.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-orange-500 bg-orange-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Action Required</AlertTitle>
              <AlertDescription>
                {summary.criticalIssues > 0 && `${summary.criticalIssues} critical issues must be resolved. `}
                System needs {90 - summary.productionReadinessScore}% improvement to reach production readiness.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AuditFinalReport;

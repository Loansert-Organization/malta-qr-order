
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Activity } from 'lucide-react';

interface AuditSummary {
  totalFindings: number;
  criticalIssues: number;
  readyItems: number;
  brokenItems: number;
  productionReadinessScore: number;
}

interface AuditSummaryCardsProps {
  summary: AuditSummary;
}

const AuditSummaryCards: React.FC<AuditSummaryCardsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {summary.productionReadinessScore}%
            </div>
            <div className="text-sm text-gray-600">Production Ready</div>
            <Progress 
              value={summary.productionReadinessScore} 
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-600">
                {summary.criticalIssues}
              </div>
              <div className="text-sm text-gray-600">Critical Issues</div>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {summary.readyItems}
              </div>
              <div className="text-sm text-gray-600">Ready Items</div>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                {summary.totalFindings}
              </div>
              <div className="text-sm text-gray-600">Total Findings</div>
            </div>
            <Activity className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditSummaryCards;

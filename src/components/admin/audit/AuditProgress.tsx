
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Activity } from 'lucide-react';

interface AuditProgressProps {
  isRunningAudit: boolean;
  auditProgress: number;
}

const AuditProgress: React.FC<AuditProgressProps> = ({ isRunningAudit, auditProgress }) => {
  if (!isRunningAudit) return null;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <Activity className="h-6 w-6 animate-spin text-blue-500" />
          <div className="flex-1">
            <p className="text-sm font-medium">Running comprehensive audit...</p>
            <Progress value={auditProgress} className="mt-2" />
          </div>
          <span className="text-sm text-gray-500">{auditProgress}%</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuditProgress;

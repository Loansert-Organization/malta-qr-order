
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface AuditReadinessAlertProps {
  productionReadinessScore: number;
}

const AuditReadinessAlert: React.FC<AuditReadinessAlertProps> = ({ productionReadinessScore }) => {
  if (productionReadinessScore >= 80) return null;

  return (
    <Alert className="border-yellow-500 bg-yellow-50">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Production Readiness Warning</AlertTitle>
      <AlertDescription>
        System readiness score is {productionReadinessScore}%. 
        Recommended minimum is 80% for production deployment. 
        Please address critical and high-priority issues.
      </AlertDescription>
    </Alert>
  );
};

export default AuditReadinessAlert;

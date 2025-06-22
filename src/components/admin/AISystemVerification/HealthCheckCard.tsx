
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface SystemHealthCheck {
  component: string;
  status: 'healthy' | 'degraded' | 'down' | 'testing';
  responseTime?: number;
  error?: string;
  details?: string;
}

interface HealthCheckCardProps {
  healthChecks: SystemHealthCheck[];
}

const HealthCheckCard: React.FC<HealthCheckCardProps> = ({ healthChecks }) => {
  const getStatusIcon = (status: SystemHealthCheck['status']) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'down': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'testing': return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: SystemHealthCheck['status']) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      case 'down': return 'bg-red-100 text-red-800';
      case 'testing': return 'bg-blue-100 text-blue-800';
    }
  };

  const overallStatus = healthChecks.every(c => c.status === 'healthy') ? 'healthy' :
                      healthChecks.some(c => c.status === 'down') ? 'down' : 'degraded';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Overall System Status</span>
          <Badge className={getStatusColor(overallStatus)}>
            {overallStatus.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {healthChecks.map((check, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(check.status)}
                <div>
                  <h4 className="font-medium">{check.component}</h4>
                  {check.details && (
                    <p className="text-sm text-gray-600">{check.details}</p>
                  )}
                  {check.error && (
                    <p className="text-sm text-red-600">Error: {check.error}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <Badge className={getStatusColor(check.status)}>
                  {check.status}
                </Badge>
                {check.responseTime && (
                  <p className="text-xs text-gray-500 mt-1">
                    {check.responseTime}ms
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthCheckCard;

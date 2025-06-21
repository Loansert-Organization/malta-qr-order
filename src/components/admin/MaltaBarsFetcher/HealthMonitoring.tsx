
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Activity } from 'lucide-react';
import { HealthMetrics } from './types';

interface HealthMonitoringProps {
  healthMetrics: HealthMetrics | null;
}

export const HealthMonitoring: React.FC<HealthMonitoringProps> = ({ healthMetrics }) => {
  const getHealthStatusColor = (metric: string, value: number) => {
    switch (metric) {
      case 'success_rate':
        if (value >= 95) return 'text-green-600';
        if (value >= 80) return 'text-yellow-600';
        return 'text-red-600';
      case 'data_freshness':
        if (value <= 24) return 'text-green-600';
        if (value <= 48) return 'text-yellow-600';
        return 'text-red-600';
      case 'quota_usage':
        if (value <= 70) return 'text-green-600';
        if (value <= 90) return 'text-yellow-600';
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          System Health & Monitoring
        </CardTitle>
      </CardHeader>
      <CardContent>
        {healthMetrics ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">API Quota Usage</h4>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{healthMetrics.api_quota_used}</span>
                  <span className="text-sm text-gray-500">/ {healthMetrics.api_quota_limit}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${getHealthStatusColor('quota_usage', (healthMetrics.api_quota_used / healthMetrics.api_quota_limit) * 100) === 'text-red-600' ? 'bg-red-500' : getHealthStatusColor('quota_usage', (healthMetrics.api_quota_used / healthMetrics.api_quota_limit) * 100) === 'text-yellow-600' ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min((healthMetrics.api_quota_used / healthMetrics.api_quota_limit) * 100, 100)}%` }}
                  />
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Success Rate</h4>
                <div className={`text-2xl font-bold ${getHealthStatusColor('success_rate', healthMetrics.success_rate)}`}>
                  {Math.round(healthMetrics.success_rate)}%
                </div>
                <p className="text-sm text-gray-500 mt-1">Last 20 operations</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Data Freshness</h4>
                <div className={`text-2xl font-bold ${getHealthStatusColor('data_freshness', healthMetrics.data_freshness_hours)}`}>
                  {healthMetrics.data_freshness_hours}h
                </div>
                <p className="text-sm text-gray-500 mt-1">Since last update</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Performance Metrics</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Avg Response Time:</span>
                  <span className="ml-1 font-medium">{Math.round(healthMetrics.avg_response_time / 1000)}s</span>
                </div>
                <div>
                  <span className="text-gray-600">Last Successful Fetch:</span>
                  <span className="ml-1 font-medium">
                    {healthMetrics.last_successful_fetch 
                      ? new Date(healthMetrics.last_successful_fetch).toLocaleString()
                      : 'Never'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Loading health metrics...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

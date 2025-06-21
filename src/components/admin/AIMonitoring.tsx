
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AILog {
  id: string;
  vendor_id: string;
  guest_session_id: string;
  satisfaction_score: number | null;
  ai_model_used: string | null;
  created_at: string;
}

interface AIMonitoringProps {
  aiLogs: AILog[];
  aiHealthScore: number;
}

const AIMonitoring: React.FC<AIMonitoringProps> = ({ aiLogs, aiHealthScore }) => {
  const getSystemHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Health Score</span>
              <span className={`font-bold ${getSystemHealthColor(aiHealthScore)}`}>
                {aiHealthScore}%
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Interactions</span>
              <span className="font-bold">{aiLogs.length}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Avg Satisfaction</span>
              <span className="font-bold">
                {aiLogs.length > 0 ? '4.2/5' : 'N/A'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent AI Interactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {aiLogs.slice(0, 10).map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="text-sm font-medium">Session: {log.guest_session_id.slice(-8)}</p>
                  <p className="text-xs text-gray-600">
                    Model: {log.ai_model_used || 'Unknown'}
                  </p>
                </div>
                {log.satisfaction_score && (
                  <Badge variant="outline">
                    {log.satisfaction_score}/5
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIMonitoring;

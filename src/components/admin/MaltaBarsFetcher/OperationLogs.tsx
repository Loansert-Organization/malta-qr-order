
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { FetchLog } from './types';

interface OperationLogsProps {
  fetchLogs: FetchLog[];
}

export const OperationLogs: React.FC<OperationLogsProps> = ({ fetchLogs }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Operation Logs</CardTitle>
      </CardHeader>
      <CardContent>
        {fetchLogs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No operation logs found.</p>
        ) : (
          <div className="space-y-4">
            {fetchLogs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(log.status)}
                    <span className="font-semibold capitalize">{log.operation_type}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      log.status === 'completed' ? 'bg-green-100 text-green-800' :
                      log.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Processed:</span>
                    <span className="ml-1 font-medium">{log.total_bars_processed}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">New:</span>
                    <span className="ml-1 font-medium text-green-600">{log.new_bars_added}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Updated:</span>
                    <span className="ml-1 font-medium text-blue-600">{log.bars_updated}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Errors:</span>
                    <span className="ml-1 font-medium text-red-600">{log.errors_count}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">API Calls:</span>
                    <span className="ml-1 font-medium">{log.api_calls_made}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <span className="ml-1 font-medium">{Math.round(log.operation_duration_ms / 1000)}s</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

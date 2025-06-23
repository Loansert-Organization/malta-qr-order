
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import AutomationJobItem from './AutomationJobItem';

interface AutomationJob {
  id: string;
  job_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  target_url?: string;
  bar_id?: string;
  progress_data?: any;
  error_message?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

interface AutomationJobHistoryProps {
  jobs: AutomationJob[];
  isRunning: boolean;
  onRefresh: () => void;
}

const AutomationJobHistory: React.FC<AutomationJobHistoryProps> = ({
  jobs,
  isRunning,
  onRefresh
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Automation Jobs</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRunning}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {jobs.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No automation jobs yet</p>
          ) : (
            jobs.map((job) => (
              <AutomationJobItem key={job.id} job={job} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AutomationJobHistory;

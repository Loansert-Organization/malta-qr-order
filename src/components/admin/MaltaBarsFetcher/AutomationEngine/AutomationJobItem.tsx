
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Globe, Menu, Brain } from 'lucide-react';
import { getStatusColor } from './automationUtils';

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

interface AutomationJobItemProps {
  job: AutomationJob;
}

const AutomationJobItem: React.FC<AutomationJobItemProps> = ({ job }) => {
  const getJobIcon = (jobType: string) => {
    switch (jobType) {
      case 'google_maps_fetch': return <Globe className="h-4 w-4" />;
      case 'menu_extraction': return <Menu className="h-4 w-4" />;
      case 'website_discovery': return <Globe className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        {getJobIcon(job.job_type)}
        <div>
          <p className="font-medium">{job.job_type.replace('_', ' ')}</p>
          <p className="text-sm text-gray-500">
            {new Date(job.created_at).toLocaleString()}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Badge className={getStatusColor(job.status)}>
          {job.status}
        </Badge>
        {job.progress_data?.items_extracted && (
          <span className="text-sm text-gray-500">
            {job.progress_data.items_extracted} items
          </span>
        )}
      </div>
    </div>
  );
};

export default AutomationJobItem;

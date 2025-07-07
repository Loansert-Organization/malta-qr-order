import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, FileText } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminSystemLogs: React.FC = () => {
  return (
    <AdminLayout title="System Logs" subtitle="View system activity and logs">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Activity Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="font-medium mb-2">System Logs</h3>
            <p className="text-gray-600 mb-4">
              View system activity, errors, and performance logs
            </p>
            <Badge variant="outline">Coming Soon</Badge>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminSystemLogs; 
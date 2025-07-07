import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Cog } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminSettings: React.FC = () => {
  return (
    <AdminLayout title="Admin Settings" subtitle="System configuration and preferences">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Cog className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="font-medium mb-2">System Configuration</h3>
            <p className="text-gray-600 mb-4">
              Configure platform settings, integrations, and preferences
            </p>
            <Badge variant="outline">Coming Soon</Badge>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminSettings;
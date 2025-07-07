import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Music } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminEntertainers: React.FC = () => {
  return (
    <AdminLayout title="Entertainers Directory" subtitle="Manage entertainers and performers">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Entertainers Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Music className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="font-medium mb-2">Entertainers Directory</h3>
            <p className="text-gray-600 mb-4">
              Manage entertainers, performers, and booking system
            </p>
            <Badge variant="outline">Coming Soon</Badge>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminEntertainers;
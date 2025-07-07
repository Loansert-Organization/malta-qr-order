import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Store, Package } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminSuppliers: React.FC = () => {
  return (
    <AdminLayout title="Suppliers Directory" subtitle="Manage suppliers and vendors">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Suppliers Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="font-medium mb-2">Suppliers Directory</h3>
            <p className="text-gray-600 mb-4">
              Manage suppliers, inventory, and procurement system
            </p>
            <Badge variant="outline">Coming Soon</Badge>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminSuppliers;
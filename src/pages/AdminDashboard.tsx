import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, ShoppingCart, TrendingUp, Settings, Database, Building2, Image, Globe } from 'lucide-react';
import AdminOrderTracking from '@/components/admin/AdminOrderTracking';
import DatabaseInitializer from '@/components/admin/DatabaseInitializer';
import BulkDataManager from '@/components/admin/BulkDataManager';
import MenuImageGenerator from '@/components/admin/MenuImageGenerator';
import GoogleMapsDataFetcher from '@/components/admin/GoogleMapsDataFetcher';
import MenuImporter from '@/components/admin/MenuImporter';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">ICUPA Malta Admin</h1>
              <p className="text-gray-600">System Administration & Data Tools</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="data-tools" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="data-tools">Data Tools</TabsTrigger>
            <TabsTrigger value="database">Database Setup</TabsTrigger>
            <TabsTrigger value="orders">Order Tracking</TabsTrigger>
            <TabsTrigger value="settings">System Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="data-tools" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MenuImageGenerator />
              <GoogleMapsDataFetcher />
            </div>
            <div className="mt-6">
              <MenuImporter />
            </div>
            <div className="mt-6">
              <BulkDataManager />
            </div>
          </TabsContent>

          <TabsContent value="database" className="mt-6">
            <DatabaseInitializer />
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <AdminOrderTracking />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>System settings coming soon</p>
                  <p className="text-sm">Configure platform settings, AI models, and integrations</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;

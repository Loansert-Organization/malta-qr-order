
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminOverview } from '@/components/admin/AdminOverview';
import { VendorManagement } from '@/components/admin/VendorManagement';
import { FinancialOverview } from '@/components/admin/FinancialOverview';
import { AIMonitoring } from '@/components/admin/AIMonitoring';
import { SystemHealth } from '@/components/admin/SystemHealth';
import { LegalCompliance } from '@/components/admin/LegalCompliance';
import { MaltaBarsFetcher } from '@/components/admin/MaltaBarsFetcher';

const AdminPanel = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ICUPA Admin Panel</h1>
          <p className="text-gray-600 mt-2">Manage your hospitality platform</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="bars">Malta Bars</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="ai">AI Monitoring</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="legal">Legal</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminOverview />
          </TabsContent>

          <TabsContent value="vendors">
            <VendorManagement />
          </TabsContent>

          <TabsContent value="bars">
            <MaltaBarsFetcher />
          </TabsContent>

          <TabsContent value="financial">
            <FinancialOverview />
          </TabsContent>

          <TabsContent value="ai">
            <AIMonitoring />
          </TabsContent>

          <TabsContent value="system">
            <SystemHealth />
          </TabsContent>

          <TabsContent value="legal">
            <LegalCompliance />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;

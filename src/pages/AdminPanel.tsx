
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AdminOverview from '@/components/admin/AdminOverview';
import VendorManagement from '@/components/admin/VendorManagement';
import VendorApproval from '@/components/admin/VendorApproval';
import SystemHealth from '@/components/admin/SystemHealth';
import AIMonitoring from '@/components/admin/AIMonitoring';
import FinancialOverview from '@/components/admin/FinancialOverview';
import AnalyticsLayout from '@/components/analytics/AnalyticsLayout';
import { MaltaBarsFetcher } from '@/components/admin/MaltaBarsFetcher';
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  Activity, 
  Bot, 
  Euro, 
  MapPin,
  BarChart3
} from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">ICUPA Admin Panel</h1>
              <p className="text-blue-100">Comprehensive platform management and analytics</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-white/20 text-white">
                Malta Hospitality Platform
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white">
                AI-Powered
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8 mb-8">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <LayoutDashboard className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="vendors" className="flex items-center space-x-2">
              <Store className="h-4 w-4" />
              <span>Vendors</span>
            </TabsTrigger>
            <TabsTrigger value="approval" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Approval</span>
            </TabsTrigger>
            <TabsTrigger value="health" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Health</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center space-x-2">
              <Bot className="h-4 w-4" />
              <span>AI Monitor</span>
            </TabsTrigger>
            <TabsTrigger value="finance" className="flex items-center space-x-2">
              <Euro className="h-4 w-4" />
              <span>Finance</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="malta-data" className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Malta Data</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminOverview />
          </TabsContent>

          <TabsContent value="vendors">
            <VendorManagement 
              vendors={[]} 
              onToggleVendorStatus={() => {}} 
              onSelectVendor={() => {}} 
            />
          </TabsContent>

          <TabsContent value="approval">
            <VendorApproval />
          </TabsContent>

          <TabsContent value="health">
            <SystemHealth />
          </TabsContent>

          <Tab  Content value="ai">
            <AIMonitoring />
          </TabsContent>

          <TabsContent value="finance">
            <FinancialOverview />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsLayout />
          </TabsContent>

          <TabsContent value="malta-data">
            <MaltaBarsFetcher />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;


import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminOverview from './AdminOverview';
import VendorManagement from './VendorManagement';
import VendorApproval from './VendorApproval';
import SystemHealth from './SystemHealth';
import AIMonitoring from './AIMonitoring';
import FinancialOverview from './FinancialOverview';
import AnalyticsLayout from '@/components/analytics/AnalyticsLayout';
import MaltaBarsFetcher from './MaltaBarsFetcher';
import ProductionAuditDashboard from '@/components/audit/ProductionAuditDashboard';
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  Activity, 
  Bot, 
  DollarSign, 
  MapPin,
  BarChart3,
  Shield
} from 'lucide-react';

interface AdminTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AdminTabs: React.FC<AdminTabsProps> = ({ activeTab, setActiveTab }) => {
  // Mock vendors data for now to prevent blank pages
  const mockVendors = [
    {
      id: '1',
      name: 'Demo Restaurant',
      slug: 'demo-restaurant',
      location: 'Valletta, Malta',
      active: true,
      created_at: new Date().toISOString()
    }
  ];

  const handleToggleVendorStatus = (vendorId: string, currentStatus: boolean) => {
    console.log('Toggle vendor status:', vendorId, currentStatus);
  };

  const handleSelectVendor = (vendor: any) => {
    console.log('Select vendor:', vendor);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-9 mb-8">
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
            <DollarSign className="h-4 w-4" />
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
          <TabsTrigger value="audit" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Production Audit</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <AdminOverview />
        </TabsContent>

        <TabsContent value="vendors">
          <VendorManagement 
            vendors={mockVendors} 
            onToggleVendorStatus={handleToggleVendorStatus} 
            onSelectVendor={handleSelectVendor} 
          />
        </TabsContent>

        <TabsContent value="approval">
          <VendorApproval />
        </TabsContent>

        <TabsContent value="health">
          <SystemHealth />
        </TabsContent>

        <TabsContent value="ai">
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

        <TabsContent value="audit">
          <ProductionAuditDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminTabs;


import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminOverview from '@/components/admin/AdminOverview';
import VendorManagement from '@/components/admin/VendorManagement';
import FinancialOverview from '@/components/admin/FinancialOverview';
import AIMonitoring from '@/components/admin/AIMonitoring';
import SystemHealth from '@/components/admin/SystemHealth';
import LegalCompliance from '@/components/admin/LegalCompliance';
import { MaltaBarsFetcher } from '@/components/admin/MaltaBarsFetcher';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AdminPanel = () => {
  const [vendors, setVendors] = useState([]);
  const [aiLogs, setAiLogs] = useState([]);
  const [financialData, setFinancialData] = useState(null);
  const [termsConditions, setTermsConditions] = useState([]);
  const [privacyPolicies, setPrivacyPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiHealthScore, setAiHealthScore] = useState(85);
  const { toast } = useToast();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Fetch vendors
      const { data: vendorsData } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch AI logs
      const { data: aiLogsData } = await supabase
        .from('ai_waiter_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      // Fetch financial data
      const { data: ordersData } = await supabase
        .from('orders')
        .select('total_amount, payment_method, payment_status')
        .eq('payment_status', 'completed');

      // Calculate financial metrics
      const totalRevenue = ordersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const stripeRevenue = ordersData?.filter(o => o.payment_method === 'stripe').reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const revolutRevenue = ordersData?.filter(o => o.payment_method === 'revolut').reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const ordersCount = ordersData?.length || 0;
      const avgOrderValue = ordersCount > 0 ? totalRevenue / ordersCount : 0;

      // Fetch terms and conditions
      const { data: termsData } = await supabase
        .from('terms_and_conditions')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch privacy policies
      const { data: privacyData } = await supabase
        .from('privacy_policy')
        .select('*')
        .order('created_at', { ascending: false });

      setVendors(vendorsData || []);
      setAiLogs(aiLogsData || []);
      setFinancialData({
        total_revenue: totalRevenue,
        stripe_revenue: stripeRevenue,
        revolut_revenue: revolutRevenue,
        orders_count: ordersCount,
        avg_order_value: avgOrderValue
      });
      setTermsConditions(termsData || []);
      setPrivacyPolicies(privacyData || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive"
      });
    }
  };

  const handleToggleVendorStatus = async (vendorId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .update({ active: !currentStatus })
        .eq('id', vendorId);

      if (error) throw error;

      setVendors(prev => prev.map(vendor => 
        vendor.id === vendorId 
          ? { ...vendor, active: !currentStatus }
          : vendor
      ));

      toast({
        title: "Success",
        description: `Vendor ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      console.error('Error toggling vendor status:', error);
      toast({
        title: "Error",
        description: "Failed to update vendor status",
        variant: "destructive"
      });
    }
  };

  const handleSelectVendor = (vendor) => {
    console.log('Selected vendor:', vendor);
    // TODO: Implement vendor details view
  };

  const handleCreateDocument = async (data) => {
    setLoading(true);
    try {
      const table = data.type === 'terms' ? 'terms_and_conditions' : 'privacy_policy';
      
      const { error } = await supabase
        .from(table)
        .insert({
          version: data.version,
          content: data.content,
          effective_date: new Date().toISOString(),
          active: false
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `${data.type === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'} created successfully`
      });

      await fetchAdminData();
    } catch (error) {
      console.error('Error creating document:', error);
      toast({
        title: "Error",
        description: "Failed to create document",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleActivateDocument = async (id, type) => {
    setLoading(true);
    try {
      const table = type === 'terms' ? 'terms_and_conditions' : 'privacy_policy';
      
      // First, deactivate all documents of this type
      await supabase
        .from(table)
        .update({ active: false })
        .eq('active', true);

      // Then activate the selected document
      const { error } = await supabase
        .from(table)
        .update({ active: true })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Document activated successfully`
      });

      await fetchAdminData();
    } catch (error) {
      console.error('Error activating document:', error);
      toast({
        title: "Error",
        description: "Failed to activate document",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
            <AdminOverview 
              vendors={vendors}
              aiHealthScore={aiHealthScore}
              financialData={financialData}
            />
          </TabsContent>

          <TabsContent value="vendors">
            <VendorManagement 
              vendors={vendors}
              onToggleVendorStatus={handleToggleVendorStatus}
              onSelectVendor={handleSelectVendor}
            />
          </TabsContent>

          <TabsContent value="bars">
            <MaltaBarsFetcher />
          </TabsContent>

          <TabsContent value="financial">
            <FinancialOverview financialData={financialData} />
          </TabsContent>

          <TabsContent value="ai">
            <AIMonitoring 
              aiLogs={aiLogs}
              aiHealthScore={aiHealthScore}
            />
          </TabsContent>

          <TabsContent value="system">
            <SystemHealth />
          </TabsContent>

          <TabsContent value="legal">
            <LegalCompliance 
              termsConditions={termsConditions}
              privacyPolicies={privacyPolicies}
              onCreateDocument={handleCreateDocument}
              onActivateDocument={handleActivateDocument}
              loading={loading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;

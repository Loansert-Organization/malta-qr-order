
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// Import refactored components
import AdminOverview from '@/components/admin/AdminOverview';
import VendorManagement from '@/components/admin/VendorManagement';
import AIMonitoring from '@/components/admin/AIMonitoring';
import FinancialOverview from '@/components/admin/FinancialOverview';
import LegalCompliance from '@/components/admin/LegalCompliance';
import OrderAgreements from '@/components/admin/OrderAgreements';
import SystemHealth from '@/components/admin/SystemHealth';
import GDPRCompliance from '@/components/admin/GDPRCompliance';

interface Vendor {
  id: string;
  name: string;
  slug: string;
  location: string;
  active: boolean;
  created_at: string;
}

interface AILog {
  id: string;
  vendor_id: string;
  guest_session_id: string;
  satisfaction_score: number | null;
  ai_model_used: string | null;
  created_at: string;
}

interface FinancialData {
  total_revenue: number;
  stripe_revenue: number;
  revolut_revenue: number;
  orders_count: number;
  avg_order_value: number;
}

interface LegalDocument {
  id: string;
  version: string;
  content: string;
  effective_date: string;
  active: boolean;
  created_at: string;
}

interface OrderAgreement {
  id: string;
  order_id: string;
  guest_session_id: string;
  agreed_to_terms: boolean;
  agreed_to_privacy: boolean;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

const AdminPanel = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [aiLogs, setAiLogs] = useState<AILog[]>([]);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [termsConditions, setTermsConditions] = useState<LegalDocument[]>([]);
  const [privacyPolicies, setPrivacyPolicies] = useState<LegalDocument[]>([]);
  const [orderAgreements, setOrderAgreements] = useState<OrderAgreement[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const { toast } = useToast();

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchAILogs = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_waiter_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setAiLogs(data || []);
    } catch (error) {
      console.error('Error fetching AI logs:', error);
    }
  };

  const fetchFinancialData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('vendor-analytics', {
        body: { type: 'financial_overview' }
      });

      if (error) throw error;
      setFinancialData(data);
    } catch (error) {
      console.error('Error fetching financial data:', error);
    }
  };

  const fetchLegalDocuments = async () => {
    try {
      const [termsResult, privacyResult] = await Promise.all([
        supabase.from('terms_and_conditions').select('*').order('created_at', { ascending: false }),
        supabase.from('privacy_policy').select('*').order('created_at', { ascending: false })
      ]);

      if (termsResult.error) throw termsResult.error;
      if (privacyResult.error) throw privacyResult.error;

      setTermsConditions(termsResult.data || []);
      setPrivacyPolicies(privacyResult.data || []);
    } catch (error) {
      console.error('Error fetching legal documents:', error);
    }
  };

  const fetchOrderAgreements = async () => {
    try {
      // Mock data for now - will be replaced when order_agreements table is available
      setOrderAgreements([]);
    } catch (error) {
      console.error('Error fetching order agreements:', error);
    }
  };

  const toggleVendorStatus = async (vendorId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .update({ active: !currentStatus })
        .eq('id', vendorId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Vendor ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });

      fetchVendors();
    } catch (error) {
      console.error('Error toggling vendor status:', error);
      toast({
        title: "Error",
        description: "Failed to update vendor status",
        variant: "destructive"
      });
    }
  };

  const createLegalDocument = async (data: { type: 'terms' | 'privacy'; version: string; content: string }) => {
    if (!data.version || !data.content) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const table = data.type === 'terms' ? 'terms_and_conditions' : 'privacy_policy';
      
      // First, deactivate all existing documents of this type
      await supabase
        .from(table)
        .update({ active: false })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      // Then create the new document as active
      const { error } = await supabase
        .from(table)
        .insert({
          version: data.version,
          content: data.content,
          effective_date: new Date().toISOString(),
          active: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `New ${data.type === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'} created successfully`,
      });

      fetchLegalDocuments();
    } catch (error) {
      console.error('Error creating legal document:', error);
      toast({
        title: "Error",
        description: "Failed to create legal document",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const activateDocument = async (id: string, type: 'terms' | 'privacy') => {
    try {
      const table = type === 'terms' ? 'terms_and_conditions' : 'privacy_policy';
      
      // Deactivate all documents of this type
      await supabase
        .from(table)
        .update({ active: false })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      // Activate the selected document
      const { error } = await supabase
        .from(table)
        .update({ active: true })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document activated successfully",
      });

      fetchLegalDocuments();
    } catch (error) {
      console.error('Error activating document:', error);
      toast({
        title: "Error",
        description: "Failed to activate document",
        variant: "destructive"
      });
    }
  };

  const getAIHealthScore = () => {
    if (aiLogs.length === 0) return 0;
    const logsWithScores = aiLogs.filter(log => log.satisfaction_score !== null);
    if (logsWithScores.length === 0) return 0;
    
    const avgScore = logsWithScores.reduce((sum, log) => sum + (log.satisfaction_score || 0), 0) / logsWithScores.length;
    return Math.round(avgScore * 20);
  };

  useEffect(() => {
    fetchVendors();
    fetchAILogs();
    fetchFinancialData();
    fetchLegalDocuments();
    fetchOrderAgreements();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600 mt-1">ICUPA Malta Management Dashboard</p>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            System Online
          </Badge>
        </div>

        {/* Overview Cards */}
        <AdminOverview 
          vendors={vendors}
          aiHealthScore={getAIHealthScore()}
          financialData={financialData}
        />

        {/* Main Content Tabs */}
        <Tabs defaultValue="vendors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="ai-monitoring">AI Monitoring</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="legal">Legal</TabsTrigger>
            <TabsTrigger value="gdpr">GDPR</TabsTrigger>
            <TabsTrigger value="agreements">Agreements</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="vendors">
            <VendorManagement
              vendors={vendors}
              onToggleVendorStatus={toggleVendorStatus}
              onSelectVendor={setSelectedVendor}
            />
          </TabsContent>

          <TabsContent value="ai-monitoring">
            <AIMonitoring
              aiLogs={aiLogs}
              aiHealthScore={getAIHealthScore()}
            />
          </TabsContent>

          <TabsContent value="financial">
            <FinancialOverview financialData={financialData} />
          </TabsContent>

          <TabsContent value="legal">
            <LegalCompliance
              termsConditions={termsConditions}
              privacyPolicies={privacyPolicies}
              onCreateDocument={createLegalDocument}
              onActivateDocument={activateDocument}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="gdpr">
            <GDPRCompliance />
          </TabsContent>

          <TabsContent value="agreements">
            <OrderAgreements orderAgreements={orderAgreements} />
          </TabsContent>

          <TabsContent value="system">
            <SystemHealth />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;

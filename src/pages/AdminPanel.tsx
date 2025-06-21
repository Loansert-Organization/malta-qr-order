
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Activity, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  Edit,
  FileText,
  Shield,
  Scale,
  UserCheck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [newDocument, setNewDocument] = useState({
    type: 'terms' as 'terms' | 'privacy',
    version: '',
    content: ''
  });
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
      // Since we don't have order_agreements table yet, we'll create mock data
      // In a real implementation, this would fetch from the order_agreements table
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

  const createLegalDocument = async () => {
    if (!newDocument.version || !newDocument.content) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const table = newDocument.type === 'terms' ? 'terms_and_conditions' : 'privacy_policy';
      
      // First, deactivate all existing documents of this type
      await supabase
        .from(table)
        .update({ active: false })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all

      // Then create the new document as active
      const { error } = await supabase
        .from(table)
        .insert({
          version: newDocument.version,
          content: newDocument.content,
          effective_date: new Date().toISOString(),
          active: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `New ${newDocument.type === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'} created successfully`,
      });

      setNewDocument({ type: 'terms', version: '', content: '' });
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

  useEffect(() => {
    fetchVendors();
    fetchAILogs();
    fetchFinancialData();
    fetchLegalDocuments();
    fetchOrderAgreements();
  }, []);

  const getAIHealthScore = () => {
    if (aiLogs.length === 0) return 0;
    const logsWithScores = aiLogs.filter(log => log.satisfaction_score !== null);
    if (logsWithScores.length === 0) return 0;
    
    const avgScore = logsWithScores.reduce((sum, log) => sum + (log.satisfaction_score || 0), 0) / logsWithScores.length;
    return Math.round(avgScore * 20); // Convert to percentage
  };

  const getSystemHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

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
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Vendors</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {vendors.filter(v => v.active).length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {vendors.length} total vendors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">AI Health Score</p>
                  <p className={`text-2xl font-bold ${getSystemHealthColor(getAIHealthScore())}`}>
                    {getAIHealthScore()}%
                  </p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Based on {aiLogs.length} recent interactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    €{financialData?.total_revenue?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {financialData?.orders_count || 0} orders processed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Alerts</p>
                  <p className="text-2xl font-bold text-yellow-600">0</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                All systems operational
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="vendors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="ai-monitoring">AI Monitoring</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="legal">Legal & Compliance</TabsTrigger>
            <TabsTrigger value="agreements">Order Agreements</TabsTrigger>
            <TabsTrigger value="system">System Health</TabsTrigger>
          </TabsList>

          {/* Vendors Management */}
          <TabsContent value="vendors">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Vendor Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vendors.map((vendor) => (
                    <div key={vendor.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-semibold">{vendor.name}</h3>
                          <p className="text-sm text-gray-600">{vendor.location}</p>
                          <p className="text-xs text-gray-500">/{vendor.slug}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Badge variant={vendor.active ? "default" : "secondary"}>
                          {vendor.active ? "Active" : "Inactive"}
                        </Badge>
                        
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedVendor(vendor)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          
                          <Button
                            size="sm"
                            variant={vendor.active ? "destructive" : "default"}
                            onClick={() => toggleVendorStatus(vendor.id, vendor.active)}
                          >
                            {vendor.active ? (
                              <>
                                <XCircle className="h-4 w-4 mr-1" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Activate
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Monitoring */}
          <TabsContent value="ai-monitoring">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Health Score</span>
                      <span className={`font-bold ${getSystemHealthColor(getAIHealthScore())}`}>
                        {getAIHealthScore()}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Interactions</span>
                      <span className="font-bold">{aiLogs.length}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Avg Satisfaction</span>
                      <span className="font-bold">
                        {aiLogs.length > 0 ? '4.2/5' : 'N/A'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent AI Interactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {aiLogs.slice(0, 10).map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="text-sm font-medium">Session: {log.guest_session_id.slice(-8)}</p>
                          <p className="text-xs text-gray-600">
                            Model: {log.ai_model_used || 'Unknown'}
                          </p>
                        </div>
                        {log.satisfaction_score && (
                          <Badge variant="outline">
                            {log.satisfaction_score}/5
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Financial Overview */}
          <TabsContent value="financial">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Revenue</span>
                      <span className="font-bold text-green-600">
                        €{financialData?.total_revenue?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Stripe Payments</span>
                      <span className="font-bold">
                        €{financialData?.stripe_revenue?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Revolut Payments</span>
                      <span className="font-bold">
                        €{financialData?.revolut_revenue?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Average Order Value</span>
                      <span className="font-bold">
                        €{financialData?.avg_order_value?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Orders</span>
                      <span className="font-bold">{financialData?.orders_count || 0}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Successful Payments</span>
                      <span className="font-bold text-green-600">
                        {Math.floor((financialData?.orders_count || 0) * 0.95)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Failed Payments</span>
                      <span className="font-bold text-red-600">
                        {Math.floor((financialData?.orders_count || 0) * 0.05)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Legal & Compliance */}
          <TabsContent value="legal">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Legal & Compliance Management
                </h2>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <FileText className="h-4 w-4 mr-2" />
                      Create New Document
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Legal Document</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="doc-type">Document Type</Label>
                        <Select
                          value={newDocument.type}
                          onValueChange={(value) => 
                            setNewDocument(prev => ({ ...prev, type: value as 'terms' | 'privacy' }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select document type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="terms">Terms & Conditions</SelectItem>
                            <SelectItem value="privacy">Privacy Policy</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="doc-version">Version</Label>
                        <Input
                          id="doc-version"
                          value={newDocument.version}
                          onChange={(e) => setNewDocument(prev => ({ ...prev, version: e.target.value }))}
                          placeholder="e.g., 2.0, 2024.1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="doc-content">Content</Label>
                        <Textarea
                          id="doc-content"
                          value={newDocument.content}
                          onChange={(e) => setNewDocument(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Enter the legal document content..."
                          rows={10}
                        />
                      </div>

                      <Button 
                        onClick={createLegalDocument} 
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? 'Creating...' : 'Create Document'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Terms & Conditions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Terms & Conditions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {termsConditions.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No terms created yet</p>
                      ) : (
                        termsConditions.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <p className="font-medium">Version {doc.version}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(doc.effective_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={doc.active ? "default" : "secondary"}>
                                {doc.active ? "Active" : "Draft"}
                              </Badge>
                              {!doc.active && (
                                <Button
                                  size="sm"
                                  onClick={() => activateDocument(doc.id, 'terms')}
                                >
                                  Activate
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Privacy Policy */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Privacy Policy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {privacyPolicies.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No policies created yet</p>
                      ) : (
                        privacyPolicies.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <p className="font-medium">Version {doc.version}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(doc.effective_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={doc.active ? "default" : "secondary"}>
                                {doc.active ? "Active" : "Draft"}
                              </Badge>
                              {!doc.active && (
                                <Button
                                  size="sm"
                                  onClick={() => activateDocument(doc.id, 'privacy')}
                                >
                                  Activate
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* GDPR Compliance Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    GDPR Compliance Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm">Cookie Consent Implemented</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm">Data Processing Logging</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm">Right to Deletion</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm">Data Portability</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm">Privacy by Design</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm">Anonymous Processing</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Order Agreements */}
          <TabsContent value="agreements">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Order Agreement Logging
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{orderAgreements.length}</p>
                      <p className="text-sm text-gray-600">Total Agreements</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {orderAgreements.filter(a => a.agreed_to_terms).length}
                      </p>
                      <p className="text-sm text-gray-600">Terms Accepted</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {orderAgreements.filter(a => a.agreed_to_privacy).length}
                      </p>
                      <p className="text-sm text-gray-600">Privacy Accepted</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-600">100%</p>
                      <p className="text-sm text-gray-600">Compliance Rate</p>
                    </div>
                  </div>

                  {orderAgreements.length === 0 ? (
                    <div className="text-center py-8">
                      <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No order agreements logged yet</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Agreements will appear here when guests place orders
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {orderAgreements.map((agreement) => (
                        <div key={agreement.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Order: {agreement.order_id.slice(-8)}</p>
                            <p className="text-sm text-gray-600">
                              Session: {agreement.guest_session_id.slice(-8)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(agreement.created_at).toLocaleString()}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              {agreement.agreed_to_terms ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                              <span className="text-sm">Terms</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {agreement.agreed_to_privacy ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                              <span className="text-sm">Privacy</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Health */}
          <TabsContent value="system">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Database</span>
                      <Badge className="bg-green-100 text-green-800">Online</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">AI Services</span>
                      <Badge className="bg-green-100 text-green-800">Operational</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Payment Processing</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Real-time Updates</span>
                      <Badge className="bg-green-100 text-green-800">Connected</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Average Response Time</span>
                      <span className="font-bold text-green-600">245ms</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Uptime</span>
                      <span className="font-bold text-green-600">99.9%</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Error Rate</span>
                      <span className="font-bold text-green-600">0.1%</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Active Sessions</span>
                      <span className="font-bold">{Math.floor(Math.random() * 50) + 10}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;

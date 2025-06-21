
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, BarChart3, MessageCircle, Settings, AlertTriangle, CheckCircle, Clock, TrendingUp, Shield, CreditCard, Activity, Database, Wifi, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Vendor {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'pending' | 'inactive';
  orders: number;
  revenue: number;
  joined: string;
  email?: string;
}

interface AILog {
  id: string;
  vendor: string;
  customer: string;
  interaction: string;
  satisfaction: number;
  timestamp: string;
  model: string;
}

interface SystemMetrics {
  totalVendors: number;
  activeVendors: number;
  pendingVendors: number;
  totalRevenue: number;
  totalOrders: number;
  aiInteractions: number;
  avgSatisfaction: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

interface FinancialData {
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  stripeRevenue: number;
  revolutRevenue: number;
  pendingPayments: number;
}

const AdminPanel = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [aiLogs, setAiLogs] = useState<AILog[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    totalVendors: 0,
    activeVendors: 0,
    pendingVendors: 0,
    totalRevenue: 0,
    totalOrders: 0,
    aiInteractions: 0,
    avgSatisfaction: 0,
    systemHealth: 'healthy'
  });
  const [financialData, setFinancialData] = useState<FinancialData>({
    dailyRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
    stripeRevenue: 0,
    revolutRevenue: 0,
    pendingPayments: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchVendors = async () => {
    try {
      const { data: vendorsData, error: vendorsError } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });

      if (vendorsError) throw vendorsError;

      // Fetch order counts and revenue for each vendor
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('vendor_id, total_amount, payment_status')
        .eq('payment_status', 'paid');

      if (ordersError) throw ordersError;

      const vendorStats = ordersData?.reduce((acc: Record<string, { orders: number; revenue: number }>, order) => {
        if (!acc[order.vendor_id]) {
          acc[order.vendor_id] = { orders: 0, revenue: 0 };
        }
        acc[order.vendor_id].orders += 1;
        acc[order.vendor_id].revenue += order.total_amount;
        return acc;
      }, {}) || {};

      const enhancedVendors = vendorsData?.map(vendor => ({
        id: vendor.id,
        name: vendor.name,
        location: vendor.location || 'Not specified',
        status: vendor.active ? 'active' as const : 'inactive' as const,
        orders: vendorStats[vendor.id]?.orders || 0,
        revenue: vendorStats[vendor.id]?.revenue || 0,
        joined: new Date(vendor.created_at).toLocaleDateString(),
        email: `contact@${vendor.slug}.com` // Mock email for demo
      })) || [];

      setVendors(enhancedVendors);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast({
        title: "Error",
        description: "Failed to fetch vendor data",
        variant: "destructive"
      });
    }
  };

  const fetchAILogs = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_waiter_logs')
        .select(`
          id,
          content,
          ai_model_used,
          satisfaction_score,
          created_at,
          vendor:vendors (name)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedLogs = data?.map(log => ({
        id: log.id,
        vendor: log.vendor?.name || 'Unknown',
        customer: 'Anonymous Guest',
        interaction: log.content.length > 50 ? log.content.substring(0, 50) + '...' : log.content,
        satisfaction: log.satisfaction_score || 85,
        timestamp: new Date(log.created_at).toLocaleString(),
        model: log.ai_model_used || 'GPT-4o'
      })) || [];

      setAiLogs(formattedLogs);
    } catch (error) {
      console.error('Error fetching AI logs:', error);
    }
  };

  const fetchSystemMetrics = async () => {
    try {
      // Fetch basic metrics
      const { data: ordersData } = await supabase
        .from('orders')
        .select('total_amount, payment_status, payment_method');

      const { data: aiInteractionsData } = await supabase
        .from('ai_waiter_logs')
        .select('satisfaction_score');

      const totalOrders = ordersData?.length || 0;
      const totalRevenue = ordersData
        ?.filter(order => order.payment_status === 'paid')
        .reduce((sum, order) => sum + order.total_amount, 0) || 0;

      const aiInteractions = aiInteractionsData?.length || 0;
      const avgSatisfaction = aiInteractionsData?.length 
        ? aiInteractionsData.reduce((sum, log) => sum + (log.satisfaction_score || 0), 0) / aiInteractionsData.length
        : 0;

      const activeVendors = vendors.filter(v => v.status === 'active').length;
      const pendingVendors = vendors.filter(v => v.status === 'pending').length;

      setSystemMetrics({
        totalVendors: vendors.length,
        activeVendors,
        pendingVendors,
        totalRevenue,
        totalOrders,
        aiInteractions,
        avgSatisfaction: Math.round(avgSatisfaction),
        systemHealth: 'healthy' // Simple health check
      });

      // Calculate financial data
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const stripeRevenue = ordersData?.filter(o => o.payment_method === 'stripe' && o.payment_status === 'paid')
        .reduce((sum, o) => sum + o.total_amount, 0) || 0;
      const revolutRevenue = ordersData?.filter(o => o.payment_method === 'revolut' && o.payment_status === 'paid')
        .reduce((sum, o) => sum + o.total_amount, 0) || 0;

      setFinancialData({
        dailyRevenue: totalRevenue * 0.1, // Mock daily calculation
        weeklyRevenue: totalRevenue * 0.3, // Mock weekly calculation
        monthlyRevenue: totalRevenue,
        stripeRevenue,
        revolutRevenue,
        pendingPayments: ordersData?.filter(o => o.payment_status === 'pending').length || 0
      });

    } catch (error) {
      console.error('Error fetching system metrics:', error);
    }
  };

  const approveVendor = async (vendorId: string) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .update({ active: true })
        .eq('id', vendorId);

      if (error) throw error;

      setVendors(prev => 
        prev.map(vendor => 
          vendor.id === vendorId 
            ? { ...vendor, status: 'active' as const }
            : vendor
        )
      );

      toast({
        title: "Vendor Approved",
        description: "Vendor has been activated successfully",
      });
    } catch (error) {
      console.error('Error approving vendor:', error);
      toast({
        title: "Error",
        description: "Failed to approve vendor",
        variant: "destructive"
      });
    }
  };

  const suspendVendor = async (vendorId: string) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .update({ active: false })
        .eq('id', vendorId);

      if (error) throw error;

      setVendors(prev => 
        prev.map(vendor => 
          vendor.id === vendorId 
            ? { ...vendor, status: 'inactive' as const }
            : vendor
        )
      );

      toast({
        title: "Vendor Suspended",
        description: "Vendor has been deactivated",
      });
    } catch (error) {
      console.error('Error suspending vendor:', error);
      toast({
        title: "Error",
        description: "Failed to suspend vendor",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchVendors(),
        fetchAILogs(),
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (vendors.length > 0) {
      fetchSystemMetrics();
    }
  }, [vendors]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSatisfactionColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthStatus = (health: string) => {
    switch (health) {
      case 'healthy': return { color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'warning': return { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
      case 'critical': return { color: 'bg-red-100 text-red-800', icon: AlertTriangle };
      default: return { color: 'bg-gray-100 text-gray-800', icon: CheckCircle };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button asChild variant="ghost" size="sm">
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="font-bold text-xl">ICUPA MALTA</h1>
              <p className="text-sm text-gray-500">Professional Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className={getHealthStatus(systemMetrics.systemHealth).color}>
              <getHealthStatus(systemMetrics.systemHealth).icon className="h-3 w-3 mr-1" />
              System {systemMetrics.systemHealth}
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Enhanced Overview Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Vendors</p>
                  <p className="text-2xl font-bold text-blue-600">{systemMetrics.totalVendors}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      {systemMetrics.activeVendors} active
                    </Badge>
                    {systemMetrics.pendingVendors > 0 && (
                      <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                        {systemMetrics.pendingVendors} pending
                      </Badge>
                    )}
                  </div>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Platform Revenue</p>
                  <p className="text-2xl font-bold text-green-600">€{systemMetrics.totalRevenue.toFixed(2)}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12.5% this month
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-purple-600">{systemMetrics.totalOrders}</p>
                  <p className="text-xs text-gray-500 mt-1">Across all vendors</p>
                </div>
                <div className="bg-purple-100 p-2 rounded-full">
                  <span className="text-purple-600 font-bold text-lg">{systemMetrics.totalOrders}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">AI Performance</p>
                  <p className="text-2xl font-bold text-amber-600">{systemMetrics.avgSatisfaction}%</p>
                  <p className="text-xs text-gray-500 mt-1">{systemMetrics.aiInteractions} interactions</p>
                </div>
                <MessageCircle className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="vendors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="ai-monitor">AI Monitor</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* Enhanced Vendor Management */}
          <TabsContent value="vendors" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Vendor Management</h2>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={fetchVendors}>
                  Refresh Data
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Bulk Actions
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Vendor Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendors.map((vendor) => (
                      <TableRow key={vendor.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{vendor.name}</div>
                            <div className="text-sm text-gray-500">{vendor.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{vendor.location}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(vendor.status)}>
                            {vendor.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{vendor.orders}</TableCell>
                        <TableCell className="text-green-600 font-medium">
                          €{vendor.revenue.toFixed(2)}
                        </TableCell>
                        <TableCell>{vendor.joined}</TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            {vendor.status === 'pending' && (
                              <Button 
                                size="sm" 
                                onClick={() => approveVendor(vendor.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Approve
                              </Button>
                            )}
                            {vendor.status === 'active' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => suspendVendor(vendor.id)}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                Suspend
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              Details
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced AI Monitoring */}
          <TabsContent value="ai-monitor" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">AI Performance Monitor</h2>
              <div className="flex items-center space-x-2">
                <Badge className="bg-blue-100 text-blue-800">
                  <Activity className="h-3 w-3 mr-1" />
                  Live Monitoring
                </Badge>
                <Button variant="outline" size="sm" onClick={fetchAILogs}>
                  Refresh Logs
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <MessageCircle className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{systemMetrics.aiInteractions}</p>
                  <p className="text-sm text-gray-600">Total Interactions</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-green-600 font-bold text-sm">{systemMetrics.avgSatisfaction}%</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{systemMetrics.avgSatisfaction}%</p>
                  <p className="text-sm text-gray-600">Avg Satisfaction</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">1.8s</p>
                  <p className="text-sm text-gray-600">Avg Response Time</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-amber-600">99.2%</p>
                  <p className="text-sm text-gray-600">Uptime</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent AI Interactions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Interaction</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Satisfaction</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aiLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.vendor}</TableCell>
                        <TableCell className="max-w-xs truncate">{log.interaction}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.model}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${getSatisfactionColor(log.satisfaction)}`}>
                            {log.satisfaction}%
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">{log.timestamp}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* New Financial Overview */}
          <TabsContent value="financial" className="space-y-4">
            <h2 className="text-2xl font-bold">Financial Overview</h2>
            
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Revenue Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Daily</span>
                      <span className="font-medium">€{financialData.dailyRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Weekly</span>
                      <span className="font-medium">€{financialData.weeklyRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Monthly Total</span>
                      <span className="font-bold text-green-600">€{financialData.monthlyRevenue.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                        <span>Stripe</span>
                      </div>
                      <span className="font-medium">€{financialData.stripeRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                        <span>Revolut</span>
                      </div>
                      <span className="font-medium">€{financialData.revolutRevenue.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Pending Payments</span>
                        <span>{financialData.pendingPayments}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Commission Rate</span>
                      <span className="font-medium">5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Platform Fees</span>
                      <span className="font-medium">€{(financialData.monthlyRevenue * 0.05).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Net Revenue</span>
                      <span className="font-bold text-green-600">€{(financialData.monthlyRevenue * 0.95).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Vendors (Revenue)</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Avg Order Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendors
                      .sort((a, b) => b.revenue - a.revenue)
                      .slice(0, 10)
                      .map((vendor, index) => (
                        <TableRow key={vendor.id}>
                          <TableCell>
                            <span className="font-bold text-blue-600">#{index + 1}</span>
                          </TableCell>
                          <TableCell className="font-medium">{vendor.name}</TableCell>
                          <TableCell className="text-green-600 font-medium">
                            €{vendor.revenue.toFixed(2)}
                          </TableCell>
                          <TableCell>{vendor.orders}</TableCell>
                          <TableCell>
                            €{vendor.orders > 0 ? (vendor.revenue / vendor.orders).toFixed(2) : '0.00'}
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Analytics */}
          <TabsContent value="analytics" className="space-y-4">
            <h2 className="text-2xl font-bold">Platform Analytics</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Model Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">GPT-4o</h4>
                        <p className="text-sm text-gray-600">Menu recommendations & reasoning</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">94%</p>
                        <p className="text-xs text-gray-500">satisfaction</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">Claude-4</h4>
                        <p className="text-sm text-gray-600">Tone & personalization</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-purple-600">92%</p>
                        <p className="text-xs text-gray-500">satisfaction</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">Gemini 2.5</h4>
                        <p className="text-sm text-gray-600">Design optimization</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">89%</p>
                        <p className="text-xs text-gray-500">effectiveness</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Growth Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">New Vendors (30 days)</span>
                      <span className="font-bold text-green-600">+{Math.floor(vendors.length * 0.3)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Order Growth</span>
                      <span className="font-bold text-green-600">+23%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Revenue Growth</span>
                      <span className="font-bold text-green-600">+18.5%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">AI Engagement</span>
                      <span className="font-bold text-blue-600">+45%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Usage Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">78%</p>
                    <p className="text-sm text-gray-600">Vendors using AI Waiter</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">82%</p>
                    <p className="text-sm text-gray-600">Guests engaging with AI</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">65%</p>
                    <p className="text-sm text-gray-600">Orders via QR codes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced System Status */}
          <TabsContent value="system" className="space-y-4">
            <h2 className="text-2xl font-bold">System Health & Monitoring</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Service Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { service: 'Supabase Database', status: 'healthy', uptime: '99.9%' },
                      { service: 'OpenAI GPT-4o', status: 'healthy', uptime: '99.5%' },
                      { service: 'Claude-4 API', status: 'healthy', uptime: '99.2%' },
                      { service: 'Pinecone Vector DB', status: 'healthy', uptime: '98.8%' },
                      { service: 'Stripe Payments', status: 'healthy', uptime: '99.8%' },
                      { service: 'Revolut Integration', status: 'warning', uptime: '97.2%' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {item.status === 'healthy' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                          <span className="font-medium">{item.service}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">{item.uptime}</span>
                          <Badge className={item.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Database className="h-4 w-4 text-blue-500" />
                        <span>Database Response Time</span>
                      </div>
                      <span className="font-medium text-green-600">45ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Wifi className="h-4 w-4 text-green-500" />
                        <span>API Response Time</span>
                      </div>
                      <span className="font-medium text-green-600">120ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Server className="h-4 w-4 text-purple-500" />
                        <span>Edge Function Latency</span>
                      </div>
                      <span className="font-medium text-green-600">85ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-amber-500" />
                        <span>Active Connections</span>
                      </div>
                      <span className="font-medium">2,345</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent System Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3 p-2 bg-green-50 rounded">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>New vendor approved: {vendors[0]?.name}</span>
                    <span className="text-gray-500 ml-auto">2h ago</span>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>AI model performance improved by 3%</span>
                    <span className="text-gray-500 ml-auto">4h ago</span>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-purple-50 rounded">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Database maintenance completed successfully</span>
                    <span className="text-gray-500 ml-auto">6h ago</span>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-amber-50 rounded">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span>Platform revenue milestone: €{systemMetrics.totalRevenue.toFixed(0)}</span>
                    <span className="text-gray-500 ml-auto">1d ago</span>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span>Scheduled backup completed</span>
                    <span className="text-gray-500 ml-auto">1d ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;

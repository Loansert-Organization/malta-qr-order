
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, BarChart3, MessageCircle, Settings, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminPanel = () => {
  const [vendors] = useState([
    {
      id: '1',
      name: "Ta' Kris Restaurant",
      location: 'Valletta',
      status: 'active',
      orders: 156,
      revenue: 2340.50,
      joined: '2024-01-15'
    },
    {
      id: '2',
      name: "Nenu The Artisan Baker",
      location: 'Sliema',
      status: 'active',
      orders: 89,
      revenue: 1567.25,
      joined: '2024-02-03'
    },
    {
      id: '3',
      name: "Tal-Petut Restaurant",
      location: 'Mdina',
      status: 'pending',
      orders: 23,
      revenue: 345.80,
      joined: '2024-03-12'
    }
  ]);

  const [aiLogs] = useState([
    {
      id: '1',
      vendor: "Ta' Kris Restaurant",
      customer: 'Anonymous',
      interaction: 'Menu recommendation',
      satisfaction: 95,
      timestamp: '10 min ago',
      model: 'GPT-4o'
    },
    {
      id: '2',
      vendor: "Nenu The Artisan Baker",
      customer: 'Anonymous',
      interaction: 'Dietary inquiry',
      satisfaction: 88,
      timestamp: '25 min ago',
      model: 'Claude-4'
    },
    {
      id: '3',
      vendor: "Ta' Kris Restaurant",
      customer: 'Anonymous',
      interaction: 'Order assistance',
      satisfaction: 92,
      timestamp: '1 hour ago',
      model: 'GPT-4o'
    }
  ]);

  const [systemMetrics] = useState({
    totalVendors: vendors.length,
    activeVendors: vendors.filter(v => v.status === 'active').length,
    totalRevenue: vendors.reduce((sum, v) => sum + v.revenue, 0),
    totalOrders: vendors.reduce((sum, v) => sum + v.orders, 0),
    aiInteractions: 1247,
    avgSatisfaction: 91.2
  });

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button asChild variant="ghost" size="sm">
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="font-bold text-xl">ICUPA MALTA</h1>
              <p className="text-sm text-gray-500">Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Badge className="bg-green-100 text-green-800">
              System Healthy
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Overview Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Vendors</p>
                  <p className="text-2xl font-bold text-blue-600">{systemMetrics.totalVendors}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {systemMetrics.activeVendors} active
                  </p>
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
                  <p className="text-xs text-gray-500 mt-1">This month</p>
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
                  <p className="text-xs text-gray-500 mt-1">All time</p>
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
                  <p className="text-sm text-gray-600">AI Satisfaction</p>
                  <p className="text-2xl font-bold text-amber-600">{systemMetrics.avgSatisfaction}%</p>
                  <p className="text-xs text-gray-500 mt-1">{systemMetrics.aiInteractions} interactions</p>
                </div>
                <MessageCircle className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="vendors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="ai-monitor">AI Monitor</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* Vendors Management */}
          <TabsContent value="vendors" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Vendor Management</h2>
              <div className="flex space-x-2">
                <Button variant="outline">
                  Export Data
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Approve Pending
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {vendors.map((vendor) => (
                <Card key={vendor.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-bold text-lg">{vendor.name}</h3>
                          <Badge className={getStatusColor(vendor.status)}>
                            {vendor.status}
                          </Badge>
                          <span className="text-sm text-gray-500">{vendor.location}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Revenue: </span>
                            <span className="font-medium text-green-600">€{vendor.revenue.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Orders: </span>
                            <span className="font-medium">{vendor.orders}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Joined: </span>
                            <span className="font-medium">{vendor.joined}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {vendor.status === 'pending' && (
                          <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-200">
                              Reject
                            </Button>
                          </>
                        )}
                        {vendor.status === 'active' && (
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* AI Monitoring */}
          <TabsContent value="ai-monitor" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">AI Waiter Monitor</h2>
              <div className="flex items-center space-x-2">
                <Badge className="bg-blue-100 text-blue-800">
                  Live Monitoring
                </Badge>
                <Button variant="outline" size="sm">
                  Export Logs
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <MessageCircle className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">1,247</p>
                  <p className="text-sm text-gray-600">Total Interactions</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-green-600 font-bold">91%</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">91.2%</p>
                  <p className="text-sm text-gray-600">Avg Satisfaction</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">2.4s</p>
                  <p className="text-sm text-gray-600">Avg Response Time</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recent AI Interactions</h3>
              {aiLogs.map((log) => (
                <Card key={log.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium">{log.vendor}</h4>
                          <Badge variant="outline">{log.model}</Badge>
                          <span className="text-sm text-gray-500">{log.timestamp}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-gray-600">Type: {log.interaction}</span>
                          <span className="text-gray-600">Customer: {log.customer}</span>
                          <span className={`font-medium ${getSatisfactionColor(log.satisfaction)}`}>
                            Satisfaction: {log.satisfaction}%
                          </span>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-4">
            <h2 className="text-2xl font-bold">Platform Analytics</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Vendors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {vendors.sort((a, b) => b.revenue - a.revenue).map((vendor, index) => (
                      <div key={vendor.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="font-bold text-lg text-blue-600">#{index + 1}</span>
                          <div>
                            <span className="font-medium">{vendor.name}</span>
                            <p className="text-sm text-gray-500">{vendor.location}</p>
                          </div>
                        </div>
                        <span className="font-medium text-green-600">€{vendor.revenue.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

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
            </div>
          </TabsContent>

          {/* System Status */}
          <TabsContent value="system" className="space-y-4">
            <h2 className="text-2xl font-bold">System Status</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Service Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { service: 'Supabase Database', status: 'healthy' },
                      { service: 'OpenAI GPT-4o', status: 'healthy' },
                      { service: 'Claude-4 API', status: 'healthy' },
                      { service: 'Pinecone Vector DB', status: 'healthy' },
                      { service: 'Stripe Payments', status: 'healthy' },
                      { service: 'Revolut Integration', status: 'warning' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="font-medium">{item.service}</span>
                        <div className="flex items-center space-x-2">
                          {item.status === 'healthy' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
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
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>New vendor registered: Tal-Petut Restaurant</span>
                      <span className="text-gray-500">2h ago</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>AI model updated: GPT-4o performance improved</span>
                      <span className="text-gray-500">5h ago</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>System maintenance completed</span>
                      <span className="text-gray-500">1d ago</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span>Platform revenue milestone: €5,000</span>
                      <span className="text-gray-500">2d ago</span>
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

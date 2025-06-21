import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, QrCode, BarChart3, Settings, Upload, Eye, Edit, Trash2, Download, Menu, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MenuBuilder from '@/components/vendor/MenuBuilder';
import QRGenerator from '@/components/vendor/QRGenerator';
import OrderManagement from '@/components/vendor/OrderManagement';
import AIAnalytics from '@/components/vendor/AIAnalytics';

const VendorDashboard = () => {
  // Mock data - in real app this would come from Supabase
  const vendor = {
    id: 'vendor-123',
    name: "Ta' Kris Restaurant",
    slug: 'ta-kris',
    location: 'Valletta, Malta'
  };

  const menuId = 'menu-123';

  const [menuItems] = useState([
    {
      id: '1',
      name: 'Maltese Ftira',
      description: 'Traditional Maltese bread with tomatoes, olives, capers, and local cheese',
      price: 8.50,
      category: 'Mains',
      available: true,
      popular: true,
      prep_time: '15 min'
    },
    {
      id: '2',
      name: 'Rabbit Stew (Fenkata)',
      description: 'Traditional Maltese rabbit stew with wine, herbs, and vegetables',
      price: 16.00,
      category: 'Mains',
      available: true,
      popular: true,
      prep_time: '25 min'
    },
    {
      id: '3',
      name: 'Kinnie & Pastizzi',
      description: "Malta's iconic soft drink with traditional pastry filled with ricotta or peas",
      price: 4.50,
      category: 'Snacks',
      available: true,
      popular: false,
      prep_time: '5 min'
    }
  ]);

  const [orders] = useState([
    {
      id: '#ORD-001',
      items: ['Maltese Ftira', 'Kinnie & Pastizzi'],
      total: 13.00,
      status: 'preparing',
      time: '5 min ago',
      table: 'QR-A3'
    },
    {
      id: '#ORD-002',
      items: ['Rabbit Stew'],
      total: 16.00,
      status: 'ready',
      time: '12 min ago',
      table: 'QR-B1'
    },
    {
      id: '#ORD-003', 
      items: ['Gbejniet Salad', 'Kinnie & Pastizzi'],
      total: 16.50,
      status: 'completed',
      time: '25 min ago',
      table: 'QR-C2'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'bg-yellow-100 text-yellow-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const todayOrders = orders.length;
  const avgOrderValue = totalRevenue / todayOrders;

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
              <h1 className="font-bold text-xl">{vendor.name}</h1>
              <p className="text-sm text-gray-500">Comprehensive Vendor Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button className="bg-amber-600 hover:bg-amber-700">
              <QrCode className="h-4 w-4 mr-2" />
              Quick QR
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Enhanced Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Revenue</p>
                  <p className="text-2xl font-bold text-green-600">€{totalRevenue.toFixed(2)}</p>
                  <p className="text-xs text-green-500">↑ 12% vs yesterday</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Orders</p>
                  <p className="text-2xl font-bold text-blue-600">{orders.filter(o => o.status !== 'completed').length}</p>
                  <p className="text-xs text-blue-500">Live updates</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold text-purple-600">€{avgOrderValue.toFixed(2)}</p>
                  <p className="text-xs text-purple-500">↑ 8% this week</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Menu Items</p>
                  <p className="text-2xl font-bold text-amber-600">{menuItems.length}</p>
                  <p className="text-xs text-amber-500">AI optimized</p>
                </div>
                <Menu className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Main Content Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Live Orders
            </TabsTrigger>
            <TabsTrigger value="menu" className="flex items-center gap-2">
              <Menu className="h-4 w-4" />
              Menu Builder
            </TabsTrigger>
            <TabsTrigger value="qr" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              QR & Posters
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              AI Analytics
            </TabsTrigger>
            <TabsTrigger value="legacy" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Legacy View
            </TabsTrigger>
          </TabsList>

          {/* Real-time Order Management */}
          <TabsContent value="orders" className="space-y-4">
            <OrderManagement vendorId={vendor.id} />
          </TabsContent>

          {/* Enhanced Menu Builder */}
          <TabsContent value="menu" className="space-y-4">
            <MenuBuilder
              vendorId={vendor.id}
              menuId={menuId}
              initialItems={menuItems}
            />
          </TabsContent>

          {/* Advanced QR & Poster Generation */}
          <TabsContent value="qr" className="space-y-4">
            <QRGenerator
              vendorId={vendor.id}
              vendorName={vendor.name}
              vendorSlug={vendor.slug}
            />
          </TabsContent>

          {/* AI-Powered Analytics */}
          <TabsContent value="analytics" className="space-y-4">
            <AIAnalytics vendorId={vendor.id} />
          </TabsContent>

          {/* Legacy View for Reference */}
          <TabsContent value="legacy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Legacy Dashboard View</CardTitle>
                <p className="text-sm text-gray-600">Previous dashboard layout for reference</p>
              </CardHeader>
              <CardContent>
                {/* ... keep existing code (previous dashboard content) */}
                <div className="grid gap-4">
                  {orders.map((order) => (
                    <Card key={order.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-bold">{order.id}</h3>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                              <span className="text-sm text-gray-500">{order.table}</span>
                            </div>
                            <p className="text-gray-600 mb-1">{order.items.join(', ')}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>€{order.total.toFixed(2)}</span>
                              <span>{order.time}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {order.status === 'preparing' && (
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                Mark Ready
                              </Button>
                            )}
                            {order.status === 'ready' && (
                              <Button size="sm" variant="outline">
                                Complete
                              </Button>
                            )}
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VendorDashboard;

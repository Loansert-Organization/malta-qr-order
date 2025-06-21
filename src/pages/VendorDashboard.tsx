
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, QrCode, BarChart3, Settings, Upload, Eye, Edit, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const VendorDashboard = () => {
  const [menuItems] = useState([
    {
      id: '1',
      name: 'Maltese Ftira',
      price: 8.50,
      category: 'Mains',
      status: 'active',
      orders: 45
    },
    {
      id: '2',
      name: 'Rabbit Stew (Fenkata)',
      price: 16.00,
      category: 'Mains', 
      status: 'active',
      orders: 32
    },
    {
      id: '3',
      name: 'Kinnie & Pastizzi',
      price: 4.50,
      category: 'Snacks',
      status: 'active',
      orders: 67
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
              <h1 className="font-bold text-xl">Ta' Kris Restaurant</h1>
              <p className="text-sm text-gray-500">Vendor Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button className="bg-amber-600 hover:bg-amber-700">
              <QrCode className="h-4 w-4 mr-2" />
              Generate QR
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Revenue</p>
                  <p className="text-2xl font-bold text-green-600">€{totalRevenue.toFixed(2)}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Orders Today</p>
                  <p className="text-2xl font-bold text-blue-600">{todayOrders}</p>
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <span className="text-blue-600 font-bold text-lg">{todayOrders}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold text-purple-600">€{avgOrderValue.toFixed(2)}</p>
                </div>
                <div className="bg-purple-100 p-2 rounded-full">
                  <span className="text-purple-600 text-sm">€</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Menu Items</p>
                  <p className="text-2xl font-bold text-amber-600">{menuItems.length}</p>
                </div>
                <div className="bg-amber-100 p-2 rounded-full">
                  <Plus className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders">Live Orders</TabsTrigger>
            <TabsTrigger value="menu">Menu Management</TabsTrigger>
            <TabsTrigger value="qr">QR Codes</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Live Orders */}
          <TabsContent value="orders" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Live Orders</h2>
              <Badge className="bg-green-100 text-green-800">
                {orders.filter(o => o.status !== 'completed').length} Active
              </Badge>
            </div>

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
          </TabsContent>

          {/* Menu Management */}
          <TabsContent value="menu" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Menu Management</h2>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="grid gap-4">
              {menuItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-bold text-lg">{item.name}</h3>
                          <Badge variant="outline">{item.category}</Badge>
                          <Badge className="bg-green-100 text-green-800">
                            {item.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="font-medium text-blue-600">€{item.price.toFixed(2)}</span>
                          <span>{item.orders} orders today</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Upload className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* QR Codes */}
          <TabsContent value="qr" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">QR Code Generator</h2>
              <Button className="bg-amber-600 hover:bg-amber-700">
                <Plus className="h-4 w-4 mr-2" />
                Generate New QR
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Table QR Codes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {['Table A1', 'Table A2', 'Table A3', 'Table B1', 'Table B2'].map((table) => (
                    <div key={table} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <QrCode className="h-6 w-6 text-gray-600" />
                        <span className="font-medium">{table}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Poster Templates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <QrCode className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="font-bold text-lg mb-2">Preview Your QR Poster</h3>
                    <p className="text-gray-600 mb-4">
                      Auto-generated branded posters with your restaurant's QR codes
                    </p>
                    <Button variant="outline">
                      Generate Preview
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    <Button className="flex-1" variant="outline">
                      Download PDF
                    </Button>
                    <Button className="flex-1" variant="outline">
                      Download PNG
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-4">
            <h2 className="text-2xl font-bold">Analytics & Insights</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Popular Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {menuItems.sort((a, b) => b.orders - a.orders).map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="font-bold text-lg text-amber-600">#{index + 1}</span>
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <span className="text-sm text-gray-600">{item.orders} orders</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <h4 className="font-medium text-blue-800">Menu Optimization</h4>
                      <p className="text-sm text-blue-600">
                        Consider featuring Kinnie & Pastizzi more prominently - it's your most ordered item!
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <h4 className="font-medium text-green-800">Peak Hours</h4>
                      <p className="text-sm text-green-600">
                        Most orders come between 7-9 PM. Consider prep time for popular items.
                      </p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                      <h4 className="font-medium text-amber-800">Customer Preferences</h4>
                      <p className="text-sm text-amber-600">
                        AI Waiter suggests traditional Maltese dishes 73% of the time successfully.
                      </p>
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

export default VendorDashboard;


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Clock, 
  TrendingUp, 
  ShoppingCart,
  Eye,
  MessageCircle,
  Star,
  MapPin
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface CustomerBehaviorMetrics {
  totalSessions: number;
  avgSessionDuration: number;
  bounceRate: number;
  conversionRate: number;
  repeatCustomerRate: number;
  aiWaiterUsage: number;
  popularTimeSlots: Array<{ hour: string; sessions: number }>;
  deviceBreakdown: Array<{ device: string; count: number }>;
  locationHeatmap: Array<{ area: string; sessions: number; revenue: number }>;
  menuInteractions: Array<{ category: string; views: number; orders: number }>;
  customerJourney: Array<{ step: string; dropoffRate: number }>;
}

const CustomerBehaviorDashboard = () => {
  const [metrics, setMetrics] = useState<CustomerBehaviorMetrics>({
    totalSessions: 0,
    avgSessionDuration: 0,
    bounceRate: 0,
    conversionRate: 0,
    repeatCustomerRate: 0,
    aiWaiterUsage: 0,
    popularTimeSlots: [],
    deviceBreakdown: [],
    locationHeatmap: [],
    menuInteractions: [],
    customerJourney: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    loadCustomerBehaviorMetrics();
  }, [selectedPeriod]);

  const loadCustomerBehaviorMetrics = async () => {
    try {
      const now = new Date();
      const periodDays = selectedPeriod === 'day' ? 1 : selectedPeriod === 'week' ? 7 : 30;
      const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

      // Get guest sessions data
      const { data: sessions } = await supabase
        .from('guest_ui_sessions')
        .select('*')
        .gte('created_at', startDate.toISOString());

      // Get orders data
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            menu_item:menu_items (name, category)
          )
        `)
        .gte('created_at', startDate.toISOString());

      // Get AI waiter interactions
      const { data: aiInteractions } = await supabase
        .from('ai_waiter_logs')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (sessions && orders && aiInteractions) {
        // Calculate metrics
        const totalSessions = sessions.length;
        const sessionsWithOrders = new Set(orders.map(o => o.guest_session_id)).size;
        const conversionRate = totalSessions > 0 ? (sessionsWithOrders / totalSessions) * 100 : 0;
        
        // Calculate average session duration (mock data for now)
        const avgSessionDuration = sessions.reduce((acc, session) => {
          const duration = new Date(session.updated_at).getTime() - new Date(session.created_at).getTime();
          return acc + duration / (1000 * 60); // Convert to minutes
        }, 0) / sessions.length || 0;

        // Popular time slots
        const timeSlots = Array.from({ length: 24 }, (_, i) => ({ hour: `${i}:00`, sessions: 0 }));
        sessions.forEach(session => {
          const hour = new Date(session.created_at).getHours();
          timeSlots[hour].sessions++;
        });

        // Menu interactions by category
        const categoryInteractions: { [key: string]: { views: number; orders: number } } = {};
        orders.forEach(order => {
          order.order_items?.forEach(item => {
            const category = item.menu_item?.category || 'Other';
            if (!categoryInteractions[category]) {
              categoryInteractions[category] = { views: 0, orders: 0 };
            }
            categoryInteractions[category].orders += item.quantity;
          });
        });

        // Add mock view data (in real implementation, track from UI interactions)
        Object.keys(categoryInteractions).forEach(category => {
          categoryInteractions[category].views = Math.floor(categoryInteractions[category].orders * (2 + Math.random() * 3));
        });

        const menuInteractions = Object.entries(categoryInteractions).map(([category, data]) => ({
          category,
          ...data
        }));

        // Location heatmap (mock data based on sessions)
        const locationAreas = ['Valletta', 'Sliema', 'St. Julian\'s', 'Mdina', 'Bugibba'];
        const locationHeatmap = locationAreas.map(area => ({
          area,
          sessions: Math.floor(Math.random() * totalSessions * 0.3),
          revenue: Math.floor(Math.random() * 5000)
        }));

        // Device breakdown (mock data)
        const deviceBreakdown = [
          { device: 'Mobile', count: Math.floor(totalSessions * 0.7) },
          { device: 'Desktop', count: Math.floor(totalSessions * 0.2) },
          { device: 'Tablet', count: Math.floor(totalSessions * 0.1) }
        ];

        // Customer journey analysis
        const customerJourney = [
          { step: 'Landing', dropoffRate: 5 },
          { step: 'Menu Browse', dropoffRate: 15 },
          { step: 'Item Selection', dropoffRate: 25 },
          { step: 'Cart Review', dropoffRate: 35 },
          { step: 'Checkout', dropoffRate: 10 }
        ];

        setMetrics({
          totalSessions,
          avgSessionDuration,
          bounceRate: Math.random() * 30 + 10, // Mock bounce rate
          conversionRate,
          repeatCustomerRate: Math.random() * 40 + 20, // Mock repeat customer rate
          aiWaiterUsage: (aiInteractions.length / totalSessions) * 100,
          popularTimeSlots: timeSlots.filter(slot => slot.sessions > 0),
          deviceBreakdown,
          locationHeatmap,
          menuInteractions,
          customerJourney
        });
      }
    } catch (error) {
      console.error('Error loading customer behavior metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Behavior Analytics</h2>
          <p className="text-gray-600">Deep insights into customer interactions and patterns</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={selectedPeriod === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('day')}
          >
            Today
          </Button>
          <Button
            variant={selectedPeriod === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('week')}
          >
            Week
          </Button>
          <Button
            variant={selectedPeriod === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('month')}
          >
            Month
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              Customer interactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgSessionDuration.toFixed(1)}m</div>
            <p className="text-xs text-muted-foreground">
              Minutes per session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Sessions to orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Waiter Usage</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.aiWaiterUsage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Kai interactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="traffic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="traffic">Traffic Patterns</TabsTrigger>
          <TabsTrigger value="interactions">Menu Interactions</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="journey">Customer Journey</TabsTrigger>
        </TabsList>

        <TabsContent value="traffic">
          <Card>
            <CardHeader>
              <CardTitle>Popular Time Slots</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.popularTimeSlots}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sessions" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interactions">
          <Card>
            <CardHeader>
              <CardTitle>Menu Category Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.menuInteractions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="views" fill="#8884d8" name="Views" />
                  <Bar dataKey="orders" fill="#82ca9d" name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography">
          <Card>
            <CardHeader>
              <CardTitle>Location Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.locationHeatmap.map((location, index) => (
                  <div key={location.area} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">{location.area}</div>
                        <div className="text-sm text-gray-600">{location.sessions} sessions</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">€{location.revenue}</div>
                      <div className="text-sm text-gray-600">Revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle>Device Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={metrics.deviceBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ device, percent }) => `${device} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {metrics.deviceBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journey">
          <Card>
            <CardHeader>
              <CardTitle>Customer Journey Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.customerJourney.map((step, index) => (
                  <div key={step.step} className="flex items-center space-x-4">
                    <div className="w-24 text-sm font-medium">{step.step}</div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full" 
                          style={{ width: `${step.dropoffRate}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">{step.dropoffRate}% drop-off</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerBehaviorDashboard;

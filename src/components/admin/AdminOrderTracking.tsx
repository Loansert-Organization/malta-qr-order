
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, TrendingUp, Users, DollarSign, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  activeVendors: number;
  averageOrderValue: number;
}

interface OrderWithVendor {
  id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  customer_name?: string;
  vendors: {
    name: string;
    slug: string;
  };
  order_items: Array<{
    quantity: number;
    menu_items: {
      name: string;
    };
  }>;
}

const AdminOrderTracking: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalOrders: 0,
    totalRevenue: 0,
    activeVendors: 0,
    averageOrderValue: 0
  });
  const [orders, setOrders] = useState<OrderWithVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vendorFilter, setVendorFilter] = useState('all');

  useEffect(() => {
    fetchAdminData();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          fetchAdminData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAdminData = async () => {
    try {
      // Fetch orders with vendor information
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          vendors (name, slug),
          order_items (
            quantity,
            menu_items (name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

      // Calculate stats
      const totalOrders = ordersData?.length || 0;
      const totalRevenue = ordersData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Get active vendors count
      const { data: vendorsData, error: vendorsError } = await supabase
        .from('vendors')
        .select('id')
        .eq('active', true);

      if (vendorsError) throw vendorsError;

      setStats({
        totalOrders,
        totalRevenue,
        activeVendors: vendorsData?.length || 0,
        averageOrderValue
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.vendors.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesVendor = vendorFilter === 'all' || order.vendors.slug === vendorFilter;

    return matchesSearch && matchesStatus && matchesVendor;
  });

  const getUniqueVendors = () => {
    const vendors = new Map();
    orders.forEach(order => {
      vendors.set(order.vendors.slug, order.vendors.name);
    });
    return Array.from(vendors.entries());
  };

  const StatCard = ({ title, value, icon: Icon, prefix = '', suffix = '' }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{prefix}{value}{suffix}</p>
          </div>
          <Icon className="h-8 w-8 text-blue-600" />
        </div>
      </CardContent>
    </Card>
  );

  const OrderCard = ({ order }: { order: OrderWithVendor }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold">#{order.id.slice(-8)}</span>
            <Badge className={`
              ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
              ${order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : ''}
              ${order.status === 'preparing' ? 'bg-orange-100 text-orange-800' : ''}
              ${order.status === 'ready' ? 'bg-green-100 text-green-800' : ''}
              ${order.status === 'completed' ? 'bg-gray-100 text-gray-800' : ''}
            `}>
              {order.status}
            </Badge>
            <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
              {order.payment_status}
            </Badge>
          </div>
          <span className="font-bold">€{order.total_amount.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>{order.vendors.name}</span>
          <span>{new Date(order.created_at).toLocaleString()}</span>
        </div>

        <div className="text-sm">
          <strong>Customer:</strong> {order.customer_name || 'Guest'}
        </div>

        <div className="text-sm mt-1">
          <strong>Items:</strong> {order.order_items?.map(item => 
            `${item.quantity}x ${item.menu_items?.name}`
          ).join(', ')}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div className="text-center py-8">Loading admin dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Order Tracking</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={Users}
        />
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue.toFixed(2)}
          icon={DollarSign}
          prefix="€"
        />
        <StatCard
          title="Active Vendors"
          value={stats.activeVendors}
          icon={TrendingUp}
        />
        <StatCard
          title="Avg Order Value"
          value={stats.averageOrderValue.toFixed(2)}
          icon={Clock}
          prefix="€"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Order Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={vendorFilter} onValueChange={setVendorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by vendor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendors</SelectItem>
                {getUniqueVendors().map(([slug, name]) => (
                  <SelectItem key={slug} value={slug}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Orders</h2>
          <Badge variant="outline">
            {filteredOrders.length} orders
          </Badge>
        </div>

        {filteredOrders.map(order => (
          <OrderCard key={order.id} order={order} />
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No orders match your filters
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrderTracking;

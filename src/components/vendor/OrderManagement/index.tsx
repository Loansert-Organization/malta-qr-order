
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Bell, Clock, ChefHat, CheckCircle, Search, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  customer_name?: string;
  customer_phone?: string;
  notes?: string;
  created_at: string;
  estimated_ready_time?: string;
  order_items: Array<{
    quantity: number;
    menu_items: {
      name: string;
    };
  }>;
}

const OrderManagement: React.FC = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
    
    // Set up real-time subscription for new orders
    const channel = supabase
      .channel('vendor-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      // Mock data for demonstration - replace with actual vendor-specific query
      const mockOrders: Order[] = [
        {
          id: '1',
          total_amount: 45.50,
          status: 'pending',
          payment_status: 'paid',
          customer_name: 'John Doe',
          customer_phone: '+356 9999 1234',
          notes: 'No onions please',
          created_at: new Date().toISOString(),
          estimated_ready_time: new Date(Date.now() + 20 * 60000).toISOString(),
          order_items: [
            { quantity: 2, menu_items: { name: 'Margherita Pizza' } },
            { quantity: 1, menu_items: { name: 'Caesar Salad' } }
          ]
        },
        {
          id: '2',
          total_amount: 28.00,
          status: 'preparing',
          payment_status: 'paid',
          customer_name: 'Maria Garcia',
          created_at: new Date(Date.now() - 10 * 60000).toISOString(),
          estimated_ready_time: new Date(Date.now() + 15 * 60000).toISOString(),
          order_items: [
            { quantity: 1, menu_items: { name: 'Fish & Chips' } },
            { quantity: 2, menu_items: { name: 'Local Beer' } }
          ]
        }
      ];

      setOrders(mockOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString(),
          ...(newStatus === 'ready' && { actual_ready_time: new Date().toISOString() })
        })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Order status changed to ${newStatus}`,
      });

      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparing': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusActions = (order: Order) => {
    const actions = [];
    
    switch (order.status) {
      case 'pending':
        actions.push(
          <Button
            key="confirm"
            size="sm"
            onClick={() => updateOrderStatus(order.id, 'confirmed')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Confirm
          </Button>
        );
        break;
      case 'confirmed':
        actions.push(
          <Button
            key="preparing"
            size="sm"
            onClick={() => updateOrderStatus(order.id, 'preparing')}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <ChefHat className="h-4 w-4 mr-1" />
            Start Preparing
          </Button>
        );
        break;
      case 'preparing':
        actions.push(
          <Button
            key="ready"
            size="sm"
            onClick={() => updateOrderStatus(order.id, 'ready')}
            className="bg-green-600 hover:bg-green-700"
          >
            <Bell className="h-4 w-4 mr-1" />
            Mark Ready
          </Button>
        );
        break;
      case 'ready':
        actions.push(
          <Button
            key="complete"
            size="sm"
            onClick={() => updateOrderStatus(order.id, 'completed')}
            variant="outline"
          >
            Complete
          </Button>
        );
        break;
    }

    return actions;
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filterOrdersByStatus = (status: string) => {
    return filteredOrders.filter(order => order.status === status);
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <span className="font-semibold">Order #{order.id.slice(-8)}</span>
            <Badge className={getStatusColor(order.status)}>
              {order.status}
            </Badge>
            {order.payment_status === 'paid' && (
              <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>
            )}
          </div>
          <div className="text-right">
            <span className="font-bold text-lg">€{order.total_amount.toFixed(2)}</span>
            <div className="text-sm text-gray-500">
              {new Date(order.created_at).toLocaleTimeString()}
            </div>
          </div>
        </div>

        <div className="mb-3">
          <p className="font-medium">{order.customer_name || 'Guest'}</p>
          {order.customer_phone && (
            <p className="text-sm text-gray-600">{order.customer_phone}</p>
          )}
        </div>

        <div className="space-y-1 mb-3">
          {order.order_items?.map((item, index) => (
            <div key={index} className="text-sm flex justify-between">
              <span>{item.quantity}x {item.menu_items?.name}</span>
            </div>
          ))}
        </div>

        {order.notes && (
          <div className="bg-yellow-50 border border-yellow-200 p-2 rounded text-sm mb-3">
            <strong>Notes:</strong> {order.notes}
          </div>
        )}

        {order.estimated_ready_time && (
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
            <Clock className="h-4 w-4" />
            Ready by {new Date(order.estimated_ready_time).toLocaleTimeString()}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000)} minutes ago
          </div>
          <div className="flex space-x-2">
            {getStatusActions(order)}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div className="text-center py-8">Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Order Management</h1>
        <div className="flex space-x-2">
          <Badge variant="outline" className="bg-yellow-50">
            {filterOrdersByStatus('pending').length} Pending
          </Badge>
          <Badge variant="outline" className="bg-orange-50">
            {filterOrdersByStatus('preparing').length} Preparing
          </Badge>
          <Badge variant="outline" className="bg-green-50">
            {filterOrdersByStatus('ready').length} Ready
          </Badge>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search orders by customer name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Orders Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">Active Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending ({filterOrdersByStatus('pending').length})</TabsTrigger>
          <TabsTrigger value="preparing">Preparing ({filterOrdersByStatus('preparing').length})</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="space-y-4">
            {[...filterOrdersByStatus('pending'), ...filterOrdersByStatus('confirmed'), ...filterOrdersByStatus('preparing'), ...filterOrdersByStatus('ready')].map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
            {filteredOrders.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No active orders
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <div className="space-y-4">
            {filterOrdersByStatus('pending').map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
            {filterOrdersByStatus('pending').length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No pending orders
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="preparing">
          <div className="space-y-4">
            {filterOrdersByStatus('preparing').map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
            {filterOrdersByStatus('preparing').length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No orders being prepared
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="space-y-4">
            {filterOrdersByStatus('completed').map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
            {filterOrdersByStatus('completed').length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No completed orders
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderManagement;

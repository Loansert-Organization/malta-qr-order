
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Clock, ChefHat, CheckCircle, Eye } from 'lucide-react';
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

interface VendorOrderDashboardProps {
  vendorId: string;
}

const VendorOrderDashboard: React.FC<VendorOrderDashboardProps> = ({ vendorId }) => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
          table: 'orders',
          filter: `vendor_id=eq.${vendorId}`
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [vendorId]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            menu_items (name)
          )
        `)
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
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

      // Add to order history
      await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          status: newStatus,
          changed_by: 'vendor'
        });

      // Create vendor notification
      await supabase
        .from('vendor_notifications')
        .insert({
          vendor_id: vendorId,
          order_id: orderId,
          notification_type: 'status_update',
          message: `Order status updated to ${newStatus}`
        });

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
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const filterOrdersByStatus = (status: string) => {
    return orders.filter(order => order.status === status);
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold">Order #{order.id.slice(-8)}</span>
            <Badge className={getStatusColor(order.status)}>
              {order.status}
            </Badge>
            {order.payment_status === 'paid' && (
              <Badge className="bg-green-100 text-green-800">Paid</Badge>
            )}
          </div>
          <span className="font-bold">€{order.total_amount.toFixed(2)}</span>
        </div>

        <div className="text-sm text-gray-600 mb-2">
          {new Date(order.created_at).toLocaleTimeString()} • {order.customer_name || 'Guest'}
        </div>

        <div className="space-y-1 mb-3">
          {order.order_items?.map((item, index) => (
            <div key={index} className="text-sm">
              {item.quantity}x {item.menu_items?.name}
            </div>
          ))}
        </div>

        {order.notes && (
          <div className="bg-yellow-50 p-2 rounded text-sm mb-3">
            <strong>Notes:</strong> {order.notes}
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedOrder(order)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Button>
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Order Management</h1>
        <div className="flex space-x-2">
          <Badge variant="outline">
            {filterOrdersByStatus('pending').length} Pending
          </Badge>
          <Badge variant="outline">
            {filterOrdersByStatus('preparing').length} Preparing
          </Badge>
        </div>
      </div>

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
            {filterOrdersByStatus('pending').length === 0 && filterOrdersByStatus('confirmed').length === 0 && filterOrdersByStatus('preparing').length === 0 && filterOrdersByStatus('ready').length === 0 && (
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

export default VendorOrderDashboard;

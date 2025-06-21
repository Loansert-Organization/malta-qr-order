
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, Users, AlertCircle, RefreshCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface OrderItem {
  menu_item: {
    name: string;
    price: number;
  };
  quantity: number;
  unit_price: number;
}

interface Order {
  id: string;
  guest_session_id: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  created_at: string;
  order_items: OrderItem[];
}

interface OrderManagementProps {
  vendorId: string;
}

const OrderManagement: React.FC<OrderManagementProps> = ({ vendorId }) => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');

  useEffect(() => {
    fetchOrders();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('orders-changes')
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
            unit_price,
            menu_item:menu_items (
              name,
              price
            )
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

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      toast({
        title: "Status updated",
        description: `Order status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Update failed",
        description: "Could not update order status",
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
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'active') {
      return !['completed', 'cancelled'].includes(order.status);
    }
    if (filter === 'completed') {
      return ['completed', 'cancelled'].includes(order.status);
    }
    return true;
  });

  const activeOrders = orders.filter(order => !['completed', 'cancelled'].includes(order.status));
  const todayRevenue = orders
    .filter(order => {
      const orderDate = new Date(order.created_at).toDateString();
      const today = new Date().toDateString();
      return orderDate === today && order.payment_status === 'paid';
    })
    .reduce((sum, order) => sum + order.total_amount, 0);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Orders</p>
                <p className="text-2xl font-bold text-blue-600">{activeOrders.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-bold text-green-600">€{todayRevenue.toFixed(2)}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Order Time</p>
                <p className="text-2xl font-bold text-orange-600">18min</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Refresh */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Order Management</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="flex border rounded-lg">
                <Button
                  variant={filter === 'active' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('active')}
                  className="rounded-r-none"
                >
                  Active ({activeOrders.length})
                </Button>
                <Button
                  variant={filter === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('all')}
                  className="rounded-none border-x"
                >
                  All Orders
                </Button>
                <Button
                  variant={filter === 'completed' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('completed')}
                  className="rounded-l-none"
                >
                  Completed
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={fetchOrders}>
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {filter === 'active' ? 'No active orders' : 'No orders found'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">#{order.id.slice(-6)}</h4>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                        <Badge className={getPaymentStatusColor(order.payment_status)}>
                          {order.payment_status}
                        </Badge>
                        {order.payment_method && (
                          <Badge variant="outline">
                            {order.payment_method}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        €{order.total_amount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-4">
                    <h5 className="font-medium mb-2">Items:</h5>
                    <div className="space-y-1">
                      {order.order_items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.menu_item.name}</span>
                          <span>€{(item.quantity * item.unit_price).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Actions */}
                  {!['completed', 'cancelled'].includes(order.status) && (
                    <div className="flex flex-wrap gap-2">
                      {order.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'confirmed')}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Confirm Order
                        </Button>
                      )}
                      {order.status === 'confirmed' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          Start Preparing
                        </Button>
                      )}
                      {order.status === 'preparing' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'ready')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Mark Ready
                        </Button>
                      )}
                      {order.status === 'ready' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                          variant="outline"
                        >
                          Complete Order
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        className="text-red-600 hover:text-red-700"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderManagement;

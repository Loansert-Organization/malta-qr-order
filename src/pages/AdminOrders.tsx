import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Home, Search, CheckCircle, XCircle, Clock, Filter, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Order {
  id: string;
  bar_id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  currency: string;
  payment_method: string | null;
  customer_phone: string | null;
  created_at: string;
  bar?: {
    name: string;
    country: string;
  };
  order_items?: OrderItem[];
}

interface OrderItem {
  id: string;
  menu_item_id: string;
  quantity: number;
  price: number;
  menu?: {
    name: string;
  };
}

const AdminOrders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionType, setActionType] = useState<'confirm' | 'cancel'>('confirm');
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    fetchOrders();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('admin-orders-monitoring')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [countryFilter, statusFilter, dateFilter]);

  const fetchOrders = async () => {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          bar:bars(name, country),
          order_items(
            *,
            menu:menus(name)
          )
        `)
        .order('created_at', { ascending: false });

      // Apply date filter
      const now = new Date();
      if (dateFilter === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query = query.gte('created_at', today.toISOString());
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte('created_at', weekAgo.toISOString());
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        query = query.gte('created_at', monthAgo.toISOString());
      }

      // Apply status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'pending') {
          query = query.eq('payment_status', 'pending');
        } else if (statusFilter === 'confirmed') {
          query = query.eq('payment_status', 'confirmed');
        } else if (statusFilter === 'cancelled') {
          query = query.eq('payment_status', 'cancelled');
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      // Apply country filter on client side since we need to filter by bar.country
      let filteredData = data || [];
      if (countryFilter !== 'all') {
        filteredData = filteredData.filter(order => order.bar?.country === countryFilter);
      }

      setOrders(filteredData);
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

  const handleAction = (order: Order, type: 'confirm' | 'cancel') => {
    setSelectedOrder(order);
    setActionType(type);
    setShowActionDialog(true);
  };

  const confirmAction = async () => {
    if (!selectedOrder) return;

    try {
      const updateData = actionType === 'confirm' 
        ? { 
            payment_status: 'confirmed',
            status: 'completed'
          }
        : { 
            payment_status: 'cancelled',
            status: 'cancelled'
          };

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', selectedOrder.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Order ${actionType === 'confirm' ? 'confirmed' : 'cancelled'} successfully`,
      });

      setShowActionDialog(false);
      fetchOrders();
    } catch (error) {
      console.error(`Error ${actionType}ing order:`, error);
      toast({
        title: "Error",
        description: `Failed to ${actionType} order`,
        variant: "destructive"
      });
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsDialog(true);
  };

  const getStatusBadge = (order: Order) => {
    if (order.payment_status === 'confirmed') {
      return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
    } else if (order.payment_status === 'cancelled') {
      return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  const filteredOrders = orders.filter(order =>
    order.bar?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer_phone?.includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/admin')}
              >
                <Home className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold">Order Monitoring</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Order ID, bar name, phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger id="country">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    <SelectItem value="Malta">Malta</SelectItem>
                    <SelectItem value="Rwanda">Rwanda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Date Range</Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger id="date">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Orders ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Bar</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        {order.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>{order.bar?.name}</TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          {order.currency === 'RWF' ? 'RWF' : '€'} {order.total_amount}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(order)}</TableCell>
                      <TableCell>
                        {order.payment_method || order.bar?.country === 'Rwanda' ? 'MoMo' : 'Revolut'}
                      </TableCell>
                      <TableCell>{order.customer_phone || 'Anonymous'}</TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(order)}
                          >
                            View
                          </Button>
                          {order.payment_status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleAction(order, 'confirm')}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleAction(order, 'cancel')}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Confirmation Dialog */}
      <AlertDialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'confirm' ? 'Confirm Order' : 'Cancel Order'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {actionType} order {selectedOrder?.id.slice(0, 8)}...? 
              This action will override the current payment status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmAction}
              className={actionType === 'cancel' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {actionType === 'confirm' ? 'Confirm' : 'Cancel Order'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Order Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order ID: {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Bar</Label>
                  <p className="font-semibold">{selectedOrder.bar?.name}</p>
                </div>
                <div>
                  <Label>Country</Label>
                  <p className="font-semibold">{selectedOrder.bar?.country}</p>
                </div>
                <div>
                  <Label>Total Amount</Label>
                  <p className="font-semibold">
                    {selectedOrder.currency === 'RWF' ? 'RWF' : '€'} {selectedOrder.total_amount}
                  </p>
                </div>
                <div>
                  <Label>Payment Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedOrder)}</div>
                </div>
                <div>
                  <Label>Customer Phone</Label>
                  <p className="font-semibold">{selectedOrder.customer_phone || 'Anonymous'}</p>
                </div>
                <div>
                  <Label>Created At</Label>
                  <p className="font-semibold">
                    {new Date(selectedOrder.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <Label>Order Items</Label>
                <Card className="mt-2">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      {selectedOrder.order_items?.map((item) => (
                        <div key={item.id} className="flex justify-between">
                          <span>
                            {item.menu?.name} x{item.quantity}
                          </span>
                          <span className="font-semibold">
                            {selectedOrder.currency === 'RWF' ? 'RWF' : '€'} {item.price * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders; 
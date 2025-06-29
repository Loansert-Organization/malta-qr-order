import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Home, Calendar, DollarSign, TrendingUp, Filter, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, startOfWeek, startOfMonth, endOfWeek, endOfMonth } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Payment {
  id: string;
  order_id: string;
  payment_method: string;
  status: string;
  created_at: string;
  order: {
    total_amount: number;
    currency: string;
  };
}

interface PaymentStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
}

const VendorPayments = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [barId, setBarId] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState('today');
  const [methodFilter, setMethodFilter] = useState('all');
  const [stats, setStats] = useState<PaymentStats>({
    today: 0,
    thisWeek: 0,
    thisMonth: 0
  });

  useEffect(() => {
    const storedBarId = localStorage.getItem('vendorBarId');
    if (!storedBarId) {
      navigate('/vendor');
      return;
    }
    setBarId(storedBarId);
  }, [navigate]);

  useEffect(() => {
    if (barId) {
      fetchPayments();
    }
  }, [barId, dateFilter, methodFilter]);

  const fetchPayments = async () => {
    if (!barId) return;

    try {
      // Build date range based on filter
      let startDate = new Date();
      let endDate = new Date();

      switch (dateFilter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'week':
          startDate = startOfWeek(new Date());
          endDate = endOfWeek(new Date());
          break;
        case 'month':
          startDate = startOfMonth(new Date());
          endDate = endOfMonth(new Date());
          break;
      }

      // Fetch payments with orders
      let query = supabase
        .from('payments')
        .select(`
          *,
          order:orders!order_id (
            total_amount,
            currency,
            bar_id
          )
        `)
        .eq('order.bar_id', barId)
        .eq('status', 'confirmed')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (methodFilter !== 'all') {
        query = query.eq('payment_method', methodFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filter out null orders
      const validPayments = (data || []).filter(payment => payment.order !== null);
      setPayments(validPayments);

      // Calculate stats
      await calculateStats(barId);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Error",
        description: "Failed to load payments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = async (barId: string) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Today's sales
      const { data: todayData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('bar_id', barId)
        .eq('payment_status', 'confirmed')
        .gte('created_at', today.toISOString());

      const todayTotal = todayData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      // This week's sales
      const weekStart = startOfWeek(new Date());
      const { data: weekData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('bar_id', barId)
        .eq('payment_status', 'confirmed')
        .gte('created_at', weekStart.toISOString());

      const weekTotal = weekData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      // This month's sales
      const monthStart = startOfMonth(new Date());
      const { data: monthData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('bar_id', barId)
        .eq('payment_status', 'confirmed')
        .gte('created_at', monthStart.toISOString());

      const monthTotal = monthData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      setStats({
        today: todayTotal,
        thisWeek: weekTotal,
        thisMonth: monthTotal
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const exportPayments = () => {
    // Create CSV content
    const headers = ['Date', 'Order ID', 'Method', 'Amount', 'Status'];
    const rows = payments.map(payment => [
      format(new Date(payment.created_at), 'yyyy-MM-dd HH:mm'),
      payment.order_id.slice(0, 8).toUpperCase(),
      payment.payment_method,
      `${payment.order.currency === 'RWF' ? 'RWF' : '€'} ${payment.order.total_amount.toFixed(2)}`,
      payment.status
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${dateFilter}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Payments exported successfully",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payments...</p>
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
                onClick={() => navigate('/vendor')}
              >
                <Home className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold">Payments</h1>
            </div>
            <Button onClick={exportPayments} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{stats.today.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{stats.thisWeek.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{stats.thisMonth.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label className="text-sm text-gray-600 mb-1">Date Range</Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label className="text-sm text-gray-600 mb-1">Payment Method</Label>
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="MoMo">MoMo</SelectItem>
                    <SelectItem value="Revolut">Revolut</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No payments found for the selected filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {format(new Date(payment.created_at), 'dd MMM yyyy HH:mm')}
                        </TableCell>
                        <TableCell className="font-mono">
                          {payment.order_id.slice(0, 8).toUpperCase()}
                        </TableCell>
                        <TableCell>{payment.payment_method}</TableCell>
                        <TableCell className="font-medium">
                          {payment.order.currency === 'RWF' ? 'RWF' : '€'} {payment.order.total_amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorPayments; 
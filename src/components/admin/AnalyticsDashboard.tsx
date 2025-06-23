
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, Clock, MapPin, Star, AlertCircle, CheckCircle } from 'lucide-react';

interface MetricData {
  date: string;
  orders: number;
  revenue: number;
  customers: number;
  avgOrderValue: number;
}

interface VendorData {
  name: string;
  orders: number;
  revenue: number;
  rating: number;
  status: 'active' | 'pending' | 'inactive';
}

interface OrderStatusData {
  name: string;
  value: number;
  color: string;
}

interface TimeData {
  hour: string;
  orders: number;
}

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<any>;
  trend: 'up' | 'down';
}

interface VendorTableProps {
  vendors: VendorData[];
}

interface RealtimeMetricsState {
  activeOrders: number;
  onlineVendors: number;
  avgWaitTime: number;
  systemStatus: string;
}

interface DashboardData {
  last30Days: MetricData[];
  vendorData: VendorData[];
  orderStatusData: OrderStatusData[];
  timeData: TimeData[];
}

// Mock data generator
const generateMockData = (): DashboardData => {
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return {
      date: date.toISOString().split('T')[0],
      orders: Math.floor(Math.random() * 100) + 20,
      revenue: Math.floor(Math.random() * 5000) + 1000,
      customers: Math.floor(Math.random() * 50) + 10,
      avgOrderValue: Math.floor(Math.random() * 50) + 20
    };
  }).reverse();

  const vendorData: VendorData[] = [
    { name: 'Café Central', orders: 245, revenue: 12500, rating: 4.8, status: 'active' },
    { name: 'Pizza Palace', orders: 189, revenue: 9800, rating: 4.6, status: 'active' },
    { name: 'Burger Joint', orders: 156, revenue: 7800, rating: 4.4, status: 'active' },
    { name: 'Sushi Master', orders: 134, revenue: 15600, rating: 4.9, status: 'active' },
    { name: 'Taco Time', orders: 98, revenue: 4900, rating: 4.2, status: 'pending' }
  ];

  const orderStatusData: OrderStatusData[] = [
    { name: 'Completed', value: 68, color: '#10B981' },
    { name: 'Pending', value: 15, color: '#F59E0B' },
    { name: 'Cancelled', value: 12, color: '#EF4444' },
    { name: 'Processing', value: 5, color: '#3B82F6' }
  ];

  const timeData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    orders: Math.floor(Math.random() * 30) + 5
  }));

  return { last30Days, vendorData, orderStatusData, timeData };
};

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon: Icon, trend }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <div className="flex items-center mt-2">
          {trend === 'up' ? (
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
          )}
          <span className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </span>
        </div>
      </div>
      <div className="p-3 bg-blue-50 rounded-full">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>
    </div>
  </div>
);

const VendorTable: React.FC<VendorTableProps> = ({ vendors }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h3 className="text-lg font-semibold mb-4">Top Vendors</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vendor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Orders
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Revenue
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rating
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {vendors.map((vendor, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {vendor.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {vendor.orders}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                €{vendor.revenue.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-sm text-gray-900">{vendor.rating}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  vendor.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {vendor.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const RealtimeMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<RealtimeMetricsState>({
    activeOrders: 12,
    onlineVendors: 8,
    avgWaitTime: 15,
    systemStatus: 'healthy'
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        activeOrders: Math.floor(Math.random() * 20) + 5,
        onlineVendors: Math.floor(Math.random() * 10) + 5,
        avgWaitTime: Math.floor(Math.random() * 10) + 10
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Active Orders</p>
            <p className="text-xl font-bold text-blue-600">{metrics.activeOrders}</p>
          </div>
          <ShoppingCart className="h-8 w-8 text-blue-600" />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Online Vendors</p>
            <p className="text-xl font-bold text-green-600">{metrics.onlineVendors}</p>
          </div>
          <MapPin className="h-8 w-8 text-green-600" />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Avg Wait Time</p>
            <p className="text-xl font-bold text-orange-600">{metrics.avgWaitTime}m</p>
          </div>
          <Clock className="h-8 w-8 text-orange-600" />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">System Status</p>
            <p className="text-sm font-medium text-green-600">Healthy</p>
          </div>
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
      </div>
    </div>
  );
};

const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [data, setData] = useState<DashboardData>(generateMockData());

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
    // In real implementation, fetch data based on range
    setData(generateMockData());
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time insights for ICUPA Malta</p>
          
          {/* Time Range Selector */}
          <div className="mt-4 flex space-x-2">
            {['7d', '30d', '90d', '1y'].map((range) => (
              <button
                key={range}
                onClick={() => handleTimeRangeChange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Real-time Metrics */}
        <RealtimeMetrics />

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Orders"
            value="1,234"
            change="+12.5%"
            icon={ShoppingCart}
            trend="up"
          />
          <MetricCard
            title="Revenue"
            value="€45,678"
            change="+8.2%"
            icon={DollarSign}
            trend="up"
          />
          <MetricCard
            title="Active Users"
            value="892"
            change="+15.3%"
            icon={Users}
            trend="up"
          />
          <MetricCard
            title="Avg Order Value"
            value="€37.50"
            change="-2.1%"
            icon={TrendingUp}
            trend="down"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.last30Days}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#93C5FD" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Order Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Order Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Orders by Hour */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Orders by Hour</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.timeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Metrics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Daily Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.last30Days.slice(-7)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="orders" stroke="#3B82F6" />
                <Line type="monotone" dataKey="customers" stroke="#10B981" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vendor Performance Table */}
        <VendorTable vendors={data.vendorData} />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

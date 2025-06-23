
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  ShoppingCart, 
  Star,
  AlertCircle,
  BarChart3,
  PieChart,
  Filter,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';

interface MenuAnalytics {
  item_id: string;
  item_name: string;
  category: string;
  price: number;
  total_orders: number;
  total_revenue: number;
  views: number;
  conversion_rate: number;
  avg_rating: number;
  last_ordered: string;
  trend: 'up' | 'down' | 'stable';
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

interface CategoryStats {
  category: string;
  items_count: number;
  total_revenue: number;
  avg_conversion: number;
  top_item: string;
}

interface MenuAnalyticsProps {
  vendorId: string;
}

const MenuAnalytics: React.FC<MenuAnalyticsProps> = ({ vendorId }) => {
  const [analytics, setAnalytics] = useState<MenuAnalytics[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchMenuAnalytics();
  }, [vendorId, timeRange, selectedCategory]);

  const fetchMenuAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch menu analytics data
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('menu_analytics')
        .select(`
          *,
          menu_items(name, category, price, is_available)
        `)
        .eq('vendor_id', vendorId)
        .gte('created_at', getDateRange(timeRange));

      if (analyticsError) throw analyticsError;

      // Transform and aggregate data
      const transformedAnalytics: MenuAnalytics[] = analyticsData?.map(item => ({
        item_id: item.menu_item_id,
        item_name: item.menu_items?.name || 'Unknown Item',
        category: item.menu_items?.category || 'Uncategorized',
        price: item.menu_items?.price || 0,
        total_orders: item.total_orders || 0,
        total_revenue: item.total_revenue || 0,
        views: item.page_views || 0,
        conversion_rate: item.page_views > 0 ? (item.total_orders / item.page_views) * 100 : 0,
        avg_rating: item.avg_rating || 0,
        last_ordered: item.last_ordered_at || '',
        trend: item.revenue_trend || 'stable',
        stock_status: item.menu_items?.is_available ? 'in_stock' : 'out_of_stock'
      })) || [];

      // Calculate category statistics
      const categoryStatsMap = new Map<string, CategoryStats>();
      transformedAnalytics.forEach(item => {
        const existing = categoryStatsMap.get(item.category) || {
          category: item.category,
          items_count: 0,
          total_revenue: 0,
          avg_conversion: 0,
          top_item: ''
        };

        existing.items_count += 1;
        existing.total_revenue += item.total_revenue;
        existing.avg_conversion += item.conversion_rate;
        
        if (item.total_revenue > (transformedAnalytics.find(i => i.item_name === existing.top_item)?.total_revenue || 0)) {
          existing.top_item = item.item_name;
        }

        categoryStatsMap.set(item.category, existing);
      });

      // Finalize category stats
      const finalCategoryStats = Array.from(categoryStatsMap.values()).map(stats => ({
        ...stats,
        avg_conversion: stats.avg_conversion / stats.items_count
      }));

      setAnalytics(transformedAnalytics);
      setCategoryStats(finalCategoryStats);
    } catch (error) {
      console.error('Error fetching menu analytics:', error);
      toast.error('Failed to load menu analytics');
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (range: string) => {
    const now = new Date();
    switch (range) {
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const getStockBadge = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <Badge className="bg-green-100 text-green-800">In Stock</Badge>;
      case 'low_stock':
        return <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
      case 'out_of_stock':
        return <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const filteredAnalytics = selectedCategory === 'all' 
    ? analytics 
    : analytics.filter(item => item.category === selectedCategory);

  const topPerformers = [...analytics].sort((a, b) => b.total_revenue - a.total_revenue).slice(0, 5);
  const underPerformers = [...analytics].sort((a, b) => a.conversion_rate - b.conversion_rate).slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Menu Analytics</h2>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All Categories</option>
            {categoryStats.map(cat => (
              <option key={cat.category} value={cat.category}>
                {cat.category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categoryStats.map(category => (
          <Card key={category.category}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{category.category}</h3>
                <PieChart className="h-4 w-4 text-gray-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Items:</span>
                  <span className="font-medium">{category.items_count}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Revenue:</span>
                  <span className="font-medium">€{category.total_revenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Avg. Conversion:</span>
                  <span className="font-medium">{category.avg_conversion.toFixed(1)}%</span>
                </div>
                <div className="text-xs text-gray-600">
                  Top: {category.top_item}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="items">All Items</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Top Performers</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topPerformers.map((item, index) => (
                  <div key={item.item_id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-gray-500">#{index + 1}</span>
                      <div>
                        <p className="font-medium text-sm">{item.item_name}</p>
                        <p className="text-xs text-gray-600">{item.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">€{item.total_revenue.toFixed(2)}</p>
                      <p className="text-xs text-gray-600">{item.total_orders} orders</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Needs Attention */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <span>Needs Attention</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {underPerformers.map((item, index) => (
                  <div key={item.item_id} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <div>
                        <p className="font-medium text-sm">{item.item_name}</p>
                        <p className="text-xs text-gray-600">{item.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-yellow-800">{item.conversion_rate.toFixed(1)}%</p>
                      <p className="text-xs text-gray-600">{item.views} views</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{analytics.length}</p>
                <p className="text-sm text-gray-600">Total Menu Items</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Eye className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">
                  {analytics.reduce((sum, item) => sum + item.views, 0)}
                </p>
                <p className="text-sm text-gray-600">Total Views</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <ShoppingCart className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">
                  {analytics.reduce((sum, item) => sum + item.total_orders, 0)}
                </p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Revenue Opportunity</h4>
                <p className="text-sm text-blue-700">
                  Your {topPerformers[0]?.item_name} is performing exceptionally well. 
                  Consider creating combo deals or promoting similar items.
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">Optimization Needed</h4>
                <p className="text-sm text-yellow-700">
                  Items in the {underPerformers[0]?.category} category have low conversion rates. 
                  Consider updating descriptions or images.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <div className="space-y-3">
            {filteredAnalytics.map(item => (
              <Card key={item.item_id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold">{item.item_name}</h4>
                        {getTrendIcon(item.trend)}
                        {getStockBadge(item.stock_status)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{item.category}</span>
                        <span>€{item.price.toFixed(2)}</span>
                        <span>{item.total_orders} orders</span>
                        <span>{item.views} views</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">€{item.total_revenue.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">{item.conversion_rate.toFixed(1)}% conversion</p>
                      {item.avg_rating > 0 && (
                        <div className="flex items-center justify-end space-x-1 mt-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs">{item.avg_rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Conversion Rate</span>
                      <span>{item.conversion_rate.toFixed(1)}%</span>
                    </div>
                    <Progress value={Math.min(item.conversion_rate, 100)} className="h-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MenuAnalytics;

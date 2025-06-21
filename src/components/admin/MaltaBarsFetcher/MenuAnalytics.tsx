
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Menu, TrendingUp, Database, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface MenuStats {
  total_bars: number;
  bars_with_menus: number;
  total_menu_items: number;
  items_with_images: number;
  avg_items_per_bar: number;
  categories: { [key: string]: number };
  extraction_logs: any[];
}

const MenuAnalytics = () => {
  const [stats, setStats] = useState<MenuStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMenuStats = async () => {
    try {
      setLoading(true);

      // Get bars with menus
      const { data: barsWithMenus, error: barsError } = await supabase
        .from('bars')
        .select(`
          id,
          name,
          menu_items(count)
        `)
        .not('menu_items', 'is', null);

      if (barsError) throw barsError;

      // Get total menu items
      const { data: allMenuItems, error: itemsError } = await supabase
        .from('menu_items')
        .select('id, category, image_url, bar_id');

      if (itemsError) throw itemsError;

      // Get extraction logs
      const { data: logs, error: logsError } = await supabase
        .from('menu_scraping_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (logsError) throw logsError;

      // Get total bars
      const { count: totalBars } = await supabase
        .from('bars')
        .select('*', { count: 'exact', head: true });

      // Calculate categories
      const categories: { [key: string]: number } = {};
      allMenuItems?.forEach(item => {
        const category = item.category || 'uncategorized';
        categories[category] = (categories[category] || 0) + 1;
      });

      // Count items with images
      const itemsWithImages = allMenuItems?.filter(item => item.image_url).length || 0;

      const menuStats: MenuStats = {
        total_bars: totalBars || 0,
        bars_with_menus: barsWithMenus?.length || 0,
        total_menu_items: allMenuItems?.length || 0,
        items_with_images: itemsWithImages,
        avg_items_per_bar: barsWithMenus?.length ? (allMenuItems?.length || 0) / barsWithMenus.length : 0,
        categories,
        extraction_logs: logs || []
      };

      setStats(menuStats);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to fetch menu stats: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryData = () => {
    if (!stats) return [];
    
    return Object.entries(stats.categories).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      percentage: Math.round((value / stats.total_menu_items) * 100)
    }));
  };

  const getExtractionData = () => {
    if (!stats) return [];
    
    return stats.extraction_logs.map((log, index) => ({
      name: `Log ${index + 1}`,
      items: log.items_extracted || 0,
      success_rate: log.success_rate || 0,
      processing_time: log.processing_time_ms ? Math.round(log.processing_time_ms / 1000) : 0
    }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    fetchMenuStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Failed to load menu analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bars</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_bars}</div>
            <p className="text-xs text-muted-foreground">
              {stats.bars_with_menus} with menus ({Math.round((stats.bars_with_menus / stats.total_bars) * 100)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
            <Menu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_menu_items}</div>
            <p className="text-xs text-muted-foreground">
              Avg {Math.round(stats.avg_items_per_bar)} per bar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Images</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.items_with_images}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.items_with_images / stats.total_menu_items) * 100)}% coverage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(stats.categories).length}</div>
            <p className="text-xs text-muted-foreground">
              Different categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Menu Coverage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Bars with Menus</span>
                <span>{Math.round((stats.bars_with_menus / stats.total_bars) * 100)}%</span>
              </div>
              <Progress value={(stats.bars_with_menus / stats.total_bars) * 100} />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Items with Images</span>
                <span>{Math.round((stats.items_with_images / stats.total_menu_items) * 100)}%</span>
              </div>
              <Progress value={(stats.items_with_images / stats.total_menu_items) * 100} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Extractions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.extraction_logs.slice(0, 5).map((log, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {new Date(log.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {log.items_extracted || 0} items
                    </Badge>
                    <Badge className={log.success_rate > 80 ? 'bg-green-500' : 'bg-yellow-500'}>
                      {log.success_rate || 0}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Menu Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getCategoryData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getCategoryData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Extraction Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getExtractionData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="items" fill="#8884d8" name="Items Extracted" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MenuAnalytics;

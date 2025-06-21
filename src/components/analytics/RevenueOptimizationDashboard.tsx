
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter } from 'recharts';

interface RevenueOptimization {
  currentRevenue: number;
  potentialRevenue: number;
  optimizationOpportunities: Array<{
    type: 'pricing' | 'upsell' | 'timing' | 'menu';
    title: string;
    description: string;
    impact: number;
    difficulty: 'low' | 'medium' | 'high';
    priority: 'high' | 'medium' | 'low';
  }>;
  pricingAnalysis: Array<{
    item: string;
    currentPrice: number;
    suggestedPrice: number;
    demandElasticity: number;
    revenueImpact: number;
  }>;
  upsellOpportunities: Array<{
    baseItem: string;
    suggestedUpsell: string;
    conversionRate: number;
    revenueIncrease: number;
  }>;
  peakHourAnalysis: Array<{
    hour: string;
    currentRevenue: number;
    capacity: number;
    utilizationRate: number;
    opportunity: number;
  }>;
  seasonalTrends: Array<{
    period: string;
    revenue: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

const RevenueOptimizationDashboard = () => {
  const [optimization, setOptimization] = useState<RevenueOptimization>({
    currentRevenue: 0,
    potentialRevenue: 0,
    optimizationOpportunities: [],
    pricingAnalysis: [],
    upsellOpportunities: [],
    peakHourAnalysis: [],
    seasonalTrends: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRevenueOptimizationData();
  }, []);

  const loadRevenueOptimizationData = async () => {
    try {
      // Get orders and menu items data
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            unit_price,
            total_price,
            menu_item:menu_items (name, price, category)
          )
        `)
        .eq('payment_status', 'paid')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const { data: menuItems } = await supabase
        .from('menu_items')
        .select('*');

      if (orders && menuItems) {
        const currentRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
        
        // Generate optimization opportunities
        const optimizationOpportunities = [
          {
            type: 'pricing' as const,
            title: 'Dynamic Pricing Strategy',
            description: 'Implement time-based pricing for peak hours to increase revenue by 15-20%',
            impact: 850,
            difficulty: 'medium' as const,
            priority: 'high' as const
          },
          {
            type: 'upsell' as const,
            title: 'AI-Powered Upselling',
            description: 'Use Kai to suggest complementary items and increase average order value',
            impact: 650,
            difficulty: 'low' as const,
            priority: 'high' as const
          },
          {
            type: 'menu' as const,
            title: 'Menu Engineering',
            description: 'Optimize menu layout to promote high-margin items',
            impact: 450,
            difficulty: 'low' as const,
            priority: 'medium' as const
          },
          {
            type: 'timing' as const,
            title: 'Happy Hour Optimization',
            description: 'Adjust happy hour timing based on customer behavior patterns',
            impact: 320,
            difficulty: 'low' as const,
            priority: 'medium' as const
          }
        ];

        // Pricing analysis with mock data
        const pricingAnalysis = menuItems.slice(0, 5).map(item => ({
          item: item.name,
          currentPrice: item.price,
          suggestedPrice: item.price * (1 + (Math.random() * 0.4 - 0.2)), // ±20% variation
          demandElasticity: Math.random() * 2 + 0.5,
          revenueImpact: Math.random() * 200 + 50
        }));

        // Upsell opportunities
        const upsellOpportunities = [
          {
            baseItem: 'Classic Burger',
            suggestedUpsell: 'Add Fries & Drink',
            conversionRate: 35,
            revenueIncrease: 8.5
          },
          {
            baseItem: 'Pizza Margherita',
            suggestedUpsell: 'Upgrade to Premium Toppings',
            conversionRate: 28,
            revenueIncrease: 12.0
          },
          {
            baseItem: 'House Wine',
            suggestedUpsell: 'Premium Wine Selection',
            conversionRate: 22,
            revenueIncrease: 15.0
          }
        ];

        // Peak hour analysis
        const peakHourAnalysis = Array.from({ length: 24 }, (_, i) => ({
          hour: `${i}:00`,
          currentRevenue: Math.random() * 500,
          capacity: 800,
          utilizationRate: Math.random() * 100,
          opportunity: Math.random() * 200
        })).filter(hour => parseInt(hour.hour) >= 11 && parseInt(hour.hour) <= 23);

        // Seasonal trends
        const seasonalTrends = [
          { period: 'Spring', revenue: currentRevenue * 0.9, trend: 'up' as const },
          { period: 'Summer', revenue: currentRevenue * 1.3, trend: 'up' as const },
          { period: 'Autumn', revenue: currentRevenue * 0.8, trend: 'down' as const },
          { period: 'Winter', revenue: currentRevenue * 0.7, trend: 'stable' as const }
        ];

        const potentialRevenue = currentRevenue + optimizationOpportunities.reduce((sum, opp) => sum + opp.impact, 0);

        setOptimization({
          currentRevenue,
          potentialRevenue,
          optimizationOpportunities,
          pricingAnalysis,
          upsellOpportunities,
          peakHourAnalysis,
          seasonalTrends
        });
      }
    } catch (error) {
      console.error('Error loading revenue optimization data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

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
          <h2 className="text-2xl font-bold text-gray-900">Revenue Optimization</h2>
          <p className="text-gray-600">AI-powered insights to maximize revenue potential</p>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{optimization.currentRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Revenue</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{optimization.potentialRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">With optimizations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Opportunity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{(optimization.potentialRevenue - optimization.currentRevenue).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              +{(((optimization.potentialRevenue - optimization.currentRevenue) / optimization.currentRevenue) * 100).toFixed(1)}% increase
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5" />
            <span>Optimization Opportunities</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {optimization.optimizationOpportunities.map((opportunity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium">{opportunity.title}</h4>
                    <Badge className={getPriorityColor(opportunity.priority)}>
                      {opportunity.priority} priority
                    </Badge>
                    {getDifficultyIcon(opportunity.difficulty)}
                  </div>
                  <p className="text-sm text-gray-600">{opportunity.description}</p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-lg font-semibold text-green-600">+€{opportunity.impact}</div>
                  <div className="text-sm text-gray-500">estimated impact</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Tabs defaultValue="pricing" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pricing">Pricing Analysis</TabsTrigger>
          <TabsTrigger value="upselling">Upsell Opportunities</TabsTrigger>
          <TabsTrigger value="timing">Peak Hour Analysis</TabsTrigger>
          <TabsTrigger value="trends">Seasonal Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Price Optimization Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimization.pricingAnalysis.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{item.item}</div>
                      <div className="text-sm text-gray-600">
                        Current: €{item.currentPrice.toFixe

d(2)} → Suggested: €{item.suggestedPrice.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">+€{item.revenueImpact.toFixed(0)}</div>
                      <div className="text-sm text-gray-600">revenue impact</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upselling">
          <Card>
            <CardHeader>
              <CardTitle>Upselling Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimization.upsellOpportunities.map((upsell, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{upsell.baseItem}</div>
                      <div className="text-sm text-gray-600">→ {upsell.suggestedUpsell}</div>
                      <div className="text-sm text-blue-600">{upsell.conversionRate}% conversion rate</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">+€{upsell.revenueIncrease.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">avg increase</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timing">
          <Card>
            <CardHeader>
              <CardTitle>Peak Hour Revenue Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={optimization.peakHourAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="currentRevenue" fill="#8884d8" name="Current Revenue" />
                  <Bar dataKey="opportunity" fill="#82ca9d" name="Opportunity" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Seasonal Revenue Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {optimization.seasonalTrends.map((trend, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-lg font-semibold">{trend.period}</div>
                    <div className="text-2xl font-bold">€{trend.revenue.toFixed(0)}</div>
                    <div className={`text-sm flex items-center justify-center space-x-1 ${
                      trend.trend === 'up' ? 'text-green-600' : 
                      trend.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      <TrendingUp className={`h-4 w-4 ${trend.trend === 'down' ? 'rotate-180' : ''}`} />
                      <span>{trend.trend}</span>
                    </div>
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

export default RevenueOptimizationDashboard;

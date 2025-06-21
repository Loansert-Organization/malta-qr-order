
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Lightbulb, Star, Clock, Users, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  revenue: {
    today: number;
    yesterday: number;
    week: number;
    trend: 'up' | 'down' | 'stable';
  };
  orders: {
    total: number;
    avgValue: number;
    peakHour: string;
  };
  popular_items: Array<{
    name: string;
    orders: number;
    revenue: number;
  }>;
  ai_recommendations: Array<{
    type: 'menu' | 'pricing' | 'timing' | 'promotion';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

interface AIAnalyticsProps {
  vendorId: string;
}

const AIAnalytics: React.FC<AIAnalyticsProps> = ({ vendorId }) => {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingInsights, setGeneratingInsights] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [vendorId]);

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('vendor-analytics', {
        body: { vendor_id: vendorId }
      });

      if (error) throw error;
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = async () => {
    setGeneratingInsights(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-insights-generator', {
        body: { vendor_id: vendorId }
      });

      if (error) throw error;

      if (data?.insights) {
        setAnalytics(prev => prev ? {
          ...prev,
          ai_recommendations: [...prev.ai_recommendations, ...data.insights]
        } : null);
        
        toast({
          title: "New insights generated",
          description: `${data.insights.length} new recommendations available`,
        });
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        title: "Generation failed",
        description: "Could not generate AI insights",
        variant: "destructive"
      });
    } finally {
      setGeneratingInsights(false);
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

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'menu': return Star;
      case 'pricing': return TrendingUp;
      case 'timing': return Clock;
      case 'promotion': return Target;
      default: return Lightbulb;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No Analytics Data</h3>
            <p className="text-gray-600">Start receiving orders to see analytics and AI insights</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  €{analytics.revenue.today.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  vs yesterday: €{analytics.revenue.yesterday.toFixed(2)}
                </p>
              </div>
              <div className={`p-2 rounded-full ${
                analytics.revenue.trend === 'up' ? 'bg-green-100' : 
                analytics.revenue.trend === 'down' ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                <TrendingUp className={`h-6 w-6 ${
                  analytics.revenue.trend === 'up' ? 'text-green-600' : 
                  analytics.revenue.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.orders.total}</p>
                <p className="text-xs text-gray-500">
                  Avg: €{analytics.orders.avgValue.toFixed(2)}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Peak Hour</p>
                <p className="text-2xl font-bold text-purple-600">{analytics.orders.peakHour}</p>
                <p className="text-xs text-gray-500">Busiest time today</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Popular Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.popular_items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-lg text-amber-600">#{index + 1}</span>
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-600">{item.orders} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">€{item.revenue.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">revenue</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              AI Recommendations
            </CardTitle>
            <Button
              onClick={generateAIInsights}
              disabled={generatingInsights}
              size="sm"
            >
              {generatingInsights ? 'Generating...' : 'Generate New Insights'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.ai_recommendations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No AI recommendations yet.</p>
                <p className="text-sm">Generate insights to get personalized suggestions.</p>
              </div>
            ) : (
              analytics.ai_recommendations.map((rec, index) => {
                const IconComponent = getRecommendationIcon(rec.type);
                return (
                  <div key={index} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5 text-blue-600" />
                        <h4 className="font-medium text-blue-800">{rec.title}</h4>
                      </div>
                      <Badge className={getPriorityColor(rec.priority)}>
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-blue-700">{rec.description}</p>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAnalytics;

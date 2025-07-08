import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Clock, Sun, Users, Sparkles, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AIInsight {
  type: 'trending' | 'weather' | 'time' | 'social';
  title: string;
  description: string;
  items: string[];
  confidence: number;
}

interface ContextData {
  userBehavior?: {
    preferences: string[];
    orderHistory: Array<{
      id: string;
      items: string[];
      total: number;
      date: string;
    }>;
    favoriteItems: string[];
  };
  marketTrends?: {
    popularItems: string[];
    seasonalTrends: string[];
    priceChanges: Array<{
      item: string;
      oldPrice: number;
      newPrice: number;
    }>;
  };
  systemMetrics?: {
    performance: {
      loadTime: number;
      errorRate: number;
      uptime: number;
    };
    usage: {
      activeUsers: number;
      ordersPerHour: number;
      peakHours: string[];
    };
  };
}

interface AIInsightsPanelProps {
  vendorId: string;
  contextData: ContextData;
  onInsightClick: (insight: AIInsight) => void;
}

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  vendorId,
  contextData,
  onInsightClick
}) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-insights-generator', {
        body: {
          vendor_id: vendorId,
          context: contextData,
          insight_types: ['trending', 'weather', 'time', 'social']
        }
      });

      if (error) throw error;
      setInsights(data.insights || []);
    } catch (error) {
      console.error('Error generating insights:', error);
      // Fallback to static insights based on context
      generateFallbackInsights();
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackInsights = () => {
    const currentHour = new Date().getHours();
    const weatherCondition = contextData?.weather?.condition;
    
    const fallbackInsights: AIInsight[] = [];

    // Time-based insights
    if (currentHour >= 17 && currentHour <= 20) {
      fallbackInsights.push({
        type: 'time',
        title: 'Happy Hour Special',
        description: 'Perfect time for cocktails and appetizers',
        items: ['Cocktails', 'Appetizers', 'Wine Selection'],
        confidence: 0.9
      });
    }

    // Weather-based insights
    if (weatherCondition === 'sunny' || weatherCondition === 'clear') {
      fallbackInsights.push({
        type: 'weather',
        title: 'Perfect Weather',
        description: 'Great day for refreshing drinks',
        items: ['Cold Drinks', 'Ice Cream', 'Smoothies'],
        confidence: 0.85
      });
    }

    // Social insights
    if (new Date().getDay() === 5 || new Date().getDay() === 6) {
      fallbackInsights.push({
        type: 'social',
        title: 'Weekend Vibes',
        description: 'Popular choices for weekend dining',
        items: ['Sharing Platters', 'Cocktails', 'Desserts'],
        confidence: 0.8
      });
    }

    setInsights(fallbackInsights);
  };

  useEffect(() => {
    if (vendorId) {
      generateInsights();
    }
  }, [vendorId, contextData]);

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'trending': return <TrendingUp className="h-4 w-4" />;
      case 'weather': return <Sun className="h-4 w-4" />;
      case 'time': return <Clock className="h-4 w-4" />;
      case 'social': return <Users className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  const getInsightColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'trending': return 'bg-green-100 text-green-800';
      case 'weather': return 'bg-yellow-100 text-yellow-800';
      case 'time': return 'bg-blue-100 text-blue-800';
      case 'social': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>AI Insights</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={generateInsights}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.length === 0 && !loading && (
          <p className="text-sm text-gray-500 text-center py-4">
            No insights available right now
          </p>
        )}

        {loading && (
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm">Generating insights...</span>
          </div>
        )}

        {insights.map((insight, index) => (
          <Card 
            key={index}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onInsightClick(insight)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getInsightIcon(insight.type)}
                  <span className="font-medium text-sm">{insight.title}</span>
                </div>
                <Badge className={getInsightColor(insight.type)} variant="secondary">
                  {Math.round(insight.confidence * 100)}%
                </Badge>
              </div>
              
              <p className="text-xs text-gray-600 mb-3">
                {insight.description}
              </p>
              
              <div className="flex flex-wrap gap-1">
                {insight.items.slice(0, 3).map((item, itemIndex) => (
                  <Badge key={itemIndex} variant="outline" className="text-xs">
                    {item}
                  </Badge>
                ))}
                {insight.items.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{insight.items.length - 3} more
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};

export default AIInsightsPanel;

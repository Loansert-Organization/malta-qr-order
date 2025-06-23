
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Lightbulb, 
  Target,
  Users,
  DollarSign,
  Clock,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';

interface AIInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'trend' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  actions: string[];
  metrics: {
    current: number;
    target: number;
    unit: string;
  };
}

interface SmartMetric {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
  insight?: string;
}

const SmartInsights = ({ vendorId }: { vendorId: string }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [metrics, setMetrics] = useState<SmartMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, [vendorId]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      
      // Mock AI insights data
      const mockInsights: AIInsight[] = [
        {
          id: '1',
          type: 'opportunity',
          title: 'Peak Hour Optimization',
          description: 'Your Friday evening orders peak at 7 PM but kitchen efficiency drops by 23%. Consider pre-prep strategies.',
          impact: 'high',
          confidence: 89,
          actions: [
            'Implement pre-prep schedule for Friday afternoons',
            'Add quick-serve items to Friday menu',
            'Consider additional kitchen staff during peak hours'
          ],
          metrics: {
            current: 77,
            target: 92,
            unit: '% efficiency'
          }
        },
        {
          id: '2',
          type: 'trend',
          title: 'Cocktail Demand Surge',
          description: 'Cocktail orders increased 34% this month, especially craft cocktails during 5-7 PM.',
          impact: 'medium',
          confidence: 92,
          actions: [
            'Expand craft cocktail menu',
            'Train bartenders on signature drinks',
            'Promote happy hour cocktails'
          ],
          metrics: {
            current: 134,
            target: 150,
            unit: '% growth'
          }
        },
        {
          id: '3',
          type: 'warning',
          title: 'Customer Wait Time Alert',
          description: 'Average wait time increased to 18 minutes on weekends, above your 15-minute target.',
          impact: 'high',
          confidence: 95,
          actions: [
            'Implement order queue management',
            'Add weekend prep staff',
            'Introduce express menu for quick orders'
          ],
          metrics: {
            current: 18,
            target: 15,
            unit: 'minutes'
          }
        },
        {
          id: '4',
          type: 'recommendation',
          title: 'Menu Item Performance',
          description: 'Your "Mediterranean Bowl" has 89% positive feedback but represents only 3% of orders. Consider promotion.',
          impact: 'medium',
          confidence: 85,
          actions: [
            'Feature as "Chef\'s Recommendation"',
            'Add to promotional banners',
            'Create combo deals with popular items'
          ],
          metrics: {
            current: 3,
            target: 8,
            unit: '% of orders'
          }
        }
      ];

      const mockMetrics: SmartMetric[] = [
        {
          name: 'Revenue',
          value: 12450,
          change: 8.5,
          trend: 'up',
          unit: '€',
          insight: 'Weekend revenue up 23%'
        },
        {
          name: 'Orders',
          value: 247,
          change: 12.3,
          trend: 'up',
          unit: 'orders',
          insight: 'Lunch orders increased significantly'
        },
        {
          name: 'Avg. Order Value',
          value: 24.80,
          change: -2.1,
          trend: 'down',
          unit: '€',
          insight: 'Consider upselling strategies'
        },
        {
          name: 'Customer Satisfaction',
          value: 4.7,
          change: 0.3,
          trend: 'up',
          unit: '/5',
          insight: 'Service quality improvements paying off'
        }
      ];

      setInsights(mockInsights);
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error fetching insights:', error);
      toast.error('Failed to load AI insights');
    } finally {
      setLoading(false);
    }
  };

  const generateNewInsights = async () => {
    try {
      setGenerating(true);
      
      const { data, error } = await supabase.functions.invoke('vendor-analytics', {
        body: {
          vendorId,
          type: 'ai_insights',
          period: 'week'
        }
      });

      if (error) throw error;

      if (data?.insights) {
        setInsights(data.insights);
        toast.success('AI insights updated successfully');
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error('Failed to generate new insights');
    } finally {
      setGenerating(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <Target className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      case 'trend':
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'recommendation':
        return <Lightbulb className="h-5 w-5 text-yellow-600" />;
      default:
        return <Brain className="h-5 w-5 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">AI Smart Insights</h2>
        </div>
        <Button
          onClick={generateNewInsights}
          disabled={generating}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
          <span>{generating ? 'Generating...' : 'Refresh Insights'}</span>
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">{metric.name}</span>
                <div className="flex items-center space-x-1">
                  {metric.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : metric.trend === 'down' ? (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  ) : (
                    <div className="w-4 h-4 bg-gray-400 rounded-full" />
                  )}
                  <span className={`text-sm font-medium ${
                    metric.change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">
                {metric.unit === '€' ? '€' : ''}{metric.value.toLocaleString()}
                {metric.unit !== '€' ? metric.unit : ''}
              </div>
              {metric.insight && (
                <p className="text-xs text-gray-500">{metric.insight}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Insights */}
      <div className="space-y-4">
        {insights.map((insight) => (
          <Card key={insight.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {getInsightIcon(insight.type)}
                  <div>
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getImpactColor(insight.impact)}>
                        {insight.impact} impact
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {insight.confidence}% confidence
                      </span>
                    </div>
                  </div>
                </div>
                <Progress value={insight.confidence} className="w-20 h-2" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{insight.description}</p>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Current</span>
                  <span className="text-sm font-medium">Target</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">
                    {insight.metrics.current}{insight.metrics.unit}
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {insight.metrics.target}{insight.metrics.unit}
                  </span>
                </div>
                <Progress 
                  value={(insight.metrics.current / insight.metrics.target) * 100} 
                  className="mt-2"
                />
              </div>

              <div>
                <h4 className="font-medium mb-2">Recommended Actions:</h4>
                <ul className="space-y-1">
                  {insight.actions.map((action, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SmartInsights;

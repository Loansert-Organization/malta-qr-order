
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { 
  Brain, 
  TrendingUp, 
  Clock, 
  Calendar,
  ThermometerSun,
  Users,
  ShoppingCart,
  AlertCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface PredictiveInsights {
  nextHourPrediction: {
    estimatedOrders: number;
    confidence: number;
    suggestedActions: string[];
  };
  dailyForecast: Array<{
    hour: string;
    predictedOrders: number;
    confidence: number;
    factors: string[];
  }>;
  weeklyTrends: Array<{
    day: string;
    predictedRevenue: number;
    expectedOrders: number;
    weatherFactor: number;
  }>;
  popularItemPredictions: Array<{
    item: string;
    category: string;
    predictedDemand: number;
    stockRecommendation: string;
    trend: 'increasing' | 'decreasing' | 'stable';
  }>;
  seasonalPredictions: Array<{
    period: string;
    predictedGrowth: number;
    keyFactors: string[];
    recommendations: string[];
  }>;
  aiModelAccuracy: {
    lastWeek: number;
    lastMonth: number;
    improvementTrend: number;
  };
}

const PredictiveOrderingDashboard = () => {
  const [insights, setInsights] = useState<PredictiveInsights>({
    nextHourPrediction: {
      estimatedOrders: 0,
      confidence: 0,
      suggestedActions: []
    },
    dailyForecast: [],
    weeklyTrends: [],
    popularItemPredictions: [],
    seasonalPredictions: [],
    aiModelAccuracy: {
      lastWeek: 0,
      lastMonth: 0,
      improvementTrend: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [selectedPredictionRange, setSelectedPredictionRange] = useState<'hour' | 'day' | 'week'>('day');

  useEffect(() => {
    loadPredictiveInsights();
  }, [selectedPredictionRange]);

  const loadPredictiveInsights = async () => {
    try {
      // Get historical orders data
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            menu_item:menu_items (name, category)
          )
        `)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .eq('payment_status', 'paid');

      if (orders) {
        // Generate predictive insights using mock ML model results
        const currentHour = new Date().getHours();
        
        // Next hour prediction
        const nextHourPrediction = {
          estimatedOrders: Math.floor(Math.random() * 15 + 5),
          confidence: Math.floor(Math.random() * 30 + 70),
          suggestedActions: [
            'Increase kitchen staff by 1 person',
            'Prepare extra ingredients for popular dishes',
            'Enable promotional pricing for slow-moving items'
          ]
        };

        // Daily forecast
        const dailyForecast = Array.from({ length: 12 }, (_, i) => {
          const hour = (currentHour + i) % 24;
          return {
            hour: `${hour}:00`,
            predictedOrders: Math.floor(Math.random() * 25 + 5),
            confidence: Math.floor(Math.random() * 25 + 65),
            factors: ['weather', 'historical_trend', 'events']
          };
        });

        // Weekly trends
        const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const weeklyTrends = weekDays.map(day => ({
          day,
          predictedRevenue: Math.floor(Math.random() * 1500 + 800),
          expectedOrders: Math.floor(Math.random() * 80 + 30),
          weatherFactor: Math.random() * 0.4 + 0.8
        }));

        // Popular item predictions
        const categories = ['Drinks', 'Starters', 'Main Course', 'Desserts', 'Cocktails'];
        const popularItemPredictions = categories.map(category => ({
          item: `Best ${category}`,
          category,
          predictedDemand: Math.floor(Math.random() * 50 + 20),
          stockRecommendation: Math.random() > 0.5 ? 'Increase stock by 20%' : 'Current stock sufficient',
          trend: Math.random() > 0.6 ? 'increasing' as const : Math.random() > 0.3 ? 'stable' as const : 'decreasing' as const
        }));

        // Seasonal predictions
        const seasonalPredictions = [
          {
            period: 'Next Month',
            predictedGrowth: Math.random() * 20 + 5,
            keyFactors: ['Tourist season', 'Local events', 'Weather patterns'],
            recommendations: ['Expand cocktail menu', 'Add outdoor seating', 'Increase staff for weekends']
          },
          {
            period: 'Next Quarter',
            predictedGrowth: Math.random() * 30 + 10,
            keyFactors: ['Holiday season', 'Economic trends', 'Competition analysis'],
            recommendations: ['Launch loyalty program', 'Optimize pricing strategy', 'Expand delivery options']
          }
        ];

        // AI model accuracy (mock data)
        const aiModelAccuracy = {
          lastWeek: Math.floor(Math.random() * 15 + 75),
          lastMonth: Math.floor(Math.random() * 20 + 70),
          improvementTrend: Math.random() * 10 + 2
        };

        setInsights({
          nextHourPrediction,
          dailyForecast,
          weeklyTrends,
          popularItemPredictions,
          seasonalPredictions,
          aiModelAccuracy
        });
      }
    } catch (error) {
      console.error('Error loading predictive insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'text-green-600';
      case 'decreasing': return 'text-red-600';
      case 'stable': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4" />;
      case 'decreasing': return <TrendingUp className="h-4 w-4 rotate-180" />;
      case 'stable': return <div className="h-4 w-4 bg-gray-400 rounded-full"></div>;
      default: return <div className="h-4 w-4 bg-gray-400 rounded-full"></div>;
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
          <h2 className="text-2xl font-bold text-gray-900">Predictive Ordering Analytics</h2>
          <p className="text-gray-600">AI-powered demand forecasting and order predictions</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={selectedPredictionRange === 'hour' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPredictionRange('hour')}
          >
            Next Hour
          </Button>
          <Button
            variant={selectedPredictionRange === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPredictionRange('day')}
          >
            Today
          </Button>
          <Button
            variant={selectedPredictionRange === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPredictionRange('week')}
          >
            This Week
          </Button>
        </div>
      </div>

      {/* AI Model Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Model Accuracy (Week)</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.aiModelAccuracy.lastWeek}%</div>
            <p className="text-xs text-muted-foreground">Prediction accuracy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Model Accuracy (Month)</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.aiModelAccuracy.lastMonth}%</div>
            <p className="text-xs text-muted-foreground">Long-term accuracy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Improvement Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{insights.aiModelAccuracy.improvementTrend.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Monthly improvement</p>
          </CardContent>
        </Card>
      </div>

      {/* Next Hour Prediction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Next Hour Prediction</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-3xl font-bold text-blue-600">
                {insights.nextHourPrediction.estimatedOrders} orders
              </div>
              <div className="text-sm text-gray-600 mb-4">
                {insights.nextHourPrediction.confidence}% confidence
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${insights.nextHourPrediction.confidence}%` }}
                ></div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Suggested Actions:</h4>
              <ul className="space-y-1">
                {insights.nextHourPrediction.suggestedActions.map((action, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Predictions */}
      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="daily">Daily Forecast</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Trends</TabsTrigger>
          <TabsTrigger value="items">Item Predictions</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal Outlook</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle>24-Hour Order Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={insights.dailyForecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="predictedOrders" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Revenue Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={insights.weeklyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="predictedRevenue" stroke="#8884d8" />
                  <Line type="monotone" dataKey="expectedOrders" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle>Popular Item Demand Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.popularItemPredictions.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="font-medium">{item.item}</div>
                        <Badge variant="outline">{item.category}</Badge>
                        <div className={`flex items-center space-x-1 ${getTrendColor(item.trend)}`}>
                          {getTrendIcon(item.trend)}
                          <span className="text-sm">{item.trend}</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{item.stockRecommendation}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{item.predictedDemand}</div>
                      <div className="text-sm text-gray-600">predicted orders</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seasonal">
          <Card>
            <CardHeader>
              <CardTitle>Seasonal Predictions & Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {insights.seasonalPredictions.map((prediction, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold">{prediction.period}</h4>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          +{prediction.predictedGrowth.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">predicted growth</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-2">Key Factors:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {prediction.keyFactors.map((factor, idx) => (
                            <li key={idx} className="flex items-center space-x-2">
                              <ThermometerSun className="h-4 w-4" />
                              <span>{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-medium mb-2">Recommendations:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {prediction.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-center space-x-2">
                              <AlertCircle className="h-4 w-4 text-blue-500" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
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

export default PredictiveOrderingDashboard;

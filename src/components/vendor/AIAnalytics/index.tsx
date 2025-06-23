
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Brain,
  Clock,
  Target,
  Zap,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIInsight {
  id: string;
  insight_type: string;
  title: string;
  description: string;
  confidence_score: number;
  recommended_actions: string[];
  created_at: string;
}

interface AIAnalyticsProps {
  vendorId: string;
}

const AIAnalytics: React.FC<AIAnalyticsProps> = ({ vendorId }) => {
  const { toast } = useToast();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchAIInsights();
  }, [vendorId]);

  const fetchAIInsights = async () => {
    try {
      // Fetch AI-generated insights
      const { data: analyticsData } = await supabase
        .from('analytics')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false })
        .limit(10);

      // Mock AI insights for demonstration
      const mockInsights: AIInsight[] = [
        {
          id: '1',
          insight_type: 'sales_optimization',
          title: 'Peak Hours Opportunity',
          description: 'Orders drop 40% between 3-5 PM. Consider introducing afternoon specials.',
          confidence_score: 85,
          recommended_actions: [
            'Create "Afternoon Delight" menu section',
            'Offer 15% discount on selected items 3-5 PM',
            'Promote coffee and light snacks during this period'
          ],
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          insight_type: 'menu_optimization',
          title: 'Bestseller Pattern',
          description: 'Cocktails outsell beer by 60% on weekends. Your craft cocktail selection drives revenue.',
          confidence_score: 92,
          recommended_actions: [
            'Expand premium cocktail menu',
            'Train staff on cocktail upselling',
            'Create weekend cocktail promotions'
          ],
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          insight_type: 'customer_behavior',
          title: 'AI Waiter Success',
          description: 'Customers using AI recommendations order 2.3x more items on average.',
          confidence_score: 88,
          recommended_actions: [
            'Promote AI Waiter feature more prominently',
            'Add more personalized recommendations',
            'Track AI conversation satisfaction scores'
          ],
          created_at: new Date().toISOString()
        }
      ];

      setInsights(mockInsights);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      toast({
        title: "Error",
        description: "Failed to load AI insights",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateNewInsights = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-insights-generator', {
        body: { vendorId }
      });

      if (error) throw error;

      toast({
        title: "Insights Generated",
        description: "New AI insights have been generated",
      });

      fetchAIInsights();
    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        title: "Error",
        description: "Failed to generate new insights",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'sales_optimization': return <TrendingUp className="h-5 w-5" />;
      case 'menu_optimization': return <Target className="h-5 w-5" />;
      case 'customer_behavior': return <Users className="h-5 w-5" />;
      case 'ai_performance': return <Brain className="h-5 w-5" />;
      default: return <BarChart3 className="h-5 w-5" />;
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  if (loading) {
    return <div className="text-center py-8">Loading AI analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-7 w-7" />
            AI Analytics & Insights
          </h1>
          <p className="text-gray-600 mt-1">AI-powered business intelligence for your venue</p>
        </div>
        <Button onClick={generateNewInsights} disabled={generating}>
          <Zap className="h-4 w-4 mr-2" />
          {generating ? 'Generating...' : 'Generate New Insights'}
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AI Recommendations</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confidence Score</p>
                <p className="text-2xl font-bold">87%</p>
              </div>
              <Brain className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AI Waiter Chats</p>
                <p className="text-2xl font-bold">256</p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Actions Taken</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <Zap className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="performance">AI Performance</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="insights">
          <div className="space-y-4">
            {insights.map((insight) => (
              <Card key={insight.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getInsightIcon(insight.insight_type)}
                      <div>
                        <h3 className="font-semibold text-lg">{insight.title}</h3>
                        <p className="text-gray-600 capitalize">{insight.insight_type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <Badge className={getConfidenceColor(insight.confidence_score)}>
                      {insight.confidence_score}% confidence
                    </Badge>
                  </div>

                  <p className="text-gray-700 mb-4">{insight.description}</p>

                  <div>
                    <h4 className="font-medium mb-2">Recommended Actions:</h4>
                    <ul className="space-y-1">
                      {insight.recommended_actions.map((action, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          <span className="text-sm">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <span className="text-sm text-gray-500">
                      Generated {new Date(insight.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        Remind Later
                      </Button>
                      <Button size="sm">
                        Mark as Implemented
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>AI System Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Average Response Time</p>
                    <p className="text-xl font-semibold">1.2s</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="text-xl font-semibold">98.5%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Customer Satisfaction</p>
                    <p className="text-xl font-semibold">4.7/5</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Recommendations Used</p>
                    <p className="text-xl font-semibold">73%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Active Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium">Menu Optimization</h4>
                  <p className="text-sm text-gray-600">
                    Add vegetarian options to increase customer base by 15%
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-medium">Pricing Strategy</h4>
                  <p className="text-sm text-gray-600">
                    Consider bundling drinks with appetizers for higher average order value
                  </p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-medium">Operational Efficiency</h4>
                  <p className="text-sm text-gray-600">
                    Enable table-specific QR codes to reduce wait times
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIAnalytics;

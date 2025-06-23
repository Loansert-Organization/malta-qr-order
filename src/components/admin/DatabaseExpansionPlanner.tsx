
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  Plus, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TableAnalysis {
  name: string;
  rowCount: number;
  size: string;
  growthRate: number;
  recommendations: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface ExpansionPlan {
  id: string;
  title: string;
  description: string;
  tables: string[];
  estimatedImpact: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'planned' | 'in_progress' | 'completed';
  timeline: string;
}

const DatabaseExpansionPlanner: React.FC = () => {
  const [tableAnalysis, setTableAnalysis] = useState<TableAnalysis[]>([]);
  const [expansionPlans, setExpansionPlans] = useState<ExpansionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('analysis');
  const { toast } = useToast();

  useEffect(() => {
    analyzeDatabase();
    generateExpansionPlans();
  }, []);

  const analyzeDatabase = async () => {
    setLoading(true);
    try {
      const criticalTables = [
        'vendors', 'orders', 'menu_items', 'payments', 
        'ai_waiter_logs', 'analytics_events', 'error_logs'
      ];

      const analysis: TableAnalysis[] = [];

      for (const table of criticalTables) {
        try {
          const { count } = await supabase
            .from(table as any)
            .select('*', { count: 'exact', head: true });

          const tableAnalysis: TableAnalysis = {
            name: table,
            rowCount: count || 0,
            size: `${Math.round((count || 0) * 0.5)}KB`, // Estimated
            growthRate: Math.random() * 50 + 10, // Simulated growth rate
            recommendations: generateRecommendations(table, count || 0),
            priority: getPriority(table, count || 0)
          };

          analysis.push(tableAnalysis);
        } catch (error) {
          console.log(`Could not analyze ${table}:`, error);
        }
      }

      setTableAnalysis(analysis);
    } catch (error) {
      toast({
        title: "Analysis Error",
        description: "Could not complete database analysis",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = (table: string, rowCount: number): string[] => {
    const recommendations = [];
    
    if (rowCount > 10000) {
      recommendations.push('Consider partitioning by date');
      recommendations.push('Add indexes for frequent queries');
    }
    
    if (table === 'ai_waiter_logs') {
      recommendations.push('Implement log rotation');
      recommendations.push('Archive old conversation data');
    }
    
    if (table === 'analytics_events') {
      recommendations.push('Set up data aggregation');
      recommendations.push('Create summary tables');
    }
    
    if (table === 'error_logs') {
      recommendations.push('Implement automatic cleanup');
      recommendations.push('Create error trend analysis');
    }

    return recommendations.length > 0 ? recommendations : ['No immediate recommendations'];
  };

  const getPriority = (table: string, rowCount: number): 'low' | 'medium' | 'high' | 'critical' => {
    if (rowCount > 50000) return 'critical';
    if (rowCount > 10000) return 'high';
    if (rowCount > 1000) return 'medium';
    return 'low';
  };

  const generateExpansionPlans = () => {
    const plans: ExpansionPlan[] = [
      {
        id: '1',
        title: 'AI Analytics Enhancement',
        description: 'Expand AI waiter analytics with conversation quality metrics',
        tables: ['ai_waiter_logs', 'conversation_quality', 'ai_performance_metrics'],
        estimatedImpact: 'Improved AI response quality by 25%',
        priority: 'high',
        status: 'planned',
        timeline: '2 weeks'
      },
      {
        id: '2',
        title: 'Customer Behavior Tracking',
        description: 'Add comprehensive customer journey tracking',
        tables: ['customer_sessions', 'page_views', 'interaction_events'],
        estimatedImpact: 'Better user experience insights',
        priority: 'medium',
        status: 'planned',
        timeline: '3 weeks'
      },
      {
        id: '3',
        title: 'Advanced Order Analytics',
        description: 'Implement predictive ordering and inventory management',
        tables: ['order_predictions', 'inventory_trends', 'demand_forecasts'],
        estimatedImpact: 'Reduce waste by 15%, improve availability',
        priority: 'high',
        status: 'planned',
        timeline: '4 weeks'
      },
      {
        id: '4',
        title: 'Real-time Performance Monitoring',
        description: 'Enhanced system monitoring and alerting',
        tables: ['performance_alerts', 'system_health_history', 'uptime_metrics'],
        estimatedImpact: '99.9% uptime target achievement',
        priority: 'critical',
        status: 'in_progress',
        timeline: '1 week'
      }
    ];

    setExpansionPlans(plans);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <Plus className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Expansion Planning
          </CardTitle>
          <CardDescription>
            Analyze current database usage and plan strategic expansions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Button onClick={analyzeDatabase} disabled={loading}>
              {loading ? 'Analyzing...' : 'Refresh Analysis'}
            </Button>
            <div className="text-sm text-gray-600">
              {tableAnalysis.length} tables analyzed
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="analysis">Current Analysis</TabsTrigger>
              <TabsTrigger value="plans">Expansion Plans</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="analysis" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tableAnalysis.map((table) => (
                  <Card key={table.name}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{table.name}</h4>
                        <Badge variant={getPriorityColor(table.priority)}>
                          {table.priority}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Rows:</span>
                          <span>{table.rowCount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Size:</span>
                          <span>{table.size}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Growth Rate:</span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {table.growthRate.toFixed(1)}%/month
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="plans" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {expansionPlans.map((plan) => (
                  <Card key={plan.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(plan.status)}
                            <h4 className="font-medium">{plan.title}</h4>
                            <Badge variant={getPriorityColor(plan.priority)}>
                              {plan.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium">Tables: </span>
                              {plan.tables.join(', ')}
                            </div>
                            <div>
                              <span className="font-medium">Impact: </span>
                              {plan.estimatedImpact}
                            </div>
                            <div>
                              <span className="font-medium">Timeline: </span>
                              {plan.timeline}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {tableAnalysis.map((table) => (
                  <Card key={table.name}>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <BarChart3 className="h-4 w-4" />
                        <h4 className="font-medium">{table.name}</h4>
                      </div>
                      <ul className="space-y-1">
                        {table.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="h-3 w-3 mt-0.5 text-yellow-600" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseExpansionPlanner;

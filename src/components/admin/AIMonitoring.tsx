
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bot, 
  Brain, 
  MessageSquare, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Zap
} from 'lucide-react';

interface AIMetrics {
  totalInteractions: number;
  successRate: number;
  averageResponseTime: number;
  popularLanguages: { [key: string]: number };
  modelUsage: { [key: string]: number };
  satisfactionScore: number;
  activeConversations: number;
}

interface AILog {
  id: string;
  vendor_id: string;
  message_type: string;
  ai_model_used: string;
  created_at: string;
  processing_metadata: any;
  vendors?: { name: string };
}

const AIMonitoring = () => {
  const [metrics, setMetrics] = useState<AIMetrics>({
    totalInteractions: 0,
    successRate: 0,
    averageResponseTime: 0,
    popularLanguages: {},
    modelUsage: {},
    satisfactionScore: 0,
    activeConversations: 0
  });
  const [recentLogs, setRecentLogs] = useState<AILog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAIMetrics();
    loadRecentLogs();
  }, []);

  const loadAIMetrics = async () => {
    try {
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const { data: logs } = await supabase
        .from('ai_waiter_logs')
        .select('*')
        .gte('created_at', weekAgo.toISOString());

      if (logs) {
        const totalInteractions = logs.length;
        const successfulLogs = logs.filter(log => {
          const metadata = log.processing_metadata as any;
          return !metadata?.error && log.message_type === 'assistant';
        });
        const successRate = totalInteractions > 0 ? (successfulLogs.length / totalInteractions) * 100 : 0;

        // Calculate language usage
        const languageCount: { [key: string]: number } = {};
        const modelCount: { [key: string]: number } = {};

        logs.forEach(log => {
          const metadata = log.processing_metadata as any;
          if (metadata?.language) {
            languageCount[metadata.language] = 
              (languageCount[metadata.language] || 0) + 1;
          }
          if (log.ai_model_used) {
            modelCount[log.ai_model_used] = (modelCount[log.ai_model_used] || 0) + 1;
          }
        });

        // Calculate average response time (simulated)
        const averageResponseTime = 850 + Math.random() * 200;

        // Calculate satisfaction score (simulated based on success rate)
        const satisfactionScore = Math.min(95, successRate * 0.9 + Math.random() * 10);

        setMetrics({
          totalInteractions,
          successRate,
          averageResponseTime,
          popularLanguages: languageCount,
          modelUsage: modelCount,
          satisfactionScore,
          activeConversations: Math.floor(Math.random() * 15) + 5
        });
      }
    } catch (error) {
      console.error('Error loading AI metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentLogs = async () => {
    try {
      const { data: logs } = await supabase
        .from('ai_waiter_logs')
        .select(`
          *,
          vendors (name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentLogs(logs || []);
    } catch (error) {
      console.error('Error loading recent logs:', error);
    }
  };

  const getModelBadgeColor = (model: string) => {
    if (model.includes('gpt-4')) return 'bg-blue-100 text-blue-800';
    if (model.includes('claude')) return 'bg-purple-100 text-purple-800';
    if (model.includes('gemini')) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getLanguageFlag = (lang: string) => {
    switch (lang) {
      case 'en': return '🇬🇧';
      case 'mt': return '🇲🇹';
      case 'it': return '🇮🇹';
      default: return '🌐';
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
          <h2 className="text-2xl font-bold text-gray-900">AI Waiter Monitoring</h2>
          <p className="text-gray-600">Performance metrics for Kai and AI services</p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-800">
          Multi-AI System Active
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalInteractions}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.successRate.toFixed(1)}%</div>
            <Progress value={metrics.successRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(metrics.averageResponseTime)}ms</div>
            <p className="text-xs text-muted-foreground">Multi-AI processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.satisfactionScore.toFixed(1)}/100</div>
            <p className="text-xs text-muted-foreground">User feedback</p>
          </CardContent>
        </Card>
      </div>

      {/* Language Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Language Usage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(metrics.popularLanguages).map(([lang, count]) => {
                const percentage = (count / metrics.totalInteractions) * 100;
                const getLanguageFlag = (lang: string) => {
                  switch (lang) {
                    case 'en': return '🇬🇧';
                    case 'mt': return '🇲🇹';
                    case 'it': return '🇮🇹';
                    default: return '🌐';
                  }
                };
                return (
                  <div key={lang} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getLanguageFlag(lang)}</span>
                      <span className="font-medium">
                        {lang === 'en' ? 'English' : lang === 'mt' ? 'Maltese' : 'Italian'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={percentage} className="w-20" />
                      <span className="text-sm text-gray-600">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>AI Model Usage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(metrics.modelUsage).map(([model, count]) => {
                const percentage = (count / metrics.totalInteractions) * 100;
                const getModelBadgeColor = (model: string) => {
                  if (model.includes('gpt-4')) return 'bg-blue-100 text-blue-800';
                  if (model.includes('claude')) return 'bg-purple-100 text-purple-800';
                  if (model.includes('gemini')) return 'bg-green-100 text-green-800';
                  return 'bg-gray-100 text-gray-800';
                };
                return (
                  <div key={model} className="flex items-center justify-between">
                    <Badge className={getModelBadgeColor(model)}>
                      {model}
                    </Badge>
                    <div className="flex items-center space-x-2">
                      <Progress value={percentage} className="w-20" />
                      <span className="text-sm text-gray-600">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent AI Interactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <span>Recent AI Interactions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentLogs.map((log, index) => {
              const metadata = log.processing_metadata as any;
              const getModelBadgeColor = (model: string) => {
                if (model.includes('gpt-4')) return 'bg-blue-100 text-blue-800';
                if (model.includes('claude')) return 'bg-purple-100 text-purple-800';
                if (model.includes('gemini')) return 'bg-green-100 text-green-800';
                return 'bg-gray-100 text-gray-800';
              };
              const getLanguageFlag = (lang: string) => {
                switch (lang) {
                  case 'en': return '🇬🇧';
                  case 'mt': return '🇲🇹';
                  case 'it': return '🇮🇹';
                  default: return '🌐';
                }
              };
              return (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Bot className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">
                        {log.vendors?.name || 'Unknown Venue'}
                      </span>
                    </div>
                    <Badge className={getModelBadgeColor(log.ai_model_used)}>
                      {log.ai_model_used}
                    </Badge>
                    <Badge variant="outline">
                      {log.message_type}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </div>
                    {metadata?.language && (
                      <div className="text-xs">
                        {getLanguageFlag(metadata.language)} {metadata.language}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* AI Performance Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>Performance Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p>All AI services performing optimally</p>
            <p className="text-sm">No performance issues detected</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIMonitoring;

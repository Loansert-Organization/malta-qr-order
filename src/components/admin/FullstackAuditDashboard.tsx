
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  Zap,
  Shield,
  Database,
  Smartphone,
  Brain,
  Server,
  Globe,
  Settings,
  TrendingUp,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { comprehensiveAuditService, FullstackAuditReport, AuditCategory, AuditIssue } from '@/services/comprehensiveAuditService';

const FullstackAuditDashboard: React.FC = () => {
  const [auditReport, setAuditReport] = useState<FullstackAuditReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('overview');

  useEffect(() => {
    runFullAudit();
  }, []);

  const runFullAudit = async () => {
    setLoading(true);
    try {
      const report = await comprehensiveAuditService.performFullstackAudit();
      setAuditReport(report);
    } catch (error) {
      console.error('Audit failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    const icons = {
      frontend: Globe,
      backend: Server,
      database: Database,
      security: Shield,
      performance: Zap,
      aiIntegration: Brain,
      userExperience: Smartphone,
      deployment: Settings
    };
    return icons[categoryName as keyof typeof icons] || FileCheck;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'needs_attention': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getOverallStatusMessage = (status: string, score: number) => {
    switch (status) {
      case 'production_ready':
        return `🎉 System is production ready with ${score}% score!`;
      case 'minor_issues':
        return `✅ System is mostly ready with minor issues (${score}% score)`;
      case 'major_issues':
        return `⚠️ System has major issues that need attention (${score}% score)`;
      case 'not_ready':
        return `🚨 System is not ready for production (${score}% score)`;
      default:
        return `Status unknown (${score}% score)`;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Settings className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-semibold mb-2">Running Comprehensive Fullstack Audit</h3>
            <p className="text-gray-600">Analyzing frontend, backend, database, security, performance, AI integration, UX, and deployment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!auditReport) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-xl font-semibold mb-2">No Audit Report Available</h3>
            <p className="text-gray-600 mb-6">Click the button below to run a comprehensive fullstack audit.</p>
            <Button onClick={runFullAudit} size="lg">
              <FileCheck className="h-4 w-4 mr-2" />
              Run Fullstack Audit
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ICUPA Malta - Fullstack Audit Report</h1>
          <p className="text-gray-600">Comprehensive production readiness assessment</p>
          <p className="text-sm text-gray-500">Generated: {new Date(auditReport.timestamp).toLocaleString()}</p>
        </div>
        <Button onClick={runFullAudit} disabled={loading}>
          <FileCheck className="h-4 w-4 mr-2" />
          Run New Audit
        </Button>
      </div>

      {/* Overall Status */}
      <Alert className={`border-2 ${
        auditReport.overallStatus === 'production_ready' ? 'border-green-500 bg-green-50' :
        auditReport.overallStatus === 'minor_issues' ? 'border-blue-500 bg-blue-50' :
        auditReport.overallStatus === 'major_issues' ? 'border-yellow-500 bg-yellow-50' :
        'border-red-500 bg-red-50'
      }`}>
        <div className="flex items-center">
          {auditReport.overallStatus === 'production_ready' ? <CheckCircle className="h-5 w-5" /> :
           auditReport.overallStatus === 'minor_issues' ? <AlertCircle className="h-5 w-5" /> :
           <AlertTriangle className="h-5 w-5" />}
        </div>
        <AlertTitle className="text-lg">
          Overall System Status: {auditReport.overallScore}/100
        </AlertTitle>
        <AlertDescription className="text-base">
          {getOverallStatusMessage(auditReport.overallStatus, auditReport.overallScore)}
        </AlertDescription>
      </Alert>

      {/* Category Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(auditReport.categories).map(([key, category]) => {
          const Icon = getCategoryIcon(key);
          return (
            <Card key={key} className="cursor-pointer hover:shadow-md transition-shadow" 
                  onClick={() => setSelectedCategory(key)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-6 w-6 text-blue-600" />
                  <Badge className={getStatusColor(category.status)}>
                    {category.status.replace('_', ' ')}
                  </Badge>
                </div>
                <h3 className="font-semibold mb-1">{category.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{category.score}%</span>
                  <span className="text-sm text-gray-600">{category.issues.length} issues</span>
                </div>
                <Progress value={category.score} className="mt-2" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {Object.keys(auditReport.categories).map(key => (
            <TabsTrigger key={key} value={key} className="text-xs">
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Implementation Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Implementation Plan
              </CardTitle>
              <CardDescription>
                Estimated completion time: {auditReport.estimatedCompletionTime}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditReport.implementationPlan.map((phase, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Phase {phase.phase}: {phase.title}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          phase.priority === 'immediate' ? 'destructive' :
                          phase.priority === 'high' ? 'secondary' : 'outline'
                        }>
                          {phase.priority}
                        </Badge>
                        <span className="text-sm text-gray-600">{phase.estimatedTime}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-3">{phase.description}</p>
                    <div className="space-y-1">
                      {phase.tasks.slice(0, 3).map((task, taskIndex) => (
                        <div key={taskIndex} className="text-sm text-gray-700">
                          • {task}
                        </div>
                      ))}
                      {phase.tasks.length > 3 && (
                        <div className="text-sm text-gray-500">
                          +{phase.tasks.length - 3} more tasks...
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Immediate Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {auditReport.nextSteps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-gray-700">{step}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual Category Tabs */}
        {Object.entries(auditReport.categories).map(([key, category]) => (
          <TabsContent key={key} value={key} className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    {React.createElement(getCategoryIcon(key), { className: "h-6 w-6 mr-2" })}
                    {category.name}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold">{category.score}%</span>
                    <Badge className={getStatusColor(category.status)}>
                      {category.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={category.score} className="mb-6" />
                
                {/* Issues */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Issues Found ({category.issues.length})</h4>
                  {category.issues.map((issue, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge className={`${getSeverityColor(issue.severity)} text-white text-xs`}>
                              {issue.severity}
                            </Badge>
                            <span className="text-sm text-gray-600">{issue.component}</span>
                          </div>
                          <h5 className="font-medium">{issue.title}</h5>
                          <p className="text-gray-600 text-sm mt-1">{issue.description}</p>
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                          {issue.estimatedEffort}
                        </span>
                      </div>
                      <div className="bg-blue-50 p-3 rounded mt-3">
                        <p className="text-sm text-blue-800">
                          <strong>Solution:</strong> {issue.solution}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recommendations */}
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Recommendations</h4>
                  <div className="space-y-2">
                    {category.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default FullstackAuditDashboard;

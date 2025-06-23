
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Globe,
  Database,
  Brain,
  Shield,
  Zap,
  Activity
} from 'lucide-react';

export interface AuditFinding {
  id: string;
  category: 'frontend' | 'backend' | 'database' | 'ai' | 'security' | 'performance';
  location: string;
  type: 'bug' | 'missing' | 'ux' | 'integration' | 'error' | 'incomplete';
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'ready' | 'needs_fixing' | 'broken';
  description: string;
  proposedFix: string;
  impact: string;
}

interface AuditCategoryCardProps {
  category: string;
  findings: AuditFinding[];
}

const AuditCategoryCard: React.FC<AuditCategoryCardProps> = ({ category, findings }) => {
  const getStatusIcon = (status: AuditFinding['status']) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'needs_fixing':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'broken':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getSeverityBadge = (severity: AuditFinding['severity']) => {
    const colors = {
      critical: 'bg-red-500',
      high: 'bg-orange-500', 
      medium: 'bg-yellow-500',
      low: 'bg-blue-500'
    };
    
    return (
      <Badge className={`${colors[severity]} text-white`}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'frontend':
        return <Globe className="h-6 w-6" />;
      case 'backend':
        return <Database className="h-6 w-6" />;
      case 'database':
        return <Database className="h-6 w-6" />;
      case 'ai':
        return <Brain className="h-6 w-6" />;
      case 'security':
        return <Shield className="h-6 w-6" />;
      case 'performance':
        return <Zap className="h-6 w-6" />;
      default:
        return <Activity className="h-6 w-6" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {getCategoryIcon(category)}
          <span className="capitalize">
            {category.replace(/([A-Z])/g, ' $1').trim()}
          </span>
          <Badge variant="outline">{findings.length}</Badge>
        </CardTitle>
        <CardDescription>
          {findings.filter(i => i.status === 'ready').length} ready, {' '}
          {findings.filter(i => i.status === 'broken').length} broken
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {findings.map((finding) => (
            <div key={finding.id} className="flex items-start space-x-3 p-3 border rounded">
              {getStatusIcon(finding.status)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">
                    {finding.location}
                  </p>
                  {getSeverityBadge(finding.severity)}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {finding.description}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Fix: {finding.proposedFix}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Impact: {finding.impact}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AuditCategoryCard;

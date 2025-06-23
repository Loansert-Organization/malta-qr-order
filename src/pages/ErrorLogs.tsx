
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Bug, Shield, Zap, Search, Filter } from 'lucide-react';

const ErrorLogs = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const mockErrors = [
    {
      id: 1,
      timestamp: new Date().toISOString(),
      severity: 'critical',
      type: 'database_error',
      message: 'Connection timeout to database',
      component: 'Order Processing',
      resolved: false
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      severity: 'high',
      type: 'authentication_error',
      message: 'Failed login attempt detected',
      component: 'User Authentication',
      resolved: true
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      severity: 'medium',
      type: 'api_error',
      message: 'Rate limit exceeded for vendor API',
      component: 'Vendor Integration',
      resolved: false
    }
  ];

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <Bug className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Shield className="h-4 w-4 text-yellow-500" />;
      default:
        return <Zap className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Error Logs</h1>
            <p className="text-gray-600">Monitor and resolve system errors</p>
          </div>
          <Button>
            <Filter className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-red-600">3</div>
              <p className="text-sm text-gray-600">Critical Errors</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-orange-600">8</div>
              <p className="text-sm text-gray-600">High Priority</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-yellow-600">15</div>
              <p className="text-sm text-gray-600">Medium Priority</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600">92%</div>
              <p className="text-sm text-gray-600">Resolution Rate</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Error Logs</CardTitle>
            <CardDescription>Real-time system error monitoring</CardDescription>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <Input
                  placeholder="Search errors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockErrors.map((error) => (
                <div key={error.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-shrink-0">
                    {getSeverityIcon(error.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getSeverityColor(error.severity)} text-white text-xs`}>
                          {error.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{error.type}</Badge>
                        <span className="text-sm text-gray-500">{error.component}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {error.resolved ? (
                          <Badge className="bg-green-500 text-white">Resolved</Badge>
                        ) : (
                          <Badge variant="destructive">Unresolved</Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(error.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-900 font-medium">{error.message}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ErrorLogs;

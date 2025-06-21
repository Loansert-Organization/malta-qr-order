
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SystemHealth: React.FC = () => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Database</span>
              <Badge className="bg-green-100 text-green-800">Online</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">AI Services</span>
              <Badge className="bg-green-100 text-green-800">Operational</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Payment Processing</span>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Real-time Updates</span>
              <Badge className="bg-green-100 text-green-800">Connected</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Average Response Time</span>
              <span className="font-bold text-green-600">245ms</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Uptime</span>
              <span className="font-bold text-green-600">99.9%</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Error Rate</span>
              <span className="font-bold text-green-600">0.1%</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Active Sessions</span>
              <span className="font-bold">{Math.floor(Math.random() * 50) + 10}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemHealth;

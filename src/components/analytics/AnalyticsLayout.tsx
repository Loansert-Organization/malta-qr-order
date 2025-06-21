
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import CustomerBehaviorDashboard from './CustomerBehaviorDashboard';
import RevenueOptimizationDashboard from './RevenueOptimizationDashboard';
import PredictiveOrderingDashboard from './PredictiveOrderingDashboard';
import { 
  BarChart3, 
  TrendingUp, 
  Brain, 
  Users,
  DollarSign,
  Zap
} from 'lucide-react';

const AnalyticsLayout = () => {
  const [activeTab, setActiveTab] = useState('behavior');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-600 to-blue-700 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Analytics & Business Intelligence</h1>
              <p className="text-purple-100">AI-powered insights for data-driven decisions</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-white/20 text-white">
                <Brain className="h-4 w-4 mr-1" />
                AI-Powered
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white">
                <Zap className="h-4 w-4 mr-1" />
                Real-time
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="behavior" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Customer Behavior</span>
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Revenue Optimization</span>
            </TabsTrigger>
            <TabsTrigger value="prediction" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>Predictive Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="behavior">
            <CustomerBehaviorDashboard />
          </TabsContent>

          <TabsContent value="revenue">
            <RevenueOptimizationDashboard />
          </TabsContent>

          <TabsContent value="prediction">
            <PredictiveOrderingDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnalyticsLayout;


import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Activity, DollarSign, AlertTriangle } from 'lucide-react';

interface AdminOverviewProps {
  vendors: any[];
  aiHealthScore: number;
  financialData: any;
}

const AdminOverview: React.FC<AdminOverviewProps> = ({ vendors, aiHealthScore, financialData }) => {
  const getSystemHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="grid md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Vendors</p>
              <p className="text-2xl font-bold text-gray-900">
                {vendors.filter(v => v.active).length}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {vendors.length} total vendors
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">AI Health Score</p>
              <p className={`text-2xl font-bold ${getSystemHealthColor(aiHealthScore)}`}>
                {aiHealthScore}%
              </p>
            </div>
            <Activity className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            System performance metrics
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                €{financialData?.total_revenue?.toFixed(2) || '0.00'}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {financialData?.orders_count || 0} orders processed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Alerts</p>
              <p className="text-2xl font-bold text-yellow-600">0</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            All systems operational
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;

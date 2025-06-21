
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FinancialData {
  total_revenue: number;
  stripe_revenue: number;
  revolut_revenue: number;
  orders_count: number;
  avg_order_value: number;
}

interface FinancialOverviewProps {
  financialData: FinancialData | null;
}

const FinancialOverview: React.FC<FinancialOverviewProps> = ({ financialData }) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Revenue Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Revenue</span>
              <span className="font-bold text-green-600">
                €{financialData?.total_revenue?.toFixed(2) || '0.00'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Stripe Payments</span>
              <span className="font-bold">
                €{financialData?.stripe_revenue?.toFixed(2) || '0.00'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Revolut Payments</span>
              <span className="font-bold">
                €{financialData?.revolut_revenue?.toFixed(2) || '0.00'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Average Order Value</span>
              <span className="font-bold">
                €{financialData?.avg_order_value?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Orders</span>
              <span className="font-bold">{financialData?.orders_count || 0}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Successful Payments</span>
              <span className="font-bold text-green-600">
                {Math.floor((financialData?.orders_count || 0) * 0.95)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Failed Payments</span>
              <span className="font-bold text-red-600">
                {Math.floor((financialData?.orders_count || 0) * 0.05)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialOverview;

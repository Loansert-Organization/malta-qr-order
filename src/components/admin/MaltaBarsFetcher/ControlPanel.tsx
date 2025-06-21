
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MapPin, Shield, BarChart3, CheckCircle, Star, Activity, TrendingUp } from 'lucide-react';
import { Bar, HealthMetrics } from './types';

interface ControlPanelProps {
  isLoading: boolean;
  bars: Bar[];
  healthMetrics: HealthMetrics | null;
  lastFetchResult: string;
  onFetchBars: (incremental?: boolean) => void;
  onRefreshAll: () => void;
  onHealthCheck: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isLoading,
  bars,
  healthMetrics,
  lastFetchResult,
  onFetchBars,
  onRefreshAll,
  onHealthCheck
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Malta Bars Data Management System
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <Button 
            onClick={() => onFetchBars(false)}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Fetching bars...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4" />
                Full Fetch from Google Maps
              </>
            )}
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => onFetchBars(true)}
            disabled={isLoading}
          >
            Incremental Update
          </Button>
          
          <Button 
            variant="outline"
            onClick={onRefreshAll}
            disabled={isLoading}
          >
            Refresh All Data
          </Button>

          <Button 
            variant="outline"
            onClick={onHealthCheck}
            disabled={isLoading}
          >
            <Shield className="h-4 w-4 mr-2" />
            Health Check
          </Button>
        </div>

        {lastFetchResult && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">{lastFetchResult}</p>
          </div>
        )}

        {/* Enhanced Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-800">Total Bars</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{bars.length}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">High Quality</span>
            </div>
            <p className="text-2xl font-bold text-green-900">
              {bars.filter(bar => (bar.data_quality_score || 0) >= 85).length}
            </p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <span className="font-semibold text-yellow-800">Avg Rating</span>
            </div>
            <p className="text-2xl font-bold text-yellow-900">
              {bars.length > 0 
                ? (bars.reduce((sum, bar) => sum + (bar.rating || 0), 0) / bars.filter(bar => bar.rating).length).toFixed(1)
                : '0'
              }
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-purple-800">Success Rate</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">
              {healthMetrics ? `${Math.round(healthMetrics.success_rate)}%` : '0%'}
            </p>
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              <span className="font-semibold text-indigo-800">Data Freshness</span>
            </div>
            <p className="text-sm font-bold text-indigo-900">
              {healthMetrics ? `${healthMetrics.data_freshness_hours}h ago` : 'Unknown'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

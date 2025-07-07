
import React, { useEffect } from 'react';
import { usePerformance } from '@/hooks/usePerformance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Zap } from 'lucide-react';

const PerformanceMonitor = () => {
  const { metrics, resourceTimings, isMonitoring } = usePerformance();

  const getPerformanceScore = (value: number, thresholds: [number, number]) => {
    if (value <= thresholds[0]) return { score: 'good', color: 'bg-green-500' };
    if (value <= thresholds[1]) return { score: 'needs-improvement', color: 'bg-yellow-500' };
    return { score: 'poor', color: 'bg-red-500' };
  };

  const formatTime = (time: number) => `${Math.round(time)}ms`;

  if (!isMonitoring || !metrics) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm">
      <Card className="bg-white/95 backdrop-blur-sm border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center space-x-2">
            <Zap className="h-4 w-4 text-blue-500" />
            <span>Performance Monitor</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Core Web Vitals */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">LCP</span>
              <Badge 
                variant="outline" 
                className={getPerformanceScore(metrics.largestContentfulPaint, [2500, 4000]).color}
              >
                {formatTime(metrics.largestContentfulPaint)}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">FID</span>
              <Badge 
                variant="outline"
                className={getPerformanceScore(metrics.firstInputDelay, [100, 300]).color}
              >
                {formatTime(metrics.firstInputDelay)}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">CLS</span>
              <Badge 
                variant="outline"
                className={getPerformanceScore(metrics.cumulativeLayoutShift * 1000, [100, 250]).color}
              >
                {(metrics.cumulativeLayoutShift * 1000).toFixed(0)}
              </Badge>
            </div>
          </div>

          {/* Page Load Time */}
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600">Page Load</span>
              <span className="text-xs font-medium">{formatTime(metrics.pageLoadTime)}</span>
            </div>
            <Progress 
              value={Math.min((metrics.pageLoadTime / 3000) * 100, 100)} 
              className="h-1"
            />
          </div>

          {/* Resource Count */}
          <div className="flex justify-between items-center text-xs text-gray-600">
            <span>Resources</span>
            <span>{resourceTimings.length}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMonitor;

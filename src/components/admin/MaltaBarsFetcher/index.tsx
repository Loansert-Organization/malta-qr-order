
import React, { useState, useEffect } from 'react';
import TabNavigation from './TabNavigation';
import { BarsTable } from './BarsTable';
import { ControlPanel } from './ControlPanel';
import { OperationLogs } from './OperationLogs';
import { HealthMonitoring } from './HealthMonitoring';
import { DataManagement } from './DataManagement';
import AutomationEngine from './AutomationEngine';
import MenuAnalytics from './MenuAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Bar, FetchLog, HealthMetrics } from './types';

const MaltaBarsFetcher = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [bars, setBars] = useState<Bar[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchResult, setLastFetchResult] = useState('');
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics | null>(null);
  const { toast } = useToast();

  const fetchBars = async () => {
    try {
      const { data, error } = await supabase
        .from('bars')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBars(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to fetch bars: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleFetchBars = async (incremental = false) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-malta-bars');
      
      if (error) throw error;
      
      setLastFetchResult(data.message || 'Fetch completed successfully');
      await fetchBars(); // Refresh the bars list
      
      toast({
        title: "Success",
        description: data.message || 'Bars fetched successfully'
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to fetch bars: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshAll = async () => {
    await fetchBars();
  };

  const handleHealthCheck = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('health-check-bars');
      
      if (error) throw error;
      
      // Mock health metrics based on the response
      setHealthMetrics({
        api_quota_used: 0,
        api_quota_limit: 1000,
        success_rate: data.summary?.health_percentage || 0,
        avg_response_time: 250,
        last_successful_fetch: new Date().toISOString(),
        data_freshness_hours: 1
      });
      
      toast({
        title: "Health Check Complete",
        description: `${data.summary?.healthy_websites || 0} of ${data.summary?.total_bars || 0} bars are healthy`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Health check failed: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <BarsTable bars={bars} />;
      case 'control':
        return (
          <ControlPanel
            isLoading={isLoading}
            bars={bars}
            healthMetrics={healthMetrics}
            lastFetchResult={lastFetchResult}
            onFetchBars={handleFetchBars}
            onRefreshAll={handleRefreshAll}
            onHealthCheck={handleHealthCheck}
          />
        );
      case 'automation':
        return <AutomationEngine />;
      case 'analytics':
        return <MenuAnalytics />;
      case 'logs':
        return <OperationLogs />;
      case 'health':
        return <HealthMonitoring />;
      case 'data':
        return <DataManagement />;
      default:
        return <BarsTable bars={bars} />;
    }
  };

  useEffect(() => {
    fetchBars();
  }, []);

  return (
    <div className="space-y-6">
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      {renderTabContent()}
    </div>
  );
};

export default MaltaBarsFetcher;

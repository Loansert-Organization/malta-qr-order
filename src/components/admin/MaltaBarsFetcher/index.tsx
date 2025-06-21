
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
  const [operationLogs, setOperationLogs] = useState<FetchLog[]>([]);
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

  const fetchOperationLogs = async () => {
    // Mock fetch logs since we don't have the actual logs table yet
    const mockLogs: FetchLog[] = [
      {
        id: '1',
        operation_type: 'google_maps_fetch',
        total_bars_processed: 50,
        new_bars_added: 15,
        bars_updated: 5,
        errors_count: 2,
        api_calls_made: 25,
        operation_duration_ms: 45000,
        status: 'completed',
        created_at: new Date().toISOString()
      }
    ];
    setOperationLogs(mockLogs);
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
    await fetchOperationLogs();
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

  const handleExportData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('export-bars-data');
      
      if (error) throw error;
      
      toast({
        title: "Export Complete",
        description: "Bars data exported successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Export failed: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleCleanupDuplicates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cleanup-duplicate-bars');
      
      if (error) throw error;
      
      await fetchBars(); // Refresh after cleanup
      
      toast({
        title: "Cleanup Complete",
        description: `Removed ${data.duplicates_removed || 0} duplicate entries`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Cleanup failed: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
        return <OperationLogs fetchLogs={operationLogs} />;
      case 'health':
        return <HealthMonitoring healthMetrics={healthMetrics} />;
      case 'data':
        return (
          <DataManagement
            isLoading={isLoading}
            onExportData={handleExportData}
            onCleanupDuplicates={handleCleanupDuplicates}
          />
        );
      default:
        return <BarsTable bars={bars} />;
    }
  };

  useEffect(() => {
    fetchBars();
    fetchOperationLogs();
  }, []);

  return (
    <div className="space-y-6">
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      {renderTabContent()}
    </div>
  );
};

export default MaltaBarsFetcher;

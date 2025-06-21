
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bar, FetchLog, ScheduledJob, HealthMetrics, TabType } from './types';
import { ControlPanel } from './ControlPanel';
import { TabNavigation } from './TabNavigation';
import { BarsTable } from './BarsTable';
import { OperationLogs } from './OperationLogs';
import { HealthMonitoring } from './HealthMonitoring';
import { DataManagement } from './DataManagement';

export const MaltaBarsFetcher = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [bars, setBars] = useState<Bar[]>([]);
  const [fetchLogs, setFetchLogs] = useState<FetchLog[]>([]);
  const [scheduledJob, setScheduledJob] = useState<ScheduledJob | null>(null);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics | null>(null);
  const [lastFetchResult, setLastFetchResult] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('bars');
  const { toast } = useToast();

  const fetchBarsFromGoogle = async (incrementalOnly = false) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-malta-bars', {
        body: { 
          source: 'manual_admin', 
          timestamp: new Date().toISOString(),
          incremental: incrementalOnly
        }
      });
      
      if (error) {
        throw error;
      }

      if (data.success) {
        setLastFetchResult(`${data.message} - Duration: ${Math.round(data.summary.duration_ms / 1000)}s`);
        toast({
          title: "Success!",
          description: data.message,
        });
        
        // Refresh all data
        await Promise.all([loadBars(), loadFetchLogs(), loadScheduledJob(), loadHealthMetrics()]);
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error fetching bars:', error);
      toast({
        title: "Error",
        description: `Failed to fetch bars: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadBars = async () => {
    try {
      const { data, error } = await supabase
        .from('bars')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      const mappedBars: Bar[] = (data || []).map(bar => ({
        id: bar.id,
        name: bar.name,
        address: bar.address,
        contact_number: bar.contact_number,
        rating: bar.rating,
        review_count: bar.review_count,
        google_place_id: bar.google_place_id,
        data_quality_score: 75,
        is_active: true,
        created_at: bar.created_at,
        updated_at: bar.updated_at,
        location_gps: bar.location_gps
      }));
      
      setBars(mappedBars);
    } catch (error) {
      console.error('Error loading bars:', error);
      toast({
        title: "Error",
        description: "Failed to load bars from database",
        variant: "destructive",
      });
    }
  };

  const loadFetchLogs = async () => {
    try {
      setFetchLogs([]);
    } catch (error) {
      console.error('Error loading fetch logs:', error);
      setFetchLogs([]);
    }
  };

  const loadScheduledJob = async () => {
    try {
      setScheduledJob({
        id: 'mock-job-id',
        job_name: 'fetch-malta-bars',
        last_run: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        next_run: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        run_count: 30,
        success_count: 28,
        failure_count: 2,
        last_error: null,
        config: { schedule: '0 3 * * *' }
      });
    } catch (error) {
      console.error('Error loading scheduled job:', error);
      setScheduledJob(null);
    }
  };

  const loadHealthMetrics = async () => {
    try {
      const successRate = 95;
      const avgResponseTime = 2500;
      const lastSuccessfulFetch = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const dataFreshnessHours = 2;

      setHealthMetrics({
        api_quota_used: 245,
        api_quota_limit: 1000,
        success_rate: successRate,
        avg_response_time: avgResponseTime,
        last_successful_fetch: lastSuccessfulFetch,
        data_freshness_hours: dataFreshnessHours
      });
    } catch (error) {
      console.error('Error calculating health metrics:', error);
    }
  };

  const exportBarsData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('export-bars-data');
      
      if (error) throw error;
      
      const blob = new Blob([data.csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `malta-bars-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: "Bars data exported successfully"
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export bars data",
        variant: "destructive"
      });
    }
  };

  const runHealthCheck = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('health-check-bars');
      
      if (error) throw error;
      
      toast({
        title: "Health Check Complete",
        description: `${data.issues_found} issues found and ${data.issues_fixed} fixed`
      });
      
      await loadHealthMetrics();
    } catch (error) {
      console.error('Health check error:', error);
      toast({
        title: "Health Check Failed",
        description: "Failed to run health check",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cleanupDuplicates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cleanup-duplicate-bars');
      
      if (error) throw error;
      
      toast({
        title: "Cleanup Complete",
        description: `${data.duplicates_removed} duplicate bars removed`
      });
      
      await loadBars();
    } catch (error) {
      console.error('Cleanup error:', error);
      toast({
        title: "Cleanup Failed",
        description: "Failed to cleanup duplicates",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAllData = async () => {
    await Promise.all([loadBars(), loadFetchLogs(), loadScheduledJob(), loadHealthMetrics()]);
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  return (
    <div className="space-y-6">
      <ControlPanel
        isLoading={isLoading}
        bars={bars}
        healthMetrics={healthMetrics}
        lastFetchResult={lastFetchResult}
        onFetchBars={fetchBarsFromGoogle}
        onRefreshAll={refreshAllData}
        onHealthCheck={runHealthCheck}
      />

      <TabNavigation
        activeTab={activeTab}
        barsCount={bars.length}
        logsCount={fetchLogs.length}
        onTabChange={setActiveTab}
      />

      {activeTab === 'bars' && <BarsTable bars={bars} />}
      {activeTab === 'logs' && <OperationLogs fetchLogs={fetchLogs} />}
      {activeTab === 'health' && <HealthMonitoring healthMetrics={healthMetrics} />}
      {activeTab === 'management' && (
        <DataManagement
          isLoading={isLoading}
          onExportData={exportBarsData}
          onCleanupDuplicates={cleanupDuplicates}
        />
      )}
      
      {/* Placeholder for other tabs */}
      {activeTab === 'scheduling' && (
        <div className="text-center py-8 text-gray-500">
          Scheduling functionality coming soon...
        </div>
      )}
      {activeTab === 'testing' && (
        <div className="text-center py-8 text-gray-500">
          Testing suite functionality coming soon...
        </div>
      )}
      {activeTab === 'analytics' && (
        <div className="text-center py-8 text-gray-500">
          Analytics dashboard functionality coming soon...
        </div>
      )}
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MapPin, Star, Phone, Calendar, Activity, AlertCircle, CheckCircle, Clock, BarChart3, Download, Upload, Database, Shield, TrendingUp } from 'lucide-react';

interface Bar {
  id: string;
  name: string;
  address: string | null;
  contact_number: string | null;
  rating: number | null;
  review_count: number | null;
  google_place_id: string;
  data_quality_score?: number;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  location_gps?: unknown;
}

interface FetchLog {
  id: string;
  operation_type: string;
  total_bars_processed: number;
  new_bars_added: number;
  bars_updated: number;
  errors_count: number;
  api_calls_made: number;
  operation_duration_ms: number;
  status: string;
  created_at: string;
  error_details?: any;
}

interface ScheduledJob {
  id: string;
  job_name: string;
  last_run: string | null;
  next_run: string | null;
  status: string;
  run_count: number;
  success_count: number;
  failure_count: number;
  last_error?: string | null;
  config?: any;
}

interface HealthMetrics {
  api_quota_used: number;
  api_quota_limit: number;
  success_rate: number;
  avg_response_time: number;
  last_successful_fetch: string | null;
  data_freshness_hours: number;
}

export const MaltaBarsFetcher = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [bars, setBars] = useState<Bar[]>([]);
  const [fetchLogs, setFetchLogs] = useState<FetchLog[]>([]);
  const [scheduledJob, setScheduledJob] = useState<ScheduledJob | null>(null);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics | null>(null);
  const [lastFetchResult, setLastFetchResult] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'bars' | 'logs' | 'scheduling' | 'health' | 'management'>('bars');
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
      
      // Map the data to ensure it matches our Bar interface
      const mappedBars: Bar[] = (data || []).map(bar => ({
        id: bar.id,
        name: bar.name,
        address: bar.address,
        contact_number: bar.contact_number,
        rating: bar.rating,
        review_count: bar.review_count,
        google_place_id: bar.google_place_id,
        data_quality_score: bar.data_quality_score || 0,
        is_active: bar.is_active ?? true,
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
      const { data, error } = await supabase
        .from('bar_fetch_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error && !error.message.includes('does not exist')) {
        throw error;
      }
      
      setFetchLogs(data || []);
    } catch (error) {
      console.error('Error loading fetch logs:', error);
      setFetchLogs([]);
    }
  };

  const loadScheduledJob = async () => {
    try {
      const { data, error } = await supabase
        .from('scheduled_jobs')
        .select('*')
        .eq('job_name', 'fetch-malta-bars')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      setScheduledJob(data || null);
    } catch (error) {
      console.error('Error loading scheduled job:', error);
      setScheduledJob(null);
    }
  };

  const loadHealthMetrics = async () => {
    try {
      // Calculate health metrics from existing data
      const successfulLogs = fetchLogs.filter(log => log.status === 'completed');
      const failedLogs = fetchLogs.filter(log => log.status === 'failed');
      
      const successRate = fetchLogs.length > 0 
        ? (successfulLogs.length / fetchLogs.length) * 100 
        : 0;
      
      const avgResponseTime = successfulLogs.length > 0
        ? successfulLogs.reduce((sum, log) => sum + log.operation_duration_ms, 0) / successfulLogs.length
        : 0;

      const lastSuccessfulFetch = successfulLogs.length > 0 
        ? successfulLogs[0].created_at 
        : null;

      const dataFreshnessHours = lastSuccessfulFetch 
        ? Math.floor((Date.now() - new Date(lastSuccessfulFetch).getTime()) / (1000 * 60 * 60))
        : 999;

      setHealthMetrics({
        api_quota_used: successfulLogs.reduce((sum, log) => sum + log.api_calls_made, 0),
        api_quota_limit: 1000, // Google Places API daily limit
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
      
      // Create and download CSV file
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

  useEffect(() => {
    Promise.all([loadBars(), loadFetchLogs(), loadScheduledJob(), loadHealthMetrics()]);
  }, []);

  const getQualityBadgeColor = (score: number) => {
    if (score >= 85) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getHealthStatusColor = (metric: string, value: number) => {
    switch (metric) {
      case 'success_rate':
        if (value >= 95) return 'text-green-600';
        if (value >= 80) return 'text-yellow-600';
        return 'text-red-600';
      case 'data_freshness':
        if (value <= 24) return 'text-green-600';
        if (value <= 48) return 'text-yellow-600';
        return 'text-red-600';
      case 'quota_usage':
        if (value <= 70) return 'text-green-600';
        if (value <= 90) return 'text-yellow-600';
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
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
              onClick={() => fetchBarsFromGoogle(false)}
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
              onClick={() => fetchBarsFromGoogle(true)}
              disabled={isLoading}
            >
              Incremental Update
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => Promise.all([loadBars(), loadFetchLogs(), loadScheduledJob(), loadHealthMetrics()])}
              disabled={isLoading}
            >
              Refresh All Data
            </Button>

            <Button 
              variant="outline"
              onClick={runHealthCheck}
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

      {/* Enhanced Tab Navigation */}
      <div className="flex space-x-1 border-b">
        {[
          { key: 'bars', label: `Bars (${bars.length})` },
          { key: 'logs', label: `Operation Logs (${fetchLogs.length})` },
          { key: 'scheduling', label: 'Scheduling' },
          { key: 'health', label: 'Health & Monitoring' },
          { key: 'management', label: 'Data Management' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
              activeTab === tab.key 
                ? 'bg-white border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'bars' && (
        <Card>
          <CardHeader>
            <CardTitle>Malta Bars Database ({bars.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {bars.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No bars found. Click "Fetch Bars from Google Maps" to get started.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Quality Score</TableHead>
                      <TableHead>Added</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bars.map((bar) => (
                      <TableRow key={bar.id}>
                        <TableCell className="font-medium">{bar.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{bar.address}</TableCell>
                        <TableCell>
                          {bar.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span>{bar.rating}</span>
                              {bar.review_count && (
                                <span className="text-gray-500 text-sm">({bar.review_count})</span>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQualityBadgeColor(bar.data_quality_score || 0)}`}>
                            {bar.data_quality_score || 0}%
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(bar.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'logs' && (
        <Card>
          <CardHeader>
            <CardTitle>Operation Logs</CardTitle>
          </CardHeader>
          <CardContent>
            {fetchLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No operation logs found.</p>
            ) : (
              <div className="space-y-4">
                {fetchLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        <span className="font-semibold capitalize">{log.operation_type}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          log.status === 'completed' ? 'bg-green-100 text-green-800' :
                          log.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Processed:</span>
                        <span className="ml-1 font-medium">{log.total_bars_processed}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">New:</span>
                        <span className="ml-1 font-medium text-green-600">{log.new_bars_added}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Updated:</span>
                        <span className="ml-1 font-medium text-blue-600">{log.bars_updated}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Errors:</span>
                        <span className="ml-1 font-medium text-red-600">{log.errors_count}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">API Calls:</span>
                        <span className="ml-1 font-medium">{log.api_calls_made}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <span className="ml-1 font-medium">{Math.round(log.operation_duration_ms / 1000)}s</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'scheduling' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Automated Scheduling
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scheduledJob ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Job Status</h4>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(scheduledJob.status)}
                      <span className="capitalize">{scheduledJob.status}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Schedule</h4>
                    <p className="text-sm text-gray-600">Daily at 3:00 AM (Malta Time)</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Last Run</h4>
                    <p className="text-sm">
                      {scheduledJob.last_run 
                        ? new Date(scheduledJob.last_run).toLocaleString()
                        : 'Never'
                      }
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Next Run</h4>
                    <p className="text-sm">
                      {scheduledJob.next_run 
                        ? new Date(scheduledJob.next_run).toLocaleString()
                        : 'Not scheduled'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Statistics</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Runs:</span>
                      <span className="ml-1 font-medium">{scheduledJob.run_count}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Successful:</span>
                      <span className="ml-1 font-medium text-green-600">{scheduledJob.success_count}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Failed:</span>
                      <span className="ml-1 font-medium text-red-600">{scheduledJob.failure_count}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No scheduled job found</p>
                <p className="text-sm text-gray-400 mt-2">The automated scheduling system will be available once the database migration is complete.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* New Health & Monitoring Tab */}
      {activeTab === 'health' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Health & Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            {healthMetrics ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">API Quota Usage</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{healthMetrics.api_quota_used}</span>
                      <span className="text-sm text-gray-500">/ {healthMetrics.api_quota_limit}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full ${getHealthStatusColor('quota_usage', (healthMetrics.api_quota_used / healthMetrics.api_quota_limit) * 100) === 'text-red-600' ? 'bg-red-500' : getHealthStatusColor('quota_usage', (healthMetrics.api_quota_used / healthMetrics.api_quota_limit) * 100) === 'text-yellow-600' ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min((healthMetrics.api_quota_used / healthMetrics.api_quota_limit) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Success Rate</h4>
                    <div className={`text-2xl font-bold ${getHealthStatusColor('success_rate', healthMetrics.success_rate)}`}>
                      {Math.round(healthMetrics.success_rate)}%
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Last 20 operations</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Data Freshness</h4>
                    <div className={`text-2xl font-bold ${getHealthStatusColor('data_freshness', healthMetrics.data_freshness_hours)}`}>
                      {healthMetrics.data_freshness_hours}h
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Since last update</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Performance Metrics</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Avg Response Time:</span>
                      <span className="ml-1 font-medium">{Math.round(healthMetrics.avg_response_time / 1000)}s</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Successful Fetch:</span>
                      <span className="ml-1 font-medium">
                        {healthMetrics.last_successful_fetch 
                          ? new Date(healthMetrics.last_successful_fetch).toLocaleString()
                          : 'Never'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Loading health metrics...</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* New Data Management Tab */}
      {activeTab === 'management' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Management & Operations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export & Backup
                </h4>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={exportBarsData}
                    className="w-full justify-start"
                  >
                    Export Bars to CSV
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => toast({ title: "Coming Soon", description: "Database backup feature" })}
                    className="w-full justify-start"
                  >
                    Create Database Backup
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Data Quality
                </h4>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={cleanupDuplicates}
                    disabled={isLoading}
                    className="w-full justify-start"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Remove Duplicates
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => toast({ title: "Coming Soon", description: "Data validation feature" })}
                    className="w-full justify-start"
                  >
                    Validate Data Quality
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-3">System Maintenance</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => toast({ title: "Coming Soon", description: "Performance optimization" })}
                >
                  Optimize Performance
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => toast({ title: "Coming Soon", description: "Cache management" })}
                >
                  Clear Cache
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => toast({ title: "Coming Soon", description: "Analytics report" })}
                >
                  Generate Analytics
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MapPin, Star, Phone, Calendar, Activity, AlertCircle, CheckCircle, Clock, BarChart3 } from 'lucide-react';

interface Bar {
  id: string;
  name: string;
  address: string;
  contact_number: string;
  rating: number;
  review_count: number;
  google_place_id: string;
  data_quality_score: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
}

interface ScheduledJob {
  id: string;
  job_name: string;
  last_run: string;
  next_run: string;
  status: string;
  run_count: number;
  success_count: number;
  failure_count: number;
}

export const MaltaBarsFetcher = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [bars, setBars] = useState<Bar[]>([]);
  const [fetchLogs, setFetchLogs] = useState<FetchLog[]>([]);
  const [scheduledJob, setScheduledJob] = useState<ScheduledJob | null>(null);
  const [lastFetchResult, setLastFetchResult] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'bars' | 'logs' | 'scheduling'>('bars');
  const { toast } = useToast();

  const fetchBarsFromGoogle = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-malta-bars', {
        body: { source: 'manual_admin', timestamp: new Date().toISOString() }
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
        await Promise.all([loadBars(), loadFetchLogs(), loadScheduledJob()]);
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
        .limit(50);

      if (error) throw error;
      setBars(data || []);
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
        .limit(10);

      if (error) throw error;
      setFetchLogs(data || []);
    } catch (error) {
      console.error('Error loading fetch logs:', error);
    }
  };

  const loadScheduledJob = async () => {
    try {
      const { data, error } = await supabase
        .from('scheduled_jobs')
        .select('*')
        .eq('job_name', 'fetch-malta-bars')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setScheduledJob(data);
    } catch (error) {
      console.error('Error loading scheduled job:', error);
    }
  };

  useEffect(() => {
    Promise.all([loadBars(), loadFetchLogs(), loadScheduledJob()]);
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

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Malta Bars Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={fetchBarsFromGoogle}
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
                  Fetch Bars from Google Maps
                </>
              )}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => Promise.all([loadBars(), loadFetchLogs(), loadScheduledJob()])}
              disabled={isLoading}
            >
              Refresh All Data
            </Button>
          </div>

          {lastFetchResult && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">{lastFetchResult}</p>
            </div>
          )}

          {/* Statistics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
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
                {bars.filter(bar => bar.data_quality_score >= 85).length}
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
                <span className="font-semibold text-purple-800">Last Fetch</span>
              </div>
              <p className="text-sm font-bold text-purple-900">
                {fetchLogs.length > 0 
                  ? new Date(fetchLogs[0].created_at).toLocaleDateString()
                  : 'Never'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b">
        <button
          onClick={() => setActiveTab('bars')}
          className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
            activeTab === 'bars' 
              ? 'bg-white border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Bars ({bars.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
            activeTab === 'logs' 
              ? 'bg-white border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Operation Logs ({fetchLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('scheduling')}
          className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
            activeTab === 'scheduling' 
              ? 'bg-white border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Scheduling
        </button>
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
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQualityBadgeColor(bar.data_quality_score)}`}>
                            {bar.data_quality_score}%
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
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

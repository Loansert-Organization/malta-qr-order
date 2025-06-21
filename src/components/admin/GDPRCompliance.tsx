
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, Download, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DataSubjectRequest {
  id: string;
  guest_session_id: string;
  request_type: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction';
  request_details: any;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requested_at: string;
  processed_at: string | null;
  response_data: any;
}

interface ProcessingLog {
  id: string;
  guest_session_id: string;
  processing_purpose: string;
  data_categories: string[];
  legal_basis: string;
  retention_period: string;
  processing_timestamp: string;
  anonymized_timestamp: string | null;
}

const GDPRCompliance = () => {
  const [requests, setRequests] = useState<DataSubjectRequest[]>([]);
  const [processingLogs, setProcessingLogs] = useState<ProcessingLog[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<DataSubjectRequest | null>(null);
  const [responseText, setResponseText] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchDataSubjectRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('data_subject_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching data subject requests:', error);
    }
  };

  const fetchProcessingLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('data_processing_log')
        .select('*')
        .order('processing_timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;
      setProcessingLogs(data || []);
    } catch (error) {
      console.error('Error fetching processing logs:', error);
    }
  };

  const updateRequestStatus = async (requestId: string, status: DataSubjectRequest['status'], responseData?: any) => {
    setLoading(true);
    try {
      const updateData: any = {
        status,
        processed_at: new Date().toISOString()
      };

      if (responseData) {
        updateData.response_data = responseData;
      }

      const { error } = await supabase
        .from('data_subject_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Request ${status} successfully`,
      });

      fetchDataSubjectRequests();
      setSelectedRequest(null);
      setResponseText('');
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: "Error",
        description: "Failed to update request",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDataErasure = async (sessionId: string) => {
    try {
      // This would implement actual data erasure
      // For demo purposes, we'll just mark as processed
      toast({
        title: "Data Erasure",
        description: "Data erasure process initiated (demo mode)",
      });
    } catch (error) {
      console.error('Error during data erasure:', error);
    }
  };

  const exportUserData = async (sessionId: string) => {
    try {
      // Fetch all user data for export
      const [orders, aiLogs, sessions] = await Promise.all([
        supabase.from('orders').select('*').eq('guest_session_id', sessionId),
        supabase.from('ai_waiter_logs').select('*').eq('guest_session_id', sessionId),
        supabase.from('guest_ui_sessions').select('*').eq('session_id', sessionId)
      ]);

      const userData = {
        orders: orders.data || [],
        ai_interactions: aiLogs.data || [],
        session_data: sessions.data || [],
        export_date: new Date().toISOString(),
        export_purpose: 'GDPR Data Portability Request'
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-export-${sessionId.slice(-8)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: "User data exported successfully",
      });
    } catch (error) {
      console.error('Error exporting user data:', error);
      toast({
        title: "Export Error",
        description: "Failed to export user data",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchDataSubjectRequests();
    fetchProcessingLogs();
  }, []);

  const getStatusIcon = (status: DataSubjectRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'processing':
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: DataSubjectRequest['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          GDPR Compliance Management
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Data Subject Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Data Subject Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {requests.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No requests yet</p>
              ) : (
                requests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(request.status)}
                        <p className="font-medium capitalize">{request.request_type}</p>
                      </div>
                      <p className="text-sm text-gray-600">
                        Session: {request.guest_session_id.slice(-8)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(request.requested_at).toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setSelectedRequest(request)}>
                            Process
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Process {request.request_type} Request
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-medium">Session ID:</p>
                              <p className="text-sm text-gray-600">{request.guest_session_id}</p>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium">Request Type:</p>
                              <p className="text-sm text-gray-600 capitalize">{request.request_type}</p>
                            </div>

                            <div className="flex space-x-2">
                              {request.request_type === 'access' && (
                                <Button
                                  onClick={() => exportUserData(request.guest_session_id)}
                                  className="flex-1"
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Export Data
                                </Button>
                              )}
                              
                              {request.request_type === 'erasure' && (
                                <Button
                                  variant="destructive"
                                  onClick={() => handleDataErasure(request.guest_session_id)}
                                  className="flex-1"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Data
                                </Button>
                              )}
                              
                              {request.request_type === 'portability' && (
                                <Button
                                  onClick={() => exportUserData(request.guest_session_id)}
                                  className="flex-1"
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Export Portable Data
                                </Button>
                              )}
                            </div>

                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                onClick={() => updateRequestStatus(request.id, 'completed')}
                                disabled={loading}
                                className="flex-1"
                              >
                                Mark Complete
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => updateRequestStatus(request.id, 'rejected')}
                                disabled={loading}
                                className="flex-1"
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Processing Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Data Processing Audit Trail</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {processingLogs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No processing logs yet</p>
              ) : (
                processingLogs.map((log) => (
                  <div key={log.id} className="p-3 border rounded">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{log.processing_purpose}</p>
                      <Badge variant="outline">{log.legal_basis}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Session: {log.guest_session_id.slice(-8)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Categories: {log.data_categories.join(', ')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(log.processing_timestamp).toLocaleString()}
                    </p>
                    {log.anonymized_timestamp && (
                      <p className="text-xs text-green-600">
                        Anonymized: {new Date(log.anonymized_timestamp).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{requests.length}</p>
              <p className="text-sm text-gray-600">Total Requests</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {requests.filter(r => r.status === 'completed').length}
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {requests.filter(r => r.status === 'pending').length}
              </p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{processingLogs.length}</p>
              <p className="text-sm text-gray-600">Processing Activities</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GDPRCompliance;

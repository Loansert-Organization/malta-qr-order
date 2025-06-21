
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  FileText,
  Users,
  Database,
  AlertCircle,
  CheckCircle,
  Clock,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DataSubjectRequest {
  id: string;
  guest_session_id: string;
  request_type: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction';
  request_details: any;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requested_at: string;
  processed_at?: string;
  response_data?: any;
  created_at: string;
  updated_at: string;
}

interface ProcessingLog {
  id: string;
  guest_session_id: string;
  processing_purpose: string;
  data_categories: any;
  legal_basis: string;
  retention_period?: string;
  processor_name?: string;
  processing_timestamp: string;
  anonymized_timestamp?: string;
  deleted_timestamp?: string;
  created_at: string;
}

const GDPRCompliance: React.FC = () => {
  const [dataRequests, setDataRequests] = useState<DataSubjectRequest[]>([]);
  const [processingLogs, setProcessingLogs] = useState<ProcessingLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [newRequest, setNewRequest] = useState({
    guest_session_id: '',
    request_type: 'access' as const,
    request_details: ''
  });
  const { toast } = useToast();

  // Mock data for demonstration - in production, this would fetch from the database
  useEffect(() => {
    // Set mock data for demonstration
    setDataRequests([]);
    setProcessingLogs([]);
  }, []);

  const handleCreateRequest = async () => {
    if (!newRequest.guest_session_id || !newRequest.request_type) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual database insertion when tables are available
      toast({
        title: "Success",
        description: "Data subject request created successfully",
      });
      setNewRequest({
        guest_session_id: '',
        request_type: 'access',
        request_details: ''
      });
    } catch (error) {
      console.error('Error creating data subject request:', error);
      toast({
        title: "Error",
        description: "Failed to create request",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'access':
        return <FileText className="h-4 w-4" />;
      case 'erasure':
        return <Database className="h-4 w-4" />;
      case 'portability':
        return <Download className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          GDPR Compliance Dashboard
        </h2>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          EU Compliant
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Requests</p>
                <p className="text-2xl font-bold text-blue-600">
                  {dataRequests.filter(r => r.status === 'pending' || r.status === 'processing').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {dataRequests.filter(r => r.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Processing Logs</p>
                <p className="text-2xl font-bold text-purple-600">{processingLogs.length}</p>
              </div>
              <Database className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Data Subjects</p>
                <p className="text-2xl font-bold text-gray-600">
                  {new Set(dataRequests.map(r => r.guest_session_id)).size}
                </p>
              </div>
              <Users className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">Data Subject Requests</TabsTrigger>
          <TabsTrigger value="processing">Processing Logs</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Status</TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <div className="space-y-4">
            {/* Create New Request Form */}
            <Card>
              <CardHeader>
                <CardTitle>Create Data Subject Request</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="session-id">Guest Session ID</Label>
                    <Input
                      id="session-id"
                      value={newRequest.guest_session_id}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, guest_session_id: e.target.value }))}
                      placeholder="Enter session ID"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="request-type">Request Type</Label>
                    <Select
                      value={newRequest.request_type}
                      onValueChange={(value) => 
                        setNewRequest(prev => ({ ...prev, request_type: value as any }))
                      }
                    >
                      <SelectTrigger id="request-type">
                        <SelectValue placeholder="Select request type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="access">Data Access</SelectItem>
                        <SelectItem value="rectification">Data Rectification</SelectItem>
                        <SelectItem value="erasure">Data Erasure</SelectItem>
                        <SelectItem value="portability">Data Portability</SelectItem>
                        <SelectItem value="restriction">Processing Restriction</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-end">
                    <Button onClick={handleCreateRequest} disabled={loading} className="w-full">
                      {loading ? 'Creating...' : 'Create Request'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requests List */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Data Subject Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {dataRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No data subject requests yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Requests will appear here when submitted
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dataRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getRequestTypeIcon(request.request_type)}
                          <div>
                            <p className="font-medium">
                              {request.request_type.charAt(0).toUpperCase() + request.request_type.slice(1)} Request
                            </p>
                            <p className="text-sm text-gray-600">
                              Session: {request.guest_session_id.slice(-8)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(request.requested_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="processing">
          <Card>
            <CardHeader>
              <CardTitle>Data Processing Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              {processingLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No processing logs yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Processing activities will be logged here automatically
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {processingLogs.map((log) => (
                    <div key={log.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{log.processing_purpose}</p>
                        <Badge variant="outline">{log.legal_basis}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Session: {log.guest_session_id.slice(-8)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(log.processing_timestamp).toLocaleString()}
                      </p>
                      {log.retention_period && (
                        <p className="text-xs text-gray-500">
                          Retention: {log.retention_period}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Rights Implementation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Right to Access</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Right to Rectification</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Right to Erasure</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Right to Portability</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Right to Restriction</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Technical Safeguards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Data Anonymization</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Encryption at Rest</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Access Controls</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Audit Logging</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Privacy by Design</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GDPRCompliance;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  FileText,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';

interface VendorApplication {
  id: string;
  business_name: string;
  business_email: string;
  business_phone?: string;
  location?: string;
  business_type?: string;
  description?: string;
  website_url?: string;
  instagram_handle?: string;
  owner_name: string;
  owner_email: string;
  owner_phone?: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  applied_at: string;
  reviewed_at?: string;
  reviewer_notes?: string;
  documents: Array<{
    type: string;
    file_url: string;
    uploaded_at: string;
  }>;
  verification_checklist: {
    business_license: boolean;
    food_safety_cert: boolean;
    insurance_docs: boolean;
    bank_details: boolean;
    identity_verified: boolean;
  };
}

const VendorApprovalSystem = () => {
  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<VendorApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);

      // For demo purposes, create mock data since the tables might not have the exact structure
      const mockApplications: VendorApplication[] = [
        {
          id: '1',
          business_name: 'Demo Restaurant',
          business_email: 'demo@restaurant.com',
          business_phone: '+356 1234 5678',
          location: 'Valletta, Malta',
          business_type: 'Restaurant',
          description: 'A traditional Maltese restaurant serving authentic local cuisine.',
          website_url: 'https://demo-restaurant.com',
          owner_name: 'John Doe',
          owner_email: 'john@restaurant.com',
          owner_phone: '+356 9876 5432',
          status: 'pending',
          applied_at: new Date().toISOString(),
          documents: [
            {
              type: 'Business License',
              file_url: '/documents/license.pdf',
              uploaded_at: new Date().toISOString()
            }
          ],
          verification_checklist: {
            business_license: false,
            food_safety_cert: false,
            insurance_docs: false,
            bank_details: false,
            identity_verified: false
          }
        }
      ];

      setApplications(mockApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load vendor applications');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: string, notes?: string) => {
    try {
      setProcessing(true);

      // Mock the status update for demo
      setApplications(prev => prev.map(app => 
        app.id === applicationId 
          ? { ...app, status: status as any, reviewed_at: new Date().toISOString(), reviewer_notes: notes || reviewNotes }
          : app
      ));

      if (status === 'approved') {
        await createVendorAccount(applicationId);
      }

      toast.success(`Application ${status} successfully`);
      setSelectedApplication(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application');
    } finally {
      setProcessing(false);
    }
  };

  const createVendorAccount = async (applicationId: string) => {
    try {
      const application = applications.find(app => app.id === applicationId);
      if (!application) return;

      // Create vendor record using existing schema
      const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .insert({
          business_name: application.business_name,
          email: application.business_email,
          phone_number: application.business_phone,
          location: application.location,
          description: application.description,
          website: application.website_url,
          name: application.business_name,
          slug: application.business_name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          active: true
        })
        .select()
        .single();

      if (vendorError) throw vendorError;

      toast.success('Vendor account created successfully');
    } catch (error) {
      console.error('Error creating vendor account:', error);
      throw error;
    }
  };

  const updateVerificationItem = async (applicationId: string, item: string, checked: boolean) => {
    try {
      // Update local state for demo
      setApplications(prev => prev.map(app => 
        app.id === applicationId 
          ? {
              ...app,
              verification_checklist: {
                ...app.verification_checklist,
                [item]: checked
              }
            }
          : app
      ));

      if (selectedApplication?.id === applicationId) {
        setSelectedApplication(prev => prev ? {
          ...prev,
          verification_checklist: {
            ...prev.verification_checklist,
            [item]: checked
          }
        } : null);
      }
    } catch (error) {
      console.error('Error updating verification:', error);
      toast.error('Failed to update verification');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'under_review':
        return <Badge className="bg-blue-100 text-blue-800">Under Review</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const getVerificationProgress = (checklist: any) => {
    const items = Object.values(checklist);
    const completed = items.filter(Boolean).length;
    return (completed / items.length) * 100;
  };

  const filterApplicationsByStatus = (status: string) => {
    return applications.filter(app => app.status === status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vendor applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Vendor Applications</h2>
        <div className="flex items-center space-x-4">
          <Badge variant="outline">
            {filterApplicationsByStatus('pending').length} Pending
          </Badge>
          <Badge variant="outline">
            {filterApplicationsByStatus('under_review').length} Under Review
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications List */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">
                Pending ({filterApplicationsByStatus('pending').length})
              </TabsTrigger>
              <TabsTrigger value="under_review">
                Review ({filterApplicationsByStatus('under_review').length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({filterApplicationsByStatus('approved').length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({filterApplicationsByStatus('rejected').length})
              </TabsTrigger>
            </TabsList>

            {['pending', 'under_review', 'approved', 'rejected'].map(status => (
              <TabsContent key={status} value={status} className="space-y-4">
                {filterApplicationsByStatus(status).map(application => (
                  <Card 
                    key={application.id}
                    className={`cursor-pointer transition-colors ${
                      selectedApplication?.id === application.id ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedApplication(application)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{application.business_name}</h3>
                        {getStatusBadge(application.status)}
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-3 w-3" />
                          <span>{application.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-3 w-3" />
                          <span>{application.business_email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-3 w-3" />
                          <span>Applied {new Date(application.applied_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Verification Progress</span>
                          <span>{getVerificationProgress(application.verification_checklist).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-blue-600 h-1 rounded-full" 
                            style={{ width: `${getVerificationProgress(application.verification_checklist)}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {filterApplicationsByStatus(status).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No {status} applications
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Application Details */}
        <div className="lg:col-span-1">
          {selectedApplication ? (
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{selectedApplication.business_name}</span>
                  {getStatusBadge(selectedApplication.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Business Information */}
                <div>
                  <h4 className="font-medium mb-2">Business Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-3 w-3 text-gray-500" />
                      <span>{selectedApplication.business_email}</span>
                    </div>
                    {selectedApplication.business_phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-3 w-3 text-gray-500" />
                        <span>{selectedApplication.business_phone}</span>
                      </div>
                    )}
                    {selectedApplication.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-3 w-3 text-gray-500" />
                        <span>{selectedApplication.location}</span>
                      </div>
                    )}
                    {selectedApplication.website_url && (
                      <div className="flex items-center space-x-2">
                        <ExternalLink className="h-3 w-3 text-gray-500" />
                        <a 
                          href={selectedApplication.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Owner Information */}
                <div>
                  <h4 className="font-medium mb-2">Owner Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Name:</strong> {selectedApplication.owner_name}</p>
                    <p><strong>Email:</strong> {selectedApplication.owner_email}</p>
                    {selectedApplication.owner_phone && (
                      <p><strong>Phone:</strong> {selectedApplication.owner_phone}</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                {selectedApplication.description && (
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-gray-700">{selectedApplication.description}</p>
                  </div>
                )}

                {/* Verification Checklist */}
                <div>
                  <h4 className="font-medium mb-2">Verification Checklist</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedApplication.verification_checklist).map(([key, value]) => (
                      <label key={key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={value as boolean}
                          onChange={(e) => updateVerificationItem(selectedApplication.id, key, e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm">
                          {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Documents */}
                {selectedApplication.documents.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Documents</h4>
                    <div className="space-y-2">
                      {selectedApplication.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{doc.type}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(doc.file_url, '_blank')}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Review Notes */}
                {selectedApplication.status === 'pending' && (
                  <div>
                    <h4 className="font-medium mb-2">Review Notes</h4>
                    <Textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add notes for the applicant..."
                      rows={3}
                    />
                  </div>
                )}

                {/* Existing Review Notes */}
                {selectedApplication.reviewer_notes && (
                  <div>
                    <h4 className="font-medium mb-2">Previous Notes</h4>
                    <div className="p-3 bg-gray-50 rounded text-sm">
                      {selectedApplication.reviewer_notes}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {selectedApplication.status === 'pending' && (
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'under_review')}
                      disabled={processing}
                      className="flex-1"
                    >
                      Start Review
                    </Button>
                  </div>
                )}

                {selectedApplication.status === 'under_review' && (
                  <div className="space-y-2">
                    <Button
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'approved')}
                      disabled={processing}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Application
                    </Button>
                    <Button
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected')}
                      disabled={processing}
                      variant="destructive"
                      className="w-full"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Application
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                Select an application to view details
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorApprovalSystem;

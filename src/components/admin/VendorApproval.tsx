import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Clock, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PendingVendor {
  id: string;
  name: string;
  slug?: string;
  location: string | null;
  description: string | null;
  revolut_link?: string;
  stripe_link?: string;
  active: boolean | null;
  created_at: string;
  business_name?: string;
  category?: string | null;
  contact_person?: string | null;
  current_wait_time?: number | null;
  website?: string | null;
}

const VendorApproval: React.FC = () => {
  const { toast } = useToast();
  const [pendingVendors, setPendingVendors] = useState<PendingVendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<PendingVendor | null>(null);
  const [loading, setLoading] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');

  useEffect(() => {
    fetchPendingVendors();
  }, []);

  const fetchPendingVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('active', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingVendors(data || []);
    } catch (error) {
      console.error('Error fetching pending vendors:', error);
      toast({
        title: "Error",
        description: "Failed to load pending vendors",
        variant: "destructive"
      });
    }
  };

  const approveVendor = async (vendorId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('vendors')
        .update({ active: true })
        .eq('id', vendorId);

      if (error) throw error;

      toast({
        title: "Vendor Approved",
        description: "The vendor has been approved and can now start using the platform"
      });

      await fetchPendingVendors();
      setSelectedVendor(null);
    } catch (error) {
      console.error('Error approving vendor:', error);
      toast({
        title: "Error",
        description: "Failed to approve vendor",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const rejectVendor = async (_vendorId: string) => {
    setLoading(true);
    try {
      // For now, we'll just keep them as inactive
      // In a full implementation, you might want to add a 'rejected' status
      toast({
        title: "Vendor Rejected",
        description: "The vendor registration has been rejected"
      });

      setSelectedVendor(null);
    } catch (error) {
      console.error('Error rejecting vendor:', error);
      toast({
        title: "Error",
        description: "Failed to reject vendor",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Vendors List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Pending Approvals ({pendingVendors.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingVendors.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No pending vendor registrations</p>
            ) : (
              <div className="space-y-3">
                {pendingVendors.map((vendor) => (
                  <Card 
                    key={vendor.id} 
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedVendor?.id === vendor.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedVendor(vendor)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{vendor.name}</h4>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{vendor.location}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Submitted: {new Date(vendor.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vendor Details & Approval */}
        <Card>
          <CardHeader>
            <CardTitle>Vendor Review</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedVendor ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold">{selectedVendor.name}</h3>
                  <p className="text-gray-600">/{selectedVendor.slug}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <div className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{selectedVendor.location}</span>
                    </div>
                  </div>

                  {selectedVendor.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Description</label>
                      <p className="mt-1 text-gray-900">{selectedVendor.description}</p>
                    </div>
                  )}

                  {selectedVendor.revolut_link && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Revolut Payment Link</label>
                      <a 
                        href={selectedVendor.revolut_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block mt-1 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {selectedVendor.revolut_link}
                      </a>
                    </div>
                  )}

                  {selectedVendor.stripe_link && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Stripe Payment Link</label>
                      <a 
                        href={selectedVendor.stripe_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block mt-1 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {selectedVendor.stripe_link}
                      </a>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Approval Notes</label>
                  <Textarea
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    placeholder="Add notes about this approval/rejection..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={() => approveVendor(selectedVendor.id)}
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => rejectVendor(selectedVendor.id)}
                    disabled={loading}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Select a pending vendor to review
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorApproval;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Eye, CheckCircle, XCircle } from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  slug: string;
  location: string;
  active: boolean;
  created_at: string;
}

interface VendorManagementProps {
  vendors: Vendor[];
  onToggleVendorStatus: (vendorId: string, currentStatus: boolean) => void;
  onSelectVendor: (vendor: Vendor) => void;
}

const VendorManagement: React.FC<VendorManagementProps> = ({ 
  vendors, 
  onToggleVendorStatus, 
  onSelectVendor 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Vendor Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div>
                  <h3 className="font-semibold">{vendor.name}</h3>
                  <p className="text-sm text-gray-600">{vendor.location}</p>
                  <p className="text-xs text-gray-500">/{vendor.slug}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Badge variant={vendor.active ? "default" : "secondary"}>
                  {vendor.active ? "Active" : "Inactive"}
                </Badge>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSelectVendor(vendor)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  
                  <Button
                    size="sm"
                    variant={vendor.active ? "destructive" : "default"}
                    onClick={() => onToggleVendorStatus(vendor.id, vendor.active)}
                  >
                    {vendor.active ? (
                      <>
                        <XCircle className="h-4 w-4 mr-1" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Activate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorManagement;

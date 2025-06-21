
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import VendorApproval from './VendorApproval';

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
  const activeVendors = vendors.filter(v => v.active);
  const pendingVendors = vendors.filter(v => !v.active);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Vendors ({activeVendors.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval ({pendingVendors.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Active Vendors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeVendors.map((vendor) => (
                  <div key={vendor.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold">{vendor.name}</h3>
                        <p className="text-sm text-gray-600">{vendor.location}</p>
                        <p className="text-xs text-gray-500">/{vendor.slug}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge variant="default">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
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
                          variant="destructive"
                          onClick={() => onToggleVendorStatus(vendor.id, vendor.active)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Deactivate
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {activeVendors.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No active vendors</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <VendorApproval />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorManagement;

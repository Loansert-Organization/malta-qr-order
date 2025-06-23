
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Globe, Users, TrendingUp } from 'lucide-react';

const VendorDetails = () => {
  const { vendorId } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vendor Details</h1>
            <p className="text-gray-600">Vendor ID: {vendorId}</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">Edit Vendor</Button>
            <Button>Generate QR Code</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Contact Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        +356 1234 5678
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        contact@vendor.com
                      </div>
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2" />
                        www.vendor.com
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Location</h3>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                      <span className="text-sm">123 Main Street, Valletta, Malta</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Menu Items</CardTitle>
                <CardDescription>Current menu offerings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <h4 className="font-medium">Menu Item {item}</h4>
                        <p className="text-sm text-gray-600">Description of the item</p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">€{(Math.random() * 20 + 5).toFixed(2)}</div>
                        <Badge variant="outline" className="text-xs">Available</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">€1,250</div>
                    <p className="text-sm text-gray-600">Revenue This Week</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">156</div>
                    <p className="text-sm text-gray-600">Orders This Week</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">4.8</div>
                    <p className="text-sm text-gray-600">Average Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Account Status</span>
                    <Badge className="bg-green-500">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Menu Status</span>
                    <Badge variant="outline">Published</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Payment Setup</span>
                    <Badge className="bg-blue-500">Configured</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDetails;


import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Calendar, Settings } from 'lucide-react';

const VendorManagement = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
            <p className="text-gray-600">Manage restaurants and bars in the ICUPA network</p>
          </div>
          <Button>
            <Users className="h-4 w-4 mr-2" />
            Add New Vendor
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((vendor) => (
            <Card key={vendor} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Vendor {vendor}</CardTitle>
                  <Badge variant="outline">Active</Badge>
                </div>
                <CardDescription className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Malta Location
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Orders Today:</span>
                    <span className="font-medium">{Math.floor(Math.random() * 50)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Revenue:</span>
                    <span className="font-medium">€{Math.floor(Math.random() * 1000)}</span>
                  </div>
                </div>
                <div className="flex space-x-2 mt-4">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-1" />
                    Manage
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VendorManagement;

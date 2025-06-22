
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Star } from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  slug: string;
  description?: string;
  location?: string;
  logo_url?: string;
  active: boolean;
}

interface VendorCardProps {
  vendor: Vendor;
}

const VendorCard: React.FC<VendorCardProps> = ({ vendor }) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-200 group">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
              {vendor.name}
            </CardTitle>
            {vendor.location && (
              <div className="flex items-center text-gray-500 mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm">{vendor.location}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end space-y-1">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Clock className="h-3 w-3 mr-1" />
              Open
            </Badge>
            {vendor.logo_url && (
              <img 
                src={vendor.logo_url} 
                alt={vendor.name}
                className="h-10 w-10 rounded-full object-cover"
              />
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <CardDescription className="mb-4 min-h-[3rem]">
          {vendor.description || "Delicious food made with love and AI-powered service"}
        </CardDescription>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-yellow-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="ml-1 text-sm font-medium">4.8</span>
            <span className="ml-1 text-sm text-gray-500">(120+ reviews)</span>
          </div>
          
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link to={`/order/${vendor.slug}`}>
              Order Now
            </Link>
          </Button>
        </div>

        <div className="flex flex-wrap gap-1 mt-3">
          <Badge variant="outline" className="text-xs">AI Waiter</Badge>
          <Badge variant="outline" className="text-xs">QR Ordering</Badge>
          <Badge variant="outline" className="text-xs">Local Cuisine</Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorCard;


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Clock, Star, Store } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import LoadingState from '@/components/LoadingState';
import NoDataState from '@/components/NoDataState';

interface Vendor {
  id: string;
  name: string;
  slug: string;
  description?: string;
  location?: string;
  logo_url?: string;
  active: boolean;
}

const VendorDirectory = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      console.log('🔍 Fetching vendors from Supabase...');
      
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) {
        console.error('❌ Error fetching vendors:', error);
        setVendors([]);
      } else {
        console.log('✅ Vendors loaded:', data?.length || 0);
        setVendors(data || []);
      }
    } catch (error) {
      console.error('❌ Unexpected error fetching vendors:', error);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Malta's Best Restaurants
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Order directly from your favorite restaurants with AI-powered assistance
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search restaurants or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-lg py-3"
            />
          </div>
        </div>

        {/* Vendor Grid or No Data State */}
        {vendors.length === 0 ? (
          <NoDataState
            icon={Store}
            title="No Restaurants Available"
            description="There are currently no restaurants registered on the platform."
            suggestions={[
              "Check back later for new restaurant additions",
              "Contact support if you're a restaurant owner wanting to join"
            ]}
            actionText="Refresh Page"
            onAction={fetchVendors}
          />
        ) : filteredVendors.length === 0 && searchQuery ? (
          <NoDataState
            icon={Search}
            title="No Restaurants Found"
            description={`No restaurants match your search for "${searchQuery}"`}
            suggestions={[
              "Try different search terms",
              "Check for typos in your search",
              "Browse all available restaurants by clearing the search"
            ]}
            actionText="Clear Search"
            onAction={() => setSearchQuery('')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.map((vendor) => (
              <Card key={vendor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{vendor.name}</CardTitle>
                      {vendor.location && (
                        <div className="flex items-center text-gray-500 mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">{vendor.location}</span>
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      Open
                    </Badge>
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
                    
                    <Button asChild>
                      <Link to={`/order/${vendor.slug}`}>
                        View Menu
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDirectory;

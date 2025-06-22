
import React, { useState, useEffect } from 'react';
import { Filter, Utensils } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import LoadingState from '@/components/LoadingState';
import NoDataState from '@/components/NoDataState';
import VendorCard from '@/components/vendor-directory/VendorCard';
import SearchFilters from '@/components/vendor-directory/SearchFilters';
import VendorCallToAction from '@/components/vendor-directory/VendorCallToAction';
import { useDemoDataSeeding } from '@/hooks/useDemoDataSeeding';

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
  const [locationFilter, setLocationFilter] = useState('');

  const { seedDemoData } = useDemoDataSeeding();

  useEffect(() => {
    fetchVendors();
    seedDemoData();
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

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = !locationFilter || 
                           vendor.location?.toLowerCase().includes(locationFilter.toLowerCase());
    return matchesSearch && matchesLocation;
  });

  const locations = [...new Set(vendors.map(v => v.location).filter(Boolean))];

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Utensils className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">ICUPA Malta</h1>
          </div>
          <p className="text-xl text-gray-600 mb-6">
            Discover Malta's Best Restaurants with AI-Powered Ordering
          </p>
          
          <SearchFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            locationFilter={locationFilter}
            onLocationChange={setLocationFilter}
            locations={locations}
          />
        </div>

        {/* Content */}
        {vendors.length === 0 ? (
          <NoDataState
            icon={Utensils}
            title="No Restaurants Available"
            description="There are currently no restaurants registered on the platform."
            suggestions={[
              "Check back later for new restaurant additions",
              "Contact support if you're a restaurant owner wanting to join"
            ]}
            actionText="Refresh Page"
            onAction={fetchVendors}
          />
        ) : filteredVendors.length === 0 && (searchQuery || locationFilter) ? (
          <NoDataState
            icon={Filter}
            title="No Restaurants Found"
            description="No restaurants match your search criteria"
            suggestions={[
              "Try different search terms",
              "Check for typos in your search",
              "Browse all available restaurants by clearing filters"
            ]}
            actionText="Clear Filters"
            onAction={() => {
              setSearchQuery('');
              setLocationFilter('');
            }}
          />
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing {filteredVendors.length} of {vendors.length} restaurants
              </p>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500">Sort by popularity</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVendors.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>

            <VendorCallToAction />
          </>
        )}
      </div>
    </div>
  );
};

export default VendorDirectory;

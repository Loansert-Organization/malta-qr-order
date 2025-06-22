
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Clock, Star, Store, Filter, Utensils } from 'lucide-react';
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
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    fetchVendors();
    seedDemoData(); // Add some demo data for testing
  }, []);

  const seedDemoData = async () => {
    try {
      // Check if we already have vendors
      const { data: existingVendors } = await supabase
        .from('vendors')
        .select('id')
        .limit(1);

      if (existingVendors && existingVendors.length > 0) {
        console.log('Demo vendors already exist');
        return;
      }

      // Seed demo vendors
      const demoVendors = [
        {
          name: 'The Harbour Bistro',
          slug: 'harbour-bistro',
          description: 'Fresh seafood and Mediterranean cuisine with stunning harbor views',
          location: 'Valletta Waterfront',
          active: true
        },
        {
          name: 'Malta Street Kitchen',
          slug: 'malta-street-kitchen',
          description: 'Traditional Maltese dishes with a modern twist',
          location: 'St. Julian\'s',
          active: true
        },
        {
          name: 'Gozo Garden Café',
          slug: 'gozo-garden-cafe',
          description: 'Farm-to-table dining experience with local ingredients',
          location: 'Victoria, Gozo',
          active: true
        },
        {
          name: 'Mdina Medieval Tavern',
          slug: 'mdina-medieval-tavern',
          description: 'Historic dining in the silent city with traditional recipes',
          location: 'Mdina',
          active: true
        },
        {
          name: 'Sliema Sunset Bar',
          slug: 'sliema-sunset-bar',
          description: 'Cocktails and light bites with panoramic sea views',
          location: 'Sliema',
          active: true
        }
      ];

      const { error } = await supabase
        .from('vendors')
        .insert(demoVendors);

      if (error) {
        console.error('Error seeding demo vendors:', error);
      } else {
        console.log('Demo vendors seeded successfully');
        // Create menus for each vendor
        await seedMenusForVendors();
      }
    } catch (error) {
      console.error('Error in seedDemoData:', error);
    }
  };

  const seedMenusForVendors = async () => {
    try {
      const { data: vendors } = await supabase
        .from('vendors')
        .select('id, slug');

      if (!vendors) return;

      for (const vendor of vendors) {
        // Create menu for each vendor
        const { data: menu, error: menuError } = await supabase
          .from('menus')
          .insert({
            vendor_id: vendor.id,
            name: 'Main Menu',
            active: true
          })
          .select()
          .single();

        if (menuError) {
          console.error('Error creating menu:', menuError);
          continue;
        }

        // Add sample menu items
        const menuItems = getSampleMenuItems(vendor.slug, menu.id);
        
        const { error: itemsError } = await supabase
          .from('menu_items')
          .insert(menuItems);

        if (itemsError) {
          console.error('Error creating menu items:', itemsError);
        }
      }
    } catch (error) {
      console.error('Error seeding menus:', error);
    }
  };

  const getSampleMenuItems = (vendorSlug: string, menuId: string) => {
    const baseItems = [
      // Starters
      {
        menu_id: menuId,
        name: 'Maltese Ftira Bread',
        description: 'Traditional Maltese sourdough bread with tomatoes, olives, and local cheese',
        price: 8.50,
        category: 'starters',
        available: true,
        popular: true
      },
      {
        menu_id: menuId,
        name: 'Ġbejna Platter',
        description: 'Selection of traditional Maltese goat cheese with honey and crackers',
        price: 12.00,
        category: 'starters',
        available: true
      },
      {
        menu_id: menuId,
        name: 'Bigilla Dip',
        description: 'Traditional bean paste with garlic, herbs, and olive oil served with bread',
        price: 6.50,
        category: 'starters',
        available: true
      },
      // Mains
      {
        menu_id: menuId,
        name: 'Bragioli',
        description: 'Traditional Maltese beef olives stuffed with breadcrumbs, bacon, and herbs',
        price: 18.50,
        category: 'mains',
        available: true,
        popular: true
      },
      {
        menu_id: menuId,
        name: 'Lampuki Pie',
        description: 'Seasonal fish pie with vegetables in flaky pastry (October-January)',
        price: 16.00,
        category: 'mains',
        available: false // Seasonal
      },
      {
        menu_id: menuId,
        name: 'Rabbit Stew',
        description: 'Traditional Maltese feneka with wine, vegetables, and local herbs',
        price: 22.00,
        category: 'mains',
        available: true
      },
      // Drinks
      {
        menu_id: menuId,
        name: 'Kinnie',
        description: 'Malta\'s national soft drink with bitter orange and herbs',
        price: 3.50,
        category: 'drinks',
        available: true,
        popular: true
      },
      {
        menu_id: menuId,
        name: 'Local Wine Selection',
        description: 'Choice of Maltese wines from local vineyards',
        price: 6.00,
        category: 'drinks',
        available: true
      },
      // Desserts
      {
        menu_id: menuId,
        name: 'Kannoli',
        description: 'Traditional ricotta-filled pastry tubes with candied fruit',
        price: 7.50,
        category: 'desserts',
        available: true
      },
      {
        menu_id: menuId,
        name: 'Imqaret',
        description: 'Date-filled pastries served warm with honey',
        price: 5.50,
        category: 'desserts',
        available: true
      }
    ];

    // Customize items based on vendor
    if (vendorSlug === 'harbour-bistro') {
      baseItems.push({
        menu_id: menuId,
        name: 'Grilled Sea Bass',
        description: 'Fresh local sea bass with Mediterranean herbs and lemon',
        price: 24.00,
        category: 'mains',
        available: true,
        popular: true
      });
    } else if (vendorSlug === 'sliema-sunset-bar') {
      baseItems.push({
        menu_id: menuId,
        name: 'Malta Sunset Cocktail',
        description: 'Signature cocktail with local liqueur and fresh fruit',
        price: 12.00,
        category: 'drinks',
        available: true,
        popular: true
      });
    }

    return baseItems;
  };

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
        {/* Enhanced Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Utensils className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              ICUPA Malta
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-6">
            Discover Malta's Best Restaurants with AI-Powered Ordering
          </p>
          
          {/* Enhanced Search and Filters */}
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search restaurants, cuisine, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-lg py-3"
              />
            </div>
            
            {/* Location Filter */}
            {locations.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant={!locationFilter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLocationFilter('')}
                >
                  All Locations
                </Button>
                {locations.map(location => (
                  <Button
                    key={location}
                    variant={locationFilter === location ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLocationFilter(location)}
                  >
                    {location}
                  </Button>
                ))}
              </div>
            )}
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
        ) : filteredVendors.length === 0 && (searchQuery || locationFilter) ? (
          <NoDataState
            icon={Search}
            title="No Restaurants Found"
            description={`No restaurants match your search criteria`}
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
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing {filteredVendors.length} of {vendors.length} restaurants
              </p>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500">Sort by popularity</span>
              </div>
            </div>

            {/* Enhanced Vendor Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVendors.map((vendor) => (
                <Card key={vendor.id} className="hover:shadow-lg transition-all duration-200 group">
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

                    {/* Quick Info Tags */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      <Badge variant="outline" className="text-xs">
                        AI Waiter
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        QR Ordering
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Local Cuisine
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Call to Action for Vendors */}
            <div className="mt-12 text-center bg-blue-50 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Are you a restaurant owner?
              </h3>
              <p className="text-gray-600 mb-6">
                Join ICUPA Malta and revolutionize your restaurant with AI-powered ordering
              </p>
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link to="/vendor/register">
                  Register Your Restaurant
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VendorDirectory;

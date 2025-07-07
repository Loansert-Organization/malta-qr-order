import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  MapPin, 
  Star, 
  Users, 
  Filter, 
  Grid, 
  List,
  ChefHat,
  Phone,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { BarPhotoCarousel } from '@/components/ui/bar-photo-carousel';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface Bar {
  id: string;
  name: string;
  address: string;
  contact_number?: string;
  rating?: number;
  review_count?: number;
  website_url?: string;
  google_place_id?: string;
  has_menu?: boolean;
  country?: string;
  city?: string;
  categories?: string[];
  features?: string[];
}

interface FilterOptions {
  country: string;
  city: string;
  category: string;
  minRating: number;
  hasMenu: boolean;
}

const BarList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bars, setBars] = useState<Bar[]>([]);
  const [filteredBars, setFilteredBars] = useState<Bar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<FilterOptions>({
    country: 'all',
    city: 'all',
    category: 'all',
    minRating: 0,
    hasMenu: false
  });
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchBarsData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bars, searchQuery, filters]);

  const fetchBarsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Fetching bars data for BarList...');
      
      const { data: barsData, error } = await supabase
        .from('bars')
        .select('*')
        .order('rating', { ascending: false, nullsLast: true })
        .order('name');

      if (error) {
        console.error('❌ Error fetching bars:', error);
        setError(`Failed to fetch data: ${error.message}`);
        setBars([]);
        toast({
          title: "Error",
          description: "Failed to load bars. Please try again.",
          variant: "destructive"
        });
      } else {
        console.log('✅ Loaded bars:', barsData?.length);
        
        if (!barsData || barsData.length === 0) {
          setError('No bars found in the database');
          setBars([]);
        } else {
          setBars(barsData);
          
          // Extract unique cities and categories
          const cities = Array.from(new Set(barsData.map(bar => bar.city).filter(Boolean)));
          const categories = Array.from(new Set(
            barsData.flatMap(bar => bar.categories || []).filter(Boolean)
          ));
          
          setAvailableCities(cities);
          setAvailableCategories(categories);
        }
      }
    } catch (error) {
      console.error('💥 Critical error:', error);
      setError('An unexpected error occurred. Please try again later.');
      setBars([]);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bars];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(bar =>
        bar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bar.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bar.city?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Country filter
    if (filters.country !== 'all') {
      filtered = filtered.filter(bar => bar.country === filters.country);
    }

    // City filter
    if (filters.city !== 'all') {
      filtered = filtered.filter(bar => bar.city === filters.city);
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(bar => 
        bar.categories?.includes(filters.category)
      );
    }

    // Rating filter
    if (filters.minRating > 0) {
      filtered = filtered.filter(bar => 
        bar.rating && bar.rating >= filters.minRating
      );
    }

    // Menu filter
    if (filters.hasMenu) {
      filtered = filtered.filter(bar => bar.has_menu);
    }

    setFilteredBars(filtered);
  };

  const clearFilters = () => {
    setFilters({
      country: 'all',
      city: 'all',
      category: 'all',
      minRating: 0,
      hasMenu: false
    });
    setSearchQuery('');
  };

  const renderBarCard = (bar: Bar) => (
    <Card key={bar.id} className="hover:shadow-lg transition-shadow overflow-hidden">
      <BarPhotoCarousel
        barId={bar.id}
        barName={bar.name}
        height={200}
        autoRotate={true}
        showControls={true}
        showIndicators={true}
      />
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-xl">{bar.name}</h3>
          {bar.has_menu && (
            <Badge variant="secondary" className="text-xs">
              Menu Available
            </Badge>
          )}
        </div>
        
        <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{bar.address}</span>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap mb-4">
          {bar.rating && (
            <Badge variant="outline" className="text-xs">
              <Star className="w-3 h-3 mr-1 text-yellow-500 fill-current" />
              {bar.rating.toFixed(1)} stars
            </Badge>
          )}
          {bar.review_count && (
            <Badge variant="outline" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              {bar.review_count} reviews
            </Badge>
          )}
          {bar.city && (
            <Badge variant="outline" className="text-xs">
              {bar.city}
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => navigate(`/bars/${bar.id}`)}
            variant="outline"
            className="flex-1"
          >
            View Details
          </Button>
          <Button
            onClick={() => navigate(`/menu/${bar.id}?name=${encodeURIComponent(bar.name)}`)}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Menu
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderBarListItem = (bar: Bar) => (
    <Card key={bar.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
            <ChefHat className="w-8 h-8 text-gray-400" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-lg truncate">{bar.name}</h3>
              {bar.has_menu && (
                <Badge variant="secondary" className="text-xs ml-2">
                  Menu
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{bar.address}</span>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              {bar.rating && (
                <Badge variant="outline" className="text-xs">
                  <Star className="w-3 h-3 mr-1 text-yellow-500 fill-current" />
                  {bar.rating.toFixed(1)}
                </Badge>
              )}
              {bar.city && (
                <Badge variant="outline" className="text-xs">
                  {bar.city}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 flex-shrink-0">
            <Button
              onClick={() => navigate(`/bars/${bar.id}`)}
              variant="outline"
              size="sm"
            >
              Details
            </Button>
            <Button
              onClick={() => navigate(`/menu/${bar.id}?name=${encodeURIComponent(bar.name)}`)}
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Menu
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/client')}
              >
                <ChefHat className="w-6 h-6" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">All Bars & Restaurants</h1>
                <p className="text-sm text-gray-600">{filteredBars.length} establishments found</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search bars & restaurants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Select value={filters.country} onValueChange={(value) => setFilters(prev => ({ ...prev, country: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    <SelectItem value="Malta">Malta</SelectItem>
                    <SelectItem value="Rwanda">Rwanda</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.city} onValueChange={(value) => setFilters(prev => ({ ...prev, city: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="City" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {availableCities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {availableCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.minRating.toString()} onValueChange={(value) => setFilters(prev => ({ ...prev, minRating: parseInt(value) }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Min Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Any Rating</SelectItem>
                    <SelectItem value="3">3+ Stars</SelectItem>
                    <SelectItem value="4">4+ Stars</SelectItem>
                    <SelectItem value="4.5">4.5+ Stars</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => setFilters(prev => ({ ...prev, hasMenu: !prev.hasMenu }))}
                  className={filters.hasMenu ? 'bg-orange-50 border-orange-200' : ''}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Menu Only
                </Button>
              </div>

              {/* Clear Filters */}
              {(filters.country !== 'all' || filters.city !== 'all' || filters.category !== 'all' || filters.minRating > 0 || filters.hasMenu || searchQuery) && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && !loading && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={fetchBarsData}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className={viewMode === 'grid' ? 'h-96' : ''}>
                <Skeleton className="h-48 w-full rounded-t-lg" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredBars.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
            {filteredBars.map(bar => 
              viewMode === 'grid' ? renderBarCard(bar) : renderBarListItem(bar)
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2">No establishments found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarList; 
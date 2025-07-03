import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChefHat, Bell, User, Search, MapPin, Phone, Star, Users, ExternalLink, FileText } from 'lucide-react';
import { BarPhotoCarousel } from '@/components/ui/bar-photo-carousel';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const supabase = createClient(
  'https://nireplgrlwhwppjtfxbb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcmVwbGdybHdod3BwanRmeGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MjYzMzMsImV4cCI6MjA2NjEwMjMzM30.nBdmNTrbS5CvEMV-2k-hkUbUA1NCsi4Xwt69kkrJnvs'
);

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
}

const ClientHome = () => {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState<string>('Malta');
  const [searchQuery, setSearchQuery] = useState('');
  const [bars, setBars] = useState<Bar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBarsData();
  }, [selectedCountry]);

  const fetchBarsData = async () => {
    setLoading(true);
    try {
      console.log('🔍 Fetching bars data...');
      
      const { data: barsData, error } = await supabase
        .from('bars')
        .select('*')
        .order('rating', { ascending: false, nullsLast: true })
        .order('name');

      if (error) {
        console.error('❌ Error fetching bars:', error);
        setBars([]);
      } else {
        console.log('✅ Raw bars data:', barsData?.length);
        
        const filteredData = barsData?.filter(bar => {
          if (selectedCountry === 'Malta') {
            return bar.address?.includes('Malta');
          } else if (selectedCountry === 'Rwanda') {
            return bar.address?.includes('Rwanda') || bar.address?.includes('Kigali');
          }
          return true;
        }) || [];

        setBars(filteredData);
        console.log(`📊 Loaded ${filteredData.length} bars for ${selectedCountry}`);
      }
    } catch (error) {
      console.error('💥 Critical error:', error);
      setBars([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredBars = bars.filter(bar =>
    bar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bar.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">ICUPA</h1>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>{selectedCountry === 'Malta' ? '🇲🇹' : '🇷🇼'} {selectedCountry}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant={selectedCountry === 'Malta' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCountry('Malta')}
              >
                🇲🇹 Malta
              </Button>
              <Button
                variant={selectedCountry === 'Rwanda' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCountry('Rwanda')}
              >
                🇷🇼 Rwanda
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Greeting */}
        <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-1">Good day! 👋</h2>
            <p className="text-orange-100">Discover amazing bars & restaurants in {selectedCountry}</p>
            <div className="mt-2 text-sm text-orange-100">{filteredBars.length} places found</div>
          </CardContent>
        </Card>

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

        {/* Debug */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-sm">
            <div>🔍 Loading: {loading ? 'Yes' : 'No'}</div>
            <div>📊 Total bars: {bars.length}</div>
            <div>🔎 Filtered: {filteredBars.length}</div>
            <div>🏁 Status: {loading ? 'Loading...' : 'Ready'}</div>
          </CardContent>
        </Card>

        {/* Bars Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="h-96">
                <Skeleton className="h-48 w-full rounded-t-lg" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredBars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBars.map((bar) => (
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
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="cursor-default">
                            <FileText className="w-5 h-5 text-green-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Menu available</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
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
                  </div>
                  
                  <Button
                    onClick={() => navigate(`/menu/${bar.id}?name=${encodeURIComponent(bar.name)}`)}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Menu
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2">No establishments found</h3>
            <p className="text-gray-600">Try adjusting your search or select a different country</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientHome;

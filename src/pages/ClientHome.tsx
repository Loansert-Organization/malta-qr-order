import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Star, Navigation, Search, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GOOGLE_MAPS_API_KEY, COUNTRIES, DEFAULT_LOCATIONS } from '@/lib/constants';

interface Bar {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  google_rating: number | null;
  logo_url: string | null;
  country: string;
  distance?: number;
}

const mapContainerStyle = {
  width: '100%',
  height: '100vh'
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    }
  ]
};

const ClientHome = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bars, setBars] = useState<Bar[]>([]);
  const [nearestBar, setNearestBar] = useState<Bar | null>(null);
  const [selectedBar, setSelectedBar] = useState<Bar | null>(null);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('Malta');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState(DEFAULT_LOCATIONS.MALTA);
  const mapRef = useRef<google.maps.Map>();

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  });

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setMapCenter(location);
          
          // Determine country based on location
          if (Math.abs(location.lat - DEFAULT_LOCATIONS.RWANDA.lat) < 2) {
            setSelectedCountry('Rwanda');
          } else if (Math.abs(location.lat - DEFAULT_LOCATIONS.MALTA.lat) < 2) {
            setSelectedCountry('Malta');
          }
        },
        (error) => {
          console.warn('Geolocation error:', error);
        }
      );
    }
  }, []);

  useEffect(() => {
    fetchBars();
  }, [selectedCountry]);

  useEffect(() => {
    if (bars.length > 0 && userLocation) {
      calculateNearestBar();
    }
  }, [bars, userLocation]);

  const fetchBars = async () => {
    try {
      const { data, error } = await supabase
        .from('bars')
        .select('*')
        .eq('country', selectedCountry)
        .eq('is_active', true);

      if (error) throw error;

      const formattedBars: Bar[] = await Promise.all((data || []).map(async bar => {
        let logoUrl = bar.logo_url;
        if (logoUrl && !logoUrl.startsWith('http')) {
          const { data: signed, error: signErr } = await supabase.storage
            .from('bar-logos')
            .createSignedUrl(logoUrl, 60 * 60); // 1 hour
          if (!signErr) {
            logoUrl = signed.signedUrl;
          }
        }

        const formattedBar: Bar = {
          id: bar.id,
          name: bar.name,
          location: bar.location ? { lat: bar.location.lat, lng: bar.location.lng } : 
                    { lat: bar.lat || DEFAULT_LOCATIONS[selectedCountry as keyof typeof DEFAULT_LOCATIONS].lat, 
                      lng: bar.lng || DEFAULT_LOCATIONS[selectedCountry as keyof typeof DEFAULT_LOCATIONS].lng },
          google_rating: bar.google_rating || bar.rating,
          logo_url: logoUrl,
          country: bar.country
        };
        return formattedBar;
      }));

      setBars(formattedBars);
    } catch (error) {
      console.error('Error fetching bars:', error);
      toast({
        title: "Error",
        description: "Failed to load bars",
        variant: "destructive"
      });
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculateNearestBar = () => {
    if (!userLocation) return;

    let nearest: Bar | null = null;
    let minDistance = Infinity;

    bars.forEach(bar => {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        bar.location.lat,
        bar.location.lng
      );

      const barWithDistance = { ...bar, distance };

      if (distance < minDistance) {
        minDistance = distance;
        nearest = barWithDistance;
      }
    });

    setNearestBar(nearest);
  };

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const handleMarkerClick = (bar: Bar) => {
    setSelectedBar(bar);
  };

  const handleSeeMenu = (barId: string) => {
    navigate(`/menu/${barId}`);
  };

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    const location = DEFAULT_LOCATIONS[country as keyof typeof DEFAULT_LOCATIONS];
    setMapCenter(location);
    mapRef.current?.panTo(location);
    mapRef.current?.setZoom(12);
  };

  const handleSearch = () => {
    // Filter bars based on search query
    const filtered = bars.filter(bar => 
      bar.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (filtered.length > 0) {
      const firstResult = filtered[0];
      setSelectedBar(firstResult);
      mapRef.current?.panTo(firstResult.location);
      mapRef.current?.setZoom(16);
    } else {
      toast({
        title: "No results",
        description: "No bars found matching your search",
      });
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full">
      {/* Header with Home Button */}
      <div className="absolute top-4 left-4 z-20">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => navigate('/')}
          className="bg-white shadow-md hover:shadow-lg"
        >
          <Home className="h-5 w-5" />
        </Button>
      </div>

      {/* Search and Country Selection */}
      <div className="absolute top-4 left-16 right-4 z-10 flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search bars..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10 bg-white shadow-md"
          />
        </div>
        <Select value={selectedCountry} onValueChange={handleCountryChange}>
          <SelectTrigger className="w-[140px] bg-white shadow-md">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Malta">🇲🇹 Malta</SelectItem>
            <SelectItem value="Rwanda">🇷🇼 Rwanda</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Google Map */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={14}
        center={mapCenter}
        options={options}
        onLoad={onMapLoad}
      >
        {/* User Location Marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }}
          />
        )}

        {/* Bar Markers */}
        {bars.map((bar) => (
          <Marker
            key={bar.id}
            position={bar.location}
            onClick={() => handleMarkerClick(bar)}
            animation={selectedBar?.id === bar.id ? google.maps.Animation.BOUNCE : undefined}
            icon={{
              url: bar.logo_url || '/api/placeholder/40/40',
              scaledSize: new google.maps.Size(40, 40),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(20, 40),
            }}
          />
        ))}

        {/* Info Window */}
        {selectedBar && (
          <InfoWindow
            position={selectedBar.location}
            onCloseClick={() => setSelectedBar(null)}
          >
            <div className="p-2">
              <h3 className="font-semibold">{selectedBar.name}</h3>
              {selectedBar.google_rating && (
                <div className="flex items-center gap-1 text-sm text-yellow-600">
                  <Star className="h-4 w-4 fill-current" />
                  <span>{selectedBar.google_rating.toFixed(1)}</span>
                </div>
              )}
              <Button
                size="sm"
                className="mt-2 w-full"
                onClick={() => handleSeeMenu(selectedBar.id)}
              >
                See Menu
              </Button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Nearest Bar Card */}
      {nearestBar && (
        <Card className="absolute bottom-4 left-4 right-4 z-10 shadow-lg">
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{nearestBar.name}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  {nearestBar.google_rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span>{nearestBar.google_rating.toFixed(1)}</span>
                    </div>
                  )}
                  {nearestBar.distance && (
                    <div className="flex items-center gap-1">
                      <Navigation className="h-4 w-4" />
                      <span>
                        {nearestBar.distance < 1 
                          ? `${Math.round(nearestBar.distance * 1000)}m` 
                          : `${nearestBar.distance.toFixed(1)}km`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Button
                onClick={() => handleSeeMenu(nearestBar.id)}
                className="ml-4"
              >
                See Menu
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ClientHome; 
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Camera, RefreshCw, Image, Download, CheckCircle, XCircle, Clock, Search } from 'lucide-react';
import SimplePhotoCarousel from '@/components/ui/simple-photo-carousel';

const supabase = createClient(
  'https://nireplgrlwhwppjtfxbb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcmVwbGdybHdod3BwanRmeGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MjYzMzMsImV4cCI6MjA2NjEwMjMzM30.nBdmNTrbS5CvEMV-2k-hkUbUA1NCsi4Xwt69kkrJnvs'
);

interface Bar {
  id: string;
  name: string;
  address: string;
  website_url?: string;
  rating?: number;
  review_count?: number;
  created_at?: string;
  updated_at?: string;
}

const PhotoManager: React.FC = () => {
  const [bars, setBars] = useState<Bar[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('Malta');
  const [stats, setStats] = useState({
    totalBars: 0,
    barsWithPhotos: 0,
    barsWithMultiplePhotos: 0,
    totalPhotos: 0
  });

  useEffect(() => {
    fetchBars();
  }, [selectedCountry]);

  const fetchBars = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('bars')
        .select('*')
        .order('name');

      if (selectedCountry === 'Malta') {
        query = query.ilike('address', '%Malta%');
      } else if (selectedCountry === 'Rwanda') {
        query = query.or('address.ilike.%Rwanda%,address.ilike.%Kigali%');
      }

      const { data, error } = await query;
      
      if (error) {
        toast({
          title: "Error fetching bars",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      setBars(data || []);
      calculateStats(data || []);

    } catch (error) {
      console.error('Error fetching bars:', error);
      toast({
        title: "Error",
        description: "Failed to fetch bars data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (barsData: Bar[]) => {
    const totalBars = barsData.length;
    const barsWithPhotos = barsData.filter(bar => bar.website_url && bar.website_url.includes('googleapis.com')).length;
    const barsWithMultiplePhotos = barsData.filter(bar => bar.website_url && bar.website_url.includes('|')).length;
    const totalPhotos = barsData.reduce((sum, bar) => {
      if (bar.website_url && bar.website_url.includes('|')) {
        return sum + bar.website_url.split('|').length;
      } else if (bar.website_url && bar.website_url.includes('googleapis.com')) {
        return sum + 1;
      }
      return sum;
    }, 0);

    setStats({
      totalBars,
      barsWithPhotos,
      barsWithMultiplePhotos,
      totalPhotos
    });
  };

  const fetchPhotosForBars = async (maxPhotos = 5, batchSize = 5) => {
    setProcessing(true);
    try {
      const response = await fetch('https://nireplgrlwhwppjtfxbb.supabase.co/functions/v1/fetch-multiple-photos-enhanced', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcmVwbGdybHdod3BwanRmeGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MjYzMzMsImV4cCI6MjA2NjEwMjMzM30.nBdmNTrbS5CvEMV-2k-hkUbUA1NCsi4Xwt69kkrJnvs`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxPhotos,
          batchSize,
          onlyMalta: selectedCountry === 'Malta'
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Photos fetched successfully! 📸",
          description: `Processed ${result.summary.successfulBars} bars with ${result.summary.totalPhotos} photos`,
        });
        
        // Refresh the bars data
        await fetchBars();
      } else {
        toast({
          title: "Error fetching photos",
          description: result.error || "Unknown error occurred",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch photos",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const fetchPhotosForSpecificBar = async (barId: string, barName: string) => {
    setProcessing(true);
    try {
      const response = await fetch('https://nireplgrlwhwppjtfxbb.supabase.co/functions/v1/fetch-multiple-photos-enhanced', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcmVwbGdybHdod3BwanRmeGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MjYzMzMsImV4cCI6MjA2NjEwMjMzM30.nBdmNTrbS5CvEMV-2k-hkUbUA1NCsi4Xwt69kkrJnvs`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          barId,
          maxPhotos: 6
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: `Photos updated for ${barName}! 📸`,
          description: `Fetched ${result.results[0]?.photoCount || 0} photos`,
        });
        
        // Refresh the bars data
        await fetchBars();
      } else {
        toast({
          title: "Error fetching photos",
          description: result.error || "Unknown error occurred",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: `Failed to fetch photos for ${barName}`,
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const getPhotoCount = (bar: Bar) => {
    if (!bar.website_url) return 0;
    if (bar.website_url.includes('|')) {
      return bar.website_url.split('|').length;
    }
    if (bar.website_url.includes('googleapis.com')) {
      return 1;
    }
    return 0;
  };

  const getPhotosArray = (bar: Bar) => {
    if (!bar.website_url) return [];
    if (bar.website_url.includes('|')) {
      return bar.website_url.split('|');
    }
    if (bar.website_url.includes('googleapis.com')) {
      return [bar.website_url];
    }
    return [];
  };

  const filteredBars = bars.filter(bar =>
    bar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bar.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Photo Manager 📸</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and enhance bar photos with Google Maps API and OpenAI
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={selectedCountry === 'Malta' ? 'default' : 'outline'}
            onClick={() => setSelectedCountry('Malta')}
          >
            🇲🇹 Malta
          </Button>
          <Button
            variant={selectedCountry === 'Rwanda' ? 'default' : 'outline'}
            onClick={() => setSelectedCountry('Rwanda')}
          >
            🇷🇼 Rwanda
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Bars</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBars}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bars with Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.barsWithPhotos}</div>
            <div className="text-xs text-gray-500">
              {stats.totalBars > 0 ? Math.round((stats.barsWithPhotos / stats.totalBars) * 100) : 0}% coverage
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Multi-Photo Bars</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.barsWithMultiplePhotos}</div>
            <div className="text-xs text-gray-500">Carousel enabled</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalPhotos}</div>
            <div className="text-xs text-gray-500">
              ~{stats.totalBars > 0 ? (stats.totalPhotos / stats.totalBars).toFixed(1) : 0} per bar
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Photo Fetching Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={() => fetchPhotosForBars(5, 5)}
              disabled={processing}
              className="bg-green-600 hover:bg-green-700"
            >
              {processing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Camera className="w-4 h-4 mr-2" />}
              Fetch 5 Photos for 5 Bars
            </Button>
            
            <Button
              onClick={() => fetchPhotosForBars(6, 10)}
              disabled={processing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {processing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Fetch 6 Photos for 10 Bars
            </Button>
            
            <Button
              onClick={() => fetchBars()}
              disabled={processing}
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
          </div>
          
          {processing && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Clock className="w-4 h-4 animate-pulse" />
              Processing photos... This may take several minutes.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search bars..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Bars List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full rounded-t-lg" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBars.map((bar) => {
            const photoCount = getPhotoCount(bar);
            const photos = getPhotosArray(bar);
            
            return (
              <Card key={bar.id} className="overflow-hidden">
                {/* Photo Carousel */}
                <SimplePhotoCarousel
                  photos={photos}
                  barName={bar.name}
                  height={200}
                  autoRotate={true}
                  showControls={true}
                  showIndicators={true}
                />
                
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-lg">{bar.name}</h3>
                      <div className="flex gap-1">
                        {photoCount > 0 ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {photoCount} photo{photoCount !== 1 ? 's' : ''}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-600 border-red-200">
                            <XCircle className="w-3 h-3 mr-1" />
                            No photos
                          </Badge>
                        )}
                        
                        {photoCount > 1 && (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            <Camera className="w-3 h-3 mr-1" />
                            Carousel
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {bar.address}
                    </p>
                    
                    {bar.rating && (
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-yellow-500">⭐</span>
                        <span>{bar.rating.toFixed(1)}</span>
                        {bar.review_count && (
                          <span className="text-gray-500">({bar.review_count} reviews)</span>
                        )}
                      </div>
                    )}
                    
                    <Button
                      onClick={() => fetchPhotosForSpecificBar(bar.id, bar.name)}
                      disabled={processing}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      {processing ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4 mr-2" />
                      )}
                      {photoCount > 0 ? 'Update Photos' : 'Fetch Photos'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {filteredBars.length === 0 && !loading && (
        <div className="text-center py-12">
          <Image className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No bars found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or refresh the data
          </p>
        </div>
      )}
    </div>
  );
};

export default PhotoManager; 
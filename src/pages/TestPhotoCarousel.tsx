import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Camera, RefreshCw, CheckCircle } from 'lucide-react';
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
}

const TestPhotoCarousel = () => {
  const [bars, setBars] = useState<Bar[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchBarsWithMultiplePhotos();
  }, []);

  const fetchBarsWithMultiplePhotos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bars')
        .select('*')
        .ilike('address', '%Malta%')
        .not('website_url', 'is', null)
        .order('name')
        .limit(20);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch bars",
          variant: "destructive"
        });
        return;
      }

      // Filter to only bars with multiple photos
      const barsWithMultiplePhotos = data?.filter(bar => 
        bar.website_url && bar.website_url.includes('|')
      ) || [];

      setBars(barsWithMultiplePhotos);
      console.log(`Found ${barsWithMultiplePhotos.length} bars with multiple photos`);

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMorePhotos = async () => {
    setProcessing(true);
    try {
      const response = await fetch('https://nireplgrlwhwppjtfxbb.supabase.co/functions/v1/fetch-multiple-photos-enhanced', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcmVwbGdybHdod3BwanRmeGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MjYzMzMsImV4cCI6MjA2NjEwMjMzM30.nBdmNTrbS5CvEMV-2k-hkUbUA1NCsi4Xwt69kkrJnvs`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxPhotos: 6,
          batchSize: 5,
          onlyMalta: true
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Photos fetched successfully! 📸",
          description: `Processed ${result.summary.successfulBars} bars with ${result.summary.totalPhotos} photos`,
        });
        
        // Refresh the data
        await fetchBarsWithMultiplePhotos();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch photos",
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
          🎠 Photo Carousel Test
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Demonstrating the multi-photo carousel system with Google Maps photos enhanced by OpenAI GPT-4o Vision
        </p>
        
        <div className="flex justify-center gap-4">
          <Button onClick={fetchBarsWithMultiplePhotos} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
          
          <Button 
            onClick={fetchMorePhotos} 
            disabled={processing}
            className="bg-green-600 hover:bg-green-700"
          >
            {processing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Camera className="w-4 h-4 mr-2" />
            )}
            Fetch More Photos
          </Button>
        </div>
      </div>

      {/* Stats */}
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">📊 System Stats</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-2">
          <div className="text-2xl font-bold text-green-600">{bars.length}</div>
          <p className="text-sm text-gray-600">Bars with Multiple Photos</p>
          {bars.length > 0 && (
            <div className="text-sm text-gray-500">
              Total Photos: {bars.reduce((sum, bar) => sum + getPhotosArray(bar).length, 0)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Demo Message */}
      {bars.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-700 dark:text-green-400">System Working!</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ✨ Auto-rotating carousels with navigation controls<br/>
              📸 Multiple Google Maps photos per establishment<br/>
              🎨 Enhanced with OpenAI GPT-4o Vision analysis<br/>
              🔄 Smart photo management and caching
            </p>
          </CardContent>
        </Card>
      )}

      {/* Carousel Demos */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-orange-500" />
          <p>Loading carousel demos...</p>
        </div>
      ) : bars.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bars.map((bar, index) => {
            const photos = getPhotosArray(bar);
            
            return (
              <Card key={bar.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{bar.name}</CardTitle>
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      <Camera className="w-3 h-3 mr-1" />
                      {photos.length} photos
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{bar.address}</p>
                </CardHeader>
                
                <CardContent className="p-0">
                  <SimplePhotoCarousel
                    photos={photos}
                    barName={bar.name}
                    height={250}
                    autoRotate={true}
                    showControls={true}
                    showIndicators={true}
                  />
                </CardContent>
                
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      {bar.rating && (
                        <span className="flex items-center gap-1">
                          <span className="text-yellow-500">⭐</span>
                          {bar.rating.toFixed(1)}
                        </span>
                      )}
                      {bar.review_count && (
                        <span className="text-gray-500">
                          {bar.review_count} reviews
                        </span>
                      )}
                    </div>
                    
                    <Badge variant="outline" className="text-green-600">
                      Demo #{index + 1}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="max-w-md mx-auto">
          <CardContent className="p-12 text-center">
            <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="font-semibold mb-2">No Multi-Photo Bars Found</h3>
            <p className="text-sm text-gray-600 mb-4">
              Click "Fetch More Photos" to populate the system with multiple photos per bar
            </p>
            <Button 
              onClick={fetchMorePhotos} 
              disabled={processing}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {processing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Camera className="w-4 h-4 mr-2" />
              )}
              Start Photo Fetching
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Technical Details */}
      <Card className="bg-gray-50 dark:bg-gray-800/50">
        <CardHeader>
          <CardTitle className="text-center">🔧 Technical Implementation</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Backend Features:</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Google Maps Places API integration</li>
                <li>• Up to 6 photos per establishment</li>
                <li>• OpenAI GPT-4o Vision enhancement</li>
                <li>• Intelligent fuzzy name matching</li>
                <li>• Rate limiting and error handling</li>
                <li>• Pipe-delimited URL storage</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Frontend Features:</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Auto-rotating carousel (4s intervals)</li>
                <li>• Manual navigation controls</li>
                <li>• Photo indicators and counters</li>
                <li>• Graceful fallback for no photos</li>
                <li>• Loading states and error handling</li>
                <li>• Responsive design</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestPhotoCarousel; 
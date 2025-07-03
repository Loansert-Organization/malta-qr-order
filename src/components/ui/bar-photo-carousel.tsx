import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://nireplgrlwhwppjtfxbb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcmVwbGdybHdod3BwanRmeGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MjYzMzMsImV4cCI6MjA2NjEwMjMzM30.nBdmNTrbS5CvEMV-2k-hkUbUA1NCsi4Xwt69kkrJnvs'
);

interface BarPhoto {
  id: string;
  original_url: string;
  supabase_url: string;
  enhanced_url: string;
  is_enhanced: boolean;
  width?: number;
  height?: number;
}

interface BarPhotoCarouselProps {
  barId: string;
  barName: string;
  className?: string;
  height?: number;
  autoRotate?: boolean;
  showControls?: boolean;
  showIndicators?: boolean;
}

export const BarPhotoCarousel: React.FC<BarPhotoCarouselProps> = ({
  barId,
  barName,
  className = '',
  height = 300,
  autoRotate = true,
  showControls = true,
  showIndicators = true,
}) => {
  const [photos, setPhotos] = useState<BarPhoto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState<Record<number, boolean>>({});

  // Fetch photos for the bar
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('bar_photos')
          .select('*')
          .eq('bar_id', barId)
          .eq('processing_status', 'completed')
          .order('created_at', { ascending: true });

        if (fetchError) {
          throw fetchError;
        }

        // If no photos in bar_photos table, check website_url from bars table
        if (!data || data.length === 0) {
          console.log(`No photos in bar_photos table for ${barName}, checking website_url...`);
          
          const { data: barData, error: barError } = await supabase
            .from('bars')
            .select('website_url')
            .eq('id', barId)
            .single();

          if (!barError && barData?.website_url) {
            // Check if it's a Google Maps photo URL
            if (barData.website_url.includes('googleapis.com') || 
                barData.website_url.includes('googleusercontent.com') ||
                barData.website_url.startsWith('http')) {
              
              console.log(`Found website_url for ${barName}: ${barData.website_url}`);
              
              // Create a photo object from website_url
              const fallbackPhoto: BarPhoto = {
                id: 'website-url-photo',
                original_url: barData.website_url,
                supabase_url: barData.website_url,
                enhanced_url: barData.website_url,
                is_enhanced: false,
                width: 1600,
                height: 1200
              };
              
              setPhotos([fallbackPhoto]);
            }
          } else {
            setPhotos([]);
          }
        } else {
          setPhotos(data);
        }
        
      } catch (err) {
        console.error('Error fetching bar photos:', err);
        setError('Failed to load photos');
      } finally {
        setLoading(false);
      }
    };

    if (barId) {
      fetchPhotos();
    }
  }, [barId, barName]);

  // Auto rotation
  useEffect(() => {
    if (!autoRotate || photos.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, 4000); // Change photo every 4 seconds

    return () => clearInterval(interval);
  }, [autoRotate, photos.length]);

  // Handle image loading states
  const handleImageLoad = (index: number) => {
    setImageLoading(prev => ({ ...prev, [index]: false }));
  };

  const handleImageError = (index: number) => {
    setImageLoading(prev => ({ ...prev, [index]: false }));
    console.error(`Failed to load image at index ${index}`);
  };

  const handleImageLoadStart = (index: number) => {
    setImageLoading(prev => ({ ...prev, [index]: true }));
  };

  // Navigation functions
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Loading state
  if (loading) {
    return (
      <div className={`relative overflow-hidden rounded-lg ${className}`} style={{ height }}>
        <Skeleton className="w-full h-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500">Loading photos...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`relative bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center p-4">
          <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-500 mb-2">Failed to load photos</p>
          <p className="text-xs text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  // No photos state
  if (photos.length === 0) {
    return (
      <div className={`relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center p-4">
          <Camera className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">No photos available</p>
          <p className="text-xs text-gray-500">Photos for {barName} will be added soon</p>
          <Badge variant="outline" className="mt-2 text-xs">
            📸 Coming Soon
          </Badge>
        </div>
      </div>
    );
  }

  const currentPhoto = photos[currentIndex];

  return (
    <div className={`relative overflow-hidden rounded-lg group ${className}`} style={{ height }}>
      {/* Main Image */}
      <div className="relative w-full h-full">
        <img
          key={currentIndex}
          src={currentPhoto.enhanced_url || currentPhoto.supabase_url || currentPhoto.original_url}
          alt={`${barName} - Photo ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-500"
          onLoad={() => handleImageLoad(currentIndex)}
          onError={() => handleImageError(currentIndex)}
          onLoadStart={() => handleImageLoadStart(currentIndex)}
        />
        
        {/* Loading overlay for current image */}
        {imageLoading[currentIndex] && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        {/* Photo info badge */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-black/60 text-white border-0 text-xs backdrop-blur-sm">
            <Camera className="w-3 h-3 mr-1" />
            {currentIndex + 1} of {photos.length}
            {currentPhoto.is_enhanced && (
              <span className="ml-1">✨</span>
            )}
          </Badge>
        </div>

        {/* Enhanced badge */}
        {currentPhoto.is_enhanced && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-xs">
              ✨ Enhanced
            </Badge>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      {showControls && photos.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={goToPrevious}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={goToNext}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </>
      )}

      {/* Indicators */}
      {showIndicators && photos.length > 1 && (
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {photos.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white scale-125'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}

      {/* Photo count badge (bottom right) */}
      <div className="absolute bottom-3 right-3">
        <Badge variant="outline" className="bg-black/60 text-white border-white/20 text-xs backdrop-blur-sm">
          📷 {photos.length} photo{photos.length !== 1 ? 's' : ''}
        </Badge>
      </div>
    </div>
  );
};

export default BarPhotoCarousel; 
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SimplePhotoCarouselProps {
  photos: string[];
  barName: string;
  height?: number;
  autoRotate?: boolean;
  showControls?: boolean;
  showIndicators?: boolean;
}

const SimplePhotoCarousel: React.FC<SimplePhotoCarouselProps> = ({
  photos,
  barName,
  height = 200,
  autoRotate = true,
  showControls = true,
  showIndicators = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // Filter out photos that failed to load
  const validPhotos = photos.filter((_, index) => !imageErrors.has(index));

  useEffect(() => {
    if (!autoRotate || validPhotos.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validPhotos.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [autoRotate, validPhotos.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + validPhotos.length) % validPhotos.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % validPhotos.length);
  };

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(index));
  };

  if (!photos || photos.length === 0) {
    return (
      <div 
        className="w-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center p-4">
          <div className="text-4xl mb-2">🏢</div>
          <p className="text-sm text-gray-500">{barName}</p>
        </div>
      </div>
    );
  }

  if (validPhotos.length === 0) {
    return (
      <div 
        className="w-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center p-4">
          <div className="text-4xl mb-2">🖼️</div>
          <p className="text-sm text-gray-500">Images unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group" style={{ height }}>
      {/* Main Image */}
      <div className="relative w-full h-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={validPhotos[currentIndex]}
          alt={`${barName} - Photo ${currentIndex + 1}`}
          className="w-full h-full object-cover"
          onError={() => handleImageError(photos.indexOf(validPhotos[currentIndex]))}
        />
      </div>

      {/* Navigation Controls */}
      {showControls && validPhotos.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Indicators */}
      {showIndicators && validPhotos.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {validPhotos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex
                  ? 'bg-white'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to photo ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SimplePhotoCarousel; 
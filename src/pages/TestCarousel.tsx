import React from 'react';
import SimplePhotoCarousel from '@/components/ui/simple-photo-carousel';

const TestCarousel = () => {
  const testPhotos = [
    'https://via.placeholder.com/800x400/FF5722/FFFFFF?text=Photo+1',
    'https://via.placeholder.com/800x400/2196F3/FFFFFF?text=Photo+2',
    'https://via.placeholder.com/800x400/4CAF50/FFFFFF?text=Photo+3',
  ];

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Carousel Test Page</h1>
      
      <div className="max-w-2xl mx-auto">
        <h2 className="text-lg font-semibold mb-4">Test Carousel with Placeholder Images</h2>
        <SimplePhotoCarousel
          photos={testPhotos}
          barName="Test Bar"
          height={300}
          autoRotate={true}
          showControls={true}
          showIndicators={true}
        />
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <p className="text-sm">
          This page tests the carousel without any authentication or database dependencies.
        </p>
        <p className="text-sm mt-2">
          Visit <a href="/client" className="text-blue-500 underline">Client Home</a> to see the full app.
        </p>
      </div>
    </div>
  );
};

export default TestCarousel; 
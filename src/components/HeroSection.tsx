
import React from 'react';
import DynamicHeroSection from './DynamicHeroSection';

interface HeroSectionProps {
  layout: any;
  vendor: any;
  weatherData: any;
  contextData: any;
  onCtaClick: () => void;
}

const HeroSection = ({ layout, vendor, weatherData, contextData, onCtaClick }: HeroSectionProps) => {
  // Use the layout's hero section if available, otherwise create a default one
  const heroSection = layout?.hero_section || {
    title: `Welcome to ${vendor.name}`,
    subtitle: vendor.description || 'Discover our amazing menu',
    cta_text: 'View Menu',
    background_theme: 'neutral' as const,
    show_promo: false
  };

  return (
    <DynamicHeroSection
      heroSection={heroSection}
      onCtaClick={onCtaClick}
      vendorName={vendor.name}
      location={vendor.location || ''}
      weatherData={weatherData}
    />
  );
};

export default HeroSection;

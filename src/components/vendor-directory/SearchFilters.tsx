
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  locationFilter: string;
  onLocationChange: (location: string) => void;
  locations: string[];
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchQuery,
  onSearchChange,
  locationFilter,
  onLocationChange,
  locations
}) => {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          type="text"
          placeholder="Search restaurants, cuisine, or locations..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 text-lg py-3"
        />
      </div>
      
      {locations.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          <Button
            variant={!locationFilter ? "default" : "outline"}
            size="sm"
            onClick={() => onLocationChange('')}
          >
            All Locations
          </Button>
          {locations.map(location => (
            <Button
              key={location}
              variant={locationFilter === location ? "default" : "outline"}
              size="sm"
              onClick={() => onLocationChange(location)}
            >
              {location}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchFilters;

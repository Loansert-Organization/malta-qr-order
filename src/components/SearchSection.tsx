// import React from 'react'; // Unused - removed
import { Search, Mic } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SearchContextData {
  recentSearches?: string[];
  popularSearches?: string[];
  searchHistory?: Array<{
    query: string;
    timestamp: string;
    results: number;
  }>;
  suggestions?: string[];
}

interface SearchSectionProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  contextData: SearchContextData;
}

const SearchSection = ({ searchQuery, onSearch, contextData }: SearchSectionProps) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-10 pr-4 py-2"
            />
          </div>
          <Button variant="outline" size="sm" className="flex-shrink-0">
            <Mic className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Quick filter suggestions based on context */}
        {contextData?.popular_searches && (
          <div className="mt-3 flex flex-wrap gap-2">
            {contextData.popular_searches.slice(0, 4).map((search: string, index: number) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => onSearch(search)}
                className="text-xs"
              >
                {search}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchSection;

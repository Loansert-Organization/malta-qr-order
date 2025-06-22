
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  searchQuery: string;
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearch
}) => {
  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search for dishes, drinks, or ingredients..."
            className="pl-10 pr-4 h-12"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12"
          onClick={() => {
            // Voice search would be implemented here
            console.log('Voice search activated');
          }}
        >
          <Mic className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;

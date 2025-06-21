
import { useState } from 'react';
import { MenuItem } from './types';

export const useSearchManager = (
  menuItems: MenuItem[],
  trackInteraction: (action: string, metadata?: any) => Promise<void>
) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    // Track search interaction
    await trackInteraction('search', {
      query,
      results_count: menuItems.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      ).length
    });
  };

  return {
    searchQuery,
    handleSearch
  };
};

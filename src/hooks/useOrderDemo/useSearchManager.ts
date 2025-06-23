
import { useState } from 'react';
import { MenuItem } from './types';

export const useSearchManager = (menuItems: MenuItem[]) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    // Track search interaction using contextService
    try {
      const { contextService } = await import('@/services/contextService');
      await contextService.trackInteraction('search', {
        query,
        results_count: menuItems.filter(item => 
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
        ).length
      });
    } catch (error) {
      console.error('Failed to track search interaction:', error);
    }
  };

  return {
    searchQuery,
    handleSearch
  };
};

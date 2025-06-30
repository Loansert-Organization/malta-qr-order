import React from 'react';
import MenuCard from './MenuCard';
import { Skeleton } from '@/components/ui/skeleton';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price_local: number;
  currency: string;
  image_url?: string;
  tags?: string[];
  prep_time_minutes?: number;
  menu_categories?: {
    name: string;
  };
}

interface MenuGridProps {
  items: MenuItem[];
  loading: boolean;
  onItemClick?: (item: MenuItem) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
}

const MenuGridSkeleton = () => (
  <div className="grid grid-cols-2 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="space-y-3">
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    ))}
  </div>
);

export const MenuGrid: React.FC<MenuGridProps> = ({
  items,
  loading,
  onItemClick,
  onLoadMore,
  hasMore,
  className = ""
}) => {
  if (loading && items.length === 0) {
    return <MenuGridSkeleton />;
  }

  if (!loading && items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🍽️</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No items found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Try selecting a different category or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-4">
        {items.map((item) => (
          <MenuCard 
            key={item.id} 
            item={item} 
            onItemClick={onItemClick}
          />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {/* Loading more items */}
      {loading && items.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`loading-${i}`} className="space-y-3">
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuGrid;

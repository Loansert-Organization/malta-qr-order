import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface Category {
  id: string;
  name: string;
  icon?: string;
  sort_order: number;
}

interface CategoryChipsRowProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  className?: string;
}

export const CategoryChipsRow: React.FC<CategoryChipsRowProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  className = ""
}) => {
  const sortedCategories = [...categories].sort((a, b) => a.sort_order - b.sort_order);

  const getCategoryIcon = (name: string, icon?: string) => {
    if (icon) return icon;
    
    const iconMap: Record<string, string> = {
      'All': '🍽️',
      'Starters': '🥗',
      'Mains': '🍖',
      'Drinks': '🍹',
      'Desserts': '🍰',
      'Vegan': '🌱',
      'Trending': '🔥',
      'Pizza': '🍕',
      'Burgers': '🍔',
      'Seafood': '🐟',
      'Coffee': '☕',
      'Wine': '🍷',
      'Beer': '🍺',
      'Cocktails': '🍸'
    };
    
    return iconMap[name] || '🍽️';
  };

  return (
    <div className={className}>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-3 p-1">
          {sortedCategories.map((category) => {
            const isSelected = selectedCategory.toLowerCase() === category.name.toLowerCase();
            
            return (
              <Badge
                key={category.id}
                variant={isSelected ? "default" : "secondary"}
                className={`
                  cursor-pointer transition-all duration-200 px-4 py-2 text-sm font-medium
                  hover:scale-105 active:scale-95 flex-shrink-0
                  ${isSelected 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300'
                  }
                  ${category.name === 'Trending' ? 'animate-pulse' : ''}
                `}
                onClick={() => onCategorySelect(category.name.toLowerCase())}
              >
                <span className="mr-2 text-base">
                  {getCategoryIcon(category.name, category.icon)}
                </span>
                {category.name}
                {category.name === 'Trending' && (
                  <span className="ml-1 text-xs opacity-75">🔥</span>
                )}
              </Badge>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
};

export default CategoryChipsRow;

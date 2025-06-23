
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Leaf, AlertTriangle, X } from 'lucide-react';

interface SmartMenuFiltersProps {
  activeFilters: string[];
  onFilterChange: (filters: string[]) => void;
  availableCategories: string[];
  availableSubcategories: string[];
}

const SmartMenuFilters: React.FC<SmartMenuFiltersProps> = ({
  activeFilters,
  onFilterChange,
  availableCategories,
  availableSubcategories
}) => {
  const toggleFilter = (filter: string) => {
    if (activeFilters.includes(filter)) {
      onFilterChange(activeFilters.filter(f => f !== filter));
    } else {
      onFilterChange([...activeFilters, filter]);
    }
  };

  const clearAllFilters = () => {
    onFilterChange([]);
  };

  const dietaryFilters = [
    { id: 'vegetarian', label: 'Vegetarian', icon: Leaf, color: 'green' },
    { id: 'no-allergens', label: 'No Common Allergens', icon: AlertTriangle, color: 'blue' }
  ];

  const commonAllergens = [
    'gluten', 'dairy', 'egg', 'fish', 'nuts', 'soy'
  ];

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        {activeFilters.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Dietary Filters */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Dietary Preferences</h4>
        <div className="flex flex-wrap gap-2">
          {dietaryFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilters.includes(filter.id);
            return (
              <Badge
                key={filter.id}
                variant={isActive ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  isActive 
                    ? `bg-${filter.color}-600 hover:bg-${filter.color}-700` 
                    : `hover:bg-${filter.color}-50 hover:border-${filter.color}-300`
                }`}
                onClick={() => toggleFilter(filter.id)}
              >
                <Icon className="h-3 w-3 mr-1" />
                {filter.label}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Category Filters */}
      {availableCategories.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Categories</h4>
          <div className="flex flex-wrap gap-2">
            {availableCategories.map((category) => (
              <Badge
                key={category}
                variant={activeFilters.includes(category) ? "default" : "outline"}
                className="cursor-pointer transition-colors hover:bg-blue-50"
                onClick={() => toggleFilter(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Subcategory Filters */}
      {availableSubcategories.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Subcategories</h4>
          <div className="flex flex-wrap gap-2">
            {availableSubcategories.map((subcategory) => (
              <Badge
                key={subcategory}
                variant={activeFilters.includes(subcategory) ? "default" : "outline"}
                className="cursor-pointer transition-colors hover:bg-purple-50"
                onClick={() => toggleFilter(subcategory)}
              >
                {subcategory}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <div className="pt-2 border-t">
          <p className="text-xs text-gray-500 mb-2">
            {activeFilters.length} filter{activeFilters.length !== 1 ? 's' : ''} active
          </p>
          <div className="flex flex-wrap gap-1">
            {activeFilters.map((filter) => (
              <Badge
                key={filter}
                variant="secondary"
                className="text-xs cursor-pointer hover:bg-red-100"
                onClick={() => toggleFilter(filter)}
              >
                {filter}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartMenuFilters;

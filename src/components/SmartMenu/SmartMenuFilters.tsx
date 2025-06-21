
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AIInsights } from './types';

interface SmartMenuFiltersProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  aiInsights?: AIInsights;
}

export const SmartMenuFilters = ({ 
  categories, 
  selectedCategory, 
  onCategoryChange, 
  aiInsights 
}: SmartMenuFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Button
        variant={selectedCategory === 'all' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onCategoryChange('all')}
      >
        All Items
      </Button>
      {categories.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCategoryChange(category)}
          className="relative"
        >
          {category}
          {aiInsights?.recommended_categories.includes(category.toLowerCase()) && (
            <Badge variant="secondary" className="ml-1 text-xs">
              AI Pick
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );
};

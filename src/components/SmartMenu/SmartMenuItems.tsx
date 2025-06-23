
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Leaf, AlertTriangle, Plus } from 'lucide-react';
import { MenuItem } from '@/hooks/useOrderDemo/types';

interface SmartMenuItemsProps {
  items: MenuItem[];
  onAddToCart: (item: MenuItem) => void;
  searchQuery?: string;
}

const SmartMenuItems: React.FC<SmartMenuItemsProps> = ({ 
  items, 
  onAddToCart, 
  searchQuery = '' 
}) => {
  const filteredItems = items.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query) ||
      item.subcategory?.toLowerCase().includes(query)
    );
  });

  // Group items by category and subcategory
  const groupedItems = filteredItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    const subcategory = item.subcategory || 'General';
    
    if (!acc[category]) {
      acc[category] = {};
    }
    if (!acc[category][subcategory]) {
      acc[category][subcategory] = [];
    }
    acc[category][subcategory].push(item);
    return acc;
  }, {} as Record<string, Record<string, MenuItem[]>>);

  const formatAllergens = (allergens: string[] = []) => {
    if (allergens.length === 0) return null;
    return allergens.map(allergen => 
      allergen.charAt(0).toUpperCase() + allergen.slice(1)
    ).join(', ');
  };

  return (
    <div className="space-y-8">
      {Object.entries(groupedItems).map(([category, subcategories]) => (
        <div key={category} className="space-y-6">
          <div className="border-b pb-2">
            <h2 className="text-2xl font-bold text-gray-900">{category}</h2>
          </div>
          
          {Object.entries(subcategories).map(([subcategory, items]) => (
            <div key={subcategory} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                {subcategory}
                <Badge variant="outline" className="text-xs">
                  {items.length} items
                </Badge>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {item.image_url && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg leading-tight">
                          {item.name}
                        </CardTitle>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-lg font-bold text-green-600">
                            €{item.price.toFixed(2)}
                          </span>
                          {item.popular && (
                            <Badge variant="secondary" className="text-xs">
                              Popular
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {item.is_vegetarian && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <Leaf className="h-3 w-3 mr-1" />
                            Vegetarian
                          </Badge>
                        )}
                        {item.prep_time && (
                          <Badge variant="outline" className="text-blue-600 border-blue-600">
                            <Clock className="h-3 w-3 mr-1" />
                            {item.prep_time}
                          </Badge>
                        )}
                        {!item.available && (
                          <Badge variant="destructive" className="text-xs">
                            Sold Out
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {item.description && (
                        <CardDescription className="text-sm text-gray-600 mb-3">
                          {item.description}
                        </CardDescription>
                      )}
                      
                      {item.allergens && item.allergens.length > 0 && (
                        <div className="flex items-start gap-2 mb-3 p-2 bg-yellow-50 rounded-md">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-yellow-800">Allergens:</p>
                            <p className="text-xs text-yellow-700">
                              {formatAllergens(item.allergens)}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <Button
                        onClick={() => onAddToCart(item)}
                        disabled={!item.available}
                        className="w-full"
                        variant={item.available ? "default" : "secondary"}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {item.available ? 'Add to Cart' : 'Unavailable'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
      
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-2">
            {searchQuery ? 'No items match your search' : 'No menu items available'}
          </div>
          {searchQuery && (
            <div className="text-sm text-gray-400">
              Try adjusting your search terms
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartMenuItems;

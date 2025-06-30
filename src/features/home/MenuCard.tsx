import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Clock, Star, Info, ChefHat } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

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

interface MenuCardProps {
  item: MenuItem;
  onItemClick?: (item: MenuItem) => void;
  className?: string;
}

export const MenuCard: React.FC<MenuCardProps> = ({
  item,
  onItemClick,
  className = ""
}) => {
  const { addToCart, loading } = useCart();
  const [showDetails, setShowDetails] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    
    try {
      await addToCart(item.id, 1, specialInstructions || undefined);
      
      // Scale animation effect
      const target = e.currentTarget as HTMLElement;
      target.style.transform = 'scale(1.1)';
      setTimeout(() => {
        target.style.transform = 'scale(1)';
      }, 150);
      
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleLongPress = () => {
    setShowDetails(true);
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(price);
  };

  const getTagColor = (tag: string) => {
    const colorMap: Record<string, string> = {
      'vegan': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'spicy': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'popular': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'new': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'gluten-free': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    };
    return colorMap[tag.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  return (
    <>
      <Card 
        className={`group cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105 ${className}`}
        onClick={() => onItemClick?.(item)}
        onContextMenu={(e) => {
          e.preventDefault();
          handleLongPress();
        }}
      >
        <CardContent className="p-0">
          {/* Image Section */}
          <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-t-lg overflow-hidden">
            {item.image_url ? (
              <img 
                src={item.image_url} 
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ChefHat className="w-12 h-12 text-gray-400 dark:text-gray-500" />
              </div>
            )}
            
            {/* Category Badge */}
            {item.menu_categories?.name && (
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="bg-white/90 text-gray-700 text-xs">
                  {item.menu_categories.name}
                </Badge>
              </div>
            )}

            {/* Prep Time */}
            {item.prep_time_minutes && (
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-white/90 text-gray-700 text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {item.prep_time_minutes}m
                </Badge>
              </div>
            )}

            {/* Add Button Overlay */}
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                size="sm"
                className="rounded-full w-8 h-8 p-0 bg-orange-500 hover:bg-orange-600 shadow-lg"
                onClick={handleAddToCart}
                disabled={loading || isAdding}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-3 space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
                {item.name}
              </h3>
              <div className="text-right ml-2">
                <div className="font-bold text-orange-600 dark:text-orange-400 text-sm">
                  {formatPrice(item.price_local, item.currency)}
                </div>
              </div>
            </div>

            {item.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                {item.description}
              </p>
            )}

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.tags.slice(0, 3).map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className={`text-xs px-2 py-0.5 ${getTagColor(tag)}`}
                  >
                    {tag}
                  </Badge>
                ))}
                {item.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    +{item.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Add to Cart Button */}
            <Button 
              className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white text-sm h-8"
              onClick={handleAddToCart}
              disabled={loading || isAdding}
            >
              <Plus className="w-3 h-3 mr-1" />
              {isAdding ? 'Adding...' : 'Add to Cart'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ChefHat className="w-5 h-5" />
              {item.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {item.image_url && (
              <img 
                src={item.image_url} 
                alt={item.name}
                className="w-full h-48 object-cover rounded-lg"
              />
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {formatPrice(item.price_local, item.currency)}
              </span>
              {item.prep_time_minutes && (
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  {item.prep_time_minutes} minutes
                </div>
              )}
            </div>

            {item.description && (
              <div>
                <h4 className="font-semibold text-sm mb-1">Description</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {item.description}
                </p>
              </div>
            )}

            {item.tags && item.tags.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className={getTagColor(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-semibold text-sm mb-2">Special Instructions</h4>
              <Textarea
                placeholder="Any special requests? (e.g., no onions, extra spicy...)"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>

            <Button 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              onClick={async () => {
                await addToCart(item.id, 1, specialInstructions || undefined);
                setShowDetails(false);
                setSpecialInstructions('');
              }}
              disabled={loading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
};

export default MenuCard;

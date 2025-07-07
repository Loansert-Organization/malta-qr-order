import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Plus,
  Minus,
  Heart,
  Star,
  Clock,
  DollarSign,
  ShoppingCart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  subcategory?: string;
  image_url?: string;
  is_available: boolean;
  preparation_time?: number;
  dietary_tags?: string[];
  spice_level?: number;
  volume?: string;
}

interface Bar {
  id: string;
  name: string;
  address: string;
}

const MenuCategory = () => {
  const { barId, category } = useParams<{ barId: string; category: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart, getItemQuantity, updateQuantity } = useCart();
  
  const [bar, setBar] = useState<Bar | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<{
    dietary: string[];
    priceRange: string;
    spiceLevel: number | null;
    availability: boolean;
  }>({
    dietary: [],
    priceRange: 'all',
    spiceLevel: null,
    availability: true
  });
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (barId && category) {
      fetchData();
    }
  }, [barId, category]);

  useEffect(() => {
    applyFilters();
  }, [menuItems, searchQuery, selectedFilters]);

  const fetchData = async () => {
    if (!barId || !category) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch bar details
      const { data: barData, error: barError } = await supabase
        .from('bars')
        .select('id, name, address')
        .eq('id', barId)
        .single();

      if (barError) throw barError;
      if (!barData) throw new Error('Bar not found');
      setBar(barData);

      // Fetch menu items for this category
      const { data: menuData, error: menuError } = await supabase
        .from('menus')
        .select(`
          menu_items (
            id,
            name,
            description,
            price,
            category,
            subcategory,
            image_url,
            volume,
            dietary_tags,
            preparation_time
          )
        `)
        .eq('bar_id', barId);

      if (menuError) throw menuError;

      if (menuData && menuData.length > 0) {
        const categoryName = category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        const items = menuData
          .flatMap(menu => menu.menu_items || [])
          .filter(item => item.category?.toLowerCase() === categoryName.toLowerCase())
          .map(item => ({
            ...item,
            is_available: true, // Mock availability
            spice_level: Math.floor(Math.random() * 4), // Mock spice level
            dietary_tags: item.dietary_tags || []
          })) as MenuItem[];

        setMenuItems(items);
      } else {
        setMenuItems([]);
      }

      // Load favorites from localStorage
      const savedFavorites = JSON.parse(localStorage.getItem('icupa_menu_favorites') || '[]');
      setFavorites(savedFavorites);

    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Failed to load menu category');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...menuItems];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Availability filter
    if (selectedFilters.availability) {
      filtered = filtered.filter(item => item.is_available);
    }

    // Dietary filters
    if (selectedFilters.dietary.length > 0) {
      filtered = filtered.filter(item =>
        selectedFilters.dietary.every(diet =>
          item.dietary_tags?.includes(diet)
        )
      );
    }

    // Price range filter
    if (selectedFilters.priceRange !== 'all') {
      const [min, max] = selectedFilters.priceRange.split('-').map(Number);
      filtered = filtered.filter(item =>
        item.price >= min && (max ? item.price <= max : true)
      );
    }

    // Spice level filter
    if (selectedFilters.spiceLevel !== null) {
      filtered = filtered.filter(item => item.spice_level === selectedFilters.spiceLevel);
    }

    setFilteredItems(filtered);
  };

  const toggleFavorite = (itemId: string) => {
    const newFavorites = favorites.includes(itemId)
      ? favorites.filter(id => id !== itemId)
      : [...favorites, itemId];
    
    setFavorites(newFavorites);
    localStorage.setItem('icupa_menu_favorites', JSON.stringify(newFavorites));
    
    toast({
      title: favorites.includes(itemId) ? "Removed from favorites" : "Added to favorites",
      description: favorites.includes(itemId) 
        ? "Item removed from your favorites"
        : "Item added to your favorites"
    });
  };

  const handleAddToCart = (item: MenuItem) => {
    if (!item.is_available) return;
    
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      barId: barId!,
      barName: bar?.name || '',
      image_url: item.image_url,
      volume: item.volume
    });
    
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart`
    });
  };

  const handleQuantityChange = (itemId: string, change: number) => {
    const currentQuantity = getItemQuantity(itemId);
    const newQuantity = Math.max(0, currentQuantity + change);
    updateQuantity(itemId, newQuantity);
  };

  const getCategoryTitle = () => {
    if (!category) return 'Menu';
    return category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getPriceRange = (items: MenuItem[]) => {
    if (items.length === 0) return '';
    const prices = items.map(item => item.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? `€${min}` : `€${min} - €${max}`;
  };

  const getDietaryTags = () => {
    const allTags = menuItems.flatMap(item => item.dietary_tags || []);
    return [...new Set(allTags)];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8" />
              <Skeleton className="w-48 h-6" />
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <Skeleton className="w-full h-48" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="w-3/4 h-5" />
                  <Skeleton className="w-full h-4" />
                  <Skeleton className="w-1/4 h-4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !bar) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2">Category Not Found</h3>
            <p className="text-gray-600 mb-4">{error || 'The requested menu category could not be found.'}</p>
            <Button onClick={() => navigate(`/bars/${barId}`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Bar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/bars/${barId}`)}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">{getCategoryTitle()}</h1>
                <p className="text-sm text-gray-600">{bar.name}</p>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/cart')}
              className="relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {/* Cart badge would go here */}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Category Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{getCategoryTitle()}</h2>
                <p className="text-gray-600">{filteredItems.length} items available</p>
                {filteredItems.length > 0 && (
                  <p className="text-sm text-gray-500">{getPriceRange(filteredItems)}</p>
                )}
              </div>
              <div className="text-3xl">
                {category?.includes('pizza') ? '🍕' : 
                 category?.includes('pasta') ? '🍝' :
                 category?.includes('drink') ? '🥤' :
                 category?.includes('dessert') ? '🍰' : '🍽️'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
                {(selectedFilters.dietary.length > 0 || 
                  selectedFilters.priceRange !== 'all' || 
                  selectedFilters.spiceLevel !== null) && (
                  <Badge variant="secondary" className="ml-1">
                    {selectedFilters.dietary.length + 
                     (selectedFilters.priceRange !== 'all' ? 1 : 0) +
                     (selectedFilters.spiceLevel !== null ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Menu</SheetTitle>
              </SheetHeader>
              
              <div className="space-y-6 mt-6">
                {/* Availability Filter */}
                <div>
                  <h4 className="font-medium mb-3">Availability</h4>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedFilters.availability}
                      onChange={(e) => setSelectedFilters(prev => ({
                        ...prev,
                        availability: e.target.checked
                      }))}
                    />
                    <span>Available only</span>
                  </label>
                </div>

                {/* Dietary Filters */}
                {getDietaryTags().length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Dietary</h4>
                    <div className="space-y-2">
                      {getDietaryTags().map(tag => (
                        <label key={tag} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedFilters.dietary.includes(tag)}
                            onChange={(e) => {
                              const newDietary = e.target.checked
                                ? [...selectedFilters.dietary, tag]
                                : selectedFilters.dietary.filter(d => d !== tag);
                              setSelectedFilters(prev => ({
                                ...prev,
                                dietary: newDietary
                              }));
                            }}
                          />
                          <span>{tag}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Range */}
                <div>
                  <h4 className="font-medium mb-3">Price Range</h4>
                  <div className="space-y-2">
                    {[
                      { label: 'All prices', value: 'all' },
                      { label: 'Under €10', value: '0-10' },
                      { label: '€10 - €20', value: '10-20' },
                      { label: '€20 - €30', value: '20-30' },
                      { label: 'Over €30', value: '30' }
                    ].map(option => (
                      <label key={option.value} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="priceRange"
                          value={option.value}
                          checked={selectedFilters.priceRange === option.value}
                          onChange={(e) => setSelectedFilters(prev => ({
                            ...prev,
                            priceRange: e.target.value
                          }))}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  onClick={() => setSelectedFilters({
                    dietary: [],
                    priceRange: 'all',
                    spiceLevel: null,
                    availability: true
                  })}
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Menu Items */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const quantity = getItemQuantity(item.id);
              
              return (
                <Card key={item.id} className={`overflow-hidden ${!item.is_available ? 'opacity-50' : ''}`}>
                  {item.image_url && (
                    <div className="relative">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/400x300/orange/white?text=No+Image';
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(item.id)}
                        className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white"
                      >
                        <Heart className={`w-4 h-4 ${favorites.includes(item.id) ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                    </div>
                  )}
                  
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="font-bold text-green-600">€{item.price}</span>
                          </div>
                        </div>
                        
                        {item.description && (
                          <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                        )}
                        
                        {item.volume && (
                          <p className="text-gray-500 text-xs">{item.volume}</p>
                        )}
                      </div>

                      {/* Tags and Info */}
                      <div className="flex flex-wrap gap-1">
                        {item.dietary_tags?.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {item.preparation_time && (
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.preparation_time}min
                          </Badge>
                        )}
                        {item.spice_level && item.spice_level > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {'🌶️'.repeat(item.spice_level)}
                          </Badge>
                        )}
                      </div>

                      {/* Add to Cart */}
                      {quantity > 0 ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, -1)}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="font-semibold min-w-[2rem] text-center">{quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <span className="text-sm font-medium text-green-600">
                            €{(item.price * quantity).toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleAddToCart(item)}
                          disabled={!item.is_available}
                          className="w-full bg-orange-500 hover:bg-orange-600"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          {item.is_available ? 'Add to Cart' : 'Unavailable'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2">No items found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? 'Try adjusting your search or filters'
                : 'No items available in this category'
              }
            </p>
            {(searchQuery || selectedFilters.dietary.length > 0 || selectedFilters.priceRange !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedFilters({
                    dietary: [],
                    priceRange: 'all',
                    spiceLevel: null,
                    availability: true
                  });
                }}
              >
                Clear Search & Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuCategory; 
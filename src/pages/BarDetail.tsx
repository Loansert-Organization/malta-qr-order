import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Star, 
  Users, 
  ExternalLink, 
  Clock, 
  Wifi,
  Car,
  CreditCard,
  Heart,
  Share2,
  Menu,
  ChefHat,
  Wine,
  Coffee,
  Utensils
} from 'lucide-react';
import { BarPhotoCarousel } from '@/components/ui/bar-photo-carousel';
import { useToast } from '@/hooks/use-toast';

interface Bar {
  id: string;
  name: string;
  address: string;
  contact_number?: string;
  rating?: number;
  review_count?: number;
  website_url?: string;
  google_place_id?: string;
  has_menu?: boolean;
  description?: string;
  opening_hours?: any;
  amenities?: string[];
  price_range?: string;
}

interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  item_count: number;
  icon: string;
}

interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

const BarDetail = () => {
  const { barId } = useParams<{ barId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [bar, setBar] = useState<Bar | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('menu');

  useEffect(() => {
    if (barId) {
      fetchBarDetails();
    }
  }, [barId]);

  const fetchBarDetails = async () => {
    if (!barId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch bar details
      const { data: barData, error: barError } = await supabase
        .from('bars')
        .select('*')
        .eq('id', barId)
        .single();

      if (barError) throw barError;
      if (!barData) throw new Error('Bar not found');

      setBar(barData);

      // Fetch menu categories
      const { data: menuData, error: menuError } = await supabase
        .from('menus')
        .select(`
          id,
          menu_items (
            id,
            category,
            subcategory
          )
        `)
        .eq('bar_id', barId);

      if (menuError) {
        console.warn('Menu fetch error:', menuError);
      } else if (menuData && menuData.length > 0) {
        const categoryMap = new Map();
        
        menuData.forEach(menu => {
          menu.menu_items?.forEach(item => {
            const category = item.category || 'Other';
            if (!categoryMap.has(category)) {
              categoryMap.set(category, {
                id: category.toLowerCase().replace(/\s+/g, '-'),
                name: category,
                description: `Explore our ${category.toLowerCase()} selection`,
                item_count: 0,
                icon: getCategoryIcon(category)
              });
            }
            categoryMap.get(category).item_count++;
          });
        });

        setCategories(Array.from(categoryMap.values()));
      }

      // Fetch reviews (mock data for now)
      setReviews([
        {
          id: '1',
          user_name: 'Maria Gonzalez',
          rating: 5,
          comment: 'Amazing food and great atmosphere! Highly recommend the pasta dishes.',
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '2',
          user_name: 'John Smith',
          rating: 4,
          comment: 'Good service and decent prices. The pizza was excellent.',
          created_at: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: '3',
          user_name: 'Anna Rossi',
          rating: 5,
          comment: 'Perfect place for a romantic dinner. Will definitely come back!',
          created_at: new Date(Date.now() - 259200000).toISOString()
        }
      ]);

      // Check if bar is in favorites (mock)
      const favorites = JSON.parse(localStorage.getItem('icupa_favorites') || '[]');
      setIsFavorite(favorites.includes(barId));

    } catch (error: any) {
      console.error('Error fetching bar details:', error);
      setError(error.message || 'Failed to load bar details');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string): string => {
    const iconMap: { [key: string]: string } = {
      'Appetizers': '🥗',
      'Main Courses': '🍽️',
      'Pasta': '🍝',
      'Pizza': '🍕',
      'Desserts': '🍰',
      'Beverages': '🥤',
      'Wine': '🍷',
      'Beer': '🍺',
      'Cocktails': '🍸',
      'Coffee': '☕',
      'Other': '🍴'
    };
    return iconMap[category] || '🍴';
  };

  const toggleFavorite = () => {
    if (!barId) return;
    
    const favorites = JSON.parse(localStorage.getItem('icupa_favorites') || '[]');
    let newFavorites;
    
    if (isFavorite) {
      newFavorites = favorites.filter((id: string) => id !== barId);
      toast({
        title: "Removed from favorites",
        description: `${bar?.name} has been removed from your favorites`
      });
    } else {
      newFavorites = [...favorites, barId];
      toast({
        title: "Added to favorites",
        description: `${bar?.name} has been added to your favorites`
      });
    }
    
    localStorage.setItem('icupa_favorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  const shareBar = async () => {
    if (!bar) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: bar.name,
          text: `Check out ${bar.name} - ${bar.description || 'Great food and atmosphere!'}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "The bar link has been copied to your clipboard"
      });
    }
  };

  const navigateToCategory = (categoryId: string) => {
    navigate(`/bars/${barId}/menu/${categoryId}`);
  };

  const openFullMenu = () => {
    navigate(`/menu/${barId}?name=${encodeURIComponent(bar?.name || '')}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header skeleton */}
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded" />
              <Skeleton className="w-48 h-6" />
            </div>
          </div>
        </div>
        
        {/* Content skeleton */}
        <div className="container mx-auto px-4 py-6 space-y-6">
          <Skeleton className="w-full h-64 rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="w-3/4 h-8" />
            <Skeleton className="w-1/2 h-4" />
            <div className="flex gap-2">
              <Skeleton className="w-20 h-6" />
              <Skeleton className="w-24 h-6" />
            </div>
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
            <h3 className="text-lg font-semibold mb-2">Bar Not Found</h3>
            <p className="text-gray-600 mb-4">{error || 'The requested bar could not be found.'}</p>
            <Button onClick={() => navigate('/home')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
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
                onClick={() => navigate(-1)}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold truncate">{bar.name}</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFavorite}
                className="p-2"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={shareBar}
                className="p-2"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Hero Section */}
        <Card className="overflow-hidden">
          <BarPhotoCarousel
            barId={bar.id}
            barName={bar.name}
            height={300}
            autoRotate={true}
            showControls={true}
            showIndicators={true}
          />
          
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">{bar.name}</h2>
                {bar.description && (
                  <p className="text-gray-600 mb-3">{bar.description}</p>
                )}
                
                <div className="flex items-start gap-2 text-gray-600 mb-4">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{bar.address}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 flex-wrap">
                {bar.rating && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    {bar.rating.toFixed(1)}
                  </Badge>
                )}
                {bar.review_count && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {bar.review_count} reviews
                  </Badge>
                )}
                {bar.price_range && (
                  <Badge variant="outline">
                    {bar.price_range}
                  </Badge>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={openFullMenu}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                  disabled={!bar.has_menu}
                >
                  <Menu className="w-4 h-4 mr-2" />
                  {bar.has_menu ? 'View Full Menu' : 'Menu Coming Soon'}
                </Button>
                {bar.contact_number && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(`tel:${bar.contact_number}`)}
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
          </TabsList>

          <TabsContent value="menu" className="space-y-4">
            {categories.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <Card 
                    key={category.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigateToCategory(category.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl mb-2">{category.icon}</div>
                      <h3 className="font-semibold mb-1">{category.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                      <Badge variant="secondary" className="text-xs">
                        {category.item_count} items
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  Menu categories are not available yet. Check back soon!
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <span>{bar.address}</span>
                </div>
                {bar.contact_number && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <span>{bar.contact_number}</span>
                  </div>
                )}
                {bar.website_url && (
                  <div className="flex items-center gap-3">
                    <ExternalLink className="w-5 h-5 text-gray-500" />
                    <a 
                      href={bar.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-5 h-5 text-gray-500" />
                    <span>Free WiFi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="w-5 h-5 text-gray-500" />
                    <span>Parking Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-gray-500" />
                    <span>Card Payments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span>Open Late</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{review.user_name}</h4>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${
                            i < review.rating 
                              ? 'text-yellow-500 fill-current' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-2">{review.comment}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="photos" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Photo gallery would go here */}
              <div className="text-center py-8 col-span-full">
                <div className="text-6xl mb-4">📸</div>
                <p className="text-gray-600">Photo gallery coming soon!</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BarDetail; 
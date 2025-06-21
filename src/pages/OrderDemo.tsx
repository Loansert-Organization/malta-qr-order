
import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, MessageCircle, ShoppingCart, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AIWaiterChat from '@/components/AIWaiterChat';

const OrderDemo = () => {
  const { slug } = useParams<{ slug: string }>();
  const [cart, setCart] = useState<any[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [guestSessionId] = useState(() => `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // Fetch vendor and menu data
  const { data: vendorData, isLoading } = useQuery({
    queryKey: ['vendor', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select(`
          id,
          name,
          location,
          description,
          menus!inner(
            id,
            name,
            menu_items(*)
          )
        `)
        .eq('slug', slug || 'ta-kris')
        .eq('active', true)
        .eq('menus.active', true)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const menuItems = vendorData?.menus?.[0]?.menu_items || [];

  const addToCart = (item: any) => {
    const quantity = quantities[item.id] || 1;
    const cartItem = { ...item, quantity };
    
    const existingIndex = cart.findIndex(cartItem => cartItem.id === item.id);
    if (existingIndex >= 0) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += quantity;
      setCart(newCart);
    } else {
      setCart([...cart, cartItem]);
    }
    
    setQuantities({ ...quantities, [item.id]: 1 });
  };

  const updateQuantity = (itemId: string, change: number) => {
    const current = quantities[itemId] || 1;
    const newQuantity = Math.max(1, current + change);
    setQuantities({ ...quantities, [itemId]: newQuantity });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (!vendorData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Restaurant Not Found</h2>
          <p className="text-gray-600 mb-4">The restaurant you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button asChild variant="ghost" size="sm">
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="font-bold text-lg">{vendorData.name}</h1>
              <p className="text-sm text-gray-500">{vendorData.location}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChat(!showChat)}
              className="relative"
            >
              <MessageCircle className="h-4 w-4" />
              AI Waiter
            </Button>
            <Button variant="outline" size="sm" className="relative">
              <ShoppingCart className="h-4 w-4" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-blue-600">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Welcome Message */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-amber-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-full">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Welcome to {vendorData.name}!</h2>
                <p className="text-gray-600">Chat with our AI waiter for personalized recommendations, or browse our authentic Maltese menu below.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Grid */}
        <div className="grid gap-6">
          {menuItems.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="md:flex">
                <div className="md:w-48 h-48 md:h-auto">
                  <img
                    src={item.image_url || `https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop`}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-xl font-bold">{item.name}</h3>
                        {item.popular && (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                            <Star className="h-3 w-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{item.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {item.prep_time && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{item.prep_time}</span>
                          </div>
                        )}
                        {item.category && <Badge variant="outline">{item.category}</Badge>}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-blue-600 mb-3">
                        €{parseFloat(item.price).toFixed(2)}
                      </div>
                      <div className="flex items-center space-x-2 mb-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="h-8 w-8 p-0"
                          disabled={(quantities[item.id] || 1) <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="font-medium min-w-[20px] text-center">
                          {quantities[item.id] || 1}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        onClick={() => addToCart(item)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <Card className="mt-8 sticky bottom-4 bg-white shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-lg">Cart Total: €{cartTotal.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">{cartItemCount} items</p>
                </div>
                <Button className="bg-green-600 hover:bg-green-700">
                  Proceed to Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* AI Waiter Chat */}
      {showChat && (
        <AIWaiterChat
          onClose={() => setShowChat(false)}
          onAddToCart={addToCart}
          vendorSlug={slug || 'ta-kris'}
          guestSessionId={guestSessionId}
        />
      )}
    </div>
  );
};

export default OrderDemo;

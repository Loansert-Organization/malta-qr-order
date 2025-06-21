
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, MessageCircle, ShoppingCart, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AIWaiterChat from '@/components/AIWaiterChat';

const OrderDemo = () => {
  const [cart, setCart] = useState<any[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  const menuItems = [
    {
      id: '1',
      name: 'Maltese Ftira',
      description: 'Traditional Maltese bread with tomatoes, olives, capers, and local cheese',
      price: 8.50,
      image: 'photo-1506744038136-46273834b3fb',
      category: 'Mains',
      popular: true,
      prep_time: '15 min'
    },
    {
      id: '2', 
      name: 'Rabbit Stew (Fenkata)',
      description: 'Traditional Maltese rabbit stew with wine, herbs, and vegetables',
      price: 16.00,
      image: 'photo-1500673922987-e212871fec22',
      category: 'Mains',
      popular: true,
      prep_time: '25 min'
    },
    {
      id: '3',
      name: 'Kinnie & Pastizzi',
      description: 'Malta\'s iconic soft drink with traditional pastry filled with ricotta or peas',
      price: 4.50,
      image: 'photo-1461749280684-dccba630e2f6',
      category: 'Snacks',
      prep_time: '5 min'
    },
    {
      id: '4',
      name: 'Gbejniet Salad',
      description: 'Fresh local goat cheese with Mediterranean vegetables and olive oil',
      price: 12.00,
      image: 'photo-1518770660439-4636190af475',
      category: 'Starters',
      prep_time: '10 min'
    }
  ];

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
              <h1 className="font-bold text-lg">Ta' Kris Restaurant</h1>
              <p className="text-sm text-gray-500">Valletta, Malta</p>
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
                <h2 className="font-bold text-lg">Welcome to Ta' Kris!</h2>
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
                    src={`https://images.unsplash.com/${item.image}?w=400&h=300&fit=crop`}
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
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{item.prep_time}</span>
                        </div>
                        <Badge variant="outline">{item.category}</Badge>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-blue-600 mb-3">
                        €{item.price.toFixed(2)}
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
          menuItems={menuItems}
        />
      )}
    </div>
  );
};

export default OrderDemo;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag, User, MapPin, Phone, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const CartPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cart, currentBar, updateQuantity, removeFromCart, clearCart, getCartTotal, getCartItemCount } = useCart();
  
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    table_number: '',
    special_instructions: ''
  });
  
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = async () => {
    if (!currentBar || cart.length === 0) return;

    // Basic validation
    if (!customerInfo.phone && !customerInfo.email && !customerInfo.table_number) {
      toast({
        title: "Contact Information Required",
        description: "Please provide at least one contact method",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare order items
      const orderItems = cart.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price,
        name: item.name
      }));

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          vendor_id: currentBar.id,
          items: orderItems,
          total_amount: getCartTotal(),
          status: 'pending',
          customer_name: customerInfo.name || null,
          customer_phone: customerInfo.phone || null,
          customer_email: customerInfo.email || null,
          table_number: customerInfo.table_number || null,
          special_instructions: customerInfo.special_instructions || null,
          currency: currentBar.currency || (currentBar.country === 'Rwanda' ? 'RWF' : 'EUR'),
          payment_status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Clear cart after successful order
      clearCart();

      // Navigate to order confirmation
      navigate(`/order-confirmation/${order.id}`);

      toast({
        title: "Order Placed Successfully!",
        description: "Your order has been sent to the kitchen",
      });

    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!currentBar || cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-4">Add some delicious items to get started!</p>
          <Button onClick={() => navigate('/client')}>
            Browse Restaurants
          </Button>
        </div>
      </div>
    );
  }

  const currency = currentBar.currency === 'RWF' ? 'RWF' : '€';
  const subtotal = getCartTotal();
  const tax = subtotal * 0.15; // 15% tax
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold">Your Cart</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCart}
              className="text-red-600 hover:text-red-700"
            >
              Clear Cart
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{currentBar.name}</span>
                  <Badge variant="outline">{cart.length} items</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatePresence>
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-start justify-between py-4 border-b last:border-0"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        )}
                        <p className="text-sm font-medium mt-2">
                          {currency} {item.price.toFixed(currency === 'RWF' ? 0 : 2)} each
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3 ml-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-600 hover:text-red-700"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Your Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name (Optional)</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        placeholder="Your name"
                        value={customerInfo.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+250 7XX XXX XXX"
                        value={customerInfo.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={customerInfo.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="table">Table Number</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="table"
                        placeholder="Table number"
                        value={customerInfo.table_number}
                        onChange={(e) => handleInputChange('table_number', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Textarea
                      id="instructions"
                      placeholder="Any allergies or special requests..."
                      value={customerInfo.special_instructions}
                      onChange={(e) => handleInputChange('special_instructions', e.target.value)}
                      className="pl-10 min-h-[80px]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{currency} {subtotal.toFixed(currency === 'RWF' ? 0 : 2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax (15%)</span>
                    <span>{currency} {tax.toFixed(currency === 'RWF' ? 0 : 2)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>{currency} {total.toFixed(currency === 'RWF' ? 0 : 2)}</span>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full mt-6" 
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Place Order'}
                </Button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By placing this order, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage; 
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Edit2, 
  Trash2, 
  Plus, 
  Minus,
  MapPin,
  Clock,
  User,
  Phone,
  MessageSquare,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DeliveryAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  additionalInfo?: string;
}

interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
}

interface OrderSummary {
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  tax: number;
  total: number;
}

const OrderReview = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    email: ''
  });
  
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    street: '',
    city: '',
    postalCode: '',
    country: 'Malta',
    additionalInfo: ''
  });
  
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [estimatedTime, setEstimatedTime] = useState(30);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    // Load saved data from localStorage
    const savedCustomerInfo = localStorage.getItem('icupa_customer_info');
    if (savedCustomerInfo) {
      setCustomerInfo(JSON.parse(savedCustomerInfo));
    }
    
    const savedAddress = localStorage.getItem('icupa_delivery_address');
    if (savedAddress) {
      setDeliveryAddress(JSON.parse(savedAddress));
    }
    
    const savedOrderType = localStorage.getItem('icupa_order_type');
    if (savedOrderType) {
      setOrderType(savedOrderType as 'delivery' | 'pickup');
    }
    
    // Calculate estimated delivery time
    calculateEstimatedTime();
  }, [items]);

  const calculateEstimatedTime = () => {
    // Mock calculation based on order size and complexity
    const baseTime = orderType === 'delivery' ? 45 : 25;
    const itemComplexity = items.reduce((acc, item) => acc + (item.quantity * 5), 0);
    setEstimatedTime(Math.min(baseTime + itemComplexity, 90));
  };

  const calculateOrderSummary = (): OrderSummary => {
    const subtotal = getTotalPrice();
    const deliveryFee = orderType === 'delivery' ? (subtotal > 25 ? 0 : 3.50) : 0;
    const serviceFee = subtotal * 0.05; // 5% service fee
    const tax = (subtotal + deliveryFee + serviceFee) * 0.18; // 18% VAT
    const total = subtotal + deliveryFee + serviceFee + tax;
    
    return {
      subtotal,
      deliveryFee,
      serviceFee,
      tax,
      total
    };
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    // Customer info validation
    if (!customerInfo.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!customerInfo.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(customerInfo.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (customerInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Delivery address validation (only if delivery)
    if (orderType === 'delivery') {
      if (!deliveryAddress.street.trim()) {
        newErrors.street = 'Street address is required';
      }
      if (!deliveryAddress.city.trim()) {
        newErrors.city = 'City is required';
      }
      if (!deliveryAddress.postalCode.trim()) {
        newErrors.postalCode = 'Postal code is required';
      }
    }
    
    // Cart validation
    if (items.length === 0) {
      newErrors.cart = 'Your cart is empty';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToPayment = async () => {
    setIsValidating(true);
    
    if (!validateForm()) {
      setIsValidating(false);
      toast({
        title: "Please fix the errors",
        description: "Check the form for missing or invalid information",
        variant: "destructive"
      });
      return;
    }
    
    // Save data to localStorage
    localStorage.setItem('icupa_customer_info', JSON.stringify(customerInfo));
    localStorage.setItem('icupa_delivery_address', JSON.stringify(deliveryAddress));
    localStorage.setItem('icupa_order_type', orderType);
    localStorage.setItem('icupa_special_instructions', specialInstructions);
    
    // Create order summary for payment
    const orderSummary = calculateOrderSummary();
    const orderData = {
      items,
      customerInfo,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : null,
      orderType,
      specialInstructions,
      summary: orderSummary,
      estimatedTime
    };
    
    localStorage.setItem('icupa_order_data', JSON.stringify(orderData));
    
    setIsValidating(false);
    navigate('/order/payment');
  };

  const handleQuantityChange = (itemId: string, change: number) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    const newQuantity = Math.max(0, item.quantity + change);
    if (newQuantity === 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-4">Add some items to your cart before reviewing your order.</p>
            <Button onClick={() => navigate('/home')}>
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const orderSummary = calculateOrderSummary();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Review Order</h1>
              <p className="text-sm text-gray-600">Step 1 of 2</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Progress Bar */}
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              1
            </div>
            <span className="ml-2 text-sm font-medium">Review</span>
          </div>
          <div className="w-16 h-0.5 bg-gray-300"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">
              2
            </div>
            <span className="ml-2 text-sm text-gray-500">Payment</span>
          </div>
        </div>

        {/* Error Alert */}
        {Object.keys(errors).length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please fix the following errors:
              <ul className="list-disc list-inside mt-2">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Order Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Order Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={orderType === 'delivery' ? 'default' : 'outline'}
                onClick={() => setOrderType('delivery')}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <div className="text-2xl">🚚</div>
                <span>Delivery</span>
                <span className="text-xs opacity-75">45-60 min</span>
              </Button>
              <Button
                variant={orderType === 'pickup' ? 'default' : 'outline'}
                onClick={() => setOrderType('pickup')}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <div className="text-2xl">🏃‍♂️</div>
                <span>Pickup</span>
                <span className="text-xs opacity-75">20-30 min</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <Input
                  placeholder="Your full name"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone *</label>
                <Input
                  placeholder="+356 1234 5678"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email (optional)</label>
              <Input
                type="email"
                placeholder="your.email@example.com"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Delivery Address (only for delivery) */}
        {orderType === 'delivery' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Street Address *</label>
                <Input
                  placeholder="123 Main Street, Apartment 4B"
                  value={deliveryAddress.street}
                  onChange={(e) => setDeliveryAddress(prev => ({ ...prev, street: e.target.value }))}
                  className={errors.street ? 'border-red-500' : ''}
                />
                {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City *</label>
                  <Input
                    placeholder="Valletta"
                    value={deliveryAddress.city}
                    onChange={(e) => setDeliveryAddress(prev => ({ ...prev, city: e.target.value }))}
                    className={errors.city ? 'border-red-500' : ''}
                  />
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Postal Code *</label>
                  <Input
                    placeholder="VLT 1234"
                    value={deliveryAddress.postalCode}
                    onChange={(e) => setDeliveryAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                    className={errors.postalCode ? 'border-red-500' : ''}
                  />
                  {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <Input
                    value={deliveryAddress.country}
                    onChange={(e) => setDeliveryAddress(prev => ({ ...prev, country: e.target.value }))}
                    disabled
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Additional Info</label>
                <Input
                  placeholder="Apartment number, building name, etc."
                  value={deliveryAddress.additionalInfo}
                  onChange={(e) => setDeliveryAddress(prev => ({ ...prev, additionalInfo: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items ({items.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id}>
                {index > 0 && <Separator className="my-4" />}
                <div className="flex items-center gap-4">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/64x64/orange/white?text=?';
                      }}
                    />
                  )}
                  
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-sm text-gray-600">{item.barName}</p>
                    {item.volume && (
                      <p className="text-xs text-gray-500">{item.volume}</p>
                    )}
                    <p className="text-sm font-medium text-green-600">€{item.price}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(item.id, -1)}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="font-semibold min-w-[2rem] text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(item.id, 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold">€{(item.price * item.quantity).toFixed(2)}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Special Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Special Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Any special requests or allergies? (optional)"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>€{orderSummary.subtotal.toFixed(2)}</span>
            </div>
            {orderSummary.deliveryFee > 0 && (
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>€{orderSummary.deliveryFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Service Fee (5%)</span>
              <span>€{orderSummary.serviceFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>VAT (18%)</span>
              <span>€{orderSummary.tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>€{orderSummary.total.toFixed(2)}</span>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Estimated {orderType} time: {estimatedTime} minutes
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/cart')}
            className="flex-1"
          >
            Back to Cart
          </Button>
          <Button
            onClick={handleProceedToPayment}
            disabled={isValidating}
            className="flex-1 bg-orange-500 hover:bg-orange-600"
          >
            {isValidating ? 'Validating...' : `Proceed to Payment (€${orderSummary.total.toFixed(2)})`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderReview; 
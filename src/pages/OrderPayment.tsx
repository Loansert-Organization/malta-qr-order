import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft, 
  CreditCard, 
  Wallet,
  Smartphone,
  Lock,
  Shield,
  Clock,
  Check,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  processingFee: number;
  estimatedTime: string;
}

interface CardDetails {
  number: string;
  expiry: string;
  cvv: string;
  name: string;
}

interface OrderData {
  items: any[];
  customerInfo: any;
  deliveryAddress: any;
  orderType: string;
  specialInstructions: string;
  summary: any;
  estimatedTime: number;
}

const OrderPayment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [showCvv, setShowCvv] = useState(false);
  const [saveCard, setSaveCard] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [securityFeatures, setSecurityFeatures] = useState({
    sslEnabled: true,
    pciCompliant: true,
    fraudProtection: true
  });

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: <CreditCard className="w-5 h-5" />,
      description: 'Visa, Mastercard, American Express',
      processingFee: 0,
      estimatedTime: 'Instant'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: <Wallet className="w-5 h-5" />,
      description: 'Pay with your PayPal account',
      processingFee: 0.30,
      estimatedTime: 'Instant'
    },
    {
      id: 'revolut',
      name: 'Revolut Pay',
      icon: <Smartphone className="w-5 h-5" />,
      description: 'Quick mobile payment',
      processingFee: 0,
      estimatedTime: 'Instant'
    },
    {
      id: 'cash',
      name: 'Cash on Delivery',
      icon: <div className="w-5 h-5 text-center">💵</div>,
      description: 'Pay when you receive your order',
      processingFee: 2.00,
      estimatedTime: 'On delivery'
    }
  ];

  useEffect(() => {
    // Load order data from localStorage
    const savedOrderData = localStorage.getItem('icupa_order_data');
    if (!savedOrderData) {
      toast({
        title: "Order data not found",
        description: "Please review your order first",
        variant: "destructive"
      });
      navigate('/order/review');
      return;
    }
    
    setOrderData(JSON.parse(savedOrderData));
  }, [navigate, toast]);

  const validateCardDetails = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    // Card number validation
    const cardNumber = cardDetails.number.replace(/\s/g, '');
    if (!cardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!/^\d{13,19}$/.test(cardNumber)) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }
    
    // Expiry validation
    if (!cardDetails.expiry) {
      newErrors.expiry = 'Expiry date is required';
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardDetails.expiry)) {
      newErrors.expiry = 'Please enter a valid expiry date (MM/YY)';
    } else {
      const [month, year] = cardDetails.expiry.split('/');
      const currentDate = new Date();
      const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
      if (expiryDate < currentDate) {
        newErrors.expiry = 'Card has expired';
      }
    }
    
    // CVV validation
    if (!cardDetails.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
      newErrors.cvv = 'Please enter a valid CVV';
    }
    
    // Name validation
    if (!cardDetails.name.trim()) {
      newErrors.cardName = 'Cardholder name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const getCardType = (number: string) => {
    const num = number.replace(/\s/g, '');
    if (/^4/.test(num)) return 'Visa';
    if (/^5[1-5]/.test(num)) return 'Mastercard';
    if (/^3[47]/.test(num)) return 'American Express';
    return 'Card';
  };

  const calculateFinalTotal = () => {
    if (!orderData) return 0;
    const method = paymentMethods.find(m => m.id === selectedPaymentMethod);
    return orderData.summary.total + (method?.processingFee || 0);
  };

  const processPayment = async () => {
    if (!orderData) return;
    
    setIsProcessing(true);
    
    try {
      // Validate based on payment method
      if (selectedPaymentMethod === 'card' && !validateCardDetails()) {
        setIsProcessing(false);
        return;
      }
      
      if (!termsAccepted) {
        setErrors({ terms: 'Please accept the terms and conditions' });
        setIsProcessing(false);
        return;
      }
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: orderData.customerInfo.name,
          customer_phone: orderData.customerInfo.phone,
          customer_email: orderData.customerInfo.email,
          delivery_address: orderData.orderType === 'delivery' ? orderData.deliveryAddress : null,
          order_type: orderData.orderType,
          special_instructions: orderData.specialInstructions,
          subtotal: orderData.summary.subtotal,
          delivery_fee: orderData.summary.deliveryFee,
          service_fee: orderData.summary.serviceFee,
          tax: orderData.summary.tax,
          total: calculateFinalTotal(),
          payment_method: selectedPaymentMethod,
          payment_status: 'completed',
          order_status: 'confirmed',
          estimated_delivery_time: new Date(Date.now() + orderData.estimatedTime * 60000).toISOString()
        })
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        special_requests: null
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) {
        console.warn('Error creating order items:', itemsError);
      }
      
      // Clear order data from localStorage
      localStorage.removeItem('icupa_order_data');
      localStorage.removeItem('icupa_customer_info');
      localStorage.removeItem('icupa_delivery_address');
      localStorage.removeItem('icupa_order_type');
      localStorage.removeItem('icupa_special_instructions');
      
      // Save payment method if requested
      if (saveCard && selectedPaymentMethod === 'card') {
        localStorage.setItem('icupa_saved_payment', JSON.stringify({
          type: 'card',
          lastFour: cardDetails.number.slice(-4),
          cardType: getCardType(cardDetails.number),
          name: cardDetails.name
        }));
      }
      
      toast({
        title: "Payment successful!",
        description: "Your order has been confirmed and is being prepared."
      });
      
      // Navigate to success page
      navigate(`/order-success/${order.id}`);
      
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment failed",
        description: error.message || "There was an error processing your payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/order/review')}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Payment</h1>
              <p className="text-sm text-gray-600">Step 2 of 2</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Progress Bar */}
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">
              <Check className="w-4 h-4" />
            </div>
            <span className="ml-2 text-sm font-medium text-green-600">Review</span>
          </div>
          <div className="w-16 h-0.5 bg-green-500"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              2
            </div>
            <span className="ml-2 text-sm font-medium">Payment</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Methods and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Security Features */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>SSL Encrypted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-green-600" />
                    <span>PCI Compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Fraud Protection</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Choose Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value={method.id} id={method.id} />
                      <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {method.icon}
                            <div>
                              <div className="font-medium">{method.name}</div>
                              <div className="text-sm text-gray-600">{method.description}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            {method.processingFee > 0 && (
                              <div className="text-sm text-gray-600">+€{method.processingFee.toFixed(2)}</div>
                            )}
                            <div className="text-xs text-gray-500">{method.estimatedTime}</div>
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Card Details (if card payment selected) */}
            {selectedPaymentMethod === 'card' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Card Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Card Number *</Label>
                    <Input
                      placeholder="1234 5678 9012 3456"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails(prev => ({ 
                        ...prev, 
                        number: formatCardNumber(e.target.value) 
                      }))}
                      className={errors.cardNumber ? 'border-red-500' : ''}
                      maxLength={19}
                    />
                    {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
                    {cardDetails.number && (
                      <p className="text-sm text-gray-600 mt-1">{getCardType(cardDetails.number)}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Expiry Date *</Label>
                      <Input
                        placeholder="MM/YY"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails(prev => ({ 
                          ...prev, 
                          expiry: formatExpiry(e.target.value) 
                        }))}
                        className={errors.expiry ? 'border-red-500' : ''}
                        maxLength={5}
                      />
                      {errors.expiry && <p className="text-red-500 text-sm mt-1">{errors.expiry}</p>}
                    </div>
                    
                    <div>
                      <Label>CVV *</Label>
                      <div className="relative">
                        <Input
                          type={showCvv ? 'text' : 'password'}
                          placeholder="123"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails(prev => ({ 
                            ...prev, 
                            cvv: e.target.value.replace(/\D/g, '').slice(0, 4)
                          }))}
                          className={errors.cvv ? 'border-red-500' : ''}
                          maxLength={4}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowCvv(!showCvv)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
                        >
                          {showCvv ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                      {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Cardholder Name *</Label>
                    <Input
                      placeholder="John Doe"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails(prev => ({ 
                        ...prev, 
                        name: e.target.value 
                      }))}
                      className={errors.cardName ? 'border-red-500' : ''}
                    />
                    {errors.cardName && <p className="text-red-500 text-sm mt-1">{errors.cardName}</p>}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="saveCard"
                      checked={saveCard}
                      onCheckedChange={setSaveCard}
                    />
                    <Label htmlFor="saveCard" className="text-sm">
                      Save this card for future purchases
                    </Label>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Other Payment Method Instructions */}
            {selectedPaymentMethod === 'paypal' && (
              <Alert>
                <Wallet className="h-4 w-4" />
                <AlertDescription>
                  You will be redirected to PayPal to complete your payment securely.
                </AlertDescription>
              </Alert>
            )}

            {selectedPaymentMethod === 'revolut' && (
              <Alert>
                <Smartphone className="h-4 w-4" />
                <AlertDescription>
                  You will be redirected to Revolut Pay to complete your payment.
                </AlertDescription>
              </Alert>
            )}

            {selectedPaymentMethod === 'cash' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please have exact change ready. A processing fee of €2.00 applies for cash payments.
                </AlertDescription>
              </Alert>
            )}

            {/* Terms and Conditions */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={setTermsAccepted}
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed">
                    I agree to the{' '}
                    <button className="text-blue-600 hover:underline">Terms and Conditions</button>
                    {' '}and{' '}
                    <button className="text-blue-600 hover:underline">Privacy Policy</button>.
                    I understand that my order will be prepared according to the estimated time shown.
                  </Label>
                </div>
                {errors.terms && <p className="text-red-500 text-sm mt-2">{errors.terms}</p>}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items Summary */}
                <div className="space-y-2">
                  {orderData.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span>€{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                {/* Cost Breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>€{orderData.summary.subtotal.toFixed(2)}</span>
                  </div>
                  {orderData.summary.deliveryFee > 0 && (
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>€{orderData.summary.deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Service Fee</span>
                    <span>€{orderData.summary.serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT</span>
                    <span>€{orderData.summary.tax.toFixed(2)}</span>
                  </div>
                  {paymentMethods.find(m => m.id === selectedPaymentMethod)?.processingFee! > 0 && (
                    <div className="flex justify-between">
                      <span>Processing Fee</span>
                      <span>€{paymentMethods.find(m => m.id === selectedPaymentMethod)?.processingFee.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>€{calculateFinalTotal().toFixed(2)}</span>
                </div>
                
                {/* Estimated Time */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Estimated {orderData.orderType} time: {orderData.estimatedTime} min
                    </span>
                  </div>
                </div>
                
                {/* Pay Button */}
                <Button
                  onClick={processPayment}
                  disabled={isProcessing || !termsAccepted}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  size="lg"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </div>
                  ) : (
                    `Pay €${calculateFinalTotal().toFixed(2)}`
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPayment; 
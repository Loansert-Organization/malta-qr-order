import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Wallet, 
  Banknote, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X,
  Lock,
  Shield
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay' | 'cash';
  name: string;
  last4?: string;
  expiry?: string;
  isDefault: boolean;
  isVerified: boolean;
}

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (method: PaymentMethod) => void;
  selectedMethod?: PaymentMethod;
}

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedMethod
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCardData, setNewCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
    saveCard: false
  });

  // Mock payment methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      name: 'Visa ending in 4242',
      last4: '4242',
      expiry: '12/25',
      isDefault: true,
      isVerified: true
    },
    {
      id: '2',
      type: 'card',
      name: 'Mastercard ending in 8888',
      last4: '8888',
      expiry: '08/26',
      isDefault: false,
      isVerified: true
    },
    {
      id: '3',
      type: 'paypal',
      name: 'PayPal',
      isDefault: false,
      isVerified: true
    },
    {
      id: '4',
      type: 'apple_pay',
      name: 'Apple Pay',
      isDefault: false,
      isVerified: true
    }
  ]);

  if (!isOpen) return null;

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'card': return <CreditCard className="h-5 w-5" />;
      case 'paypal': return <Wallet className="h-5 w-5" />;
      case 'apple_pay': return <CreditCard className="h-5 w-5" />;
      case 'google_pay': return <CreditCard className="h-5 w-5" />;
      case 'cash': return <Banknote className="h-5 w-5" />;
      default: return <CreditCard className="h-5 w-5" />;
    }
  };

  const getPaymentLabel = (type: string) => {
    switch (type) {
      case 'card': return 'Credit/Debit Card';
      case 'paypal': return 'PayPal';
      case 'apple_pay': return 'Apple Pay';
      case 'google_pay': return 'Google Pay';
      case 'cash': return 'Cash on Delivery';
      default: return 'Payment Method';
    }
  };

  const handleAddCard = () => {
    if (newCardData.number && newCardData.expiry && newCardData.cvv && newCardData.name) {
      const newMethod: PaymentMethod = {
        id: Date.now().toString(),
        type: 'card',
        name: `${newCardData.name} ending in ${newCardData.number.slice(-4)}`,
        last4: newCardData.number.slice(-4),
        expiry: newCardData.expiry,
        isDefault: paymentMethods.length === 0,
        isVerified: true
      };

      setPaymentMethods([...paymentMethods, newMethod]);
      setNewCardData({
        number: '',
        expiry: '',
        cvv: '',
        name: '',
        saveCard: false
      });
      setIsAddingNew(false);
    }
  };

  const handleDeleteMethod = (id: string) => {
    setPaymentMethods(paymentMethods.filter(method => method.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id
    })));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Payment Method</h2>
              <p className="text-muted-foreground">Choose how you'd like to pay</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Security Notice */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-medium text-blue-900">Secure Payment</h4>
                  <p className="text-sm text-blue-700">
                    Your payment information is encrypted and secure
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Existing Payment Methods */}
          <div className="space-y-4">
            <h3 className="font-semibold">Saved Payment Methods</h3>
            <RadioGroup value={selectedMethod?.id} onValueChange={(value) => {
              const method = paymentMethods.find(m => m.id === value);
              if (method) onSelect(method);
            }}>
              {paymentMethods.map((method) => (
                <Card key={method.id} className="cursor-pointer hover:border-primary">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value={method.id} id={method.id} />
                        <div className="flex items-center gap-2">
                          {getPaymentIcon(method.type)}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{method.name}</span>
                              {method.isDefault && (
                                <Badge variant="secondary" className="text-xs">Default</Badge>
                              )}
                              {method.isVerified && (
                                <Badge variant="outline" className="text-xs">
                                  <Check className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {getPaymentLabel(method.type)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!method.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetDefault(method.id);
                            }}
                          >
                            Set Default
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMethod(method.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </RadioGroup>
          </div>

          {/* Add New Payment Method */}
          {!isAddingNew ? (
            <Button
              onClick={() => setIsAddingNew(true)}
              variant="outline"
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Payment Method
            </Button>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Add New Card</CardTitle>
                <CardDescription>
                  Enter your card details securely
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="card-number">Card Number</Label>
                  <Input
                    id="card-number"
                    placeholder="1234 5678 9012 3456"
                    value={newCardData.number}
                    onChange={(e) => setNewCardData({
                      ...newCardData,
                      number: formatCardNumber(e.target.value)
                    })}
                    maxLength={19}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={newCardData.expiry}
                      onChange={(e) => setNewCardData({
                        ...newCardData,
                        expiry: formatExpiry(e.target.value)
                      })}
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={newCardData.cvv}
                      onChange={(e) => setNewCardData({
                        ...newCardData,
                        cvv: e.target.value.replace(/\D/g, '').slice(0, 4)
                      })}
                      maxLength={4}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="card-name">Cardholder Name</Label>
                  <Input
                    id="card-name"
                    placeholder="John Doe"
                    value={newCardData.name}
                    onChange={(e) => setNewCardData({
                      ...newCardData,
                      name: e.target.value
                    })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="save-card"
                    checked={newCardData.saveCard}
                    onCheckedChange={(checked) => setNewCardData({
                      ...newCardData,
                      saveCard: checked as boolean
                    })}
                  />
                  <Label htmlFor="save-card">Save this card for future payments</Label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddCard} className="flex-1">
                    Add Card
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingNew(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cash Option */}
          <Card className="cursor-pointer hover:border-primary">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="cash" id="cash" />
                <div className="flex items-center gap-2">
                  <Banknote className="h-5 w-5" />
                  <div>
                    <span className="font-medium">Cash on Delivery</span>
                    <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={onClose} 
              className="flex-1"
              disabled={!selectedMethod}
            >
              Confirm Payment Method
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodModal; 

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

interface CustomerInfoFormProps {
  customerInfo: CustomerInfo;
  setCustomerInfo: (info: CustomerInfo) => void;
}

const CustomerInfoForm: React.FC<CustomerInfoFormProps> = ({
  customerInfo,
  setCustomerInfo
}) => {
  const handleChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo({
      ...customerInfo,
      [field]: value
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Your Information</h3>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={customerInfo.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Your full name"
            required
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            value={customerInfo.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+356 XXXX XXXX"
            required
          />
        </div>

        <div>
          <Label htmlFor="email">Email (Optional)</Label>
          <Input
            id="email"
            type="email"
            value={customerInfo.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="your@email.com"
          />
        </div>

        <div>
          <Label htmlFor="notes">Special Instructions (Optional)</Label>
          <Textarea
            id="notes"
            value={customerInfo.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Any special requests or dietary requirements..."
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerInfoForm;

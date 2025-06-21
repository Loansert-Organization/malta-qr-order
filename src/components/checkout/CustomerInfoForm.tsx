
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Contact Information</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={customerInfo.name}
            onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
            placeholder="Your name"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            value={customerInfo.phone}
            onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
            placeholder="+356..."
          />
        </div>
      </div>
      <div>
        <Label htmlFor="email">Email (optional)</Label>
        <Input
          id="email"
          type="email"
          value={customerInfo.email}
          onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
          placeholder="your@email.com"
        />
      </div>
      <div>
        <Label htmlFor="notes">Special Notes</Label>
        <Input
          id="notes"
          value={customerInfo.notes}
          onChange={(e) => setCustomerInfo({...customerInfo, notes: e.target.value})}
          placeholder="Any special requests..."
        />
      </div>
    </div>
  );
};

export default CustomerInfoForm;

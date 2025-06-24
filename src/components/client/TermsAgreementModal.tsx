
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Shield } from 'lucide-react';

interface TermsAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
  termsContent?: string;
  privacyContent?: string;
}

const TermsAgreementModal: React.FC<TermsAgreementModalProps> = ({
  isOpen,
  onClose,
  onAgree,
  termsContent,
  privacyContent
}) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');

  const handleAgree = () => {
    if (agreedToTerms && agreedToPrivacy) {
      onAgree();
      onClose();
      // Reset state
      setAgreedToTerms(false);
      setAgreedToPrivacy(false);
    }
  };

  const defaultTerms = `
TERMS AND CONDITIONS

1. ACCEPTANCE OF TERMS
By placing an order through ICUPA Malta, you agree to these terms and conditions.

2. ORDERING AND PAYMENT
- All orders are subject to availability
- Prices are displayed in Euros (EUR)
- Payment must be completed before order preparation begins
- We accept major credit cards and Revolut payments

3. ORDER FULFILLMENT
- Estimated preparation times are approximate
- We will notify you when your order is ready
- Orders must be collected within 30 minutes of notification

4. CANCELLATION POLICY
- Orders can be cancelled within 5 minutes of placement
- Refunds will be processed within 3-5 business days
- No cancellations accepted once preparation has begun

5. LIABILITY
- ICUPA Malta acts as a platform connecting customers with vendors
- Individual vendors are responsible for food quality and preparation
- We are not liable for food allergies or dietary restrictions

6. DATA PROTECTION
- We process your data in accordance with GDPR
- Your information is used solely for order processing
- We do not share personal data with third parties

7. CONTACT
For support or complaints, contact us through the app or email support@icupa.mt
  `;

  const defaultPrivacy = `
PRIVACY POLICY

1. DATA COLLECTION
We collect minimal data necessary for order processing:
- Order details and preferences
- Contact information (email, phone)
- Payment information (processed securely by Stripe/Revolut)

2. DATA USE
Your data is used to:
- Process and fulfill your orders
- Send order status updates
- Improve our service
- Comply with legal requirements

3. DATA SHARING
We do not sell or share your personal data. Limited sharing occurs with:
- Payment processors (Stripe, Revolut) for transaction processing
- Vendors for order fulfillment
- Legal authorities when required by law

4. DATA STORAGE
- Data is stored securely in EU servers
- Order history is retained for 12 months
- You can request data deletion at any time

5. YOUR RIGHTS
Under GDPR, you have the right to:
- Access your personal data
- Correct inaccurate data
- Request data deletion
- Object to data processing
- Data portability

6. COOKIES
We use essential cookies for app functionality. No tracking cookies are used.

7. CONTACT
For privacy concerns: privacy@icupa.mt
  `;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Terms & Privacy Agreement</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('terms')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'terms'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Terms & Conditions
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'privacy'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Privacy Policy
            </button>
          </div>

          {/* Content */}
          <ScrollArea className="h-64 border rounded-lg p-4">
            <pre className="whitespace-pre-wrap text-sm">
              {activeTab === 'terms' 
                ? (termsContent || defaultTerms)
                : (privacyContent || defaultPrivacy)
              }
            </pre>
          </ScrollArea>

          {/* Agreement Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="agree-terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              />
              <Label htmlFor="agree-terms" className="text-sm cursor-pointer">
                I have read and agree to the Terms & Conditions
              </Label>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox
                id="agree-privacy"
                checked={agreedToPrivacy}
                onCheckedChange={(checked) => setAgreedToPrivacy(checked as boolean)}
              />
              <Label htmlFor="agree-privacy" className="text-sm cursor-pointer">
                I have read and agree to the Privacy Policy
              </Label>
            </div>
          </div>

          {/* GDPR Notice */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">GDPR Compliance:</p>
                <p>
                  Your data is processed lawfully under GDPR. You can withdraw consent 
                  or request data deletion at any time through the app settings.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel Order
            </Button>
            <Button
              onClick={handleAgree}
              disabled={!agreedToTerms || !agreedToPrivacy}
              className="flex-1"
            >
              Agree & Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TermsAgreementModal;


import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageCircle, Shield } from 'lucide-react';

interface WhatsAppConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConsent: (phoneNumber: string, consent: boolean) => void;
  defaultPhone?: string;
}

const WhatsAppConsentModal: React.FC<WhatsAppConsentModalProps> = ({
  isOpen,
  onClose,
  onConsent,
  defaultPhone = ''
}) => {
  const [phoneNumber, setPhoneNumber] = useState(defaultPhone);
  const [hasConsent, setHasConsent] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = () => {
    if (hasConsent && phoneNumber && agreedToTerms) {
      onConsent(phoneNumber, true);
    } else {
      onConsent('', false);
    }
    onClose();
    // Reset form
    setPhoneNumber('');
    setHasConsent(false);
    setAgreedToTerms(false);
  };

  const handleSkip = () => {
    onConsent('', false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            <span>WhatsApp Order Updates</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Benefits */}
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Get instant updates via WhatsApp:</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>✓ Order confirmation</li>
              <li>✓ Preparation status updates</li>
              <li>✓ Ready for pickup notification</li>
              <li>✓ No need to keep checking back</li>
            </ul>
          </div>

          {/* Consent Checkbox */}
          <div className="flex items-start space-x-3">
            <Checkbox
              id="whatsapp-consent"
              checked={hasConsent}
              onCheckedChange={(checked) => setHasConsent(checked as boolean)}
            />
            <Label htmlFor="whatsapp-consent" className="text-sm cursor-pointer">
              Yes, I'd like to receive order updates via WhatsApp
            </Label>
          </div>

          {/* Phone Number Input */}
          {hasConsent && (
            <div className="space-y-2">
              <Label htmlFor="phone">WhatsApp Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+356 1234 5678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-xs text-gray-600">
                Include country code (e.g., +356 for Malta)
              </p>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <Shield className="h-4 w-4 text-gray-600 mt-0.5" />
              <div className="text-xs text-gray-700">
                <p className="font-medium mb-1">Privacy Notice:</p>
                <p>
                  Your phone number will only be used for order updates. 
                  We won't share it with third parties or use it for marketing. 
                  You can opt out at any time by replying "STOP".
                </p>
              </div>
            </div>
          </div>

          {/* Terms Agreement */}
          {hasConsent && (
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms-consent"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              />
              <Label htmlFor="terms-consent" className="text-sm cursor-pointer">
                I agree to receive WhatsApp messages and have read the privacy notice
              </Label>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleSkip} className="flex-1">
              Skip for now
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={hasConsent && (!phoneNumber || !agreedToTerms)}
              className="flex-1"
            >
              {hasConsent ? 'Enable Updates' : 'Continue'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppConsentModal;

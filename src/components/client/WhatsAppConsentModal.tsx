import React from 'react';

/* COMMENTED OUT - WhatsApp integration disabled for anonymous auth
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Phone } from 'lucide-react';
*/

interface WhatsAppConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (phone: string, consent: boolean) => void;
}

const WhatsAppConsentModal: React.FC<WhatsAppConsentModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  // ANONYMOUS AUTH - WhatsApp disabled, auto-skip this modal
  React.useEffect(() => {
    if (isOpen) {
      onConfirm('', false); // Skip with no phone and no consent
      onClose();
    }
  }, [isOpen, onClose, onConfirm]);

  return null; // Don't render anything

  /* COMMENTED OUT - Original WhatsApp implementation
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const validatePhone = (value: string) => {
    // Basic phone validation - adjust regex as needed
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(value)) {
      setPhoneError('Please enter a valid phone number');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleConfirm = () => {
    if (phone && validatePhone(phone)) {
      onConfirm(phone, consent);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-green-600" />
            <span>WhatsApp Order Updates</span>
          </CardTitle>
          <CardDescription>
            Get real-time updates about your order status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Get instant updates via WhatsApp:</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Order confirmation</li>
              <li>• Preparation status</li>
              <li>• Ready for pickup notification</li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="whatsapp-consent"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="whatsapp-consent" className="text-sm cursor-pointer">
                Yes, I'd like to receive order updates via WhatsApp
              </Label>
            </div>
          </div>

          {consent && (
            <div className="space-y-2">
              <Label htmlFor="phone">WhatsApp Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (phoneError) validatePhone(e.target.value);
                }}
                placeholder="+356 XXXX XXXX"
                className={phoneError ? 'border-red-500' : ''}
              />
              {phoneError && (
                <p className="text-sm text-red-500">{phoneError}</p>
              )}
              <p className="text-xs text-gray-500">
                We'll only use this for order updates
              </p>
            </div>
          )}

          <div className="text-xs text-gray-500 border-t pt-4">
            <p className="mb-2">Privacy Notice:</p>
            <ul className="space-y-1">
              <li>• Your number will only be used for this order</li>
              <li>• You can opt out at any time</li>
              <li>• Standard messaging rates may apply</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleConfirm}
              disabled={consent && (!phone || !!phoneError)}
              className="flex-1"
            >
              {consent ? 'Continue with WhatsApp Updates' : 'Continue without Updates'}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
            >
              Cancel
            </Button>
          </div>

          {consent && (
            <p className="text-xs text-center text-gray-500">
              By continuing, you agree to receive WhatsApp messages and have read the privacy notice
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
  */
};

export default WhatsAppConsentModal;

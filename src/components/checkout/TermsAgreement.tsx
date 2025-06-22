
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface TermsAgreementProps {
  agreedToTerms: boolean;
  setAgreedToTerms: (agreed: boolean) => void;
}

const TermsAgreement: React.FC<TermsAgreementProps> = ({
  agreedToTerms,
  setAgreedToTerms
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-start space-x-3">
        <Checkbox
          id="terms"
          checked={agreedToTerms}
          onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
        />
        <div className="text-sm">
          <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
            I agree to the{' '}
            <a href="/terms" className="text-blue-600 hover:underline" target="_blank">
              Terms and Conditions
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-blue-600 hover:underline" target="_blank">
              Privacy Policy
            </a>
          </Label>
          <p className="text-gray-500 mt-1">
            Your order will be processed securely and your data will be handled in accordance with GDPR regulations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAgreement;

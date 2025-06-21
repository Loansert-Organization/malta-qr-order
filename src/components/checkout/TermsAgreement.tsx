
import React from 'react';
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
    <div className="flex items-start space-x-2">
      <input
        type="checkbox"
        id="terms"
        checked={agreedToTerms}
        onChange={(e) => setAgreedToTerms(e.target.checked)}
        className="mt-1"
      />
      <Label htmlFor="terms" className="text-sm">
        I agree to the terms and conditions and privacy policy
      </Label>
    </div>
  );
};

export default TermsAgreement;

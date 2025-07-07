
import React from 'react';
import AIWaiterModal from '@/components/ai/AIWaiterModal';
import AIVerificationModal from '@/components/ai/AIVerificationModal';
import { MenuItem as ApiMenuItem } from '@/types/api';
import { MenuItem as DemoMenuItem } from '@/hooks/useOrderDemo/types';

interface AIModalsProps {
  vendorId: string;
  vendorName: string;
  guestSessionId: string;
  showAIWaiter: boolean;
  showAIVerification: boolean;
  onCloseAIWaiter: () => void;
  onCloseAIVerification: () => void;
  onAddToCart: (item: ApiMenuItem | DemoMenuItem) => Promise<void>;
}

const AIModals: React.FC<AIModalsProps> = ({
  vendorId,
  vendorName,
  guestSessionId,
  showAIWaiter,
  showAIVerification,
  onCloseAIWaiter,
  onCloseAIVerification,
  onAddToCart
}) => {
  return (
    <>
      <AIWaiterModal
        isOpen={showAIWaiter}
        onClose={onCloseAIWaiter}
        vendorId={vendorId}
        vendorName={vendorName}
        guestSessionId={guestSessionId}
        onAddToCart={onAddToCart}
      />
      
      <AIVerificationModal
        isOpen={showAIVerification}
        onClose={onCloseAIVerification}
      />
    </>
  );
};

export default AIModals;


import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AIWaiterChat from '../AIWaiterChat';
import AISystemVerification from '../AISystemVerification';

interface AIModalsProps {
  showAIWaiter: boolean;
  showAIVerification: boolean;
  onCloseAIWaiter: () => void;
  onCloseAIVerification: () => void;
  onAddToCart: (item: any) => void;
  vendorSlug: string;
  guestSessionId: string;
}

const AIModals: React.FC<AIModalsProps> = ({
  showAIWaiter,
  showAIVerification,
  onCloseAIWaiter,
  onCloseAIVerification,
  onAddToCart,
  vendorSlug,
  guestSessionId
}) => {
  return (
    <>
      {/* AI Waiter Chat */}
      {showAIWaiter && (
        <AIWaiterChat
          onClose={onCloseAIWaiter}
          onAddToCart={onAddToCart}
          vendorSlug={vendorSlug}
          guestSessionId={guestSessionId}
        />
      )}

      {/* AI System Verification Modal */}
      {showAIVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">AI System Verification</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCloseAIVerification}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
              <AISystemVerification />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIModals;

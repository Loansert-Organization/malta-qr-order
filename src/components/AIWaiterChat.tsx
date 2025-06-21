
import MaltaAIWaiterChat from './ai-waiter/MaltaAIWaiterChat';

interface AIWaiterChatProps {
  onClose: () => void;
  onAddToCart: (item: any) => void;
  vendorSlug: string;
  guestSessionId: string;
}

const AIWaiterChat = ({ onClose, onAddToCart, vendorSlug, guestSessionId }: AIWaiterChatProps) => {
  // Get vendor data for location context
  const vendor = {
    location: 'St. Julian\'s' // This would come from actual vendor data
  };

  return (
    <MaltaAIWaiterChat
      onClose={onClose}
      onAddToCart={onAddToCart}
      vendorSlug={vendorSlug}
      guestSessionId={guestSessionId}
      vendorLocation={vendor.location}
    />
  );
};

export default AIWaiterChat;

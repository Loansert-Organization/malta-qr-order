
import MaltaAIWaiterChat from './ai-waiter/MaltaAIWaiterChat';

interface AIWaiterChatProps {
  onClose: () => void;
  onAddToCart: (item: any) => void;
  vendorSlug: string;
  guestSessionId: string;
}

const AIWaiterChat = ({ onClose, onAddToCart, vendorSlug, guestSessionId }: AIWaiterChatProps) => {
  // Create vendor object to match MaltaAIWaiterChat interface
  const vendor = {
    id: vendorSlug,
    name: vendorSlug,
    location: 'Malta'
  };

  return (
    <MaltaAIWaiterChat
      vendor={vendor}
      onClose={onClose}
      onAddToCart={onAddToCart}
      guestSessionId={guestSessionId}
    />
  );
};

export default AIWaiterChat;

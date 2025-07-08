import MaltaAIWaiterChat from './ai-waiter/MaltaAIWaiterChat';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  is_available?: boolean;
}

interface AIWaiterChatProps {
  onClose: () => void;
  onAddToCart: (item: MenuItem) => void;
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

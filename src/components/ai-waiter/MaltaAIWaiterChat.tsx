import { useState } from 'react';
import { useMaltaAIChat } from '@/hooks/useMaltaAIChat';
import MaltaAIChatContainer from './MaltaAIChatContainer';

interface Vendor {
  id: string;
  name: string;
  location?: string;
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  is_available?: boolean;
}

interface MaltaAIWaiterChatProps {
  vendor: Vendor;
  onClose: () => void;
  onAddToCart?: (item: MenuItem) => void;
  guestSessionId?: string;
}

const MaltaAIWaiterChat = ({ 
  vendor,
  onClose, 
  onAddToCart, 
  guestSessionId 
}: MaltaAIWaiterChatProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'mt' | 'it'>('en');

  const {
    messages,
    input,
    setInput,
    isTyping,
    nearbyBars,
    locationContext,
    sendMessage,
    handleSuggestionAdded
  } = useMaltaAIChat({
    vendorSlug: vendor.name.toLowerCase().replace(/\s+/g, '-'),
    guestSessionId: guestSessionId || 'anonymous',
    vendorLocation: vendor.location,
    selectedLanguage
  });

  return (
    <MaltaAIChatContainer
      onClose={onClose}
      onAddToCart={onAddToCart || (() => {})}
      messages={messages}
      input={input}
      setInput={setInput}
      isTyping={isTyping}
      selectedLanguage={selectedLanguage}
      onLanguageChange={setSelectedLanguage}
      locationContext={locationContext}
      nearbyBars={nearbyBars}
      onSendMessage={sendMessage}
      onSuggestionAdded={handleSuggestionAdded}
    />
  );
};

export default MaltaAIWaiterChat;


import { useState } from 'react';
import { useMaltaAIChat } from '@/hooks/useMaltaAIChat';
import MaltaAIChatContainer from './MaltaAIChatContainer';

interface MaltaAIWaiterChatProps {
  onClose: () => void;
  onAddToCart: (item: any) => void;
  vendorSlug: string;
  guestSessionId: string;
  vendorLocation?: string;
}

const MaltaAIWaiterChat = ({ 
  onClose, 
  onAddToCart, 
  vendorSlug, 
  guestSessionId,
  vendorLocation 
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
    vendorSlug,
    guestSessionId,
    vendorLocation,
    selectedLanguage
  });

  return (
    <MaltaAIChatContainer
      onClose={onClose}
      onAddToCart={onAddToCart}
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

import { Card, CardContent } from '@/components/ui/card';
import AIWaiterHeader from './AIWaiterHeader';
import AIWaiterMessage from './AIWaiterMessage';
import AIWaiterSuggestions from './AIWaiterSuggestions';
import AIWaiterTyping from './AIWaiterTyping';
import AIWaiterInput from './AIWaiterInput';
import MaltaLanguageSelector from './MaltaLanguageSelector';
import LocationAwareBanner from './LocationAwareBanner';
import { Message } from '@/hooks/useMaltaAIChat';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  is_available?: boolean;
}

interface LocationContext {
  area: string;
  nearbyCount: number;
  avgRating: number;
}

interface NearbyBar {
  id: string;
  name: string;
  rating?: number;
  distance?: number;
}

interface MaltaAIChatContainerProps {
  onClose: () => void;
  onAddToCart: (item: MenuItem) => void;
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  isTyping: boolean;
  selectedLanguage: 'en' | 'mt' | 'it';
  onLanguageChange: (language: 'en' | 'mt' | 'it') => void;
  locationContext: LocationContext;
  nearbyBars: NearbyBar[];
  onSendMessage: () => void;
  onSuggestionAdded: (itemName: string) => void;
}

const MaltaAIChatContainer = ({
  onClose,
  onAddToCart,
  messages,
  input,
  setInput,
  isTyping,
  selectedLanguage,
  onLanguageChange,
  locationContext,
  nearbyBars,
  onSendMessage,
  onSuggestionAdded
}: MaltaAIChatContainerProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[85vh] md:h-[700px] flex flex-col">
        <AIWaiterHeader onClose={onClose} />
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Language Selector */}
          <div className="p-3 border-b bg-gradient-to-r from-blue-50 to-purple-50">
            <MaltaLanguageSelector
              selectedLanguage={selectedLanguage}
              onLanguageChange={onLanguageChange}
            />
          </div>

          {/* Location-Aware Banner */}
          {locationContext && (
            <LocationAwareBanner
              locationContext={locationContext}
              nearbyBars={nearbyBars}
              language={selectedLanguage}
            />
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id}>
                <AIWaiterMessage 
                  message={message} 
                  onAddToCart={onAddToCart}
                  onSuggestionAdded={onSuggestionAdded}
                />
                {message.suggestions && message.suggestions.length > 0 && (
                  <AIWaiterSuggestions
                    suggestions={message.suggestions}
                    layoutHints={message.layoutHints}
                    onAddToCart={onAddToCart}
                    onSuggestionAdded={onSuggestionAdded}
                    language={selectedLanguage}
                  />
                )}
              </div>
            ))}

            {isTyping && <AIWaiterTyping language={selectedLanguage} />}
          </div>

          <AIWaiterInput
            input={input}
            setInput={setInput}
            onSendMessage={onSendMessage}
            isTyping={isTyping}
            language={selectedLanguage}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default MaltaAIChatContainer;

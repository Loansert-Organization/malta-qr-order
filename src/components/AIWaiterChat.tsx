
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import AIWaiterHeader from './ai-waiter/AIWaiterHeader';
import AIWaiterMessage from './ai-waiter/AIWaiterMessage';
import AIWaiterSuggestions from './ai-waiter/AIWaiterSuggestions';
import AIWaiterTyping from './ai-waiter/AIWaiterTyping';
import AIWaiterInput from './ai-waiter/AIWaiterInput';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestions?: any[];
  layoutHints?: any;
}

interface AIWaiterChatProps {
  onClose: () => void;
  onAddToCart: (item: any) => void;
  vendorSlug: string;
  guestSessionId: string;
}

const AIWaiterChat = ({ onClose, onAddToCart, vendorSlug, guestSessionId }: AIWaiterChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Bonġu! I'm Kai, your AI waiter powered by advanced AI models. I can help you discover authentic Maltese cuisine, suggest dishes based on your preferences, or answer any questions about our menu. What sounds good to you today?",
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-waiter-chat', {
        body: {
          message: currentInput,
          vendorSlug: vendorSlug,
          guestSessionId: guestSessionId
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        suggestions: data.suggestions || [],
        layoutHints: data.layoutHints || {}
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling AI waiter:', error);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment, or feel free to browse our menu directly!",
        suggestions: []
      };

      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionAdded = (itemName: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Excellent choice! I've added ${itemName} to your cart. The AI models worked together to suggest this perfect match for you. Anything else I can help you with?`
    }]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[80vh] md:h-[600px] flex flex-col">
        <AIWaiterHeader onClose={onClose} />
        
        <CardContent className="flex-1 flex flex-col p-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id}>
                <AIWaiterMessage 
                  message={message} 
                  onAddToCart={onAddToCart}
                  onSuggestionAdded={handleSuggestionAdded}
                />
                {message.suggestions && message.suggestions.length > 0 && (
                  <AIWaiterSuggestions
                    suggestions={message.suggestions}
                    layoutHints={message.layoutHints}
                    onAddToCart={onAddToCart}
                    onSuggestionAdded={handleSuggestionAdded}
                  />
                )}
              </div>
            ))}

            {isTyping && <AIWaiterTyping />}
          </div>

          <AIWaiterInput
            input={input}
            setInput={setInput}
            onSendMessage={sendMessage}
            isTyping={isTyping}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AIWaiterChat;

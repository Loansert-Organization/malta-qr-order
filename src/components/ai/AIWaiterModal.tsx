
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Bot } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { MenuItem } from '@/hooks/useOrderDemo/types';

interface AIWaiterModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorId: string;
  vendorName: string;
  guestSessionId: string;
  onAddToCart: (item: MenuItem) => Promise<void>;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  suggestions?: MenuItem[];
}

const AIWaiterModal: React.FC<AIWaiterModalProps> = ({
  isOpen,
  onClose,
  vendorId,
  vendorName,
  guestSessionId,
  onAddToCart
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hello! I'm Kai, your AI waiter at ${vendorName}. I can help you find the perfect dishes and drinks for your taste. What are you in the mood for today?`
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const { data, error } = await supabase.functions.invoke('malta-ai-waiter', {
        body: {
          message: userMessage,
          vendorSlug: vendorId,
          guestSessionId,
          language: 'en'
        }
      });

      if (error) throw error;

      // Add AI response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        suggestions: data.suggestions || []
      }]);

    } catch (error) {
      console.error('AI Waiter error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble right now. Please try asking again or browse our menu directly.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <span>AI Waiter - Kai</span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold">Suggested items:</p>
                      {message.suggestions.map((item) => (
                        <div key={item.id} className="bg-white p-2 rounded border">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-sm text-gray-900">{item.name}</h4>
                              <p className="text-xs text-gray-600">{item.description}</p>
                              <p className="text-sm font-bold text-blue-600">€{item.price.toFixed(2)}</p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => onAddToCart(item)}
                              className="ml-2"
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex space-x-2 p-4 border-t">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about our menu..."
            disabled={isLoading}
          />
          <Button onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIWaiterModal;

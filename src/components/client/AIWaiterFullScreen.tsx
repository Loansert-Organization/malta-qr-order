
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Mic, MicOff, Loader2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestions?: MenuItem[];
  timestamp: Date;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category?: string;
}

interface AIWaiterFullScreenProps {
  vendorId: string;
  guestSessionId: string;
  onClose: () => void;
  onAddToCart: (item: MenuItem) => void;
}

const AIWaiterFullScreen: React.FC<AIWaiterFullScreenProps> = ({
  vendorId,
  guestSessionId,
  onClose,
  onAddToCart
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Bonġu! I'm Kai, your AI waiter. I can help you discover our menu, suggest dishes based on your preferences, and even consider Malta's weather today. What sounds good to you?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Mock AI response with suggestions
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Based on your request, I'd recommend these authentic Maltese dishes that pair perfectly with our local wines. Each suggestion considers the current weather and time of day for the perfect dining experience.",
        suggestions: [
          {
            id: '1',
            name: 'Maltese Ftira',
            description: 'Traditional sourdough with tomatoes, olives, and local cheese',
            price: 8.50,
            category: 'starters'
          },
          {
            id: '2',
            name: 'Bragioli',
            description: 'Maltese beef olives with herbs and local spices',
            price: 18.50,
            category: 'mains'
          }
        ],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('AI Waiter error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again or browse our menu directly!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceToggle = () => {
    setIsListening(!isListening);
    // Mock voice recognition
    if (!isListening) {
      setTimeout(() => {
        setInput("What's your signature dish?");
        setIsListening(false);
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">K</span>
          </div>
          <div>
            <h1 className="text-white font-semibold">Kai - AI Waiter</h1>
            <p className="text-gray-400 text-sm">Powered by Malta's hospitality AI</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-white'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>

              {/* AI Suggestions */}
              {message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-semibold text-blue-300">AI Recommendations:</p>
                  {message.suggestions.map((item) => (
                    <Card key={item.id} className="bg-gray-700 border-gray-600">
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-white text-sm">{item.name}</h4>
                            <p className="text-xs text-gray-300 mt-1">{item.description}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="text-blue-400 font-semibold">€{item.price.toFixed(2)}</span>
                              {item.category && (
                                <Badge variant="outline" className="text-xs">
                                  {item.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => onAddToCart(item)}
                            className="ml-2 bg-blue-600 hover:bg-blue-700"
                          >
                            Add
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-lg p-3 flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
              <span className="text-gray-300 text-sm">Kai is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about our menu..."
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 pr-12"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={handleVoiceToggle}
              className={`absolute right-1 top-1 h-8 w-8 p-0 ${
                isListening ? 'text-red-400' : 'text-gray-400'
              }`}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIWaiterFullScreen;

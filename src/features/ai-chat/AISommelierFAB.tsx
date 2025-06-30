import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Wine, 
  MessageCircle, 
  Plus,
  AlertTriangle,
  ChefHat,
  Heart
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestedItems?: any[];
}

interface AISommelierDrawerProps {
  className?: string;
}

export const AISommelierDrawer: React.FC<AISommelierDrawerProps> = ({
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { cart, addToCart } = useCart();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sessionId = localStorage.getItem('icupa_session_id') || crypto.randomUUID();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message
      setMessages([{
        id: '1',
        type: 'ai',
        content: "Hello! I'm your AI Sommelier 🍷 I can help you with food pairings, allergen information, and personalized recommendations. What would you like to know about our menu?",
        timestamp: new Date()
      }]);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(
        `${supabase.supabaseUrl}/functions/v1/ai-sommelier`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabase.supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: input,
            sessionId,
            cartItems: cart?.items?.map(item => ({
              name: item.menu_items.name,
              qty: item.qty
            })) || [],
            queryType: detectQueryType(input)
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: result.data.response,
          timestamp: new Date(),
          suggestedItems: result.data.suggestedItems || []
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(result.error || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('AI Sommelier error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I apologize, but I'm having trouble processing your request right now. Please try asking about food pairings, allergens, or menu recommendations!",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const detectQueryType = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('pair') || lowerMessage.includes('wine') || lowerMessage.includes('drink')) {
      return 'pairing';
    }
    if (lowerMessage.includes('allergen') || lowerMessage.includes('allergy')) {
      return 'allergen';
    }
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
      return 'recommendation';
    }
    return 'general';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getMessageIcon = (type: string) => {
    if (type === 'ai') return <Bot className="w-4 h-4" />;
    return <MessageCircle className="w-4 h-4" />;
  };

  const quickQuestions = [
    { text: "What wine pairs with seafood?", icon: Wine },
    { text: "Show me vegan options", icon: Heart },
    { text: "Any allergen-free dishes?", icon: AlertTriangle },
    { text: "What's your chef's special?", icon: ChefHat }
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          className={`fixed bottom-20 right-4 rounded-full w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/25 z-40 ${className}`}
        >
          <Bot className="w-6 h-6" />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <SheetTitle className="flex items-center gap-2 text-white">
              <div className="p-2 bg-white/20 rounded-full">
                <Bot className="w-5 h-5" />
              </div>
              AI Sommelier
              <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
            </SheetTitle>
          </SheetHeader>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="p-4 border-b">
              <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                Quick Questions
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto p-2 justify-start"
                    onClick={() => {
                      setInput(question.text);
                      sendMessage();
                    }}
                  >
                    <question.icon className="w-3 h-3 mr-1" />
                    {question.text}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.type === 'ai' && (
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      {getMessageIcon(message.type)}
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    
                    {/* Suggested Items */}
                    {message.suggestedItems && message.suggestedItems.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <h5 className="text-xs font-semibold opacity-75">
                          Suggested Items:
                        </h5>
                        {message.suggestedItems.map((item) => (
                          <Card key={item.id} className="p-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <h6 className="text-xs font-medium">{item.name}</h6>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {item.price_local} {item.currency}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                className="h-6 w-6 p-0 bg-orange-500 hover:bg-orange-600"
                                onClick={() => addToCart(item.id)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-1 text-xs opacity-50">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                  
                  {message.type === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                      {getMessageIcon(message.type)}
                    </div>
                  )}
                </div>
              ))}
              
              {loading && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about pairings, allergens, or recommendations..."
                disabled={loading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AISommelierDrawer;

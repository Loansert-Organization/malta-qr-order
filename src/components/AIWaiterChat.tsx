
import { useState } from 'react';
import { X, Send, Bot, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

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
      // Call the enhanced multi-AI waiter edge function
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
      
      // Fallback response
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[80vh] md:h-[600px] flex flex-col">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5" />
                <span>Kai - AI Waiter</span>
                <Sparkles className="h-4 w-4 animate-pulse" />
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                Multi-AI Powered
              </Badge>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`flex items-start space-x-2 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`p-2 rounded-full ${message.role === 'user' ? 'bg-blue-600' : 'bg-gradient-to-r from-blue-500 to-purple-600'}`}>
                      {message.role === 'user' ? 
                        <User className="h-4 w-4 text-white" /> : 
                        <Bot className="h-4 w-4 text-white" />
                      }
                    </div>
                    <div className={`p-3 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gradient-to-r from-gray-50 to-blue-50 text-gray-800 border'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>

                  {/* Enhanced Suggestions with Layout Hints */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.suggestions.map((item) => {
                        const cardStyle = message.layoutHints?.cardStyle || 'horizontal';
                        const highlight = message.layoutHints?.highlight || 'popular';
                        const animation = message.layoutHints?.animation || 'subtle';
                        
                        return (
                          <Card 
                            key={item.id} 
                            className={`p-3 hover:shadow-md transition-all duration-300 cursor-pointer border-l-4 border-l-blue-500 ${
                              animation === 'subtle' ? 'hover:scale-[1.02]' : ''
                            }`}
                          >
                            <div className={`flex items-center ${cardStyle === 'vertical' ? 'flex-col' : 'justify-between'}`}>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className="font-medium text-sm">{item.name}</h4>
                                  {item.popular && highlight === 'popular' && (
                                    <Badge variant="secondary" className="text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                                      <Sparkles className="h-3 w-3 mr-1" />
                                      Popular
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 mb-1">{item.description}</p>
                                <p className={`font-bold ${highlight === 'price' ? 'text-xl text-blue-600' : 'text-blue-600'}`}>
                                  €{parseFloat(item.price.toString()).toFixed(2)}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => {
                                  onAddToCart(item);
                                  setMessages(prev => [...prev, {
                                    id: Date.now().toString(),
                                    role: 'assistant',
                                    content: `Excellent choice! I've added ${item.name} to your cart. The AI models worked together to suggest this perfect match for you. Anything else I can help you with?`
                                  }]);
                                }}
                                className="ml-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                              >
                                Add to Cart
                              </Button>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-3 rounded-lg border">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs text-gray-500 ml-2">Multi-AI processing...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Input */}
          <div className="border-t p-4 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about our menu, or tell me what you're craving..."
                className="flex-1 border-2 focus:border-blue-500"
              />
              <Button 
                onClick={sendMessage} 
                disabled={!input.trim() || isTyping}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Powered by GPT-4o, Claude-4 & Gemini Pro working together
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIWaiterChat;

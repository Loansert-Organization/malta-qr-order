
import { useState } from 'react';
import { X, Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestions?: any[];
}

interface AIWaiterChatProps {
  onClose: () => void;
  onAddToCart: (item: any) => void;
  menuItems: any[];
}

const AIWaiterChat = ({ onClose, onAddToCart, menuItems }: AIWaiterChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Bonġu! I'm your AI waiter for Ta' Kris Restaurant. I can help you discover authentic Maltese cuisine, suggest dishes based on your preferences, or answer any questions about our menu. What sounds good to you today?",
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
    setInput('');
    setIsTyping(true);

    // Simulate AI response with menu suggestions
    setTimeout(() => {
      let response = '';
      let suggestions: any[] = [];

      const lowerInput = input.toLowerCase();
      
      if (lowerInput.includes('traditional') || lowerInput.includes('maltese') || lowerInput.includes('local')) {
        response = "For authentic Maltese flavors, I highly recommend our Maltese Ftira and Rabbit Stew (Fenkata). The Ftira is a traditional bread that's perfect for sharing, while our Fenkata is a beloved local dish that's been cooked the same way for generations. Both showcase the true taste of Malta!";
        suggestions = menuItems.filter(item => item.popular);
      } else if (lowerInput.includes('quick') || lowerInput.includes('fast') || lowerInput.includes('snack')) {
        response = "For something quick and delicious, try our Kinnie & Pastizzi combo! It's Malta's most iconic snack - crispy pastries with our famous local soft drink. Perfect for a quick bite that's authentically Maltese.";
        suggestions = menuItems.filter(item => item.category === 'Snacks');
      } else if (lowerInput.includes('vegetarian') || lowerInput.includes('salad') || lowerInput.includes('fresh')) {
        response = "Our Gbejniet Salad is perfect for you! It features fresh local goat cheese (gbejniet) - a Maltese specialty - with Mediterranean vegetables. It's light, fresh, and showcases our local produce beautifully.";
        suggestions = menuItems.filter(item => item.category === 'Starters');
      } else {
        response = "Great choice coming to Ta' Kris! We specialize in authentic Maltese cuisine. Our most popular dishes are the Maltese Ftira and Fenkata (rabbit stew). Would you like to hear about our traditional dishes, or are you looking for something specific?";
        suggestions = menuItems.slice(0, 2);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        suggestions: suggestions
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
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
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <span>AI Waiter - Ta' Kris</span>
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
                    <div className={`p-2 rounded-full ${message.role === 'user' ? 'bg-blue-600' : 'bg-gray-200'}`}>
                      {message.role === 'user' ? 
                        <User className="h-4 w-4 text-white" /> : 
                        <Bot className="h-4 w-4 text-gray-600" />
                      }
                    </div>
                    <div className={`p-3 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>

                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.suggestions.map((item) => (
                        <Card key={item.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-medium text-sm">{item.name}</h4>
                                {item.popular && (
                                  <Badge variant="secondary" className="text-xs">Popular</Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mb-1">{item.description}</p>
                              <p className="font-bold text-blue-600">€{item.price.toFixed(2)}</p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => {
                                onAddToCart(item);
                                setMessages(prev => [...prev, {
                                  id: Date.now().toString(),
                                  role: 'assistant',
                                  content: `Great choice! I've added ${item.name} to your cart. Anything else I can help you with?`
                                }]);
                              }}
                              className="ml-3"
                            >
                              Add to Cart
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-full bg-gray-200">
                    <Bot className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about our menu, or tell me what you're craving..."
                className="flex-1"
              />
              <Button onClick={sendMessage} disabled={!input.trim() || isTyping}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIWaiterChat;

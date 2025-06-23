
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Send, 
  Mic, 
  MicOff, 
  Bot, 
  User,
  Sparkles,
  Plus
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: any[];
}

interface AIWaiterFullScreenProps {
  onBack: () => void;
  onAddToCart: (item: any) => void;
  vendorData: any;
  menuItems: any[];
}

const AIWaiterFullScreen: React.FC<AIWaiterFullScreenProps> = ({
  onBack,
  onAddToCart,
  vendorData,
  menuItems
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: Message = {
      id: '1',
      type: 'ai',
      content: `Hello! I'm your AI waiter for ${vendorData?.business_name || 'this restaurant'}. I can help you find the perfect meal based on your preferences, dietary needs, or mood. What are you in the mood for today?`,
      timestamp: new Date(),
      suggestions: [
        { text: "Something light and healthy", category: "preference" },
        { text: "Best cocktails", category: "drinks" },
        { text: "Local Maltese specialties", category: "local" },
        { text: "I'm feeling adventurous", category: "mood" }
      ]
    };
    setMessages([welcomeMessage]);
  }, [vendorData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiResponse = await generateAIResponse(content);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse.text,
        timestamp: new Date(),
        suggestions: aiResponse.suggestions
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I'm sorry, I'm having trouble processing your request right now. Can you try asking again?",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateAIResponse = async (userInput: string): Promise<{text: string, suggestions?: any[]}> => {
    // Mock AI responses based on user input
    const input = userInput.toLowerCase();
    
    if (input.includes('drink') || input.includes('cocktail') || input.includes('beer')) {
      return {
        text: "Great choice! For drinks, I'd recommend our signature Kinnie Cocktail - it's uniquely Maltese and very refreshing. We also have excellent local wines and craft beers. Would you like something alcoholic or non-alcoholic?",
        suggestions: [
          { id: 1, name: "Kinnie Cocktail", price: 7.50, category: "drinks" },
          { id: 2, name: "Local Wine Selection", price: 6.00, category: "drinks" },
          { id: 3, name: "Craft Beer", price: 4.50, category: "drinks" }
        ]
      };
    }
    
    if (input.includes('healthy') || input.includes('light') || input.includes('salad')) {
      return {
        text: "Perfect! For something light and healthy, I recommend our Mediterranean Salad with fresh local ingredients, or our grilled fish with seasonal vegetables. Both are packed with nutrients and very satisfying.",
        suggestions: [
          { id: 4, name: "Mediterranean Salad", price: 12.00, category: "healthy" },
          { id: 5, name: "Grilled Sea Bass", price: 18.00, category: "healthy" },
          { id: 6, name: "Quinoa Bowl", price: 14.00, category: "healthy" }
        ]
      };
    }
    
    if (input.includes('maltese') || input.includes('local') || input.includes('traditional')) {
      return {
        text: "Excellent! You must try our authentic Maltese specialties. Our Ftira is made fresh daily, and our Pastizzi are a local favorite. For something more substantial, try our Bragioli - it's a traditional beef olive dish.",
        suggestions: [
          { id: 7, name: "Maltese Ftira", price: 8.50, category: "local" },
          { id: 8, name: "Pastizzi Platter", price: 6.00, category: "local" },
          { id: 9, name: "Bragioli", price: 16.00, category: "local" }
        ]
      };
    }
    
    return {
      text: "I'd be happy to help you choose! Could you tell me more about what you're looking for? Are you interested in something specific like appetizers, main courses, or drinks? Or do you have any dietary preferences I should know about?",
      suggestions: [
        { text: "Show me appetizers", category: "category" },
        { text: "I'm vegetarian", category: "dietary" },
        { text: "What's your chef's recommendation?", category: "recommendation" }
      ]
    };
  };

  const handleSuggestionClick = (suggestion: any) => {
    if (suggestion.id) {
      // It's a menu item suggestion
      const message = `Tell me more about the ${suggestion.name}`;
      sendMessage(message);
    } else {
      // It's a text suggestion
      sendMessage(suggestion.text);
    }
  };

  const handleAddToCart = (item: any) => {
    onAddToCart(item);
    
    const confirmMessage: Message = {
      id: Date.now().toString(),
      type: 'ai',
      content: `Great choice! I've added ${item.name} to your cart. Would you like to add anything else or are you ready to check out?`,
      timestamp: new Date(),
      suggestions: [
        { text: "Add a drink", category: "upsell" },
        { text: "Show me desserts", category: "upsell" },
        { text: "I'm ready to order", category: "checkout" }
      ]
    };
    
    setMessages(prev => [...prev, confirmMessage]);
  };

  const startVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold">AI Waiter</h1>
              <p className="text-xs text-gray-400">Malta's Smart Assistant</p>
            </div>
          </div>
          <div className="ml-auto">
            <Badge variant="secondary" className="bg-green-600 text-white">
              <Sparkles className="h-3 w-3 mr-1" />
              Online
            </Badge>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="space-y-2">
            <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-white border border-gray-700'
              }`}>
                <div className="flex items-start space-x-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    message.type === 'user' ? 'bg-blue-700' : 'bg-purple-600'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="h-3 w-3" />
                    ) : (
                      <Bot className="h-3 w-3" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Suggestions */}
            {message.type === 'ai' && message.suggestions && (
              <div className="ml-8 space-y-2">
                {message.suggestions.map((suggestion, index) => (
                  <div key={index}>
                    {suggestion.id ? (
                      // Menu item suggestion
                      <Card className="bg-gray-800 border-gray-700">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-white">{suggestion.name}</h4>
                              <p className="text-green-400 text-sm">€{suggestion.price.toFixed(2)}</p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleAddToCart(suggestion)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      // Text suggestion
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-gray-300 border-gray-600 hover:bg-gray-700"
                      >
                        {suggestion.text}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Bot className="h-4 w-4 text-purple-400" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything about the menu..."
              className="bg-gray-700 border-gray-600 text-white pr-12"
              onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputMessage)}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={startVoiceRecognition}
              disabled={isListening}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>
          <Button
            onClick={() => sendMessage(inputMessage)}
            disabled={!inputMessage.trim() || isTyping}
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


import { Bot, User } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestions?: any[];
  layoutHints?: any;
}

interface AIWaiterMessageProps {
  message: Message;
  onAddToCart: (item: any) => void;
  onSuggestionAdded: (itemName: string) => void;
}

const AIWaiterMessage = ({ message, onAddToCart, onSuggestionAdded }: AIWaiterMessageProps) => {
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
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
      </div>
    </div>
  );
};

export default AIWaiterMessage;


import { Bot } from 'lucide-react';

const AIWaiterTyping = () => {
  return (
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
  );
};

export default AIWaiterTyping;

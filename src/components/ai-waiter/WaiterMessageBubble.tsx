import React from 'react';
import { motion } from 'framer-motion';
import { Check, CheckCheck } from 'lucide-react';

interface WaiterMessageBubbleProps {
  message: string;
  time: string;         // e.g. '18:45'
  isRead?: boolean;
  role?: 'user' | 'assistant';
}

const WaiterMessageBubble: React.FC<WaiterMessageBubbleProps> = ({ 
  message, 
  time, 
  isRead = false,
  role = 'assistant'
}) => {
  const isUser = role === 'user';

  return (
    <motion.div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div
        className={`max-w-xs lg:max-w-md rounded-lg px-4 py-3 text-sm leading-relaxed shadow-md
          ${isUser 
            ? 'bg-orange-500 text-white rounded-br-none' 
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none'
          }
        `}
        aria-label={isUser ? "Your message" : "Waiter message"}
        role="article"
      >
        {/* Message Content */}
        <div className="whitespace-pre-wrap">
          {message}
        </div>
        
        {/* Message Footer */}
        <div className={`flex items-center justify-between mt-2 text-xs ${
          isUser ? 'text-orange-100' : 'text-gray-500 dark:text-gray-400'
        }`}>
          <span>{time}</span>
          
          {/* Read Status for User Messages */}
          {isUser && (
            <div className="flex items-center">
              {isRead ? (
                <CheckCheck className="w-3 h-3 text-orange-200" />
              ) : (
                <Check className="w-3 h-3 text-orange-300" />
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default WaiterMessageBubble; 
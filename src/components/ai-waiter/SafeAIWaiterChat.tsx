import React, { useState, useRef, useEffect } from 'react';
import { AIErrorBoundary } from '@/components/ErrorBoundaries/AIErrorBoundary';
import { useAIService } from '@/hooks/useAIService';
import { useSession } from '@/providers/ConsolidatedSessionProvider';
import MaltaAIWaiterChat from './MaltaAIWaiterChat';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Send, Bot, User } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image_url?: string;
  available: boolean;
}

interface SafeAIWaiterChatProps {
  vendorSlug: string;
  menuItems?: MenuItem[];
  onClose?: () => void;
  onAddToCart: (item: MenuItem) => void;
}

const SafeAIWaiterChat: React.FC<SafeAIWaiterChatProps> = ({ 
  vendorSlug, 
  menuItems, 
  onClose,
  onAddToCart 
}) => {
  const { session } = useSession();
  const aiService = useAIService({
    timeout: 30000,
    retries: 2,
    fallbackMessage: "I apologize, but I'm experiencing technical difficulties. You can still browse the menu manually or try asking me again in a moment."
  });

  // Create vendor object to match MaltaAIWaiterChat interface
  const vendor = {
    id: vendorSlug,
    name: vendorSlug,
    location: 'Malta'
  };

  return (
    <AIErrorBoundary
      onError={(error, errorInfo) => {
        console.error('AI Waiter Error:', error, errorInfo);
      }}
      fallback={
        <div className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">AI Assistant Unavailable</h3>
          <p className="text-gray-600 mb-4">
            Our AI waiter is temporarily unavailable. You can still browse the menu manually.
          </p>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Continue Browsing Menu
            </button>
          )}
        </div>
      }
    >
      <MaltaAIWaiterChat
        vendor={vendor}
        onClose={onClose || (() => {})}
        onAddToCart={onAddToCart}
        guestSessionId={session?.sessionToken || ''}
      />
    </AIErrorBoundary>
  );
};

export default SafeAIWaiterChat;

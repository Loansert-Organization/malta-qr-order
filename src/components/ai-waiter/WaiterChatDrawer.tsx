import React, { useRef, useState } from 'react';
import WaiterMessageBubble from './WaiterMessageBubble';
import TypingDots from './TypingDots';
import { useWaiterSession } from '@/hooks/useWaiterSession';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props { barId: string; open: boolean; onClose: () => void }

const WaiterChatDrawer: React.FC<Props> = ({ barId, open, onClose }) => {
  const { messages, sendMessage, typing } = useWaiterSession(barId);
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(text.trim());
    setText('');
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  return (
    <div
      className={`fixed left-0 right-0 bottom-0 bg-white rounded-t-2xl shadow-lg transition-transform duration-300 z-50 flex flex-col h-[90vh] ${open ? 'translate-y-0' : 'translate-y-full'}`}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Ask Kai-Waiter</h3>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close chat">
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {messages.map((m, i) => (
          <WaiterMessageBubble key={i} msg={m} />
        ))}
        {typing && <TypingDots />}
        <div ref={endRef} />
      </div>
      <div className="p-3 border-t flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none"
          placeholder="Type your message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button onClick={handleSend}>Send</Button>
      </div>
    </div>
  );
};
export default WaiterChatDrawer; 
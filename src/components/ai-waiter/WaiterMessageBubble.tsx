import React from 'react';
import { WaiterMessage } from '@/hooks/useWaiterSession';

const WaiterMessageBubble: React.FC<{ msg: WaiterMessage }> = ({ msg }) => (
  <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div
      className={`max-w-xs rounded-lg px-3 py-2 text-sm leading-5 shadow
        ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-muted'}
      `}
    >
      {msg.content}
    </div>
  </div>
);
export default WaiterMessageBubble; 
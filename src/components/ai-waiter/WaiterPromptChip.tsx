import React, { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';

interface Props { onOpen: () => void }

const WaiterPromptChip: React.FC<Props> = ({ onOpen }) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setShow(true), 10000); // 10s idle
    return () => clearTimeout(id);
  }, []);
  if (!show) return null;
  return (
    <button
      aria-label="Open AI waiter chat"
      className="fixed bottom-4 right-4 z-50 bg-primary text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
      onClick={onOpen}
    >
      <MessageCircle className="h-4 w-4" /> Need a recommendation?
    </button>
  );
};
export default WaiterPromptChip; 

import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface AIWaiterButtonProps {
  onClick: () => void;
}

const AIWaiterButton: React.FC<AIWaiterButtonProps> = ({ onClick }) => {
  return (
    <div className="fixed bottom-6 right-6">
      <Button
        onClick={onClick}
        className="rounded-full h-14 w-14 shadow-lg"
        size="lg"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default AIWaiterButton;

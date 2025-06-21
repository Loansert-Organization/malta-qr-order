
import { X, Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AIWaiterHeaderProps {
  onClose: () => void;
}

const AIWaiterHeader = ({ onClose }: AIWaiterHeaderProps) => {
  return (
    <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-t-lg">
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <span>Kai - AI Waiter</span>
            <Sparkles className="h-4 w-4 animate-pulse" />
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white text-xs">
            Multi-AI Powered
          </Badge>
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
  );
};

export default AIWaiterHeader;

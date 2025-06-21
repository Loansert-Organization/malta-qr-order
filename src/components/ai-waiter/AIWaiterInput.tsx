
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AIWaiterInputProps {
  input: string;
  setInput: (value: string) => void;
  onSendMessage: () => void;
  isTyping: boolean;
  language?: 'en' | 'mt' | 'it';
}

const AIWaiterInput = ({ input, setInput, onSendMessage, isTyping, language = 'en' }: AIWaiterInputProps) => {
  const placeholders = {
    en: "Ask me about our menu, or tell me what you're craving...",
    mt: "Staqsini dwar il-menu tagħna, jew għidli x'tixtieq...",
    it: "Chiedimi del nostro menu, o dimmi cosa desideri..."
  };

  const poweredByTexts = {
    en: 'Powered by GPT-4o, Claude-4 & Gemini Pro working together',
    mt: 'Imħaddem minn GPT-4o, Claude-4 u Gemini Pro li jaħdmu flimkien',
    it: 'Alimentato da GPT-4o, Claude-4 e Gemini Pro che lavorano insieme'
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="border-t p-4 bg-gradient-to-r from-gray-50 to-blue-50">
      <div className="flex space-x-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholders[language]}
          className="flex-1 border-2 focus:border-blue-500"
        />
        <Button 
          onClick={onSendMessage} 
          disabled={!input.trim() || isTyping}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">
        {poweredByTexts[language]}
      </p>
    </div>
  );
};

export default AIWaiterInput;

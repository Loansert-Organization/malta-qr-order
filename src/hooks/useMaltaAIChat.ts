
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestions?: any[];
  layoutHints?: any;
  language?: string;
}

interface UseMaltaAIChatProps {
  vendorSlug: string;
  guestSessionId: string;
  vendorLocation?: string;
  selectedLanguage: 'en' | 'mt' | 'it';
}

export const useMaltaAIChat = ({
  vendorSlug,
  guestSessionId,
  vendorLocation,
  selectedLanguage
}: UseMaltaAIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [nearbyBars, setNearbyBars] = useState<any[]>([]);
  const [locationContext, setLocationContext] = useState<any>(null);

  const initializeChat = () => {
    const welcomeMessages = {
      en: "Bonġu! I'm Kai, your AI waiter powered by advanced AI models. I can help you discover authentic Maltese cuisine, suggest dishes based on your preferences, the weather, and even nearby popular spots. What sounds good to you today?",
      mt: "Bonġu! Jien Kai, il-kellner AI tiegħek. Nista' ngħinek issib l-ikel Malti awtentiku, nissuġġerixxi platti skont il-preferenzi tiegħek, u anke postijiet popolari fil-qrib. X'jogħġbok illum?",
      it: "Bongiorno! Sono Kai, il tuo cameriere AI. Posso aiutarti a scoprire la cucina maltese autentica, suggerire piatti basati sulle tue preferenze e anche posti popolari nelle vicinanze. Cosa ti va oggi?"
    };

    setMessages([{
      id: '1',
      role: 'assistant',
      content: welcomeMessages[selectedLanguage],
      language: selectedLanguage
    }]);
  };

  const loadLocationContext = async () => {
    if (!vendorLocation) return;

    try {
      const { data: bars } = await supabase
        .from('bars')
        .select('*')
        .textSearch('address', vendorLocation)
        .limit(5);

      if (bars) {
        setNearbyBars(bars);
        setLocationContext({
          area: vendorLocation,
          nearbyCount: bars.length,
          avgRating: bars.reduce((acc, bar) => acc + (bar.rating || 0), 0) / bars.length
        });
      }
    } catch (error) {
      console.error('Error loading location context:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      language: selectedLanguage
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke('malta-ai-waiter', {
        body: {
          message: currentInput,
          vendorSlug: vendorSlug,
          guestSessionId: guestSessionId,
          language: selectedLanguage,
          locationContext: {
            vendorLocation,
            nearbyBars: nearbyBars.slice(0, 3),
            area: locationContext?.area
          }
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        suggestions: data.suggestions || [],
        layoutHints: data.layoutHints || {},
        language: selectedLanguage
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling Malta AI waiter:', error);
      
      const errorMessages = {
        en: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment, or feel free to browse our menu directly!",
        mt: "Skużani, għandi problema biex naqbad issa. Jekk jogħġbok ipprova mill-ġdid wara ftit, jew ara l-menu direttament!",
        it: "Mi dispiace, sto avendo problemi di connessione. Riprova tra un momento o sfoglia direttamente il nostro menu!"
      };

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorMessages[selectedLanguage],
        suggestions: [],
        language: selectedLanguage
      };

      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionAdded = (itemName: string) => {
    const confirmationMessages = {
      en: `Excellent choice! I've added ${itemName} to your cart. The AI models worked together to suggest this perfect match for you. Anything else I can help you with?`,
      mt: `Għażla eċċellenti! Żidt ${itemName} fil-cart tiegħek. Il-mudelli AI ħadmu flimkien biex jissuġġerixxu dan l-għażla perfetta għalik. Xi ħaġa oħra li nista' ngħinek biha?`,
      it: `Scelta eccellente! Ho aggiunto ${itemName} al tuo carrello. I modelli AI hanno lavorato insieme per suggerirti questa combinazione perfetta. Posso aiutarti con qualcos'altro?`
    };

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: confirmationMessages[selectedLanguage],
      language: selectedLanguage
    }]);
  };

  useEffect(() => {
    initializeChat();
    loadLocationContext();
  }, [selectedLanguage, vendorLocation]);

  return {
    messages,
    input,
    setInput,
    isTyping,
    nearbyBars,
    locationContext,
    sendMessage,
    handleSuggestionAdded
  };
};

export type { Message };

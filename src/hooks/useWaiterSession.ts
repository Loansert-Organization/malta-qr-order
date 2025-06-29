import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WaiterMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
}

export const useWaiterSession = (barId: string | undefined) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<WaiterMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const eventRef = useRef<EventSource>();

  // ensure session row
  useEffect(() => {
    const ensure = async () => {
      if (!barId) return;
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('ai_waiter_sessions')
        .insert({ bar_id: barId, user_id: user?.id || null })
        .select('id')
        .single();
      if (!error) setSessionId(data.id);
    };
    if (!sessionId && barId) ensure();
  }, [barId, sessionId]);

  const sendMessage = async (content: string) => {
    if (!barId) return;
    setMessages((prev) => [...prev, { role: 'user', content }]);
    setTyping(true);
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('ai_waiter_chat', {
      body: { bar_id: barId, message: content, session_id: sessionId },
    });
    setLoading(false);
    setTyping(false);
    if (error) return;
    if (!sessionId) setSessionId(data.session_id);
    setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
  };

  return { sessionId, messages, sendMessage, loading, typing };
}; 
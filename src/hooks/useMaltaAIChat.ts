import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { 
  AIWaiterLog, 
  AIResponse, 
  MenuItem, 
  ErrorHandler,
  APIResponse 
} from '@/types/api';

interface ChatMessage {
  id: string;
  content: string;
  type: 'user' | 'ai' | 'system';
  timestamp: string;
  processing_time?: number;
  suggestions?: AISuggestion[];
}

interface AISuggestion {
  type: string;
  item_id?: string;
  title: string;
  description: string;
  price?: number;
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  sessionId: string | null;
}

interface UseMaltaAIChatOptions {
  vendorId: string;
  guestSessionId: string;
  onMessageSent?: (message: string) => void;
  onMessageReceived?: (response: string) => void;
  onError?: ErrorHandler;
  autoConnect?: boolean;
}

interface UseMaltaAIChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
  reconnect: () => Promise<void>;
  refreshHistory: () => Promise<void>;
}

export const useMaltaAIChat = ({
  vendorId,
  guestSessionId,
  onMessageSent,
  onMessageReceived,
  onError,
  autoConnect = true
}: UseMaltaAIChatOptions): UseMaltaAIChatReturn => {
  
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    isConnected: false,
    error: null,
    sessionId: null
  });

  // Memoized error handler to prevent unnecessary re-renders
  const handleError = useCallback((error: Error, context: string = 'chat') => {
    console.error(`AI Chat Error [${context}]:`, error);
    setState(prev => ({ 
      ...prev, 
      error: error.message, 
      isLoading: false 
    }));
    
    if (onError) {
      onError(error);
    }
  }, [onError]);

  // Initialize chat session and load history
  const initializeChat = useCallback(async (): Promise<void> => {
    if (!vendorId || !guestSessionId) {
      handleError(new Error('Missing required parameters: vendorId or guestSessionId'), 'init');
      return;
    }

    try {
      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null,
        isConnected: false 
      }));

      // Create or get session
      const sessionId = `chat_${guestSessionId}_${vendorId}_${Date.now()}`;
      
      // Load recent conversation history
      await loadChatHistory(sessionId);
      
      setState(prev => ({ 
        ...prev, 
        sessionId,
        isConnected: true,
        isLoading: false 
      }));

    } catch (error) {
      handleError(
        error instanceof Error ? error : new Error('Failed to initialize chat'),
        'init'
      );
    }
  }, [vendorId, guestSessionId, handleError]);

  // Load chat history from database
  const loadChatHistory = useCallback(async (sessionId: string): Promise<void> => {
    try {
      const { data: logs, error } = await supabase
        .from('ai_waiter_logs')
        .select('*')
        .eq('guest_session_id', guestSessionId)
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        console.warn('Could not load chat history:', error);
        return;
      }

      if (logs && logs.length > 0) {
        const messages: ChatMessage[] = logs.map((log: AIWaiterLog) => ({
          id: log.id,
          content: log.content,
          type: log.message_type === 'user_message' ? 'user' : 
                log.message_type === 'ai_response' ? 'ai' : 'system',
          timestamp: log.created_at,
          processing_time: log.processing_metadata?.processing_time_ms,
          suggestions: []
        }));

        setState(prev => ({ 
          ...prev, 
          messages 
        }));
      }
    } catch (error) {
      console.warn('Failed to load chat history:', error);
      // Don't throw - chat can work without history
    }
  }, [guestSessionId, vendorId]);

  // Send message to AI
  const sendMessage = useCallback(async (message: string): Promise<void> => {
    if (!message.trim()) {
      handleError(new Error('Message cannot be empty'), 'send');
      return;
    }

    if (!state.sessionId) {
      handleError(new Error('Chat session not initialized'), 'send');
      return;
    }

    const messageId = `msg_${Date.now()}`;
    const userMessage: ChatMessage = {
      id: messageId,
      content: message.trim(),
      type: 'user',
      timestamp: new Date().toISOString()
    };

    try {
      // Add user message immediately
      setState(prev => ({ 
        ...prev, 
        messages: [...prev.messages, userMessage],
        isLoading: true,
        error: null
      }));

      // Trigger callback
      if (onMessageSent) {
        onMessageSent(message);
      }

      // Call AI waiter endpoint
      const { data, error } = await supabase.functions.invoke('ai-waiter-chat', {
        body: {
          message: message.trim(),
          vendor_id: vendorId,
          guest_session_id: guestSessionId,
          conversation_context: {
            recent_messages: state.messages.slice(-5),
            session_id: state.sessionId
          }
        }
      });

      if (error) {
        throw new Error(`AI service error: ${error.message}`);
      }

      const aiResponse = data as AIResponse;
      
      if (!aiResponse.success) {
        throw new Error(aiResponse.error || 'AI response indicated failure');
      }

      // Add AI response
      const aiMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        content: aiResponse.response,
        type: 'ai',
        timestamp: new Date().toISOString(),
        processing_time: aiResponse.processing_time_ms,
        suggestions: aiResponse.suggestions || []
      };

      setState(prev => ({ 
        ...prev, 
        messages: [...prev.messages, aiMessage],
        isLoading: false
      }));

      // Trigger callback
      if (onMessageReceived) {
        onMessageReceived(aiResponse.response);
      }

    } catch (error) {
      // Remove the user message on error and add error message
      setState(prev => ({ 
        ...prev, 
        messages: prev.messages.filter(msg => msg.id !== messageId),
        isLoading: false
      }));

      handleError(
        error instanceof Error ? error : new Error('Failed to send message'),
        'send'
      );

      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        content: 'Sorry, I encountered an error. Please try again.',
        type: 'system',
        timestamp: new Date().toISOString()
      };

      setState(prev => ({ 
        ...prev, 
        messages: [...prev.messages, errorMessage]
      }));
    }
  }, [
    state.sessionId, 
    state.messages, 
    vendorId, 
    guestSessionId, 
    onMessageSent, 
    onMessageReceived, 
    handleError
  ]);

  // Clear chat history
  const clearChat = useCallback((): void => {
    setState(prev => ({ 
      ...prev, 
      messages: [],
      error: null
    }));
  }, []);

  // Reconnect to chat service
  const reconnect = useCallback(async (): Promise<void> => {
    setState(prev => ({ 
      ...prev, 
      isConnected: false,
      error: null
    }));
    
    await initializeChat();
  }, [initializeChat]);

  // Refresh chat history
  const refreshHistory = useCallback(async (): Promise<void> => {
    if (state.sessionId) {
      await loadChatHistory(state.sessionId);
    }
  }, [state.sessionId, loadChatHistory]);

  // Auto-initialize on mount and when dependencies change
  useEffect(() => {
    if (autoConnect && vendorId && guestSessionId) {
      initializeChat();
    }
  }, [autoConnect, vendorId, guestSessionId, initializeChat]);

  // Memoized return value to prevent unnecessary re-renders
  return useMemo((): UseMaltaAIChatReturn => ({
    messages: state.messages,
    isLoading: state.isLoading,
    isConnected: state.isConnected,
    error: state.error,
    sendMessage,
    clearChat,
    reconnect,
    refreshHistory
  }), [
    state.messages,
    state.isLoading,
    state.isConnected,
    state.error,
    sendMessage,
    clearChat,
    reconnect,
    refreshHistory
  ]);
};

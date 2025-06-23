
import { useState, useCallback } from 'react';
import { sanitizeAIPrompt } from '@/utils/sanitizeInput';

interface AIServiceOptions {
  timeout?: number;
  retries?: number;
  fallbackMessage?: string;
}

interface AIResponse {
  data: any;
  error: string | null;
  loading: boolean;
}

export const useAIService = (options: AIServiceOptions = {}) => {
  const [response, setResponse] = useState<AIResponse>({
    data: null,
    error: null,
    loading: false
  });

  const {
    timeout = 30000,
    retries = 2,
    fallbackMessage = "I'm sorry, I'm having trouble processing your request right now. Please try again."
  } = options;

  const callAI = useCallback(async (prompt: string, additionalData?: any) => {
    const sanitizedPrompt = sanitizeAIPrompt(prompt);
    
    if (!sanitizedPrompt.trim()) {
      setResponse({
        data: null,
        error: 'Invalid input provided',
        loading: false
      });
      return;
    }

    setResponse(prev => ({ ...prev, loading: true, error: null }));

    let attempt = 0;
    
    while (attempt <= retries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch('/api/ai-service', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: sanitizedPrompt,
            ...additionalData
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`AI Service Error: ${response.status}`);
        }

        const data = await response.json();
        
        setResponse({
          data,
          error: null,
          loading: false
        });
        return;

      } catch (error) {
        attempt++;
        console.warn(`AI service attempt ${attempt} failed:`, error);
        
        if (attempt > retries) {
          setResponse({
            data: { message: fallbackMessage },
            error: error instanceof Error ? error.message : 'AI service unavailable',
            loading: false
          });
        } else {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
  }, [timeout, retries, fallbackMessage]);

  return {
    ...response,
    callAI
  };
};

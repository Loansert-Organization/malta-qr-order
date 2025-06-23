
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnonymousSessionContextType {
  sessionId: string | null;
  loading: boolean;
  isReady: boolean;
}

const AnonymousSessionContext = createContext<AnonymousSessionContextType | undefined>(undefined);

export const useAnonymousSession = () => {
  const context = useContext(AnonymousSessionContext);
  if (context === undefined) {
    throw new Error('useAnonymousSession must be used within an AnonymousSessionProvider');
  }
  return context;
};

export const AnonymousSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeAnonymousSession = async () => {
      try {
        // Get or create anonymous session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.warn('Session error (continuing anonymously):', error);
        }

        // Generate a simple session ID for anonymous tracking
        const anonymousSessionId = session?.access_token || 
          `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        setSessionId(anonymousSessionId);
        setIsReady(true);
        
        console.log('Anonymous session initialized:', anonymousSessionId);
      } catch (error) {
        console.error('Error initializing anonymous session:', error);
        
        if (mounted) {
          // Fallback anonymous session
          const fallbackSessionId = `anon_fallback_${Date.now()}`;
          setSessionId(fallbackSessionId);
          setIsReady(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAnonymousSession();

    return () => {
      mounted = false;
    };
  }, []);

  const value = {
    sessionId,
    loading,
    isReady,
  };

  return (
    <AnonymousSessionContext.Provider value={value}>
      {children}
    </AnonymousSessionContext.Provider>
  );
};


import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SessionData {
  id: string;
  sessionToken: string;
  vendorId?: string;
  createdAt: string;
  lastActivity: string;
  metadata: Record<string, any>;
}

interface SessionContextType {
  session: SessionData | null;
  loading: boolean;
  error: string | null;
  updateSession: (data: Partial<SessionData>) => void;
  clearSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a ConsolidatedSessionProvider');
  }
  return context;
};

interface Props {
  children: ReactNode;
  vendorId?: string;
}

export const ConsolidatedSessionProvider: React.FC<Props> = ({ children, vendorId }) => {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getStoredSessionId = () => {
    return localStorage.getItem('icupa_session_id');
  };

  const createNewSession = () => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('icupa_session_id', sessionId);
    return sessionId;
  };

  const initializeSession = async () => {
    try {
      setLoading(true);
      setError(null);

      let sessionId = getStoredSessionId();
      if (!sessionId) {
        sessionId = createNewSession();
      }

      // Check if session exists in database
      const { data: existingSession, error: fetchError } = await supabase
        .from('guest_sessions')
        .select('*')
        .eq('session_token', sessionId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.warn('Session fetch error:', fetchError);
      }

      let sessionData: SessionData;

      if (existingSession) {
        // Update existing session
        const { error: updateError } = await supabase
          .from('guest_sessions')
          .update({ 
            last_activity: new Date().toISOString(),
            vendor_id: vendorId || existingSession.vendor_id
          })
          .eq('id', existingSession.id);

        if (updateError) {
          console.warn('Session update error:', updateError);
        }

        sessionData = {
          id: existingSession.id,
          sessionToken: existingSession.session_token,
          vendorId: vendorId || existingSession.vendor_id,
          createdAt: existingSession.created_at,
          lastActivity: new Date().toISOString(),
          metadata: existingSession.metadata || {}
        };
      } else {
        // Create new session in database
        const { data: newSession, error: createError } = await supabase
          .from('guest_sessions')
          .insert({
            session_token: sessionId,
            vendor_id: vendorId,
            metadata: { 
              created_from: 'web_app',
              user_agent: navigator.userAgent.slice(0, 100)
            }
          })
          .select()
          .single();

        if (createError) {
          console.warn('Session creation error:', createError);
          // Continue with local session as fallback
        }

        sessionData = {
          id: newSession?.id || sessionId,
          sessionToken: sessionId,
          vendorId: vendorId,
          createdAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          metadata: newSession?.metadata || { fallback: true }
        };
      }

      setSession(sessionData);
    } catch (err) {
      console.error('Session initialization error:', err);
      setError(err instanceof Error ? err.message : 'Session initialization failed');
      
      // Fallback session
      const fallbackSessionId = getStoredSessionId() || createNewSession();
      setSession({
        id: fallbackSessionId,
        sessionToken: fallbackSessionId,
        vendorId: vendorId,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        metadata: { fallback: true }
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSession = (data: Partial<SessionData>) => {
    if (session) {
      const updatedSession = { ...session, ...data };
      setSession(updatedSession);
      
      // Optionally sync to database
      supabase
        .from('guest_sessions')
        .update({
          last_activity: new Date().toISOString(),
          metadata: updatedSession.metadata
        })
        .eq('session_token', session.sessionToken)
        .then(({ error }) => {
          if (error) console.warn('Session update failed:', error);
        });
    }
  };

  const clearSession = () => {
    localStorage.removeItem('icupa_session_id');
    setSession(null);
  };

  useEffect(() => {
    initializeSession();
  }, [vendorId]);

  const value: SessionContextType = {
    session,
    loading,
    error,
    updateSession,
    clearSession
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

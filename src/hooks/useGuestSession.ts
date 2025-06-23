
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getGuestSessionId, ANONYMOUS_UUID } from '@/lib/constants';

interface GuestSession {
  id: string;
  sessionToken: string;
  vendorId: string;
  createdAt: string;
  lastActivity: string;
  metadata: any;
}

export const useGuestSession = (vendorId?: string) => {
  const [guestSession, setGuestSession] = useState<GuestSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeGuestSession = async () => {
      try {
        const sessionToken = getGuestSessionId();
        
        // Check if session exists in database
        const { data: existingSession } = await supabase
          .from('guest_sessions')
          .select('*')
          .eq('session_token', sessionToken)
          .maybeSingle();

        if (existingSession) {
          // Update last activity
          await supabase
            .from('guest_sessions')
            .update({ last_activity: new Date().toISOString() })
            .eq('id', existingSession.id);
          
          setGuestSession(existingSession);
        } else {
          // Create new session
          const { data: newSession, error } = await supabase
            .from('guest_sessions')
            .insert({
              session_token: sessionToken,
              vendor_id: vendorId || ANONYMOUS_UUID,
              metadata: { created_from: 'web_app' }
            })
            .select()
            .single();

          if (error) throw error;
          setGuestSession(newSession);
        }
      } catch (error) {
        console.error('Failed to initialize guest session:', error);
        // Fallback to basic session
        setGuestSession({
          id: getGuestSessionId(),
          sessionToken: getGuestSessionId(),
          vendorId: vendorId || ANONYMOUS_UUID,
          createdAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          metadata: {}
        });
      } finally {
        setLoading(false);
      }
    };

    initializeGuestSession();
  }, [vendorId]);

  return {
    guestSession,
    loading,
    sessionId: guestSession?.sessionToken || getGuestSessionId()
  };
};

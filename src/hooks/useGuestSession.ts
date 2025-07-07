import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

const ANONYMOUS_UUID = '00000000-0000-0000-0000-000000000002';

const getGuestSessionId = () => {
  let sessionId = localStorage.getItem('icupa_guest_session');
  if (!sessionId) {
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('icupa_guest_session', sessionId);
  }
  return sessionId;
};

interface GuestSession {
  id: string;
  sessionToken: string;
  vendorId: string;
  createdAt: string;
  lastActivity: string;
  metadata: Record<string, unknown>;
}

export const useGuestSession = (vendorId?: string) => {
  const [guestSession, setGuestSession] = useState<GuestSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stabilize vendorId to prevent effect re-runs
  const stableVendorId = useMemo(() => vendorId || ANONYMOUS_UUID, [vendorId]);

  useEffect(() => {
    let isMounted = true;

    const initializeGuestSession = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const sessionToken = getGuestSessionId();
        
        // Check if session exists in database
        const { data: existingSession, error: fetchError } = await supabase
          .from('guest_sessions')
          .select('*')
          .eq('session_token', sessionToken)
          .maybeSingle();

        if (fetchError) {
          console.warn('Failed to fetch guest session:', fetchError);
        }

        if (existingSession && isMounted) {
          // Update last activity
          const { error: updateError } = await supabase
            .from('guest_sessions')
            .update({ last_activity: new Date().toISOString() })
            .eq('id', existingSession.id);

          if (updateError) {
            console.warn('Failed to update session activity:', updateError);
          }
          
          // Transform database format to interface format
          const transformedSession: GuestSession = {
            id: existingSession.id,
            sessionToken: existingSession.session_token,
            vendorId: existingSession.vendor_id || stableVendorId,
            createdAt: existingSession.created_at,
            lastActivity: existingSession.last_activity,
            metadata: existingSession.metadata || {}
          };
          
          setGuestSession(transformedSession);
        } else if (isMounted) {
          // Create new session
          const { data: newSession, error: createError } = await supabase
            .from('guest_sessions')
            .insert({
              session_token: sessionToken,
              vendor_id: stableVendorId,
              metadata: { created_from: 'web_app', created_at: new Date().toISOString() }
            })
            .select()
            .single();

          if (createError) {
            console.warn('Failed to create guest session:', createError);
            throw createError;
          }
          
          // Transform database format to interface format
          const transformedSession: GuestSession = {
            id: newSession.id,
            sessionToken: newSession.session_token,
            vendorId: newSession.vendor_id || stableVendorId,
            createdAt: newSession.created_at,
            lastActivity: newSession.last_activity,
            metadata: newSession.metadata || {}
          };
          
          setGuestSession(transformedSession);
        }
      } catch (err) {
        console.error('Failed to initialize guest session:', err);
        
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize session');
          
          // Fallback to basic session
          const fallbackSession: GuestSession = {
            id: getGuestSessionId(),
            sessionToken: getGuestSessionId(),
            vendorId: stableVendorId,
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            metadata: { fallback: true }
          };
          
          setGuestSession(fallbackSession);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeGuestSession();

    return () => {
      isMounted = false;
    };
  }, [stableVendorId]);

  const sessionId = useMemo(() => 
    guestSession?.sessionToken || getGuestSessionId(), 
    [guestSession?.sessionToken]
  );

  return useMemo(() => ({
    guestSession,
    loading,
    error,
    sessionId
  }), [guestSession, loading, error, sessionId]);
};

import { supabase } from '@/integrations/supabase/client';

export interface GuestSession {
  session_id: string;
  vendor_id: string;
  device_fingerprint?: string;
  location_context?: {
    city?: string;
    country?: string;
    timezone?: string;
  };
  interaction_history: Array<{
    timestamp: string;
    action: string;
    item_id?: string;
    category?: string;
    metadata?: any;
  }>;
  preferences: {
    dietary_restrictions?: string[];
    favorite_categories?: string[];
    price_range?: string;
    language?: string;
  };
}

class ContextService {
  private currentSession: GuestSession | null = null;

  async initializeGuestSession(vendorId: string): Promise<GuestSession> {
    const sessionId = this.generateSessionId();
    const deviceFingerprint = await this.generateDeviceFingerprint();
    const locationContext = await this.getLocationContext();

    const session: GuestSession = {
      session_id: sessionId,
      vendor_id: vendorId,
      device_fingerprint: deviceFingerprint,
      location_context: locationContext,
      interaction_history: [],
      preferences: {}
    };

    // Store in Supabase
    await this.saveGuestSession(session);
    
    // Cache locally
    this.currentSession = session;
    localStorage.setItem('icupa_guest_session', JSON.stringify(session));

    return session;
  }

  async getOrCreateGuestSession(vendorId: string): Promise<GuestSession> {
    // Try to get from memory first
    if (this.currentSession && this.currentSession.vendor_id === vendorId) {
      return this.currentSession;
    }

    // Try to get from localStorage
    const cached = localStorage.getItem('icupa_guest_session');
    if (cached) {
      try {
        const session = JSON.parse(cached);
        if (session.vendor_id === vendorId) {
          this.currentSession = session;
          return session;
        }
      } catch (error) {
        console.error('Failed to parse cached session:', error);
      }
    }

    // Create new session
    return await this.initializeGuestSession(vendorId);
  }

  async trackInteraction(action: string, metadata?: any) {
    if (!this.currentSession) return;

    const interaction = {
      timestamp: new Date().toISOString(),
      action,
      ...metadata
    };

    this.currentSession.interaction_history.push(interaction);

    // Keep only last 50 interactions to prevent storage bloat
    if (this.currentSession.interaction_history.length > 50) {
      this.currentSession.interaction_history = this.currentSession.interaction_history.slice(-50);
    }

    // Update localStorage
    localStorage.setItem('icupa_guest_session', JSON.stringify(this.currentSession));

    // Update Supabase asynchronously
    this.updateGuestSession();
  }

  async updatePreferences(preferences: Partial<GuestSession['preferences']>) {
    if (!this.currentSession) return;

    this.currentSession.preferences = {
      ...this.currentSession.preferences,
      ...preferences
    };

    localStorage.setItem('icupa_guest_session', JSON.stringify(this.currentSession));
    await this.updateGuestSession();
  }

  getContextualData() {
    const now = new Date();
    const timeOfDay = this.getTimeOfDay(now);
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });

    return {
      session: this.currentSession,
      time_context: {
        time_of_day: timeOfDay,
        day_of_week: dayOfWeek,
        hour: now.getHours(),
        is_weekend: [0, 6].includes(now.getDay())
      },
      location: this.currentSession?.location_context,
      preferences: this.currentSession?.preferences || {},
      recent_interactions: this.currentSession?.interaction_history.slice(-10) || []
    };
  }

  private async saveGuestSession(session: GuestSession) {
    try {
      await supabase.from('guest_ui_sessions').insert({
        session_id: session.session_id,
        vendor_id: session.vendor_id,
        device_fingerprint: session.device_fingerprint,
        location_context: session.location_context,
        interaction_history: session.interaction_history,
        preferences: session.preferences
      });
    } catch (error) {
      console.error('Failed to save guest session:', error);
    }
  }

  private async updateGuestSession() {
    if (!this.currentSession) return;

    try {
      await supabase
        .from('guest_ui_sessions')
        .update({
          interaction_history: this.currentSession.interaction_history,
          preferences: this.currentSession.preferences,
          updated_at: new Date().toISOString()
        })
        .eq('session_id', this.currentSession.session_id);
    } catch (error) {
      console.error('Failed to update guest session:', error);
    }
  }

  private generateSessionId(): string {
    return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async generateDeviceFingerprint(): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('ICUPA Fingerprint', 10, 10);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  private async getLocationContext() {
    try {
      // Try to get location from IP (using a free service)
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      return {
        city: data.city || 'Malta',
        country: data.country_name || 'Malta',
        timezone: data.timezone || 'Europe/Malta'
      };
    } catch (error) {
      console.error('Failed to get location context:', error);
      return {
        city: 'Malta',
        country: 'Malta',
        timezone: 'Europe/Malta'
      };
    }
  }

  private getTimeOfDay(date: Date): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = date.getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    if (hour < 22) return 'evening';
    return 'night';
  }
}

export const contextService = new ContextService();

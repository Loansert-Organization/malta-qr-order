import { supabase } from '@/integrations/supabase/client';
import { weatherService, WeatherData } from './weatherService';

export interface GuestSession {
  session_id: string;
  vendor_id: string;
  device_fingerprint?: string;
  location_context?: {
    city?: string;
    country?: string;
    timezone?: string;
    coordinates?: { lat: number; lng: number };
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
  weather_context?: WeatherData;
  ai_insights?: {
    predicted_preferences?: string[];
    suggested_items?: string[];
    engagement_score?: number;
  };
}

class ContextService {
  private currentSession: GuestSession | null = null;
  private contextUpdateCallbacks: Set<() => void> = new Set();

  async initializeGuestSession(vendorId: string): Promise<GuestSession> {
    const sessionId = this.generateSessionId();
    const deviceFingerprint = await this.generateDeviceFingerprint();
    const locationContext = await this.getLocationContext();
    const weatherContext = await this.getWeatherContext(locationContext?.city);

    const session: GuestSession = {
      session_id: sessionId,
      vendor_id: vendorId,
      device_fingerprint: deviceFingerprint,
      location_context: locationContext,
      interaction_history: [],
      preferences: {},
      weather_context: weatherContext,
      ai_insights: {
        predicted_preferences: [],
        suggested_items: [],
        engagement_score: 0
      }
    };

    // Store in Supabase
    await this.saveGuestSession(session);
    
    // Cache locally
    this.currentSession = session;
    localStorage.setItem('icupa_guest_session', JSON.stringify(session));

    // Start periodic context updates
    this.startContextUpdates();

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
          // Update weather if it's stale
          await this.refreshWeatherContext();
          return this.currentSession;
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

    // Update AI insights based on interactions
    await this.updateAIInsights();

    // Update localStorage
    localStorage.setItem('icupa_guest_session', JSON.stringify(this.currentSession));

    // Update Supabase asynchronously
    this.updateGuestSession();

    // Notify callbacks
    this.notifyContextUpdate();
  }

  async updatePreferences(preferences: Partial<GuestSession['preferences']>) {
    if (!this.currentSession) return;

    this.currentSession.preferences = {
      ...this.currentSession.preferences,
      ...preferences
    };

    // Update AI insights when preferences change
    await this.updateAIInsights();

    localStorage.setItem('icupa_guest_session', JSON.stringify(this.currentSession));
    await this.updateGuestSession();
    this.notifyContextUpdate();
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
        is_weekend: [0, 6].includes(now.getDay()),
        meal_period: this.getMealPeriod(now.getHours()),
        energy_level: this.getEnergyLevel(now.getHours())
      },
      location: this.currentSession?.location_context,
      preferences: this.currentSession?.preferences || {},
      recent_interactions: this.currentSession?.interaction_history.slice(-10) || [],
      weather: this.currentSession?.weather_context,
      ai_insights: this.currentSession?.ai_insights || {}
    };
  }

  subscribeToContextUpdates(callback: () => void): () => void {
    this.contextUpdateCallbacks.add(callback);
    return () => {
      this.contextUpdateCallbacks.delete(callback);
    };
  }

  private notifyContextUpdate() {
    this.contextUpdateCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in context update callback:', error);
      }
    });
  }

  private async getWeatherContext(city?: string): Promise<WeatherData | null> {
    try {
      return await weatherService.getWeatherData(city || 'Malta');
    } catch (error) {
      console.error('Failed to get weather context:', error);
      return null;
    }
  }

  private async refreshWeatherContext() {
    if (!this.currentSession) return;

    const lastWeatherUpdate = this.currentSession.weather_context ? 
      Date.now() - 30 * 60 * 1000 : 0; // 30 minutes ago

    if (Date.now() - lastWeatherUpdate > 30 * 60 * 1000) {
      const weatherContext = await this.getWeatherContext(
        this.currentSession.location_context?.city
      );
      
      if (weatherContext) {
        this.currentSession.weather_context = weatherContext;
        localStorage.setItem('icupa_guest_session', JSON.stringify(this.currentSession));
        this.notifyContextUpdate();
      }
    }
  }

  private async updateAIInsights() {
    if (!this.currentSession) return;

    const insights = {
      predicted_preferences: this.generatePredictedPreferences(),
      suggested_items: this.generateSuggestedItems(),
      engagement_score: this.calculateEngagementScore()
    };

    this.currentSession.ai_insights = insights;
  }

  private generatePredictedPreferences(): string[] {
    if (!this.currentSession) return [];

    const preferences: string[] = [];
    const interactions = this.currentSession.interaction_history;
    const recentCategories = interactions
      .filter(i => i.category)
      .map(i => i.category)
      .slice(-10);

    // Analyze category preferences
    const categoryCount: { [key: string]: number } = {};
    recentCategories.forEach(cat => {
      if (cat) categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });

    // Add frequently interacted categories
    Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .forEach(([category]) => preferences.push(category));

    // Add weather-based preferences
    if (this.currentSession.weather_context) {
      preferences.push(...this.currentSession.weather_context.recommendations);
    }

    // Add time-based preferences
    const hour = new Date().getHours();
    preferences.push(...this.getTimeBasedPreferences(hour));

    return [...new Set(preferences)]; // Remove duplicates
  }

  private generateSuggestedItems(): string[] {
    // This would ideally use the menu data and AI analysis
    // For now, return some contextual suggestions
    const suggestions: string[] = [];
    const timeOfDay = this.getTimeOfDay(new Date());
    
    if (timeOfDay === 'morning') {
      suggestions.push('Coffee', 'Pastries', 'Breakfast Special');
    } else if (timeOfDay === 'afternoon') {
      suggestions.push('Light Lunch', 'Salads', 'Fresh Juice');
    } else if (timeOfDay === 'evening') {
      suggestions.push('Wine Selection', 'Appetizers', 'Daily Special');
    }

    return suggestions;
  }

  private calculateEngagementScore(): number {
    if (!this.currentSession) return 0;

    const interactions = this.currentSession.interaction_history;
    const recentInteractions = interactions.filter(i => 
      Date.now() - new Date(i.timestamp).getTime() < 30 * 60 * 1000 // Last 30 minutes
    );

    let score = 0;
    
    // Base score from interaction count
    score += Math.min(recentInteractions.length * 10, 50);
    
    // Bonus for variety of actions
    const actionTypes = new Set(recentInteractions.map(i => i.action));
    score += actionTypes.size * 5;
    
    // Bonus for menu interactions
    const menuInteractions = recentInteractions.filter(i => 
      ['view_item', 'add_to_cart', 'category_browse'].includes(i.action)
    );
    score += menuInteractions.length * 3;

    return Math.min(100, score);
  }

  private getTimeBasedPreferences(hour: number): string[] {
    if (hour < 10) return ['breakfast', 'coffee', 'light_bites'];
    if (hour < 15) return ['lunch', 'salads', 'sandwiches'];
    if (hour < 18) return ['afternoon_snacks', 'coffee', 'pastries'];
    if (hour < 22) return ['dinner', 'wine', 'cocktails'];
    return ['late_night', 'bar_snacks', 'cocktails'];
  }

  private getMealPeriod(hour: number): string {
    if (hour < 10) return 'breakfast';
    if (hour < 15) return 'lunch';
    if (hour < 18) return 'afternoon';
    if (hour < 22) return 'dinner';
    return 'late_night';
  }

  private getEnergyLevel(hour: number): 'low' | 'medium' | 'high' {
    if (hour < 6 || hour > 22) return 'low';
    if ((hour >= 10 && hour <= 12) || (hour >= 18 && hour <= 20)) return 'high';
    return 'medium';
  }

  private startContextUpdates() {
    // Update weather every 30 minutes
    setInterval(() => {
      this.refreshWeatherContext();
    }, 30 * 60 * 1000);

    // Update AI insights every 5 minutes if there are recent interactions
    setInterval(() => {
      if (this.currentSession && this.currentSession.interaction_history.length > 0) {
        this.updateAIInsights();
      }
    }, 5 * 60 * 1000);
  }

  private async saveGuestSession(session: GuestSession) {
    try {
      await supabase.from('guest_ui_sessions').insert({
        session_id: session.session_id,
        vendor_id: session.vendor_id,
        device_fingerprint: session.device_fingerprint,
        location_context: session.location_context as any,
        interaction_history: session.interaction_history as any,
        preferences: session.preferences as any
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
          interaction_history: this.currentSession.interaction_history as any,
          preferences: this.currentSession.preferences as any,
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
        timezone: data.timezone || 'Europe/Malta',
        coordinates: {
          lat: data.latitude || 35.9375,
          lng: data.longitude || 14.3754
        }
      };
    } catch (error) {
      console.error('Failed to get location context:', error);
      return {
        city: 'Malta',
        country: 'Malta',
        timezone: 'Europe/Malta',
        coordinates: { lat: 35.9375, lng: 14.3754 }
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

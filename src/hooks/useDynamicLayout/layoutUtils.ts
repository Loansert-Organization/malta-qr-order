import { UnknownRecord } from '@/types/utilities';

interface TimeContext {
  meal_period?: string;
}

interface WeatherContext {
  condition?: string;
}

interface AIInsights {
  engagement_score?: number;
}

interface LayoutContext extends UnknownRecord {
  time_context?: TimeContext;
  weather?: WeatherContext;
  ai_insights?: AIInsights;
  preferences?: UnknownRecord;
}

// Helper function to determine if layout should be regenerated based on context changes
export function shouldRegenerateLayout(oldContext: LayoutContext | null, newContext: LayoutContext | null): boolean {
  if (!oldContext || !newContext) return false;

  // Check for significant time changes (meal period)
  if (oldContext.time_context?.meal_period !== newContext.time_context?.meal_period) {
    return true;
  }

  // Check for weather changes
  if (oldContext.weather?.condition !== newContext.weather?.condition) {
    return true;
  }

  // Check for significant interaction pattern changes
  const oldEngagement = oldContext.ai_insights?.engagement_score || 0;
  const newEngagement = newContext.ai_insights?.engagement_score || 0;
  if (Math.abs(oldEngagement - newEngagement) > 20) {
    return true;
  }

  // Check for preference changes
  const oldPrefs = JSON.stringify(oldContext.preferences || {});
  const newPrefs = JSON.stringify(newContext.preferences || {});
  if (oldPrefs !== newPrefs) {
    return true;
  }

  return false;
}

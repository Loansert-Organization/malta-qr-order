
export interface DynamicLayoutHookReturn {
  layout: any | null;
  loading: boolean;
  error: string | null;
  contextData: any;
  isRealTimeActive: boolean;
  trackInteraction: (action: string, metadata?: any) => Promise<void>;
  updatePreferences: (preferences: any) => Promise<void>;
  triggerLayoutRegeneration: () => Promise<void>;
  refreshLayout: () => Promise<void>;
}

export interface LayoutRegenerationContext {
  session_id?: string;
  location?: string;
  weather?: string;
  user_preferences?: any;
}

import { DynamicLayout } from '@/types/layout';
import { UnknownRecord } from '@/types/utilities';

export interface DynamicLayoutHookReturn {
  layout: DynamicLayout | null;
  loading: boolean;
  error: string | null;
  contextData: UnknownRecord | null;
  isRealTimeActive: boolean;
  trackInteraction: (action: string, metadata?: UnknownRecord) => Promise<void>;
  updatePreferences: (preferences: UnknownRecord) => Promise<void>;
  triggerLayoutRegeneration: () => Promise<void>;
  refreshLayout: () => Promise<void>;
}

export interface LayoutRegenerationContext {
  session_id?: string;
  location?: string;
  weather?: string;
  user_preferences?: UnknownRecord;
}

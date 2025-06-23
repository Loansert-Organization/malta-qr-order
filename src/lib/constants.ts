
// System constants for ICUPA Malta
export const SYSTEM_UUID = '00000000-0000-0000-0000-000000000001';
export const ANONYMOUS_UUID = '00000000-0000-0000-0000-000000000002';

// Order status types matching database enum
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

// AI Model types
export type AIModel = 'gpt-4o' | 'claude-4' | 'gemini-2.5-pro';

// Guest session management
export const generateGuestSessionId = (): string => {
  const existing = localStorage.getItem('icupa_guest_session');
  if (existing) return existing;
  
  const sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('icupa_guest_session', sessionId);
  return sessionId;
};

export const getGuestSessionId = (): string => {
  return localStorage.getItem('icupa_guest_session') || generateGuestSessionId();
};

// Effective session management for anonymous-first architecture
export const getEffectiveSession = () => {
  // This will be used across all components to handle both authenticated and anonymous users
  return {
    guestSessionId: getGuestSessionId(),
    vendorId: SYSTEM_UUID, // Default to system vendor
    isAnonymous: true
  };
};

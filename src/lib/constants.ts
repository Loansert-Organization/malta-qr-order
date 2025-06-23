
export const ANONYMOUS_UUID = '00000000-0000-0000-0000-000000000002';
export const SYSTEM_UUID = '00000000-0000-0000-0000-000000000001';

export const getGuestSessionId = () => {
  let sessionId = localStorage.getItem('icupa_guest_session');
  if (!sessionId) {
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('icupa_guest_session', sessionId);
  }
  return sessionId;
};

export const getAnonymousVendorId = () => {
  return ANONYMOUS_UUID;
};

// Order status type definition
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

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

export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export const COUNTRIES = {
  RWANDA: 'Rwanda',
  MALTA: 'Malta'
} as const;

export const DEFAULT_LOCATIONS = {
  RWANDA: { lat: -1.9441, lng: 30.0619 }, // Kigali
  MALTA: { lat: 35.8989, lng: 14.5146 }   // Valletta
} as const;

export const PAYMENT_METHODS = {
  RWANDA: 'MoMo',
  MALTA: 'Revolut'
} as const;


const CACHE_NAME = 'icupa-malta-v1';
const STATIC_CACHE = 'icupa-static-v1';
const DYNAMIC_CACHE = 'icupa-dynamic-v1';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/order/demo',
  '/vendor',
  '/admin',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// API endpoints to cache with different strategies
const API_CACHE_PATTERNS = [
  '/api/vendors',
  '/api/menu-items',
  '/api/weather'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests with appropriate strategies
  if (request.method === 'GET') {
    // Static assets - Cache First
    if (STATIC_FILES.some(file => url.pathname.includes(file))) {
      event.respondWith(cacheFirst(request));
    }
    // API calls - Network First with cache fallback
    else if (API_CACHE_PATTERNS.some(pattern => url.pathname.includes(pattern))) {
      event.respondWith(networkFirst(request));
    }
    // Supabase calls - Network First for real-time data
    else if (url.hostname.includes('supabase')) {
      event.respondWith(networkFirst(request));
    }
    // AI API calls - Cache for offline, but prefer fresh data
    else if (url.pathname.includes('/functions/v1/')) {
      event.respondWith(staleWhileRevalidate(request));
    }
    // Everything else - Network First
    else {
      event.respondWith(networkFirst(request));
    }
  }
});

// Cache First Strategy - for static assets
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.log('Cache First failed:', error);
    return new Response('Offline - Content not available', { status: 503 });
  }
}

// Network First Strategy - for dynamic content
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.log('Network First fallback to cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Offline - Content not available', { status: 503 });
  }
}

// Stale While Revalidate - for AI responses
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    cache.put(request, networkResponse.clone());
    return networkResponse;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// Background sync for offline orders
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-orders') {
    event.waitUntil(syncOfflineOrders());
  }
});

// Sync offline orders when connection is restored
async function syncOfflineOrders() {
  try {
    const offlineOrders = await getOfflineOrders();
    for (const order of offlineOrders) {
      await submitOrder(order);
      await removeOfflineOrder(order.id);
    }
    console.log('Offline orders synced successfully');
  } catch (error) {
    console.error('Failed to sync offline orders:', error);
  }
}

// Push notifications for order updates
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      data: data.data,
      actions: [
        {
          action: 'view',
          title: 'View Order',
          icon: '/icons/icon-96x96.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/vendor')
    );
  }
});

// Helper functions for offline storage
async function getOfflineOrders() {
  // Implementation would use IndexedDB for offline order storage
  return [];
}

async function submitOrder(order) {
  // Implementation would submit order to Supabase
  return fetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify(order),
    headers: { 'Content-Type': 'application/json' }
  });
}

async function removeOfflineOrder(orderId) {
  // Implementation would remove order from IndexedDB
  return Promise.resolve();
}

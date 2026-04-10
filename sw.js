// Birnes Haven Service Worker
// Version: bump this number every time you update the app
const CACHE_VERSION = 'birnes-haven-v5';

// On install — skip waiting so new SW activates immediately
self.addEventListener('install', e => {
  self.skipWaiting();
});

// On activate — delete ALL old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// On fetch — NEVER cache, always go to network
// Only use cache as fallback if network fails
self.addEventListener('fetch', e => {
  // Skip Google Apps Script requests entirely
  if (e.request.url.includes('script.google.com')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cache a copy for offline fallback
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => {
        // Network failed — try cache
        return caches.match(e.request);
      })
  );
});

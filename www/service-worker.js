const CACHE_NAME = 'ember-cache-v2';
const FILES_TO_CACHE = ['./index.html', './manifest.json', './icon.svg'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});

// Tapping a notification brings the app to the foreground.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('./index.html');
    })
  );
});

// Fires when the background-alerts server (server.js) sends a push message
// through the browser's push service — this runs even if Ember itself is
// fully closed, which is what makes closed-app alerts possible.
self.addEventListener('push', (event) => {
  let data = { title: 'Ember', body: 'You have a reminder.' };
  try {
    if (event.data) data = event.data.json();
  } catch (e) {
    if (event.data) data.body = event.data.text();
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Ember', {
      body: data.body || '',
      icon: 'icon.svg',
      badge: 'icon.svg',
      vibrate: [200, 100, 200],
      requireInteraction: true,
      tag: data.tag || 'ember-alert'
    })
  );
});


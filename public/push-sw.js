

// ── Send notification to all open windows ──────────────────────────
function sendToClients(notification) {
  return clients.matchAll({ type: 'window' }).then(clientList => {
    clientList.forEach(client => {
      client.postMessage({
        type: 'PUSH_NOTIFICATION',
        payload: {
          id: notification.id || Date.now().toString(),
          title: notification.title || 'AgroFlow+ Admin',
          body: notification.body || 'You have a new notification',
          timestamp: notification.timestamp || Date.now(),
          read: false,
          data: notification.data || {}
        }
      });
    });
  });
}

// ── Push event handler ──────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  let data;
  try {
    data = event.data.json();
  } catch (error) {
    console.error('[Push SW Admin] Failed to parse push data:', error);
    return;
  }
  
  const notification = {
    id: data.id || Date.now().toString(),
    title: data.title || 'AgroFlow+ Admin',
    body: data.body || 'You have a new notification',
    timestamp: Date.now(),
    read: false,
    data: {
      url: data.url || '/dashboard',
      tag: data.tag || 'agroflow-admin',
      ...data.data
    }
  };
  
  event.waitUntil(
    Promise.all([
      // Send to all open windows (this stores in localStorage on the client side)
      sendToClients(notification),
      
      // Show system notification
      self.registration.showNotification(notification.title, {
        body: notification.body,
        icon: data.icon || '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: data.tag || 'agroflow-admin',
        data: { url: data.url || '/dashboard' },
        vibrate: [200, 100, 200],
        image: data.image || undefined,
        actions: [
          {
            action: 'open',
            title: 'View',
          },
          {
            action: 'close',
            title: 'Dismiss',
          },
        ],
      })
    ])
  );
});

// ── Notification click handler ──────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/dashboard')
    );
  } else if (event.action === 'close') {
    return;
  } else {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        const url = event.notification.data?.url || '/dashboard';
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});

// ── Message handler for getting stored notifications ──────────────
// Note: This is for communication with the client, not for storing
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'GET_NOTIFICATIONS') {
    // The client will handle localStorage, we just forward the request
    event.ports[0].postMessage({ 
      notifications: [], 
      message: 'Client should manage localStorage' 
    });
  }
});

// ── Log service worker installation ──────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[Push SW Admin] Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Push SW Admin] Activating...');
  event.waitUntil(clients.claim());
});
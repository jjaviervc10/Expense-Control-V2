// sw.js - Service Worker para notificaciones push Expense-Control


self.addEventListener('push', function(event) {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
    if (!payload || typeof payload !== 'object') payload = {};
  } catch (e) {
    payload = {};
  }

  const notification = (payload && payload.notification) ? payload.notification : {
    title: 'Notificación',
    body: 'Tienes una nueva notificación',
    icon: '/logo.png',
    badge: '/badge.png',
    tag: 'default',
  };

  const data = (payload && payload.data) ? payload.data : {};

  // Log para monitorear el evento push
  console.log('[SW] Evento push recibido:', { payload, notification, data });

  event.waitUntil(
    self.registration.showNotification(notification.title, {
      body: notification.body,
      icon: notification.icon,
      badge: notification.badge,
      tag: notification.tag,
      data: data,
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const action = event.notification.data && event.notification.data.action;
  let url = '/';
  if (action === 'openGastos') {
    url = '/gastos';
  } else if (action === 'openDashboard') {
    url = '/dashboard';
  }

  // Log para monitorear el evento de click
  console.log('[SW] Click en notificación:', { action, url, data: event.notification.data });

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          console.log('[SW] Foco a ventana existente:', client.url);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        console.log('[SW] Abriendo nueva ventana:', url);
        return clients.openWindow(url);
      }
    })
  );
});

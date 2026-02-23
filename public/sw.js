// sw.js - Service Worker para notificaciones push Expense-Control

console.log('[SW] 🚀 Service Worker cargado');
console.log('[SW] 📍 Scope:', self.registration.scope);
console.log('[SW] ⏰ Hora de carga:', new Date().toISOString());

self.addEventListener('push', function(event) {
  console.log('[SW] ========== PUSH EVENT RECIBIDO ========== ');
  console.log('[SW] Timestamp:', new Date().toISOString());
  let payload = {};
  try {
    console.log('[SW] Datos del evento:', event.data);
    payload = event.data ? event.data.json() : {};
    console.log('[SW] Payload parseado:', payload);
    if (!payload || typeof payload !== 'object') {
      console.warn('[SW] Payload no es un objeto válido');
      payload = {};
    }
  } catch (e) {
    console.error('[SW] Error al parsear payload:', e);
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

  // Log detallado para monitorear el evento push
  console.log('[SW] 📬 Notificación procesada:', {
    titulo: notification.title,
    cuerpo: notification.body,
    icono: notification.icon,
    tag: notification.tag,
    data: data
  });

  const showNotificationPromise = self.registration.showNotification(notification.title, {
    body: notification.body,
    icon: notification.icon,
    badge: notification.badge,
    tag: notification.tag,
    data: data,
  }).then(() => {
    console.log('[SW] ✅ Notificación mostrada exitosamente');
  }).catch(err => {
    console.error('[SW] ❌ Error al mostrar notificación:', err);
  });
  
  event.waitUntil(showNotificationPromise);
});

self.addEventListener('notificationclick', function(event) {
  console.log('[SW] ========== CLICK EN NOTIFICACIÓN ==========');
  console.log('[SW] Notificación clickeada:', event.notification);
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
      console.log('[SW] Clientes encontrados:', clientList.length);
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          console.log('[SW] ✅ Foco a ventana existente:', client.url);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        console.log('[SW] ✅ Abriendo nueva ventana:', url);
        return clients.openWindow(url);
      }
    }).catch(err => {
      console.error('[SW] ❌ Error al manejar click:', err);
    })
  );
});

// Listener adicional para monitorear el estado del SW
self.addEventListener('activate', (event) => {
  console.log('[SW] ✅ Service Worker activado en:', new Date().toISOString());
  console.log('[SW] 🔔 Listo para recibir notificaciones push');
  event.waitUntil(
    clients.claim().then(() => {
      console.log('[SW] ✅ Todos los clientes reclamados');
      // Verificar suscripción al activar
      return self.registration.pushManager.getSubscription().then(sub => {
        if (sub) {
          console.log('[SW] ✅ Suscripción push activa detectada');
          console.log('[SW] Endpoint:', sub.endpoint);
        } else {
          console.warn('[SW] ⚠️ No hay suscripción push activa');
        }
      });
    })
  );
});

self.addEventListener('install', (event) => {
  console.log('[SW] ✅ Service Worker instalado en:', new Date().toISOString());
  self.skipWaiting();
});

// Listener para errores
self.addEventListener('error', (event) => {
  console.error('[SW] ❌ Error en Service Worker:', event.error);
});

// Listener para unhandled rejections
self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] ❌ Promise rechazada sin manejar:', event.reason);
});

// Listener para pushsubscriptionchange (cuando la suscripción cambia)
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[SW] ⚠️ Suscripción cambió, necesita renovarse');
  console.log('[SW] Suscripción antigua:', event.oldSubscription);
  console.log('[SW] Suscripción nueva:', event.newSubscription);
});

// Listener para verificar si el SW está listo
self.addEventListener('message', (event) => {
  console.log('[SW] 📨 Mensaje recibido del cliente:', event.data);
  
  if (event.data && event.data.type === 'CHECK_SUBSCRIPTION') {
    self.registration.pushManager.getSubscription().then(sub => {
      event.ports[0].postMessage({
        hasSubscription: !!sub,
        endpoint: sub ? sub.endpoint : null,
      });
    });
  }
});

// Verificar estado inicial
console.log('[SW] 🔍 Estado inicial del Service Worker');
console.log('[SW] - self.registration:', typeof self.registration);
console.log('[SW] - pushManager disponible:', typeof self.registration.pushManager !== 'undefined');

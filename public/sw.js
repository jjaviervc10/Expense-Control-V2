// ========================================================================================
// SERVICE WORKER - NOTIFICACIONES PUSH
// Expense Control PWA
// ========================================================================================
// Este Service Worker maneja:
// - Recepción de notificaciones push desde el backend
// - Mostrar notificaciones al usuario
// - Manejar clicks en notificaciones
// - Re-suscripción automática si el endpoint cambia
// ========================================================================================

const SW_VERSION = '2.1.0';
const SW_NAME = 'expense-control-sw';

console.log(`[SW] 🚀 ${SW_NAME} v${SW_VERSION} cargado`);
console.log('[SW] 📍 Scope:', self.registration.scope);
console.log('[SW] ⏰ Hora de carga:', new Date().toISOString());
console.log('[SW] 🌐 Location:', self.location.href);

// ========================================================================================
// EVENTO: PUSH - Recepción de notificación desde el backend
// ========================================================================================
self.addEventListener('push', function(event) {
  console.log('[SW] ========================================');
  console.log('[SW] 📬 PUSH EVENT RECIBIDO');
  console.log('[SW] ========================================');
  console.log('[SW] Timestamp:', new Date().toISOString());
  console.log('[SW] Datos del evento:', event.data);

  let payload = {};
  
  try {
    if (event.data) {
      const rawData = event.data.text();
      console.log('[SW] Datos raw:', rawData);
      payload = JSON.parse(rawData);
      console.log('[SW] ✅ Payload parseado exitosamente:', payload);
    } else {
      console.warn('[SW] ⚠️ Evento push sin datos (data es null)');
    }
  } catch (e) {
    console.error('[SW] ❌ Error al parsear payload:', e);
    console.error('[SW] Datos que causaron error:', event.data ? event.data.text() : 'null');
    payload = {};
  }

  // Extraer configuración de notificación del payload
  const notification = (payload && payload.notification) ? payload.notification : {
    title: 'Control de Gastos',
    body: 'Tienes una nueva notificación',
    icon: '/opcionA.png',
    badge: '/opcionA.png',
    tag: 'default',
  };

  const data = (payload && payload.data) ? payload.data : {};

  console.log('[SW] 📋 Configuración de notificación:', {
    titulo: notification.title,
    cuerpo: notification.body,
    icono: notification.icon,
    tag: notification.tag,
    data: data
  });

  // Mostrar notificación
  const showNotificationPromise = self.registration.showNotification(notification.title, {
    body: notification.body,
    icon: notification.icon || '/opcionA.png',
    badge: notification.badge || '/opcionA.png',
    tag: notification.tag || 'default',
    data: data,
    requireInteraction: false, // No requiere interacción para desaparecer
    vibrate: [200, 100, 200], // Patrón de vibración
  })
  .then(() => {
    console.log('[SW] ✅ Notificación mostrada exitosamente');
    console.log('[SW] ========================================');
  })
  .catch(err => {
    console.error('[SW] ❌ Error al mostrar notificación:', err);
    console.error('[SW] ========================================');
  });
  
  event.waitUntil(showNotificationPromise);
});

// ========================================================================================
// EVENTO: NOTIFICATIONCLICK - Click en una notificación
// ========================================================================================
self.addEventListener('notificationclick', function(event) {
  console.log('[SW] ========================================');
  console.log('[SW] 👆 CLICK EN NOTIFICACIÓN');
  console.log('[SW] ========================================');
  console.log('[SW] Notificación:', event.notification.title);
  console.log('[SW] Tag:', event.notification.tag);
  console.log('[SW] Data:', event.notification.data);
  
  // Cerrar la notificación
  event.notification.close();

  // Determinar URL de destino según el action
  const action = event.notification.data && event.notification.data.action;
  let url = '/'; // Por defecto, ir al home
  
  if (action === 'openGastos') {
    url = '/gastos';
  } else if (action === 'openDashboard') {
    url = '/dashboard';
  } else if (action === 'openAnalisis') {
    url = '/analisis';
  } else if (event.notification.data && event.notification.data.url) {
    // Si viene una URL específica en data, usarla
    url = event.notification.data.url;
  }

  console.log('[SW] 🔗 URL destino:', url);

  // Intentar enfocar ventana existente o abrir nueva
  event.waitUntil(
    clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    })
    .then(function(clientList) {
      console.log('[SW] 📱 Clientes encontrados:', clientList.length);

      // Buscar ventana existente con la URL destino
      for (const client of clientList) {
        const clientPath = new URL(client.url).pathname;
        const targetPath = url;
        
        console.log('[SW] Comparando:', clientPath, 'con', targetPath);
        
        if (clientPath === targetPath && 'focus' in client) {
          console.log('[SW] ✅ Enfocando ventana existente');
          return client.focus();
        }
      }

      // Si hay alguna ventana abierta, navegar en ella
      if (clientList.length > 0 && 'navigate' in clientList[0]) {
        console.log('[SW] ✅ Navegando en ventana existente');
        return clientList[0].navigate(url).then(client => client.focus());
      }
      
      // Si no hay ventanas abiertas, abrir nueva
      if (clients.openWindow) {
        console.log('[SW] ✅ Abriendo nueva ventana');
        return clients.openWindow(url);
      }
    })
    .catch(err => {
      console.error('[SW] ❌ Error al manejar click:', err);
    })
  );
});

// ========================================================================================
// EVENTO: INSTALL - Instalación del Service Worker
// ========================================================================================
self.addEventListener('install', (event) => {
  console.log('[SW] ========================================');
  console.log('[SW] 📦 INSTALANDO SERVICE WORKER');
  console.log('[SW] ========================================');
  console.log('[SW] Versión:', SW_VERSION);
  console.log('[SW] Timestamp:', new Date().toISOString());
  
  // skipWaiting hace que este SW se active inmediatamente
  // sin esperar a que se cierren todas las pestañas
  self.skipWaiting();
  console.log('[SW] ⚡ skipWaiting() llamado - activación inmediata');
});

// ========================================================================================
// EVENTO: ACTIVATE - Activación del Service Worker
// ========================================================================================
self.addEventListener('activate', (event) => {
  console.log('[SW] ========================================');
  console.log('[SW] ✅ SERVICE WORKER ACTIVADO');
  console.log('[SW] ========================================');
  console.log('[SW] Versión:', SW_VERSION);
  console.log('[SW] Timestamp:', new Date().toISOString());
  console.log('[SW] 🔔 Listo para recibir notificaciones push');
  
  event.waitUntil(
    // Reclamar todos los clientes inmediatamente
    clients.claim()
      .then(() => {
        console.log('[SW] ✅ Todos los clientes reclamados');
        
        // Verificar estado de suscripción push
        return self.registration.pushManager.getSubscription();
      })
      .then(sub => {
        if (sub) {
          console.log('[SW] ✅ Suscripción push activa detectada');
          console.log('[SW] Endpoint:', sub.endpoint.substring(0, 60) + '...');
          console.log('[SW] Expiración:', sub.expirationTime || 'Sin expiración');
        } else {
          console.warn('[SW] ⚠️ No hay suscripción push activa');
          console.warn('[SW] El usuario debe activar notificaciones desde la app');
        }
      })
      .catch(err => {
        console.error('[SW] ❌ Error durante activación:', err);
      })
  );
});

// ========================================================================================
// EVENTO: PUSHSUBSCRIPTIONCHANGE - Cambio en la suscripción push
// ========================================================================================
// Este evento se dispara cuando el navegador cambia el endpoint de push
// (ej: cuando FCM renueva el token)
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[SW] ========================================');
  console.log('[SW] ⚠️ SUSCRIPCIÓN PUSH CAMBIÓ');
  console.log('[SW] ========================================');
  console.log('[SW] Timestamp:', new Date().toISOString());
  console.log('[SW] Suscripción antigua:', event.oldSubscription);
  console.log('[SW] Suscripción nueva:', event.newSubscription);
  
  // TODO: Aquí podrías implementar lógica para notificar al backend
  // del nuevo endpoint automáticamente. Por ahora solo logueamos.
  
  if (event.newSubscription) {
    console.log('[SW] ✅ Nueva suscripción disponible');
    console.log('[SW] Nuevo endpoint:', event.newSubscription.endpoint.substring(0, 60) + '...');
  } else {
    console.warn('[SW] ⚠️ No hay nueva suscripción, el usuario debe re-suscribirse');
  }
  
  // Notificar a la ventana activa que debe actualizar la suscripción
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        clientList.forEach(client => {
          client.postMessage({
            type: 'SUBSCRIPTION_CHANGED',
            oldEndpoint: event.oldSubscription?.endpoint,
            newEndpoint: event.newSubscription?.endpoint
          });
        });
      })
  );
});

// ========================================================================================
// EVENTO: MESSAGE - Mensajes desde la aplicación
// ========================================================================================
self.addEventListener('message', (event) => {
  console.log('[SW] 📨 Mensaje recibido del cliente:', event.data);
  
  if (event.data && event.data.type === 'CHECK_SUBSCRIPTION') {
    // La app pregunta si hay suscripción activa
    self.registration.pushManager.getSubscription().then(sub => {
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({
          type: 'SUBSCRIPTION_STATUS',
          hasSubscription: !!sub,
          endpoint: sub ? sub.endpoint : null,
        });
      }
    });
  } else if (event.data && event.data.type === 'SKIP_WAITING') {
    // Forzar activación inmediata
    console.log('[SW] ⚡ Forzando activación inmediata del nuevo SW');
    self.skipWaiting();
  }
});

// ========================================================================================
// MANEJO DE ERRORES
// ========================================================================================
self.addEventListener('error', (event) => {
  console.error('[SW] ========================================');
  console.error('[SW] ❌ ERROR EN SERVICE WORKER');
  console.error('[SW] ========================================');
  console.error('[SW] Error:', event.error);
  console.error('[SW] Mensaje:', event.message);
  console.error('[SW] Filename:', event.filename);
  console.error('[SW] Line:', event.lineno, 'Col:', event.colno);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] ========================================');
  console.error('[SW] ❌ PROMISE RECHAZADA SIN MANEJAR');
  console.error('[SW] ========================================');
  console.error('[SW] Razón:', event.reason);
  console.error('[SW] Promise:', event.promise);
});

// ========================================================================================
// LOG INICIAL DE ESTADO
// ========================================================================================
console.log('[SW] ========================================');
console.log('[SW] 🔍 VERIFICACIÓN INICIAL');
console.log('[SW] ========================================');
console.log('[SW] - self.registration:', typeof self.registration);
console.log('[SW] - Scope:', self.registration.scope);
console.log('[SW] - Service Worker cargado correctamente');
console.log('[SW] ========================================');
console.log('[SW] - pushManager disponible:', typeof self.registration.pushManager !== 'undefined');

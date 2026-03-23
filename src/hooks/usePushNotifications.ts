import { useCallback, useEffect, useState } from 'react';

// ========================
// CONFIGURACIÓN BACKEND
// ========================
// ⚠️ IMPORTANTE: Solo usar backend de PRODUCCIÓN
const API_BASE = "https://expense-control-backend-production-6b4a.up.railway.app";

// ========================
// DETECCIÓN DE DISPOSITIVO
// ========================
/**
 * Detecta el tipo de dispositivo según el backend espera:
 * - 'android': Dispositivos Android móviles (prioridad para FCM)
 * - 'web': Navegadores de escritorio y otros dispositivos
 * 
 * NOTA: El backend usa esta info para routing de notificaciones
 */
function getDeviceType(): 'android' | 'web' {
  const ua = navigator.userAgent;
  // Detectar dispositivos Android específicamente
  if (/Android/i.test(ua)) {
    console.log('[Push] 📱 Dispositivo Android detectado');
    return 'android';
  }
  console.log('[Push] 💻 Dispositivo web detectado');
  return 'web';
}

// ========================
// UTILIDADES
// ========================
/**
 * Convierte clave pública VAPID de base64url a Uint8Array
 * Requerido por la API de PushManager.subscribe()
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Valida y parsea respuesta JSON del backend
 * Evita errores del tipo: "Unexpected token '<'"
 */
async function safeJsonParse(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    console.error('[Push] ❌ Respuesta no es JSON:', text.substring(0, 200));
    throw new Error('El servidor no devolvió JSON válido. Verifica la URL del backend.');
  }
  return response.json();
}

interface UsePushNotifications {
  permission: NotificationPermission;
  isSubscribed: boolean;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function usePushNotifications(userJwt?: string): UsePushNotifications {
  const [permission, setPermission] = useState<NotificationPermission>(Notification.permission);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastEndpoint, setLastEndpoint] = useState<string | null>(null);

  // ========================
  // VERIFICACIÓN DE SUSCRIPCIÓN
  // ========================
  /**
   * Verifica si existe una suscripción activa
   * Detecta cambios en el endpoint para re-suscripción inteligente
   */
  const checkSubscription = useCallback(async () => {
    console.log('[Push] 🔍 Verificando suscripción activa...');
    
    if (!('serviceWorker' in navigator)) {
      console.warn('[Push] ⚠️ Service Worker no soportado en este navegador');
      return;
    }

    try {
      const reg = await navigator.serviceWorker.getRegistration('/sw.js');
      
      if (!reg) {
        console.log('[Push] ℹ️ Service Worker no registrado aún');
        setIsSubscribed(false);
        setLastEndpoint(null);
        return;
      }

      const sub = await reg.pushManager.getSubscription();
      
      if (sub) {
        const currentEndpoint = sub.endpoint;
        
        // Verificar si el endpoint cambió (caso de re-suscripción necesaria)
        if (lastEndpoint && lastEndpoint !== currentEndpoint) {
          console.warn('[Push] ⚠️ El endpoint cambió. Se requiere actualizar backend.');
          console.log('[Push] Endpoint anterior:', lastEndpoint.substring(0, 50) + '...');
          console.log('[Push] Endpoint nuevo:', currentEndpoint.substring(0, 50) + '...');
          // TODO: Aquí podrías llamar automáticamente a subscribe() para actualizar
        }
        
        setLastEndpoint(currentEndpoint);
        setIsSubscribed(true);
        
        console.log('[Push] ✅ Suscripción activa:', {
          endpoint: currentEndpoint.substring(0, 60) + '...',
          expirationTime: sub.expirationTime,
          hasKeys: !!(sub.toJSON().keys?.p256dh && sub.toJSON().keys?.auth)
        });
      } else {
        console.log('[Push] ℹ️ No hay suscripción activa');
        setIsSubscribed(false);
        setLastEndpoint(null);
      }
    } catch (err) {
      console.error('[Push] ❌ Error al verificar suscripción:', err);
      setIsSubscribed(false);
    }
  }, [lastEndpoint]);

  // ========================
  // INICIALIZACIÓN
  // ========================
  useEffect(() => {
    console.log('[Push] 🚀 Inicializando hook de notificaciones');
    console.log('[Push] Permiso actual:', Notification.permission);
    console.log('[Push] Backend:', API_BASE);
    console.log('[Push] Tipo de dispositivo:', getDeviceType());
    
    setPermission(Notification.permission);
    checkSubscription();
    
    // Verificar estado del Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        const state = reg.active?.state;
        console.log('[Push] ✅ Service Worker listo. Estado:', state);
        
        if (state !== 'activated') {
          console.warn('[Push] ⚠️ Service Worker no está activado:', state);
        }
      }).catch(err => {
        console.error('[Push] ❌ Error al verificar Service Worker:', err);
      });
    }
  }, [checkSubscription]);

  // ========================
  // SUSCRIPCIÓN
  // ========================
  /**
   * Proceso completo de suscripción push:
   * 1. Validar soporte y autenticación
   * 2. Solicitar permisos de notificación
   * 3. Registrar/verificar Service Worker
   * 4. Obtener clave pública VAPID del backend
   * 5. Crear suscripción push
   * 6. Enviar suscripción al backend con device_type
   */
  const subscribe = useCallback(async () => {
    console.log('[Push] ========================================');
    console.log('[Push] 📝 INICIANDO PROCESO DE SUSCRIPCIÓN');
    console.log('[Push] ========================================');
    
    setLoading(true);
    setError(null);

    try {
      // PASO 1: Validaciones iniciales
      console.log('[Push] [1/6] Validando soporte del navegador...');
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker no soportado en este navegador');
      }
      if (!('PushManager' in window)) {
        throw new Error('Push API no soportada en este navegador');
      }
      if (!userJwt) {
        throw new Error('Usuario no autenticado. JWT requerido.');
      }
      console.log('[Push] ✅ Validaciones iniciales pasadas');

      // PASO 2: Solicitar permiso de notificaciones
      console.log('[Push] [2/6] Solicitando permiso de notificaciones...');
      const perm = await Notification.requestPermission();
      console.log('[Push] Resultado del permiso:', perm);
      setPermission(perm);
      
      if (perm !== 'granted') {
        throw new Error(`Permiso ${perm === 'denied' ? 'denegado' : 'no otorgado'}`);
      }
      console.log('[Push] ✅ Permiso otorgado');

      // PASO 3: Registrar/verificar Service Worker
      console.log('[Push] [3/6] Verificando Service Worker...');
      let reg = await navigator.serviceWorker.getRegistration('/sw.js');
      
      if (!reg) {
        console.log('[Push] Service Worker no encontrado, registrando...');
        reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none' // Evitar caché del SW para actualizaciones más rápidas
        });
        console.log('[Push] ✅ Service Worker registrado');
      } else {
        console.log('[Push] ✅ Service Worker ya registrado');
        
        // Verificar si hay actualización disponible
        await reg.update();
        console.log('[Push] Service Worker verificado para actualizaciones');
      }
      
      // Esperar a que esté activo
      console.log('[Push] Esperando que Service Worker esté activo...');
      await navigator.serviceWorker.ready;
      
      if (!reg.active) {
        throw new Error('Service Worker no se pudo activar');
      }
      console.log('[Push] ✅ Service Worker activo y listo');

      // PASO 4: Obtener clave pública VAPID del backend
      console.log('[Push] [4/6] Solicitando clave pública VAPID...');
      console.log('[Push] URL:', `${API_BASE}/api/notifications/public-key`);
      
      const vapidRes = await fetch(`${API_BASE}/api/notifications/public-key`);
      
      if (!vapidRes.ok) {
        const errorText = await vapidRes.text();
        console.error('[Push] ❌ Error HTTP:', vapidRes.status, errorText);
        throw new Error(`Backend error (${vapidRes.status}): No se pudo obtener clave pública`);
      }
      
      const vapidData = await safeJsonParse(vapidRes);
      const { publicKey } = vapidData;
      
      if (!publicKey || typeof publicKey !== 'string') {
        console.error('[Push] ❌ Clave pública inválida:', vapidData);
        throw new Error('Clave pública VAPID no válida recibida del servidor');
      }
      
      console.log('[Push] ✅ Clave pública VAPID recibida:', publicKey.substring(0, 40) + '...');

      // PASO 5: Crear suscripción push
      console.log('[Push] [5/6] Creando suscripción push...');
      
      // Verificar si ya existe una suscripción
      const existingSub = await reg.pushManager.getSubscription();
      if (existingSub) {
        console.log('[Push] ℹ️ Ya existe una suscripción, se usará o actualizará');
        console.log('[Push] Endpoint existente:', existingSub.endpoint.substring(0, 60) + '...');
      }
      
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      
      console.log('[Push] ✅ Suscripción creada');
      console.log('[Push] Endpoint:', subscription.endpoint);
      console.log('[Push] Expiration:', subscription.expirationTime || 'Sin expiración');

      // PASO 6: Enviar suscripción al backend
      console.log('[Push] [6/6] Enviando suscripción al backend...');
      
      const device_type = getDeviceType();
      const subscriptionJSON = subscription.toJSON();
      
      // Validar que tengamos las claves necesarias
      if (!subscriptionJSON.keys?.p256dh || !subscriptionJSON.keys?.auth) {
        throw new Error('Suscripción sin claves de encriptación necesarias');
      }
      
      // Payload exacto como el backend espera
      const payload = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscriptionJSON.keys.p256dh,
          auth: subscriptionJSON.keys.auth
        },
        device_type: device_type
      };
      
      console.log('[Push] Payload:', JSON.stringify({
        endpoint: payload.endpoint.substring(0, 60) + '...',
        keys: { p256dh: '***', auth: '***' },
        device_type: payload.device_type
      }, null, 2));
      
      console.log('[Push] Enviando a:', `${API_BASE}/api/notifications/subscribe`);
      
      const res = await fetch(`${API_BASE}/api/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userJwt}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('[Push] ❌ Error del backend:', res.status, errorText);
        throw new Error(`Backend error (${res.status}): No se pudo guardar la suscripción`);
      }
      
      const backendResp = await safeJsonParse(res);
      console.log('[Push] ✅ Respuesta del backend:', backendResp);
      
      // Actualizar estado
      setIsSubscribed(true);
      setLastEndpoint(subscription.endpoint);
      
      console.log('[Push] ========================================');
      console.log('[Push] ✅ SUSCRIPCIÓN COMPLETADA EXITOSAMENTE');
      console.log('[Push] Usuario ID:', backendResp.idusuario);
      console.log('[Push] Device Type:', device_type);
      console.log('[Push] ========================================');
      
    } catch (err: any) {
      const errorMsg = err.message || 'Error desconocido al suscribirse';
      console.error('[Push] ========================================');
      console.error('[Push] ❌ ERROR EN SUSCRIPCIÓN:', errorMsg);
      console.error('[Push] ========================================');
      console.error('[Push] Detalles del error:', err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [userJwt, lastEndpoint]);

  // ========================
  // DESUSCRIPCIÓN
  // ========================
  /**
   * Elimina la suscripción tanto del backend como del navegador
   */
  const unsubscribe = useCallback(async () => {
    console.log('[Push] ========================================');
    console.log('[Push] 🗑️ INICIANDO DESUSCRIPCIÓN');
    console.log('[Push] ========================================');
    
    setLoading(true);
    setError(null);

    try {
      // Validaciones
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker no soportado');
      }
      if (!userJwt) {
        throw new Error('Usuario no autenticado');
      }

      const reg = await navigator.serviceWorker.getRegistration('/sw.js');
      if (!reg) {
        throw new Error('No hay Service Worker registrado');
      }

      const sub = await reg.pushManager.getSubscription();
      if (!sub) {
        console.warn('[Push] ⚠️ No hay suscripción activa para eliminar');
        setIsSubscribed(false);
        setLastEndpoint(null);
        return;
      }

      const endpoint = sub.endpoint;
      console.log('[Push] Endpoint a eliminar:', endpoint.substring(0, 60) + '...');

      // PASO 1: Eliminar en backend
      console.log('[Push] [1/2] Eliminando suscripción del backend...');
      const res = await fetch(`${API_BASE}/api/notifications/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userJwt}`,
        },
        body: JSON.stringify({ endpoint }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('[Push] ⚠️ Error al eliminar del backend:', res.status, errorText);
        // No lanzamos error aquí, intentamos eliminar del navegador de todas formas
      } else {
        const backendResp = await safeJsonParse(res);
        console.log('[Push] ✅ Eliminada del backend:', backendResp);
      }

      // PASO 2: Eliminar en navegador
      console.log('[Push] [2/2] Eliminando suscripción del navegador...');
      const unsubscribed = await sub.unsubscribe();
      
      if (unsubscribed) {
        console.log('[Push] ✅ Suscripción eliminada del navegador');
        setIsSubscribed(false);
        setLastEndpoint(null);
        console.log('[Push] ========================================');
        console.log('[Push] ✅ DESUSCRIPCIÓN COMPLETADA');
        console.log('[Push] ========================================');
      } else {
        throw new Error('No se pudo eliminar la suscripción del navegador');
      }

    } catch (err: any) {
      const errorMsg = err.message || 'Error al desuscribirse';
      console.error('[Push] ========================================');
      console.error('[Push] ❌ ERROR EN DESUSCRIPCIÓN:', errorMsg);
      console.error('[Push] ========================================');
      console.error('[Push] Detalles:', err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [userJwt]);

  return { permission, isSubscribed, subscribe, unsubscribe, loading, error };
}

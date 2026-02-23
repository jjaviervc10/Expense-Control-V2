import { useCallback, useEffect, useState } from 'react';

// URL base del backend en Railway
const API_BASE = "https://expense-control-backend-pruebas.up.railway.app";

// Utilidad para detectar el tipo de dispositivo
function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const ua = navigator.userAgent;
  if (/Mobi|Android/i.test(ua)) return 'mobile';
  if (/Tablet|iPad/i.test(ua)) return 'tablet';
  return 'desktop';
}

// Utilidad para convertir la clave VAPID a Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
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

  // Verifica si ya existe una suscripción activa
  const checkSubscription = useCallback(async () => {
    console.log('[Push] Verificando suscripción activa...');
    if (!('serviceWorker' in navigator)) {
      console.warn('[Push] Service Worker no soportado en este navegador');
      return;
    }
    const reg = await navigator.serviceWorker.getRegistration('/sw.js');
    if (!reg) {
      console.log('[Push] No hay Service Worker registrado');
      return setIsSubscribed(false);
    }
    console.log('[Push] Service Worker encontrado:', reg);
    const sub = await reg.pushManager.getSubscription();
    console.log('[Push] Estado de suscripción:', sub ? 'Suscrito' : 'No suscrito');
    if (sub) {
      console.log('[Push] Detalles de suscripción:', {
        endpoint: sub.endpoint,
        expirationTime: sub.expirationTime,
        keys: {
          p256dh: sub.toJSON().keys?.p256dh?.substring(0, 20) + '...',
          auth: sub.toJSON().keys?.auth?.substring(0, 20) + '...'
        }
      });
    }
    setIsSubscribed(!!sub);
  }, []);

  useEffect(() => {
    console.log('[Push] Inicializando hook, permiso actual:', Notification.permission);
    setPermission(Notification.permission);
    checkSubscription();
    
    // Log del estado del Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        console.log('[Push] Service Worker listo:', reg.active?.state);
      });
    }
  }, [checkSubscription]);

  // Solicita permisos y registra la suscripción en backend
  const subscribe = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[Push] Iniciando proceso de suscripción...');
      if (!('serviceWorker' in navigator)) throw new Error('Service Worker no soportado');
      if (!userJwt) throw new Error('Usuario no autenticado');

      // Solicitar permiso
      console.log('[Push] Solicitando permiso de notificaciones...');
      const perm = await Notification.requestPermission();
      console.log('[Push] Permiso obtenido:', perm);
      setPermission(perm);
      if (perm !== 'granted') {
        console.error('[Push] Permiso denegado por el usuario');
        throw new Error('Permiso denegado');
      }

      // Registrar SW si no está
      let reg = await navigator.serviceWorker.getRegistration('/sw.js');
      if (!reg) {
        console.log('[Push] Service Worker no encontrado, registrando /sw.js...');
        reg = await navigator.serviceWorker.register('/sw.js');
        console.log('[Push] Service Worker registrado exitosamente');
      } else {
        console.log('[Push] Service Worker ya estaba registrado');
      }
      
      // Esperar a que el SW esté activo
      await navigator.serviceWorker.ready;
      console.log('[Push] Service Worker está activo y listo');

      // Obtener clave pública VAPID
      console.log('[Push] Solicitando clave pública VAPID...');
      const vapidRes = await fetch(`${API_BASE}/api/notifications/public-key`);
      if (!vapidRes.ok) {
        const text = await vapidRes.text();
        console.error('[Push] Error al obtener clave pública:', text);
        throw new Error('No se pudo obtener la clave pública');
      }
      const { publicKey } = await vapidRes.json();
      console.log('[Push] Clave pública VAPID recibida:', publicKey.substring(0, 30) + '...');
      if (!publicKey) {
        console.error('[Push] Clave pública está vacía o es inválida');
        throw new Error('Clave pública inválida');
      }

      // Suscribirse
      console.log('[Push] Suscribiéndose con pushManager...');
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      console.log('[Push] ✅ Suscripción creada exitosamente');
      console.log('[Push] Endpoint:', subscription.endpoint);
      console.log('[Push] Subscription completa:', JSON.stringify(subscription.toJSON(), null, 2));

      // Detectar tipo de dispositivo
      const device_type = getDeviceType();
      console.log('[Push] 📱 Tipo de dispositivo detectado:', device_type);

      // Preparar payload con device_type
      const payload = {
        ...subscription.toJSON(),
        device_type: device_type,
      };
      console.log('[Push] Payload con device_type:', payload);

      // Registrar en backend
      console.log('[Push] Enviando suscripción al backend:', `${API_BASE}/api/notifications/subscribe`);
      const res = await fetch(`${API_BASE}/api/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userJwt}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error('[Push] Error al registrar suscripción en backend:', text);
        throw new Error('No se pudo registrar la suscripción');
      }
      const backendResp = await res.json();
      console.log('[Push] ✅ Suscripción guardada en backend:', backendResp);
      console.log('[Push] Usuario ID del backend:', backendResp.idusuario || 'No disponible');
      setIsSubscribed(true);
      console.log('[Push] ========== SUSCRIPCIÓN COMPLETADA ==========');
    } catch (err: any) {
      setError(err.message || 'Error al suscribirse');
      console.error('[Push] Error en subscribe:', err);
    } finally {
      setLoading(false);
    }
  }, [userJwt]);

  // Elimina la suscripción en backend y navegador
  const unsubscribe = useCallback(async () => {
    console.log('[Push] Iniciando proceso de desuscripción...');
    setLoading(true);
    setError(null);
    try {
      if (!('serviceWorker' in navigator)) throw new Error('Service Worker no soportado');
      if (!userJwt) throw new Error('Usuario no autenticado');
      const reg = await navigator.serviceWorker.getRegistration('/sw.js');
      if (!reg) throw new Error('No hay Service Worker registrado');
      const sub = await reg.pushManager.getSubscription();
      if (!sub) {
        console.warn('[Push] No hay suscripción activa para eliminar');
        throw new Error('No hay suscripción activa');
      }
      console.log('[Push] Suscripción encontrada, endpoint:', sub.endpoint);
      // Eliminar en backend
      const res = await fetch(`${API_BASE}/api/notifications/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userJwt}`,
        },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
      if (!res.ok) {
        console.error('[Push] Error al eliminar suscripción del backend');
        throw new Error('No se pudo eliminar la suscripción en backend');
      }
      console.log('[Push] Suscripción eliminada del backend');
      // Eliminar en navegador
      await sub.unsubscribe();
      console.log('[Push] ✅ Suscripción eliminada del navegador');
      setIsSubscribed(false);
    } catch (err: any) {
      console.error('[Push] ❌ Error al desuscribirse:', err);
      setError(err.message || 'Error al desuscribirse');
    } finally {
      setLoading(false);
    }
  }, [userJwt]);

  return { permission, isSubscribed, subscribe, unsubscribe, loading, error };
}

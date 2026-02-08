import { useCallback, useEffect, useState } from 'react';

// URL base del backend en Railway
const API_BASE = "https://expense-control-backend-pruebas.up.railway.app";

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
    if (!('serviceWorker' in navigator)) return;
    const reg = await navigator.serviceWorker.getRegistration('/sw.js');
    if (!reg) return setIsSubscribed(false);
    const sub = await reg.pushManager.getSubscription();
    setIsSubscribed(!!sub);
  }, []);

  useEffect(() => {
    setPermission(Notification.permission);
    checkSubscription();
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
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') throw new Error('Permiso denegado');

      // Registrar SW si no está
      let reg = await navigator.serviceWorker.getRegistration('/sw.js');
      if (!reg) reg = await navigator.serviceWorker.register('/sw.js');

      // Obtener clave pública VAPID
      console.log('[Push] Solicitando clave pública VAPID...');
      const vapidRes = await fetch(`${API_BASE}/api/notifications/public-key`);
      if (!vapidRes.ok) {
        const text = await vapidRes.text();
        console.error('[Push] Error al obtener clave pública:', text);
        throw new Error('No se pudo obtener la clave pública');
      }
      const { publicKey } = await vapidRes.json();
      if (!publicKey) throw new Error('Clave pública inválida');

      // Suscribirse
      console.log('[Push] Suscribiéndose con pushManager...');
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      console.log('[Push] Subscription object:', subscription);

      // Registrar en backend
      console.log('[Push] Enviando suscripción al backend:', `${API_BASE}/api/notifications/subscribe`);
      const res = await fetch(`${API_BASE}/api/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userJwt}`,
        },
        body: JSON.stringify(subscription),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error('[Push] Error al registrar suscripción en backend:', text);
        throw new Error('No se pudo registrar la suscripción');
      }
      const backendResp = await res.json();
      console.log('[Push] Respuesta del backend:', backendResp);
      setIsSubscribed(true);
    } catch (err: any) {
      setError(err.message || 'Error al suscribirse');
      console.error('[Push] Error en subscribe:', err);
    } finally {
      setLoading(false);
    }
  }, [userJwt]);

  // Elimina la suscripción en backend y navegador
  const unsubscribe = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!('serviceWorker' in navigator)) throw new Error('Service Worker no soportado');
      if (!userJwt) throw new Error('Usuario no autenticado');
      const reg = await navigator.serviceWorker.getRegistration('/sw.js');
      if (!reg) throw new Error('No hay Service Worker registrado');
      const sub = await reg.pushManager.getSubscription();
      if (!sub) throw new Error('No hay suscripción activa');
      // Eliminar en backend
      const res = await fetch(`${API_BASE}/api/notifications/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userJwt}`,
        },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
      if (!res.ok) throw new Error('No se pudo eliminar la suscripción en backend');
      // Eliminar en navegador
      await sub.unsubscribe();
      setIsSubscribed(false);
    } catch (err: any) {
      setError(err.message || 'Error al desuscribirse');
    } finally {
      setLoading(false);
    }
  }, [userJwt]);

  return { permission, isSubscribed, subscribe, unsubscribe, loading, error };
}

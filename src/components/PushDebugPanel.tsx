import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

// Backend de PRODUCCIÓN
const BACKEND_URL = 'https://expense-control-backend-production-6b4a.up.railway.app';
const CRON_TOKEN = '798a0cd9217f642949c4faed7ca51533df8322aa88412b8f909c120ee5afe45a';

/**
 * Detecta el tipo de dispositivo según el backend espera:
 * - 'android': Dispositivos Android móviles
 * - 'web': Navegadores de escritorio y otros dispositivos
 */
function getDeviceType(): 'android' | 'web' {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) {
    return 'android';
  }
  return 'web';
}

/**
 * Obtiene descripción visual del dispositivo
 */
function getDeviceDescription(): string {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return '📱 Android';
  if (/iPhone|iPad|iPod/i.test(ua)) return '📱 iOS';
  if (/Tablet/i.test(ua)) return '📱 Tablet';
  if (/Mobile/i.test(ua)) return '📱 Móvil';
  return '💻 Desktop';
}

interface DebugInfo {
  swStatus: string;
  swVersion: string | null;
  subscriptionStatus: string;
  permission: NotificationPermission;
  endpoint: string | null;
  hasActiveSubscription: boolean;
  userId: number | null;
  deviceType: 'android' | 'web';
  deviceDescription: string;
  lastCheck: string;
}

export default function PushDebugPanel() {
  const { token, user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    swStatus: 'Verificando...',
    swVersion: null,
    subscriptionStatus: 'Verificando...',
    permission: Notification.permission,
    endpoint: null,
    hasActiveSubscription: false,
    userId: user?.id || null,
    deviceType: getDeviceType(),
    deviceDescription: getDeviceDescription(),
    lastCheck: new Date().toLocaleTimeString(),
  });
  const [isVisible, setIsVisible] = useState(false);
  const [testMessage, setTestMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Verifica el estado completo de las notificaciones push
   */
  const checkStatus = async () => {
    console.log('[Debug Panel] 🔍 Verificando estado de notificaciones...');
    
    const info: DebugInfo = {
      swStatus: 'No disponible',
      swVersion: null,
      subscriptionStatus: 'No disponible',
      permission: Notification.permission,
      endpoint: null,
      hasActiveSubscription: false,
      userId: user?.id || null,
      deviceType: getDeviceType(),
      deviceDescription: getDeviceDescription(),
      lastCheck: new Date().toLocaleTimeString(),
    };

    try {
      // Verificar soporte de Service Worker
      if (!('serviceWorker' in navigator)) {
        info.swStatus = 'No soportado ❌';
        info.subscriptionStatus = 'Navegador no compatible';
        console.error('[Debug Panel] ❌ Service Worker no soportado');
        setDebugInfo(info);
        return;
      }

      // Obtener registro del Service Worker
      const reg = await navigator.serviceWorker.getRegistration('/sw.js');
      
      if (!reg) {
        info.swStatus = 'No registrado ❌';
        info.subscriptionStatus = 'SW no registrado';
        console.warn('[Debug Panel] ⚠️ Service Worker no está registrado');
        setDebugInfo(info);
        return;
      }

      // Estado del Service Worker
      const swState = reg.active?.state || reg.installing?.state || reg.waiting?.state || 'unknown';
      info.swStatus = reg.active 
        ? `✅ Activo (${swState})` 
        : reg.installing 
        ? `⏳ Instalando (${swState})`
        : reg.waiting
        ? `⏸️ Esperando (${swState})`
        : '❓ Estado desconocido';

      console.log('[Debug Panel] Service Worker:', {
        active: reg.active?.state,
        installing: reg.installing?.state,
        waiting: reg.waiting?.state,
        scope: reg.scope
      });

      // Verificar suscripción push
      if (!('pushManager' in reg)) {
        info.subscriptionStatus = 'Push API no disponible ❌';
        console.error('[Debug Panel] ❌ pushManager no disponible');
        setDebugInfo(info);
        return;
      }

      const sub = await reg.pushManager.getSubscription();
      
      if (sub) {
        info.hasActiveSubscription = true;
        info.endpoint = sub.endpoint;
        info.subscriptionStatus = '✅ Suscrito';
        
        const expirationTime = sub.expirationTime;
        const hasExpiration = expirationTime !== null;
        
        console.log('[Debug Panel] ✅ Suscripción activa:', {
          endpoint: sub.endpoint.substring(0, 60) + '...',
          expirationTime: hasExpiration ? new Date(expirationTime!).toLocaleString() : 'Sin expiración',
          keys: {
            p256dh: !!sub.toJSON().keys?.p256dh,
            auth: !!sub.toJSON().keys?.auth
          }
        });
      } else {
        info.subscriptionStatus = '❌ No suscrito';
        console.log('[Debug Panel] ℹ️ No hay suscripción activa');
      }

    } catch (error) {
      console.error('[Debug Panel] ❌ Error al verificar estado:', error);
      info.subscriptionStatus = `❌ Error: ${error}`;
    }

    setDebugInfo(info);
  };

  useEffect(() => {
    checkStatus();
    // Actualizar cada 10 segundos
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, [user]);

  /**
   * Prueba de notificación local (sin backend)
   */
  const testNotification = async () => {
    console.log('[Debug Panel] 🧪 Enviando notificación de prueba local...');
    
    if (Notification.permission !== 'granted') {
      console.warn('[Debug Panel] ⚠️ Permisos no otorgados');
      setTestMessage('⚠️ Permisos no otorgados');
      setTimeout(() => setTestMessage(null), 3000);
      return;
    }

    try {
      const reg = await navigator.serviceWorker.getRegistration('/sw.js');
      
      if (!reg) {
        throw new Error('Service Worker no registrado');
      }

      await reg.showNotification('🧪 Prueba de Notificación', {
        body: 'Esta es una notificación de prueba local desde el navegador',
        icon: '/opcionA.png',
        badge: '/opcionA.png',
        tag: 'test-notification',
      });
      
      console.log('[Debug Panel] ✅ Notificación de prueba mostrada');
      setTestMessage('✅ Notificación local mostrada');
      setTimeout(() => setTestMessage(null), 3000);
      
    } catch (error) {
      console.error('[Debug Panel] ❌ Error al mostrar notificación:', error);
      setTestMessage(`❌ Error: ${error}`);
      setTimeout(() => setTestMessage(null), 3000);
    }
  };

  /**
   * Simula el cron job del backend para enviar notificación real
   */
  const checkBackendSubscription = async () => {
    console.log('[Debug Panel] ========================================');
    console.log('[Debug Panel] 🚀 SIMULANDO ENVÍO DE NOTIFICACIÓN (CRON JOB)');
    console.log('[Debug Panel] ========================================');
    
    setIsLoading(true);
    setTestMessage(null);
    
    try {
      console.log('[Debug Panel] Backend:', BACKEND_URL);
      console.log('[Debug Panel] Endpoint:', '/api/notifications/cron/send');
      console.log('[Debug Panel] Payload:', { tipo: 'recordatorio', slot: '3pm' });
      
      const response = await fetch(`${BACKEND_URL}/api/notifications/cron/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CRON_TOKEN}`,
        },
        body: JSON.stringify({
          tipo: 'recordatorio',
          slot: '3pm'
        }),
      });

      console.log('[Debug Panel] Response status:', response.status);
      console.log('[Debug Panel] Response headers:', {
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length')
      });

      // Validar respuesta JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('[Debug Panel] ❌ Respuesta no es JSON:', text.substring(0, 200));
        throw new Error('El backend no devolvió JSON válido');
      }

      const data = await response.json();
      console.log('[Debug Panel] Response data:', data);

      if (response.ok) {
        const sent = data.sent || 0;
        const failed = data.failed || 0;
        const total = sent + failed;
        
        console.log('[Debug Panel] ✅ Cron ejecutado exitosamente');
        console.log('[Debug Panel] - Enviadas:', sent);
        console.log('[Debug Panel] - Fallidas:', failed);
        console.log('[Debug Panel] - Total:', total);
        
        setTestMessage(
          sent > 0 
            ? `✅ Cron ejecutado: ${sent} enviadas, ${failed} fallidas`
            : `⚠️ Cron ejecutado pero 0 notificaciones enviadas. Verifica tu suscripción.`
        );
      } else {
        console.error('[Debug Panel] ❌ Error del backend:', data);
        setTestMessage(`❌ Error: ${data.error || data.message || 'Error desconocido'}`);
      }
      
      setTimeout(() => setTestMessage(null), 8000);
      
    } catch (error: any) {
      console.error('[Debug Panel] ========================================');
      console.error('[Debug Panel] ❌ ERROR AL SIMULAR CRON');
      console.error('[Debug Panel] ========================================');
      console.error('[Debug Panel] Error:', error);
      setTestMessage(`❌ Error: ${error.message}`);
      setTimeout(() => setTestMessage(null), 8000);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-full shadow-lg text-sm font-bold z-50"
        title="Abrir panel de debug de notificaciones"
      >
        🔍 Debug Push
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-lg shadow-2xl p-4 max-w-md z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
          🔍 Debug Notificaciones Push
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl font-bold"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
          <strong className="text-gray-700 dark:text-gray-300">Usuario ID:</strong>
          <span className="ml-2 text-gray-900 dark:text-white font-semibold">
            {debugInfo.userId || 'No disponible'}
          </span>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
          <strong className="text-gray-700 dark:text-gray-300">Dispositivo:</strong>
          <span className="ml-2 text-gray-900 dark:text-white font-semibold">
            {debugInfo.deviceDescription}
          </span>
          <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">
            (backend: {debugInfo.deviceType})
          </span>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
          <strong className="text-gray-700 dark:text-gray-300">Permiso:</strong>
          <span className={`ml-2 font-semibold ${
            debugInfo.permission === 'granted' ? 'text-green-600 dark:text-green-400' : 
            debugInfo.permission === 'denied' ? 'text-red-600 dark:text-red-400' : 
            'text-yellow-600 dark:text-yellow-400'
          }`}>
            {debugInfo.permission} {
              debugInfo.permission === 'granted' ? '✅' : 
              debugInfo.permission === 'denied' ? '❌' : '⚠️'
            }
          </span>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
          <strong className="text-gray-700 dark:text-gray-300">Service Worker:</strong>
          <span className="ml-2 text-gray-900 dark:text-white">{debugInfo.swStatus}</span>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
          <strong className="text-gray-700 dark:text-gray-300">Suscripción:</strong>
          <span className="ml-2 text-gray-900 dark:text-white">{debugInfo.subscriptionStatus}</span>
        </div>
        
        {debugInfo.endpoint && (
          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
            <strong className="text-gray-700 dark:text-gray-300">Endpoint:</strong>
            <div className="text-xs text-gray-700 dark:text-gray-300 break-all mt-1 font-mono">
              {debugInfo.endpoint.substring(0, 100)}...
            </div>
          </div>
        )}
        
        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
          <strong className="text-gray-700 dark:text-gray-300">Última verificación:</strong>
          <span className="ml-2 text-gray-900 dark:text-white">{debugInfo.lastCheck}</span>
        </div>
      </div>

      {testMessage && (
        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900 rounded text-sm text-center font-semibold">
          {testMessage}
        </div>
      )}

      <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900 rounded text-xs">
        <strong className="text-blue-800 dark:text-blue-200">ℹ️ Cómo funciona:</strong>
        <ul className="text-blue-700 dark:text-blue-300 mt-1 pl-4 list-disc space-y-1">
          <li><strong>Notificación Local:</strong> Prueba rápida sin backend</li>
          <li><strong>Simular Cron Job:</strong> Envía notificación real desde el backend a todos los dispositivos suscritos</li>
          <li><strong>Soporte multi-dispositivo:</strong> Puedes tener múltiples dispositivos (Android/Web) suscritos simultáneamente</li>
        </ul>
      </div>

      <div className="mt-4 space-y-2">
        <button
          onClick={checkStatus}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={isLoading}
        >
          🔄 Actualizar Estado
        </button>
        
        <button
          onClick={testNotification}
          className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={debugInfo.permission !== 'granted' || isLoading}
        >
          🧪 Probar Notificación Local
        </button>
        
        <button
          onClick={checkBackendSubscription}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
          disabled={isLoading}
        >
          {isLoading ? '⏳ Enviando...' : '🚀 Simular Cron Job'}
        </button>
        
        <button
          onClick={() => {
            console.log('[Debug Panel] ========================================');
            console.log('[Debug Panel] 📋 ESTADO COMPLETO DEBUG');
            console.log('[Debug Panel] ========================================');
            console.log('[Debug Panel] Debug Info:', debugInfo);
            console.log('[Debug Panel] Token presente:', !!token);
            console.log('[Debug Panel] User:', user);
            console.log('[Debug Panel] Backend:', BACKEND_URL);
            console.log('[Debug Panel] Device Type:', debugInfo.deviceType);
            console.log('[Debug Panel] Device Description:', debugInfo.deviceDescription);
            console.log('[Debug Panel] Endpoint completo:', debugInfo.endpoint);
            console.log('[Debug Panel] ========================================');
            
            setTestMessage('✅ Estado impreso en consola (F12)');
            setTimeout(() => setTestMessage(null), 3000);
          }}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={isLoading}
        >
          📋 Imprimir en Consola
        </button>
      </div>

      <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 text-center">
        Abre DevTools (F12) → Console para ver logs detallados
      </div>
    </div>
  );
}

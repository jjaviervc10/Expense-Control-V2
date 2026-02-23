import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE = "https://expense-control-backend-pruebas.up.railway.app";

// Función para detectar el tipo de dispositivo
function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const ua = navigator.userAgent;
  if (/Mobi|Android/i.test(ua)) return 'mobile';
  if (/Tablet|iPad/i.test(ua)) return 'tablet';
  return 'desktop';
}

interface DebugInfo {
  swStatus: string;
  subscriptionStatus: string;
  permission: NotificationPermission;
  endpoint: string | null;
  hasActiveSubscription: boolean;
  userId: number | null;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  lastCheck: string;
}

export default function PushDebugPanel() {
  const { token, user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    swStatus: 'Verificando...',
    subscriptionStatus: 'Verificando...',
    permission: Notification.permission,
    endpoint: null,
    hasActiveSubscription: false,
    userId: user?.id || null,
    deviceType: getDeviceType(),
    lastCheck: new Date().toLocaleTimeString(),
  });
  const [isVisible, setIsVisible] = useState(false);
  const [testMessage, setTestMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkStatus = async () => {
    console.log('[Debug Panel] Verificando estado de notificaciones...');
    
    const info: DebugInfo = {
      swStatus: 'No disponible',
      subscriptionStatus: 'No disponible',
      permission: Notification.permission,
      endpoint: null,
      hasActiveSubscription: false,
      userId: user?.id || null,
      deviceType: getDeviceType(),
      lastCheck: new Date().toLocaleTimeString(),
    };

    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration('/sw.js');
        
        if (reg) {
          info.swStatus = reg.active ? `Activo (${reg.active.state})` : 'Instalado pero no activo';
          
          const sub = await reg.pushManager.getSubscription();
          if (sub) {
            info.hasActiveSubscription = true;
            info.endpoint = sub.endpoint;
            info.subscriptionStatus = 'Suscrito ✅';
            console.log('[Debug Panel] Suscripción activa encontrada:', {
              endpoint: sub.endpoint,
              expirationTime: sub.expirationTime,
            });
          } else {
            info.subscriptionStatus = 'No suscrito ❌';
            console.log('[Debug Panel] No hay suscripción activa');
          }
        } else {
          info.swStatus = 'No registrado ❌';
          info.subscriptionStatus = 'SW no registrado';
          console.log('[Debug Panel] Service Worker no está registrado');
        }
      } else {
        info.swStatus = 'No soportado ❌';
        info.subscriptionStatus = 'Navegador no compatible';
        console.log('[Debug Panel] Service Worker no soportado en este navegador');
      }
    } catch (error) {
      console.error('[Debug Panel] Error al verificar estado:', error);
      info.subscriptionStatus = `Error: ${error}`;
    }

    setDebugInfo(info);
  };

  useEffect(() => {
    checkStatus();
    // Actualizar cada 10 segundos
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const testNotification = async () => {
    console.log('[Debug Panel] Enviando notificación de prueba local...');
    if (Notification.permission === 'granted') {
      try {
        const reg = await navigator.serviceWorker.getRegistration('/sw.js');
        if (reg) {
          await reg.showNotification('🧪 Prueba de Notificación', {
            body: 'Esta es una notificación de prueba local desde el navegador',
            icon: '/logo.png',
            badge: '/badge.png',
            tag: 'test-notification',
          });
          console.log('[Debug Panel] ✅ Notificación de prueba mostrada');
          setTestMessage('✅ Notificación local mostrada');
          setTimeout(() => setTestMessage(null), 3000);
        }
      } catch (error) {
        console.error('[Debug Panel] ❌ Error al mostrar notificación de prueba:', error);
        setTestMessage('❌ Error al mostrar notificación');
        setTimeout(() => setTestMessage(null), 3000);
      }
    } else {
      console.warn('[Debug Panel] Permisos no otorgados para mostrar notificación');
      setTestMessage('⚠️ Permisos no otorgados');
      setTimeout(() => setTestMessage(null), 3000);
    }
  };

  const testBackendNotification = async () => {
    console.log('[Debug Panel] Solicitando notificación de prueba desde el backend...');
    setIsLoading(true);
    setTestMessage(null);
    
    try {
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      console.log('[Debug Panel] Enviando request a:', `${API_BASE}/api/notifications/test`);
      const response = await fetch(`${API_BASE}/api/notifications/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('[Debug Panel] Response status:', response.status);
      const data = await response.json();
      console.log('[Debug Panel] Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar notificación de prueba');
      }

      console.log('[Debug Panel] ✅ Notificación enviada desde el backend');
      setTestMessage(`✅ Backend: ${data.message || 'Notificación enviada'}`);
      setTimeout(() => setTestMessage(null), 5000);
    } catch (error: any) {
      console.error('[Debug Panel] ❌ Error al solicitar notificación del backend:', error);
      setTestMessage(`❌ Backend: ${error.message}`);
      setTimeout(() => setTestMessage(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const checkBackendSubscription = async () => {
    console.log('[Debug Panel] Verificando suscripción en el backend...');
    setIsLoading(true);
    setTestMessage(null);
    
    try {
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const reg = await navigator.serviceWorker.getRegistration('/sw.js');
      if (!reg) {
        throw new Error('Service Worker no registrado');
      }

      const sub = await reg.pushManager.getSubscription();
      if (!sub) {
        throw new Error('No hay suscripción activa en el navegador');
      }

      const currentEndpoint = sub.endpoint;
      console.log('[Debug Panel] Endpoint actual del navegador:', currentEndpoint);

      // Verificar en el backend
      console.log('[Debug Panel] Consultando backend:', `${API_BASE}/api/notifications/check`);
      const response = await fetch(`${API_BASE}/api/notifications/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ endpoint: currentEndpoint }),
      });

      const data = await response.json();
      console.log('[Debug Panel] Response del backend:', data);

      if (data.exists) {
        console.log('[Debug Panel] ✅ Suscripción encontrada en el backend');
        setTestMessage(`✅ Suscripción en BD (activa: ${data.subscripcion?.activo ? 'Sí' : 'No'})`);
      } else {
        console.log('[Debug Panel] ❌ Suscripción NO encontrada en el backend');
        setTestMessage('❌ Suscripción NO está en la BD');
      }
      setTimeout(() => setTestMessage(null), 5000);
    } catch (error: any) {
      console.error('[Debug Panel] ❌ Error al verificar suscripción:', error);
      setTestMessage(`❌ Error: ${error.message}`);
      setTimeout(() => setTestMessage(null), 5000);
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
          <span className="ml-2 text-gray-900 dark:text-white">{debugInfo.userId || 'No disponible'}</span>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
          <strong className="text-gray-700 dark:text-gray-300">Dispositivo:</strong>
          <span className="ml-2 text-gray-900 dark:text-white font-semibold">
            {debugInfo.deviceType === 'mobile' && '📱 Móvil'}
            {debugInfo.deviceType === 'tablet' && '📱 Tablet'}
            {debugInfo.deviceType === 'desktop' && '💻 Desktop'}
          </span>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
          <strong className="text-gray-700 dark:text-gray-300">Permiso:</strong>
          <span className={`ml-2 font-semibold ${
            debugInfo.permission === 'granted' ? 'text-green-600' : 
            debugInfo.permission === 'denied' ? 'text-red-600' : 'text-yellow-600'
          }`}>
            {debugInfo.permission} {debugInfo.permission === 'granted' ? '✅' : debugInfo.permission === 'denied' ? '❌' : '⚠️'}
          </span>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
          <strong className="text-gray-700 dark:text-gray-300">Service Worker:</strong>
          <span className="ml-2 text-gray-900 dark:text-white">{debugInfo.swStatus}</span>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
          <strong className="text-gray-700 dark:text-gray-300">Estado:</strong>
          <span className="ml-2 text-gray-900 dark:text-white">{debugInfo.subscriptionStatus}</span>
        </div>
        
        {debugInfo.endpoint && (
          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
            <strong className="text-gray-700 dark:text-gray-300">Endpoint:</strong>
            <div className="text-xs text-gray-700 dark:text-gray-300 break-all mt-1">
              {debugInfo.endpoint.substring(0, 80)}...
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

      <div className="mt-4 space-y-2">
        <button
          onClick={checkStatus}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded font-semibold text-sm disabled:opacity-50"
          disabled={isLoading}
        >
          🔄 Actualizar Estado
        </button>
        
        <button
          onClick={testNotification}
          className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded font-semibold text-sm disabled:opacity-50"
          disabled={debugInfo.permission !== 'granted' || isLoading}
        >
          🧪 Probar Notificación Local
        </button>
        
        <button
          onClick={testBackendNotification}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded font-semibold text-sm disabled:opacity-50"
          disabled={!token || !debugInfo.hasActiveSubscription || isLoading}
        >
          {isLoading ? '⏳ Enviando...' : '🚀 Probar desde Backend'}
        </button>
        
        <button
          onClick={checkBackendSubscription}
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded font-semibold text-sm disabled:opacity-50"
          disabled={!token || !debugInfo.hasActiveSubscription || isLoading}
        >
          {isLoading ? '⏳ Verificando...' : '🔍 Verificar en BD'}
        </button>
        
        <button
          onClick={() => {
            console.log('[Debug Panel] Estado completo:', debugInfo);
            console.log('[Debug Panel] Token:', token ? 'Presente' : 'No disponible');
            console.log('[Debug Panel] User:', user);
            console.log('[Debug Panel] Endpoint:', debugInfo.endpoint);
          }}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded font-semibold text-sm disabled:opacity-50"
          disabled={isLoading}
        >
          📋 Imprimir en Consola
        </button>
      </div>

      <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 text-center">
        Abre la consola (F12) para ver logs detallados
      </div>
    </div>
  );
}

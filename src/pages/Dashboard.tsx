// src/pages/Dashboard.tsx
import { Link } from "react-router-dom";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { logout } from "../utils/logout";
import { useAutoLogout } from "../hooks/useAutoLogout";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { usePushNotifications } from "../hooks/usePushNotifications";

export default function Dashboard() {
  useEffect(() => {
    console.log('Hola mundo desde Dashboard');
  }, []);
  useAutoLogout(); // ⏱️ activado

  // Banner de notificaciones: solo mostrar si no ha aceptado/rechazado
  const [showNotifBanner, setShowNotifBanner] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { token } = useAuth();
  const { permission, isSubscribed, subscribe, loading, error } = usePushNotifications(token || undefined);

  useEffect(() => {
    // Mostrar solo si no hay preferencia guardada
    const dismissed = localStorage.getItem("notifBannerDismissed");
    const enabled = Notification.permission === "granted";
    if (!dismissed && !enabled) {
      setShowNotifBanner(true);
      console.log('[Notificaciones] Banner mostrado: invitando a activar notificaciones push');
    } else {
      if (dismissed) {
        console.log('[Notificaciones] Banner NO mostrado: preferencia guardada en localStorage (notifBannerDismissed)');
      }
      if (enabled) {
        console.log('[Notificaciones] Banner NO mostrado: permiso de notificaciones ya concedido (Notification.permission = granted)');
      }
    }
  }, []);

  // Cuando el usuario activa notificaciones, mostrar animación de éxito
  // Solo ocultar el banner si la suscripción fue exitosa (backend responde ok)
  useEffect(() => {
    if (permission === "granted" && isSubscribed && showNotifBanner && !error) {
      console.log('[Notificaciones] Suscripción exitosa: backend confirmó registro');
      setShowSuccess(true);
      setTimeout(() => {
        setShowNotifBanner(false);
        setShowSuccess(false);
        localStorage.setItem("notifBannerDismissed", "true");
      }, 1800);
    }
    if (error && showNotifBanner) {
      console.error('[Notificaciones] Error al suscribir: ', error);
    }
  }, [permission, isSubscribed, showNotifBanner, error]);

  const handleDismiss = () => {
    setShowNotifBanner(false);
    localStorage.setItem("notifBannerDismissed", "true");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-blue-700">
          Control de Gastos
        </h1>
        <button
          onClick={logout}
          className="fixed top-4 right-4 bg-red-600 text-white p-3 rounded-full shadow-lg z-50 hover:bg-red-700 transition"
          title="Cerrar Sesión"
        >
          <ArrowRightOnRectangleIcon className="w-6 h-6" />
        </button>
        <p className="text-gray-600 mt-1">
          Selecciona el tipo de reporte
        </p>
      </header>

      {/* Banner persuasivo de notificaciones con animación de éxito */}
      {showNotifBanner && (
        <div className="max-w-xl mx-auto mb-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl shadow-lg p-6 flex flex-col items-center animate-fade-in">
          {!showSuccess ? (
            <>
              <div className="text-lg font-semibold mb-2">¡Mantente al día sobre tu vida financiera!</div>
              <div className="mb-4 text-center">
                Programa mensajes inteligentes sobre tu día a día y recibe recordatorios, resúmenes y tips personalizados para mejorar tu control de gastos.
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    console.log('[Notificaciones] Usuario hizo clic en activar notificaciones');
                    subscribe();
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2 text-base shadow-md focus:outline-none focus:ring-2 focus:ring-green-300"
                  disabled={loading || permission === 'granted' || isSubscribed}
                  style={{ minWidth: 200 }}
                >
                  {loading ? (
                    <span className="animate-pulse">Activando...</span>
                  ) : (
                    <>
                      Sí, quiero ahorrar más <span className="text-xl">💸</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleDismiss}
                  className="bg-white text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  No, gracias
                </button>
              </div>
              {error && <div className="text-red-200 mt-2">{error}</div>}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center w-full">
              <div className="text-3xl mb-2 animate-bounce">✅</div>
              <div className="font-bold text-lg mb-1">¡Listo! Te avisaremos de tus mejores oportunidades de ahorro <span className="text-2xl">🎉</span></div>
            </div>
          )}
        </div>
      )}

      {/* MAIN GRID */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* TARJETA DIARIO */}
        <Link 
          to="/gastos/diario"
          className="bg-white shadow-lg rounded-xl p-8 text-center hover:shadow-xl
                     hover:scale-105 transition transform cursor-pointer border-t-4 border-blue-400"
        >
          <h2 className="text-2xl font-bold text-gray-800">Diario</h2>
          <p className="text-gray-500 mt-2">Ver gastos de hoy</p>
        </Link>

        {/* TARJETA SEMANAL */}
        <Link 
          to="/gastos/semanal"
          className="bg-white shadow-lg rounded-xl p-8 text-center hover:shadow-xl
                     hover:scale-105 transition transform cursor-pointer border-t-4 border-green-400"
        >
          <h2 className="text-2xl font-bold text-gray-800">Semanal</h2>
          <p className="text-gray-500 mt-2">Resumen de tu semana</p>
        </Link>

        {/* TARJETA MENSUAL */}
        <Link 
          to="/gastos/mensual"
          className="bg-white shadow-lg rounded-xl p-8 text-center hover:shadow-xl
                     hover:scale-105 transition transform cursor-pointer border-t-4 border-purple-400"
        >
          <h2 className="text-2xl font-bold text-gray-800">Mensual</h2>
          <p className="text-gray-500 mt-2">Control del mes</p>
        </Link>

      </div>
    </div>
  );
}

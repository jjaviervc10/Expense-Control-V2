import { useAuth } from "../context/AuthContext";
import { usePushNotifications } from "../hooks/usePushNotifications";

export default function NotificationPermissionButton() {
  const { token } = useAuth();
  const { permission, isSubscribed, subscribe, unsubscribe, loading, error } = usePushNotifications(token || undefined);

  if (permission === "granted" && isSubscribed) return null;

  return (
    <div className="mt-4 text-center">
      {permission !== "granted" && (
        <button
          onClick={subscribe}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition font-semibold"
          disabled={loading}
        >
          {loading ? "Activando..." : "Activar notificaciones 🔔"}
        </button>
      )}
      {permission === "granted" && isSubscribed && (
        <button
          onClick={unsubscribe}
          className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition font-semibold ml-2"
          disabled={loading}
        >
          {loading ? "Desactivando..." : "Desactivar notificaciones"}
        </button>
      )}
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
}

import { useEffect, useState } from "react";

export default function NotificationPermissionButton() {
  const [permission, setPermission] = useState<string | null>(null);

  useEffect(() => {
    if (window?.OneSignal) {
      window.OneSignal.getNotificationPermission().then((perm: string) => {
        setPermission(perm);
      });
    }
  }, []);

  const handleRequestPermission = async () => {
    if (window?.OneSignal) {
      try {
        const status = await window.OneSignal.showSlidedownPrompt();
        console.log("Permiso solicitado con OneSignal:", status);

        const updatedPermission = await window.OneSignal.getNotificationPermission();
        setPermission(updatedPermission);
      } catch (err) {
        console.error("Error solicitando permiso:", err);
      }
    }
  };

  // No mostrar nada si ya está "granted"
  if (permission === "granted") return null;

  return (
    <div className="mt-4 text-center">
      <button
        onClick={handleRequestPermission}
        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition font-semibold"
      >
        Activar notificaciones 🔔
      </button>
    </div>
  );
}

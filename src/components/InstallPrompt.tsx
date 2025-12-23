// src/components/InstallPrompt.tsx
import { useEffect, useState } from "react";

type Props = {
  onInstalled: () => void;
};

export default function InstallPrompt({ onInstalled }: Props) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") onInstalled();
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-300 to-blue-400">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full text-center">
        <img
          src="/opcionA.png"
          alt="App Icon"
          className="w-24 h-24 mx-auto mb-4 rounded-lg shadow"
        />

        <h2 className="text-2xl font-extrabold text-gray-800 mb-2">
          Bienvenido
        </h2>
        <p className="text-gray-600 mb-6">
          Para usar esta app, necesitas instalarla primero en tu dispositivo.
        </p>

        {showPrompt ? (
          <button
            onClick={handleInstallClick}
            className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Instalar Aplicación
          </button>
        ) : (
          <p className="text-sm text-gray-500">Esperando disponibilidad de instalación...</p>
        )}
      </div>
    </div>
  );
}

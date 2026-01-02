import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type InstallPromptProps = {
  onInstalled?: () => void; // ✅ ahora es opcional
};

export default function InstallPrompt({ onInstalled }: InstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [installing, setInstalling] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setShowPrompt(false);
      onInstalled?.(); // ✅ solo si existe
      navigate("/onboarding"); // 🚀 redirección automática
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, [navigate, onInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      setInstalling(true);
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      // ⛔ NO navegamos aquí
      // el evento `appinstalled` se encargará
    } catch (error) {
      console.error("Error durante la instalación", error);
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-300 to-blue-400">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full text-center">
        <img
          src="/opcionA.png"
          alt="App Icon"
          className="w-24 h-24 mx-auto mb-4 rounded-xl shadow"
        />

        <h2 className="text-2xl font-extrabold text-gray-800 mb-2">
          Instala tu aplicación
        </h2>

        <p className="text-gray-600 mb-6">
          Instala la app para recibir recordatorios y gestionar tus gastos fácilmente.
        </p>

        {showPrompt ? (
          <button
            onClick={handleInstallClick}
            disabled={installing}
            className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-60"
          >
            {installing ? "Instalando..." : "Instalar Aplicación"}
          </button>
        ) : (
          <p className="text-sm text-gray-500">
            La instalación no está disponible en este navegador.
          </p>
        )}
      </div>
    </div>
  );
}

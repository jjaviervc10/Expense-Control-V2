import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate, Navigate } from "react-router-dom";
import InstallPrompt from "../components/InstallPrompt";

// 🟦 Toast
import { toast } from "react-toastify";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [appInstalled, setAppInstalled] = useState<boolean | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const seenOnboarding = localStorage.getItem("onboardingCompleted");

  useEffect(() => {
    const checkInstalled = () => {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.startsWith("android-app://");

      setAppInstalled(isStandalone);
    };

    checkInstalled();
    window.addEventListener("appinstalled", () => setAppInstalled(true));
    return () => window.removeEventListener("appinstalled", () => {});
  }, []);

  useEffect(() => {
    const checkPermission = async () => {
      if (window.OneSignal) {
        const permission = await window.OneSignal.Notification.permission;
        setNotificationsEnabled(permission === "granted");

        // Mostrar toast solo si no ha activado notificaciones
        if (permission !== "granted") {
          toast.info("Mantente actualizado con tus finanzas. ¡Activa las notificaciones!");
        }
      }
    };

    checkPermission();
  }, []);


  const handleEnableNotifications = () => {
  if (typeof window.OneSignal === "undefined") {
    toast.error("El sistema de notificaciones aún no está listo.");
    return;
  }
  

  window.OneSignal.push(async () => {
    try {
      // Mostramos el prompt de OneSignal
      await window.OneSignal.showSlidedownPrompt();

      const permission = await window.OneSignal.getNotificationPermission();
      console.log("Permiso de notificaciones:", permission);

      // Si aceptó, guardamos y actualizamos UI
      if (permission === "granted") {
        localStorage.setItem("notificationsEnabled", "true");
        setNotificationsEnabled(true);
        toast.success("¡Notificaciones activadas con éxito!");
      } else {
        toast.info("No se otorgó permiso para notificaciones.");
      }
    } catch (error) {
      console.error("Error al pedir permiso:", error);
      toast.error("Ocurrió un error al activar notificaciones.");
    }
  });
};

  if (appInstalled === null) return null;

  if (!appInstalled) {
    return <InstallPrompt onInstalled={() => setAppInstalled(true)} />;
  }

  if (appInstalled && !seenOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      await login(correo, password);

      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

      if (storedUser.rol === "admin") {
        navigate("/admin/trial");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      if (error?.requierePago) {
        setErrorMsg(
          `Tu prueba ha expirado. Realiza un depósito o transferencia de $100 al número de tarjeta 4152-3142-7590-5464 (CLABE: 012150015329192098) a nombre de Javier Velazquez para activar tu cuenta.`
        );
      } else {
        setErrorMsg(error.message || "Correo o contraseña incorrectos.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Iniciar Sesión
        </h1>

        {!notificationsEnabled && (
          <button
            onClick={handleEnableNotifications}
            className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-2 mb-4 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Activar Notificaciones 🔔
          </button>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              placeholder="usuario@correo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="*******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-9 text-sm text-gray-600 focus:outline-none"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          {errorMsg && (
            <div className="text-red-500 text-sm text-center border border-red-300 rounded p-2 bg-red-50">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
          >
            Ingresar
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-4">
          ¿No tienes cuenta?{" "}
          <Link
            to="/register"
            className="text-blue-600 font-semibold hover:underline"
          >
            Crear cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}

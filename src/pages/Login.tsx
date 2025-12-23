// src/pages/Login.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import InstallPrompt from "../components/InstallPrompt";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [appInstalled, setAppInstalled] = useState(false);

  useEffect(() => {
    // Verificar si la app ya está instalada
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    setAppInstalled(isStandalone);

    const handler = () => {
      setAppInstalled(true);
    };

    window.addEventListener("appinstalled", handler);

    return () => window.removeEventListener("appinstalled", handler);
  }, []);

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

  // Mostrar pantalla de instalación si aún no está instalada
  if (!appInstalled) {
    return <InstallPrompt onInstalled={() => setAppInstalled(true)} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Iniciar Sesión
        </h1>

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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="*******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* ERROR MESSAGE */}
          {errorMsg && (
            <div className="text-red-500 text-sm text-center border border-red-300 rounded p-2 bg-red-50">
              {errorMsg}
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
          >
            Ingresar
          </button>
        </form>

        {/* LINK TO REGISTER */}
        <p className="text-center text-gray-600 text-sm mt-4">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">
            Crear cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}

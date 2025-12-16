// src/pages/admin/AdminLayout.tsx
import { Link, Outlet, useLocation } from "react-router-dom";
import { logout } from "../../utils/logout";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline"; // si no lo tienes, instala Heroicons


export default function AdminLayout() {
  const { pathname } = useLocation();

  const isTrial = pathname.includes("/trial");

  return (
    <div className="min-h-screen bg-gray-100 p-6">
     

    <header className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold text-blue-700">Panel de administración</h1>
        <p className="text-gray-600 text-sm">
          Gestiona usuarios en prueba y usuarios con pago activo
        </p>
    </div>

  <div className="flex gap-4 items-center">
    <nav className="flex gap-2">
      <Link
        to="/admin/trial"
        className={`px-4 py-2 rounded-lg text-sm font-semibold ${
          isTrial ? "bg-blue-600 text-white" : "bg-white text-blue-600 border"
        }`}
      >
        Prueba gratuita
      </Link>
      <Link
        to="/admin/paid"
        className={`px-4 py-2 rounded-lg text-sm font-semibold ${
          !isTrial ? "bg-blue-600 text-white" : "bg-white text-blue-600 border"
        }`}
      >
        Pagos mensuales
      </Link>
    </nav>

    {/* 🔴 Botón de logout */}
    <button
      onClick={logout}
      title="Cerrar sesión"
      className="bg-red-600 text-white px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-red-700 transition"
    >
      <ArrowRightOnRectangleIcon className="w-5 h-5" />
      <span className="hidden sm:inline">Cerrar sesión</span>
    </button>
  </div>
</header>


      <main className="bg-white rounded-xl shadow p-6">
        <Outlet />
      </main>
    </div>
  );
}

// src/pages/admin/AdminLayout.tsx
import { Link, Outlet, useLocation } from "react-router-dom";

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

        <nav className="flex gap-4">
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
      </header>

      <main className="bg-white rounded-xl shadow p-6">
        <Outlet />
      </main>
    </div>
  );
}

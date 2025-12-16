// src/pages/Dashboard.tsx
import { Link } from "react-router-dom";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { logout } from "../utils/logout";
import { useAutoLogout } from "../hooks/useAutoLogout";

export default function Dashboard() {
  useAutoLogout(); // ⏱️ activado
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

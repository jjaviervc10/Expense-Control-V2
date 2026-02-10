import { useEffect, useState } from "react";
import { useBudget } from "../../hooks/useBudget";
import { useNavigate } from "react-router-dom";
import { ArrowRightOnRectangleIcon, ArrowLeftIcon, CameraIcon } from "@heroicons/react/24/outline";
import { logout } from "../../utils/logout";

import BudgetForm from "../../components/BudgetForm";
import BudgetTracker from "../../components/BudgetTracker";
import ExpenseList from "../../components/ExpenseList";
import ExpenseModal from "../../components/ExpenseModal";
import FilterByCategory from "../../components/FilterByCategory";
import TicketScanModal from '../../components/TicketScanModal';
import type { TicketProduct } from '../../components/TicketProductList';
import { postGasto } from '../../api/gastoApi';
import { categories } from '../../data/categories';
import AnimatedFinanceBackground from '../../components/AnimatedFinanceBackground';

import { usePresupuestoActivo } from "../../hooks/usePresupuestoActivo";
import { useAutoLogout } from "../../hooks/useAutoLogout";

export default function Semanal() {
  const { dispatch, state } = useBudget();
  const navigate = useNavigate();
  useAutoLogout();

  const [refresh, setRefresh] = useState(0);
  const [filterCategory, setFilterCategory] = useState(""); // ✅ Estado local para filtrar
  const [scanOpen, setScanOpen] = useState(false);

  useEffect(() => {
    dispatch({ type: "set-range", payload: { range: "semanal" } });
  }, [dispatch]);

  const {
    montoLimite,
    loading,
    error,
    refetch: refetchPresupuesto,
  } = usePresupuestoActivo("semanal");

  useEffect(() => {
    if (state.expenses.some((e) => e.range === "semanal")) {
      setRefresh((prev) => prev + 1);
    }
  }, [state.expenses]);

  // Handler para guardar gastos escaneados
  const { token } = useBudget();
  const handleSaveScan = async (products: TicketProduct[], meta: { fecha: string; total: number; moneda: string; comercio: string }) => {
    try {
      await Promise.all(products.map(async (product) => {
        const cat = categories.find(c => c.name === product.category);
        if (!cat) throw new Error('Categoría inválida');
        await postGasto(token ?? '', {
          tipo: 'semanal',
          categoria: cat.id,
          monto: product.amount,
          fecha: meta.fecha,
        });
      }));
      setRefresh(prev => prev + 1); // Refresca el listado desde backend
    } catch (err) {
      console.error('Error registrando gasto escaneado:', err);
    }
  };

  return (
    <>
      <button
        onClick={() => navigate("/dashboard")}
        className="fixed top-4 left-4 bg-white text-blue-600 p-2 rounded-full shadow-lg border border-blue-500 hover:bg-blue-50 transition z-50"
        title="Volver al Dashboard"
      >
        <ArrowLeftIcon className="h-6 w-6" />
      </button>

      <header className="bg-blue-600 py-8 max-h-72 relative">
        <h1 className="uppercase text-center font-black text-4xl text-white">
          PLANIFICADOR DE GASTOS - SEMANAL
        </h1>
        <button
          onClick={logout}
          className="fixed top-4 right-4 bg-red-600 text-white p-3 rounded-full shadow-lg z-50 hover:bg-red-700 transition"
          title="Cerrar Sesión"
        >
          <ArrowRightOnRectangleIcon className="w-6 h-6" />
        </button>
        {/* Botón registrar por foto, solo si hay presupuesto definido */}
        {montoLimite !== null && (
          <button
            onClick={() => setScanOpen(true)}
            className="fixed top-4 right-24 bg-green-600 text-white p-3 rounded-full shadow-lg z-50 hover:bg-green-700 transition flex items-center justify-center"
            title="¡Registra tus gastos de manera inteligente! Toma una foto de tu ticket y los productos se agregarán automáticamente."
          >
            <CameraIcon className="w-6 h-6" />
          </button>
        )}
      </header>

      <TicketScanModal open={scanOpen} onClose={() => setScanOpen(false)} onSave={handleSaveScan} />

      <div className="relative z-10 min-h-screen bg-transparent p-6">
        <AnimatedFinanceBackground />
        <div className="max-w-3xl mx-auto bg-white bg-opacity-60 shadow-lg rounded-lg mt-10 p-10">
          {loading ? (
            <p className="text-center">Cargando...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : montoLimite === null ? (
            <BudgetForm tipo="semanal" onSuccess={refetchPresupuesto} />
          ) : (
            <>
              <BudgetTracker tipo="semanal" onResetSuccess={refetchPresupuesto} />
              <main className="max-w-3xl mx-auto py-10">
                <FilterByCategory onChange={setFilterCategory}/>
                <ExpenseList tipo="semanal" refresh={refresh} filterCategory={filterCategory}/>
                <ExpenseModal />
              </main>
            </>
          )}
        </div>
      </div>
    </>
  );
}

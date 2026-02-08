import { useState } from "react";
import { useBudget } from "../hooks/useBudget";
import AmountDisplay from "./AmountDisplay";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import ConfirmResetModal from "./ConfirmResetModal";
import DownloadPdfButton from "./DownloadPdfButton";
import { usePresupuestoActivo } from "../hooks/usePresupuestoActivo";
import { apiResetApp } from "../api/resetApi";

type Props = {
  tipo: "diario" | "semanal" | "mensual";
  onResetSuccess: () => void;
};

export default function BudgetTracker({ tipo, onResetSuccess }: Props) {
  const { totalExpenses, dispatch } = useBudget();
  const { montoLimite, loading, error, refetch } = usePresupuestoActivo(tipo);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (loading) return <p className="text-center">Cargando presupuesto...</p>;

  if (error || montoLimite === null)
    return (
      <p className="text-center text-red-500">
        Error al cargar presupuesto
      </p>
    );

  const remainingBudget = montoLimite - totalExpenses;
  const percentage =
    montoLimite > 0 ? Math.min((totalExpenses / montoLimite) * 100, 100) : 0;

  const handleResetConfirm = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Token no encontrado");
      }

      await apiResetApp(token, tipo);

      dispatch({ type: "reset-app" });

      refetch(); // ✅ recarga desde el hook
      onResetSuccess(); // ✅ notifica al padre si es necesario

      setConfirmOpen(false);
    } catch (err) {
      console.error("Error al hacer reset:", err);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <ConfirmResetModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleResetConfirm}
      />

      <div className="flex justify-end gap-4 mb-4">
        <DownloadPdfButton tipo={tipo} />
        <button
          type="button"
          className="bg-red-600 text-white p-2 rounded-lg font-bold hover:bg-red-700 transition"
          onClick={() => setConfirmOpen(true)}
        >
          Resetear App
        </button>
      </div>

      {/** Contenedor interno con fondo semitranslúcido consistente en todas las vistas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-white bg-opacity-80 shadow-lg rounded-lg p-8">
        <div className="flex justify-center">
          <CircularProgressbar
            value={percentage}
            styles={buildStyles({
              pathColor: percentage === 100 ? "#DC2626" : "#3B82F6",
              trailColor: "#F5F5F5",
              textSize: 8,
              textColor: percentage === 100 ? "#DC2626" : "#3B82F6",
            })}
            text={`${percentage.toFixed(2)}% Gastado`}
          />
        </div>

        <div className="flex flex-col justify-center items-center gap-8">
          <AmountDisplay label="Presupuesto" amount={montoLimite} />
          <AmountDisplay label="Disponible" amount={remainingBudget} />
          <AmountDisplay label="Gastado" amount={totalExpenses} />
        </div>
      </div>
    </>
  );
}

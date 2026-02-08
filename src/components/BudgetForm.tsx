// src/components/BudgetForm.tsx
import { useMemo, useState, useEffect } from "react";
import { postPresupuesto } from "../api/presupuestoApi";
import { useAuth } from "../context/AuthContext";
import { useBudget } from "../hooks/useBudget";

type Props = {
  tipo: "diario" | "semanal" | "mensual";
  onSuccess?: () => void; // ✅ Añadido
};

export default function BudgetForm({ tipo, onSuccess }: Props) {
  const [budget, setBudget] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const { token } = useAuth();
  const { dispatch } = useBudget();

  useEffect(() => {
    if (showSuccess || showError) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
        setShowError(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, showError]);

  const isValid = useMemo(() => {
    return isNaN(budget) || budget <= 0;
  }, [budget]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) {
      setShowError(true);
      return;
    }
    setLoading(true);
    try {
      const payload = {
        montoLimite: budget,
        fechaInicio: new Date().toISOString(),
        fechaFin: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
        categoria: tipo,
      };
      await postPresupuesto(token, payload);
      dispatch({
        type: "add-budget",
        payload: { budget },
      });
      setShowSuccess(true);
      if (onSuccess) onSuccess();
    } catch (error) {
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="budget-card bg-transparent shadow-sm rounded-xl p-8 max-w-md mx-auto mt-12 text-center"
      onSubmit={handleSubmit}
    >
      <h2 className="text-3xl font-bold mb-4 text-blue-700 drop-shadow-md flex items-center justify-center gap-2">
        <span role="img" aria-label="money">💰</span>
        Define tu presupuesto mensual
      </h2>
      <label htmlFor="budget" className="block text-blue-600 font-medium mb-2 text-left">
        Monto
      </label>
      <div className="relative mb-4">
        <input
          id="budget"
          type="number"
          placeholder="Ej. 10000"
          className="w-full p-3 rounded-lg border border-blue-200 text-lg focus:ring-2 focus:ring-blue-400 transition pr-10"
          aria-label="Monto de presupuesto"
          value={budget}
          onChange={(e) => setBudget(e.target.valueAsNumber)}
        />
        <span className="absolute right-3 top-3 text-blue-400 text-xl">💵</span>
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg mt-6 transition disabled:opacity-40"
        disabled={isValid || loading}
      >
        {loading ? "Guardando..." : "Guardar presupuesto"}
      </button>
      {/* Mensaje de validación */}
      {isValid && (
        <div className="mt-2 text-red-500 text-sm" aria-live="polite">
          Por favor ingresa un monto mayor a 0
        </div>
      )}
      {/* Toast de éxito */}
      {showSuccess && (
        <div className="mt-4 animate-bounce text-green-600 font-bold text-lg" aria-live="polite">
          ✅ Presupuesto guardado correctamente
        </div>
      )}
      {/* Toast de error */}
      {showError && (
        <div className="mt-4 animate-shake text-red-600 font-bold text-lg" aria-live="polite">
          ❌ Error al guardar presupuesto
        </div>
      )}
    </form>
  );
}

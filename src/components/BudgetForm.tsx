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

  const { token } = useAuth();
  const { dispatch } = useBudget();

  useEffect(() => {
    console.log("🧩 BudgetForm montado");
    console.log("📂 Tipo recibido:", tipo);
    console.log("🔐 Token presente:", !!token);
  }, [tipo, token]);

  const isValid = useMemo(() => {
    return isNaN(budget) || budget <= 0;
  }, [budget]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("🚀 Submit presupuesto");
    console.log("➡️ Tipo:", tipo);
    console.log("➡️ Monto:", budget);

    if (!token) {
      console.error("❌ No hay token");
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

      console.log("📤 Enviando POST a backend:", payload);

      const presupuesto = await postPresupuesto(token, payload);

      console.log("✅ Respuesta backend:", presupuesto);

      dispatch({
        type: "add-budget",
        payload: { budget },
      });

      console.log("🎯 Presupuesto guardado y refetch ejecutado.");

      // ✅ Llamar al callback si se definió
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("❌ Error al crear presupuesto:", error);
      alert("Error al crear presupuesto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="flex flex-col space-y-5">
        <label
          htmlFor="budget"
          className="text-4xl text-blue-600 font-bold text-center"
        >
          Definir Presupuesto
        </label>

        <input
          id="budget"
          type="number"
          className="w-full bg-white border border-gray-200 p-2"
          placeholder="Define tu presupuesto"
          value={budget}
          onChange={(e) => setBudget(e.target.valueAsNumber)}
        />
      </div>

      <input
        type="submit"
        value={loading ? "Guardando..." : "Definir Presupuesto"}
        className="bg-blue-600 hover:bg-blue-700 cursor-pointer w-full p-2 text-white 
        font-black uppercase disabled:opacity-40"
        disabled={isValid || loading}
      />
    </form>
  );
}

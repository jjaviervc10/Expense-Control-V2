// src/hooks/usePresupuestoActivo.ts
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { getPresupuestoActivo } from "../api/presupuestoApi";

export function usePresupuestoActivo(categoria: string) {
  const { token } = useAuth();

  const [montoLimite, setMontoLimite] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0); // ✅ clave para recargar

  const fetchPresupuesto = useCallback(async () => {
    if (!token || !categoria) return;

    try {
      setLoading(true);
      setError(null);

      const presupuesto = await getPresupuestoActivo(token, categoria);

      if (!presupuesto || !presupuesto.montoLimite) {
        setMontoLimite(null);
      } else {
        setMontoLimite(Number(presupuesto.montoLimite));
      }
    } catch (err: any) {
      if (err.message?.includes("No hay presupuesto activo")) {
        setMontoLimite(null);
        setError(null);
      } else {
        setError("No se pudo cargar el presupuesto");
        setMontoLimite(null);
      }
    } finally {
      setLoading(false);
    }
  }, [token, categoria]);

  useEffect(() => {
    fetchPresupuesto();
  }, [fetchPresupuesto, refetchTrigger]);

  return {
    montoLimite,
    loading,
    error,
    refetch: () => setRefetchTrigger((prev) => prev + 1), // ✅ así se fuerza recarga
  };
}

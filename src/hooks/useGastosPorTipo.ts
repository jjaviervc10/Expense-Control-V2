import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getGastosPorTipo } from "../api/gastoApi";
import type { Expense } from "../types";

export function useGastosPorTipo(tipo: string, refresh: number) {
  const { token } = useAuth();
  const [gastos, setGastos] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !tipo) return;

    const fetchGastos = async () => {
      try {
        setLoading(true);
        const listaCruda: any[] = await getGastosPorTipo(token, tipo);

        // Normaliza al tipo
        const listaNormalizada: Expense[] = listaCruda.map((g) => ({
          id: String(g.idGasto),
          expenseName: g.descripcion ?? "", 
          amount: Number(g.monto),
          category: g.categoria ?? "",
          date: g.fecha ? new Date(g.fecha) : new Date(),
          range: g.tipo as any,
        }));

        setGastos(listaNormalizada);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Error al cargar gastos");
        setGastos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGastos();
  }, [token, tipo, refresh]); // 👈 agregamos refresh aquí

  return { gastos, loading, error };
}

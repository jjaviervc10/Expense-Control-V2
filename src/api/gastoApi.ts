// src/api/gastoApi.ts

//const BASE_URL = "http://localhost:4000/api/gastos";
const BASE_URL = `${import.meta.env.VITE_API_URL}/gastos`;

export type GastoData = {
  tipo: string;
  categoria: string;
  monto: number;
  fecha?: string;
};

export const postGasto = async (token: string, gasto: GastoData) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(gasto),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al crear gasto");
  return data.gasto;
};

export const getGastosPorTipo = async (token: string, tipo: string) => {
  const res = await fetch(`${BASE_URL}/list?tipo=${tipo}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al obtener gastos");
  return data.gastos;
};

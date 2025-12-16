const BASE_URL = "http://localhost:4000/api/gastos";

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function apiCrearGasto(
  token: string,
  data: {
    tipo: "diario" | "semanal" | "mensual";
    categoria: string;
    monto: number;
    fecha?: string;
  }
) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error al crear gasto");

  return json.gasto;
}

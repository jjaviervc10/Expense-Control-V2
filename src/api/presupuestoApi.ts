const BASE_URL = "http://localhost:4000/api/presupuesto";

export const getPresupuestoActivo = async (token: string, categoria: string) => {
  const res = await fetch(`${BASE_URL}/activo?categoria=${categoria}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al obtener presupuesto");
  return data.presupuesto;
};

export const postPresupuesto = async (
  token: string,
  body: {
    montoLimite: number,
    fechaInicio: string,
    fechaFin: string,
    categoria: string
  }
) => {
  const res = await fetch(`${BASE_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al crear presupuesto");
  return data.presupuesto;
};

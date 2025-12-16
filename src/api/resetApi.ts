// src/api/resetApi.ts

const BASE_URL = `${import.meta.env.VITE_API_URL}/reset`;

export async function apiDownloadPdf(
  token: string,
  tipo: "diario" | "semanal" | "mensual"
): Promise<Blob> {
  const res = await fetch(`${BASE_URL}/pdf`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ categoria: tipo }),
  });

  if (!res.ok) {
    throw new Error("Error al generar PDF");
  }

  return await res.blob();
}

export async function apiResetApp(
  token: string,
  tipo: "diario" | "semanal" | "mensual"
) {
  const res = await fetch(`${BASE_URL}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ categoria: tipo }),
  });

  if (!res.ok) {
    throw new Error("Error al hacer reset");
  }

  return await res.json();
}


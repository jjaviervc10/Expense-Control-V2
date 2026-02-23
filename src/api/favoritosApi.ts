const BASE_URL = `${import.meta.env.VITE_API_URL}/gastos`;

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Marca o desmarca un gasto como favorito
 */
export async function toggleFavorito(
  token: string,
  idGasto: string,
  favorito: boolean
) {
  const res = await fetch(`${BASE_URL}/favorito`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ idGasto: Number(idGasto), favorito }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al actualizar favorito");
  return data;
}

/**
 * Obtiene todos los gastos favoritos del usuario
 */
export async function getFavoritos(token: string) {
  const res = await fetch(`${BASE_URL}/favoritos`, {
    headers: authHeaders(token),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al obtener favoritos");
  return data.favoritos;
}

/**
 * Crea un nuevo gasto basado en uno favorito
 */
export async function registrarDesdeFavorito(
  token: string,
  idGasto: string
) {
  const res = await fetch(`${BASE_URL}/registrar-favorito`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ idGasto: Number(idGasto) }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al registrar gasto favorito");
  return data.gasto;
}

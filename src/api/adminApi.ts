// src/api/adminApi.ts
const BASE_URL = "http://localhost:4000/api/admin";

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function apiListUsers(token: string) {
  const res = await fetch(`${BASE_URL}/usuarios`, {
    headers: authHeaders(token),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Error al obtener usuarios");
  }
  return data.usuarios as Array<{
    idUsuario: number;
    usuario: string;
    nombreCompleto: string;
    correo: string;
    activo: boolean;
    fechaExpiracion: string | null;
    ultimoPago: string | null;
    rol: string;
  }>;
}

export async function apiActivatePayment(token: string, idUsuario: number) {
  const res = await fetch(`${BASE_URL}/usuarios/activar-pago`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ idUsuario }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Error al activar pago");
  }
  return data.usuario;
}

export async function apiDeleteUser(token: string, idUsuario: number) {
  const res = await fetch(`${BASE_URL}/usuarios/${idUsuario}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Error al eliminar usuario");
  }
  return data;
}

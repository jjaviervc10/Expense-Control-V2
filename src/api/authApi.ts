// src/api/authApi.ts

const BASE_URL = "http://localhost:4000/api";

/* ======================================================
   TIPOS
====================================================== */

export type LoginSuccessResponse = {
  ok: true;
  message: string;
  user: {
    id: number;
    nombre: string;
    correo: string;
    rol: string;
    fechaExpiracion: string | null;
  };
  token: string;
};

export type LoginErrorResponse = {
  ok: false;
  message: string;
  requierePago?: boolean;
  fechaExpiracion?: string;
};

/* ======================================================
   LOGIN
====================================================== */

export async function apiLogin(
  correo: string,
  password: string
): Promise<LoginSuccessResponse> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw data as LoginErrorResponse; // 🔥 pasamos el error completo para manejarlo en el front
  }

  return data as LoginSuccessResponse;
}

/* ======================================================
   REGISTER
====================================================== */

export type RegisterPayload = {
  usuario: string;
  correo: string;
  pass: string;
  nombreCompleto: string;
  telefono?: string;
};

export async function apiRegister(payload: RegisterPayload) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Error al registrar usuario");
  }

  return data;
}

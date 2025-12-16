// src/api/authApi.ts

// BASE GLOBAL → apunta a /api/auth
const BASE_URL = `${import.meta.env.VITE_API_URL}/auth`;

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
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ correo, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    // Pasamos el error completo para manejarlo en el frontend
    throw data as LoginErrorResponse;
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
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Error al registrar usuario");
  }

  return data;
}

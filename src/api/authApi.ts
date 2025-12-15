// src/api/authApi.ts
const BASE_URL = "http://localhost:4000/api";

export async function apiLogin(correo: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Error al iniciar sesión");
  }
  return data as {
    ok: boolean;
    user: {
      id: number;
      nombre: string;
      correo: string;
      rol: string;
      fechaExpiracion: string;
    };
    token: string;
  };
}

export async function apiRegister(payload: {
  usuario: string;
  correo: string;
  pass: string;
  nombreCompleto: string;
}) {
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

// src/components/ProtectedRoute.tsx

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Mientras carga el estado de autenticación
  if (loading) {
    return <div>Loading...</div>;
  }

  // Si no hay usuario autenticado → redirigir a login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado → mostrar la ruta protegida
  return <>{children}</>;
}

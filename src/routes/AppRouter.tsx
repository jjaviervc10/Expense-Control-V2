// src/routes/AppRouter.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/Login";
import RegisterPage from "../pages/Register";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminRoute from "../components/AdminRoute";
import Dashboard from "../pages/Dashboard";
import AdminLayout from "../pages/admin/AdminLayout";
import UsersTrialPage from "../pages/admin/UsersTrialPage";
import UsersPaidPage from "../pages/admin/UsersPaidPage";
import Diario from "../pages/gastos/Diario";
import Semanal from "../pages/gastos/Semanal";
import Mensual from "../pages/gastos/Mensual";
import Analisis from '../pages/Analisis';

// ⬇️ instalacion y onboarding
import InstallPrompt from "../components/InstallPrompt";
import Onboarding from "../components/Onboarding";

export default function AppRouter() {
  return (
    <Routes>

      {/* ruta de instalación PWA */}
      <Route path="/install" element={<InstallPrompt />} />

      {/* onboarding después de la instalación */}
      <Route path="/onboarding" element={<Onboarding />} />

      {/* rutas públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* usuario normal */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* rutas de gastos protegidas también */}
      <Route
        path="/gastos/diario"
        element={
          <ProtectedRoute>
            <Diario />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gastos/semanal"
        element={
          <ProtectedRoute>
            <Semanal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gastos/mensual"
        element={
          <ProtectedRoute>
            <Mensual />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analisis"
        element={
          <ProtectedRoute>
            <Analisis />
          </ProtectedRoute>
        }
      />

      {/* área admin */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route path="trial" element={<UsersTrialPage />} />
        <Route path="paid" element={<UsersPaidPage />} />
      </Route>

      {/* ruta fallback */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

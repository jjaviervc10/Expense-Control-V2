// src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import { apiLogin } from "../api/authApi";
import { usePushNotifications } from "../hooks/usePushNotifications";

interface User {
  id: number;
  nombre: string;
  correo: string;
  rol: "admin" | "usuario";
  fechaExpiracion: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (correo: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Notificaciones push: manejar registro/desregistro automático
  const { subscribe, unsubscribe, isSubscribed, loading: notifLoading, error: notifError } = usePushNotifications(token || undefined);

  // recuperar sesión
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = async (correo: string, password: string) => {
    setLoading(true);
    try {
      const data = await apiLogin(correo, password);
      const loggedUser: User = data.user as User;
      setUser(loggedUser);
      setToken(data.token);

      localStorage.setItem("user", JSON.stringify(loggedUser));
      localStorage.setItem("token", data.token);
      // Ya no llamamos a subscribe aquí, lo movemos a un useEffect
    } finally {
      setLoading(false);
    }
  };
  // Suscribirse automáticamente cuando el token esté disponible y el usuario esté autenticado
  useEffect(() => {
    if (user && token) {
      // Solo suscribirse si hay usuario y token
      subscribe()
        .then(() => {
          if (notifError) {
            console.error('[Push] Error al suscribirse:', notifError);
          } else {
            console.log('[Push] Suscripción exitosa para usuario:', user.id);
          }
        })
        .catch((err) => {
          console.error('[Push] Error inesperado en subscribe:', err);
        });
    }
  }, [user, token]);

  const logout = () => {
    // Eliminar suscripción push si existe
    unsubscribe()
      .then(() => {
        console.log('[Push] Suscripción eliminada correctamente en logout');
      })
      .catch((err) => {
        console.error('[Push] Error al eliminar suscripción en logout:', err);
      });
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    // Limpiar preferencia de banner de notificaciones
    localStorage.removeItem("notifBannerDismissed");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

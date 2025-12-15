// src/pages/admin/UsersTrialPage.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiListUsers, apiDeleteUser } from "../../api/adminApi";
import AdminUserTable from "../../components/AdminUserTable";

export default function UsersTrialPage() {
  const { token } = useAuth();
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const all = await apiListUsers(token);
        // ejemplo de filtro: en prueba => ultimoPago es null
        const trial = all.filter(u => !u.ultimoPago);
        setUsuarios(trial);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleDelete = async (idUsuario: number) => {
    if (!token) return;
    await apiDeleteUser(token, idUsuario);
    setUsuarios(prev => prev.filter(u => u.idUsuario !== idUsuario));
  };

  if (loading) return <p>Cargando usuarios en prueba...</p>;

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Usuarios en prueba gratuita</h2>
      <AdminUserTable
        usuarios={usuarios}
        onDelete={handleDelete}
        showActivate={false}
      />
    </>
  );
}

// src/pages/admin/UsersPaidPage.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiActivatePayment, apiDeleteUser, apiListUsers } from "../../api/adminApi";
import AdminUserTable from "../../components/AdminUserTable";

export default function UsersPaidPage() {
  const { token } = useAuth();
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const all = await apiListUsers(token);
        // ejemplo de filtro: han pagado => ultimoPago NO es null
        const paid = all.filter(u => u.ultimoPago);
        setUsuarios(paid);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleActivate = async (idUsuario: number) => {
    if (!token) return;
    const updated = await apiActivatePayment(token, idUsuario);
    setUsuarios(prev =>
      prev.map(u => (u.idUsuario === idUsuario ? { ...u, ...updated } : u))
    );
  };

  const handleDelete = async (idUsuario: number) => {
    if (!token) return;
    await apiDeleteUser(token, idUsuario);
    setUsuarios(prev => prev.filter(u => u.idUsuario !== idUsuario));
  };

  if (loading) return <p>Cargando usuarios con pago...</p>;

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Usuarios con pago mensual</h2>
      <AdminUserTable
        usuarios={usuarios}
        onActivate={handleActivate}
        onDelete={handleDelete}
        showActivate={true}
      />
    </>
  );
}

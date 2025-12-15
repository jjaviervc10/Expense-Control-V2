// src/components/AdminUserTable.tsx
import type { FC } from "react";

type AdminUser = {
  idUsuario: number;
  usuario: string;
  nombreCompleto: string;
  correo: string;
  activo: boolean;
  fechaExpiracion: string | null;
  ultimoPago: string | null;
};

interface Props {
  usuarios: AdminUser[];
  onActivate?: (idUsuario: number) => void;
  onDelete?: (idUsuario: number) => void;
  showActivate: boolean;
}

const AdminUserTable: FC<Props> = ({ usuarios, onActivate, onDelete, showActivate }) => {
  if (usuarios.length === 0) {
    return <p className="text-gray-500 text-sm">No hay usuarios para mostrar</p>;
  }

  return (
    <table className="min-w-full text-left text-sm">
      <thead className="border-b bg-gray-50">
        <tr>
          <th className="px-4 py-2">Usuario</th>
          <th className="px-4 py-2">Nombre completo</th>
          <th className="px-4 py-2">Correo</th>
          <th className="px-4 py-2">Activo</th>
          <th className="px-4 py-2">Fecha expiración</th>
          <th className="px-4 py-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {usuarios.map(u => (
          <tr key={u.idUsuario} className="border-b">
            <td className="px-4 py-2">{u.usuario}</td>
            <td className="px-4 py-2">{u.nombreCompleto}</td>
            <td className="px-4 py-2">{u.correo}</td>
            <td className="px-4 py-2">
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  u.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                {u.activo ? "Activo" : "Inactivo"}
              </span>
            </td>
            <td className="px-4 py-2 text-xs">
              {u.fechaExpiracion ? new Date(u.fechaExpiracion).toLocaleString() : "-"}
            </td>
            <td className="px-4 py-2 flex gap-2">
              {showActivate && onActivate && (
                <button
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded"
                  onClick={() => onActivate(u.idUsuario)}
                >
                  Activar pago
                </button>
              )}
              {onDelete && (
                <button
                  className="px-3 py-1 text-xs bg-red-600 text-white rounded"
                  onClick={() => onDelete(u.idUsuario)}
                >
                  Eliminar
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AdminUserTable;

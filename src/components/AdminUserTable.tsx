// src/components/AdminUserTable.tsx

type Usuario = {
  idUsuario: number;
  usuario: string;
  nombreCompleto: string;
  correo: string;
  activo: boolean;
  fechaExpiracion: string | null;
};

type Props = {
  usuarios: Usuario[];
  onActivate?: (idUsuario: number) => void;
  onDelete: (idUsuario: number) => void;
  showActivate: boolean;
};

export default function AdminUserTable({
  usuarios,
  onActivate,
  onDelete,
  showActivate,
}: Props) {
  return (
    <table className="w-full table-auto text-sm">
      <thead>
        <tr>
          <th>Usuario</th>
          <th>Nombre</th>
          <th>Correo</th>
          <th>Activo</th>
          <th>Fecha expiración</th>
          <th>Acciones</th>
        </tr>
      </thead>

      <tbody>
        {usuarios.map((u) => (
          <tr key={u.idUsuario}>
            <td>{u.usuario}</td>
            <td>{u.nombreCompleto}</td>
            <td>{u.correo}</td>
            <td>
              <span
                className={`font-semibold ${
                  u.activo ? "text-green-600" : "text-red-600"
                }`}
              >
                {u.activo ? "Activo" : "Inactivo"}
              </span>
            </td>
            <td>{u.fechaExpiracion ? new Date(u.fechaExpiracion).toLocaleString() : "-"}</td>
            <td className="flex gap-2">
              {showActivate && (
                <button
                  className="bg-blue-600 text-white px-2 py-1 rounded"
                  onClick={() => onActivate?.(u.idUsuario)}
                  disabled={u.activo}
                >
                  Activar pago
                </button>
              )}

              <button
                className="bg-red-600 text-white px-2 py-1 rounded"
                onClick={() => onDelete(u.idUsuario)}
              >
                Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

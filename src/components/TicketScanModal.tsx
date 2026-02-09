import { useState } from "react";
import TicketUpload from "./TicketUpload";
import TicketProductList from "./TicketProductList";
import type { TicketProduct } from "./TicketProductList";
import { uploadTicketImage } from '../api/ticketUploadApi';
import { useAuth } from '../context/AuthContext';
import { classifyTicketPath } from '../api/ticketApi';

interface TicketScanModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (products: TicketProduct[], meta: { fecha: string; total: number; moneda: string; comercio: string }) => void;
}

export default function TicketScanModal({ open, onClose, onSave }: TicketScanModalProps) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<TicketProduct[]>([]);
  const [meta, setMeta] = useState<{ fecha: string; total: number; moneda: string; comercio: string; imageUrl: string } | null>(null);
  const [error, setError] = useState("");

  const { user } = useAuth();

  const handleImageUploaded = async (file: File) => {
    setLoading(true);
    setError("");
    try {
      if (!user) throw new Error('Usuario no autenticado');
      if (!file || !(file instanceof File) || file.size === 0) {
        throw new Error('Debes seleccionar una imagen válida para subir el ticket.');
      }
      // Subir imagen al backend seguro y obtener imageUrl y filePath
      const { imageUrl, filePath } = await uploadTicketImage(file, user.id.toString());
      // Clasificar ticket usando filePath y userId
      const res = await classifyTicketPath(filePath, user.id.toString());
      setProducts(res.data.items || []);
      setMeta({
        fecha: res.data.fecha,
        total: res.data.total,
        moneda: res.data.moneda,
        comercio: res.data.comercio,
        imageUrl // Mostrar la imagen usando la signed URL
      });
    } catch (e: any) {
      setError(e.message || "Error procesando ticket");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (products.length && meta) {
      onSave(products, meta);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Escanear Ticket</h2>
        <TicketUpload onImageUploaded={handleImageUploaded} />
        {loading && <p className="text-blue-600 mt-4">Procesando ticket...</p>}
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {meta && (
          <div className="mt-4">
            {meta.imageUrl && (
              <img src={meta.imageUrl} alt="Ticket escaneado" className="w-48 h-auto rounded shadow mb-2 mx-auto" />
            )}
            <div className="mb-2 text-sm text-gray-700">
              <strong>Comercio:</strong> {meta.comercio} <br />
              <strong>Fecha:</strong> {meta.fecha} <br />
              <strong>Total:</strong> {meta.total} {meta.moneda}
            </div>
            <TicketProductList products={products} onChange={setProducts} />
            <button
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700"
              onClick={handleSave}
            >
              Guardar gastos
            </button>
          </div>
        )}
        <button className="mt-4 text-gray-500 hover:text-gray-700" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
}

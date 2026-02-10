import { useState } from "react";
import TicketUpload from "./TicketUpload";
import TicketProductList from "./TicketProductList";
import type { TicketProduct } from "./TicketProductList";
import { uploadTicketImage } from '../api/ticketUploadApi';
import { useAuth } from '../context/AuthContext';

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
  const [step, setStep] = useState(0); // 0: procesamiento, 1: edición

  const { user } = useAuth();

  const [imagePath, setImagePath] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

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
      setImagePath(filePath);
      setImageUrl(imageUrl);
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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 w-screen h-screen">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl min-h-[80vh] flex flex-col overflow-y-auto" style={{ maxHeight: '90vh' }}>
        <h2 className="text-xl font-bold mb-4">Escanear Ticket</h2>
        {/* Stepper UI */}
        <div className="flex justify-center mb-4">
          <button
            className={`px-4 py-2 rounded-l-lg ${step === 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setStep(0)}
            disabled={step === 0}
          >Procesamiento</button>
          <button
            className={`px-4 py-2 rounded-r-lg ${step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setStep(1)}
            disabled={!meta || step === 1}
          >Clasificación</button>
        </div>
        {/* Step 0: procesamiento */}
        {step === 0 && (
          <>
            <TicketUpload
              onImageUploaded={handleImageUploaded}
              imagePath={imagePath ?? undefined}
              onTicketProcessed={(items, metaData) => {
                setProducts(items);
                setMeta({ ...metaData, imageUrl: imageUrl ?? "" });
                setStep(1); // Avanza automáticamente al paso 1
              }}
            />
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
                <div className="mt-2 text-xs text-gray-500">Pulsa "Clasificación" para editar los gastos</div>
              </div>
            )}
          </>
        )}
        {/* Step 1: edición/clasificación */}
        {step === 1 && meta && (
          <div className="mt-4">
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

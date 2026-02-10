import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { processTicketReceipt } from "../api/receiptProcessApi";

interface TicketUploadProps {
  onImageUploaded: (file: File) => void;
  imagePath?: string; // ruta de la imagen subida
  onTicketProcessed?: (items: any[], meta: any) => void;
}

export default function TicketUpload({ onImageUploaded, imagePath, onTicketProcessed }: TicketUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onImageUploaded(file);
    }
  };

  // Procesa el ticket cuando imagePath cambia
  React.useEffect(() => {
    if (imagePath && token) {
      console.log('[TicketUpload] JWT token antes de procesar:', token);
      console.log('[TicketUpload] imagePath:', imagePath);
      setProcessing(true);
      setError(null);
      setResult(null);
      processTicketReceipt(imagePath, token)
        .then(res => {
          setResult(res);
          if (onTicketProcessed && res.data?.items) {
            onTicketProcessed(
              res.data.items.map((item: any) => ({
                name: item.nombre,
                amount: item.precio,
                category: item.categoria
              })),
              {
                comercio: res.data.comercio,
                fecha: res.data.fecha,
                total: res.data.total,
                moneda: res.data.moneda
              }
            );
          }
        })
        .catch(err => {
          setError(err.message);
        })
        .finally(() => {
          setProcessing(false);
        });
    } else {
      if (!token) {
        console.error('[TicketUpload] ERROR: token JWT no disponible');
      }
      if (!imagePath) {
        console.error('[TicketUpload] ERROR: imagePath no disponible');
      }
    }
  }, [imagePath, token, onTicketProcessed]);

  return (
    <div className="flex flex-col items-center gap-4">
      <label className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700">
        Subir foto de ticket
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
      {preview && (
        <img src={preview} alt="Preview" className="w-48 h-auto rounded shadow" />
      )}
      {processing && <div className="text-blue-600">Procesando ticket...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {result && (
        <div className="bg-green-100 p-4 rounded shadow w-full max-w-md">
          <div className="font-bold mb-2">Ticket procesado:</div>
          <div>Comercio: {result.data?.comercio}</div>
          <div>Fecha: {result.data?.fecha}</div>
          <div>Total: {result.data?.total} {result.data?.moneda}</div>
          <div className="mt-2 font-semibold">Items:</div>
          <ul className="list-disc pl-5">
            {result.data?.items?.map((item: any, idx: number) => (
              <li key={idx}>
                {item.nombre} - {item.precio} ({item.categoria})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

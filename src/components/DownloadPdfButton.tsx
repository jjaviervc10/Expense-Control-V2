import { useState } from "react";
import { CloudArrowDownIcon } from "@heroicons/react/24/outline";

type Props = {
  tipo: "diario" | "semanal" | "mensual";
};

export default function DownloadPdfButton({ tipo }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDownloadPdf = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/api/reset/pdf", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ categoria: tipo }),
      });

      if (!res.ok) {
        throw new Error("Error al generar PDF");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte_${tipo}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error(error);
      alert("Hubo un error al generar el reporte PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownloadPdf}
      disabled={loading}
      className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
    >
      <CloudArrowDownIcon className="w-5 h-5" />
      {loading ? "Generando..." : "Descargar PDF"}
    </button>
  );
}

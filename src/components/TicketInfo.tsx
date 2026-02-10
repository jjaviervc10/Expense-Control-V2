export default function TicketInfo({ comercio, fecha, total }: { comercio: string; fecha: string; total: number }) {
  return (
    <div className="mb-2 text-sm text-gray-700">
      <strong>Comercio:</strong> {comercio} <br />
      <strong>Fecha:</strong> {fecha} <br />
      <strong>Total:</strong> {total} MXN
    </div>
  );
}

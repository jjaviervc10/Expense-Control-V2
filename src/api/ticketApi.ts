// API para enviar path de imagen y userId al backend
const API_BASE = "https://expense-control-backend-production-abae.up.railway.app/api"; // Cambia por tu backend real

export async function classifyTicketPath(path: string, userId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/receipt/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ path, userId }), // Si el backend espera formData, ajustar aquí
  });

  if (!res.ok) throw new Error('Error subiendo ticket');
  return await res.json(); // { signedUrl, ...otrosDatos }
}

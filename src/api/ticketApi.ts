// API para enviar path de imagen y userId al backend
const API_BASE = "https://tu-backend-url/api"; // Cambia por tu backend real

export async function classifyTicketPath(path: string, userId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/tickets/classify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ path, userId }),
  });

  if (!res.ok) throw new Error('Error clasificando ticket');
  return await res.json(); // { message, data: { fecha, total, moneda, comercio, items } }
}

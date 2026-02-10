// Procesa el ticket usando el endpoint del backend
export async function processTicketReceipt(imagePath: string, jwtToken: string) {
  // Log para depuración
  console.log('[processTicketReceipt] imagePath:', imagePath);
  console.log('[processTicketReceipt] jwtToken:', jwtToken);
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtToken}`,
  };
  console.log('[processTicketReceipt] headers:', headers);
  const res = await fetch(
    'https://expense-control-backend-production-abae.up.railway.app/api/receipt/process',
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ imagePath }),
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error('[processTicketReceipt] Error backend:', errorText);
    throw new Error('Error procesando ticket: ' + errorText);
  }
  return await res.json();
}

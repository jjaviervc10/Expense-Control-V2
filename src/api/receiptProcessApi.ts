// Procesa el ticket usando el endpoint del backend
export async function processTicketReceipt(imagePath: string, jwtToken: string) {
  const res = await fetch(
    'https://expense-control-backend-production-abae.up.railway.app/api/receipt/process',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ imagePath }),
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error('Error procesando ticket: ' + errorText);
  }
  return await res.json();
}

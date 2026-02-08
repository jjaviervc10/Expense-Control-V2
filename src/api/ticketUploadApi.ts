// Subida de imagen de ticket usando el endpoint seguro del backend
export async function uploadTicketImage(file: File): Promise<{ imageUrl: string, filePath: string }> {
  const formData = new FormData();
  formData.append('file', file);
  // Obtener userId del contexto o como argumento
  const userId = localStorage.getItem('userId');
  if (userId) formData.append('userId', userId);
  // Logs para depuración
  console.log('[TicketUpload] file:', file);
  console.log('[TicketUpload] file name:', file.name);
  console.log('[TicketUpload] file type:', file.type);
  console.log('[TicketUpload] userId:', userId);
  for (let pair of formData.entries()) {
    console.log(`[TicketUpload] FormData: ${pair[0]} =`, pair[1]);
  }

  const res = await fetch('https://expense-control-backend-production-abae.up.railway.app/api/receipt/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('[TicketUpload] Error backend:', errorText);
    throw new Error('Error subiendo imagen a backend: ' + errorText);
  }
  return await res.json(); // { imageUrl, filePath }
}

// Subida de imagen de ticket usando el endpoint seguro del backend
export async function uploadTicketImage(file: File): Promise<{ imageUrl: string, filePath: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('https://expense-control-backend-production-abae.up.railway.app/api/receipt/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Error subiendo imagen a backend');
  return await res.json(); // { imageUrl, filePath }
}

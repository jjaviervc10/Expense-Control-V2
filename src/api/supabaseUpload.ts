// Subir imagen a Supabase Storage y obtener path
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tu-supabase-url'; // Cambia por tu URL
const supabaseKey = 'tu-supabase-key'; // Cambia por tu key
const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadToSupabase(file: File, userId: string): Promise<string> {
  const fileName = `${userId}_${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage.from('receipts').upload(fileName, file);
  if (error) throw new Error('Error subiendo imagen a Supabase');
  return data.path; // path en el bucket receipts
}

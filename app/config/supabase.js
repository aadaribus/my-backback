import { createClient } from '@supabase/supabase-js';

// Obtener variables de entorno
let supabaseUrl = process.env.SUPABASE_URL;
let supabaseKey = process.env.SUPABASE_ANON_KEY;

// Crear cliente de Supabase solo si las variables existen
export let supabase = null;

// Función para validar y reintentar la conexión
export function initSupabase() {
  supabaseUrl = process.env.SUPABASE_URL;
  supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Falta configurar SUPABASE_URL y SUPABASE_ANON_KEY en .env');
    return false;
  }
  
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Conexión a Supabase inicializada correctamente');
  return true;
}

import { createClient } from '@supabase/supabase-js';

// Obtenemos las variables directamente
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Creamos e exportamos el cliente de una vez
// Si no existen, Supabase mismo lanzará un error claro al intentar usarlo
export const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ Intento de conexión a Supabase configurado');

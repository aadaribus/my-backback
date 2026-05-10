import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Intentar leer el archivo .env manualmente como fallback
const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  console.log('✅ Archivo .env encontrado en:', envPath);
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key] = value;
    }
  });
}

// Obtenemos las variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Diagnóstico
console.log('DEBUG: SUPABASE_URL =', supabaseUrl?.substring(0, 30) + '...');
console.log('DEBUG: SUPABASE_ANON_KEY =', supabaseKey ? 'definida' : 'UNDEFINED');

// Validar antes de crear el cliente
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de Supabase no están definidas');
  process.exit(1);
}

// Creamos e exportamos el cliente
export const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ Conexión a Supabase configurada correctamente');

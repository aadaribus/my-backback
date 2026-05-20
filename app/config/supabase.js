import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Iniciando carga de variables de Supabase...');

// Paso 1: Intentar cargar .env si está en desarrollo
const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  console.log('✅ Archivo .env encontrado en:', envPath);
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const indexOfEquals = trimmedLine.indexOf('=');
      if (indexOfEquals > 0) {
        const key = trimmedLine.substring(0, indexOfEquals).trim();
        const value = trimmedLine.substring(indexOfEquals + 1).trim();
        if (key && value && !process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
  console.log('✅ Variables .env cargadas correctamente');
} else {
  console.log('⚠️ Archivo .env NO encontrado (normal en Render/producción)');
}

// Paso 2: Obtenemos las variables (del .env o del sistema)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Diagnóstico detallado
console.log('\n========== DIAGNÓSTICO SUPABASE ==========');
console.log('✓ SUPABASE_URL:', supabaseUrl ? '✅ Configurada' : '❌ NO ENCONTRADA');
if (supabaseUrl) console.log('  └─ URL:', supabaseUrl.substring(0, 40) + '...');
console.log('✓ SUPABASE_ANON_KEY:', supabaseKey ? '✅ Configurada' : '❌ NO ENCONTRADA');
if (supabaseKey) console.log('  └─ Longitud:', supabaseKey.length, 'caracteres');
console.log('=========================================\n');

// Validar antes de crear el cliente
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR CRÍTICO: Variables de Supabase no están definidas');
  console.error('Por favor verifica que hayas configurado:');
  console.error('  - SUPABASE_URL');
  console.error('  - SUPABASE_ANON_KEY');
  console.error('\nEn desarrollo: crea .env con estas variables');
  console.error('En Render: configúralas en Settings > Environment');
  process.exit(1);
}

// Crear cliente de Supabase con manejo de errores
let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ CONEXIÓN A SUPABASE: EXITOSA');
} catch (error) {
  console.error('❌ Error al crear cliente de Supabase:', error.message);
  process.exit(1);
}

export { supabase };

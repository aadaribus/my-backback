#!/usr/bin/env node
/**
 * Diagnóstico de Conexión a Supabase
 * Ejecuta: node diagnostic.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '.env');

console.log('\n╔════════════════════════════════════════╗');
console.log('║  DIAGNÓSTICO DE SUPABASE              ║');
console.log('╚════════════════════════════════════════╝\n');

// Paso 1: Verificar existencia del archivo .env
console.log('📋 PASO 1: Verificar archivo .env');
if (fs.existsSync(envPath)) {
  console.log('  ✅ Archivo .env encontrado en:', envPath);
} else {
  console.log('  ❌ Archivo .env NO encontrado');
  console.log('     Crea uno basado en .env.example');
  process.exit(1);
}

// Paso 2: Leer variables del archivo .env
console.log('\n📋 PASO 2: Leer variables del .env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const indexOfEquals = trimmed.indexOf('=');
    if (indexOfEquals > 0) {
      const key = trimmed.substring(0, indexOfEquals).trim();
      const value = trimmed.substring(indexOfEquals + 1).trim();
      envVars[key] = value;
    }
  }
});

// Paso 3: Validar variables críticas
console.log('\n📋 PASO 3: Validar variables de Supabase');

const supabaseUrl = envVars.SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_ANON_KEY;

const checks = [
  {
    name: 'SUPABASE_URL',
    present: !!supabaseUrl,
    valid: supabaseUrl && supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co'),
    value: supabaseUrl ? supabaseUrl.substring(0, 50) + '...' : 'NO CONFIGURADA'
  },
  {
    name: 'SUPABASE_ANON_KEY',
    present: !!supabaseKey,
    valid: supabaseKey && supabaseKey.length > 50,
    value: supabaseKey ? supabaseKey.substring(0, 30) + '...' : 'NO CONFIGURADA'
  }
];

checks.forEach(check => {
  const status = check.valid ? '✅' : check.present ? '⚠️' : '❌';
  console.log(`  ${status} ${check.name}:`);
  console.log(`     └─ ${check.value}`);
  if (!check.valid) {
    if (!check.present) {
      console.log(`     └─ ERROR: Variable no encontrada`);
    } else {
      console.log(`     └─ ADVERTENCIA: Formato podría ser incorrecto`);
    }
  }
});

// Paso 4: Prueba de conexión real
console.log('\n📋 PASO 4: Prueba de conexión a Supabase');

if (!supabaseUrl || !supabaseKey) {
  console.log('  ❌ No se puede probar conexión - faltan credenciales');
  console.log('\n📌 PRÓXIMOS PASOS:');
  console.log('  1. Ve a https://supabase.com');
  console.log('  2. Abre tu proyecto');
  console.log('  3. Ve a Settings > API');
  console.log('  4. Copia Project URL y copla "anon public" key');
  console.log('  5. Pega estos valores en el archivo .env');
  process.exit(1);
}

try {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from('users')
    .select('count', { count: 'exact' })
    .limit(1);

  if (error) {
    console.log('  ❌ Error de Supabase:', error.message);
    console.log('\n📌 POSIBLES CAUSAS:');
    console.log('  1. Las credenciales son inválidas');
    console.log('  2. La tabla "users" no existe');
    console.log('  3. No tienes permisos de lectura en la tabla');
    console.log('  4. Row Level Security (RLS) está bloqueando el acceso');
  } else {
    console.log('  ✅ Conexión exitosa');
    console.log(`  └─ Tabla "users" accesible`);
  }
} catch (err) {
  console.log('  ❌ Error al conectar:', err.message);
  console.log('\n📌 Soluciones posibles:');
  console.log('  1. Verifica que tengas instalado: npm install @supabase/supabase-js');
  console.log('  2. Comprueba que las credenciales sean exactas');
  console.log('  3. Asegúrate que tienes conexión a internet');
}

console.log('\n✅ Diagnóstico completado\n');

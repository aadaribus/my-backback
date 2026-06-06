#!/usr/bin/env node

/**
 * Script de Validación - Mi Mochila v2.0
 * Verifica que todos los archivos necesarios existan
 * y que las configuraciones sean correctas
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function checkFile(filePath, description) {
  const fullPath = path.join(__dirname, filePath);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description} - NO ENCONTRADO`, 'red');
    log(`   Ruta: ${filePath}`, 'yellow');
    return false;
  }
}

function checkContent(filePath, searchString, description) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    log(`⚠️  Archivo no existe: ${filePath}`, 'yellow');
    return false;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const exists = content.includes(searchString);
  
  if (exists) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description} - NO ENCONTRADO`, 'red');
    return false;
  }
}

// Main validation
log('\n🔍 VALIDACIÓN DEL PROYECTO - MI MOCHILA v2.0\n', 'cyan');

log('📁 VERIFICANDO ARCHIVOS PRINCIPALES...', 'blue');
log('═══════════════════════════════════════\n', 'blue');

let passed = 0;
let failed = 0;

// Backend Controllers
log('📦 Controladores Backend:', 'cyan');
if (checkFile('app/controllers/profiledate.controller.js', 'profiledate.controller.js')) passed++; else failed++;
if (checkFile('app/controllers/materialuser.controller.js', 'materialuser.controller.js')) passed++; else failed++;
if (checkFile('app/controllers/bookdigital.controller.js', 'bookdigital.controller.js')) passed++; else failed++;
if (checkFile('app/controllers/gruppro.controller.js', 'gruppro.controller.js')) passed++; else failed++;
if (checkFile('app/controllers/tareapro.controller.js', 'tareapro.controller.js')) passed++; else failed++;
console.log('');

// Frontend Files
log('🎨 Archivos Frontend:', 'cyan');
if (checkFile('app/public/home-new.js', 'home-new.js')) passed++; else failed++;
if (checkFile('app/page/home/home-new.html', 'home-new.html')) passed++; else failed++;
console.log('');

// Configuration Files
log('⚙️  Archivos de Configuración:', 'cyan');
if (checkFile('app/index.js', 'app/index.js (Principal)')) passed++; else failed++;
if (checkFile('.env', '.env (Variables de entorno)')) passed++; else failed++;
if (checkFile('package.json', 'package.json (Dependencias)')) passed++; else failed++;
console.log('');

// Database Files
log('🗄️  Archivos de Base de Datos:', 'cyan');
if (checkFile('SUPABASE_NUEVAS_TABLAS.sql', 'SUPABASE_NUEVAS_TABLAS.sql')) passed++; else failed++;
console.log('');

// Documentation Files
log('📚 Documentación:', 'cyan');
if (checkFile('GUIA_IMPLEMENTACION_NUEVAS_TABLAS.md', 'GUIA_IMPLEMENTACION_NUEVAS_TABLAS.md')) passed++; else failed++;
if (checkFile('ENDPOINTS_API_v2.md', 'ENDPOINTS_API_v2.md')) passed++; else failed++;
if (checkFile('RESUMEN_CAMBIOS_v2.md', 'RESUMEN_CAMBIOS_v2.md')) passed++; else failed++;
console.log('');

// Validating Content
log('\n🔍 VALIDANDO CONTENIDO DE ARCHIVOS...', 'blue');
log('═══════════════════════════════════════\n', 'blue');

// Check app/index.js for imports
log('📥 Imports en app/index.js:', 'cyan');
if (checkContent('app/index.js', 'profiledate.controller', 'Import: profiledate.controller')) passed++; else failed++;
if (checkContent('app/index.js', 'materialuser.controller', 'Import: materialuser.controller')) passed++; else failed++;
if (checkContent('app/index.js', 'bookdigital.controller', 'Import: bookdigital.controller')) passed++; else failed++;
if (checkContent('app/index.js', 'gruppro.controller', 'Import: gruppro.controller')) passed++; else failed++;
if (checkContent('app/index.js', 'tareapro.controller', 'Import: tareapro.controller')) passed++; else failed++;
console.log('');

// Check app/index.js for routes
log('🛣️  Routes en app/index.js:', 'cyan');
if (checkContent('app/index.js', '/api/profiledate', 'Route: /api/profiledate')) passed++; else failed++;
if (checkContent('app/index.js', '/api/materialuser', 'Route: /api/materialuser')) passed++; else failed++;
if (checkContent('app/index.js', '/api/bookdigital', 'Route: /api/bookdigital')) passed++; else failed++;
if (checkContent('app/index.js', '/api/bookhistory', 'Route: /api/bookhistory')) passed++; else failed++;
if (checkContent('app/index.js', '/api/gruppro', 'Route: /api/gruppro')) passed++; else failed++;
if (checkContent('app/index.js', '/api/tareapro', 'Route: /api/tareapro')) passed++; else failed++;
console.log('');

// Check Frontend JavaScript
log('🎬 Funciones en home-new.js:', 'cyan');
if (checkContent('app/public/home-new.js', 'iniciarCamara', 'Función: iniciarCamara()')) passed++; else failed++;
if (checkContent('app/public/home-new.js', 'capturarFoto', 'Función: capturarFoto()')) passed++; else failed++;
if (checkContent('app/public/home-new.js', 'iniciarMicrófono', 'Función: iniciarMicrófono()')) passed++; else failed++;
if (checkContent('app/public/home-new.js', 'detenerMicrófono', 'Función: detenerMicrófono()')) passed++; else failed++;
if (checkContent('app/public/home-new.js', 'loadHistorialData', 'Función: loadHistorialData()')) passed++; else failed++;
console.log('');

// Check Frontend HTML
log('📄 Elementos en home-new.html:', 'cyan');
if (checkContent('app/page/home/home-new.html', 'id="cameraPreview"', 'Elemento: cameraPreview')) passed++; else failed++;
if (checkContent('app/page/home/home-new.html', 'id="recordingIndicator"', 'Elemento: recordingIndicator')) passed++; else failed++;
if (checkContent('app/page/home/home-new.html', 'id="notebookEditor"', 'Elemento: notebookEditor')) passed++; else failed++;
if (checkContent('app/page/home/home-new.html', 'id="perfilModal"', 'Modal: perfilModal')) passed++; else failed++;
if (checkContent('app/page/home/home-new.html', 'id="materiaModal"', 'Modal: materiaModal')) passed++; else failed++;
if (checkContent('app/page/home/home-new.html', 'id="notebookModal"', 'Modal: notebookModal')) passed++; else failed++;
if (checkContent('app/page/home/home-new.html', 'id="historialModal"', 'Modal: historialModal')) passed++; else failed++;
console.log('');

// Results Summary
log('\n📊 RESUMEN DE VALIDACIÓN', 'blue');
log('═════════════════════════\n', 'blue');

const total = passed + failed;
const percentage = Math.round((passed / total) * 100);

log(`✅ Pasados:  ${passed}/${total}`, 'green');
log(`❌ Fallidos: ${failed}/${total}`, 'red');
log(`📊 Porcentaje: ${percentage}%\n`, 'cyan');

if (failed === 0) {
  log('🎉 ¡VALIDACIÓN EXITOSA! - El proyecto está listo', 'green');
  log('\n📋 Próximos pasos:', 'cyan');
  log('1. Ejecutar SQL en Supabase: SUPABASE_NUEVAS_TABLAS.sql', 'yellow');
  log('2. Iniciar servidor: npm start', 'yellow');
  log('3. Abrir navegador: http://localhost:10000', 'yellow');
  log('4. Hacer login y probar nuevas funcionalidades', 'yellow');
} else {
  log('⚠️  VALIDACIÓN INCOMPLETA - Revisa los errores anteriores', 'red');
  log('\n💡 Sugerencias:', 'cyan');
  log('• Verifica que todos los archivos estén en su lugar', 'yellow');
  log('• Revisa GUIA_IMPLEMENTACION_NUEVAS_TABLAS.md para instrucciones', 'yellow');
  log('• Si faltan archivos, cópialos del repositorio', 'yellow');
}

log('\n═════════════════════════════════════════\n', 'blue');

process.exit(failed > 0 ? 1 : 0);

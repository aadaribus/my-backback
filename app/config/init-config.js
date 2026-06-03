// app/config/init-config.js
// Archivo de inicialización y configuración de la aplicación
// Versión 2.0 - Mi Mochila Digital

import { supabase } from './supabase.js';

/**
 * CONFIGURACIÓN DE INICIALIZACIÓN v2.0
 * 
 * Este archivo verifica que todo está correctamente configurado
 * y prepara la aplicación para funcionar.
 */

// ============================================
// 1. CONFIGURACIÓN DE TABLAS REQUERIDAS
// ============================================

const TABLAS_REQUERIDAS = {
    profiledate: {
        nombre: 'Perfil del Usuario',
        descripcion: 'Almacena información personal del usuario',
        campos: ['id', 'user_id', 'namecomplet', 'usermail', 'userfone', 'useruni']
    },
    materialuser: {
        nombre: 'Materias/Asignaturas',
        descripcion: 'Gestiona las materias de estudio',
        campos: ['id', 'user_id', 'admaterial', 'nameprof', 'horauser', 'descriptionmateria']
    },
    bookdigital: {
        nombre: 'Cuaderno Digital',
        descripcion: 'Notas y apuntes de estudiantes',
        campos: ['id', 'user_id', 'materialuser_id', 'texmaterial', 'imagmaterial', 'vozmaterial', 'moviematerial']
    },
    bookhistory: {
        nombre: 'Historial de Cuaderno',
        descripcion: 'Historial inmutable de notas guardadas',
        campos: ['id', 'user_id', 'materialuser_id', 'texmaterial', 'imagmaterial', 'vozmaterial', 'moviematerial']
    },
    gruppro: {
        nombre: 'Grupos de Estudio',
        descripcion: 'Grupos de estudiantes para estudiar juntos',
        campos: ['id', 'user_id', 'grupname', 'grupdecription', 'grupmail']
    },
    tareapro: {
        nombre: 'Tareas/Asignaciones',
        descripcion: 'Gestión de tareas y asignaciones',
        campos: ['id', 'user_id', 'tareaname', 'tareadescription', 'datetarea', 'imagentarea', 'completed']
    }
};

// ============================================
// 2. VERIFICACIÓN DE CONFIGURACIÓN
// ============================================

/**
 * Verificar que todas las variables de entorno estén configuradas
 */
export function verificarVariablesAmbiente() {
    console.log('\n🔍 VERIFICANDO VARIABLES DE AMBIENTE...\n');
    
    const variables = {
        'SUPABASE_URL': process.env.SUPABASE_URL,
        'SUPABASE_ANON_KEY': process.env.SUPABASE_ANON_KEY,
        'PORT': process.env.PORT || '10000',
        'NODE_ENV': process.env.NODE_ENV || 'development'
    };
    
    let todoBien = true;
    
    Object.entries(variables).forEach(([key, value]) => {
        if (!value) {
            console.log(`❌ ${key}: NO CONFIGURADA`);
            todoBien = false;
        } else {
            const display = key.includes('KEY') ? value.substring(0, 20) + '...' : value;
            console.log(`✅ ${key}: ${display}`);
        }
    });
    
    console.log('');
    return todoBien;
}

/**
 * Verificar que todas las tablas de Supabase existan
 */
export async function verificarTablas() {
    console.log('📊 VERIFICANDO TABLAS DE SUPABASE...\n');
    
    let todasExisten = true;
    
    for (const [nombreTabla, info] of Object.entries(TABLAS_REQUERIDAS)) {
        try {
            // Intentar hacer un SELECT con LIMIT 1
            const { error } = await supabase
                .from(nombreTabla)
                .select('*')
                .limit(1);
            
            if (error) {
                if (error.code === 'PGRST116') {
                    // Tabla no existe
                    console.log(`❌ ${info.nombre} (${nombreTabla}): NO EXISTE`);
                    todasExisten = false;
                } else {
                    // Otro error
                    console.log(`⚠️  ${info.nombre} (${nombreTabla}): Error - ${error.message}`);
                }
            } else {
                console.log(`✅ ${info.nombre} (${nombreTabla}): OK`);
            }
        } catch (error) {
            console.log(`❌ ${info.nombre} (${nombreTabla}): Error de conexión`);
            todasExisten = false;
        }
    }
    
    console.log('');
    return todasExisten;
}

/**
 * Verificar que el usuario esté autenticado
 */
export async function verificarAutenticacion() {
    console.log('🔐 VERIFICANDO AUTENTICACIÓN...\n');
    
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
            console.log('⚠️  No hay sesión activa (esto es normal)');
            return false;
        }
        
        if (user) {
            console.log(`✅ Usuario autenticado: ${user.email}`);
            return true;
        }
    } catch (error) {
        console.log(`⚠️  Error al verificar autenticación: ${error.message}`);
    }
    
    console.log('');
    return false;
}

// ============================================
// 3. INICIALIZACIÓN COMPLETA
// ============================================

/**
 * Ejecutar todas las verificaciones
 */
export async function inicializarApp() {
    console.log('═════════════════════════════════════');
    console.log('🚀 INICIALIZANDO MI MOCHILA v2.0');
    console.log('═════════════════════════════════════\n');
    
    // 1. Verificar variables
    const variablesOK = verificarVariablesAmbiente();
    
    if (!variablesOK) {
        console.error('❌ ERROR: Variables de ambiente incompletas');
        console.error('Por favor configura todas las variables requeridas en .env o en Render');
        process.exit(1);
    }
    
    // 2. Verificar tablas
    const tablasOK = await verificarTablas();
    
    if (!tablasOK) {
        console.warn('⚠️  ADVERTENCIA: Algunas tablas no existen');
        console.warn('Ejecuta SUPABASE_NUEVAS_TABLAS.sql en Supabase SQL Editor');
        console.warn('O ve a: app/config/supabase-examples-v2.js para ver ejemplos');
    }
    
    // 3. Verificar autenticación
    await verificarAutenticacion();
    
    console.log('═════════════════════════════════════');
    console.log('✅ INICIALIZACIÓN COMPLETADA');
    console.log('═════════════════════════════════════\n');
    
    return {
        variablesOK,
        tablasOK,
        listo: variablesOK && tablasOK
    };
}

// ============================================
// 4. FUNCIONES AUXILIARES
// ============================================

/**
 * Obtener resumen de la configuración
 */
export function obtenerResumenConfiguracion() {
    return {
        version: '2.0',
        fecha: new Date().toISOString(),
        ambiente: process.env.NODE_ENV || 'development',
        puerto: process.env.PORT || 10000,
        tablas: Object.keys(TABLAS_REQUERIDAS).length,
        supabaseConfigured: !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY)
    };
}

/**
 * Mostrar documentación de configuración
 */
export function mostrarDocumentacion() {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║         MI MOCHILA v2.0 - GUÍA DE CONFIGURACIÓN            ║
╚════════════════════════════════════════════════════════════╝

📋 PASOS DE CONFIGURACIÓN:

1. VARIABLES DE AMBIENTE (.env)
   Copia las siguientes en tu archivo .env:
   
   SUPABASE_URL=https://tu-proyecto.supabase.co
   SUPABASE_ANON_KEY=tu_clave_anonima
   PORT=10000
   NODE_ENV=development

2. BASE DE DATOS (Supabase)
   Ejecuta el siguiente archivo en Supabase SQL Editor:
   → app/config/SUPABASE_NUEVAS_TABLAS.sql
   
   Este archivo crea:
   - 6 tablas necesarias
   - Políticas de seguridad (RLS)
   - Triggers para historial automático
   - Vistas para consultas optimizadas

3. EJEMPLOS DE USO
   Consulta: app/config/supabase-examples-v2.js
   Contiene ejemplos de todas las operaciones CRUD

4. INSTALAR DEPENDENCIAS
   npm install

5. INICIAR SERVIDOR
   npm start

6. PROBAR APLICACIÓN
   http://localhost:10000

═════════════════════════════════════════════════════════════

📊 TABLAS DISPONIBLES:

${Object.entries(TABLAS_REQUERIDAS).map(([nombre, info]) => 
    `  • ${info.nombre} (${nombre})\n    ${info.descripcion}`
).join('\n')}

═════════════════════════════════════════════════════════════

🎓 GUÍA DE USO:
   Ver: app/page/about.html

📚 DOCUMENTACIÓN COMPLETA:
   Ver: GUIA_IMPLEMENTACION_NUEVAS_TABLAS.md
        ENDPOINTS_API_v2.md
        README_v2.md

═════════════════════════════════════════════════════════════
    `);
}

// Exportar función para ejecutar al iniciar
export default {
    verificarVariablesAmbiente,
    verificarTablas,
    verificarAutenticacion,
    inicializarApp,
    obtenerResumenConfiguracion,
    mostrarDocumentacion,
    TABLAS_REQUERIDAS
};

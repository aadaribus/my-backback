// app/config/supabase-examples-v2.js
// Ejemplos de uso de Supabase v2.0 con las nuevas tablas
// Importa este archivo para ver ejemplos reales de cómo usar la API

import { supabase } from './supabase.js';

/**
 * EJEMPLOS COMPLETOS - MI MOCHILA v2.0
 * 
 * Nuevas tablas disponibles:
 * - profiledate: Perfil del usuario
 * - materialuser: Materias/Asignaturas
 * - bookdigital: Cuaderno digital (editable)
 * - bookhistory: Historial (solo lectura)
 * - gruppro: Grupos de estudio
 * - tareapro: Tareas/Asignaciones
 */

// ============================================
// 1. PROFILEDATE (Perfil del Usuario)
// ============================================

/**
 * Ejemplo: Obtener perfil del usuario actual
 * GET /api/profiledate
 */
export async function ejemploObtenerPerfil() {
    try {
        const { data, error } = await supabase
            .from('profiledate')
            .select('id, user_id, namecomplet, usermail, userfone, useruni, created_at, updated_at')
            .single();
        
        if (error) throw error;
        console.log('✅ Perfil obtenido:', data);
        return data;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return null;
    }
}

/**
 * Ejemplo: Actualizar perfil del usuario
 * PUT /api/profiledate
 */
export async function ejemploActualizarPerfil() {
    try {
        const perfilActualizado = {
            namecomplet: "Juan García López",
            usermail: "juan@universidad.edu.es",
            userfone: "+34 612 345 678",
            useruni: "Universidad de Madrid"
        };

        const { data, error } = await supabase
            .from('profiledate')
            .upsert(perfilActualizado)
            .select()
            .single();
        
        if (error) throw error;
        console.log('✅ Perfil actualizado:', data);
        return data;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return null;
    }
}

// ============================================
// 2. MATERIALUSER (Materias)
// ============================================

/**
 * Ejemplo: Crear nueva materia
 * POST /api/materialuser/crear
 */
export async function ejemploCrearMateria() {
    try {
        const materiaData = {
            admaterial: "Matemáticas Avanzadas",
            nameprof: "Dr. Carlos García",
            horauser: "Lunes y Miércoles 9:00 AM",
            descriptionmateria: "Cálculo diferencial e integral para ingeniería"
        };

        const { data, error } = await supabase
            .from('materialuser')
            .insert(materiaData)
            .select()
            .single();
        
        if (error) throw error;
        console.log('✅ Materia creada:', data);
        return data;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return null;
    }
}

/**
 * Ejemplo: Obtener todas las materias
 * GET /api/materialuser
 */
export async function ejemploObtenerMaterias() {
    try {
        const { data, error } = await supabase
            .from('materialuser')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        console.log('✅ Materias obtenidas:', data);
        return data;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return [];
    }
}

/**
 * Ejemplo: Obtener materia por ID
 * GET /api/materialuser/:id
 */
export async function ejemploObtenerMateria(materiaId) {
    try {
        const { data, error } = await supabase
            .from('materialuser')
            .select('*')
            .eq('id', materiaId)
            .single();
        
        if (error) throw error;
        console.log('✅ Materia obtenida:', data);
        return data;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return null;
    }
}

// ============================================
// 3. BOOKDIGITAL (Cuaderno Digital)
// ============================================

/**
 * Ejemplo: Guardar entrada en cuaderno digital
 * POST /api/bookdigital/guardar
 */
export async function ejemploGuardarEntrada() {
    try {
        const entradaData = {
            materialuser_id: 1, // ID de la materia
            texmaterial: "<h2>Tema: Derivadas</h2><p>La derivada es...</p>",
            imagmaterial: ["data:image/jpeg;base64,..."], // Array de Data URLs
            vozmaterial: ["data:audio/webm;base64,..."],   // Array de Data URLs
            moviematerial: []                               // Array vacío o con videos
        };

        const { data, error } = await supabase
            .from('bookdigital')
            .insert(entradaData)
            .select()
            .single();
        
        if (error) throw error;
        console.log('✅ Entrada guardada (automáticamente copiada a historial):', data);
        return data;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return null;
    }
}

/**
 * Ejemplo: Obtener todas las entradas del cuaderno
 * GET /api/bookdigital
 */
export async function ejemploObtenerEntradas() {
    try {
        const { data, error } = await supabase
            .from('bookdigital_with_materials')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        console.log('✅ Entradas obtenidas:', data);
        return data;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return [];
    }
}

/**
 * Ejemplo: Obtener entradas por materia específica
 * GET /api/bookdigital/:materialuser_id
 */
export async function ejemploObtenerEntradasPorMateria(materiaId) {
    try {
        const { data, error } = await supabase
            .from('bookdigital_with_materials')
            .select('*')
            .eq('materialuser_id', materiaId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        console.log('✅ Entradas de materia obtenidas:', data);
        return data;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return [];
    }
}

// ============================================
// 4. BOOKHISTORY (Historial - Solo Lectura)
// ============================================

/**
 * Ejemplo: Obtener historial completo (SOLO LECTURA)
 * GET /api/bookhistory
 * 
 * NOTA: El historial se llena automáticamente cuando guardas en bookdigital
 * No se puede editar, solo ver
 */
export async function ejemploObtenerHistorial() {
    try {
        const { data, error } = await supabase
            .from('bookhistory_with_materials')
            .select('*')
            .order('saved_at', { ascending: false });
        
        if (error) throw error;
        console.log('✅ Historial obtenido:', data);
        console.log('🔒 NOTA: El historial es solo lectura (no editable)');
        return data;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return [];
    }
}

// ============================================
// 5. GRUPPRO (Grupos de Estudio)
// ============================================

/**
 * Ejemplo: Crear grupo de estudio
 * POST /api/gruppro/crear
 */
export async function ejemploCrearGrupo() {
    try {
        const grupoData = {
            grupname: "Grupo de Matemáticas Avanzadas",
            grupdecription: "Grupo para estudiar juntos cálculo y álgebra lineal",
            grupmail: "miembro@universidad.edu.es" // Email para invitar
        };

        const { data, error } = await supabase
            .from('gruppro')
            .insert(grupoData)
            .select()
            .single();
        
        if (error) throw error;
        console.log('✅ Grupo creado:', data);
        return data;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return null;
    }
}

/**
 * Ejemplo: Obtener todos los grupos
 * GET /api/gruppro
 */
export async function ejemploObtenerGrupos() {
    try {
        const { data, error } = await supabase
            .from('gruppro')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        console.log('✅ Grupos obtenidos:', data);
        return data;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return [];
    }
}

// ============================================
// 6. TAREAPRO (Tareas)
// ============================================

/**
 * Ejemplo: Crear nueva tarea
 * POST /api/tareapro/crear
 */
export async function ejemploCrearTarea() {
    try {
        const tareaData = {
            tareaname: "Ejercicio 1: Resolver ecuaciones diferenciales",
            tareadescription: "Resolver los 10 ejercicios de la página 45-47 del libro",
            datetarea: "2026-06-15", // Formato: YYYY-MM-DD
            materialuser_id: 1, // ID de la materia (opcional)
            completed: false
        };

        const { data, error } = await supabase
            .from('tareapro')
            .insert(tareaData)
            .select()
            .single();
        
        if (error) throw error;
        console.log('✅ Tarea creada:', data);
        return data;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return null;
    }
}

/**
 * Ejemplo: Obtener todas las tareas
 * GET /api/tareapro
 */
export async function ejemploObtenerTareas() {
    try {
        const { data, error } = await supabase
            .from('tareapro')
            .select('*')
            .order('datetarea', { ascending: true });
        
        if (error) throw error;
        console.log('✅ Tareas obtenidas:', data);
        return data;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return [];
    }
}

/**
 * Ejemplo: Marcar tarea como completada
 * PUT /api/tareapro/:id
 */
export async function ejemploCompletarTarea(tareaId) {
    try {
        const { data, error } = await supabase
            .from('tareapro')
            .update({ completed: true })
            .eq('id', tareaId)
            .select()
            .single();
        
        if (error) throw error;
        console.log('✅ Tarea marcada como completada:', data);
        return data;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return null;
    }
}

// ============================================
// EJEMPLOS DE USO COMPLETO
// ============================================

/**
 * Ejemplo: Flujo completo de uso
 * 1. Crear perfil
 * 2. Agregar materia
 * 3. Guardar nota en cuaderno
 * 4. Ver en historial
 * 5. Crear tarea relacionada
 */
export async function ejemploFlujoCompleto() {
    console.log('\n📚 INICIANDO FLUJO COMPLETO DE EJEMPLO...\n');

    // 1. Actualizar perfil
    console.log('1️⃣ Actualizando perfil...');
    await ejemploActualizarPerfil();

    // 2. Crear materia
    console.log('\n2️⃣ Creando materia...');
    const materia = await ejemploCrearMateria();

    // 3. Guardar nota en cuaderno
    if (materia) {
        console.log('\n3️⃣ Guardando nota en cuaderno...');
        await ejemploGuardarEntrada();
    }

    // 4. Ver historial
    console.log('\n4️⃣ Obteniendo historial...');
    await ejemploObtenerHistorial();

    // 5. Crear tarea
    console.log('\n5️⃣ Creando tarea...');
    await ejemploCrearTarea();

    // 6. Crear grupo
    console.log('\n6️⃣ Creando grupo de estudio...');
    await ejemploCrearGrupo();

    console.log('\n✅ FLUJO COMPLETO FINALIZADO\n');
}

// Para ejecutar el flujo completo, descomenta la siguiente línea:
// ejemploFlujoCompleto();

export default {
    ejemploObtenerPerfil,
    ejemploActualizarPerfil,
    ejemploCrearMateria,
    ejemploObtenerMaterias,
    ejemploObtenerMateria,
    ejemploGuardarEntrada,
    ejemploObtenerEntradas,
    ejemploObtenerEntradasPorMateria,
    ejemploObtenerHistorial,
    ejemploCrearGrupo,
    ejemploObtenerGrupos,
    ejemploCrearTarea,
    ejemploObtenerTareas,
    ejemploCompletarTarea,
    ejemploFlujoCompleto
};

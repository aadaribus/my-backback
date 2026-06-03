// app/config/supabase-examples.js
// Este archivo contiene ejemplos de cómo usar Supabase en tu proyecto
// Versión 2.0 - Actualizado con nuevas tablas

import { supabase } from './supabase.js';

/**
 * EJEMPLOS DE CONSULTAS A SUPABASE v2.0
 * Puedes usar estos ejemplos como referencia para expandir tu aplicación
 * NUEVAS TABLAS: profiledate, materialuser, bookdigital, bookhistory, gruppro, tareapro
 */

// ============================================
// 1. PROFILEDATE (Perfil del Usuario)
// ============================================

/**
 * Obtener perfil del usuario actual
 */
export async function obtenerPerfilUsuario() {
    const { data, error } = await supabase
        .from('profiledate')
        .select('*')
        .single();
    
    if (error) {
        console.error('Error al obtener perfil:', error);
        return null;
    }
    return data;
}

/**
 * Actualizar perfil del usuario
 */
export async function actualizarPerfilUsuario(perfilData) {
    const { namecomplet, usermail, userfone, useruni } = perfilData;
    const { data, error } = await supabase
        .from('profiledate')
        .upsert({
            namecomplet,
            usermail,
            userfone,
            useruni,
            updated_at: new Date()
        })
        .select()
        .single();
    
    if (error) {
        console.error('Error al actualizar perfil:', error);
        return null;
    }
    return data;
}

// ============================================
// 2. MATERIALUSER (Materias)
// ============================================

/**
 * Crear nueva materia
 */
export async function crearMateria(materiaData) {
    const { admaterial, nameprof, horauser, descriptionmateria } = materiaData;
    const { data, error } = await supabase
        .from('materialuser')
        .insert({
            admaterial,
            nameprof,
            horauser,
            descriptionmateria,
            created_at: new Date()
        })
        .select()
        .single();
    
    if (error) {
        console.error('Error al crear materia:', error);
        return null;
    }
    return data;
}

/**
 * Obtener todas las materias del usuario
 */
export async function obtenerMaterias() {
    const { data, error } = await supabase
        .from('materialuser')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error al obtener materias:', error);
        return [];
    }
    return data;
}

/**
 * Obtener materia por ID
 */
export async function obtenerTodosUsuarios() {
    const { data, error } = await supabase
        .from('users')
        .select('id, username, email, created_at'); // No incluir password por seguridad
    
    if (error) {
        console.error('Error:', error);
        return [];
    }
    return data;
}

/**
 * Actualizar perfil de usuario
 */
export async function actualizarPerfil(userId, actualizaciones) {
    const { data, error } = await supabase
        .from('users')
        .update(actualizaciones)
        .eq('id', userId)
        .select()
        .single();
    
    if (error) {
        console.error('Error:', error);
        return null;
    }
    return data;
}

/**
 * Eliminar usuario
 */
export async function eliminarUsuario(userId) {
    const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
    
    if (error) {
        console.error('Error:', error);
        return false;
    }
    return true;
}

// ============================================
// 2. EJEMPLO: TABLA DE MATERIAS (futuro)
// ============================================

/**
 * Si quieres agregar materias, primero crea la tabla con este SQL:
 * 
 * CREATE TABLE materias (
 *   id BIGSERIAL PRIMARY KEY,
 *   user_id BIGINT REFERENCES users(id),
 *   nombre VARCHAR(255) NOT NULL,
 *   descripcion TEXT,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * );
 */

export async function crearMateria(userId, nombre, descripcion) {
    const { data, error } = await supabase
        .from('materias')
        .insert([{ user_id: userId, nombre, descripcion }])
        .select()
        .single();
    
    if (error) {
        console.error('Error:', error);
        return null;
    }
    return data;
}

export async function obtenerMaterias(userId) {
    const { data, error } = await supabase
        .from('materias')
        .select('*')
        .eq('user_id', userId);
    
    if (error) {
        console.error('Error:', error);
        return [];
    }
    return data;
}

// ============================================
// 3. EJEMPLO: TABLA DE ASIGNACIONES (futuro)
// ============================================

/**
 * Si quieres agregar asignaciones, primero crea la tabla con este SQL:
 * 
 * CREATE TABLE asignaciones (
 *   id BIGSERIAL PRIMARY KEY,
 *   materia_id BIGINT REFERENCES materias(id),
 *   titulo VARCHAR(255) NOT NULL,
 *   descripcion TEXT,
 *   fecha_entrega TIMESTAMP,
 *   completada BOOLEAN DEFAULT FALSE,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * );
 */

export async function crearAsignacion(materiaId, titulo, descripcion, fechaEntrega) {
    const { data, error } = await supabase
        .from('asignaciones')
        .insert([{ materia_id: materiaId, titulo, descripcion, fecha_entrega: fechaEntrega }])
        .select()
        .single();
    
    if (error) {
        console.error('Error:', error);
        return null;
    }
    return data;
}

export async function obtenerAsignaciones(materiaId) {
    const { data, error } = await supabase
        .from('asignaciones')
        .select('*')
        .eq('materia_id', materiaId)
        .order('fecha_entrega', { ascending: true });
    
    if (error) {
        console.error('Error:', error);
        return [];
    }
    return data;
}

export async function marcarAsignacionCompleta(asignacionId) {
    const { data, error } = await supabase
        .from('asignaciones')
        .update({ completada: true })
        .eq('id', asignacionId)
        .select()
        .single();
    
    if (error) {
        console.error('Error:', error);
        return null;
    }
    return data;
}

// ============================================
// NOTAS IMPORTANTES
// ============================================

/**
 * Métodos comunes de Supabase:
 * 
 * .select()          - SELECT * FROM table
 * .select('col1, col2') - SELECT col1, col2 FROM table
 * .insert([data])    - INSERT INTO table VALUES
 * .update(data)      - UPDATE table SET
 * .delete()          - DELETE FROM table
 * .eq('col', value)  - WHERE col = value
 * .ne('col', value)  - WHERE col != value
 * .gt('col', value)  - WHERE col > value
 * .lt('col', value)  - WHERE col < value
 * .gte('col', value) - WHERE col >= value
 * .lte('col', value) - WHERE col <= value
 * .like('col', pattern) - WHERE col LIKE pattern
 * .in('col', [values]) - WHERE col IN (values)
 * .order('col', {ascending: true}) - ORDER BY col ASC
 * .limit(n)          - LIMIT n
 * .single()          - Obtener un solo registro (tira error si hay más de uno)
 * .maybeSingle()     - Obtener un registro o null
 * 
 * Siempre verificar si hay 'error' en la respuesta:
 * const { data, error } = await supabase...
 * if (error) { console.error(error); }
 */

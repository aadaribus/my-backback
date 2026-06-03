// app/controllers/materialuser.controller.js
// Controlador para manejar materias/asignaturas (materialuser)

import { supabase } from '../config/supabase.js';
import jwt from 'jsonwebtoken';

// ===== FUNCIÓN AUXILIAR: Obtener usuario del token =====
function getUserFromToken(req) {
  try {
    const cookieHeader = req.headers.cookie || '';
    const cookieJWT = cookieHeader
      .split(';')
      .find((cookie) => cookie.trim().startsWith('jwt='));

    if (!cookieJWT) return null;

    const token = cookieJWT.split('=')[1];
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}

// ===== ENDPOINT: POST /api/materialuser/crear =====
// Crear una nueva materia
export async function crearMateria(req, res) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { admaterial, nameprof, horauser, descriptionmateria } = req.body;

    // Validar campos requeridos
    if (!admaterial) {
      return res.status(400).json({ error: 'El nombre de la materia es requerido' });
    }

    console.log(`[Materias] Creando materia: ${admaterial} para usuario ${user.id}`);

    // Insertar materia en la BD
    const { data, error } = await supabase
      .from('materialuser')
      .insert({
        user_id: user.id,
        admaterial: admaterial.trim(),
        nameprof: nameprof || null,
        horauser: horauser || null,
        descriptionmateria: descriptionmateria || null,
        created_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('[Materias] Error al crear:', error);
      return res.status(500).json({ error: 'Error al crear la materia', details: error.message });
    }

    console.log(`[Materias] ✅ Materia creada: ${data[0].id}`);

    res.status(201).json({
      success: true,
      subject_id: data[0].id,
      material: data[0],
      message: `Materia "${admaterial}" creada exitosamente`
    });

  } catch (error) {
    console.error('[POST /api/materialuser/crear]', error);
    res.status(500).json({ error: 'Error al crear materia', details: error.message });
  }
}

// ===== ENDPOINT: GET /api/materialuser =====
// Obtener todas las materias del usuario
export async function obtenerMaterias(req, res) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    console.log(`[Materias] Obteniendo materias para usuario ${user.id}`);

    // Obtener todas las materias del usuario
    const { data, error } = await supabase
      .from('materialuser')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Materias] Error al obtener:', error);
      return res.status(500).json({ error: 'Error al obtener materias', details: error.message });
    }

    console.log(`[Materias] ✅ Se obtuvieron ${data.length} materias`);

    res.json({
      success: true,
      materiales: data || []
    });

  } catch (error) {
    console.error('[GET /api/materialuser]', error);
    res.status(500).json({ error: 'Error al obtener materias', details: error.message });
  }
}

// ===== ENDPOINT: GET /api/materialuser/:id =====
// Obtener una materia específica
export async function obtenerMateria(req, res) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { id } = req.params;

    const { data, error } = await supabase
      .from('materialuser')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Materia no encontrada o acceso denegado' });
    }

    res.json({
      success: true,
      material: data
    });

  } catch (error) {
    console.error('[GET /api/materialuser/:id]', error);
    res.status(500).json({ error: 'Error al obtener materia', details: error.message });
  }
}

// ===== ENDPOINT: PUT /api/materialuser/:id =====
// Actualizar una materia
export async function actualizarMateria(req, res) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { id } = req.params;
    const { admaterial, nameprof, horauser, descriptionmateria } = req.body;

    // Verificar que la materia pertenece al usuario
    const { data: material, error: matError } = await supabase
      .from('materialuser')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (matError || !material || material.user_id !== user.id) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { data, error } = await supabase
      .from('materialuser')
      .update({
        admaterial: admaterial || material.admaterial,
        nameprof: nameprof || null,
        horauser: horauser || null,
        descriptionmateria: descriptionmateria || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Error al actualizar materia' });
    }

    console.log(`[Materias] ✅ Materia actualizada: ${id}`);

    res.json({
      success: true,
      material: data,
      message: 'Materia actualizada exitosamente'
    });

  } catch (error) {
    console.error('[PUT /api/materialuser/:id]', error);
    res.status(500).json({ error: 'Error al actualizar materia', details: error.message });
  }
}

// ===== ENDPOINT: DELETE /api/materialuser/:id =====
// Eliminar una materia
export async function eliminarMateria(req, res) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { id } = req.params;

    // Verificar que la materia pertenece al usuario
    const { data: material, error: matError } = await supabase
      .from('materialuser')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (matError || !material || material.user_id !== user.id) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { error } = await supabase
      .from('materialuser')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Error al eliminar materia' });
    }

    console.log(`[Materias] ✅ Materia eliminada: ${id}`);

    res.json({
      success: true,
      message: 'Materia eliminada exitosamente'
    });

  } catch (error) {
    console.error('[DELETE /api/materialuser/:id]', error);
    res.status(500).json({ error: 'Error al eliminar materia', details: error.message });
  }
}

export const methods = {
  crearMateria,
  obtenerMaterias,
  obtenerMateria,
  actualizarMateria,
  eliminarMateria
};

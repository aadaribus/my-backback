// app/controllers/materialuser.controller.js
// Controlador para manejar materias/asignaturas (materialuser)

import { supabase } from '../config/supabase.js';
import { getDatabaseUserId } from '../utils/auth.js';
import { createFallbackRecord, getFallbackRecord, listFallbackRecords, updateFallbackRecord, deleteFallbackRecord, isSchemaFallbackError } from '../utils/db-fallback.js';

// ===== ENDPOINT: POST /api/materialuser/crear =====
// Crear una nueva materia
export async function crearMateria(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const localId = user.local_id || user.id;
    const resolvedUserId = getDatabaseUserId(user);
    if (!resolvedUserId || (typeof resolvedUserId === 'string' && !resolvedUserId.trim())) {
      return res.status(400).json({ error: 'No hay un identificador de usuario válido para guardar datos' });
    }
    const { admaterial, nameprof, horauser, descriptionmateria } = req.body;

    // Validar campos requeridos
    if (!admaterial) {
      return res.status(400).json({ error: 'El nombre de la materia es requerido' });
    }

    console.log(`[Materias] Creando materia: ${admaterial} para usuario ${user.id}`);

    // Insertar materia en la BD
    try {
      const { data, error } = await supabase
        .from('materialuser')
        .insert({
          user_id: resolvedUserId,
          admaterial: admaterial.trim(),
          nameprof: nameprof || null,
          horauser: horauser || null,
          descriptionmateria: descriptionmateria || null,
          created_at: new Date().toISOString()
        })
        .select();

      if (error) {
        if (isSchemaFallbackError(error)) {
          const fallbackMaterial = createFallbackRecord('materialuser', resolvedUserId, {
            user_id: resolvedUserId,
            admaterial: admaterial.trim(),
            nameprof: nameprof || null,
            horauser: horauser || null,
            descriptionmateria: descriptionmateria || null
          });
          return res.status(201).json({
            success: true,
            subject_id: fallbackMaterial.id,
            material: { ...fallbackMaterial, local_id: localId },
            message: `Materia "${admaterial}" creada exitosamente (modo local)`
          });
        }
        console.error('[Materias] Error al crear:', error);
        return res.status(500).json({
          error: 'Error al crear la materia',
          details: error.message,
          user_id: resolvedUserId,
          hint: 'La tabla Supabase materialuser espera un user_id compatible con el esquema actual. Revisa SUPABASE_FIX_UUID_COMPATIBILITY.sql.'
        });
      }

      console.log(`[Materias] ✅ Materia creada: ${data[0].id}`);

      return res.status(201).json({
        success: true,
        subject_id: data[0].id,
        material: {
          ...data[0],
          local_id: localId
        },
        message: `Materia "${admaterial}" creada exitosamente`
      });
    } catch (error) {
      console.error('[POST /api/materialuser/crear]', error);
      return res.status(500).json({ error: 'Error al crear materia', details: error.message });
    }

  } catch (error) {
    console.error('[POST /api/materialuser/crear]', error);
    res.status(500).json({ error: 'Error al crear materia', details: error.message });
  }
}

// ===== ENDPOINT: GET /api/materialuser =====
// Obtener todas las materias del usuario
export async function obtenerMaterias(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const localId = user.local_id || user.id;
    console.log(`[Materias] Obteniendo materias para usuario ${user.id}`);

    const resolvedUserId = getDatabaseUserId(user);
    const { data, error } = await supabase
      .from('materialuser')
      .select('*')
      .eq('user_id', resolvedUserId)
      .order('created_at', { ascending: false });

    if (error) {
      if (isSchemaFallbackError(error)) {
        const fallbackMaterials = listFallbackRecords('materialuser', (material) => material.user_id === resolvedUserId);
        return res.json({ success: true, materiales: fallbackMaterials || [], local_id: localId, source: 'fallback' });
      }
      console.error('[Materias] Error al obtener:', error);
      return res.status(500).json({ error: 'Error al obtener materias', details: error.message });
    }

    console.log(`[Materias] ✅ Se obtuvieron ${data.length} materias`);

    return res.json({
      success: true,
      materiales: data || [],
      local_id: localId
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
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const localId = user.local_id || user.id;
    const { id } = req.params;

    const resolvedUserId = getDatabaseUserId(user);
    const { data, error } = await supabase
      .from('materialuser')
      .select('*')
      .eq('id', id)
      .eq('user_id', resolvedUserId)
      .single();

    if (error) {
      if (isSchemaFallbackError(error)) {
        const fallbackMaterial = getFallbackRecord('materialuser', (material) => material.id === id && material.user_id === resolvedUserId);
        if (!fallbackMaterial) {
          return res.status(404).json({ error: 'Materia no encontrada o acceso denegado' });
        }
        return res.json({ success: true, material: { ...fallbackMaterial, local_id: localId } });
      }
    }

    if (!data) {
      return res.status(404).json({ error: 'Materia no encontrada o acceso denegado' });
    }

    res.json({
      success: true,
      material: {
        ...data,
        local_id: localId
      }
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
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const localId = user.local_id || user.id;
    const { id } = req.params;
    const { admaterial, nameprof, horauser, descriptionmateria } = req.body;

    // Verificar que la materia pertenece al usuario
    const { data: material, error: matError } = await supabase
      .from('materialuser')
      .select('id, user_id')
      .eq('id', id)
      .single();

    const resolvedUserId = getDatabaseUserId(user);
    if (matError || !material || material.user_id !== resolvedUserId) {
      const fallbackMaterial = getFallbackRecord('materialuser', (record) => record.id === id && record.user_id === resolvedUserId);
      if (!fallbackMaterial) {
        return res.status(403).json({ error: 'Acceso denegado' });
      }
      const updatedMaterial = updateFallbackRecord('materialuser', id, {
        admaterial: admaterial || fallbackMaterial.admaterial,
        nameprof: nameprof || null,
        horauser: horauser || null,
        descriptionmateria: descriptionmateria || null
      });
      return res.json({ success: true, material: { ...updatedMaterial, local_id: localId }, message: 'Materia actualizada exitosamente' });
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
      if (isSchemaFallbackError(error)) {
        const fallbackMaterial = updateFallbackRecord('materialuser', id, {
          admaterial: admaterial || material.admaterial,
          nameprof: nameprof || null,
          horauser: horauser || null,
          descriptionmateria: descriptionmateria || null
        });
        return res.json({ success: true, material: { ...fallbackMaterial, local_id: localId }, message: 'Materia actualizada exitosamente' });
      }
      return res.status(500).json({ error: 'Error al actualizar materia' });
    }

    console.log(`[Materias] ✅ Materia actualizada: ${id}`);

    res.json({
      success: true,
      material: {
        ...data,
        local_id: localId
      },
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
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const localId = user.local_id || user.id;
    const { id } = req.params;

    // Verificar que la materia pertenece al usuario
    const { data: material, error: matError } = await supabase
      .from('materialuser')
      .select('id, user_id')
      .eq('id', id)
      .single();

    const resolvedUserId = getDatabaseUserId(user);
    if (matError || !material || material.user_id !== resolvedUserId) {
      const fallbackMaterial = getFallbackRecord('materialuser', (record) => record.id === id && record.user_id === resolvedUserId);
      if (!fallbackMaterial) {
        return res.status(403).json({ error: 'Acceso denegado' });
      }
      deleteFallbackRecord('materialuser', id);
      return res.json({ success: true, local_id: localId, message: 'Materia eliminada exitosamente' });
    }

    const { error } = await supabase
      .from('materialuser')
      .delete()
      .eq('id', id);

    if (error) {
      if (isSchemaFallbackError(error)) {
        deleteFallbackRecord('materialuser', id);
        return res.json({ success: true, local_id: localId, message: 'Materia eliminada exitosamente' });
      }
      return res.status(500).json({ error: 'Error al eliminar materia' });
    }

    console.log(`[Materias] ✅ Materia eliminada: ${id}`);

    res.json({
      success: true,
      local_id: localId,
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

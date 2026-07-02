// app/controllers/subjects.controller.js
// Controlador para manejar materias/asignaturas

import { supabase } from '../config/supabase.js';
import { getDatabaseUserId } from '../utils/auth.js';
import { createFallbackRecord, getFallbackRecord, listFallbackRecords, updateFallbackRecord, deleteFallbackRecord, isSchemaFallbackError } from '../utils/db-fallback.js';

// ===== ENDPOINT: POST /api/materias/crear =====
// Crear una nueva materia
export async function crearMateria(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const localId = user.local_id || user.id;
    const resolvedUserId = getDatabaseUserId(user);
    const { name, professor, schedule, description } = req.body;

    // Validar campos requeridos
    if (!name) {
      return res.status(400).json({ error: 'El nombre de la materia es requerido' });
    }

    console.log(`[Materias] Creando materia: ${name} para usuario ${user.id}`);

    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert({
          user_id: resolvedUserId,
          name: name.trim(),
          professor: professor || null,
          schedule: schedule || null,
          description: description || null,
          created_at: new Date().toISOString()
        })
        .select();

      if (error) {
        if (isSchemaFallbackError(error)) {
          const fallbackSubject = createFallbackRecord('subjects', resolvedUserId, {
            user_id: resolvedUserId,
            name: name.trim(),
            professor: professor || null,
            schedule: schedule || null,
            description: description || null
          });
          return res.status(201).json({
            success: true,
            subject_id: fallbackSubject.id,
            subject: { ...fallbackSubject, local_id: localId },
            message: `Materia "${name}" creada exitosamente (modo local)`
          });
        }
        throw error;
      }

      console.log(`[Materias] ✅ Materia creada: ${data[0].id}`);

      return res.status(201).json({
        success: true,
        subject_id: data[0].id,
        subject: {
          ...data[0],
          local_id: localId
        },
        message: `Materia "${name}" creada exitosamente`
      });
    } catch (error) {
      console.error('[Materias] Error al crear:', error);
      return res.status(500).json({ error: 'Error al crear la materia', details: error.message });
    }

  } catch (error) {
    console.error('[POST /api/materias/crear]', error);
    res.status(500).json({ error: 'Error al crear materia', details: error.message });
  }
}

// ===== ENDPOINT: GET /api/materias =====
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

    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', resolvedUserId)
        .order('created_at', { ascending: false });

      if (error) {
        if (isSchemaFallbackError(error)) {
          const fallbackSubjects = listFallbackRecords('subjects', (subject) => subject.user_id === resolvedUserId);
          return res.json({
            success: true,
            subjects: fallbackSubjects.map((subject) => ({ ...subject, local_id: localId })),
            count: fallbackSubjects.length,
            local_id: localId,
            source: 'fallback'
          });
        }
        throw error;
      }

      console.log(`[Materias] ✅ Se obtuvieron ${data.length} materias`);

      return res.json({
        success: true,
        subjects: data.map((subject) => ({ ...subject, local_id: localId })),
        count: data.length,
        local_id: localId
      });
    } catch (error) {
      console.error('[Materias] Error al obtener:', error);
      return res.status(500).json({ error: 'Error al obtener materias', details: error.message });
    }

  } catch (error) {
    console.error('[GET /api/materias]', error);
    res.status(500).json({ error: 'Error al obtener materias', details: error.message });
  }
}

// ===== ENDPOINT: GET /api/materias/:subject_id =====
// Obtener una materia específica
export async function obtenerMateria(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { subject_id } = req.params;
    const localId = user.local_id || user.id;

    const resolvedUserId = getDatabaseUserId(user);
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', subject_id)
      .eq('user_id', resolvedUserId)
      .single();

    if (error) {
      if (isSchemaFallbackError(error)) {
        const fallbackSubject = getFallbackRecord('subjects', (subject) => subject.id === subject_id && subject.user_id === resolvedUserId);
        if (!fallbackSubject) {
          return res.status(404).json({ error: 'Materia no encontrada' });
        }
        return res.json({ success: true, subject: { ...fallbackSubject, local_id: localId } });
      }
    }

    if (!data) {
      return res.status(404).json({ error: 'Materia no encontrada' });
    }

    res.json({
      success: true,
      subject: {
        ...data,
        local_id: localId
      }
    });

  } catch (error) {
    console.error('[GET /api/materias/:subject_id]', error);
    res.status(500).json({ error: 'Error al obtener materia', details: error.message });
  }
}

// ===== ENDPOINT: PUT /api/materias/:subject_id =====
// Actualizar una materia
export async function actualizarMateria(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { subject_id } = req.params;
    const { name, professor, schedule, description } = req.body;
    const localId = user.local_id || user.id;

    // Verificar que el usuario es dueño de la materia
    const { data: subject, error: checkError } = await supabase
      .from('subjects')
      .select('id, user_id')
      .eq('id', subject_id)
      .single();

    if (checkError || !subject || subject.user_id !== user.id) {
      return res.status(403).json({ error: 'No tienes permiso para actualizar esta materia' });
    }

    console.log(`[Materias] Actualizando materia ${subject_id}`);

    // Actualizar
    const { data, error } = await supabase
      .from('subjects')
      .update({
        name: name || subject.name,
        professor: professor || null,
        schedule: schedule || null,
        description: description || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', subject_id)
      .select();

    if (error) {
      console.error('[Materias] Error al actualizar:', error);
      return res.status(500).json({ error: 'Error al actualizar materia', details: error.message });
    }

    console.log(`[Materias] ✅ Materia actualizada`);

    res.json({
      success: true,
      subject: {
        ...data[0],
        local_id: localId
      },
      message: 'Materia actualizada exitosamente'
    });

  } catch (error) {
    console.error('[PUT /api/materias/:subject_id]', error);
    res.status(500).json({ error: 'Error al actualizar materia', details: error.message });
  }
}

// ===== ENDPOINT: DELETE /api/materias/:subject_id =====
// Eliminar una materia
export async function eliminarMateria(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { subject_id } = req.params;
    const localId = user.local_id || user.id;

    // Verificar que el usuario es dueño
    const { data: subject, error: checkError } = await supabase
      .from('subjects')
      .select('id, user_id')
      .eq('id', subject_id)
      .single();

    if (checkError || !subject || subject.user_id !== user.id) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta materia' });
    }

    console.log(`[Materias] Eliminando materia ${subject_id}`);

    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', subject_id);

    if (error) {
      console.error('[Materias] Error al eliminar:', error);
      return res.status(500).json({ error: 'Error al eliminar materia', details: error.message });
    }

    console.log(`[Materias] ✅ Materia eliminada`);

    res.json({
      success: true,
      local_id: localId,
      message: 'Materia eliminada exitosamente'
    });

  } catch (error) {
    console.error('[DELETE /api/materias/:subject_id]', error);
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

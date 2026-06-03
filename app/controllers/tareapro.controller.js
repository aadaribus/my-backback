// app/controllers/tareapro.controller.js
// Controlador para manejar tareas (tareapro)

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

// ===== ENDPOINT: POST /api/tareapro/crear =====
// Crear una nueva tarea
export async function crearTarea(req, res) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { tareaname, tareadescription, datetarea, imagentarea, materialuser_id } = req.body;

    if (!tareaname) {
      return res.status(400).json({ error: 'El título de la tarea es requerido' });
    }

    console.log(`[Tareas] Creando tarea: ${tareaname} para usuario ${user.id}`);

    const { data, error } = await supabase
      .from('tareapro')
      .insert({
        user_id: user.id,
        materialuser_id: materialuser_id || null,
        tareaname: tareaname.trim(),
        tareadescription: tareadescription || null,
        datetarea: datetarea || null,
        imagentarea: imagentarea || null,
        completed: false,
        created_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('[Tareas] Error al crear:', error);
      return res.status(500).json({ error: 'Error al crear la tarea', details: error.message });
    }

    console.log(`[Tareas] ✅ Tarea creada: ${data[0].id}`);

    res.status(201).json({
      success: true,
      task_id: data[0].id,
      task: data[0],
      message: `Tarea "${tareaname}" creada exitosamente`
    });

  } catch (error) {
    console.error('[POST /api/tareapro/crear]', error);
    res.status(500).json({ error: 'Error al crear tarea', details: error.message });
  }
}

// ===== ENDPOINT: GET /api/tareapro =====
// Obtener todas las tareas del usuario
export async function obtenerTareas(req, res) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { data, error } = await supabase
      .from('tareapro')
      .select('*')
      .eq('user_id', user.id)
      .order('datetarea', { ascending: true });

    if (error) {
      return res.status(500).json({ error: 'Error al obtener tareas' });
    }

    console.log(`[Tareas] ✅ Se obtuvieron ${data?.length || 0} tareas`);

    res.json({
      success: true,
      tareas: data || []
    });

  } catch (error) {
    console.error('[GET /api/tareapro]', error);
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
}

// ===== ENDPOINT: GET /api/tareapro/:id =====
// Obtener una tarea específica
export async function obtenerTarea(req, res) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { id } = req.params;

    const { data, error } = await supabase
      .from('tareapro')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    res.json({
      success: true,
      task: data
    });

  } catch (error) {
    console.error('[GET /api/tareapro/:id]', error);
    res.status(500).json({ error: 'Error al obtener tarea' });
  }
}

// ===== ENDPOINT: PUT /api/tareapro/:id =====
// Actualizar una tarea
export async function actualizarTarea(req, res) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { id } = req.params;
    const { tareaname, tareadescription, datetarea, imagentarea, completed } = req.body;

    const { data: task, error: taskError } = await supabase
      .from('tareapro')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (taskError || !task || task.user_id !== user.id) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { data, error } = await supabase
      .from('tareapro')
      .update({
        tareaname: tareaname || undefined,
        tareadescription: tareadescription !== undefined ? tareadescription : undefined,
        datetarea: datetarea !== undefined ? datetarea : undefined,
        imagentarea: imagentarea !== undefined ? imagentarea : undefined,
        completed: completed !== undefined ? completed : undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Error al actualizar tarea' });
    }

    console.log(`[Tareas] ✅ Tarea actualizada: ${id}`);

    res.json({
      success: true,
      task: data,
      message: 'Tarea actualizada exitosamente'
    });

  } catch (error) {
    console.error('[PUT /api/tareapro/:id]', error);
    res.status(500).json({ error: 'Error al actualizar tarea' });
  }
}

// ===== ENDPOINT: DELETE /api/tareapro/:id =====
// Eliminar una tarea
export async function eliminarTarea(req, res) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { id } = req.params;

    const { data: task, error: taskError } = await supabase
      .from('tareapro')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (taskError || !task || task.user_id !== user.id) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { error } = await supabase
      .from('tareapro')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Error al eliminar tarea' });
    }

    console.log(`[Tareas] ✅ Tarea eliminada: ${id}`);

    res.json({
      success: true,
      message: 'Tarea eliminada exitosamente'
    });

  } catch (error) {
    console.error('[DELETE /api/tareapro/:id]', error);
    res.status(500).json({ error: 'Error al eliminar tarea' });
  }
}

export const methods = {
  crearTarea,
  obtenerTareas,
  obtenerTarea,
  actualizarTarea,
  eliminarTarea
};

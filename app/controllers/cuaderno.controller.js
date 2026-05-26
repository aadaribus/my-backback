// app/controllers/cuaderno.controller.js
import { supabase } from '../config/supabase.js';
import DOMPurify from 'isomorphic-dompurify';
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

// ===== FUNCIÓN: Crear cuaderno automáticamente (llamada desde agregar materia) =====
export async function crearCuadernoAutomatico(subjectId, userId) {
  try {
    console.log(`[Cuaderno] Creando cuaderno automático para materia ${subjectId}, usuario ${userId}`);
    
    const { data, error } = await supabase
      .from('notebooks')
      .insert({
        subject_id: subjectId,
        user_id: userId
      })
      .select();

    if (error) {
      console.error('[Cuaderno] Error creando notebook:', error);
      throw error;
    }

    console.log('[Cuaderno] ✅ Cuaderno creado:', data[0].id);
    return data[0];
  } catch (error) {
    console.error('[Cuaderno] ❌ Fallo al crear cuaderno automático:', error.message);
    throw error;
  }
}

// ===== ENDPOINT: POST /api/cuaderno/crear =====
// Crear cuaderno manualmente (si es necesario, normalmente es automático)
export async function crearCuaderno(req, res) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { subject_id, subject_name } = req.body;

    if (!subject_id || !subject_name) {
      return res.status(400).json({ error: 'subject_id y subject_name son requeridos' });
    }

    // Verificar que la materia pertenece al usuario
    const { data: subject, error: subError } = await supabase
      .from('subjects')
      .select('id, user_id')
      .eq('id', subject_id)
      .single();

    if (subError || !subject || subject.user_id !== user.id) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Crear cuaderno
    const notebook = await crearCuadernoAutomatico(subject_id, user.id);

    res.status(201).json({
      success: true,
      notebook_id: notebook.id,
      message: `Cuaderno digital creado para ${subject_name}`
    });
  } catch (error) {
    console.error('[POST /api/cuaderno/crear]', error);
    res.status(500).json({ error: 'Error al crear cuaderno' });
  }
}

// ===== ENDPOINT: POST /api/cuaderno/guardar =====
// Guardar entrada en el cuaderno
export async function guardarEntrada(req, res) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { notebook_id, content, subject_name } = req.body;

    if (!notebook_id || !content) {
      return res.status(400).json({ error: 'notebook_id y content son requeridos' });
    }

    // Verificar que el cuaderno pertenece al usuario
    const { data: notebook, error: nbError } = await supabase
      .from('notebooks')
      .select('id, user_id')
      .eq('id', notebook_id)
      .single();

    if (nbError || !notebook || notebook.user_id !== user.id) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Sanitizar HTML
    const cleanContent = DOMPurify.sanitize(content);

    // Guardar entrada
    const { data: entry, error: entryError } = await supabase
      .from('notebook_entries')
      .insert({
        notebook_id,
        content: cleanContent
      })
      .select();

    if (entryError) {
      console.error('[Guardar Entrada] Error:', entryError);
      throw entryError;
    }

    const entryId = entry[0].id;
    const timestamp = new Date().toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    console.log(`[Cuaderno] ✅ Entrada guardada: ${entryId} en cuaderno ${notebook_id}`);

    res.status(201).json({
      success: true,
      entry_id: entryId,
      timestamp,
      message: 'Entrada guardada exitosamente'
    });
  } catch (error) {
    console.error('[POST /api/cuaderno/guardar]', error);
    res.status(500).json({ error: 'Error al guardar entrada' });
  }
}

// ===== ENDPOINT: GET /api/cuaderno/:notebook_id =====
// Obtener todas las entradas de un cuaderno
export async function obtenerEntradas(req, res) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { notebook_id } = req.params;

    // Verificar acceso
    const { data: notebook, error: nbError } = await supabase
      .from('notebooks')
      .select('id, user_id')
      .eq('id', notebook_id)
      .single();

    if (nbError || !notebook || notebook.user_id !== user.id) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Obtener entradas con multimedia
    const { data: entries, error } = await supabase
      .from('notebook_entries')
      .select(`
        id,
        content,
        created_at,
        notebook_media (
          id,
          file_url,
          file_type,
          file_name,
          file_size
        )
      `)
      .eq('notebook_id', notebook_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Obtener Entradas] Error:', error);
      throw error;
    }

    const formattedEntries = entries.map(entry => ({
      id: entry.id,
      content: entry.content,
      created_at: new Date(entry.created_at).toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      media: entry.notebook_media || []
    }));

    console.log(`[Cuaderno] ✅ Se obtuvieron ${formattedEntries.length} entradas`);

    res.json({
      success: true,
      notebook_id,
      entries: formattedEntries
    });
  } catch (error) {
    console.error('[GET /api/cuaderno/:notebook_id]', error);
    res.status(500).json({ error: 'Error al obtener entradas' });
  }
}

// ===== ENDPOINT: GET /api/cuaderno/materia/:subject_id =====
// Obtener cuaderno por materia (o crearlo si no existe)
export async function obtenerCuadernoMateria(req, res) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { subject_id } = req.params;

    // Verificar que la materia pertenece al usuario
    const { data: subject, error: sbError } = await supabase
      .from('subjects')
      .select('id, name, user_id')
      .eq('id', subject_id)
      .single();

    if (sbError || !subject || subject.user_id !== user.id) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Obtener cuaderno existente
    let { data: notebook, error: nbError } = await supabase
      .from('notebooks')
      .select('id, created_at')
      .eq('subject_id', subject_id)
      .eq('user_id', user.id)
      .single();

    // Si no existe, crear uno nuevo
    if (nbError && nbError.code === 'PGRST116') {
      console.log(`[Cuaderno] Cuaderno no existe para materia ${subject_id}, creando...`);
      try {
        notebook = await crearCuadernoAutomatico(subject_id, user.id);
      } catch (createError) {
        return res.status(500).json({ error: 'Error al crear cuaderno' });
      }
    } else if (nbError) {
      throw nbError;
    }

    res.json({
      success: true,
      notebook_id: notebook.id,
      subject_id,
      subject_name: subject.name
    });
  } catch (error) {
    console.error('[GET /api/cuaderno/materia/:subject_id]', error);
    res.status(500).json({ error: 'Error al obtener cuaderno' });
  }
}

// ===== ENDPOINT: PUT /api/cuaderno/entrada/:entry_id =====
// Actualizar una entrada
export async function actualizarEntrada(req, res) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { entry_id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'content es requerido' });
    }

    // Verificar que la entrada pertenece al usuario
    const { data: entry, error: entryError } = await supabase
      .from('notebook_entries')
      .select('id, notebooks(user_id)')
      .eq('id', entry_id)
      .single();

    if (entryError || !entry || entry.notebooks.user_id !== user.id) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Sanitizar HTML
    const cleanContent = DOMPurify.sanitize(content);

    // Actualizar
    const { data: updated, error: updateError } = await supabase
      .from('notebook_entries')
      .update({ content: cleanContent, updated_at: new Date().toISOString() })
      .eq('id', entry_id)
      .select();

    if (updateError) {
      throw updateError;
    }

    console.log(`[Cuaderno] ✅ Entrada actualizada: ${entry_id}`);

    res.json({
      success: true,
      entry: updated[0],
      message: 'Entrada actualizada'
    });
  } catch (error) {
    console.error('[PUT /api/cuaderno/entrada/:entry_id]', error);
    res.status(500).json({ error: 'Error al actualizar entrada' });
  }
}

// ===== ENDPOINT: DELETE /api/cuaderno/entrada/:entry_id =====
// Eliminar una entrada
export async function eliminarEntrada(req, res) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { entry_id } = req.params;

    // Verificar que la entrada pertenece al usuario
    const { data: entry, error: entryError } = await supabase
      .from('notebook_entries')
      .select('id, notebooks(user_id)')
      .eq('id', entry_id)
      .single();

    if (entryError || !entry || entry.notebooks.user_id !== user.id) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Eliminar (las media se eliminan automáticamente por CASCADE)
    const { error: deleteError } = await supabase
      .from('notebook_entries')
      .delete()
      .eq('id', entry_id);

    if (deleteError) {
      throw deleteError;
    }

    console.log(`[Cuaderno] ✅ Entrada eliminada: ${entry_id}`);

    res.json({
      success: true,
      message: 'Entrada eliminada'
    });
  } catch (error) {
    console.error('[DELETE /api/cuaderno/entrada/:entry_id]', error);
    res.status(500).json({ error: 'Error al eliminar entrada' });
  }
}

// ===== ENDPOINT: POST /api/cuaderno/upload =====
// Subir archivo multimedia (normalmente se usa Data URL desde el frontend)
export async function subirArchivo(req, res) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { entry_id, file_url, file_type, file_name } = req.body;

    if (!entry_id || !file_url || !file_type || !file_name) {
      return res.status(400).json({ error: 'Parámetros incompletos' });
    }

    // Verificar que la entrada pertenece al usuario
    const { data: entry, error: entryError } = await supabase
      .from('notebook_entries')
      .select('id, notebooks(user_id)')
      .eq('id', entry_id)
      .single();

    if (entryError || !entry || entry.notebooks.user_id !== user.id) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Guardar referencia en BD
    const { data: media, error: mediaError } = await supabase
      .from('notebook_media')
      .insert({
        entry_id,
        file_url,
        file_type,
        file_name,
        file_size: 0 // No se puede obtener del Data URL
      })
      .select();

    if (mediaError) {
      console.error('[Upload] Error guardando media:', mediaError);
      throw mediaError;
    }

    console.log(`[Cuaderno] ✅ Archivo subido: ${file_name}`);

    res.status(201).json({
      success: true,
      file_id: media[0].id,
      file_url,
      message: 'Archivo guardado'
    });
  } catch (error) {
    console.error('[POST /api/cuaderno/upload]', error);
    res.status(500).json({ error: 'Error al subir archivo' });
  }
}

export const methods = {
  crearCuaderno,
  guardarEntrada,
  obtenerEntradas,
  obtenerCuadernoMateria,
  actualizarEntrada,
  eliminarEntrada,
  subirArchivo
};

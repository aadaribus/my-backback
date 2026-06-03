// app/controllers/bookdigital.controller.js
// Controlador para manejar el Cuaderno Digital (bookdigital)

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

// ===== ENDPOINT: POST /api/bookdigital/guardar =====
// Guardar entrada en el cuaderno digital
export async function guardarEntrada(req, res) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { materialuser_id, texmaterial, imagmaterial, vozmaterial, moviematerial } = req.body;

    if (!materialuser_id) {
      return res.status(400).json({ error: 'materialuser_id es requerido' });
    }

    // Verificar que la materia pertenece al usuario
    const { data: material, error: matError } = await supabase
      .from('materialuser')
      .select('id, user_id')
      .eq('id', materialuser_id)
      .single();

    if (matError || !material || material.user_id !== user.id) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Sanitizar HTML si hay texto
    const cleanText = texmaterial ? DOMPurify.sanitize(texmaterial) : null;

    // Guardar entrada
    const { data: entry, error: entryError } = await supabase
      .from('bookdigital')
      .insert({
        user_id: user.id,
        materialuser_id: materialuser_id,
        texmaterial: cleanText,
        imagmaterial: imagmaterial || [],
        vozmaterial: vozmaterial || [],
        moviematerial: moviematerial || []
      })
      .select();

    if (entryError) {
      console.error('[Cuaderno] Error guardando entrada:', entryError);
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

    console.log(`[Cuaderno] ✅ Entrada guardada: ${entryId}`);

    res.status(201).json({
      success: true,
      entry_id: entryId,
      timestamp,
      message: 'Entrada guardada exitosamente'
    });
  } catch (error) {
    console.error('[POST /api/bookdigital/guardar]', error);
    res.status(500).json({ error: 'Error al guardar entrada' });
  }
}

// ===== ENDPOINT: GET /api/bookdigital =====
// Obtener todas las entradas del cuaderno del usuario
export async function obtenerEntradas(req, res) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { data: entries, error } = await supabase
      .from('bookdigital_with_materials')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Cuaderno] Error:', error);
      throw error;
    }

    console.log(`[Cuaderno] ✅ Se obtuvieron ${entries?.length || 0} entradas`);

    res.json({
      success: true,
      entries: entries || []
    });
  } catch (error) {
    console.error('[GET /api/bookdigital]', error);
    res.status(500).json({ error: 'Error al obtener entradas' });
  }
}

// ===== ENDPOINT: GET /api/bookdigital/:materialuser_id =====
// Obtener entradas de una materia específica
export async function obtenerEntradasMateria(req, res) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { materialuser_id } = req.params;

    // Verificar que la materia pertenece al usuario
    const { data: material, error: matError } = await supabase
      .from('materialuser')
      .select('id, user_id')
      .eq('id', materialuser_id)
      .single();

    if (matError || !material || material.user_id !== user.id) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Obtener entradas
    const { data: entries, error } = await supabase
      .from('bookdigital')
      .select('*')
      .eq('materialuser_id', materialuser_id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      entries: entries || []
    });
  } catch (error) {
    console.error('[GET /api/bookdigital/:materialuser_id]', error);
    res.status(500).json({ error: 'Error al obtener entradas' });
  }
}

// ===== ENDPOINT: PUT /api/bookdigital/:id =====
// Actualizar una entrada
export async function actualizarEntrada(req, res) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { id } = req.params;
    const { texmaterial, imagmaterial, vozmaterial, moviematerial } = req.body;

    // Verificar que la entrada pertenece al usuario
    const { data: entry, error: entryError } = await supabase
      .from('bookdigital')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (entryError || !entry || entry.user_id !== user.id) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const cleanText = texmaterial ? DOMPurify.sanitize(texmaterial) : null;

    const { data: updated, error: updateError } = await supabase
      .from('bookdigital')
      .update({
        texmaterial: cleanText,
        imagmaterial: imagmaterial || [],
        vozmaterial: vozmaterial || [],
        moviematerial: moviematerial || [],
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (updateError) {
      throw updateError;
    }

    console.log(`[Cuaderno] ✅ Entrada actualizada: ${id}`);

    res.json({
      success: true,
      entry: updated[0],
      message: 'Entrada actualizada'
    });
  } catch (error) {
    console.error('[PUT /api/bookdigital/:id]', error);
    res.status(500).json({ error: 'Error al actualizar entrada' });
  }
}

// ===== ENDPOINT: DELETE /api/bookdigital/:id =====
// Eliminar una entrada
export async function eliminarEntrada(req, res) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { id } = req.params;

    // Verificar que la entrada pertenece al usuario
    const { data: entry, error: entryError } = await supabase
      .from('bookdigital')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (entryError || !entry || entry.user_id !== user.id) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { error: deleteError } = await supabase
      .from('bookdigital')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw deleteError;
    }

    console.log(`[Cuaderno] ✅ Entrada eliminada: ${id}`);

    res.json({
      success: true,
      message: 'Entrada eliminada'
    });
  } catch (error) {
    console.error('[DELETE /api/bookdigital/:id]', error);
    res.status(500).json({ error: 'Error al eliminar entrada' });
  }
}

// ===== ENDPOINT: GET /api/bookhistory =====
// Obtener historial del cuaderno
export async function obtenerHistorial(req, res) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { data: history, error } = await supabase
      .from('bookhistory_with_materials')
      .select('*')
      .eq('user_id', user.id)
      .order('saved_at', { ascending: false });

    if (error) {
      throw error;
    }

    console.log(`[Historial] ✅ Se obtuvieron ${history?.length || 0} entradas`);

    res.json({
      success: true,
      history: history || []
    });
  } catch (error) {
    console.error('[GET /api/bookhistory]', error);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
}

export const methods = {
  guardarEntrada,
  obtenerEntradas,
  obtenerEntradasMateria,
  actualizarEntrada,
  eliminarEntrada,
  obtenerHistorial
};

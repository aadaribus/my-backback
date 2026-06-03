// app/controllers/gruppro.controller.js
// Controlador para manejar grupos (gruppro)

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

// ===== ENDPOINT: POST /api/gruppro/crear =====
// Crear un nuevo grupo
export async function crearGrupo(req, res) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { grupname, grupdecription, grupmail } = req.body;

    if (!grupname) {
      return res.status(400).json({ error: 'El nombre del grupo es requerido' });
    }

    console.log(`[Grupos] Creando grupo: ${grupname} para usuario ${user.id}`);

    const { data, error } = await supabase
      .from('gruppro')
      .insert({
        user_id: user.id,
        grupname: grupname.trim(),
        grupdecription: grupdecription || null,
        grupmail: grupmail || null,
        created_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('[Grupos] Error al crear:', error);
      return res.status(500).json({ error: 'Error al crear el grupo', details: error.message });
    }

    console.log(`[Grupos] ✅ Grupo creado: ${data[0].id}`);

    res.status(201).json({
      success: true,
      group_id: data[0].id,
      group: data[0],
      message: `Grupo "${grupname}" creado exitosamente`
    });

  } catch (error) {
    console.error('[POST /api/gruppro/crear]', error);
    res.status(500).json({ error: 'Error al crear grupo', details: error.message });
  }
}

// ===== ENDPOINT: GET /api/gruppro =====
// Obtener todos los grupos del usuario
export async function obtenerGrupos(req, res) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { data, error } = await supabase
      .from('gruppro')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Error al obtener grupos' });
    }

    console.log(`[Grupos] ✅ Se obtuvieron ${data?.length || 0} grupos`);

    res.json({
      success: true,
      grupos: data || []
    });

  } catch (error) {
    console.error('[GET /api/gruppro]', error);
    res.status(500).json({ error: 'Error al obtener grupos', details: error.message });
  }
}

// ===== ENDPOINT: GET /api/gruppro/:id =====
// Obtener un grupo específico
export async function obtenerGrupo(req, res) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { id } = req.params;

    const { data, error } = await supabase
      .from('gruppro')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Grupo no encontrado' });
    }

    res.json({
      success: true,
      group: data
    });

  } catch (error) {
    console.error('[GET /api/gruppro/:id]', error);
    res.status(500).json({ error: 'Error al obtener grupo' });
  }
}

// ===== ENDPOINT: PUT /api/gruppro/:id =====
// Actualizar un grupo
export async function actualizarGrupo(req, res) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { id } = req.params;
    const { grupname, grupdecription, grupmail } = req.body;

    const { data: group, error: groupError } = await supabase
      .from('gruppro')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (groupError || !group || group.user_id !== user.id) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { data, error } = await supabase
      .from('gruppro')
      .update({
        grupname: grupname || group.grupname,
        grupdecription: grupdecription || null,
        grupmail: grupmail || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Error al actualizar grupo' });
    }

    console.log(`[Grupos] ✅ Grupo actualizado: ${id}`);

    res.json({
      success: true,
      group: data,
      message: 'Grupo actualizado exitosamente'
    });

  } catch (error) {
    console.error('[PUT /api/gruppro/:id]', error);
    res.status(500).json({ error: 'Error al actualizar grupo' });
  }
}

// ===== ENDPOINT: DELETE /api/gruppro/:id =====
// Eliminar un grupo
export async function eliminarGrupo(req, res) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { id } = req.params;

    const { data: group, error: groupError } = await supabase
      .from('gruppro')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (groupError || !group || group.user_id !== user.id) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { error } = await supabase
      .from('gruppro')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Error al eliminar grupo' });
    }

    console.log(`[Grupos] ✅ Grupo eliminado: ${id}`);

    res.json({
      success: true,
      message: 'Grupo eliminado exitosamente'
    });

  } catch (error) {
    console.error('[DELETE /api/gruppro/:id]', error);
    res.status(500).json({ error: 'Error al eliminar grupo' });
  }
}

export const methods = {
  crearGrupo,
  obtenerGrupos,
  obtenerGrupo,
  actualizarGrupo,
  eliminarGrupo
};

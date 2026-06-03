// app/controllers/profiledate.controller.js
// Controlador para manejar el perfil del usuario

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

// ===== ENDPOINT: GET /api/profiledate =====
// Obtener el perfil del usuario actual
export async function obtenerPerfil(req, res) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    console.log(`[Perfil] Obteniendo perfil del usuario ${user.id}`);

    // Obtener perfil
    const { data, error } = await supabase
      .from('profiledate')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 significa "not found"
      console.error('[Perfil] Error al obtener:', error);
      return res.status(500).json({ error: 'Error al obtener perfil', details: error.message });
    }

    // Si no existe perfil, crear uno vacío
    if (!data) {
      console.log(`[Perfil] Creando perfil vacío para usuario ${user.id}`);
      const { data: newProfile, error: createError } = await supabase
        .from('profiledate')
        .insert({
          user_id: user.id,
          namecomplet: null,
          usermail: null,
          userfone: null,
          useruni: null
        })
        .select()
        .single();

      if (createError) {
        return res.status(500).json({ error: 'Error al crear perfil', details: createError.message });
      }

      return res.json({
        success: true,
        profile: newProfile
      });
    }

    console.log(`[Perfil] ✅ Perfil obtenido`);

    res.json({
      success: true,
      profile: data
    });

  } catch (error) {
    console.error('[GET /api/profiledate]', error);
    res.status(500).json({ error: 'Error al obtener perfil', details: error.message });
  }
}

// ===== ENDPOINT: PUT /api/profiledate =====
// Actualizar el perfil del usuario
export async function actualizarPerfil(req, res) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { namecomplet, usermail, userfone, useruni } = req.body;

    console.log(`[Perfil] Actualizando perfil del usuario ${user.id}`);

    // Verificar si existe el perfil
    const { data: existingProfile } = await supabase
      .from('profiledate')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let profileData;
    let updateError;

    if (existingProfile) {
      // Actualizar perfil existente
      const { data, error } = await supabase
        .from('profiledate')
        .update({
          namecomplet: namecomplet || null,
          usermail: usermail || null,
          userfone: userfone || null,
          useruni: useruni || null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      profileData = data;
      updateError = error;
    } else {
      // Crear perfil si no existe
      const { data, error } = await supabase
        .from('profiledate')
        .insert({
          user_id: user.id,
          namecomplet: namecomplet || null,
          usermail: usermail || null,
          userfone: userfone || null,
          useruni: useruni || null
        })
        .select()
        .single();

      profileData = data;
      updateError = error;
    }

    if (updateError) {
      console.error('[Perfil] Error al actualizar:', updateError);
      return res.status(500).json({ error: 'Error al actualizar perfil', details: updateError.message });
    }

    console.log(`[Perfil] ✅ Perfil actualizado`);

    res.json({
      success: true,
      profile: profileData,
      message: 'Perfil actualizado exitosamente'
    });

  } catch (error) {
    console.error('[PUT /api/profiledate]', error);
    res.status(500).json({ error: 'Error al actualizar perfil', details: error.message });
  }
}

export const methods = {
  obtenerPerfil,
  actualizarPerfil
};

// app/controllers/profile.controller.js
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

// ===== ENDPOINT: GET /api/perfil =====
// Obtener el perfil del usuario actual
export async function obtenerPerfil(req, res) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    console.log(`[Perfil] Obteniendo perfil del usuario ${user.id}`);

    // Obtener perfil completo
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 significa "not found", que es normal si no existe aún
      console.error('[Perfil] Error al obtener:', error);
      return res.status(500).json({ error: 'Error al obtener perfil', details: error.message });
    }

    // Si no existe perfil, crear uno vacío
    if (!data) {
      console.log(`[Perfil] Creando perfil vacío para usuario ${user.id}`);
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          full_name: user.username,
          email: user.email || '',
          phone: '',
          institution: '',
          career: ''
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
    console.error('[GET /api/perfil]', error);
    res.status(500).json({ error: 'Error al obtener perfil', details: error.message });
  }
}

// ===== ENDPOINT: PUT /api/perfil =====
// Actualizar el perfil del usuario
export async function actualizarPerfil(req, res) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { full_name, email, phone, institution, career } = req.body;

    console.log(`[Perfil] Actualizando perfil del usuario ${user.id}`);

    // Primero, verificar si existe el perfil
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let profileData;
    let updateError;

    if (existingProfile) {
      // Actualizar perfil existente
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          full_name: full_name || null,
          email: email || null,
          phone: phone || null,
          institution: institution || null,
          career: career || null,
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
        .from('user_profiles')
        .insert({
          user_id: user.id,
          full_name: full_name || user.username,
          email: email || user.email || '',
          phone: phone || '',
          institution: institution || '',
          career: career || ''
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
    console.error('[PUT /api/perfil]', error);
    res.status(500).json({ error: 'Error al actualizar perfil', details: error.message });
  }
}

export const methods = {
  obtenerPerfil,
  actualizarPerfil
};

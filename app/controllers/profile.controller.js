// app/controllers/profile.controller.js
// Controlador para manejar el perfil del usuario

import { supabase } from '../config/supabase.js';
import { getDatabaseUserId } from '../utils/auth.js';
import { createFallbackRecord, getFallbackRecord, updateFallbackRecord, isSchemaFallbackError } from '../utils/db-fallback.js';

// ===== ENDPOINT: GET /api/perfil =====
// Obtener el perfil del usuario actual
export async function obtenerPerfil(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const localId = user.local_id || user.id;
    const resolvedUserId = getDatabaseUserId(user);
    console.log(`[Perfil] Obteniendo perfil del usuario ${user.id}`);

    // Obtener perfil completo
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', resolvedUserId)
      .single();

    if (error && error.code !== 'PGRST116' && !isSchemaFallbackError(error)) {
      console.error('[Perfil] Error al obtener:', error);
      return res.status(500).json({ error: 'Error al obtener perfil', details: error.message });
    }

    if (!data) {
      if (isSchemaFallbackError(error)) {
        const fallbackProfile = getFallbackRecord('user_profiles', (record) => record.user_id === resolvedUserId);
        if (fallbackProfile) {
          return res.json({ success: true, profile: { ...fallbackProfile, local_id: localId } });
        }
      }

      console.log(`[Perfil] Creando perfil vacío para usuario ${user.id}`);
      try {
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: resolvedUserId,
            full_name: user.username,
            email: user.email || '',
            phone: '',
            institution: '',
            career: ''
          })
          .select()
          .single();

        if (createError) {
          if (isSchemaFallbackError(createError)) {
            const fallbackProfile = createFallbackRecord('user_profiles', resolvedUserId, {
              user_id: resolvedUserId,
              full_name: user.username,
              email: user.email || '',
              phone: '',
              institution: '',
              career: ''
            });
            return res.json({ success: true, profile: { ...fallbackProfile, local_id: localId }, source: 'fallback' });
          }
          return res.status(500).json({ error: 'Error al crear perfil', details: createError.message });
        }

        return res.json({
          success: true,
          profile: {
            ...newProfile,
            local_id: localId
          }
        });
      } catch (createError) {
        return res.status(500).json({ error: 'Error al crear perfil', details: createError.message });
      }
    }

    console.log(`[Perfil] ✅ Perfil obtenido`);

    res.json({
      success: true,
      profile: {
        ...data,
        local_id: localId
      }
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
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { full_name, email, phone, institution, career } = req.body;
    const resolvedUserId = getDatabaseUserId(user);

    console.log(`[Perfil] Actualizando perfil del usuario ${user.id}`);

    // Primero, verificar si existe el perfil
    const { data: existingProfile, error: existingError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', resolvedUserId)
      .single();

    let profileData;
    let updateError;
    const localId = user.local_id || user.id;

    if (existingProfile) {
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
        .eq('user_id', resolvedUserId)
        .select()
        .single();

      profileData = data;
      updateError = error;
    } else {
      // Crear perfil si no existe
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: resolvedUserId,
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
      if (isSchemaFallbackError(updateError)) {
        const fallbackProfile = existingProfile
          ? updateFallbackRecord('user_profiles', existingProfile.id, {
              user_id: resolvedUserId,
              full_name: full_name || null,
              email: email || null,
              phone: phone || null,
              institution: institution || null,
              career: career || null
            })
          : createFallbackRecord('user_profiles', resolvedUserId, {
              user_id: resolvedUserId,
              full_name: full_name || user.username,
              email: email || user.email || '',
              phone: phone || '',
              institution: institution || '',
              career: career || ''
            });
        return res.json({ success: true, profile: { ...fallbackProfile, local_id: localId }, source: 'fallback' });
      }
      console.error('[Perfil] Error al actualizar:', updateError);
      return res.status(500).json({ error: 'Error al actualizar perfil', details: updateError.message });
    }

    console.log(`[Perfil] ✅ Perfil actualizado`);

    res.json({
      success: true,
      profile: {
        ...profileData,
        local_id: localId
      },
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

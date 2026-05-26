// Ejemplo de Controlador Backend para Cuadernos Digitales
// Implementación en Node.js + Express + Supabase

const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Middleware de autenticación
const verifyAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Auth failed' });
  }
};

// ===== CREAR CUADERNO (se ejecuta automáticamente al crear materia) =====
async function crearCuadernoAutomatico(subjectId, userId) {
  try {
    const { data, error } = await supabase
      .from('notebooks')
      .insert({
        subject_id: subjectId,
        user_id: userId
      })
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error creando cuaderno:', error);
    throw error;
  }
}

// ===== ENDPOINT: Guardar entrada en cuaderno =====
router.post('/cuaderno/guardar', verifyAuth, async (req, res) => {
  try {
    const { notebook_id, content, media_files } = req.body;
    const userId = req.user.id;

    // Validar que el cuaderno pertenece al usuario
    const { data: notebook, error: nbError } = await supabase
      .from('notebooks')
      .select('id, user_id')
      .eq('id', notebook_id)
      .single();

    if (nbError || notebook.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Sanitizar HTML
    const DOMPurify = require('isomorphic-dompurify');
    const cleanContent = DOMPurify.sanitize(content);

    // Guardar entrada
    const { data: entry, error: entryError } = await supabase
      .from('notebook_entries')
      .insert({
        notebook_id,
        content: cleanContent
      })
      .select();

    if (entryError) throw entryError;

    const entryId = entry[0].id;
    const timestamp = new Date().toLocaleString('es-ES');

    // Procesar archivos multimedia si existen
    if (media_files && media_files.length > 0) {
      for (const file of media_files) {
        // Aquí iría la lógica de subir archivos a Supabase Storage
        const { data: media, error: mediaError } = await supabase
          .from('notebook_media')
          .insert({
            entry_id: entryId,
            file_url: file.url, // En producción: URL de Storage
            file_type: file.type,
            file_name: file.name
          });

        if (mediaError) console.error('Error guardando media:', mediaError);
      }
    }

    res.json({
      success: true,
      entry_id: entryId,
      timestamp,
      message: 'Entrada guardada exitosamente'
    });

  } catch (error) {
    console.error('Error al guardar:', error);
    res.status(500).json({ error: 'Error al guardar entrada' });
  }
});

// ===== ENDPOINT: Obtener entradas del cuaderno =====
router.get('/cuaderno/:notebook_id', verifyAuth, async (req, res) => {
  try {
    const { notebook_id } = req.params;
    const userId = req.user.id;

    // Verificar acceso
    const { data: notebook, error: nbError } = await supabase
      .from('notebooks')
      .select('id, user_id')
      .eq('id', notebook_id)
      .single();

    if (nbError || notebook.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Obtener entradas con media
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

    if (error) throw error;

    res.json({
      success: true,
      notebook_id,
      entries: entries.map(entry => ({
        id: entry.id,
        content: entry.content,
        created_at: new Date(entry.created_at).toLocaleString('es-ES'),
        media: entry.notebook_media || []
      }))
    });

  } catch (error) {
    console.error('Error al obtener entradas:', error);
    res.status(500).json({ error: 'Error al obtener entradas' });
  }
});

// ===== ENDPOINT: Obtener cuaderno por materia =====
router.get('/cuaderno/materia/:subject_id', verifyAuth, async (req, res) => {
  try {
    const { subject_id } = req.params;
    const userId = req.user.id;

    // Verificar que la materia pertenece al usuario
    const { data: subject, error: sbError } = await supabase
      .from('subjects')
      .select('id, name, user_id')
      .eq('id', subject_id)
      .single();

    if (sbError || subject.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Obtener o crear cuaderno
    let notebook = await supabase
      .from('notebooks')
      .select('id')
      .eq('subject_id', subject_id)
      .single();

    if (!notebook.data) {
      notebook = await crearCuadernoAutomatico(subject_id, userId);
    }

    res.json({
      success: true,
      notebook_id: notebook.data.id,
      subject_id,
      subject_name: subject.name
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error' });
  }
});

// ===== ENDPOINT: Actualizar entrada =====
router.put('/cuaderno/entrada/:entry_id', verifyAuth, async (req, res) => {
  try {
    const { entry_id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Verificar acceso
    const { data: entry } = await supabase
      .from('notebook_entries')
      .select('id, notebooks(user_id)')
      .eq('id', entry_id)
      .single();

    if (!entry || entry.notebooks.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Sanitizar
    const DOMPurify = require('isomorphic-dompurify');
    const cleanContent = DOMPurify.sanitize(content);

    const { data, error } = await supabase
      .from('notebook_entries')
      .update({ content: cleanContent })
      .eq('id', entry_id)
      .select();

    if (error) throw error;

    res.json({
      success: true,
      entry: data[0],
      message: 'Entrada actualizada'
    });

  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar' });
  }
});

// ===== ENDPOINT: Eliminar entrada =====
router.delete('/cuaderno/entrada/:entry_id', verifyAuth, async (req, res) => {
  try {
    const { entry_id } = req.params;
    const userId = req.user.id;

    // Verificar acceso
    const { data: entry } = await supabase
      .from('notebook_entries')
      .select('id, notebooks(user_id)')
      .eq('id', entry_id)
      .single();

    if (!entry || entry.notebooks.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { error } = await supabase
      .from('notebook_entries')
      .delete()
      .eq('id', entry_id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Entrada eliminada'
    });

  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar' });
  }
});

// ===== ENDPOINT: Subir archivo multimedia =====
router.post('/cuaderno/upload', verifyAuth, async (req, res) => {
  try {
    const { entry_id } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const userId = req.user.id;
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = `${userId}/${fileName}`;

    // Subir a Supabase Storage
    const { data, error } = await supabase.storage
      .from('notebooks')
      .upload(filePath, file.buffer);

    if (error) throw error;

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('notebooks')
      .getPublicUrl(filePath);

    // Guardar referencia en BD
    const { data: media, error: dbError } = await supabase
      .from('notebook_media')
      .insert({
        entry_id,
        file_url: urlData.publicUrl,
        file_type: file.mimetype.split('/')[0],
        file_name: file.originalname,
        file_size: file.size
      })
      .select();

    if (dbError) throw dbError;

    res.json({
      success: true,
      file_url: urlData.publicUrl,
      file_id: media[0].id
    });

  } catch (error) {
    res.status(500).json({ error: 'Error al subir archivo' });
  }
});

module.exports = { router, crearCuadernoAutomatico };

-- ============================================================
-- SCRIPT ADICIONAL: TRIGGERS Y FUNCIONES AUTOMÁTICAS
-- ============================================================
-- Ejecuta este script DESPUÉS de ejecutar SUPABASE_CUADERNO_NUEVAS_TABLAS.sql
-- 
-- Este script añade:
-- 1. Trigger para crear automáticamente un notebook al crear una materia
-- 2. Trigger para actualizar timestamps automáticamente
-- 3. Función para obtener estadísticas del cuaderno
-- ============================================================

-- ===== FUNCIÓN: Crear cuaderno automáticamente al crear materia =====
CREATE OR REPLACE FUNCTION public.create_notebook_on_subject_insert()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notebooks (subject_id, user_id, created_at, updated_at)
    VALUES (NEW.id, NEW.user_id, NOW(), NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger
DROP TRIGGER IF EXISTS trigger_create_notebook_on_subject_insert ON public.subjects;
CREATE TRIGGER trigger_create_notebook_on_subject_insert
    AFTER INSERT ON public.subjects
    FOR EACH ROW
    EXECUTE FUNCTION public.create_notebook_on_subject_insert();


-- ===== FUNCIÓN: Actualizar updated_at automáticamente en subjects =====
CREATE OR REPLACE FUNCTION public.update_subjects_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_subjects_timestamp ON public.subjects;
CREATE TRIGGER trigger_update_subjects_timestamp
    BEFORE UPDATE ON public.subjects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_subjects_timestamp();


-- ===== FUNCIÓN: Actualizar updated_at automáticamente en notebooks =====
CREATE OR REPLACE FUNCTION public.update_notebooks_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_notebooks_timestamp ON public.notebooks;
CREATE TRIGGER trigger_update_notebooks_timestamp
    BEFORE UPDATE ON public.notebooks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_notebooks_timestamp();


-- ===== FUNCIÓN: Actualizar updated_at automáticamente en notebook_entries =====
CREATE OR REPLACE FUNCTION public.update_notebook_entries_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_notebook_entries_timestamp ON public.notebook_entries;
CREATE TRIGGER trigger_update_notebook_entries_timestamp
    BEFORE UPDATE ON public.notebook_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.update_notebook_entries_timestamp();


-- ===== FUNCIÓN: Obtener estadísticas del cuaderno del usuario =====
CREATE OR REPLACE FUNCTION public.get_notebook_stats(p_user_id BIGINT)
RETURNS TABLE (
    total_subjects BIGINT,
    total_notebooks BIGINT,
    total_entries BIGINT,
    total_media BIGINT,
    entries_this_month BIGINT,
    entries_this_week BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM public.subjects WHERE user_id = p_user_id)::BIGINT,
        (SELECT COUNT(*) FROM public.notebooks WHERE user_id = p_user_id)::BIGINT,
        (SELECT COUNT(*) FROM public.notebook_entries ne 
         JOIN public.notebooks nb ON ne.notebook_id = nb.id 
         WHERE nb.user_id = p_user_id)::BIGINT,
        (SELECT COUNT(*) FROM public.notebook_media nm
         JOIN public.notebook_entries ne ON nm.entry_id = ne.id
         JOIN public.notebooks nb ON ne.notebook_id = nb.id
         WHERE nb.user_id = p_user_id)::BIGINT,
        (SELECT COUNT(*) FROM public.notebook_entries ne 
         JOIN public.notebooks nb ON ne.notebook_id = nb.id 
         WHERE nb.user_id = p_user_id 
         AND ne.created_at >= DATE_TRUNC('month', NOW()))::BIGINT,
        (SELECT COUNT(*) FROM public.notebook_entries ne 
         JOIN public.notebooks nb ON ne.notebook_id = nb.id 
         WHERE nb.user_id = p_user_id 
         AND ne.created_at >= DATE_TRUNC('week', NOW()))::BIGINT;
END;
$$ LANGUAGE plpgsql;


-- ===== FUNCIÓN: Obtener cuaderno con todas sus entradas =====
CREATE OR REPLACE FUNCTION public.get_notebook_with_entries(p_notebook_id BIGINT)
RETURNS TABLE (
    notebook_id BIGINT,
    subject_id BIGINT,
    subject_name VARCHAR,
    professor VARCHAR,
    entry_id BIGINT,
    entry_title VARCHAR,
    entry_content TEXT,
    entry_created_at TIMESTAMPTZ,
    media_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        nb.id,
        s.id,
        s.name,
        s.professor,
        ne.id,
        ne.title,
        ne.content,
        ne.created_at,
        (SELECT COUNT(*) FROM public.notebook_media WHERE entry_id = ne.id)::BIGINT
    FROM public.notebooks nb
    JOIN public.subjects s ON nb.subject_id = s.id
    LEFT JOIN public.notebook_entries ne ON nb.id = ne.notebook_id
    WHERE nb.id = p_notebook_id
    ORDER BY ne.created_at DESC;
END;
$$ LANGUAGE plpgsql;


-- ===== FUNCIÓN: Buscar entradas por contenido =====
CREATE OR REPLACE FUNCTION public.search_notebook_entries(p_user_id BIGINT, p_search_term VARCHAR)
RETURNS TABLE (
    entry_id BIGINT,
    notebook_id BIGINT,
    subject_name VARCHAR,
    entry_title VARCHAR,
    entry_content TEXT,
    created_at TIMESTAMPTZ,
    relevance_score FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ne.id,
        nb.id,
        s.name,
        ne.title,
        ne.content,
        ne.created_at,
        (
            CASE 
                WHEN ne.title ILIKE '%' || p_search_term || '%' THEN 2.0
                WHEN ne.content ILIKE '%' || p_search_term || '%' THEN 1.0
                ELSE 0.5
            END
        )::FLOAT
    FROM public.notebook_entries ne
    JOIN public.notebooks nb ON ne.notebook_id = nb.id
    JOIN public.subjects s ON nb.subject_id = s.id
    WHERE nb.user_id = p_user_id
    AND (ne.title ILIKE '%' || p_search_term || '%' 
         OR ne.content ILIKE '%' || p_search_term || '%')
    ORDER BY relevance_score DESC, ne.created_at DESC;
END;
$$ LANGUAGE plpgsql;


-- ===== FUNCIÓN: Obtener últimas entradas recientes =====
CREATE OR REPLACE FUNCTION public.get_recent_entries(p_user_id BIGINT, p_limit INT DEFAULT 10)
RETURNS TABLE (
    entry_id BIGINT,
    subject_name VARCHAR,
    entry_title VARCHAR,
    entry_preview TEXT,
    created_at TIMESTAMPTZ,
    media_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ne.id,
        s.name,
        ne.title,
        SUBSTRING(ne.content, 1, 150) || '...',
        ne.created_at,
        (SELECT COUNT(*) FROM public.notebook_media WHERE entry_id = ne.id)::BIGINT
    FROM public.notebook_entries ne
    JOIN public.notebooks nb ON ne.notebook_id = nb.id
    JOIN public.subjects s ON nb.subject_id = s.id
    WHERE nb.user_id = p_user_id
    ORDER BY ne.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;


-- ===== RESUMEN DE LO REALIZADO =====
-- ✅ Trigger para crear cuaderno automáticamente al crear materia
-- ✅ Triggers para actualizar timestamps automáticamente
-- ✅ Función para obtener estadísticas del cuaderno
-- ✅ Función para obtener cuaderno completo con entradas
-- ✅ Función para buscar entradas
-- ✅ Función para obtener entradas recientes
--
-- AHORA puedes usar estas funciones desde tu backend:
-- - SELECT public.get_notebook_stats(user_id)
-- - SELECT * FROM public.get_notebook_with_entries(notebook_id)
-- - SELECT * FROM public.search_notebook_entries(user_id, 'término')
-- - SELECT * FROM public.get_recent_entries(user_id, 10)

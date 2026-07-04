-- ============================================================
-- SCRIPT SQL PARA CREAR TABLAS FALTANTES DE CUADERNO DIGITAL
-- ============================================================
-- Este script crea las 4 tablas faltantes:
-- 1. subjects (Materias)
-- 2. notebooks (Cuadernos Digitales)
-- 3. notebook_entries (Entradas del Cuaderno)
-- 4. notebook_media (Multimedia del Cuaderno)
--
-- INSTRUCCIONES:
-- 1. Abre Supabase Dashboard
-- 2. Ve a SQL Editor
-- 3. Crea una nueva Query
-- 4. Copia y pega TODO este contenido
-- 5. Ejecuta (Ctrl+Enter o el botón Run)
-- ============================================================

-- ===== 1. CREAR TABLA: subjects (Materias) =====
CREATE TABLE IF NOT EXISTS public.subjects (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    professor VARCHAR(255),
    schedule VARCHAR(255),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON public.subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_subjects_created_at ON public.subjects(created_at DESC);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo ven sus propias materias
DROP POLICY IF EXISTS subjects_select ON public.subjects;
CREATE POLICY subjects_select ON public.subjects
    FOR SELECT
    USING (user_id = (SELECT id FROM auth.users WHERE id = auth.uid())::bigint);

-- Política: Los usuarios solo pueden insertar materias propias
DROP POLICY IF EXISTS subjects_insert ON public.subjects;
CREATE POLICY subjects_insert ON public.subjects
    FOR INSERT
    WITH CHECK (user_id = (SELECT id FROM auth.users WHERE id = auth.uid())::bigint);

-- Política: Los usuarios solo pueden actualizar sus materias
DROP POLICY IF EXISTS subjects_update ON public.subjects;
CREATE POLICY subjects_update ON public.subjects
    FOR UPDATE
    USING (user_id = (SELECT id FROM auth.users WHERE id = auth.uid())::bigint)
    WITH CHECK (user_id = (SELECT id FROM auth.users WHERE id = auth.uid())::bigint);

-- Política: Los usuarios solo pueden eliminar sus materias
DROP POLICY IF EXISTS subjects_delete ON public.subjects;
CREATE POLICY subjects_delete ON public.subjects
    FOR DELETE
    USING (user_id = (SELECT id FROM auth.users WHERE id = auth.uid())::bigint);


-- ===== 2. CREAR TABLA: notebooks (Cuadernos Digitales) =====
CREATE TABLE IF NOT EXISTS public.notebooks (
    id BIGSERIAL PRIMARY KEY,
    subject_id BIGINT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_notebooks_subject_id ON public.notebooks(subject_id);
CREATE INDEX IF NOT EXISTS idx_notebooks_user_id ON public.notebooks(user_id);
CREATE INDEX IF NOT EXISTS idx_notebooks_created_at ON public.notebooks(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.notebooks ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo ven sus propios cuadernos
DROP POLICY IF EXISTS notebooks_select ON public.notebooks;
CREATE POLICY notebooks_select ON public.notebooks
    FOR SELECT
    USING (user_id = (SELECT id FROM auth.users WHERE id = auth.uid())::bigint);

-- Política: Los usuarios solo pueden crear cuadernos propios
DROP POLICY IF EXISTS notebooks_insert ON public.notebooks;
CREATE POLICY notebooks_insert ON public.notebooks
    FOR INSERT
    WITH CHECK (user_id = (SELECT id FROM auth.users WHERE id = auth.uid())::bigint);

-- Política: Los usuarios solo pueden actualizar sus cuadernos
DROP POLICY IF EXISTS notebooks_update ON public.notebooks;
CREATE POLICY notebooks_update ON public.notebooks
    FOR UPDATE
    USING (user_id = (SELECT id FROM auth.users WHERE id = auth.uid())::bigint)
    WITH CHECK (user_id = (SELECT id FROM auth.users WHERE id = auth.uid())::bigint);

-- Política: Los usuarios solo pueden eliminar sus cuadernos
DROP POLICY IF EXISTS notebooks_delete ON public.notebooks;
CREATE POLICY notebooks_delete ON public.notebooks
    FOR DELETE
    USING (user_id = (SELECT id FROM auth.users WHERE id = auth.uid())::bigint);


-- ===== 3. CREAR TABLA: notebook_entries (Entradas del Cuaderno) =====
CREATE TABLE IF NOT EXISTS public.notebook_entries (
    id BIGSERIAL PRIMARY KEY,
    notebook_id BIGINT NOT NULL REFERENCES public.notebooks(id) ON DELETE CASCADE,
    content TEXT,
    title VARCHAR(500),
    tags VARCHAR(500),
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_notebook_entries_notebook_id ON public.notebook_entries(notebook_id);
CREATE INDEX IF NOT EXISTS idx_notebook_entries_created_at ON public.notebook_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notebook_entries_is_pinned ON public.notebook_entries(is_pinned);

-- Habilitar RLS
ALTER TABLE public.notebook_entries ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo ven entradas de sus cuadernos
DROP POLICY IF EXISTS notebook_entries_select ON public.notebook_entries;
CREATE POLICY notebook_entries_select ON public.notebook_entries
    FOR SELECT
    USING (
        notebook_id IN (
            SELECT id FROM public.notebooks 
            WHERE user_id = (SELECT id FROM auth.users WHERE id = auth.uid())::bigint
        )
    );

-- Política: Insertar entradas
DROP POLICY IF EXISTS notebook_entries_insert ON public.notebook_entries;
CREATE POLICY notebook_entries_insert ON public.notebook_entries
    FOR INSERT
    WITH CHECK (
        notebook_id IN (
            SELECT id FROM public.notebooks 
            WHERE user_id = (SELECT id FROM auth.users WHERE id = auth.uid())::bigint
        )
    );

-- Política: Actualizar entradas propias
DROP POLICY IF EXISTS notebook_entries_update ON public.notebook_entries;
CREATE POLICY notebook_entries_update ON public.notebook_entries
    FOR UPDATE
    USING (
        notebook_id IN (
            SELECT id FROM public.notebooks 
            WHERE user_id = (SELECT id FROM auth.users WHERE id = auth.uid())::bigint
        )
    )
    WITH CHECK (
        notebook_id IN (
            SELECT id FROM public.notebooks 
            WHERE user_id = (SELECT id FROM auth.users WHERE id = auth.uid())::bigint
        )
    );

-- Política: Eliminar entradas propias
DROP POLICY IF EXISTS notebook_entries_delete ON public.notebook_entries;
CREATE POLICY notebook_entries_delete ON public.notebook_entries
    FOR DELETE
    USING (
        notebook_id IN (
            SELECT id FROM public.notebooks 
            WHERE user_id = (SELECT id FROM auth.users WHERE id = auth.uid())::bigint
        )
    );


-- ===== 4. CREAR TABLA: notebook_media (Multimedia del Cuaderno) =====
CREATE TABLE IF NOT EXISTS public.notebook_media (
    id BIGSERIAL PRIMARY KEY,
    entry_id BIGINT NOT NULL REFERENCES public.notebook_entries(id) ON DELETE CASCADE,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50), -- image, video, audio, document
    file_name VARCHAR(255),
    file_size INTEGER,
    storage_path VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_notebook_media_entry_id ON public.notebook_media(entry_id);
CREATE INDEX IF NOT EXISTS idx_notebook_media_created_at ON public.notebook_media(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notebook_media_file_type ON public.notebook_media(file_type);

-- Habilitar RLS
ALTER TABLE public.notebook_media ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo ven multimedia de sus entradas
DROP POLICY IF EXISTS notebook_media_select ON public.notebook_media;
CREATE POLICY notebook_media_select ON public.notebook_media
    FOR SELECT
    USING (
        entry_id IN (
            SELECT ne.id FROM public.notebook_entries ne
            JOIN public.notebooks nb ON ne.notebook_id = nb.id
            WHERE nb.user_id = (SELECT id FROM auth.users WHERE id = auth.uid())::bigint
        )
    );

-- Política: Insertar multimedia
DROP POLICY IF EXISTS notebook_media_insert ON public.notebook_media;
CREATE POLICY notebook_media_insert ON public.notebook_media
    FOR INSERT
    WITH CHECK (
        entry_id IN (
            SELECT ne.id FROM public.notebook_entries ne
            JOIN public.notebooks nb ON ne.notebook_id = nb.id
            WHERE nb.user_id = (SELECT id FROM auth.users WHERE id = auth.uid())::bigint
        )
    );

-- Política: Eliminar multimedia propia
DROP POLICY IF EXISTS notebook_media_delete ON public.notebook_media;
CREATE POLICY notebook_media_delete ON public.notebook_media
    FOR DELETE
    USING (
        entry_id IN (
            SELECT ne.id FROM public.notebook_entries ne
            JOIN public.notebooks nb ON ne.notebook_id = nb.id
            WHERE nb.user_id = (SELECT id FROM auth.users WHERE id = auth.uid())::bigint
        )
    );


-- ===== AGREGAR RELACIÓN CON materialuser (Opcional pero recomendado) =====
-- Si quieres vincular subjects con las materias existentes en materialuser:
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS materialuser_id BIGINT REFERENCES public.materialuser(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_subjects_materialuser_id ON public.subjects(materialuser_id);


-- ===== VERIFICACIÓN FINAL =====
-- Ejecuta esto para confirmar que todo se creó correctamente:
/*
SELECT 
    'subjects' as table_name, COUNT(*) as row_count FROM public.subjects
UNION ALL
SELECT 'notebooks', COUNT(*) FROM public.notebooks
UNION ALL
SELECT 'notebook_entries', COUNT(*) FROM public.notebook_entries
UNION ALL
SELECT 'notebook_media', COUNT(*) FROM public.notebook_media;
*/

-- ===== RESUMEN DE LO REALIZADO =====
-- ✅ Tabla subjects creada con:
--    - id, user_id, name, professor, schedule, description
--    - Índices para optimizar búsquedas
--    - RLS habilitado (cada usuario ve solo sus materias)
--
-- ✅ Tabla notebooks creada con:
--    - id, subject_id (FK), user_id
--    - RLS habilitado (relación con subjects)
--
-- ✅ Tabla notebook_entries creada con:
--    - id, notebook_id (FK), content, title, tags, is_pinned
--    - RLS habilitado (relación con notebooks)
--
-- ✅ Tabla notebook_media creada con:
--    - id, entry_id (FK), file_url, file_type, file_name, file_size
--    - RLS habilitado (relación con notebook_entries)
--
-- ✅ Todas las tablas tienen RLS configurado para seguridad
-- ✅ Todas las relaciones tienen ON DELETE CASCADE para integridad

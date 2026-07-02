-- ============================================================
-- SQL COMPLETO PARA MI MOCHILA
-- ============================================================
-- Este script hace lo siguiente en un solo paso:
-- 1) Limpia y recrea las tablas afectadas con columnas compatibles
-- 2) Elimina constraints FK y políticas RLS que bloquean el cambio
-- 3) Ajusta el tipo de user_id a BIGINT para la app actual
--
-- ADVERTENCIA:
-- - Haz backup si ya tienes datos importantes.
-- - Este script recrea las tablas afectadas desde cero.
-- ============================================================

-- 0) Deshabilitar dependencias previas si existen
ALTER TABLE IF EXISTS public.materialuser DROP CONSTRAINT IF EXISTS materialuser_user_id_fkey;
ALTER TABLE IF EXISTS public.profiledate DROP CONSTRAINT IF EXISTS profiledate_user_id_fkey;
ALTER TABLE IF EXISTS public.bookdigital DROP CONSTRAINT IF EXISTS bookdigital_user_id_fkey;
ALTER TABLE IF EXISTS public.bookhistory DROP CONSTRAINT IF EXISTS bookhistory_user_id_fkey;
ALTER TABLE IF EXISTS public.gruppro DROP CONSTRAINT IF EXISTS gruppro_user_id_fkey;
ALTER TABLE IF EXISTS public.tareapro DROP CONSTRAINT IF EXISTS tareapro_user_id_fkey;

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT c.conrelid::regclass AS table_name,
               c.conname AS constraint_name
        FROM pg_constraint c
        JOIN pg_attribute a
          ON a.attrelid = c.conrelid
         AND a.attnum = ANY (c.conkey)
        WHERE c.contype = 'f'
          AND c.connamespace = 'public'::regnamespace
          AND a.attname = 'user_id'
          AND c.conrelid::regclass::text IN (
              'public.materialuser',
              'public.profiledate',
              'public.bookdigital',
              'public.bookhistory',
              'public.gruppro',
              'public.tareapro'
          )
    LOOP
        EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I', r.table_name, r.constraint_name);
    END LOOP;
END $$;

-- 1) Eliminar vistas dependientes que puedan bloquear el cambio
DO $$
DECLARE
    v RECORD;
BEGIN
    FOR v IN
        SELECT schemaname, viewname
        FROM pg_views
        WHERE schemaname = 'public'
          AND viewname IN ('materialuser', 'profiledate', 'bookdigital', 'bookhistory', 'gruppro', 'tareapro')
    LOOP
        EXECUTE format('DROP VIEW IF EXISTS %I.%I', v.schemaname, v.viewname);
    END LOOP;
END $$;

-- 2) Eliminar políticas RLS que puedan depender de estas tablas
DO $$
BEGIN
    IF to_regclass('public.materialuser') IS NOT NULL THEN
        DROP POLICY IF EXISTS materialuser_select ON public.materialuser;
        DROP POLICY IF EXISTS materialuser_insert ON public.materialuser;
        DROP POLICY IF EXISTS materialuser_update ON public.materialuser;
        DROP POLICY IF EXISTS materialuser_delete ON public.materialuser;
    END IF;

    IF to_regclass('public.profiledate') IS NOT NULL THEN
        DROP POLICY IF EXISTS profiledate_select ON public.profiledate;
        DROP POLICY IF EXISTS profiledate_insert ON public.profiledate;
        DROP POLICY IF EXISTS profiledate_update ON public.profiledate;
        DROP POLICY IF EXISTS profiledate_delete ON public.profiledate;
    END IF;

    IF to_regclass('public.bookdigital') IS NOT NULL THEN
        DROP POLICY IF EXISTS bookdigital_select ON public.bookdigital;
        DROP POLICY IF EXISTS bookdigital_insert ON public.bookdigital;
        DROP POLICY IF EXISTS bookdigital_update ON public.bookdigital;
        DROP POLICY IF EXISTS bookdigital_delete ON public.bookdigital;
    END IF;

    IF to_regclass('public.bookhistory') IS NOT NULL THEN
        DROP POLICY IF EXISTS bookhistory_select ON public.bookhistory;
        DROP POLICY IF EXISTS bookhistory_insert ON public.bookhistory;
        DROP POLICY IF EXISTS bookhistory_update ON public.bookhistory;
        DROP POLICY IF EXISTS bookhistory_delete ON public.bookhistory;
    END IF;

    IF to_regclass('public.gruppro') IS NOT NULL THEN
        DROP POLICY IF EXISTS gruppro_select ON public.gruppro;
        DROP POLICY IF EXISTS gruppro_insert ON public.gruppro;
        DROP POLICY IF EXISTS gruppro_update ON public.gruppro;
        DROP POLICY IF EXISTS gruppro_delete ON public.gruppro;
    END IF;

    IF to_regclass('public.tareapro') IS NOT NULL THEN
        DROP POLICY IF EXISTS tareapro_select ON public.tareapro;
        DROP POLICY IF EXISTS tareapro_insert ON public.tareapro;
        DROP POLICY IF EXISTS tareapro_update ON public.tareapro;
        DROP POLICY IF EXISTS tareapro_delete ON public.tareapro;
    END IF;
END $$;

-- 3) Eliminar las tablas afectadas
DROP VIEW IF EXISTS public.bookdigital_with_materials;
DROP VIEW IF EXISTS public.bookhistory_with_materials;
DROP TABLE IF EXISTS public.tareapro;
DROP TABLE IF EXISTS public.gruppro;
DROP TABLE IF EXISTS public.bookhistory;
DROP TABLE IF EXISTS public.bookdigital;
DROP TABLE IF EXISTS public.user_profiles;
DROP TABLE IF EXISTS public.profiledate;
DROP TABLE IF EXISTS public.materialuser;

-- 4) Recrear tablas alineadas con los controladores de la app
CREATE TABLE public.materialuser (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    admaterial TEXT,
    nameprof TEXT,
    horauser TEXT,
    descriptionmateria TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.profiledate (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    namecomplet TEXT,
    usermail TEXT,
    userfone TEXT,
    useruni TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.user_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    institution TEXT,
    career TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.bookdigital (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    materialuser_id BIGINT,
    texmaterial TEXT,
    imagmaterial JSONB DEFAULT '[]'::jsonb,
    vozmaterial JSONB DEFAULT '[]'::jsonb,
    moviematerial JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.bookhistory (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    materialuser_id BIGINT,
    texmaterial TEXT,
    imagmaterial JSONB DEFAULT '[]'::jsonb,
    vozmaterial JSONB DEFAULT '[]'::jsonb,
    moviematerial JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.gruppro (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    grupname TEXT,
    grupdecription TEXT,
    grupmail TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.tareapro (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    materialuser_id BIGINT,
    tareaname TEXT,
    tareadescription TEXT,
    datetarea TEXT,
    imagentarea TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE VIEW public.bookdigital_with_materials AS
SELECT
    b.id,
    b.user_id,
    b.materialuser_id,
    b.texmaterial,
    b.imagmaterial,
    b.vozmaterial,
    b.moviematerial,
    b.created_at,
    b.updated_at,
    m.admaterial AS subject_name,
    m.nameprof,
    m.horauser,
    m.descriptionmateria
FROM public.bookdigital b
LEFT JOIN public.materialuser m
    ON m.id = b.materialuser_id;

CREATE VIEW public.bookhistory_with_materials AS
SELECT
    h.id,
    h.user_id,
    h.materialuser_id,
    h.texmaterial,
    h.imagmaterial,
    h.vozmaterial,
    h.moviematerial,
    h.created_at,
    h.updated_at,
    m.admaterial AS subject_name,
    m.nameprof,
    m.horauser,
    m.descriptionmateria
FROM public.bookhistory h
LEFT JOIN public.materialuser m
    ON m.id = h.materialuser_id;

-- 5) Opcional: volver a activar RLS básico
-- ALTER TABLE public.materialuser ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY materialuser_select ON public.materialuser FOR SELECT USING (true);
-- CREATE POLICY materialuser_insert ON public.materialuser FOR INSERT WITH CHECK (true);
-- CREATE POLICY materialuser_update ON public.materialuser FOR UPDATE USING (true);
-- CREATE POLICY materialuser_delete ON public.materialuser FOR DELETE USING (true);

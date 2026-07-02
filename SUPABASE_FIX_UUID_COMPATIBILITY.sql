-- ============================================================
-- FIX COMPATIBILIDAD UUID PARA MI MOCHILA
-- ============================================================
-- Este script prepara las tablas Supabase para que acepten los
-- ids enteros locales usados por la app actual, en lugar de
-- exigir un UUID de auth.users.
--
-- IMPORTANTE:
-- - Haz una copia de seguridad si ya tienes datos importantes.
-- - Si prefieres el modelo UUID puro, tendrás que crear un auth
--   user real para cada usuario local y usar ese UUID en vez de
--   los ids enteros.
-- ============================================================

-- 1) Eliminar restricciones FOREIGN KEY que apuntan a auth.users(id)
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

-- 2) Eliminar vistas/rules dependientes de user_id para poder cambiar el tipo
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

-- 2b) Desactivar políticas RLS que dependen de user_id para poder cambiar el tipo
DROP POLICY IF EXISTS materialuser_select ON public.materialuser;
DROP POLICY IF EXISTS materialuser_insert ON public.materialuser;
DROP POLICY IF EXISTS materialuser_update ON public.materialuser;
DROP POLICY IF EXISTS materialuser_delete ON public.materialuser;

DROP POLICY IF EXISTS profiledate_select ON public.profiledate;
DROP POLICY IF EXISTS profiledate_insert ON public.profiledate;
DROP POLICY IF EXISTS profiledate_update ON public.profiledate;
DROP POLICY IF EXISTS profiledate_delete ON public.profiledate;

DROP POLICY IF EXISTS bookdigital_select ON public.bookdigital;
DROP POLICY IF EXISTS bookdigital_insert ON public.bookdigital;
DROP POLICY IF EXISTS bookdigital_update ON public.bookdigital;
DROP POLICY IF EXISTS bookdigital_delete ON public.bookdigital;

DROP POLICY IF EXISTS bookhistory_select ON public.bookhistory;
DROP POLICY IF EXISTS bookhistory_insert ON public.bookhistory;
DROP POLICY IF EXISTS bookhistory_update ON public.bookhistory;
DROP POLICY IF EXISTS bookhistory_delete ON public.bookhistory;

DROP POLICY IF EXISTS gruppro_select ON public.gruppro;
DROP POLICY IF EXISTS gruppro_insert ON public.gruppro;
DROP POLICY IF EXISTS gruppro_update ON public.gruppro;
DROP POLICY IF EXISTS gruppro_delete ON public.gruppro;

DROP POLICY IF EXISTS tareapro_select ON public.tareapro;
DROP POLICY IF EXISTS tareapro_insert ON public.tareapro;
DROP POLICY IF EXISTS tareapro_update ON public.tareapro;
DROP POLICY IF EXISTS tareapro_delete ON public.tareapro;

-- 3) Hacer que user_id acepte ids locales enteros
ALTER TABLE IF EXISTS public.materialuser
    ALTER COLUMN user_id DROP NOT NULL,
    ALTER COLUMN user_id TYPE BIGINT
    USING CASE
        WHEN trim(user_id::text) ~ '^[0-9]+$' THEN (user_id::text)::bigint
        ELSE NULL
    END;

ALTER TABLE IF EXISTS public.profiledate
    ALTER COLUMN user_id DROP NOT NULL,
    ALTER COLUMN user_id TYPE BIGINT
    USING CASE
        WHEN trim(user_id::text) ~ '^[0-9]+$' THEN (user_id::text)::bigint
        ELSE NULL
    END;

ALTER TABLE IF EXISTS public.bookdigital
    ALTER COLUMN user_id DROP NOT NULL,
    ALTER COLUMN user_id TYPE BIGINT
    USING CASE
        WHEN trim(user_id::text) ~ '^[0-9]+$' THEN (user_id::text)::bigint
        ELSE NULL
    END;

ALTER TABLE IF EXISTS public.bookhistory
    ALTER COLUMN user_id DROP NOT NULL,
    ALTER COLUMN user_id TYPE BIGINT
    USING CASE
        WHEN trim(user_id::text) ~ '^[0-9]+$' THEN (user_id::text)::bigint
        ELSE NULL
    END;

ALTER TABLE IF EXISTS public.gruppro
    ALTER COLUMN user_id DROP NOT NULL,
    ALTER COLUMN user_id TYPE BIGINT
    USING CASE
        WHEN trim(user_id::text) ~ '^[0-9]+$' THEN (user_id::text)::bigint
        ELSE NULL
    END;

ALTER TABLE IF EXISTS public.tareapro
    ALTER COLUMN user_id DROP NOT NULL,
    ALTER COLUMN user_id TYPE BIGINT
    USING CASE
        WHEN trim(user_id::text) ~ '^[0-9]+$' THEN (user_id::text)::bigint
        ELSE NULL
    END;

-- 3) Si quieres, puedes volver a crear índices si el cambio de tipo los afectó
--    (normalmente no es necesario, pero puedes dejarlo así si lo prefieres).

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================

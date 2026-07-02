-- ============================================================
-- RESET SEGURAMENTE DE TABLAS AFECTADAS POR user_id / UUID
-- ============================================================
-- Este script permite:
--   1) VACIAR las tablas afectadas (DELETE), o
--   2) ELIMINAR y RECREAR las tablas desde cero.
--
-- ADVERTENCIA:
-- - Haz backup si tienes datos importantes.
-- - El modo DROP/CREATE borra la estructura y los datos.
-- ============================================================

-- ============================================================
-- OPCIÓN A: SOLO VACIAR LAS TABLAS (mantiene estructura)
-- ============================================================
-- Descomenta esta parte si solo quieres limpiar los datos.

-- DELETE FROM public.materialuser;
-- DELETE FROM public.profiledate;
-- DELETE FROM public.bookdigital;
-- DELETE FROM public.bookhistory;
-- DELETE FROM public.gruppro;
-- DELETE FROM public.tareapro;

-- ============================================================
-- OPCIÓN B: ELIMINAR Y RECREAR LAS TABLAS (borra estructura y datos)
-- ============================================================
-- Descomenta esta parte si quieres empezar desde cero.

DROP TABLE IF EXISTS public.tareapro;
DROP TABLE IF EXISTS public.gruppro;
DROP TABLE IF EXISTS public.bookhistory;
DROP TABLE IF EXISTS public.bookdigital;
DROP TABLE IF EXISTS public.profiledate;
DROP TABLE IF EXISTS public.materialuser;

CREATE TABLE public.materialuser (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    name TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.profiledate (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    profile_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.bookdigital (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    title TEXT,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.bookhistory (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    book_id BIGINT,
    action TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.gruppro (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    group_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.tareapro (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    task_name TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- OPCIONAL: recrear políticas RLS básicas si las necesitas
-- ============================================================
-- Descomenta si tu proyecto usa RLS y quieres volver a activarlo.

-- ALTER TABLE public.materialuser ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY materialuser_select ON public.materialuser FOR SELECT USING (true);
-- CREATE POLICY materialuser_insert ON public.materialuser FOR INSERT WITH CHECK (true);
-- CREATE POLICY materialuser_update ON public.materialuser FOR UPDATE USING (true);
-- CREATE POLICY materialuser_delete ON public.materialuser FOR DELETE USING (true);

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================

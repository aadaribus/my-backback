-- ============================================================
-- FIX COMPATIBILIDAD UUID PARA MI MOCHILA
-- ============================================================
-- Este script corrige la incompatibilidad entre el modelo actual
-- del backend (usuarios locales con id entero) y las tablas
-- Supabase que esperan user_id UUID -> auth.users(id).
--
-- Opción recomendada: crear una tabla de compatibilidad que
-- permita almacenar el id local del usuario y usarlo en las
-- consultas de la app, mientras se evita el FK a auth.users.
-- ============================================================

-- 1) Crear una columna para id local y remover la FK UUID si existe
--    (ajusta según el estado real de tus tablas)

ALTER TABLE IF EXISTS materialuser ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE IF EXISTS profiledate ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE IF EXISTS bookdigital ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE IF EXISTS bookhistory ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE IF EXISTS gruppro ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE IF EXISTS tareapro ALTER COLUMN user_id DROP NOT NULL;

-- 2) Si las tablas tienen una FK a auth.users, eliminarla.
--    Nota: Supabase no permite eliminar FK con un nombre conocido
--    de forma simple; si el nombre es el esperado, puedes usar:
--    ALTER TABLE materialuser DROP CONSTRAINT IF EXISTS materialuser_user_id_fkey;
--    ALTER TABLE profiledate DROP CONSTRAINT IF EXISTS profiledate_user_id_fkey;
--    ALTER TABLE bookdigital DROP CONSTRAINT IF EXISTS bookdigital_user_id_fkey;
--    ALTER TABLE bookhistory DROP CONSTRAINT IF EXISTS bookhistory_user_id_fkey;
--    ALTER TABLE gruppro DROP CONSTRAINT IF EXISTS gruppro_user_id_fkey;
--    ALTER TABLE tareapro DROP CONSTRAINT IF EXISTS tareapro_user_id_fkey;

-- 3) Cambiar el tipo de la columna a BIGINT para que acepte los ids locales
ALTER TABLE IF EXISTS materialuser ALTER COLUMN user_id TYPE BIGINT USING NULL;
ALTER TABLE IF EXISTS profiledate ALTER COLUMN user_id TYPE BIGINT USING NULL;
ALTER TABLE IF EXISTS bookdigital ALTER COLUMN user_id TYPE BIGINT USING NULL;
ALTER TABLE IF EXISTS bookhistory ALTER COLUMN user_id TYPE BIGINT USING NULL;
ALTER TABLE IF EXISTS gruppro ALTER COLUMN user_id TYPE BIGINT USING NULL;
ALTER TABLE IF EXISTS tareapro ALTER COLUMN user_id TYPE BIGINT USING NULL;

-- 4) Asegurar que las tablas existan con el tipo compatible
--    (si prefieres no modificar columnas existentes, puedes crear tablas nuevas)

-- 5) Opcional: si quieres conservar la referencia a auth.users, debes crear
--    un auth user real para cada usuario local y usar ese UUID. En ese caso
--    deja la columna como UUID y usa el UUID real de auth.users.

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================

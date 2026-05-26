-- ============================================================
-- MI MOCHILA - TABLAS NECESARIAS
-- ============================================================
-- Ejecuta este script en la consola SQL de Supabase
-- https://app.supabase.com/project/[TU_PROJECT_ID]/sql/new
-- ============================================================

-- 1. TABLA: SUBJECTS (Materias/Asignaturas)
-- Una tabla para almacenar todas las materias del usuario
CREATE TABLE IF NOT EXISTS subjects (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  professor VARCHAR(255),
  schedule VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_subjects_user_id_name ON subjects(user_id, name);

-- Habilitar RLS en subjects
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
CREATE POLICY subjects_select ON subjects
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY subjects_insert ON subjects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY subjects_update ON subjects
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY subjects_delete ON subjects
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================

-- 2. TABLA: USER_PROFILES (Perfiles de Usuario)
-- Información extendida del perfil del usuario
CREATE TABLE IF NOT EXISTS user_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  institution VARCHAR(255),
  career VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Habilitar RLS en user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
CREATE POLICY user_profiles_select ON user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY user_profiles_insert ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_profiles_update ON user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_profiles_delete ON user_profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- ✅ FIN - Tablas creadas exitosamente
-- ============================================================
-- 
-- Ahora puedes usar los endpoints:
-- 
-- POST /api/materias/crear - Crear materia
-- GET /api/materias - Obtener materias
-- PUT /api/perfil - Actualizar perfil
--
-- ============================================================

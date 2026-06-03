-- ============================================================
-- CUADERNO DIGITAL - SQL COMPLETO PARA SUPABASE ACTUALIZADO
-- ============================================================
-- Ejecuta este script en la consola SQL de Supabase
-- Usa los parámetros personalizados especificados
-- ============================================================

-- ============================================================
-- 1. TABLA: USUARIOS - Perfil del usuario (profiledate)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiledate (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  namecomplet VARCHAR(255),
  usermail VARCHAR(255),
  userfone VARCHAR(20),
  useruni VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para profiledate
CREATE INDEX IF NOT EXISTS idx_profiledate_user_id ON profiledate(user_id);

-- ============================================================
-- 2. TABLA: MATERIAS/ASIGNATURAS (materialuser)
-- ============================================================
CREATE TABLE IF NOT EXISTS materialuser (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admaterial VARCHAR(255) NOT NULL,
  nameprof VARCHAR(255),
  horauser VARCHAR(255),
  descriptionmateria TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para materialuser
CREATE INDEX IF NOT EXISTS idx_materialuser_user_id ON materialuser(user_id);
CREATE INDEX IF NOT EXISTS idx_materialuser_admaterial ON materialuser(user_id, admaterial);

-- ============================================================
-- 3. TABLA: CUADERNO DIGITAL (bookdigital)
-- Enlaza con materias para mostrar nombre, profesor y horario
-- ============================================================
CREATE TABLE IF NOT EXISTS bookdigital (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  materialuser_id BIGINT NOT NULL REFERENCES materialuser(id) ON DELETE CASCADE,
  texmaterial TEXT,
  imagmaterial VARCHAR(500)[],
  vozmaterial VARCHAR(500)[],
  moviematerial VARCHAR(500)[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para bookdigital
CREATE INDEX IF NOT EXISTS idx_bookdigital_user_id ON bookdigital(user_id);
CREATE INDEX IF NOT EXISTS idx_bookdigital_materialuser_id ON bookdigital(materialuser_id);
CREATE INDEX IF NOT EXISTS idx_bookdigital_user_created ON bookdigital(user_id, created_at DESC);

-- ============================================================
-- 4. TABLA: HISTORIAL DE CUADERNO (bookhistory)
-- Almacena el historial sin opción de editar
-- ============================================================
CREATE TABLE IF NOT EXISTS bookhistory (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  materialuser_id BIGINT NOT NULL REFERENCES materialuser(id) ON DELETE CASCADE,
  texmaterial TEXT,
  imagmaterial VARCHAR(500)[],
  vozmaterial VARCHAR(500)[],
  moviematerial VARCHAR(500)[],
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para bookhistory
CREATE INDEX IF NOT EXISTS idx_bookhistory_user_id ON bookhistory(user_id);
CREATE INDEX IF NOT EXISTS idx_bookhistory_saved_at ON bookhistory(user_id, saved_at DESC);

-- ============================================================
-- 5. TABLA: GRUPOS (gruppro)
-- ============================================================
CREATE TABLE IF NOT EXISTS gruppro (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  grupname VARCHAR(255) NOT NULL,
  grupdecription TEXT,
  grupmail VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para gruppro
CREATE INDEX IF NOT EXISTS idx_gruppro_user_id ON gruppro(user_id);

-- ============================================================
-- 6. TABLA: TAREAS (tareapro)
-- ============================================================
CREATE TABLE IF NOT EXISTS tareapro (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  materialuser_id BIGINT REFERENCES materialuser(id) ON DELETE SET NULL,
  tareaname VARCHAR(255) NOT NULL,
  tareadescription TEXT,
  datetarea DATE,
  imagentarea VARCHAR(500),
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para tareapro
CREATE INDEX IF NOT EXISTS idx_tareapro_user_id ON tareapro(user_id);
CREATE INDEX IF NOT EXISTS idx_tareapro_datetarea ON tareapro(user_id, datetarea);
CREATE INDEX IF NOT EXISTS idx_tareapro_completed ON tareapro(user_id, completed);

-- ============================================================
-- POLÍTICAS DE SEGURIDAD (Row Level Security)
-- ============================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiledate ENABLE ROW LEVEL SECURITY;
ALTER TABLE materialuser ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookdigital ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookhistory ENABLE ROW LEVEL SECURITY;
ALTER TABLE gruppro ENABLE ROW LEVEL SECURITY;
ALTER TABLE tareapro ENABLE ROW LEVEL SECURITY;

-- ============== POLÍTICAS PARA PROFILEDATE ==============
DROP POLICY IF EXISTS profiledate_select ON profiledate;
DROP POLICY IF EXISTS profiledate_insert ON profiledate;
DROP POLICY IF EXISTS profiledate_update ON profiledate;
DROP POLICY IF EXISTS profiledate_delete ON profiledate;

CREATE POLICY profiledate_select ON profiledate
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY profiledate_insert ON profiledate
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY profiledate_update ON profiledate
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY profiledate_delete ON profiledate
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============== POLÍTICAS PARA MATERIALUSER ==============
DROP POLICY IF EXISTS materialuser_select ON materialuser;
DROP POLICY IF EXISTS materialuser_insert ON materialuser;
DROP POLICY IF EXISTS materialuser_update ON materialuser;
DROP POLICY IF EXISTS materialuser_delete ON materialuser;

CREATE POLICY materialuser_select ON materialuser
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY materialuser_insert ON materialuser
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY materialuser_update ON materialuser
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY materialuser_delete ON materialuser
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============== POLÍTICAS PARA BOOKDIGITAL ==============
DROP POLICY IF EXISTS bookdigital_select ON bookdigital;
DROP POLICY IF EXISTS bookdigital_insert ON bookdigital;
DROP POLICY IF EXISTS bookdigital_update ON bookdigital;
DROP POLICY IF EXISTS bookdigital_delete ON bookdigital;

CREATE POLICY bookdigital_select ON bookdigital
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY bookdigital_insert ON bookdigital
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY bookdigital_update ON bookdigital
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY bookdigital_delete ON bookdigital
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============== POLÍTICAS PARA BOOKHISTORY ==============
DROP POLICY IF EXISTS bookhistory_select ON bookhistory;
DROP POLICY IF EXISTS bookhistory_insert ON bookhistory;
DROP POLICY IF EXISTS bookhistory_delete ON bookhistory;

CREATE POLICY bookhistory_select ON bookhistory
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY bookhistory_insert ON bookhistory
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY bookhistory_delete ON bookhistory
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============== POLÍTICAS PARA GRUPPRO ==============
DROP POLICY IF EXISTS gruppro_select ON gruppro;
DROP POLICY IF EXISTS gruppro_insert ON gruppro;
DROP POLICY IF EXISTS gruppro_update ON gruppro;
DROP POLICY IF EXISTS gruppro_delete ON gruppro;

CREATE POLICY gruppro_select ON gruppro
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY gruppro_insert ON gruppro
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY gruppro_update ON gruppro
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY gruppro_delete ON gruppro
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============== POLÍTICAS PARA TAREAPRO ==============
DROP POLICY IF EXISTS tareapro_select ON tareapro;
DROP POLICY IF EXISTS tareapro_insert ON tareapro;
DROP POLICY IF EXISTS tareapro_update ON tareapro;
DROP POLICY IF EXISTS tareapro_delete ON tareapro;

CREATE POLICY tareapro_select ON tareapro
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY tareapro_insert ON tareapro
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY tareapro_update ON tareapro
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY tareapro_delete ON tareapro
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- VISTAS ÚTILES
-- ============================================================

-- Vista para obtener cuadernos con información completa de la materia
CREATE OR REPLACE VIEW bookdigital_with_materials AS
SELECT 
  b.id AS bookdigital_id,
  b.user_id,
  b.materialuser_id,
  m.admaterial,
  m.nameprof,
  m.horauser,
  b.texmaterial,
  b.imagmaterial,
  b.vozmaterial,
  b.moviematerial,
  b.created_at,
  b.updated_at
FROM bookdigital b
JOIN materialuser m ON b.materialuser_id = m.id;

-- Vista para obtener historial con información completa
CREATE OR REPLACE VIEW bookhistory_with_materials AS
SELECT 
  bh.id AS bookhistory_id,
  bh.user_id,
  bh.materialuser_id,
  m.admaterial,
  m.nameprof,
  m.horauser,
  bh.texmaterial,
  bh.imagmaterial,
  bh.vozmaterial,
  bh.moviematerial,
  bh.saved_at
FROM bookhistory bh
JOIN materialuser m ON bh.materialuser_id = m.id;

-- ============================================================
-- FUNCIONES ÚTILES
-- ============================================================

-- Función para mover entrada del cuaderno al historial
CREATE OR REPLACE FUNCTION move_to_history()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO bookhistory (
    user_id, 
    materialuser_id, 
    texmaterial, 
    imagmaterial, 
    vozmaterial, 
    moviematerial
  )
  VALUES (
    NEW.user_id,
    NEW.materialuser_id,
    NEW.texmaterial,
    NEW.imagmaterial,
    NEW.vozmaterial,
    NEW.moviematerial
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para mover a historial cuando se guarda
CREATE OR REPLACE TRIGGER trigger_move_to_history
AFTER INSERT ON bookdigital
FOR EACH ROW
EXECUTE FUNCTION move_to_history();

-- ============================================================
-- VERIFICACIÓN FINAL
-- ============================================================
-- Ejecuta estos SELECT para verificar que todo fue creado:

SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiledate', 'materialuser', 'bookdigital', 'bookhistory', 'gruppro', 'tareapro');

INSERT INTO profiledate (user_id, namecomplet, usermail, userfone, useruni)
VALUES ('tu-uuid-aqui', 'Juan García', 'juan@example.com', '+34612345678', 'Universidad de Madrid');


INSERT INTO materialuser (user_id, admaterial, nameprof, horauser, descriptionmateria)
VALUES ('tu-uuid-aqui', 'Matemáticas', 'Dr. García', 'Lunes 9am', 'Cálculo avanzado');


INSERT INTO bookdigital (user_id, materialuser_id, texmaterial)
VALUES ('tu-uuid-aqui', 1, '<p>Mi primera entrada</p>');


SELECT * FROM bookhistory;
*/

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================

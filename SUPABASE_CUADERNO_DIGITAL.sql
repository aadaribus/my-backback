-- ============================================================
-- CUADERNO DIGITAL - SQL COMPLETO PARA SUPABASE
-- ============================================================
-- Ejecuta este script en la consola SQL de Supabase
-- o cópialo en el SQL Editor: https://app.supabase.com/project/[TU_PROJECT_ID]/sql/new
-- ============================================================

-- 1. TABLA: ASIGNATURAS/MATERIAS (si no existe)
-- Esta tabla ya debería existir, pero aquí va la definición de referencia
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

-- Índices para subjects
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_subjects_user_id_name ON subjects(user_id, name);

-- ============================================================
-- 2. TABLA: CUADERNOS DIGITALES
-- Un cuaderno por cada materia
-- ============================================================
CREATE TABLE IF NOT EXISTS notebooks (
  id BIGSERIAL PRIMARY KEY,
  subject_id BIGINT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(subject_id, user_id)  -- Un cuaderno por materia y usuario
);

-- Índices para notebooks
CREATE INDEX IF NOT EXISTS idx_notebooks_user_id ON notebooks(user_id);
CREATE INDEX IF NOT EXISTS idx_notebooks_subject_id ON notebooks(subject_id);
CREATE INDEX IF NOT EXISTS idx_notebooks_user_subject ON notebooks(user_id, subject_id);

-- ============================================================
-- 3. TABLA: ENTRADAS DEL CUADERNO
-- Cada apunte/entrada del estudiante
-- ============================================================
CREATE TABLE IF NOT EXISTS notebook_entries (
  id BIGSERIAL PRIMARY KEY,
  notebook_id BIGINT NOT NULL REFERENCES notebooks(id) ON DELETE CASCADE,
  content TEXT NOT NULL,  -- HTML con formateo
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para notebook_entries
CREATE INDEX IF NOT EXISTS idx_notebook_entries_notebook_id ON notebook_entries(notebook_id);
CREATE INDEX IF NOT EXISTS idx_notebook_entries_created_at ON notebook_entries(notebook_id, created_at DESC);

-- ============================================================
-- 4. TABLA: MULTIMEDIA EN CUADERNO
-- Imágenes, videos, audio, archivos asociados a entradas
-- ============================================================
CREATE TABLE IF NOT EXISTS notebook_media (
  id BIGSERIAL PRIMARY KEY,
  entry_id BIGINT NOT NULL REFERENCES notebook_entries(id) ON DELETE CASCADE,
  file_url VARCHAR(500) NOT NULL,  -- URL del archivo (Data URL o Storage URL)
  file_type VARCHAR(50) NOT NULL,  -- 'image', 'video', 'audio', 'file'
  file_name VARCHAR(255),
  file_size BIGINT,  -- Tamaño en bytes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para notebook_media
CREATE INDEX IF NOT EXISTS idx_notebook_media_entry_id ON notebook_media(entry_id);
CREATE INDEX IF NOT EXISTS idx_notebook_media_file_type ON notebook_media(file_type);

-- ============================================================
-- POLÍTICAS DE SEGURIDAD (Row Level Security)
-- ============================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notebook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notebook_media ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA SUBJECTS
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

-- POLÍTICAS PARA NOTEBOOKS
CREATE POLICY notebooks_select ON notebooks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY notebooks_insert ON notebooks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY notebooks_update ON notebooks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY notebooks_delete ON notebooks
  FOR DELETE
  USING (auth.uid() = user_id);

-- POLÍTICAS PARA NOTEBOOK_ENTRIES
CREATE POLICY notebook_entries_select ON notebook_entries
  FOR SELECT
  USING (
    notebook_id IN (
      SELECT id FROM notebooks WHERE user_id = auth.uid()
    )
  );

CREATE POLICY notebook_entries_insert ON notebook_entries
  FOR INSERT
  WITH CHECK (
    notebook_id IN (
      SELECT id FROM notebooks WHERE user_id = auth.uid()
    )
  );

CREATE POLICY notebook_entries_update ON notebook_entries
  FOR UPDATE
  USING (
    notebook_id IN (
      SELECT id FROM notebooks WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    notebook_id IN (
      SELECT id FROM notebooks WHERE user_id = auth.uid()
    )
  );

CREATE POLICY notebook_entries_delete ON notebook_entries
  FOR DELETE
  USING (
    notebook_id IN (
      SELECT id FROM notebooks WHERE user_id = auth.uid()
    )
  );

-- POLÍTICAS PARA NOTEBOOK_MEDIA
CREATE POLICY notebook_media_select ON notebook_media
  FOR SELECT
  USING (
    entry_id IN (
      SELECT id FROM notebook_entries 
      WHERE notebook_id IN (
        SELECT id FROM notebooks WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY notebook_media_insert ON notebook_media
  FOR INSERT
  WITH CHECK (
    entry_id IN (
      SELECT id FROM notebook_entries 
      WHERE notebook_id IN (
        SELECT id FROM notebooks WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY notebook_media_delete ON notebook_media
  FOR DELETE
  USING (
    entry_id IN (
      SELECT id FROM notebook_entries 
      WHERE notebook_id IN (
        SELECT id FROM notebooks WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================
-- VISTAS ÚTILES (OPCIONAL)
-- ============================================================

-- Vista para obtener cuadernos con información de la materia
CREATE OR REPLACE VIEW notebooks_with_subjects AS
SELECT 
  n.id AS notebook_id,
  n.user_id,
  n.created_at AS notebook_created_at,
  s.id AS subject_id,
  s.name AS subject_name,
  s.professor,
  s.schedule,
  s.description,
  COUNT(ne.id) AS entry_count
FROM notebooks n
JOIN subjects s ON n.subject_id = s.id
LEFT JOIN notebook_entries ne ON n.id = ne.notebook_id
GROUP BY n.id, n.user_id, n.created_at, s.id, s.name, s.professor, s.schedule, s.description;

-- Vista para obtener estadísticas del cuaderno
CREATE OR REPLACE VIEW notebook_statistics AS
SELECT 
  n.id AS notebook_id,
  s.id AS subject_id,
  s.name AS subject_name,
  COUNT(ne.id) AS total_entries,
  COUNT(CASE WHEN nm.file_type = 'image' THEN 1 END) AS image_count,
  COUNT(CASE WHEN nm.file_type = 'video' THEN 1 END) AS video_count,
  COUNT(CASE WHEN nm.file_type = 'audio' THEN 1 END) AS audio_count,
  COUNT(CASE WHEN nm.file_type = 'file' THEN 1 END) AS file_count,
  MAX(ne.created_at) AS last_entry_date,
  MIN(ne.created_at) AS first_entry_date
FROM notebooks n
JOIN subjects s ON n.subject_id = s.id
LEFT JOIN notebook_entries ne ON n.id = ne.notebook_id
LEFT JOIN notebook_media nm ON ne.id = nm.entry_id
GROUP BY n.id, s.id, s.name;

-- ============================================================
-- FUNCIONES ÚTILES
-- ============================================================

-- Función para crear automáticamente un cuaderno cuando se crea una materia
CREATE OR REPLACE FUNCTION create_notebook_on_subject_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notebooks (subject_id, user_id, created_at)
  VALUES (NEW.id, NEW.user_id, CURRENT_TIMESTAMP);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para crear cuaderno automáticamente
CREATE OR REPLACE TRIGGER trigger_create_notebook_on_subject
AFTER INSERT ON subjects
FOR EACH ROW
EXECUTE FUNCTION create_notebook_on_subject_insert();

-- ============================================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- DESCOMENTAR SOLO SI QUIERES PROBAR CON DATOS
-- ============================================================

-- Para obtener tu user_id, ve a: https://app.supabase.com/project/[TU_PROJECT]/auth/users
-- y copia el UUID de tu usuario

/*
-- Ejemplo de inserción (reemplaza el UUID con el tuyo)
INSERT INTO subjects (user_id, name, professor, schedule, description)
VALUES (
  'tu-user-uuid-aqui',
  'Matemáticas',
  'Prof. Juan García',
  'Lunes-Miércoles 10:00-12:00',
  'Cálculo integral y diferencial'
);

-- Esto automáticamente creará un cuaderno associated
-- Luego puedes agregar entradas:
INSERT INTO notebook_entries (notebook_id, content)
VALUES (1, '<p>Mi primer apunte de matemáticas</p>');

INSERT INTO notebook_media (entry_id, file_url, file_type, file_name)
VALUES (1, 'https://ejemplo.com/imagen.jpg', 'image', 'imagen.jpg');
*/

-- ============================================================
-- VERIFICACIÓN FINAL
-- ============================================================
-- Ejecuta estos SELECT para verificar que todo fue creado:
-- SELECT * FROM information_schema.tables WHERE table_schema = 'public';
-- SELECT * FROM information_schema.schemata;
-- ============================================================

-- CREAR TODAS LAS TABLAS Y POLÍTICAS PARA SUPABASE
-- Copia TODO este contenido en: https://app.supabase.com/project/[TU_ID]/sql/new

-- ============================================================
-- 1. TABLA: SUBJECTS (Asignaturas)
-- ============================================================
DROP TABLE IF EXISTS notebook_media CASCADE;
DROP TABLE IF EXISTS notebook_entries CASCADE;
DROP TABLE IF EXISTS notebooks CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;

CREATE TABLE subjects (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  professor VARCHAR(255),
  schedule VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subjects_user_id ON subjects(user_id);
CREATE INDEX idx_subjects_user_id_name ON subjects(user_id, name);

-- ============================================================
-- 2. TABLA: NOTEBOOKS (Cuadernos)
-- ============================================================
CREATE TABLE notebooks (
  id BIGSERIAL PRIMARY KEY,
  subject_id BIGINT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(subject_id, user_id)
);

CREATE INDEX idx_notebooks_user_id ON notebooks(user_id);
CREATE INDEX idx_notebooks_subject_id ON notebooks(subject_id);
CREATE INDEX idx_notebooks_user_subject ON notebooks(user_id, subject_id);

-- ============================================================
-- 3. TABLA: NOTEBOOK_ENTRIES (Entradas)
-- ============================================================
CREATE TABLE notebook_entries (
  id BIGSERIAL PRIMARY KEY,
  notebook_id BIGINT NOT NULL REFERENCES notebooks(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notebook_entries_notebook_id ON notebook_entries(notebook_id);
CREATE INDEX idx_notebook_entries_created_at ON notebook_entries(notebook_id, created_at DESC);

-- ============================================================
-- 4. TABLA: NOTEBOOK_MEDIA (Multimedia)
-- ============================================================
CREATE TABLE notebook_media (
  id BIGSERIAL PRIMARY KEY,
  entry_id BIGINT NOT NULL REFERENCES notebook_entries(id) ON DELETE CASCADE,
  file_url VARCHAR(500) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_name VARCHAR(255),
  file_size BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notebook_media_entry_id ON notebook_media(entry_id);
CREATE INDEX idx_notebook_media_file_type ON notebook_media(file_type);

-- ============================================================
-- HABILITAR ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notebook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notebook_media ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLÍTICAS PARA SUBJECTS
-- ============================================================
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
-- POLÍTICAS PARA NOTEBOOKS
-- ============================================================
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

-- ============================================================
-- POLÍTICAS PARA NOTEBOOK_ENTRIES
-- ============================================================
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

-- ============================================================
-- POLÍTICAS PARA NOTEBOOK_MEDIA
-- ============================================================
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

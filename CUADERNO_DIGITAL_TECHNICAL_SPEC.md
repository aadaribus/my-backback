# Especificación Técnica - Cuaderno Digital

## 1. Arquitectura y Relación de Datos

### Estructura de Base de Datos

#### Tabla: `subjects` (Materias)
```sql
CREATE TABLE subjects (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  professor VARCHAR(255),
  schedule VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla: `notebooks` (Cuadernos Digitales)
```sql
CREATE TABLE notebooks (
  id SERIAL PRIMARY KEY,
  subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla: `notebook_entries` (Entradas del Cuaderno)
```sql
CREATE TABLE notebook_entries (
  id SERIAL PRIMARY KEY,
  notebook_id INTEGER REFERENCES notebooks(id) ON DELETE CASCADE,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla: `notebook_media` (Multimedia en Cuaderno)
```sql
CREATE TABLE notebook_media (
  id SERIAL PRIMARY KEY,
  entry_id INTEGER REFERENCES notebook_entries(id) ON DELETE CASCADE,
  file_url VARCHAR(500),
  file_type VARCHAR(50), -- image, video, audio, file
  file_name VARCHAR(255),
  file_size INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 2. API Endpoints Requeridos

### Crear Cuaderno Digital (Auto-crearse al agregar materia)
**POST** `/api/cuaderno/crear`
```json
{
  "subject_id": 1,
  "subject_name": "Matemáticas"
}
```

**Response:**
```json
{
  "success": true,
  "notebook_id": 1,
  "message": "Cuaderno digital creado para Matemáticas"
}
```

---

### Guardar Entrada en Cuaderno
**POST** `/api/cuaderno/guardar`
```json
{
  "notebook_id": 1,
  "content": "<p>Mi primer apunte...</p>",
  "media_files": [
    {
      "url": "data:image/png;base64,...",
      "type": "image",
      "name": "foto.png"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "entry_id": 1,
  "timestamp": "2026-05-24 14:30:45",
  "message": "Entrada guardada exitosamente"
}
```

---

### Obtener Entradas del Cuaderno
**GET** `/api/cuaderno/:notebook_id`

**Response:**
```json
{
  "success": true,
  "notebook_id": 1,
  "entries": [
    {
      "id": 1,
      "content": "<p>Mi primer apunte...</p>",
      "created_at": "2026-05-24 14:30:45",
      "media": [
        {
          "id": 1,
          "file_url": "https://...",
          "file_type": "image",
          "file_name": "foto.png"
        }
      ]
    }
  ]
}
```

---

### Obtener Cuaderno por Materia
**GET** `/api/cuaderno/materia/:subject_id`

**Response:**
```json
{
  "success": true,
  "notebook_id": 1,
  "subject_id": 1,
  "subject_name": "Matemáticas"
}
```

---

### Actualizar Entrada del Cuaderno
**PUT** `/api/cuaderno/entrada/:entry_id`
```json
{
  "content": "<p>Contenido actualizado...</p>"
}
```

---

### Eliminar Entrada del Cuaderno
**DELETE** `/api/cuaderno/entrada/:entry_id`

---

### Subir Archivo a Cuaderno
**POST** `/api/cuaderno/upload`
```json
{
  "file": "multipart/form-data",
  "type": "image",
  "entry_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "file_url": "https://...",
  "file_id": 1
}
```

---

## 3. Flujo de Funcionamiento

### 1. Agregar Materia
```
Usuario clicks "Agregar Materia"
    ↓
Modal se abre
    ↓
Usuario llena datos (nombre, profesor, horario, descripción)
    ↓
Click en "Guardar"
    ↓
POST /api/materias/crear
    ↓
Backend crea la materia en DB
    ↓
Backend crea automáticamente un cuaderno digital asociado
    ↓
Cuaderno digital inicializado en blanco
```

### 2. Abrir Cuaderno Digital
```
Usuario clicks icono "Cuaderno Digital"
    ↓
Modal amplio se abre (95% viewport)
    ↓
GET /api/cuaderno/materia/:subject_id
    ↓
Se cargan las entradas previas
    ↓
Editor de texto enriquecido listo para escribir
```

### 3. Agregar Contenido
```
Usuario escribe en el editor
    ↓
Usuario arrastra/carga archivos (Drag & Drop)
    ↓
Los archivos se insertan en el editor
    ↓
User clicks "Guardar"
    ↓
POST /api/cuaderno/guardar con content + media
    ↓
Backend almacena con timestamp automático
    ↓
Entrada aparece en lista cronológica
```

---

## 4. Especificación de Frontend

### Componentes Activos

#### Editor de Texto Enriquecido
- Contenteditable div con soporte nativo para formateo
- Soporta: negrita, cursiva, subrayado, limpiar formato
- Soporta: inserción de elementos HTML (imágenes, videos, audio)

#### Drag & Drop
- Zona drop activa
- Detecta tipo de archivo automáticamente
- Inserta elemento apropiado en el editor

#### Almacenamiento Local
- localStorage como cache temporal
- `notebook_${subject_name}` como clave
- Sincronización con backend al guardar

#### Timestamps
- Formato: `DD/MM/YYYY HH:MM:SS`
- Locale: `es-ES`
- Automático al guardar cada entrada

---

## 5. Seguridad

- Validar `user_id` en backend para acceso a cuadernos propios
- Sanitizar HTML en backend (DOMPurify o similar)
- Validar tipos de archivo en server
- Limitar tamaño de archivos (ej: 50MB)
- Rate limiting en endpoints de guardado

---

## 6. Consideraciones de Performance

- Lazy load de entradas (paginar si hay muchas)
- Compresión de imágenes en backend
- CDN para archivos multimedia
- Índices en BD para queries frecuentes:
  - `notebooks(user_id, subject_id)`
  - `notebook_entries(notebook_id, created_at)`

---

## 7. Funcionalidades Futuras

- Búsqueda de entradas
- Filtrado por fecha
- Exportar cuaderno (PDF, DOCX)
- Compartir cuaderno con otros usuarios
- Historial de cambios (versioning)
- Reconocimiento de voz para notas de audio
- IA para resumir apuntes
- Recordatorios de estudio

---

## 8. Estado Actual de Implementación

✅ **Frontend:**
- Modal amplio HTML
- Editor contenteditable
- Toolbar con formateo
- Drag & Drop
- Inserción de media
- Timestamps
- localStorage

⚠️ **Pendiente Backend:**
- Rutas API
- Validaciones
- Almacenamiento en BD
- Subida de archivos
- Sincronización

---

## Próximos Pasos

1. Implementar endpoints en backend (Node.js + Express)
2. Integrar con Supabase para almacenamiento persistente
3. Implementar storage de archivos (Supabase Storage o AWS S3)
4. Crear controlador de cuadernos en `app/controllers/`
5. Testing completo

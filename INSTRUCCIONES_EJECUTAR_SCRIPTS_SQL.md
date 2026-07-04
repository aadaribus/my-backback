# 📋 INSTRUCCIONES: Crear Tablas Faltantes en Supabase

## ¿Qué vamos a hacer?

Crear las 4 tablas faltantes en Supabase para el módulo de Cuaderno Digital:
- ✅ **subjects** (Materias)
- ✅ **notebooks** (Cuadernos Digitales)
- ✅ **notebook_entries** (Entradas del Cuaderno)
- ✅ **notebook_media** (Multimedia del Cuaderno)

---

## 📍 PASO 1: Ir a Supabase SQL Editor

### Opción A: Desde la web
1. Abre [supabase.com](https://supabase.com)
2. Inicia sesión en tu proyecto
3. En el menú lateral izquierdo, busca **"SQL Editor"**
4. Haz clic en **"New Query"**

### Opción B: Desde tu proyecto
1. Ve a tu Dashboard de Supabase
2. Proyecto → **SQL Editor**
3. Haz clic en **"+"** para crear nueva query

---

## 📍 PASO 2: Ejecutar el Script Principal

### 2.1 Copiar el script
1. Abre el archivo: **`SUPABASE_CUADERNO_NUEVAS_TABLAS.sql`**
2. Selecciona TODO el contenido (Ctrl+A)
3. Copia (Ctrl+C)

### 2.2 Pegar en Supabase
1. En la página de SQL Editor de Supabase, pega el código en el área de texto
2. Verás todo el script SQL

### 2.3 Ejecutar
**Opción A (recomendado):** 
- Presiona `Ctrl + Enter` para ejecutar

**Opción B:**
- Busca el botón **"Run"** o **"Execute"** en la esquina superior derecha
- Haz clic en él

### 2.4 Esperar a que se complete
- Verás un mensaje: ✅ **"Success"** o mensajes verdes de confirmación
- Si hay errores (en rojo), revisa la consola de errores

---

## 📍 PASO 3: Verificar que todo se creó

Ejecuta esta consulta de verificación en una nueva Query:

```sql
SELECT 
    'subjects' as table_name, COUNT(*) as row_count FROM public.subjects
UNION ALL
SELECT 'notebooks', COUNT(*) FROM public.notebooks
UNION ALL
SELECT 'notebook_entries', COUNT(*) FROM public.notebook_entries
UNION ALL
SELECT 'notebook_media', COUNT(*) FROM public.notebook_media;
```

**Resultado esperado:**
```
table_name          row_count
─────────────────────────────
subjects                  0
notebooks                 0
notebook_entries          0
notebook_media            0
```

✅ Si ves esta tabla con ceros, las 4 tablas se crearon correctamente!

---

## 📍 PASO 4: Ejecutar Script de Triggers (OPCIONAL pero RECOMENDADO)

Después de ejecutar el script principal, ejecuta también:

### 4.1 Copiar el script de triggers
1. Abre: **`SUPABASE_CUADERNO_TRIGGERS_Y_FUNCIONES.sql`**
2. Copia TODO el contenido (Ctrl+A, Ctrl+C)

### 4.2 Ejecutar en Supabase
1. Crea una nueva Query en SQL Editor
2. Pega el contenido (Ctrl+V)
3. Ejecuta (Ctrl+Enter)

**Beneficios de ejecutar este script:**
- ✅ Los cuadernos se crean automáticamente cuando creas una materia
- ✅ Los timestamps (created_at, updated_at) se actualizan automáticamente
- ✅ Tienes funciones útiles para obtener estadísticas y buscar entradas
- ✅ Funciones para obtener las últimas entradas y más

---

## ✅ Verificación Final

Ve a tu Dashboard de Supabase y:

1. **Haz clic en "Table Editor"** (en el menú izquierdo)
2. Deberías ver estas nuevas tablas:
   - `subjects` ✅
   - `notebooks` ✅
   - `notebook_entries` ✅
   - `notebook_media` ✅

3. Haz clic en cada una para confirmar que tiene las columnas correctas

---

## 📊 Estructura de las Tablas

### 1️⃣ **subjects** (Materias)
```
Columnas:
- id (BIGSERIAL, PK)
- user_id (BIGINT, FK a auth.users)
- name (VARCHAR 255)
- professor (VARCHAR 255, nullable)
- schedule (VARCHAR 255, nullable)
- description (TEXT, nullable)
- materialuser_id (BIGINT, FK - relación opcional)
- created_at, updated_at (TIMESTAMPTZ)
```

### 2️⃣ **notebooks** (Cuadernos)
```
Columnas:
- id (BIGSERIAL, PK)
- subject_id (BIGINT, FK a subjects)
- user_id (BIGINT)
- created_at, updated_at (TIMESTAMPTZ)

Nota: Se crea automáticamente al crear una materia (trigger)
```

### 3️⃣ **notebook_entries** (Entradas)
```
Columnas:
- id (BIGSERIAL, PK)
- notebook_id (BIGINT, FK a notebooks)
- content (TEXT - para guardar HTML del editor)
- title (VARCHAR 500, nullable)
- tags (VARCHAR 500, nullable)
- is_pinned (BOOLEAN, default false)
- created_at, updated_at (TIMESTAMPTZ)
```

### 4️⃣ **notebook_media** (Archivos Multimedia)
```
Columnas:
- id (BIGSERIAL, PK)
- entry_id (BIGINT, FK a notebook_entries)
- file_url (VARCHAR 500 - URL de Supabase Storage)
- file_type (VARCHAR 50 - image, video, audio, document)
- file_name (VARCHAR 255)
- file_size (INTEGER - en bytes)
- storage_path (VARCHAR 500 - ruta interna)
- created_at (TIMESTAMPTZ)
```

---

## 🔒 Seguridad (RLS - Row Level Security)

✅ **TODAS las tablas tienen RLS habilitado:**
- Cada usuario SOLO puede ver sus propios datos
- Los datos están completamente aislados por usuario
- Las políticas se aplican automáticamente en todas las operaciones

---

## 🚀 Próximos Pasos

Después de crear las tablas:

1. **Actualiza tu controlador de backend** (`app/controllers/cuaderno.controller.js`):
   ```javascript
   // Usa estas tablas para guardar/recuperar datos
   const { data } = await supabase
       .from('notebook_entries')
       .insert({ notebook_id, content, title });
   ```

2. **Actualiza tu controlador de materias** para crear cuadernos automáticamente:
   ```javascript
   // El trigger lo hace automáticamente, pero puedes verificar:
   const notebook = await supabase
       .from('notebooks')
       .select('*')
       .eq('subject_id', subjectId)
       .single();
   ```

3. **Usa las funciones de búsqueda y estadísticas** que crearon los triggers

---

## 🆘 Troubleshooting

### Problema: "Error: relation already exists"
**Solución:** Las tablas ya existen. Ejecuta la consulta de verificación para confirmar.

### Problema: "Error: permission denied"
**Solución:** Asegúrate de estar usando una cuenta con permisos de OWNER o ADMIN en Supabase.

### Problema: No veo las nuevas tablas
**Solución:** Recarga la página de Supabase (F5)

### Problema: Los datos de RLS no son accesibles
**Solución:** Asegúrate de que el usuario está autenticado con `supabase.auth.getUser()` antes de hacer consultas.

---

## 📝 Resumen Ejecutivo

| Script | Qué hace | Obligatorio |
|--------|----------|-----------|
| `SUPABASE_CUADERNO_NUEVAS_TABLAS.sql` | Crea las 4 tablas | ✅ SÍ |
| `SUPABASE_CUADERNO_TRIGGERS_Y_FUNCIONES.sql` | Crea triggers y funciones | ⭐ Recomendado |

---

## 💾 Archivo Generado: `SUPABASE_CUADERNO_NUEVAS_TABLAS.sql`

**Ubicación:** 
```
c:\Users\AADARIBUS\OneDrive\Desktop\Mi mochila\SUPABASE_CUADERNO_NUEVAS_TABLAS.sql
```

**Contiene:**
- ✅ 4 tablas con sus columnas
- ✅ Índices para optimizar búsquedas
- ✅ RLS (Row Level Security) configurado
- ✅ Foreign Keys con ON DELETE CASCADE
- ✅ Comentarios explicativos

---

**¡Listo! Ahora ejecuta el script en Supabase SQL Editor.** 🚀

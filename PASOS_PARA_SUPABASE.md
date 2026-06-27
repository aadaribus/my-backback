# 🔧 PASOS PARA CONFIGURAR SUPABASE CORRECTAMENTE

## El Problema
El backend intenta escribir en las tablas `subjects`, `notebooks`, `notebook_entries`, pero Supabase dice "Error al crear la materia" porque:
1. Las tablas no existen
2. Las políticas de seguridad (RLS) no permiten el acceso
3. Los permisos no están configurados

## La Solución

### PASO 1: Abre Supabase
Ve a: https://app.supabase.com/

### PASO 2: Entra en tu proyecto
Selecciona tu proyecto (ttakczikswzfpiguwjlf)

### PASO 3: Abre el SQL Editor
- Haz clic en **SQL Editor** en el menú izquierdo
- Haz clic en **+ New Query**

### PASO 4: Copia el SQL COMPLETO
Abre el archivo: **SUPABASE_CUADERNO_DIGITAL.sql**
Cópialo TODO el contenido

### PASO 5: Pega en Supabase
- Pega TODO el código en el editor SQL de Supabase
- Haz clic en **RUN** (o presiona Ctrl+Enter)

### PASO 6: Espera a que termine
- Deberías ver mensajes como: "Query executed" sin errores
- Si hay errores, **guarda la captura de pantalla y envíame**

### PASO 7: Verifica las tablas
En el menú izquierdo de Supabase, ve a **Table Editor** y deberías ver:
- ✅ `subjects` 
- ✅ `notebooks`
- ✅ `notebook_entries`
- ✅ `notebook_media`

### PASO 8: Verifica las políticas RLS
Haz clic en cada tabla → **Auth** → Deberías ver políticas como:
- `subjects_select`
- `subjects_insert`
- `subjects_update`
- `subjects_delete`

Si todo está ✅, recarga la app y prueba a crear una materia.

---

## 🚨 SI SALE UN ERROR EN EL SQL

### Errores comunes:

**Error: "relation ... already exists"**
- Significa que la tabla ya existe
- Solución: Abre Supabase → Table Editor → Elimina la tabla antigua
- Luego vuelve a ejecutar el SQL

**Error: "Cannot reference table ... which does not exist"**
- Significa que una tabla está referenciando otra que no existe
- Solución: Asegúrate de que `auth.users` existe (siempre debería existir)
- Si aún hay error, ejecuta primero este comando:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

**Error: "Policy ... already exists"**
- Las políticas ya están creadas
- Solución: No es un error crítico, la app debería funcionar igual

---

## ✅ DESPUÉS DE EJECUTAR EL SQL

1. Recarga la app: http://localhost:3000 (o tu URL Render)
2. Inicia sesión
3. Ve a **Mis Materias**
4. Haz clic en **+ Agregar materia**
5. Llena los datos y haz clic en **Guardar**

Si sale otro error "Error al clear la materia", **toma una captura y envíame** para revisar los logs.

---

## 🔗 VERIFICACIÓN RÁPIDA

Después de ejecutar el SQL, abre la consola del navegador (F12) y pega esto en la consola:

```javascript
fetch('/api/materias', { credentials: 'include' })
  .then(r => r.json())
  .then(d => console.log(d))
```

Debería mostrar:
```json
{
  "success": true,
  "subjects": [],
  "count": 0
}
```

Si dice "error", comparte la respuesta completa en chat.

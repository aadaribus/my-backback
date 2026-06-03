# 📋 GUÍA DE IMPLEMENTACIÓN - NUEVAS TABLAS Y FUNCIONALIDADES

**Fecha:** 3 de junio de 2026  
**Versión:** 2.0 - ACTUALIZADO CON NUEVOS PARÁMETROS

---

## 🎯 RESUMEN DE CAMBIOS

Se han realizado cambios completos en la estructura del proyecto usando los parámetros personalizados que especificaste:

### Tablas de Base de Datos
- ✅ `profiledate` - Perfil del usuario con campos personalizados
- ✅ `materialuser` - Materias con campos personalizados
- ✅ `bookdigital` - Cuaderno digital con multimedia
- ✅ `bookhistory` - Historial sin opción de editar
- ✅ `gruppro` - Grupos de estudio
- ✅ `tareapro` - Tareas con fecha y imagen

### Controladores Backend
- ✅ `profiledate.controller.js` - Gestión de perfil
- ✅ `materialuser.controller.js` - Gestión de materias
- ✅ `bookdigital.controller.js` - Cuaderno digital
- ✅ `gruppro.controller.js` - Grupos
- ✅ `tareapro.controller.js` - Tareas

### Frontend
- ✅ `home-new.js` - JavaScript actualizado con cámara/micrófono
- ✅ `home-new.html` - HTML con nuevos modales

---

## 🚀 PASOS DE IMPLEMENTACIÓN

### PASO 1: Actualizar Base de Datos Supabase

**1.1 Ir a Supabase**
```
https://app.supabase.com/project/YOUR_PROJECT_ID/sql/new
```

**1.2 Ejecutar SQL**
- Abre el archivo: `SUPABASE_NUEVAS_TABLAS.sql`
- Copia TODO el contenido
- Pégalo en el SQL Editor de Supabase
- Haz click en "Run"

**Esperado:** Mensaje "Ejecutado exitosamente" o similar

**Nota:** Si Supabase indica conflictos con políticas RLS existentes, borra las políticas antiguas primero:
```sql
DROP POLICY IF EXISTS subjects_select ON subjects;
DROP POLICY IF EXISTS subjects_insert ON subjects;
-- Continúa con los demás...
```

**1.3 Verificar tablas creadas**
```sql
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiledate', 'materialuser', 'bookdigital', 'bookhistory', 'gruppro', 'tareapro');
```

---

### PASO 2: Actualizar Backend Node.js

**2.1 Reemplazar archivos de controladores**
```
✅ Elimina o reemplaza:
   - app/controllers/profile.controller.js
   - app/controllers/subjects.controller.js
   - app/controllers/cuaderno.controller.js

✅ Nuevos controladores creados:
   - app/controllers/profiledate.controller.js
   - app/controllers/materialuser.controller.js
   - app/controllers/bookdigital.controller.js
   - app/controllers/gruppro.controller.js
   - app/controllers/tareapro.controller.js
```

**2.2 Actualizar app/index.js**
- El archivo ya ha sido actualizado con:
  - ✅ Nuevos imports
  - ✅ Nuevas rutas (50+ endpoints)
  - ✅ Inicialización de controladores

**2.3 Instalar dependencias (si no están instaladas)**
```bash
npm install
npm install isomorphic-dompurify
npm install express-fileupload  # Opcional para subida de archivos
```

---

### PASO 3: Actualizar Frontend

**3.1 Reemplazar archivos**
```
✅ Reemplazar:
   - app/page/home/home.html → home-old.html (backup)
   - app/public/home.js → home-old.js (backup)

✅ Copiar nuevos:
   - app/page/home/home-new.html → app/page/home/home.html
   - app/public/home-new.js → app/public/home.js
```

**3.2 O renombrar en index.js**
```javascript
// En index.js, cambiar:
// De:
app.get("/home", authorization.soloLogueado, (req, res) =>
  res.sendFile(__dirname + "/page/home/home.html")
);

// A:
app.get("/home", authorization.soloLogueado, (req, res) =>
  res.sendFile(__dirname + "/page/home/home-new.html")
);
```

---

## 📊 MAPEADO DE PARÁMETROS

### PROFILEDATE (Perfil del Usuario)
```
namecomplet    → Nombre completo del usuario
usermail       → Email del usuario
userfone       → Teléfono del usuario
useruni        → Universidad/Instituto
```

### MATERIALUSER (Materias)
```
admaterial        → Nombre de la materia
nameprof          → Nombre del profesor
horauser          → Horario de la clase
descriptionmateria → Descripción
```

### BOOKDIGITAL (Cuaderno Digital)
```
texmaterial    → Contenido de texto (HTML)
imagmaterial   → Array de URLs de imágenes
vozmaterial    → Array de URLs de audio
moviematerial  → Array de URLs de video
```

### BOOKHISTORY (Historial)
- Mismo esquema que BOOKDIGITAL
- Se llena automáticamente desde trigger
- NO se puede editar, solo ver

### GRUPPRO (Grupos)
```
grupname       → Nombre del grupo
grupdecription → Descripción del grupo
grupmail       → Email para invitar miembro
```

### TAREAPRO (Tareas)
```
tareaname        → Título de la tarea
tareadescription → Descripción completa
datetarea        → Fecha de entrega
imagentarea      → Imagen capturada de cámara
```

---

## 🎥 NUEVAS FUNCIONALIDADES

### 📷 Captura de Cámara
```javascript
// Solicita permisos al usuario
// Abre preview en vivo
// Captura foto con click
// Se guarda como base64
```

**Cómo funciona:**
1. Usuario hace click en "📷 Cámara"
2. Solicita permiso: "¿Permitir acceso a cámara?"
3. Preview se muestra
4. Click en "Capturar Foto"
5. Se inserta en el editor
6. La cámara se apaga

### 🎤 Grabación de Audio
```javascript
// Solicita permisos al micrófono
// Muestra indicador "Grabando..."
// Se guarda como blob WebM
```

**Cómo funciona:**
1. Usuario hace click en "🎤 Micrófono"
2. Solicita permiso: "¿Permitir acceso al micrófono?"
3. Inicia grabación (indicador rojo parpadeante)
4. Se detiene automáticamente al guardar
5. Se inserta en el editor

### 📝 Guardar en Historial
```javascript
// Los datos se guardan en bookdigital
// Se copia automáticamente a bookhistory (trigger)
// Se limpian todos los campos
// Se muestra mensaje de confirmación
```

### 👁️ Ver Historial
```javascript
// GET /api/bookhistory
// Solo muestra entradas del usuario actual
// Se puede ver contenido (click para expandir)
// NO se puede editar (solo lectura)
// Muestra en blanco si no hay datos
```

---

## ⚙️ PERMISOS DE CÁMARA Y MICRÓFONO

### Navegadores compatibles
- ✅ Chrome/Chromium 44+
- ✅ Firefox 25+
- ✅ Safari 11+ (solo HTTPS)
- ✅ Edge 79+

### HTTPS requerido
> En producción (Render), siempre usa HTTPS  
> En localhost (desarrollo), funciona sin HTTPS

### Solicitar permisos
```javascript
navigator.mediaDevices.getUserMedia({
  video: { facingMode: 'user' },  // Cámara frontal
  audio: false
})

navigator.mediaDevices.getUserMedia({
  audio: true,
  video: false
})
```

### Revocar permisos (usuario puede hacer en navegador)
- Chrome: ⚙️ → Privacidad → Cámara/Micrófono → Gestionar
- Firefox: Preferencias → Privacidad → Permisos

---

## 📋 CHECKLIST DE VERIFICACIÓN

### Base de Datos
- [ ] Archivo SQL ejecutado sin errores
- [ ] 6 tablas nuevas creadas
- [ ] RLS habilitado
- [ ] Vistas creadas (bookdigital_with_materials, bookhistory_with_materials)
- [ ] Trigger para historial creado

### Backend
- [ ] Archivos de controladores copiados
- [ ] app/index.js actualizado con nuevas rutas
- [ ] npm install completado
- [ ] Sin errores de sintaxis

### Frontend
- [ ] home-new.html en app/page/home/
- [ ] home-new.js en app/public/
- [ ] Cambio en index.js (si aplica)

### Testing
- [ ] npm start sin errores
- [ ] Servidor en puerto 10000
- [ ] Conexión a Supabase exitosa
- [ ] Rutas inicializadas correctamente

---

## 🧪 TESTING DE NUEVAS FUNCIONALIDADES

### Test 1: Perfil
```bash
# Abrir navegador
http://localhost:10000/home

# 1. Click en "Perfil"
# 2. Llenar campos (nombre, email, etc.)
# 3. Click "Guardar Cambios"
# ✅ Esperado: Mensaje de éxito

# 4. Recargar página
# 5. Click en "Perfil" de nuevo
# ✅ Esperado: Campos pre-llenados con datos guardados
```

### Test 2: Materia
```bash
# 1. Click en "Agregar Materia"
# 2. Llenar formulario:
#    - Nombre: "Matemáticas"
#    - Profesor: "Dr. García"
#    - Horario: "Lunes 9am"
#    - Descripción: "Cálculo"
# 3. Click "Guardar"
# ✅ Esperado: Mensaje de éxito
```

### Test 3: Cuaderno Digital
```bash
# 1. Click en icono "Cuaderno" (esquina)
# 2. Seleccionar materia del dropdown
# 3. Escribir en el editor
# 4. Click "Negrita" - texto se pone bold
# 5. Click "📷 Cámara"
# 6. Permitir acceso a cámara
# ✅ Esperado: Preview se muestra
# 7. Click "Capturar Foto"
# ✅ Esperado: Imagen aparece en editor
# 8. Click "Guardar en Historial"
# ✅ Esperado: Campos se limpian, mensaje de éxito
```

### Test 4: Historial
```bash
# 1. Click en "Historial"
# 2. Debe mostrar entradas guardadas
# 3. Click en una entrada
# ✅ Esperado: Se muestra contenido en alert
# 4. Salir y agregar otro usuario
# 5. El usuario B No debe ver datos del usuario A
```

### Test 5: Grupos
```bash
# 1. Click en "Grupos"
# 2. Llenar formulario
# 3. Click "Crear Grupo"
# ✅ Esperado: Grupo creado, campos limpios
```

### Test 6: Tareas
```bash
# 1. Click en "Tareas"
# 2. Llenar formulario
# 3. Click "Crear Tarea"
# ✅ Esperado: Tarea creada, campos limpios
```

---

## 🐛 TROUBLESHOOTING

### "Tablas no existen"
**Solución:** Ejecutar SQL nuevamente:
```bash
# En Supabase SQL Editor
SELECT * FROM profiledate;
# Si falla, ejecutar SUPABASE_NUEVAS_TABLAS.sql completo
```

### "Error 401 No autenticado"
**Solución:** 
- JWT ha expirado → Hacer login de nuevo
- Cookie no se guarda → Verificar navegador permite cookies

### "Cámara no funciona"
**Solución:**
- Verificar que estés en HTTPS (o localhost)
- Verificar que el navegador tiene acceso
- Chrome: ⚙️ → Privacidad → Cámara → Permitir
- Recargar página

### "Micrófono no grabó"
**Solución:**
- Verificar que el micrófono está conectado
- Probar en otra aplicación
- Reiniciar navegador

---

## 📚 DOCUMENTACIÓN ADICIONAL

- [API Endpoints](API_ENDPOINTS_EXAMPLES.md)
- [Especificación Técnica](CUADERNO_DIGITAL_TECHNICAL_SPEC.md)
- [Guía de Implementación Original](IMPLEMENTATION_GUIDE_CUADERNO.md)

---

## ✅ CONCLUSIÓN

Todos los cambios están listos. Solo necesitas:
1. ✅ Ejecutar SQL en Supabase
2. ✅ Copiar archivos JavaScript
3. ✅ Reemplazar archivos HTML
4. ✅ Iniciar `npm start`
5. ✅ Probar en navegador

**¡Listo! Tu proyecto está actualizado con todas las nuevas funcionalidades.** 🎉

---

**Revisor:** GitHub Copilot  
**Fecha:** 3 de junio de 2026  
**Versión:** 2.0 FINAL

# 📋 CONFIGURACIÓN FUNCIONAL - Paso a Paso

**Versión:** 2.0  
**Fecha:** 3 de junio de 2026

---

## 🎯 Objetivo

Configurar completamente la carpeta `app/config/` para que la aplicación funcione correctamente con Supabase.

---

## ✅ CHECKLIST DE CONFIGURACIÓN

### PASO 1: Preparar Archivo .env

- [ ] Crear archivo `.env` en la **raíz del proyecto**

```bash
# En terminal, desde la carpeta raíz
touch .env
```

- [ ] Agregar contenido al `.env`

```env
# Supabase Configuration
SUPABASE_URL=https://ttakczikswzfpiguwjlf.supabase.co
SUPABASE_ANON_KEY=aqui_va_tu_clave_anonima

# Server Configuration
PORT=10000
NODE_ENV=development
```

**¿Cómo obtener las claves?**
1. Ve a https://app.supabase.com
2. Abre tu proyecto (ttakczikswzfpiguwjlf)
3. Ve a Settings → API
4. Copia:
   - Project URL → SUPABASE_URL
   - anon (public) → SUPABASE_ANON_KEY

---

### PASO 2: Crear Tablas en Supabase

- [ ] Abrir Supabase SQL Editor
- [ ] Ejecutar script `SUPABASE_NUEVAS_TABLAS.sql`

```bash
# En Supabase:
1. Abre: https://app.supabase.com
2. Tu proyecto → SQL Editor
3. Click: "New query"
4. Copia TODO el contenido de: SUPABASE_NUEVAS_TABLAS.sql
5. Pega en el editor
6. Click: "RUN"
7. Espera el mensaje: "Query successful" o similar
```

**Verifica que las 6 tablas fueron creadas:**
```
✅ profiledate
✅ materialuser
✅ bookdigital
✅ bookhistory
✅ gruppro
✅ tareapro
```

---

### PASO 3: Revisar Archivos de Configuración

- [ ] `app/config/supabase.js` - ✅ Está listo

Este archivo:
- Carga el `.env`
- Valida las variables
- Crea el cliente de Supabase
- Se exporta para usar en toda la app

```javascript
// No necesita cambios, solo revisar que existe
import { createClient } from '@supabase/supabase-js';
// ...
export { supabase };
```

- [ ] `app/config/init-config.js` - ✅ Está listo

Este archivo:
- Verifica que todo está configurado
- Valida tablas
- Muestra documentación

```javascript
// No necesita cambios, solo revisar que existe
import { inicializarApp } from './init-config.js';
```

- [ ] `app/config/supabase-examples-v2.js` - ✅ Está listo

Contiene ejemplos para todas las tablas:
- Perfil
- Materias
- Cuaderno
- Historial
- Grupos
- Tareas

---

### PASO 4: Instalar Dependencias

- [ ] Ejecutar `npm install`

```bash
npm install
```

Esto instalará:
- @supabase/supabase-js
- express
- cors
- cookie-parser
- y otras dependencias

---

### PASO 5: Iniciar el Servidor

- [ ] Ejecutar `npm start`

```bash
npm start
```

**Esperado:**
```
✅ CONEXIÓN A SUPABASE: EXITOSA
✅ Servidor en puerto 10000
```

---

### PASO 6: Probar la Configuración

- [ ] Abrir navegador: http://localhost:10000

```
http://localhost:10000
```

**Deberías ver:**
- Página de login
- Campo de usuario
- Campo de contraseña
- Botón "Acceder"

- [ ] Hacer login

```
Usuario: (tu usuario de prueba)
Contraseña: (tu contraseña)
```

- [ ] Ir a "Sobre nosotros"

Deberías ver la guía de uso completa con:
- Cómo completar perfil
- Cómo agregar materias
- Cómo usar el cuaderno
- Cómo capturar fotos
- Cómo grabar audio
- Cómo ver historial
- Y más...

---

## 🔍 VERIFICAR QUE TODO FUNCIONA

### Test 1: Perfil
```
1. Click: Perfil
2. Llenar: Nombre, Email, Teléfono, Universidad
3. Click: Guardar
✅ Esperado: Mensaje de éxito
```

### Test 2: Materia
```
1. Click: Agregar Materia
2. Llenar: Nombre, Profesor, Horario, Descripción
3. Click: Guardar
✅ Esperado: Mensaje de éxito
```

### Test 3: Cuaderno + Cámara
```
1. Click: Icono Cuaderno
2. Seleccionar: Materia
3. Escribir: Algo
4. Click: 📷 Cámara
5. Permitir acceso
6. Click: Capturar
7. Click: Guardar en Historial
✅ Esperado: Foto en editor, luego guardado
```

### Test 4: Historial
```
1. Click: Historial
2. Ver: Nota guardada
3. Click: En nota
✅ Esperado: Ver contenido en popup
```

---

## 🎓 ESTRUCTURA DE CARPETA CONFIG

```
app/config/
├── supabase.js
│   └── Cliente de Supabase
│       - Carga .env
│       - Valida variables
│       - Exporta cliente
│
├── init-config.js
│   └── Inicialización
│       - Verifica variables
│       - Verifica tablas
│       - Verifica autenticación
│       - Muestra documentación
│
├── supabase-examples-v2.js
│   └── Ejemplos de uso
│       - Ejemplo crear perfil
│       - Ejemplo crear materia
│       - Ejemplo guardar nota
│       - Ejemplo obtener historial
│       - Y más...
│
└── README.md
    └── Documentación de config
```

---

## 🔐 Verificar Seguridad

**Las tablas tienen RLS (Row Level Security) habilitado:**

```sql
-- Cada tabla tiene políticas que verifican:
ALTER TABLE profiledate ENABLE ROW LEVEL SECURITY;
ALTER TABLE materialuser ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookdigital ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookhistory ENABLE ROW LEVEL SECURITY;
ALTER TABLE gruppro ENABLE ROW LEVEL SECURITY;
ALTER TABLE tareapro ENABLE ROW LEVEL SECURITY;
```

Esto significa:
- ✅ Usuario A solo ve sus datos
- ✅ Usuario B solo ve sus datos
- ✅ Imposible cruzar datos
- ✅ Seguridad garantizada

---

## 🐛 Solución de Problemas Comunes

### Problema: "Error: SUPABASE_URL not found"

**Causa:** El archivo `.env` no tiene SUPABASE_URL

**Solución:**
```bash
# 1. Abre .env
# 2. Agrega:
SUPABASE_URL=https://ttakczikswzfpiguwjlf.supabase.co

# 3. Guarda el archivo
# 4. Reinicia: npm start
```

---

### Problema: "Error: SUPABASE_ANON_KEY not found"

**Causa:** El archivo `.env` no tiene SUPABASE_ANON_KEY

**Solución:**
```bash
# 1. Abre .env
# 2. Agrega:
SUPABASE_ANON_KEY=eyJxxx...

# 3. Guarda el archivo
# 4. Reinicia: npm start
```

---

### Problema: "Error: relation profiledate does not exist"

**Causa:** Las tablas no fueron creadas en Supabase

**Solución:**
```bash
# 1. Abre Supabase SQL Editor
# 2. Copia SUPABASE_NUEVAS_TABLAS.sql
# 3. Pega en editor
# 4. Click RUN
# 5. Reinicia: npm start
```

---

### Problema: "Cannot read property 'from' of undefined"

**Causa:** El cliente de Supabase no se inicializó correctamente

**Solución:**
```bash
# 1. Verifica que .env existe
# 2. Verifica que tiene SUPABASE_URL
# 3. Verifica que tiene SUPABASE_ANON_KEY
# 4. Borra node_modules: rm -r node_modules
# 5. Reinstala: npm install
# 6. Reinicia: npm start
```

---

## 📊 Variables de Ambiente en Producción (Render)

Si vas a desplegar en Render:

1. Ve al panel de Render
2. Tu Web Service → Settings
3. Environment
4. Agrega:

```
SUPABASE_URL=https://ttakczikswzfpiguwjlf.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
PORT=10000
NODE_ENV=production
```

**NO** crees un archivo `.env` en Render, usa Environment variables.

---

## 📚 Documentación Relacionada

- **Guía de Implementación:** `GUIA_IMPLEMENTACION_NUEVAS_TABLAS.md`
- **Referencia API:** `ENDPOINTS_API_v2.md`
- **Ejemplos de Código:** `app/config/supabase-examples-v2.js`
- **Guía de Uso:** `app/page/about.html`

---

## ✅ Estado Final

Después de completar todos estos pasos:

```
✅ .env configurado
✅ Supabase conectado
✅ Tablas creadas
✅ RLS habilitado
✅ npm start funciona
✅ http://localhost:10000 accesible
✅ Login funciona
✅ Perfil funciona
✅ Materias funcionan
✅ Cuaderno funciona
✅ Cámara funciona
✅ Micrófono funciona
✅ Historial funciona
✅ Grupos funcionan
✅ Tareas funcionan
🎉 TODO LISTO PARA USAR
```

---

## 🚀 Próximos Pasos

1. ✅ Configuración completada
2. ⏳ Hacer cambios en la app (opcional)
3. ⏳ Desplegar a Render (opcional)
4. ⏳ Compartir con usuarios (opcional)

---

**Versión:** 2.0  
**Fecha:** 3 de junio de 2026  
**Estado:** ✅ COMPLETADO

**¿Preguntas?** Consulta `app/config/README.md`

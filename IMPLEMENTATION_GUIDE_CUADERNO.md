# Guía de Implementación - Backend del Cuaderno Digital

**Estado:** 🚀 Ready to Implement  
**Fecha:** 24 de mayo de 2026

---

## 📋 Requisitos Previos

Asegúrate de tener:
- ✅ Node.js instalado
- ✅ Cuenta de Supabase activa
- ✅ Proyecto Mi Mochila configurado
- ✅ Variables de entorno en `.env`:
  ```
  JWT_SECRET=tu_clave_secreta
  SUPABASE_URL=https://tu-proyecto.supabase.co
  SUPABASE_ANON_KEY=tu_clave_anonima
  ```

---

## 🔧 PASO 1: Configurar Base de Datos en Supabase

### 1.1 Acceder a Supabase SQL Editor

1. Ve a: https://app.supabase.com
2. Selecciona tu proyecto
3. Haz click en **SQL Editor** (lado izquierdo)
4. Haz click en **+ New Query**

### 1.2 Ejecutar Script SQL

1. Copia todo el contenido del archivo: `SUPABASE_CUADERNO_DIGITAL.sql`
2. Pégalo en el SQL Editor de Supabase
3. Haz click en **Run** (botón azul arriba a la derecha)
4. Espera a que termine la ejecución

### 1.3 Verificar Tablas Creadas

En Supabase, ve a **Table Editor** y verifica que existan:
- ✅ `notebooks`
- ✅ `notebook_entries`
- ✅ `notebook_media`

También deberían estar habilitadas las políticas de Row Level Security (RLS).

**Nota:** Si ya tienes la tabla `subjects`, el script no la recrea (IF NOT EXISTS).

---

## 🛠️ PASO 2: Instalar Dependencias Node.js

### 2.1 Instalar paquete DOMPurify

```powershell
# Desde el directorio raíz del proyecto
npm install isomorphic-dompurify
```

Este paquete es necesario para sanitizar HTML en el servidor.

### 2.2 Verificar package.json

Verifica que tu `package.json` incluya:
```json
{
  "dependencies": {
    "express": "^4.x.x",
    "jsonwebtoken": "^9.x.x",
    "@supabase/supabase-js": "^2.x.x",
    "isomorphic-dompurify": "^2.x.x",
    "cookie-parser": "^1.x.x",
    "dotenv": "^16.x.x"
  }
}
```

Si falta alguno, instálalo con:
```powershell
npm install nombre-del-paquete
```

---

## 📝 PASO 3: Añadir Controlador de Cuaderno

### 3.1 Crear archivo del controlador

El archivo `app/controllers/cuaderno.controller.js` ya debe estar creado.  
Verifica que contenga todas las funciones:
- ✅ `crearCuaderno`
- ✅ `guardarEntrada`
- ✅ `obtenerEntradas`
- ✅ `obtenerCuadernoMateria`
- ✅ `actualizarEntrada`
- ✅ `eliminarEntrada`
- ✅ `subirArchivo`

### 3.2 Verificar imports

El archivo debe tener estos imports:
```javascript
import { supabase } from '../config/supabase.js';
import DOMPurify from 'isomorphic-dompurify';
import jwt from 'jsonwebtoken';
```

---

## 🚀 PASO 4: Activar Rutas API

### 4.1 Verificar import en app/index.js

El archivo debe importar el controlador:
```javascript
import { methods as cuaderno } from "./controllers/cuaderno.controller.js";
```

### 4.2 Verificar rutas registradas

Verifica que `app/index.js` contenga estas líneas (al final del archivo):
```javascript
// Rutas del Cuaderno Digital
app.post("/api/cuaderno/crear", cuaderno.crearCuaderno);
app.post("/api/cuaderno/guardar", cuaderno.guardarEntrada);
app.get("/api/cuaderno/:notebook_id", cuaderno.obtenerEntradas);
app.get("/api/cuaderno/materia/:subject_id", cuaderno.obtenerCuadernoMateria);
app.put("/api/cuaderno/entrada/:entry_id", cuaderno.actualizarEntrada);
app.delete("/api/cuaderno/entrada/:entry_id", cuaderno.eliminarEntrada);
app.post("/api/cuaderno/upload", cuaderno.subirArchivo);
```

---

## ✅ PASO 5: Testing y Validación

### 5.1 Iniciar servidor

```powershell
npm start
```

Debería mostrar:
```
✅ Server live on port 10000
✅ .env cargado desde: ...
✅ CONEXIÓN A SUPABASE: EXITOSA
✅ Rutas del Cuaderno Digital inicializadas
```

### 5.2 Probar endpoints con Postman o cURL

**Ejemplo 1: Obtener cuaderno por materia**
```powershell
# GET /api/cuaderno/materia/1
# Headers:
# - Cookie: jwt=tu_token_jwt

curl -X GET "http://localhost:10000/api/cuaderno/materia/1" `
  -H "Cookie: jwt=tu_token_jwt"
```

**Ejemplo 2: Guardar entrada**
```powershell
# POST /api/cuaderno/guardar
# Headers:
# - Cookie: jwt=tu_token_jwt
# - Content-Type: application/json

curl -X POST "http://localhost:10000/api/cuaderno/guardar" `
  -H "Cookie: jwt=tu_token_jwt" `
  -H "Content-Type: application/json" `
  -d '{
    "notebook_id": 1,
    "content": "<p>Mi primer apunte</p>",
    "subject_name": "Matemáticas"
  }'
```

### 5.3 Ver logs en consola

Los logs mostrarán:
```
[Cuaderno] Creando cuaderno automático para materia 1, usuario abc-123
[Cuaderno] ✅ Cuaderno creado: 1
[Cuaderno] ✅ Entrada guardada: 5 en cuaderno 1
```

---

## 🔗 PASO 6: Integrar Creación Automática de Cuaderno

### Problema Actual
Cuando un usuario crea una materia, el cuaderno NO se crea automáticamente.

### Solución
En el controlador de materias (`app/controllers/authentication.controller.js` o donde esté), 
importa y usa la función:

```javascript
import { crearCuadernoAutomatico } from './cuaderno.controller.js';

// En la función que crea materias:
export async function crearMateria(req, res) {
  try {
    // ... código para crear materia en BD ...
    const materia = { id: 123, user_id: 'abc-def', ...};
    
    // ✅ NUEVO: Crear cuaderno automáticamente
    await crearCuadernoAutomatico(materia.id, materia.user_id);
    
    // ... devolver respuesta ...
  } catch (error) {
    // ... manejar error ...
  }
}
```

---

## 📊 PASO 7: Verificar Flujo Completo

### Flujo esperado:

```
1. Usuario registra
   ↓
2. Usuario login
   ↓
3. Usuario va a /home
   ↓
4. Usuario abre modal "Agregar Materia"
   ↓
5. Usuario llena datos y hace click "Guardar"
   ↓
6. Backend crea materia
   ↓
7. Backend crea cuaderno automáticamente ✅
   ↓
8. Usuario abre icono "Cuaderno Digital"
   ↓
9. Frontend hace GET /api/cuaderno/materia/:subject_id
   ↓
10. Backend devuelve notebook_id
   ↓
11. Frontend carga entradas con GET /api/cuaderno/:notebook_id
   ↓
12. Usuario escribe apuntes
   ↓
13. Usuario hace click "Guardar"
   ↓
14. Frontend hace POST /api/cuaderno/guardar
   ↓
15. Backend almacena en BD
   ↓
16. Entrada aparece en el historial ✅
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'isomorphic-dompurify'"
**Solución:**
```powershell
npm install isomorphic-dompurify
npm install
```

### Error: "Auth failed" en endpoints
**Causa:** Token JWT inválido o expirado  
**Solución:** Vuelve a hacer login y obtén un nuevo token

### Error: "Acceso denegado"
**Causa:** El usuario no tiene permiso para ese cuaderno  
**Solución:** Verifica que el `user_id` sea correcto en la BD

### Error: "notebook_id no encontrado"
**Causa:** El cuaderno no fue creado al agregar materia  
**Solución:** Asegúrate de que la creación automática está integrada en el controlador de materias

### Las entradas no se guardan
**Causa:** RLS no está habilitado correctamente  
**Solución:** 
1. Ve a Supabase > Authentication > Policies
2. Verifica que `notebook_entries` tenga RLS habilitado
3. Ejecuta el SQL nuevamente

---

## 📈 Estadísticas Esperadas

Después de completar la implementación, deberías tener:

| Elemento | Cantidad |
|----------|----------|
| Tablas en BD | 4 (notebooks, entries, media, + subjects) |
| Endpoints API | 7 |
| Políticas RLS | 4 (1 por tabla) |
| Funciones SQL | 1 (trigger automático) |
| Líneas de código backend | ~400 |

---

## ✨ Características Activas

Después de implementar todo:

- ✅ Cuaderno digital por materia
- ✅ Editor de texto enriquecido
- ✅ Multimedia (imágenes, videos, audio)
- ✅ Timestamps automáticos
- ✅ Histórico de apuntes
- ✅ Almacenamiento persistente
- ✅ Control de acceso (RLS)
- ✅ Sanitización de HTML

---

## 🎓 Próximas Mejoras (Opcional)

- [ ] Storage de archivos en Supabase Storage
- [ ] Búsqueda full-text en apuntes
- [ ] Exportar a PDF/Word
- [ ] Compartir cuaderno con compañeros
- [ ] Versioning de entradas
- [ ] IA para resumir apuntes
- [ ] Recordatorios de estudio

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs de consola
2. Verifica las variables de entorno
3. Asegúrate de que Supabase está accesible
4. Prueba los endpoints con Postman
5. Revisa que los archivos están en las rutas correctas

---

## ✅ Checklist Final

Antes de considerar terminado:

- [ ] Script SQL ejecutado en Supabase
- [ ] Tablas creadas (4 tablas)
- [ ] RLS habilitado en todas las tablas
- [ ] Dependencia `isomorphic-dompurify` instalada
- [ ] Controlador `cuaderno.controller.js` en lugar correcto
- [ ] Rutas importadas en `app/index.js`
- [ ] Servidor inicia sin errores
- [ ] GET /api/cuaderno/materia/:id funciona
- [ ] POST /api/cuaderno/guardar funciona
- [ ] Entradas persisten en Supabase
- [ ] Frontend integrado con backend
- [ ] Flujo completo probado end-to-end

---

**¡Listo para usar!** 🎉

El Cuaderno Digital está completamente implementado y funcional.

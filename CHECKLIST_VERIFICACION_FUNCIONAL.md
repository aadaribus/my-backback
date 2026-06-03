# ✅ CHECKLIST DE VERIFICACIÓN FUNCIONAL

**Proyecto:** Mi Mochila - Cuaderno Digital  
**Objetivo:** Verificar que todo funcione correctamente  
**Tiempo Estimado:** 30-45 minutos  

---

## 🔧 FASE 1: PREPARACIÓN (5 minutos)

### 1.1 Instalar Dependencias
```bash
cd "c:\Users\AADARIBUS\OneDrive\Desktop\Mi mochila"
npm install
```
- [ ] npm install completado sin errores
- [ ] Carpeta node_modules creada
- [ ] package-lock.json actualizado

### 1.2 Verificar Configuración
- [ ] Archivo `.env` existe en la raíz
- [ ] `.env` contiene `SUPABASE_URL`
- [ ] `.env` contiene `SUPABASE_ANON_KEY`
- [ ] `.env` contiene `JWT_SECRET`

---

## 🚀 FASE 2: INICIAR SERVIDOR (2 minutos)

### 2.1 Iniciar
```bash
npm start
```

### 2.2 Verificar Output
- [ ] Mensaje: `✅ Server live on port 10000`
- [ ] Mensaje: `✅ CONEXIÓN A SUPABASE: EXITOSA`
- [ ] Mensaje: `✅ Rutas del Cuaderno Digital inicializadas`
- [ ] Mensaje: `✅ Rutas de Materias inicializadas`
- [ ] Mensaje: `✅ Rutas de Perfil inicializadas`
- [ ] NO hay mensajes de error

### 2.3 Probar Conexión
```bash
# En otra terminal PowerShell:
curl http://localhost:10000/ping-supabase
```
- [ ] Response: `status: "✅ CONEXIÓN EXITOSA"`
- [ ] Status HTTP: 200

---

## 🌐 FASE 3: TESTING EN NAVEGADOR (20 minutos)

### 3.1 Página de Login
```
http://localhost:10000
```
- [ ] Página carga correctamente
- [ ] Título: "Iniciar sesión"
- [ ] Campos: Usuario, Contraseña
- [ ] Botón: "Iniciar sesión"
- [ ] Link: "Registrar"
- [ ] Toggle de contraseña funciona

### 3.2 Página de Registro
```
http://localhost:10000/register
```
- [ ] Página carga
- [ ] Campos: Usuario, Email, Contraseña
- [ ] Validación de email (formato)
- [ ] Link: "Iniciar sesión"

### 3.3 Crear Usuario de Prueba
- [ ] Username: `testuser`
- [ ] Email: `test@example.com`
- [ ] Password: `Test123456`
- [ ] Click "Registrar"
- [ ] Mensaje de éxito o redireccionamiento

### 3.4 Registrarse (Alternativo si no funciona 3.3)
Si el registro falla:
- [ ] Ir a Supabase
- [ ] Crear usuario manualmente en tabla `users`
- [ ] Continuar con login

### 3.5 Login con Usuario
```
http://localhost:10000
```
- [ ] Username: `testuser`
- [ ] Password: `Test123456`
- [ ] Click "Iniciar sesión"
- [ ] Redirige a `/home`
- [ ] Aparece nombre de usuario en esquina superior

### 3.6 Página Home
```
http://localhost:10000/home
```
- [ ] Página carga correctamente
- [ ] Título: "My Mochila"
- [ ] Menú lateral visible
- [ ] Botones funcionan:
  - [ ] "Agregar Materia" abre modal
  - [ ] "Historial" abre modal
  - [ ] "Grupos" abre modal
  - [ ] "Tareas" abre modal
  - [ ] "Perfil" abre modal
  - [ ] "Configuración" abre modal
  - [ ] "Contacto" abre modal

---

## 📚 FASE 4: TESTING DE FUNCIONALIDADES (15 minutos)

### 4.1 Crear Materia
- [ ] Click en "Agregar Materia"
- [ ] Modal se abre
- [ ] Campos aparecen:
  - [ ] Nombre de la materia
  - [ ] Profesor
  - [ ] Horario
  - [ ] Descripción
- [ ] Llenar:
  - Nombre: `Matemáticas`
  - Profesor: `Dr. García`
  - Horario: `Lunes 9am`
  - Descripción: `Cálculo avanzado`
- [ ] Click "Guardar"
- [ ] Modal cierra
- [ ] Mensaje de éxito aparece

### 4.2 Cuaderno Digital
- [ ] Click en botón "Cuaderno Digital" (ícono en esquina)
- [ ] Modal amplio se abre
- [ ] Elementos visibles:
  - [ ] Editor de texto (contenteditable)
  - [ ] Toolbar con opciones
  - [ ] Botones de archivo
  - [ ] Zona de drop
- [ ] Escribir texto en editor
- [ ] Click en Bold → El texto se pone en negrita
- [ ] Click en Italic → El texto se pone en cursiva
- [ ] Click en Underline → El texto se subraya
- [ ] Escribir nueva entrada
- [ ] Click "Guardar"
- [ ] Mensaje de confirmación aparece
- [ ] Entrada aparece en la lista con timestamp

### 4.3 Subir Archivo
- [ ] Subir imagen:
  - [ ] Click botón "Imagen"
  - [ ] Seleccionar archivo `.jpg/.png`
  - [ ] Imagen aparece en el editor
  - [ ] Imagen se muestra con tamaño limitado
- [ ] Subir audio:
  - [ ] Click botón "Audio"
  - [ ] Seleccionar archivo `.mp3`
  - [ ] Controles de audio aparecen
- [ ] Drag & Drop:
  - [ ] Arrastrar imagen al editor
  - [ ] Imagen se inserta automáticamente

### 4.4 Perfil
- [ ] Click en "Perfil" en el menú
- [ ] Modal se abre
- [ ] Campos aparecen:
  - [ ] Nombre completo: (pre-llenado con usuario o vacío)
  - [ ] Correo electrónico
  - [ ] Teléfono
  - [ ] Universidad/Instituto
  - [ ] Carrera
- [ ] Llenar datos:
  - Nombre: `Juan García`
  - Email: `juan@example.com`
  - Teléfono: `+34612345678`
  - Universidad: `Universidad de Madrid`
  - Carrera: `Ingeniería Informática`
- [ ] Click "Guardar" o "Actualizar"
- [ ] Mensaje de éxito aparece
- [ ] Modal cierra

---

## 🔌 FASE 5: TESTING DE API (Opcional, con Postman o curl)

### 5.1 Obtener Token JWT
```bash
# Login para obtener JWT
curl -X POST http://localhost:10000/api/login `
  -H "Content-Type: application/json" `
  -d '{"username":"testuser","password":"Test123456"}' `
  -c cookies.txt
```
- [ ] Response contiene mensaje "Login correcto"
- [ ] Archivo cookies.txt se crea (si usas -c)

### 5.2 Obtener Usuario
```bash
curl -X GET http://localhost:10000/api/usuario `
  -H "Cookie: jwt=YOUR_JWT_TOKEN"
```
- [ ] Response contiene username: "testuser"
- [ ] Response contiene email
- [ ] Status: 200

### 5.3 Crear Materia vía API
```bash
curl -X POST http://localhost:10000/api/materias/crear `
  -H "Content-Type: application/json" `
  -H "Cookie: jwt=YOUR_JWT_TOKEN" `
  -d '{
    "name": "Física",
    "professor": "Dra. López",
    "schedule": "Martes 10am",
    "description": "Mecánica clásica"
  }'
```
- [ ] Response: `success: true`
- [ ] Response contiene `subject_id`
- [ ] Status: 201

### 5.4 Obtener Materias
```bash
curl -X GET http://localhost:10000/api/materias `
  -H "Cookie: jwt=YOUR_JWT_TOKEN"
```
- [ ] Response contiene array de materias
- [ ] Cada materia tiene: id, name, professor, schedule

### 5.5 Guardar Entrada en Cuaderno
```bash
# Primero obtén el notebook_id de la respuesta anterior
curl -X POST http://localhost:10000/api/cuaderno/guardar `
  -H "Content-Type: application/json" `
  -H "Cookie: jwt=YOUR_JWT_TOKEN" `
  -d '{
    "notebook_id": 1,
    "content": "<p>Contenido de prueba del cuaderno</p>",
    "subject_name": "Matemáticas"
  }'
```
- [ ] Response: `success: true`
- [ ] Response contiene `entry_id`
- [ ] Response contiene `timestamp`
- [ ] Status: 201

### 5.6 Obtener Entradas del Cuaderno
```bash
curl -X GET http://localhost:10000/api/cuaderno/1 `
  -H "Cookie: jwt=YOUR_JWT_TOKEN"
```
- [ ] Response: `success: true`
- [ ] Response contiene array de entries
- [ ] Cada entrada tiene: id, content, created_at

### 5.7 Obtener Perfil
```bash
curl -X GET http://localhost:10000/api/perfil `
  -H "Cookie: jwt=YOUR_JWT_TOKEN"
```
- [ ] Response: `success: true`
- [ ] Response contiene profile data
- [ ] Contiene campos: full_name, email, phone, institution, career

### 5.8 Actualizar Perfil
```bash
curl -X PUT http://localhost:10000/api/perfil `
  -H "Content-Type: application/json" `
  -H "Cookie: jwt=YOUR_JWT_TOKEN" `
  -d '{
    "full_name": "Juan García",
    "email": "juan@example.com",
    "phone": "+34612345678",
    "institution": "Universidad de Madrid",
    "career": "Ingeniería Informática"
  }'
```
- [ ] Response: `success: true`
- [ ] Message: "Perfil actualizado exitosamente"
- [ ] Status: 200

### 5.9 Logout
```bash
curl -X POST http://localhost:10000/api/logout `
  -H "Content-Type: application/json"
```
- [ ] Response: `status: "ok"`
- [ ] Cookie JWT se limpia

---

## 🔐 FASE 6: TESTING DE SEGURIDAD (5 minutos)

### 6.1 Sin Token JWT
- [ ] Intentar acceder a `/api/materias` sin JWT
- [ ] [ ] Response: Error 401 "No autenticado" o similar

### 6.2 Token Inválido
- [ ] Intentar acceder con JWT inválido
- [ ] [ ] Response: Error 401

### 6.3 Acceso Cruzado (Si hay 2 usuarios)
- [ ] Usuario A crea materia
- [ ] Usuario B intenta obtener/editar esa materia
- [ ] [ ] Response: Error 403 "Acceso denegado"

### 6.4 Sanitización HTML
- [ ] Crear cuaderno con HTML maligno:
```javascript
content: "<script>alert('XSS')</script><p>Test</p>"
```
- [ ] [ ] Script NO se ejecuta
- [ ] [ ] Se guarda solo el HTML seguro

---

## 📊 RESUMEN DE TESTING

### Marcar como Completado

**Fases Completadas:**
- [ ] Fase 1: Preparación
- [ ] Fase 2: Servidor
- [ ] Fase 3: Browser
- [ ] Fase 4: Funcionalidades
- [ ] Fase 5: API (Opcional)
- [ ] Fase 6: Seguridad

**Resumen:**
- [ ] ✅ **TODOS LOS TESTS PASARON**
- [ ] ⚠️ Algunos tests fallaron (especificar):
  ```
  ___________________________________
  ___________________________________
  ```
- [ ] ❌ Fallos críticos encontrados

---

## 🎯 PRÓXIMOS PASOS SI TODO PASÓ

1. ✅ **Proyecto FUNCIONAL y listo para:**
   - Uso en desarrollo
   - Demostración a stakeholders
   - Deployment a staging

2. ⏳ **Mejoras futuras:**
   - Integrar Supabase Storage
   - Agregar pruebas automáticas
   - Implementar refresh tokens
   - Agregar validaciones adicionales

---

## 📞 TROUBLESHOOTING

### "npm start no inicia"
```bash
# Limpiar dependencias
rm -r node_modules package-lock.json
npm install
npm start
```

### "Error de Supabase"
- [ ] Verificar .env tiene valores correctos
- [ ] Verificar URL de Supabase
- [ ] Verificar que la tabla `users` existe en Supabase

### "Login no funciona"
- [ ] Verificar que el usuario existe en BD
- [ ] Verificar contraseña (case-sensitive)
- [ ] Ver logs del servidor

### "Materia no se guarda"
- [ ] Verificar que estás logueado (JWT válido)
- [ ] Ver logs del servidor para errores
- [ ] Verificar que la tabla `subjects` existe

### "Error 401 No autenticado"
- [ ] La cookie JWT puede haber expirado
- [ ] Hacer login de nuevo
- [ ] Verificar que JWT_SECRET es el mismo

---

**Checklist Creado:** 2 de junio de 2026  
**Versión:** 1.0  
**Estado:** Listo para usar

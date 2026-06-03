# 🔌 ENDPOINTS API - NUEVAS TABLAS

**Versión:** 2.0  
**Fecha:** 3 de junio de 2026

---

## 📋 TABLA DE REFERENCIA RÁPIDA

### 👤 PROFILEDATE (Perfil del Usuario)

| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|-----------|
| GET | `/api/profiledate` | Obtener perfil del usuario | - |
| PUT | `/api/profiledate` | Actualizar perfil | `namecomplet, usermail, userfone, useruni` |

**Ejemplo GET:**
```bash
curl -X GET http://localhost:10000/api/profiledate \
  -H "Cookie: jwt=YOUR_TOKEN"
```

**Ejemplo PUT:**
```bash
curl -X PUT http://localhost:10000/api/profiledate \
  -H "Content-Type: application/json" \
  -H "Cookie: jwt=YOUR_TOKEN" \
  -d '{
    "namecomplet": "Juan García",
    "usermail": "juan@example.com",
    "userfone": "+34612345678",
    "useruni": "Universidad de Madrid"
  }'
```

---

### 📚 MATERIALUSER (Materias)

| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|-----------|
| POST | `/api/materialuser/crear` | Crear materia | `admaterial, nameprof, horauser, descriptionmateria` |
| GET | `/api/materialuser` | Obtener todas las materias | - |
| GET | `/api/materialuser/:id` | Obtener materia específica | `:id` |
| PUT | `/api/materialuser/:id` | Actualizar materia | `:id, admaterial, nameprof, horauser, descriptionmateria` |
| DELETE | `/api/materialuser/:id` | Eliminar materia | `:id` |

**Ejemplo POST:**
```bash
curl -X POST http://localhost:10000/api/materialuser/crear \
  -H "Content-Type: application/json" \
  -H "Cookie: jwt=YOUR_TOKEN" \
  -d '{
    "admaterial": "Matemáticas",
    "nameprof": "Dr. García",
    "horauser": "Lunes 9am",
    "descriptionmateria": "Cálculo avanzado"
  }'
```

**Ejemplo GET (todas):**
```bash
curl -X GET http://localhost:10000/api/materialuser \
  -H "Cookie: jwt=YOUR_TOKEN"
```

---

### 📖 BOOKDIGITAL (Cuaderno Digital)

| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|-----------|
| POST | `/api/bookdigital/guardar` | Guardar entrada | `materialuser_id, texmaterial, imagmaterial, vozmaterial, moviematerial` |
| GET | `/api/bookdigital` | Obtener todas las entradas | - |
| GET | `/api/bookdigital/:materialuser_id` | Obtener entradas por materia | `:materialuser_id` |
| PUT | `/api/bookdigital/:id` | Actualizar entrada | `:id, texmaterial, imagmaterial, vozmaterial, moviematerial` |
| DELETE | `/api/bookdigital/:id` | Eliminar entrada | `:id` |

**Ejemplo POST:**
```bash
curl -X POST http://localhost:10000/api/bookdigital/guardar \
  -H "Content-Type: application/json" \
  -H "Cookie: jwt=YOUR_TOKEN" \
  -d '{
    "materialuser_id": 1,
    "texmaterial": "<p>Mi apunte de clase</p>",
    "imagmaterial": [],
    "vozmaterial": [],
    "moviematerial": []
  }'
```

**Nota:** Las imágenes, audio y video se guardan como Data URLs base64

---

### 📚 BOOKHISTORY (Historial)

| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|-----------|
| GET | `/api/bookhistory` | Obtener historial del usuario | - |

**Características:**
- ✅ Solo lectura (no se puede editar)
- ✅ Se llena automáticamente desde bookdigital
- ✅ Cada usuario ve solo su historial
- ✅ Ordenado por fecha descendente (más reciente primero)

**Ejemplo:**
```bash
curl -X GET http://localhost:10000/api/bookhistory \
  -H "Cookie: jwt=YOUR_TOKEN"
```

---

### 👥 GRUPPRO (Grupos)

| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|-----------|
| POST | `/api/gruppro/crear` | Crear grupo | `grupname, grupdecription, grupmail` |
| GET | `/api/gruppro` | Obtener todos los grupos | - |
| GET | `/api/gruppro/:id` | Obtener grupo específico | `:id` |
| PUT | `/api/gruppro/:id` | Actualizar grupo | `:id, grupname, grupdecription, grupmail` |
| DELETE | `/api/gruppro/:id` | Eliminar grupo | `:id` |

**Ejemplo POST:**
```bash
curl -X POST http://localhost:10000/api/gruppro/crear \
  -H "Content-Type: application/json" \
  -H "Cookie: jwt=YOUR_TOKEN" \
  -d '{
    "grupname": "Grupo de Matemáticas",
    "grupdecription": "Grupo para estudiar juntos",
    "grupmail": "miembro@example.com"
  }'
```

---

### ✅ TAREAPRO (Tareas)

| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|-----------|
| POST | `/api/tareapro/crear` | Crear tarea | `tareaname, tareadescription, datetarea, imagentarea, materialuser_id` |
| GET | `/api/tareapro` | Obtener todas las tareas | - |
| GET | `/api/tareapro/:id` | Obtener tarea específica | `:id` |
| PUT | `/api/tareapro/:id` | Actualizar tarea | `:id, tareaname, tareadescription, datetarea, imagentarea, completed` |
| DELETE | `/api/tareapro/:id` | Eliminar tarea | `:id` |

**Ejemplo POST:**
```bash
curl -X POST http://localhost:10000/api/tareapro/crear \
  -H "Content-Type: application/json" \
  -H "Cookie: jwt=YOUR_TOKEN" \
  -d '{
    "tareaname": "Ejercicio 1",
    "tareadescription": "Resolver problemas de cálculo",
    "datetarea": "2026-06-10",
    "imagentarea": null,
    "materialuser_id": 1
  }'
```

---

## 🔐 AUTENTICACIÓN

### Headers requeridos
```
Cookie: jwt=YOUR_JWT_TOKEN
Content-Type: application/json
```

### Obtener JWT
```bash
# 1. Login
curl -X POST http://localhost:10000/api/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'

# JWT se guarda en cookies.txt
# Luego usarlo con: -b cookies.txt
```

---

## 📊 RESPUESTAS

### Formato éxito (201/200)
```json
{
  "success": true,
  "profiledate_id": 1,
  "profile": { ... },
  "message": "..."
}
```

### Formato error (400/401/403/500)
```json
{
  "error": "Descripción del error",
  "details": "Detalles técnicos (opcional)"
}
```

---

## 🛠️ CÓDIGOS DE ESTADO

| Código | Significado | Solución |
|--------|------------|----------|
| 200 | OK - Éxito | ✅ Funciona |
| 201 | Created - Recurso creado | ✅ Funciona |
| 400 | Bad Request - Datos inválidos | Verificar parámetros |
| 401 | Unauthorized - No autenticado | Hacer login / Renovar JWT |
| 403 | Forbidden - Acceso denegado | Verificar permisos/user_id |
| 404 | Not Found - No existe | Verificar ID del recurso |
| 500 | Server Error - Error del servidor | Ver logs del servidor |

---

## 📝 EJEMPLOS COMPLETOS

### Ejemplo 1: Crear Materia y Entradas
```bash
#!/bin/bash

# Primero login
TOKEN=$(curl -s -X POST http://localhost:10000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"pass"}' \
  -c cookies.txt | grep -o '"jwt":"[^"]*' | cut -d'"' -f4)

# Crear materia
MATERIA=$(curl -s -X POST http://localhost:10000/api/materialuser/crear \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "admaterial": "Física",
    "nameprof": "Dra. López",
    "horauser": "Martes 10am",
    "descriptionmateria": "Mecánica clásica"
  }' | grep -o '"subject_id":[0-9]*' | cut -d':' -f2)

echo "Materia creada: $MATERIA"

# Guardar en cuaderno
curl -X POST http://localhost:10000/api/bookdigital/guardar \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d "{
    \"materialuser_id\": $MATERIA,
    \"texmaterial\": \"<p>Notas de clase hoy</p>\"
  }"
```

### Ejemplo 2: Ver Historial
```bash
curl -X GET http://localhost:10000/api/bookhistory \
  -b cookies.txt \
  -H "Content-Type: application/json" | jq '.'
```

---

## ✨ CARACTERÍSTICAS ESPECIALES

### Auto-creación de Perfil
Si el usuario no tiene perfil, se crea automáticamente al hacer GET

### Historial Automático
Al guardar en `bookdigital`, se copia automáticamente a `bookhistory` (trigger)

### Aislamiento por Usuario
Todos los datos están filtrados por `user_id` - cada usuario ve solo sus datos

### Limpieza Automática
Al guardar desde el frontend, los formularios se limpian automáticamente

---

## 🚀 COMANDOS ÚTILES

```bash
# Ver todas las materias
curl -s http://localhost:10000/api/materialuser -b cookies.txt | jq '.materiales'

# Ver perfil
curl -s http://localhost:10000/api/profiledate -b cookies.txt | jq '.profile'

# Ver todas las tareas
curl -s http://localhost:10000/api/tareapro -b cookies.txt | jq '.tareas'

# Ver historial completo
curl -s http://localhost:10000/api/bookhistory -b cookies.txt | jq '.history'
```

---

**Última actualización:** 3 de junio de 2026  
**API Version:** 2.0

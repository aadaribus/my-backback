# Ejemplos de Uso - Endpoints Cuaderno Digital

**Versión:** 1.0  
**Última actualización:** 24 de mayo de 2026

---

## 📌 Información General

### Base URL
```
http://localhost:10000
```

### Autenticación
Todos los endpoints requieren una cookie JWT válida:
```
Cookie: jwt=tu_token_jwt_aqui
```

### Headers Necesarios
```http
Content-Type: application/json
Cookie: jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📚 ENDPOINT 1: Crear Cuaderno

### POST `/api/cuaderno/crear`

**Descripción:** Crear un cuaderno digital (normalmente es automático al crear materia)

**Request:**
```javascript
fetch('http://localhost:10000/api/cuaderno/crear', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': 'jwt=tu_token'
  },
  body: JSON.stringify({
    subject_id: 1,
    subject_name: "Matemáticas"
  })
})
```

**cURL:**
```bash
curl -X POST "http://localhost:10000/api/cuaderno/crear" \
  -H "Content-Type: application/json" \
  -H "Cookie: jwt=tu_token" \
  -d '{
    "subject_id": 1,
    "subject_name": "Matemáticas"
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "notebook_id": 5,
  "message": "Cuaderno digital creado para Matemáticas"
}
```

**Posibles Errores:**
```json
// 401 Unauthorized
{ "error": "No autenticado" }

// 400 Bad Request
{ "error": "subject_id y subject_name son requeridos" }

// 403 Forbidden
{ "error": "Acceso denegado" }

// 500 Internal Server Error
{ "error": "Error al crear cuaderno" }
```

---

## 📝 ENDPOINT 2: Guardar Entrada

### POST `/api/cuaderno/guardar`

**Descripción:** Guardar una entrada/apunte en el cuaderno

**Request:**
```javascript
fetch('http://localhost:10000/api/cuaderno/guardar', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': 'jwt=tu_token'
  },
  body: JSON.stringify({
    notebook_id: 5,
    content: "<p>Mi primer apunte de <strong>Matemáticas</strong></p>",
    subject_name: "Matemáticas"
  })
})
```

**JavaScript en frontend (ya implementado en home.js):**
```javascript
function saveToServer(entry) {
  fetch('/api/cuaderno/guardar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      notebook_id: currentNotebookData.notebook_id,
      content: entry.content,
      subject_name: currentNotebookData.subject
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      console.log('✅ Entrada guardada:', data.entry_id);
    }
  })
  .catch(error => console.error('Error:', error));
}
```

**cURL:**
```bash
curl -X POST "http://localhost:10000/api/cuaderno/guardar" \
  -H "Content-Type: application/json" \
  -H "Cookie: jwt=abc123" \
  -d '{
    "notebook_id": 5,
    "content": "<p>Mi primer apunte</p>",
    "subject_name": "Matemáticas"
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "entry_id": 42,
  "timestamp": "24/05/2026 14:30:45",
  "message": "Entrada guardada exitosamente"
}
```

**Con HTML y Media:**
```json
{
  "notebook_id": 5,
  "content": "<p>Apunte importante</p><img src='data:image/png;base64,...'><video src='data:video/mp4;base64,...' controls></video>",
  "subject_name": "Matemáticas"
}
```

---

## 📖 ENDPOINT 3: Obtener Entradas

### GET `/api/cuaderno/:notebook_id`

**Descripción:** Obtener todas las entradas de un cuaderno

**Request:**
```javascript
fetch('http://localhost:10000/api/cuaderno/5', {
  headers: {
    'Cookie': 'jwt=tu_token'
  }
})
.then(res => res.json())
.then(data => console.log(data.entries))
```

**cURL:**
```bash
curl -X GET "http://localhost:10000/api/cuaderno/5" \
  -H "Cookie: jwt=tu_token"
```

**Response (200 OK):**
```json
{
  "success": true,
  "notebook_id": 5,
  "entries": [
    {
      "id": 42,
      "content": "<p>Mi apunte sobre derivadas</p>",
      "created_at": "24/05/2026 14:30:45",
      "media": [
        {
          "id": 1,
          "file_url": "data:image/png;base64,...",
          "file_type": "image",
          "file_name": "formula.png"
        }
      ]
    },
    {
      "id": 41,
      "content": "<p>Introducción a cálculo</p>",
      "created_at": "24/05/2026 10:15:30",
      "media": []
    }
  ]
}
```

**Entradas sin media:**
```json
{
  "success": true,
  "notebook_id": 5,
  "entries": [
    {
      "id": 40,
      "content": "<p><strong>Teorema fundamental:</strong> f(x) = x²</p>",
      "created_at": "23/05/2026 16:45:12",
      "media": []
    }
  ]
}
```

---

## 🎯 ENDPOINT 4: Obtener Cuaderno por Materia

### GET `/api/cuaderno/materia/:subject_id`

**Descripción:** Obtener el ID del cuaderno para una materia específica (o crear si no existe)

**Request:**
```javascript
// Frontend - Al abrir el Cuaderno Digital
fetch(`/api/cuaderno/materia/${selectedSubjectId}`)
  .then(res => res.json())
  .then(data => {
    currentNotebookData.notebook_id = data.notebook_id;
    loadEntries();
  })
```

**cURL:**
```bash
curl -X GET "http://localhost:10000/api/cuaderno/materia/1" \
  -H "Cookie: jwt=tu_token"
```

**Response (200 OK) - Cuaderno ya existe:**
```json
{
  "success": true,
  "notebook_id": 5,
  "subject_id": 1,
  "subject_name": "Matemáticas"
}
```

**Response (200 OK) - Cuaderno creado automáticamente:**
```json
{
  "success": true,
  "notebook_id": 6,
  "subject_id": 2,
  "subject_name": "Física"
}
```

---

## ✏️ ENDPOINT 5: Actualizar Entrada

### PUT `/api/cuaderno/entrada/:entry_id`

**Descripción:** Modificar el contenido de una entrada existente

**Request:**
```javascript
fetch('http://localhost:10000/api/cuaderno/entrada/42', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': 'jwt=tu_token'
  },
  body: JSON.stringify({
    content: "<p>Contenido <em>actualizado</em> de la entrada</p>"
  })
})
```

**cURL:**
```bash
curl -X PUT "http://localhost:10000/api/cuaderno/entrada/42" \
  -H "Content-Type: application/json" \
  -H "Cookie: jwt=tu_token" \
  -d '{
    "content": "<p>Contenido actualizado</p>"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "entry": {
    "id": 42,
    "notebook_id": 5,
    "content": "<p>Contenido actualizado</p>",
    "created_at": "2026-05-24T14:30:45Z",
    "updated_at": "2026-05-24T15:45:30Z"
  },
  "message": "Entrada actualizada"
}
```

---

## 🗑️ ENDPOINT 6: Eliminar Entrada

### DELETE `/api/cuaderno/entrada/:entry_id`

**Descripción:** Eliminar una entrada (también elimina su media asociada)

**Request:**
```javascript
fetch('http://localhost:10000/api/cuaderno/entrada/42', {
  method: 'DELETE',
  headers: {
    'Cookie': 'jwt=tu_token'
  }
})
```

**cURL:**
```bash
curl -X DELETE "http://localhost:10000/api/cuaderno/entrada/42" \
  -H "Cookie: jwt=tu_token"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Entrada eliminada"
}
```

**Error - No encontrado:**
```json
{
  "error": "Acceso denegado"
}
```

---

## 📤 ENDPOINT 7: Subir Archivo Multimedia

### POST `/api/cuaderno/upload`

**Descripción:** Guardar referencia de archivo multimedia (usualmente Data URL desde frontend)

**Request:**
```javascript
// Cuando el usuario arrastra un archivo
fetch('/api/cuaderno/upload', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': 'jwt=tu_token'
  },
  body: JSON.stringify({
    entry_id: 42,
    file_url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...",
    file_type: "image",
    file_name: "captura.png"
  })
})
```

**cURL:**
```bash
curl -X POST "http://localhost:10000/api/cuaderno/upload" \
  -H "Content-Type: application/json" \
  -H "Cookie: jwt=tu_token" \
  -d '{
    "entry_id": 42,
    "file_url": "data:image/png;base64,...",
    "file_type": "image",
    "file_name": "imagen.png"
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "file_id": 3,
  "file_url": "data:image/png;base64,...",
  "message": "Archivo guardado"
}
```

**Tipos soportados:**
```javascript
file_type: "image"  // PNG, JPG, GIF, etc.
file_type: "video"  // MP4, WebM, OGG, etc.
file_type: "audio"  // MP3, WAV, OGG, etc.
file_type: "file"   // PDF, DOCX, TXT, etc.
```

---

## 🔐 CÓDIGOS DE ESTADO HTTP

| Código | Significado | Caso |
|--------|-----------|------|
| 200 | OK | GET exitoso |
| 201 | Created | Creación exitosa |
| 400 | Bad Request | Parámetros faltantes |
| 401 | Unauthorized | Sin token/token inválido |
| 403 | Forbidden | Sin permisos (no es dueño) |
| 404 | Not Found | Recurso no existe |
| 500 | Server Error | Error interno |

---

## 🧪 EJEMPLO COMPLETO: Flujo de Usuario

```javascript
// 1. Usuario abre cuaderno de Matemáticas
const subjectId = 1;

// 2. Obtener notebook_id
const notebook = await fetch(`/api/cuaderno/materia/${subjectId}`)
  .then(r => r.json());
console.log('Cuaderno:', notebook.notebook_id); // 5

// 3. Cargar entradas anteriores
const data = await fetch(`/api/cuaderno/${notebook.notebook_id}`)
  .then(r => r.json());
console.log('Entradas:', data.entries); // [...]

// 4. Usuario escribe apunte
const content = "<p>Hoy aprendimos <strong>derivadas</strong></p>";

// 5. Usuario arrasta imagen
const imageFile = "data:image/png;base64,...";

// 6. Insertar imagen en editor (frontend)
// editor.innerHTML += `<img src="${imageFile}">`;

// 7. Usuario hace click Guardar
const saved = await fetch('/api/cuaderno/guardar', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    notebook_id: notebook.notebook_id,
    content: content + `<img src="${imageFile}">`,
    subject_name: "Matemáticas"
  })
}).then(r => r.json());

console.log('Entrada guardada:', saved.entry_id); // 42
console.log('Timestamp:', saved.timestamp); // "24/05/2026 14:30:45"

// 8. Recargar entradas
const updated = await fetch(`/api/cuaderno/${notebook.notebook_id}`)
  .then(r => r.json());
console.log('Nueva entrada visible:', updated.entries[0]);

// 9. Usuario edita entrada posterior
await fetch(`/api/cuaderno/entrada/42`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: "<p>Contenido actualizado</p>"
  })
}).then(r => r.json());

// 10. Usuario borra entrada
await fetch(`/api/cuaderno/entrada/40`, {
  method: 'DELETE'
}).then(r => r.json());
```

---

## 🎨 Formatos de Contenido Aceptados

### Texto Plano
```json
{
  "content": "Mi apunte simple"
}
```

### HTML Enriquecido
```json
{
  "content": "<p>Apunte con <strong>negrita</strong> y <em>cursiva</em></p>"
}
```

### Con Imágenes (Data URL)
```json
{
  "content": "<p>Mira esta imagen:</p><img src='data:image/png;base64,...'>"
}
```

### Con Multimedia Múltiple
```json
{
  "content": "<p>Contenido multimedia</p><img src='...'><video src='...' controls></video><audio src='...' controls></audio>"
}
```

### Sanitizado Automáticamente
El servidor eliminará:
- Scripts (`<script>`)
- Event handlers (`onclick`, etc)
- Estilos inline peligrosos

---

## 💡 Notas Importantes

1. **Timestamps:** Se generan automáticamente en el servidor (format ES-ES)
2. **Sanitización:** Todo HTML se limpia de contenido malicioso
3. **RLS:** Cada usuario solo ve sus propios cuadernos
4. **Cascada:** Eliminar entrada elimina automáticamente su media
5. **Data URLs:** El frontend puede enviar archivos como Data URLs
6. **Performance:** Las entradas se devuelven ordenadas (más reciente primero)

---

**¡Listo para usar!** 🚀

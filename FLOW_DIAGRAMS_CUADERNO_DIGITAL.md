# Diagrama de Flujo - Cuaderno Digital

**Visualización del sistema completo**

---

## 🔄 Flujo de Usuario Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                        USUARIO                                   │
│                    (Estudiante Mi Mochila)                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1️⃣  AGREGAR MATERIA                                              │
│     Click: "Agregar Materia"                                     │
│     ├─ Abre modal                                                │
│     ├─ Ingresa: Nombre, Profesor, Horario                      │
│     └─ Click: "Guardar"                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2️⃣  BACKEND - CREAR MATERIA                                      │
│     POST /api/materias/crear                                     │
│     ├─ Valida autenticación (JWT)                               │
│     ├─ Inserta en tabla subjects                                │
│     └─ 🔄 AUTO: Llama crearCuadernoAutomatico()                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3️⃣  CREAR CUADERNO AUTOMÁTICO                                   │
│     crearCuadernoAutomatico(subject_id, user_id)                │
│     ├─ Inserta en tabla notebooks                               │
│     ├─ Genera notebook_id único                                 │
│     └─ ✅ Cuaderno listo para usar                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4️⃣  ABRIR CUADERNO DIGITAL                                      │
│     Click: Icono "📕 Cuaderno Digital"                           │
│     ├─ Modal se expande (95% pantalla)                          │
│     ├─ Se llama: GET /api/cuaderno/materia/1                    │
│     └─ Backend devuelve notebook_id                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5️⃣  CARGAR ENTRADAS PREVIAS                                     │
│     GET /api/cuaderno/:notebook_id                              │
│     ├─ Backend consulta tabla notebook_entries                  │
│     ├─ Incluye media asociada (fotos, videos, etc)              │
│     ├─ Ordena por fecha (más reciente primero)                  │
│     └─ Retorna JSON con todas las entradas                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6️⃣  ESCRIBIR Y FORMATEAR APUNTES                                │
│     Usuario escribe en editor                                    │
│     ├─ Usa toolbar: Bold, Italic, Underline                    │
│     ├─ Arrastra/sube multimedia                                 │
│     │  └─ Imágenes, videos, audio, archivos                     │
│     └─ Contenido se inserta en editor (Data URLs)               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7️⃣  GUARDAR ENTRADA                                             │
│     Click: "Guardar"                                             │
│     ├─ Genera timestamp automático (DD/MM/YYYY HH:MM:SS)        │
│     ├─ Salva en localStorage (caché local)                      │
│     ├─ POST /api/cuaderno/guardar                               │
│     └─ Backend inserta en tabla notebook_entries                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8️⃣  PERSISTENCIA EN BASE DE DATOS                              │
│     INSERT INTO notebook_entries (...)                          │
│     ├─ Content sanitizado (sin scripts)                         │
│     ├─ Timestamp generado en servidor                           │
│     ├─ user_id validado (RLS)                                   │
│     └─ ✅ Entrada almacenada permanentemente                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 9️⃣  MOSTRAR EN HISTORIAL                                        │
│     Entrada aparece en lista cronológica                         │
│     ├─ Timestamp visible                                         │
│     ├─ Contenido con formato HTML                               │
│     ├─ Media incrustada (fotos, videos)                         │
│     └─ Listo para editar o eliminar                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Arquitectura de Base de Datos

```
                       AUTH.USERS (Supabase)
                              │
                              │ (user_id)
                              ▼
                        ┌─────────────┐
                        │  SUBJECTS   │
                        │ (Materias)  │
                        │─────────────│
                        │ id          │
                        │ user_id     │
                        │ name        │
                        │ professor   │
                        │ schedule    │
                        │ description │
                        │ created_at  │
                        └─────────────┘
                              │
                    (1:1 relationship)
                              │
                              ▼
                        ┌─────────────┐
                        │ NOTEBOOKS   │
                        │(Cuadernos)  │
                        │─────────────│
                        │ id          │
                        │ subject_id  │◄──── Foreign Key
                        │ user_id     │
                        │ created_at  │
                        │ updated_at  │
                        └─────────────┘
                              │
                    (1:N relationship)
                              │
                              ▼
                  ┌─────────────────────────┐
                  │  NOTEBOOK_ENTRIES       │
                  │ (Entradas/Apuntes)      │
                  │─────────────────────────│
                  │ id                      │
                  │ notebook_id             │◄─ Foreign Key
                  │ content (HTML)          │
                  │ created_at              │
                  │ updated_at              │
                  └─────────────────────────┘
                              │
                    (1:N relationship)
                              │
                              ▼
                  ┌─────────────────────────┐
                  │  NOTEBOOK_MEDIA         │
                  │ (Imágenes, Videos, etc.)│
                  │─────────────────────────│
                  │ id                      │
                  │ entry_id                │◄─ Foreign Key
                  │ file_url (Data URL)     │
                  │ file_type (img|vid|aud)│
                  │ file_name               │
                  │ file_size               │
                  │ created_at              │
                  └─────────────────────────┘
```

---

## 🔐 Flujo de Seguridad

```
┌─────────────────────────────────────────────────────────────────┐
│                    REQUEST A ENDPOINT                            │
│                  (Ej: GET /api/cuaderno/5)                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ PASO 1: JWT AUTH │
                    │─────────────────-│
                    │ Obtener token    │
                    │ de cookie        │
                    │ Verificar firma  │
                    │ Extraer user_id  │
                    └──────────────────┘
                              │
                         ¿Válido?
                        /        \
                      SÍ          NO
                      │            │
                      ▼            ▼
                  ┌────────┐   ┌────────────┐
                  │ Paso 2 │   │ 401 ERROR  │
                  └────────┘   │Unauthorized│
                      │        └────────────┘
                      ▼
            ┌──────────────────┐
            │ PASO 2: RLS AUTH │
            │──────────────────│
            │ Usuario accede   │
            │ solo sus datos   │
            │ (Row Level Sec.) │
            └──────────────────┘
                      │
                 ¿Propietario?
                /            \
              SÍ              NO
              │               │
              ▼               ▼
          ┌────────┐    ┌──────────────┐
          │Paso 3  │    │ 403 ERROR    │
          └────────┘    │Access Denied │
              │         └──────────────┘
              ▼
    ┌──────────────────┐
    │ PASO 3: PROCESAR │
    │──────────────────│
    │ Validar entrada  │
    │ Sanitizar HTML   │
    │ Ejecutar query   │
    └──────────────────┘
              │
              ▼
    ┌──────────────────┐
    │ PASO 4: RESPONSE │
    │──────────────────│
    │ Devolver datos   │
    │ (200 OK)         │
    └──────────────────┘
```

---

## 📊 Flujo de Datos - Ejemplo Real

### Guardar Entrada: POST /api/cuaderno/guardar

```
FRONTEND (home.js)
│
├─ Usuario escribe: "Aprendí sobre <strong>derivadas</strong>"
├─ Usuario arrastra imagen: "formula.png"
├─ Genera timestamp: "24/05/2026 14:30:45"
├─ Guarda en localStorage: 
│  └─ localStorage.setItem("notebook_Matemáticas", {...})
│
└─ Envía POST /api/cuaderno/guardar
   ├─ notebook_id: 5
   ├─ content: "<p>Aprendí sobre <strong>derivadas</strong></p><img src='data:...'>"
   └─ subject_name: "Matemáticas"
                          │
                          ▼
BACKEND (cuaderno.controller.js)
│
├─ guardarEntrada(req, res)
├─ Obtiene user_id del token JWT: "user-123-abc"
├─ Verifica que user_id es dueño del notebook_id 5
├─ Sanitiza HTML con DOMPurify
│  └─ Elimina scripts maliciosos si hay
├─ INSERT INTO notebook_entries (
│    notebook_id: 5,
│    content: "<p>Aprendí sobre <strong>derivadas</strong></p>...",
│    created_at: CURRENT_TIMESTAMP
│  )
├─ Retorna entry_id: 42
│
└─ Response JSON:
   ├─ success: true
   ├─ entry_id: 42
   ├─ timestamp: "24/05/2026 14:30:45"
   └─ message: "Entrada guardada exitosamente"
                          │
                          ▼
FRONTEND (home.js)
│
├─ Recibe response
├─ Agrega entrada a lista HTML
├─ Muestra timestamp y contenido
├─ Usuario ve su apunte guardado
│
└─ Estructura visible:
   ┌────────────────────────────┐
   │ 24/05/2026 14:30:45        │
   ├────────────────────────────┤
   │ Aprendí sobre derivadas    │
   │ [Imagen de formula]        │
   └────────────────────────────┘
```

---

## 🔄 Flujo Offline-First (localStorage + Sync)

```
┌──────────────────────────────────────────────────────────────┐
│ INTERNET: SÍ          INTERNET: NO                            │
│────────────────────────────────────────────────────────────│
│                                                              │
│ Usuario escribe    ──┐     Usuario escribe                  │
│        │            │              │                         │
│        ▼            │              ▼                         │
│  localStorage      │     localStorage (FUNCIONA)            │
│        │            │              │                         │
│        ├──────────┐ │              └─ Datos en caché local   │
│        │          │ │                 (No hay servidor)      │
│        ▼          │ │                                        │
│  POST /api/       │ │     Cuando vuelve INTERNET:            │
│  cuaderno/guardar │ │              │                         │
│        │          │ │              ▼                         │
│        ▼          │ │     POST /api/cuaderno/guardar         │
│  Supabase        │ │              │                         │
│  almacena        │ │              ▼                         │
│        │          │ │     Supabase almacena                 │
│        ▼          │ │              │                         │
│  ✅ Sincronizado   │ │              ▼                         │
│                    │ │     ✅ Sincronizado                   │
│                    │ │                                       │
│ (Offline-first    │ │ (Sync cuando hay conexión)            │
│  + Sync)           │ │                                       │
└──────────────────────────────────────────────────────────────┘
```

---

## 📱 Responsividad - Diseño Adaptable

```
DESKTOP (Ancho > 1024px)
┌────────────────────────────────────────────┐
│ Cuaderno Digital Modal (95% viewport)      │
│┌──────────────────────────────────────────┐│
││ Toolbar: [B] [I] [U] [Limpiar] | [🖼️] [🎥]││
││┌──────────────────────────────────────────┐││
│││                                          │││
│││     EDITOR - Escribe tus apuntes         │││
│││     Arrastra archivos aquí               │││
│││                                          │││
││└──────────────────────────────────────────┘││
││┌──────────────────────────────────────────┐││
│││ 24/05 14:30  │ Mi primer apunte         │││
│││ 24/05 10:15  │ Contenido previo         │││
││└──────────────────────────────────────────┘││
│└──────────────────────────────────────────┘│
└────────────────────────────────────────────┘


TABLET (768px - 1024px)
┌──────────────────────┐
│ Cuaderno (90% ancho) │
│┌────────────────────┐│
││ [B][I][U][Lim]    ││
││┌──────────────────┐││
│││ EDITOR           │││
│││                  │││
││└──────────────────┘││
││┌──────────────────┐││
│││ Entradas         │││
││└──────────────────┘││
│└────────────────────┘│
└──────────────────────┘


MÓVIL (< 768px)
┌──────────┐
│ Cuaderno │
│ (100%)   │
│┌────────┐│
││[B][I]  ││
││┌──────┐││
│││Editor││
││└──────┘││
││┌──────┐││
│││Enter││
││└──────┘││
│└────────┘│
└──────────┘
```

---

## ⚙️ Stack Tecnológico

```
FRONTEND LAYER
│
├─ HTML (home.html)
│  └─ Modal amplio, Editor contenteditable, Drop zone
│
├─ CSS (stylehome.css)
│  └─ Grid/Flexbox responsive, Media queries
│
└─ JavaScript (home.js)
   ├─ Event listeners (click, dragover, drop)
   ├─ DOM manipulation
   ├─ fetch() API
   ├─ localStorage
   └─ document.execCommand() (formateo)

                    ↕️  HTTP/JSON
                          
BACKEND LAYER
│
├─ Express (Node.js)
│  └─ 7 rutas API RESTful
│
├─ Controllers (cuaderno.controller.js)
│  ├─ Autenticación JWT
│  ├─ Sanitización HTML (DOMPurify)
│  ├─ Validaciones
│  └─ Error handling
│
└─ Supabase Client
   └─ Queries a base de datos

                    ↕️  SQL Queries
                          
DATABASE LAYER
│
└─ Supabase (PostgreSQL)
   ├─ 4 tablas relacionadas
   ├─ RLS (Row Level Security)
   ├─ Índices optimizados
   ├─ Triggers automáticos
   └─ Vistas útiles
```

---

## 🚀 Resumen Visual - De Inicio a Fin

```
1. USUARIO SE REGISTRA
   └─ Crea cuenta en /register

2. USUARIO HACE LOGIN
   └─ Obtiene JWT token en cookie

3. USUARIO VA A /home
   └─ Ve dashboard con menú

4. USUARIO CREA MATERIA
   POST /api/materias/crear
   └─ Backend auto-crea cuaderno (trigger SQL)

5. USUARIO ABRE CUADERNO DIGITAL
   GET /api/cuaderno/materia/1
   └─ Obtiene notebook_id y carga entradas previas

6. USUARIO ESCRIBE APUNTES
   ├─ Editor contenteditable
   ├─ Toolbar de formateo
   ├─ Drag & Drop de multimedia
   └─ localStorage auto-guardar

7. USUARIO HACE CLICK GUARDAR
   POST /api/cuaderno/guardar
   ├─ Frontend envía contenido + timestamp
   ├─ Backend sanitiza e inserta en BD
   └─ Supabase almacena permanentemente

8. ENTRADA APARECE EN HISTORIAL
   ├─ Visible en UI
   ├─ Cronológica (más reciente primero)
   ├─ Editable/eliminable
   └─ Sincronizada en todos los dispositivos

9. USUARIO CIERRA NAVEGADOR
   └─ localStorage preserva datos (offline-ready)

10. USUARIO ABRE NAVEGADOR NUEVAMENTE
    └─ Datos se sincronizan automáticamente
```

---

**Diagrama generado:** 24 de mayo de 2026  
**Versión:** 1.0

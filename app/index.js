// app/index.js
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env SOLO en desarrollo (Render inyecta variables automáticamente)
if (process.env.NODE_ENV !== 'production') {
  const envPath = path.resolve(__dirname, '../.env');
  const result = dotenv.config({ path: envPath });

  if (result.error) {
    console.error('❌ Error al cargar .env:', result.error.message);
    console.error('Ruta buscada:', envPath);
  } else {
    console.log('✅ .env cargado desde:', envPath);
  }
} else {
  // En producción, intentar cargar .env si existe (para Render)
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    console.log('ℹ️ Cargando .env en producción desde:', envPath);
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const indexOfEquals = trimmed.indexOf('=');
        if (indexOfEquals > 0) {
          const key = trimmed.substring(0, indexOfEquals).trim();
          const value = trimmed.substring(indexOfEquals + 1).trim();
          if (key && value && !process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    });
  }
}

// Validar variables críticas
console.log('\n========== VALIDACIÓN DE VARIABLES ==========');
const requiredVars = ['JWT_SECRET', 'SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const missingVars = [];

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: Configurada`);
  } else {
    console.error(`❌ ${varName}: NO CONFIGURADA`);
    missingVars.push(varName);
  }
});

if (missingVars.length > 0) {
  console.error('\n⚠️ Variables faltantes:', missingVars.join(', '));
  console.error('\nEn desarrollo: Crea archivo .env con:');
  console.error('  JWT_SECRET=tu_clave_secreta');
  console.error('  JWT_EXPIRES_IN=7d');
  console.error('  JWT_COOKIE_EXPIRES=1');
  console.error('  SUPABASE_URL=tu_url');
  console.error('  SUPABASE_ANON_KEY=tu_clave');
  console.error('\nEn Render: Configúralas en Settings > Environment');
}
console.log('==============================================\n');

// Importar cliente de Supabase
import { supabase } from "./config/supabase.js";
import express from 'express';
import cookieParser from 'cookie-parser';
import jsonwebtoken from 'jsonwebtoken';
import { methods as authentication } from "./controllers/authentication.controller.js";
import { methods as authorization } from "./middlewares/authorization.js";
import { methods as cuaderno } from "./controllers/cuaderno.controller.js";
import { methods as subjects } from "./controllers/subjects.controller.js";
import { methods as profile } from "./controllers/profile.controller.js";
import { methods as profiledate } from "./controllers/profiledate.controller.js";
import { methods as materialuser } from "./controllers/materialuser.controller.js";
import { methods as bookdigital } from "./controllers/bookdigital.controller.js";
import { methods as gruppro } from "./controllers/gruppro.controller.js";
import { methods as tareapro } from "./controllers/tareapro.controller.js";

// Función de prueba de conexión a Supabase
async function testSupabaseConnection() {
  try {
    console.log('\n📡 Probando conexión a Supabase...');
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact' })
      .limit(1);

    if (error) {
      throw new Error(error.message);
    }

    console.log('✅ CONEXIÓN A SUPABASE: EXITOSA');
    console.log('   └─ Tabla "users" accesible');
    return true;
  } catch (error) {
    console.error('❌ FALLO EN CONEXIÓN A SUPABASE:', error.message);
    console.error('   └─ Verifica que:');
    console.error('      1. SUPABASE_URL sea correcto');
    console.error('      2. SUPABASE_ANON_KEY sea válida');
    console.error('      3. La tabla "users" exista en Supabase');
    console.error('      4. Tengas acceso de lectura a la tabla');
    return false;
  }
}

// server
const app = express();
const PORT = process.env.PORT || 10000;

const server = app.listen(PORT, '0.0.0.0', async () => {
  console.log(`✅ Server live on port ${PORT}`);
  
  // Probar conexión a Supabase después de iniciar el servidor
  setTimeout(async () => {
    await testSupabaseConnection();
  }, 500);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`El puerto ${PORT} ya está en uso. Usa otro puerto o detén el proceso existente.`);
    process.exit(1);
  }
  throw err;
});

// configuracion
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(cookieParser());

// rutas principales
app.get("/", authorization.soloUsuario, (req, res) =>
  res.sendFile(__dirname + "/page/login.html")
);

app.get("/register", authorization.soloUsuario, (req, res) =>
  res.sendFile(__dirname + "/page/register.html")
);


// 🔑 Aquí decides si solo admin entra o cualquier usuario logueado
// Opción 1: solo admin
// app.get("/home", authorization.soloAdmin, (req, res) =>
//   res.sendFile(__dirname + "/page/home/home.html")
// );

// Opción 2: cualquier usuario logueado
app.get("/home", authorization.soloLogueado, (req, res) =>
  res.sendFile(__dirname + "/page/home/home.html")
);

app.post("/api/register", authentication.register);
app.post("/api/login", authentication.login);
app.post("/api/logout", (req, res) => {
  res.clearCookie("jwt", { path: "/" });
  res.json({ status: "ok", message: "Sesión cerrada correctamente" });
});
app.get("/about", authorization.soloLogueado, (req, res) =>
  res.sendFile(__dirname + "/page/about.html")
);

// Endpoint para obtener información del usuario actual
app.get("/api/usuario", (req, res) => {
  try {
    console.log("[/api/usuario] Solicitud recibida");
    
    // Obtener token del header Cookie
    const cookieHeader = req.headers.cookie || "";
    const cookieJWT = cookieHeader
      .split(";")
      .find((cookie) => cookie.trim().startsWith("jwt="));
    
    if (!cookieJWT) {
      console.warn("[/api/usuario] No se encontró JWT en cookies");
      return res.status(401).json({ 
        error: "No autenticado",
        message: "No hay sesión activa"
      });
    }

    const token = cookieJWT.split("=")[1];
    if (!token) {
      return res.status(401).json({ 
        error: "Token inválido"
      });
    }

    // Verificar el token
    const decodificada = jsonwebtoken.verify(token, process.env.JWT_SECRET);
    
    console.log("[/api/usuario] ✅ Usuario obtenido:", decodificada.username);
    
    res.json({
      id: decodificada.id,
      username: decodificada.username,
      email: decodificada.email,
      role: decodificada.role
    });
  } catch (error) {
    console.error("[ERROR /api/usuario]", error.message);
    res.status(401).json({ 
      error: "Token inválido o expirado",
      message: error.message
    });
  }
});

// 🚀 Endpoint de prueba para conexión con Supabase
app.get("/ping-supabase", async (req, res) => {
  try {
    console.log('\n📡 [/ping-supabase] Verificando conexión...');
    
    // Paso 1: Verificar que la URL y Key estén configuradas
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    
    console.log('Configuración:');
    console.log('  - SUPABASE_URL:', url ? '✅ Presente' : '❌ Falta');
    console.log('  - SUPABASE_ANON_KEY:', key ? '✅ Presente' : '❌ Falta');

    if (!url || !key) {
      return res.status(500).json({ 
        error: 'Variables de Supabase no configuradas',
        details: {
          url: url ? '✅ Configurada' : '❌ Falta',
          key: key ? '✅ Configurada' : '❌ Falta'
        }
      });
    }

    // Paso 2: Intentar acceder a la tabla users
    console.log('Accediendo a tabla "users"...');
    const { data, error } = await supabase
      .from("users")
      .select("*", { count: 'exact' })
      .limit(1);

    if (error) {
      console.error('❌ Error de Supabase:', error.message);
      return res.status(500).json({ 
        error: 'Error en Supabase',
        message: error.message,
        code: error.code
      });
    }

    console.log('✅ Conexión exitosa');
    res.json({ 
      status: '✅ CONEXIÓN EXITOSA',
      message: 'Conexión a Supabase funcionando correctamente',
      supabaseUrl: url,
      userCount: data?.length || 0
    });

  } catch (err) {
    console.error('❌ Error en /ping-supabase:', err);
    res.status(500).json({ 
      error: 'Error del servidor',
      message: err.message 
    });
  }
});

// ============================================================
// 📚 RUTAS DEL CUADERNO DIGITAL
// ============================================================

// POST /api/cuaderno/crear - Crear cuaderno (normalmente automático)
app.post("/api/cuaderno/crear", cuaderno.crearCuaderno);

// POST /api/cuaderno/guardar - Guardar entrada en cuaderno
app.post("/api/cuaderno/guardar", cuaderno.guardarEntrada);

// GET /api/cuaderno/:notebook_id - Obtener todas las entradas
app.get("/api/cuaderno/:notebook_id", cuaderno.obtenerEntradas);

// GET /api/cuaderno/materia/:subject_id - Obtener cuaderno por materia
app.get("/api/cuaderno/materia/:subject_id", cuaderno.obtenerCuadernoMateria);

// PUT /api/cuaderno/entrada/:entry_id - Actualizar entrada
app.put("/api/cuaderno/entrada/:entry_id", cuaderno.actualizarEntrada);

// DELETE /api/cuaderno/entrada/:entry_id - Eliminar entrada
app.delete("/api/cuaderno/entrada/:entry_id", cuaderno.eliminarEntrada);

// POST /api/cuaderno/upload - Subir archivo multimedia
app.post("/api/cuaderno/upload", cuaderno.subirArchivo);

console.log('✅ Rutas del Cuaderno Digital inicializadas');

// ============================================================
// 📚 RUTAS DE MATERIAS/ASIGNATURAS
// ============================================================

// POST /api/materias/crear - Crear nueva materia
app.post("/api/materias/crear", subjects.crearMateria);

// GET /api/materias - Obtener todas las materias del usuario
app.get("/api/materias", subjects.obtenerMaterias);

// GET /api/materias/:subject_id - Obtener una materia específica
app.get("/api/materias/:subject_id", subjects.obtenerMateria);

// PUT /api/materias/:subject_id - Actualizar una materia
app.put("/api/materias/:subject_id", subjects.actualizarMateria);

// DELETE /api/materias/:subject_id - Eliminar una materia
app.delete("/api/materias/:subject_id", subjects.eliminarMateria);

console.log('✅ Rutas de Materias inicializadas');

// ============================================================
// 👤 RUTAS DE PERFIL
// ============================================================

// GET /api/perfil - Obtener perfil del usuario
app.get("/api/perfil", profile.obtenerPerfil);

// PUT /api/perfil - Actualizar perfil del usuario
app.put("/api/perfil", profile.actualizarPerfil);

console.log('✅ Rutas de Perfil inicializadas');

// ============================================================
// 👤 RUTAS DE PROFILEDATE (Nuevas tablas personalizadas)
// ============================================================

// GET /api/profiledate - Obtener perfil personalizado
app.get("/api/profiledate", profiledate.obtenerPerfil);

// PUT /api/profiledate - Actualizar perfil personalizado
app.put("/api/profiledate", profiledate.actualizarPerfil);

console.log('✅ Rutas de ProfileDate inicializadas');

// ============================================================
// 📚 RUTAS DE MATERIALUSER (Nuevas materias)
// ============================================================

// POST /api/materialuser/crear - Crear nueva materia
app.post("/api/materialuser/crear", materialuser.crearMateria);

// GET /api/materialuser - Obtener todas las materias del usuario
app.get("/api/materialuser", materialuser.obtenerMaterias);

// GET /api/materialuser/:id - Obtener una materia específica
app.get("/api/materialuser/:id", materialuser.obtenerMateria);

// PUT /api/materialuser/:id - Actualizar una materia
app.put("/api/materialuser/:id", materialuser.actualizarMateria);

// DELETE /api/materialuser/:id - Eliminar una materia
app.delete("/api/materialuser/:id", materialuser.eliminarMateria);

console.log('✅ Rutas de MaterialUser inicializadas');

// ============================================================
// 📖 RUTAS DE BOOKDIGITAL (Cuaderno Digital Nuevo)
// ============================================================

// POST /api/bookdigital/guardar - Guardar entrada en cuaderno
app.post("/api/bookdigital/guardar", bookdigital.guardarEntrada);

// GET /api/bookdigital - Obtener todas las entradas
app.get("/api/bookdigital", bookdigital.obtenerEntradas);

// GET /api/bookdigital/:materialuser_id - Obtener entradas por materia
app.get("/api/bookdigital/:materialuser_id", bookdigital.obtenerEntradasMateria);

// PUT /api/bookdigital/:id - Actualizar entrada
app.put("/api/bookdigital/:id", bookdigital.actualizarEntrada);

// DELETE /api/bookdigital/:id - Eliminar entrada
app.delete("/api/bookdigital/:id", bookdigital.eliminarEntrada);

// GET /api/bookhistory - Obtener historial
app.get("/api/bookhistory", bookdigital.obtenerHistorial);

console.log('✅ Rutas de BookDigital inicializadas');

// ============================================================
// 👥 RUTAS DE GRUPPRO (Grupos)
// ============================================================

// POST /api/gruppro/crear - Crear nuevo grupo
app.post("/api/gruppro/crear", gruppro.crearGrupo);

// GET /api/gruppro - Obtener todos los grupos
app.get("/api/gruppro", gruppro.obtenerGrupos);

// GET /api/gruppro/:id - Obtener un grupo específico
app.get("/api/gruppro/:id", gruppro.obtenerGrupo);

// PUT /api/gruppro/:id - Actualizar un grupo
app.put("/api/gruppro/:id", gruppro.actualizarGrupo);

// DELETE /api/gruppro/:id - Eliminar un grupo
app.delete("/api/gruppro/:id", gruppro.eliminarGrupo);

console.log('✅ Rutas de Gruppro inicializadas');

// ============================================================
// ✅ RUTAS DE TAREAPRO (Tareas)
// ============================================================

// POST /api/tareapro/crear - Crear nueva tarea
app.post("/api/tareapro/crear", tareapro.crearTarea);

// GET /api/tareapro - Obtener todas las tareas
app.get("/api/tareapro", tareapro.obtenerTareas);

// GET /api/tareapro/:id - Obtener una tarea específica
app.get("/api/tareapro/:id", tareapro.obtenerTarea);

// PUT /api/tareapro/:id - Actualizar una tarea
app.put("/api/tareapro/:id", tareapro.actualizarTarea);

// DELETE /api/tareapro/:id - Eliminar una tarea
app.delete("/api/tareapro/:id", tareapro.eliminarTarea);

console.log('✅ Rutas de Tareapro inicializadas');

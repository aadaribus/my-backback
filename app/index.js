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

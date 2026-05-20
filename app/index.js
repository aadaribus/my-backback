// app/index.js
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

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

  console.log('DEBUG: SUPABASE_URL después de cargar .env =', process.env.SUPABASE_URL?.substring(0, 30));
}

// Importar cliente de Supabase
import { supabase } from "./config/supabase.js";
import express from 'express';
import cookieParser from 'cookie-parser';
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

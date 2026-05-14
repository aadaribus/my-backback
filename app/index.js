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

// server
const app = express();
const PORT = process.env.PORT || 10000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server live on port ${PORT}`);
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
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .limit(1);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: "✅ Conexión exitosa con Supabase", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

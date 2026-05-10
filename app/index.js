// app/index.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

/*dotenv.config({ path: envPath });
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}*/
console.log("📁 Variables de entorno cargadas desde:", envPath);

// Inicializar Supabase después de cargar dotenv
import { initSupabase } from "./config/supabase.js";
initSupabase();

import express from 'express';
import cookieParser from 'cookie-parser';

// Importa controladores y middlewares
import { methods as authentication } from "./controllers/authentication.controller.js";
import { methods as authorization } from "./middlewares/authorization.js";


// server
const app = express();
const PORT = process.env.PORT || 40000;
app.set("port", PORT);

const server = app.listen(PORT, () => {
  console.log("servidor corriendo en puerto", PORT);
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

// rutas
app.get("/", authorization.soloUsuario, (req, res) =>
  res.sendFile(__dirname + "/page/login.html")
);

app.get("/register", authorization.soloUsuario, (req, res) =>
  res.sendFile(__dirname + "/page/register.html")
);

app.get("/home", authorization.soloAdmin, (req, res) =>
  res.sendFile(__dirname + "/page/home/home.html")
);

app.post("/api/register", authentication.register);
app.post("/api/login", authentication.login);

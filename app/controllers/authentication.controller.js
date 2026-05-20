import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import { supabase } from "../config/supabase.js";

console.log("✅ authentication.controller.js cargado correctamente");

// Validación de email
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

async function login(req, res) {
  console.log("[LOGIN] Solicitud recibida:", new Date().toISOString());
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send({ error: { message: "Los campos están incompletos" } });
  }

  try {
    // Verificar que JWT_SECRET esté configurado
    if (!process.env.JWT_SECRET) {
      console.error("[ERROR LOGIN] JWT_SECRET no está configurado");
      return res.status(500).send({ error: { message: "Error de configuración del servidor" } });
    }

    console.log("[LOGIN] Buscando usuario:", username);
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !user) {
      console.error("[ERROR LOGIN] Usuario no encontrado:", error?.message);
      return res.status(400).send({ error: { message: "Imposible iniciar sesión en tu cuenta" } });
    }

    console.log("[LOGIN] Usuario encontrado, verificando contraseña");
    const loginCorrecto = await bcryptjs.compare(password, user.password);
    if (!loginCorrecto) {
      console.warn("[⚠️ INTENTO FALLIDO] Contraseña incorrecta para:", username);
      return res.status(400).send({ error: { message: "Usuario o contraseña incorrectos" } });
    }

    console.log("[LOGIN] Generando JWT...");
    const token = jsonwebtoken.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    console.log("[✅ LOGIN EXITOSO]", username, new Date().toISOString());

    const cookieExpireDays = parseInt(process.env.JWT_COOKIE_EXPIRES) || 1;
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
      path: "/"
    });

    res.send({ status: "ok", message: "Login correcto", redirect: "/home" });
  } catch (error) {
    console.error("[❌ ERROR SERVIDOR EN LOGIN]", error.message);
    console.error("[STACK]", error.stack);
    res.status(500).send({ error: { message: `Error en el servidor: ${error.message}` } });
  }
}

async function register(req, res) {
  console.log("[REGISTER] Solicitud recibida:", new Date().toISOString());
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).send({ error: { message: "Favor llenar los campos requeridos" } });
  }

  // Validar formato de email
  if (!validateEmail(email)) {
    return res.status(400).send({ error: { message: "Formato de email inválido" } });
  }

  try {
    // Verificar si el usuario ya existe por username o email
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .or(`username.eq.${username},email.eq.${email}`)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).send({ error: { message: "Datos de registros existentes" } });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);

    const { data: nuevoUsuario, error: errorInsert } = await supabase
      .from("users")
      .insert([{ 
        username, 
        email, 
        password: hashPassword,
        role: 'user' // Asignar rol por defecto - coincide con tabla Supabase
      }])
      .select()
      .single();

    if (errorInsert) {
      console.error("[ERROR REGISTRO]", new Date().toISOString(), "-", errorInsert.message);
      return res.status(400).send({ error: { message: "Error al registrar usuario" } });
    }

    console.log("[✅ USUARIO REGISTRADO]", new Date().toISOString());
    console.log("  - Username:", nuevoUsuario.username);
    console.log("  - Email:", nuevoUsuario.email);
    console.log("  - Rol:", nuevoUsuario.role);
    console.log("  - Creado en:", nuevoUsuario.created_at);
    
    return res.status(201).send({
      status: "ok",
      message: `Usuario ${nuevoUsuario.username} registrado correctamente`,
      user: {
        id: nuevoUsuario.id,
        username: nuevoUsuario.username,
        email: nuevoUsuario.email,
        role: nuevoUsuario.role,
        created_at: nuevoUsuario.created_at
      },
      redirect: "/"
    });
  } catch (error) {
    console.error("[ERROR SERVIDOR]", error);
    res.status(500).send({ error: { message: "Error en el servidor" } });
  }
}

export const methods = { login, register };

import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import { supabase } from "../config/supabase.js";

console.log("✅ authentication.controller.js cargado correctamente");

async function login(req, res) {
  console.log("Login body:", req.body);
  const { username, email, password } = req.body;

  if ((!username && !email) || !password) {
    return res.status(400).send({ error: { message: "Los campos están incompletos" } });
  }

  try {
    // Buscar usuario por username o email
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .or(`username.eq.${username},email.eq.${email}`)
      .maybeSingle();

    if (error || !user) {
      console.error("Error Supabase login:", error?.message);
      return res.status(400).send({ error: { message: "Usuario o contraseña incorrectos" } });
    }

    // Comparar contraseña
    const loginCorrecto = await bcryptjs.compare(password, user.password);
    if (!loginCorrecto) {
      return res.status(400).send({ error: { message: "Usuario o contraseña incorrectos" } });
    }

    // Generar token JWT con rol
    const token = jsonwebtoken.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role || "user" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
      path: "/"
    });

    res.send({ status: "ok", message: "Login correcto", redirect: "/home" });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).send({ error: { message: "Error en el servidor" } });
  }
}

async function register(req, res) {
  console.log(req.body);
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    return res.status(400).send({ error: { message: "Favor llenar los campos requeridos" } });
  }

  try {
    // Verificar si el usuario ya existe
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .or(`username.eq.${username},email.eq.${email}`)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).send({ error: { message: "El usuario o email ya existe" } });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);

    // Insertar nuevo usuario con rol (por defecto "user")
    const { data: nuevoUsuario, error: errorInsert } = await supabase
      .from("users")
      .insert([{ username, email, password: hashPassword, role: role || "user" }])
      .select()
      .single();

    if (errorInsert) {
      console.error("Error al registrar usuario:", errorInsert.message);
      return res.status(400).send({ error: { message: "Error al registrar usuario" } });
    }

    console.log("Usuario registrado:", nuevoUsuario);
    return res.status(201).send({
      status: "ok",
      message: `Usuario ${nuevoUsuario.username} registrado correctamente`,
      redirect: "/"
    });
  } catch (error) {
    console.error("Error en register:", error);
    res.status(500).send({ error: { message: "Error en el servidor" } });
  }
}

export const methods = { login, register };

import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import { supabase } from "../config/supabase.js";

console.log("✅ authentication.controller.js cargado correctamente");

async function login(req, res) {
    console.log(req.body);
    const username = req.body.username;
    const password = req.body.password;
    
    if(!username || !password) {
        return res.status(400).send({ "error": { message: "Los campos estan incompletos" } });
    }
    
    try {
        // Buscar usuario en Supabase
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();
        
        if (error || !data) {
            return res.status(400).send({ "error": { message: "Usuario o contraseña incorrectos" } });
        }
        
        // Comparar contraseña
        const loginCorrecto = await bcryptjs.compare(password, data.password);
        if(!loginCorrecto) {
            return res.status(400).send({ "error": { message: "Usuario o contraseña incorrectos" } });
        }
        
        // Generar token JWT
        const token = jsonwebtoken.sign
                ({username: data.username }, 
                process.env.JWT_SECRET, 
                { expiresIn: process.env.JWT_EXPIRES_IN });

        const cookieOptions = {
          expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
          path: "/"
        }
        res.cookie("jwt", token, cookieOptions);
        res.send({ status: "ok", message: "Login correcto", redirect: "/home" });
        
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).send({ "error": { message: "Error en el servidor" } });
    }
}

async function register(req, res) {
    console.log(req.body);
    const { username, email, password } = req.body;
    
    if(!username || !email || !password) {
       return res.status(400).send({ "error": { message: "Favor llenar los campos requeridos" } });
    }
    
    try {
        // Verificar si el usuario ya existe
        const { data: usuarioExistente, error: errorBusqueda } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();
            
        if (usuarioExistente) {
            return res.status(400).send({ "error": { message: "El usuario ya existe" } });
        }
        
        // Encriptar contraseña
        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(password, salt);
        
        // Insertar nuevo usuario en Supabase
        const { data: nuevoUsuario, error: errorInsert } = await supabase
            .from('users')
            .insert([{ username, email, password: hashPassword }])
            .select()
            .single();
            
        if (errorInsert) {
            console.error('Error al registrar usuario:', errorInsert);
            return res.status(400).send({ "error": { message: "Error al registrar usuario" } });
        }
        
        console.log('Usuario registrado:', nuevoUsuario);
        return res.status(201).send({ status:"ok", "message": `Usuario ${nuevoUsuario.username} registrado correctamente`, redirect: "/"   });
    } catch (error) {
        console.error('Error en register:', error);
        res.status(500).send({ "error": { message: "Error en el servidor" } });
    }
}

        export const methods = {
            login,
            register
        };
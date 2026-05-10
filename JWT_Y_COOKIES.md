# Guía: JWT y Cookies en tu aplicación

## ¿Cómo funciona la autenticación en tu proyecto?

Tu aplicación utiliza **JWT (JSON Web Tokens)** almacenados en **cookies** para mantener a los usuarios autenticados.

## 📋 Flujo de autenticación

### 1. **Registro**
```
Usuario → /api/register (POST)
  ↓
Backend valida datos
  ↓
Backend encripta password con bcryptjs
  ↓
Backend inserta usuario en Supabase
  ↓
✅ Usuario registrado exitosamente
```

### 2. **Login**
```
Usuario → /api/login (POST) { user, password }
  ↓
Backend busca usuario en Supabase
  ↓
Backend verifica contraseña con bcryptjs.compare()
  ↓
Backend genera JWT con jsonwebtoken.sign()
  ↓
Backend guarda JWT en cookie
  ↓
✅ Usuario logged in + redirect a /home
```

### 3. **Autorización**
```
Usuario accede a /home
  ↓
Middleware authorization.soloAdmin() se ejecuta
  ↓
Middleware lee cookie "jwt" de la request
  ↓
Middleware verifica que el JWT sea válido
  ↓
✅ Acceso permitido / ❌ Redirige a /
```

## 🔐 JWT - JSON Web Token

### ¿Qué es?
Un JWT es un token codificado que contiene información del usuario. Tiene 3 partes separadas por puntos:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYWRtaW4iLCJpYXQiOjE3Nzg0NTU0NTcsImV4cCI6MTc3OTA2MDI1N30.abc123...
│                                          │                                                  │
├─ HEADER (algoritmo y tipo)              ├─ PAYLOAD (información del usuario)             └─ SIGNATURE (firma)
```

### Variables de entorno en `.env`
```
JWT_SECRET=mi_clave_extra_secreta          # Clave secreta para firmar el JWT
JWT_EXPIRES_IN=7d                          # El token expira en 7 días
JWT_COOKIE_EXPIRES=1                       # Cookie persiste 1 día en el navegador
```

### Ejemplo de generación de JWT
```javascript
// En authentication.controller.js
const token = jsonwebtoken.sign(
    { user: data.user },              // Payload: qué guardar en el token
    process.env.JWT_SECRET,           // Clave secreta para firmar
    { expiresIn: process.env.JWT_EXPIRES_IN }  // Expiration time
);
```

### Verificación de JWT
```javascript
// En authorization.js
const decodificada = JsonWebToken.verify(token, process.env.JWT_SECRET);
// Si es válido, retorna { user: "admin", iat: ..., exp: ... }
// Si es inválido, lanza un error
```

## 🍪 Cookies

### ¿Qué es?
Una cookie es un pequeño archivo de texto que el navegador guarda. Se envía automáticamente con cada request al servidor.

### Cómo se guarda en tu proyecto
```javascript
// En authentication.controller.js - función login()
const cookieOptions = {
  expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Expira en 1 día
  path: "/"                                                  // Disponible en todo el sitio
}
res.cookie("jwt", token, cookieOptions);
```

### Cómo se lee en tu proyecto
```javascript
// En authorization.js - función revisarcookie()
const cookieHeader = req.headers.cookie || "";           // "jwt=eyJhbGci...; other=value"
const cookieJWT = cookieHeader
  .split(";")
  .find((cookie) => cookie.trim().startsWith("jwt="));   // "jwt=eyJhbGci..."
const token = cookieJWT.split("=")[1];                    // "eyJhbGci..."
```

## 🔄 Flujo completo: Usuario nuevo

### 1. Usuario llena formulario de registro
```html
<form action="/api/register" method="POST">
  <input name="username" type="text" />    <!-- ej: "juan" -->
  <input name="email" type="email" />      <!-- ej: "juan@example.com" -->
  <input name="password" type="password" /> <!-- ej: "1234" -->
  <button type="submit">Registrarse</button>
</form>
```

### 2. Backend procesa registro
```javascript
// POST /api/register
async function register(req, res) {
  const { username, email, password } = req.body;
  
  // Validar que no exista
  const usuarioExistente = await supabase
    .from('users')
    .select('*')
    .eq('username', username);
  
  // Encriptar password
  const hashPassword = await bcryptjs.hash(password, salt);
  // Resultado: "$2b$10$..." (hash irreversible)
  
  // Guardar en BD
  await supabase.from('users').insert([{
    username: "juan",
    email: "juan@example.com",
    password: "$2b$10$..." // NUNCA el password original
  }]);
}
```

### 3. En Supabase se guarda
```sql
SELECT * FROM users;

| id | username | email              | password                              |
|----|----------|-------------------|---------------------------------------|
| 1  | juan     | juan@example.com  | $2b$10$n2eK3p7Q9x...                 |
```

## 🔄 Flujo completo: Usuario login

### 1. Usuario llena formulario de login
```html
<form action="/api/login" method="POST">
  <input name="username" type="text" />    <!-- ej: "juan" -->
  <input name="password" type="password" /> <!-- ej: "1234" -->
  <button type="submit">Iniciar sesión</button>
</form>
```

### 2. Backend verifica credenciales
```javascript
// POST /api/login
async function login(req, res) {
  const { username, password } = req.body;
  
  // Buscar usuario en BD
  const usuarioDB = await supabase
    .from('users')
    .select('*')
    .eq('username', 'juan')
    .single();
  // Resultado: { id: 1, username: "juan", email: "...", password: "$2b$10$..." }
  
  // Comparar password (bcryptjs convierte "1234" a hash y lo compara)
  const valido = await bcryptjs.compare("1234", usuarioDB.password);
  // Resultado: true o false
}
```

### 3. Backend genera JWT y cookie
```javascript
// Si la contraseña es válida:
const token = jsonwebtoken.sign(
  { username: "juan" },
  "mi_clave_extra_secreta",
  { expiresIn: "7d" }
);
// Resultado: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Impybo9n..."

// Guardar en cookie
res.cookie("jwt", token, { expires: new Date(...), path: "/" });
```

### 4. El navegador guarda la cookie
```
Cookies almacenadas en el navegador:
├── jwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoianVhbiJ9.abc123..."
├── otros: ...
```

### 5. Cada request siguiente incluye la cookie automáticamente
```
GET /home
Headers:
  Cookie: jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🚨 Seguridad importante

### ✅ Lo que tu proyecto hace bien:
- Las contraseñas se encriptan con bcryptjs (irreversible)
- El JWT se firma con una clave secreta
- El JWT tiene tiempo de expiración

### ⚠️ Lo que podrías mejorar:
- Cambiar `JWT_SECRET` a una clave más larga y aleatoria
- Usar `httpOnly: true` en cookies (protege contra XSS)
- Implementar CSRF tokens para formularios
- Configurar RLS en Supabase
- Usar HTTPS en producción

### Ejemplo mejorado de cookie:
```javascript
const cookieOptions = {
  httpOnly: true,        // No accesible desde JavaScript
  secure: true,          // Solo HTTPS en producción
  sameSite: 'strict',    // Protege contra CSRF
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
}
res.cookie("jwt", token, cookieOptions);
```

## 📊 Diagrama de seguridad

```
CLIENTE (Navegador)                    SERVIDOR
     │                                    │
     │──── POST /api/register ──→         │
     │                              Guarda en Supabase:
     │                              { user, email, hash(password) }
     │                                    │
     │←──── Redirect a /login ────        │
     │                                    │
     │──── POST /api/login ──→            │
     │     (user, password)          Verifica en Supabase
     │                              Compara: bcryptjs.compare()
     │                                    │
     │                          Crea JWT y firma:
     │                          sign({ user }, SECRET)
     │                                    │
     │←──── Set-Cookie: jwt=... ──       │
     │                                    │
     │ Guarda cookie en navegador         │
     │                                    │
     │──── GET /home ──→                  │
     │     Cookie: jwt=...           Middleware verifica:
     │                              verify(token, SECRET)
     │                                    │
     │←──── Acceso permitido ──           │
```

## 🧪 Cómo verificar que funciona

### 1. Abre DevTools del navegador (F12)
### 2. Ve a Application → Cookies
### 3. Después de login, deberías ver:
```
Name: jwt
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Domain: localhost
Path: /
Expires: [fecha]
```

### 4. Para decodificar un JWT (sin verificar):
1. Ve a [jwt.io](https://jwt.io)
2. Copia el token en "Encoded"
3. Verás el contenido en "Decoded"
4. ⚠️ Esto es solo lectura, no valida la firma

## ❓ Preguntas frecuentes

**P: ¿Qué pasa si alguien falsifica un JWT?**
R: El servidor verifica la firma con `JWT_SECRET`. Si alguien cambia el contenido, la firma no coincide y el token se rechaza.

**P: ¿Qué pasa si alguien roba una cookie?**
R: Tendrá acceso a la sesión de ese usuario. Por eso debes:
- Usar HTTPS para encriptar en tránsito
- Usar `httpOnly: true` para proteger contra JavaScript
- Usar tiempos de expiración cortos

**P: ¿Por cuánto tiempo es válido el JWT?**
R: 7 días (`JWT_EXPIRES_IN=7d`). Después, el usuario debe hacer login de nuevo.

**P: ¿Puedo usar JWT sin cookies?**
R: Sí, podrías almacenarlo en localStorage. Pero es menos seguro contra XSS.
```

¿Tienes preguntas sobre JWT o cookies?

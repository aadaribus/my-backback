# ✅ Checklist: Integración de Supabase - Paso a Paso

## 📋 Verificación inicial

- [x] `@supabase/supabase-js` instalado
- [x] `app/config/supabase.js` creado
- [x] `app/controllers/authentication.controller.js` actualizado
- [x] `.env` configurado con credenciales de Supabase
- [x] Documentación creada

## 🔧 Tu próxima tarea (IMPORTANTE)

### Paso 1: Crear la tabla en Supabase ⚡
**ESTO ES OBLIGATORIO PARA QUE TU APP FUNCIONE**

1. Abre [supabase.com](https://supabase.com)
2. Accede a tu proyecto
3. Ve a **SQL Editor** (lado izquierdo)
4. Haz clic en **New Query**
5. Copia y pega esto:
```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```
6. Presiona **RUN** (botón azul)

**✅ Resultado esperado:** "Success. No rows returned"

### Paso 2: Verifica que la tabla se creó
1. Ve a **Table Editor** (lado izquierdo)
2. Deberías ver la tabla `users` en la lista

### Paso 3: Desactiva RLS (solo para desarrollo)
1. Ve a **Authentication** → **Policies**
2. Si dice "RLS enabled", presiona **Disable RLS**
3. Confirma (esto permite que tu app inserte datos)

**⚠️ En producción, necesitarás políticas de seguridad adecuadas**

### Paso 4: Prueba tu app
1. Abre terminal en tu proyecto
2. Ejecuta:
```bash
npm run dev
```
3. Abre navegador: `http://localhost:40000/register`
4. Crea un nuevo usuario:
   - User: `testuser`
   - Email: `test@example.com`
   - Password: `1234`
5. Presiona "Registrarse"

### Paso 5: Verifica que se guardó
1. Vuelve a Supabase
2. Ve a **Table Editor** → **users**
3. Deberías ver tu usuario registrado:
   ```
   | id | username | email            | password           | created_at     |
   |----|----------|------------------|--------------------|----------------|
   | 1  | testuser | test@example.com | $2b$10$n2eK3p7... | 2026-05-09...  |
   ```

### Paso 6: Prueba login
1. En navegador: `http://localhost:40000/`
2. Usa las credenciales:
   - User: `testuser`
   - Password: `1234`
3. Presiona "Iniciar sesión"
4. Deberías redireccionar a `/home`

## 🐛 Si algo no funciona...

### Error: "PKEY not found" o "relation does not exist"
**Causa:** La tabla `users` no fue creada
**Solución:** Ve a Paso 1 y crea la tabla nuevamente

### Error: "SUPABASE_URL not found"
**Causa:** Faltan variables en `.env`
**Solución:** 
1. Abre `.env`
2. Verifica que tenga:
   ```
   SUPABASE_URL=https://ttakczikswzfpiguwjlf.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Guarda el archivo
4. Reinicia el servidor

### Error: "Database connection refused"
**Causa:** Las credenciales son incorrectas o Supabase está caído
**Solución:**
1. Ve a Supabase Dashboard
2. Abre Settings → API
3. Copia nuevamente:
   - URL
   - Anon public key
4. Actualiza `.env`
5. Reinicia servidor

### Login no funciona pero registro sí
**Causa:** Contraseña encriptada no coincide
**Solución:** Crea un usuario nuevo y prueba

### No veo la cookie en el navegador
**Causa:** Las cookies pueden estar deshabilitadas o ser httpOnly
**Solución:**
1. Abre DevTools (F12)
2. Ve a **Application** → **Cookies**
3. Deberías ver `jwt` ahí

## 📚 Documentación disponible

He creado varios archivos para ayudarte:

1. **SUPABASE_SETUP.md** - Instrucciones detalladas de Supabase
2. **RESUMEN_CAMBIOS.md** - Resumen de todos los cambios realizados
3. **JWT_Y_COOKIES.md** - Explicación de cómo funciona la autenticación
4. **app/config/supabase-examples.js** - Ejemplos de consultas a Supabase

## 🎯 Próximas expansiones (opcionales)

Una vez que el login/registro funcione, puedes agregar:

- [ ] Tabla de `materias` para cursos
- [ ] Tabla de `asignaciones` para tareas
- [ ] Subir fotos de perfil (Supabase Storage)
- [ ] Editar perfil del usuario
- [ ] Cambiar contraseña
- [ ] Recuperar contraseña
- [ ] Dashboard de materias y asignaciones

## 💡 Tips

- **No compartas `.env` en repositorios públicos** - Contains secrets
- **Para producción:** Usa variables de entorno seguras en tu host
- **Backup:** Supabase automáticamente hace backups diarios
- **Modo offline:** El código que escribiste fallará sin internet, considera agregar mensajes de error amigables

## 🚀 Resumen ejecutivo

| Tarea | Estado |
|-------|--------|
| Instalar dependencias | ✅ |
| Crear config de Supabase | ✅ |
| Actualizar authentication | ✅ |
| Configurar .env | ✅ |
| **CREAR TABLA EN SUPABASE** | ⏳ **TÚ DEBES HACER ESTO** |
| Probar registro | ⏳ Después del paso anterior |
| Probar login | ⏳ Después del paso anterior |
| Desplegar a producción | 📅 Futuro |

---

**¿Necesitas ayuda?**
Si tienes error en algún paso, copia el mensaje de error completo y pregúntame. 

¡Adelante! 🚀

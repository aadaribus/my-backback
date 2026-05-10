# Configuración de Supabase para Mi Mochila

## Cambios realizados

✅ Se ha integrado **@supabase/supabase-js** en el proyecto
✅ Archivo de configuración creado: `app/config/supabase.js`
✅ Controlador de autenticación actualizado para usar Supabase
✅ Variables de entorno configuradas en `.env`

## Próximos pasos: Crear la tabla de usuarios en Supabase

Debes crear una tabla llamada `users` en tu proyecto de Supabase. Sigue estos pasos:

### 1. Abre Supabase Dashboard
- Ve a [supabase.com](https://supabase.com) y accede a tu cuenta
- Abre tu proyecto "Mi Mochila"

### 2. Crea la tabla `users`
- En el menú izquierdo, haz clic en **SQL Editor**
- Haz clic en **New Query**
- Copia y pega el siguiente SQL:

```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para búsquedas rápidas
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

- Haz clic en **Run** (botón azul)

### 3. Verifica los permisos (RLS - Row Level Security)
- Ve a **Authentication** > **Policies**
- Por ahora, para desarrollo, puedes desactivar RLS o configurar permisos específicos
- En un ambiente de producción, debes configurar políticas de seguridad adecuadas

### 4. Prueba la conexión
- Inicia el servidor con: `npm run dev`
- Intenta registrar un nuevo usuario desde el formulario
- Intenta iniciar sesión con las credenciales

## Estructura de la tabla

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | BIGSERIAL | ID único del usuario (auto-incremento) |
| username | VARCHAR | Nombre de usuario (único) |
| email | VARCHAR | Email del usuario (único) |
| password | VARCHAR | Contraseña encriptada con bcryptjs |
| created_at | TIMESTAMP | Fecha de creación del usuario |

## Notas importantes

- Las contraseñas se encriptan con **bcryptjs** antes de guardar en la BD
- El campo `user` debe ser único para evitar usuarios duplicados
- El campo `email` también debe ser único
- Los JWT se generan en el servidor y se guardan en cookies

## Troubleshooting

Si ves errores como "PKEY not found" o "relation does not exist":
1. Verifica que la tabla `users` se haya creado correctamente
2. Revisa los logs en la consola del servidor
3. Asegúrate de que SUPABASE_URL y SUPABASE_ANON_KEY están correctas en `.env`

¿Necesitas ayuda con alguno de estos pasos?

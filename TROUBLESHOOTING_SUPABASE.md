# 🔧 SOLUCIÓN DE PROBLEMAS - Conexión a Supabase

## ¿Por qué no me conecta a Supabase?

Aquí está el flujo de diagnóstico paso a paso:

---

## 1️⃣ VERIFICAR CREDENCIALES EN `.env`

**Archivo:** `c:\Users\AADARIBUS\Desktop\Mi mochila\.env`

```env
SUPABASE_URL=https://ttakczikswzfpiguwjlf.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIs...
```

### ✅ Lo que debe tener:
- `SUPABASE_URL` debe comenzar con `https://` y terminar con `.supabase.co`
- `SUPABASE_ANON_KEY` debe ser una cadena larga (mínimo 100+ caracteres)
- NO debe tener espacios extras o comillas

### ❌ Errores comunes:
```env
# ❌ INCORRECTO - espacios extras
SUPABASE_URL = https://...

# ❌ INCORRECTO - con comillas
SUPABASE_URL="https://..."

# ❌ INCORRECTO - URL incompleta
SUPABASE_URL=https://ttakczikswzfpiguwjlf

# ✅ CORRECTO
SUPABASE_URL=https://ttakczikswzfpiguwjlf.supabase.co
```

---

## 2️⃣ VERIFICAR EN SUPABASE DASHBOARD

### Paso A: Obtener URL del Proyecto
1. Abre https://supabase.com
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto
4. Ve a **Settings > API**
5. Copia **Project URL**
   ```
   https://ttakczikswzfpiguwjlf.supabase.co
   ```

### Paso B: Obtener ANON KEY
1. En la misma página **Settings > API**
2. Busca **Project API keys**
3. Copia la clave **anon public** (la primera)
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
   ```

### ⚠️ NO uses la clave `service_role` - es solo para backend seguro

---

## 3️⃣ VERIFICAR TABLA `users` EXISTE

En Supabase Dashboard:
1. Ve a **SQL Editor**
2. Ejecuta esta query:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

Debe salir una lista con `users`. Si no aparece, crea la tabla:

```sql
create table public.users (
  id bigserial not null,
  username character varying(255) not null,
  email character varying(255) not null,
  password character varying(255) not null,
  role text not null default 'user'::text,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email),
  constraint users_username_key unique (username)
) TABLESPACE pg_default;

create index IF not exists idx_users_username on public.users using btree (username) TABLESPACE pg_default;
create index IF not exists idx_users_email on public.users using btree (email) TABLESPACE pg_default;
create index IF not exists idx_users_role on public.users using btree (role) TABLESPACE pg_default;
```

---

## 4️⃣ VERIFICAR RLS (Row Level Security)

⚠️ **IMPORTANTE**: El RLS puede bloquear acceso anónimo

En Supabase Dashboard:
1. Ve a **Authentication > Policies**
2. Selecciona tabla **users**
3. Si ves políticas restrictivas, desactívalas TEMPORALMENTE:

```sql
-- Ver políticas actuales
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Desactivar RLS temporalmente (solo para desarrollo)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```

Después, crea políticas permisivas:

```sql
-- Permitir lectura a usuarios anónimos
CREATE POLICY "Allow anonymous read on users" ON public.users
FOR SELECT USING (true);

-- Permitir insert a usuarios anónimos
CREATE POLICY "Allow anonymous insert on users" ON public.users
FOR INSERT WITH CHECK (true);
```

---

## 5️⃣ EJECUTAR DIAGNÓSTICO

En tu terminal:
```bash
cd c:\Users\AADARIBUS\Desktop\Mi mochila
node diagnostic.js
```

Esto verifica:
- ✅ Archivo `.env` existe
- ✅ Variables están configuradas
- ✅ Credenciales son válidas
- ✅ Conexión a Supabase funciona
- ✅ Tabla `users` es accesible

---

## 6️⃣ PRUEBA DE CONEXIÓN EN TU APP

### Opción A: Endpoint automático
1. Inicia tu servidor: `npm run dev`
2. Abre en navegador: `http://localhost:10000/ping-supabase`

Deberías ver:
```json
{
  "status": "✅ CONEXIÓN EXITOSA",
  "message": "Conexión a Supabase funcionando correctamente",
  "supabaseUrl": "https://ttakczikswzfpiguwjlf.supabase.co",
  "userCount": 0
}
```

---

## 🚨 ERRORES COMUNES Y SOLUCIONES

### Error: "SUPABASE_URL not found"
```
❌ Variables de Supabase no están definidas
```
**Solución:** 
- Verifica que `.env` exista en la raíz del proyecto
- Reinicia el servidor después de editar `.env`

---

### Error: "Invalid request headers"
```
❌ SUPABASE_ANON_KEY inválida
```
**Solución:**
- Copia exactamente la clave desde Supabase Dashboard
- Asegúrate que sea la clave **anon public**, no `service_role`

---

### Error: "Relation 'public.users' does not exist"
```
❌ La tabla users no existe
```
**Solución:**
- Crea la tabla usando el script SQL arriba
- O copia la query exacta desde [SUPABASE_SETUP.md](SUPABASE_SETUP.md)

---

### Error: "new row violates row-level security policy"
```
❌ RLS bloqueando acceso
```
**Solución:**
1. Ve a Supabase > Authentication > Policies
2. Desactiva RLS temporalmente: `ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;`
3. O agrega política permisiva (ver arriba)

---

### Error: "relation 'users' does not exist"
```
❌ Tabla en schema incorrecto
```
**Verificar:**
```sql
-- Debe estar en 'public' schema
SELECT * FROM information_schema.tables 
WHERE table_name = 'users';
```

---

## ✅ CHECKLIST FINAL

- [ ] Archivo `.env` existe en raíz del proyecto
- [ ] `SUPABASE_URL` copiado correctamente desde Dashboard
- [ ] `SUPABASE_ANON_KEY` copiado correctamente (anon public, no service_role)
- [ ] Tabla `users` existe en Supabase
- [ ] RLS está desactivado O tienes políticas permisivas
- [ ] Servidor reiniciado después de cambiar `.env`
- [ ] Endpoint `/ping-supabase` devuelve "✅ CONEXIÓN EXITOSA"

---

## 📞 INFORMACIÓN DE CONTACTO

Si todavía no funciona, ejecuta en terminal:
```bash
npm run dev > server-log.txt 2>&1
```

Y copia los primeros 50 líneas del log que aparece en la terminal.

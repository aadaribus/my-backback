# 🚀 CONFIGURACIÓN DE VARIABLES EN RENDER

## El Problema:

Tu aplicación está en **Render** y el error es:
```
Error: secretOrPrivateKey must have a value
```

Esto ocurre porque `JWT_SECRET` no está configurado en Render. En Render, **NO se usan archivos `.env`**, las variables se configuran en el **Dashboard**.

---

## ✅ SOLUCIÓN: Configurar Variables en Render

### Paso 1: Ir al Dashboard de Render
1. Abre https://dashboard.render.com
2. Selecciona tu **Service/Proyecto**
3. Ve a **Settings**

### Paso 2: Agregar Environment Variables
1. Ve a la sección **Environment**
2. Haz click en **Add Environment Variable**
3. Agrega estas variables (una por una):

#### 🔑 JWT Variables
```
Key: JWT_SECRET
Value: mi_clave_extra_secreta
```

```
Key: JWT_EXPIRES_IN
Value: 7d
```

```
Key: JWT_COOKIE_EXPIRES
Value: 1
```

#### 🛢️ Supabase Variables
```
Key: SUPABASE_URL
Value: https://ttakczikswzfpiguwjlf.supabase.co
```

```
Key: SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0YWtjemlrc3d6ZnBpZ3V3amxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNjE3NTEsImV4cCI6MjA5MzkzNzc1MX0.IQ6TfglMNYLgV8fTrGFUH2rokg738UELquC-VZSq_-U
```

#### ⚙️ Node Variables (opcional)
```
Key: NODE_ENV
Value: production
```

---

### Paso 3: Deploy

Después de agregar las variables:
1. Ve a **Deployments**
2. Haz click en **Redeploy Latest**
3. Espera a que se complete (mostrará "Deploy successful")

---

## ✅ Verificar que Funcione

1. Abre tu aplicación en Render
2. Intenta **registrar** un usuario
3. Intenta **iniciar sesión**
4. Deberías ver el log:
   ```
   [✅ LOGIN EXITOSO] usuario 2026-05-20T...
   ```

---

## 📋 Checklist Final

- [ ] He ido a Render Dashboard > Settings
- [ ] He agregado `JWT_SECRET`
- [ ] He agregado `JWT_EXPIRES_IN`
- [ ] He agregado `JWT_COOKIE_EXPIRES`
- [ ] He agregado `SUPABASE_URL`
- [ ] He agregado `SUPABASE_ANON_KEY`
- [ ] He hecho Deploy (Redeploy Latest)
- [ ] El login funciona correctamente ✅

---

## 🆘 Si Sigue Sin Funcionar

Ejecuta en Render Shell (Settings > Shell):
```bash
echo $JWT_SECRET
echo $SUPABASE_URL
```

Si ambas están vacías, vuelve a agregar las variables y redeploy.

Si mostran valores, reinicia el service:
- Ve a **Deployments**
- Click en **Suspend** y luego **Resume**

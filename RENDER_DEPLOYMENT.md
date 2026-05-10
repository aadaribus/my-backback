# Guía de Deployment en Render.com

## Requisitos Previos
✅ Proyecto en GitHub (público o privado)
✅ Cuenta en [render.com](https://render.com)
✅ Variables de entorno listas

---

## Pasos para Deployar

### 1. Pushea tu código a GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Accede a Render.com
- Ve a [https://dashboard.render.com](https://dashboard.render.com)
- Inicia sesión con tu cuenta

### 3. Crea un nuevo Web Service
- Haz clic en **New +**
- Selecciona **Web Service**
- Conecta tu repositorio de GitHub

### 4. Configura el Servicio
Completa los siguientes campos:

| Campo | Valor |
|-------|-------|
| **Name** | mi-mochila |
| **Environment** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | Free |
| **Region** | Cualquier región cercana |

### 5. Configura Variables de Entorno
En la sección **Environment Variables**, añade:

```env
JWT_SECRET=mi_clave_extra_secreta
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES=1
SUPABASE_URL=https://ttakczikswzfpiguwjlf.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0YWtjemlrc3d6ZnBpZ3V3amxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNjE3NTEsImV4cCI6MjA5MzkzNzc1MX0.IQ6TfglMNYLgV8fTrGFUH2rokg738UELquC-VZSq_-U
```

### 6. Haz clic en **Create Web Service**

---

## Después del Deploy

### 🟢 Estado Activo
- Tu aplicación estará disponible en: `https://mi-mochila.onrender.com`
- El plan gratuito puede tener "cold starts" (1er acceso lento)

### ⚠️ Si Render muestra errores

Verifica en **Logs**:
```bash
# Debe mostrar algo como:
# ✅ Conexión a Supabase inicializada correctamente
# servidor corriendo en puerto 10000
```

### 🔄 Auto-Deployment
- Cada push a `main` en GitHub dispara un nuevo deploy automáticamente

---

## Troubleshooting

### Puerto en Render
Render asigna puertos dinámicos. El código ya soporta esto:
```javascript
const PORT = process.env.PORT || 40000;
```

### Supabase CORS (si tienes problemas)
En Render, el dominio será: `https://mi-mochila.onrender.com`

Añádelo en Supabase Dashboard:
1. Ve a **Project Settings** → **API**
2. En **CORS Configuration**, añade: `https://mi-mochila.onrender.com`

---

## Información de Render Plan Gratuito

| Característica | Límite |
|---|---|
| Uptime | ~99% |
| CPU | Compartido |
| RAM | 0.5GB |
| Cold starts | Sí (después de 15 min inactividad) |
| Costo | **Gratis** ✅ |

---

## Para Producción
Si necesitas eliminar cold starts:
- **Render Pro**: $7/mes (recomendado para apps reales)
- **Railway.app**: Alternativa más barata ($5 créditos mensuales)


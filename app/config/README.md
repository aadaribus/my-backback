# 🔧 Carpeta Config - Configuración de Supabase v2.0

**Última actualización:** 3 de junio de 2026  
**Versión:** 2.0

---

## 📁 Archivos en esta Carpeta

### `supabase.js` (Requerido)
**Propósito:** Cliente principal de Supabase  
**Qué hace:**
- Carga las variables de ambiente (.env)
- Crea el cliente de Supabase
- Valida que SUPABASE_URL y SUPABASE_ANON_KEY estén configuradas
- Exporta el cliente para usar en toda la app

**Uso:**
```javascript
import { supabase } from './config/supabase.js';

// Usar supabase en cualquier archivo
const { data, error } = await supabase.from('tabla').select('*');
```

---

### `supabase-examples-v2.js` (Referencia)
**Propósito:** Ejemplos de uso de todas las funcionalidades  
**Qué contiene:**
- Ejemplos para PROFILEDATE (perfil)
- Ejemplos para MATERIALUSER (materias)
- Ejemplos para BOOKDIGITAL (cuaderno)
- Ejemplos para BOOKHISTORY (historial)
- Ejemplos para GRUPPRO (grupos)
- Ejemplos para TAREAPRO (tareas)
- Flujo completo de uso

**Cómo usarlo:**
```javascript
import examples from './config/supabase-examples-v2.js';

// Ejecutar un ejemplo
examples.ejemploCrearMateria();
```

---

### `init-config.js` (Inicialización)
**Propósito:** Verificar que todo está configurado correctamente  
**Qué hace:**
- ✅ Verifica variables de ambiente
- ✅ Verifica que las tablas de Supabase existan
- ✅ Verifica autenticación
- ✅ Muestra información de configuración
- ✅ Proporciona documentación

**Cómo usarlo:**
```javascript
import { inicializarApp, mostrarDocumentacion } from './config/init-config.js';

// Al iniciar la app
const resultado = await inicializarApp();
if (!resultado.listo) {
    console.error('Falta configurar algo');
}

// Ver documentación
mostrarDocumentacion();
```

---

## ⚙️ Configuración Requerida

### 1. Archivo `.env` (Desarrollo)

Crea un archivo `.env` en la raíz del proyecto con:

```env
# Supabase
SUPABASE_URL=https://ttakczikswzfpiguwjlf.supabase.co
SUPABASE_ANON_KEY=tu_clave_anonima_aqui

# Server
PORT=10000
NODE_ENV=development
```

**¿Dónde obtener las claves?**
1. Ve a https://app.supabase.com
2. Selecciona tu proyecto
3. Settings → API → Project URL (SUPABASE_URL)
4. Settings → API → anon public (SUPABASE_ANON_KEY)

### 2. Configuración en Render (Producción)

En el panel de Render:
1. Ve a tu Render Web Service
2. Settings → Environment
3. Agrega las mismas variables (sin el archivo .env)

```
SUPABASE_URL=https://ttakczikswzfpiguwjlf.supabase.co
SUPABASE_ANON_KEY=tu_clave_anonima_aqui
PORT=10000
NODE_ENV=production
```

---

## 🗄️ Tablas de Supabase Requeridas

Todas estas tablas **DEBEN** existir en Supabase para que la app funcione:

| Tabla | Descripción | Campos Principales |
|-------|------------|-------------------|
| **profiledate** | Perfil del usuario | namecomplet, usermail, userfone, useruni |
| **materialuser** | Materias/Asignaturas | admaterial, nameprof, horauser, descriptionmateria |
| **bookdigital** | Cuaderno digital | texmaterial, imagmaterial[], vozmaterial[], moviematerial[] |
| **bookhistory** | Historial (solo lectura) | (igual a bookdigital) |
| **gruppro** | Grupos de estudio | grupname, grupdecription, grupmail |
| **tareapro** | Tareas | tareaname, tareadescription, datetarea, imagentarea |

**¿Cómo crear las tablas?**

1. Abre Supabase SQL Editor
2. Copia el contenido de: `SUPABASE_NUEVAS_TABLAS.sql`
3. Pega en SQL Editor
4. Click "RUN"

```sql
-- Ejecuta el SQL para crear todas las tablas
-- Ver: SUPABASE_NUEVAS_TABLAS.sql
```

---

## 🔐 Seguridad - Row Level Security (RLS)

**IMPORTANTE:** Todas las tablas DEBEN tener RLS habilitado.

Esto asegura que:
- Usuario A solo ve sus datos
- Usuario B solo ve sus datos
- Es imposible acceder a datos de otros usuarios

El archivo SQL (`SUPABASE_NUEVAS_TABLAS.sql`) incluye todas las políticas necesarias.

---

## 📖 Importar Supabase en tu Código

### En Backend (Node.js)

```javascript
// En app/index.js o cualquier controlador
import { supabase } from './config/supabase.js';

// Usar Supabase
const { data, error } = await supabase
    .from('profiledate')
    .select('*')
    .single();
```

### En Frontend (JavaScript Vanilla)

El frontend hace fetch() a los endpoints API, no usa supabase directamente.

```javascript
// En app/public/home-new.js
const response = await fetch('/api/profiledate', {
    method: 'GET',
    credentials: 'include' // Para enviar JWT
});
```

---

## 🧪 Verificar Configuración

### Opción 1: Script de Validación

```bash
npm run validate
# Verifica que todos los archivos existan
```

### Opción 2: Inicializar App

En `app/index.js`:

```javascript
import { inicializarApp } from './config/init-config.js';

// Al iniciar
const config = await inicializarApp();

if (!config.listo) {
    console.error('❌ Falta configurar');
    process.exit(1);
}
```

### Opción 3: Manual

1. Verifica que `.env` existe
2. Verifica que SUPABASE_URL está configurada
3. Verifica que SUPABASE_ANON_KEY está configurada
4. Verifica que las 6 tablas existen en Supabase
5. Intenta login

---

## 🐛 Solución de Problemas

### "ERROR: SUPABASE_URL no configurada"
```bash
# Solución:
1. Crea archivo .env
2. Agrega SUPABASE_URL
3. Reinicia: npm start
```

### "ERROR: SUPABASE_ANON_KEY no configurada"
```bash
# Solución:
1. Abre .env
2. Agrega SUPABASE_ANON_KEY
3. Copia la key correcta de Supabase
4. Reinicia: npm start
```

### "ERROR: Tabla 'profiledate' no existe"
```bash
# Solución:
1. Abre Supabase SQL Editor
2. Copia: SUPABASE_NUEVAS_TABLAS.sql
3. Pega y ejecuta
4. Reinicia app: npm start
```

### "ERROR 401 No autenticado"
```bash
# Solución:
1. Verifica que estés logged in
2. Verifica que JWT se guarda en cookies
3. Refresca: F5
4. Intenta login nuevamente
```

---

## 📊 Arquitectura de Configuración

```
app/config/
├── supabase.js                 ← Cliente de Supabase
├── supabase-examples-v2.js     ← Ejemplos de uso
└── init-config.js              ← Inicialización y verificación

app/controllers/
├── profiledate.controller.js
├── materialuser.controller.js
├── bookdigital.controller.js
├── gruppro.controller.js
└── tareapro.controller.js

app/index.js                    ← Usa supabase.js
├── Importa: supabase client
├── Importa: todos los controllers
└── Registra: todas las rutas
```

---

## 🚀 Flujo de Inicialización

```
npm start
    ↓
app/index.js se carga
    ↓
supabase.js se ejecuta
    ├── Lee .env
    ├── Valida SUPABASE_URL
    ├── Valida SUPABASE_ANON_KEY
    └── Crea cliente de Supabase
    ↓
Controladores se cargan
    ├── Importan supabase
    ├── Registran rutas
    └── Listo para recibir requests
    ↓
Servidor inicia en puerto 10000
    ↓
✅ App lista en http://localhost:10000
```

---

## 📝 Checklist de Configuración

- [ ] Archivo `.env` creado en raíz
- [ ] SUPABASE_URL configurada
- [ ] SUPABASE_ANON_KEY configurada
- [ ] 6 tablas creadas en Supabase
- [ ] RLS habilitado en todas las tablas
- [ ] npm start se ejecuta sin errores
- [ ] Conexión a Supabase exitosa
- [ ] Puedes hacer login

---

## 💾 Variables de Ambiente Disponibles

| Variable | Requerida | Ejemplo | Dónde |
|----------|-----------|---------|-------|
| SUPABASE_URL | ✅ Sí | https://xxx.supabase.co | .env o Render |
| SUPABASE_ANON_KEY | ✅ Sí | eyJxx... | .env o Render |
| PORT | ❌ No | 10000 | .env o Render |
| NODE_ENV | ❌ No | development | .env o Render |

---

## 🔗 Referencias Relacionadas

- **SQL Schema:** `SUPABASE_NUEVAS_TABLAS.sql`
- **API Reference:** `ENDPOINTS_API_v2.md`
- **Implementation Guide:** `GUIA_IMPLEMENTACION_NUEVAS_TABLAS.md`
- **Code Examples:** `supabase-examples-v2.js`

---

## ✅ Estado de Configuración

| Componente | Estado | Detalles |
|------------|--------|----------|
| supabase.js | ✅ Completo | Cliente funcional |
| supabase-examples-v2.js | ✅ Completo | Todos los ejemplos |
| init-config.js | ✅ Completo | Validación + documentación |
| .env | ⏳ Pendiente | Usuario debe crear |
| Supabase Tables | ⏳ Pendiente | Usuario debe ejecutar SQL |

---

**Versión:** 2.0  
**Última actualización:** 3 de junio de 2026  
**Creado por:** GitHub Copilot  
**Estado:** ✅ LISTO PARA USAR

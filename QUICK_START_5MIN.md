# ⚡ GUÍA RÁPIDA - 5 MINUTOS

**Para usuarios que quieren comenzar AHORA mismo**

---

## 🚀 PASO 1: Base de Datos (2 minutos)

```
1. Abre: https://app.supabase.com
2. Proyecto: ttakczikswzfpiguwjlf
3. Click: "SQL Editor" (arriba a la izquierda)
4. Click: "New query"
5. Abre: SUPABASE_NUEVAS_TABLAS.sql (en la carpeta)
6. Copia TODO el contenido
7. Pega en SQL Editor
8. Click: "RUN" (botón azul)
✅ Esperado: "Ejecutado exitosamente"
```

---

## 🚀 PASO 2: Frontend (1 minuto)

**Opción A: Renombrar archivos**
```
Carpeta: app/page/home/
Renombra: home.html → home-old.html
Renombra: home-new.html → home.html

Carpeta: app/public/
Renombra: home.js → home-old.js
Renombra: home-new.js → home.js
```

**Opción B: Cambiar link en código**
```javascript
// Abre: app/index.js
// Busca: res.sendFile(__dirname + "/page/home/home.html")
// Cambia a: res.sendFile(__dirname + "/page/home/home-new.html")
```

---

## 🚀 PASO 3: Iniciar (1 minuto)

```bash
# En terminal (PowerShell)
npm start

# Esperado:
# ✅ CONEXIÓN A SUPABASE: EXITOSA
# ✅ Servidor en puerto 10000
```

---

## 🚀 PASO 4: Probar (1 minuto)

```
1. Abre navegador: http://localhost:10000
2. Haz login
3. Click: Perfil → Llenar → Guardar
4. Click: Agregar Materia → Crear
5. Click: Icono Cuaderno (arriba a la derecha)
6. Selecciona: Materia → Escribe algo
7. Click: "📷 Cámara" → Permitir → Capturar
8. Click: "Guardar en Historial"
✅ ¡FUNCIONA!
```

---

## 🚀 PASO 5: Ver Historial (sin editar)

```
1. Click: Historial
2. Verás las notas guardadas
3. Click en una nota: Ver contenido
4. Intentar editar: ❌ No se puede (es solo lectura)
✅ PERFECTO!
```

---

## ⚠️ SI ALGO FALLA

### "Tabla no existe"
→ Ejecuta SQL nuevamente

### "Cámara no funciona"  
→ Chrome: ⚙️ → Privacidad → Cámara → Permitir

### "No puedo hacer login"
→ Usa el usuario de prueba que ya creaste

### "¿Qué hacer?"
→ Lee: RESUMEN_CAMBIOS_v2.md

---

## 📚 SIGUIENTE LECTURA

✅ Todo funciona → Leer: [ENDPOINTS_API_v2.md](ENDPOINTS_API_v2.md)  
❌ Algo falla → Leer: [GUIA_IMPLEMENTACION_NUEVAS_TABLAS.md](GUIA_IMPLEMENTACION_NUEVAS_TABLAS.md)  
❓ Tengo dudas → Leer: [RESUMEN_CAMBIOS_v2.md](RESUMEN_CAMBIOS_v2.md)  

---

**¡Ya está! El proyecto está listo para usar.** 🎉

// Obtener formulario
const form = document.getElementById("login-form");
const mensajeError = document.querySelector(".error");

// Limpiar formulario al cargar la página
function limpiarFormulario() {
  form.reset();
  if (mensajeError) {
    mensajeError.classList.add("escondido");
  }
}

// Ejecutar limpiar formulario cuando la página carga
document.addEventListener("DOMContentLoaded", limpiarFormulario);

// Manejar envío del formulario
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Obtener valores del formulario
  const username = document.getElementById("user").value.trim();
  const password = document.getElementById("password").value.trim();

  // Validar campos
  if (!username || !password) {
    mostrarError("Por favor completa todos los campos");
    return;
  }

  try {
    // Enviar solicitud al servidor
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
      // Login exitoso
      console.log("✅ Login exitoso:", data.message);
      
      // Redirigir a home después de 500ms
      setTimeout(() => {
        window.location.href = data.redirect || "/home";
      }, 500);
    } else {
      // Login fallido
      console.error("❌ Error en login:", data.error.message);
      mostrarError(data.error.message);
    }
  } catch (error) {
    console.error("Error en la solicitud:", error);
    mostrarError("Error de conexión con el servidor");
  }
});

// Función para mostrar error
function mostrarError(mensaje) {
  if (mensajeError) {
    mensajeError.textContent = mensaje || "Error al iniciar sesión";
    mensajeError.classList.remove("escondido");
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
      mensajeError.classList.add("escondido");
    }, 5000);
  }
}

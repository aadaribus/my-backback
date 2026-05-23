// Obtener elementos del formulario
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

// Prevenir multiple submit
let isSubmitting = false;

// Manejar envío del formulario con mejor UX
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  // Prevenir envíos duplicados
  if (isSubmitting) return;

  // Obtener valores del formulario y hacer trim
  const username = document.getElementById("user").value.trim();
  const password = document.getElementById("password").value.trim();

  // Validar campos
  if (!username || !password) {
    mostrarError("Por favor completa todos los campos");
    return;
  }

  isSubmitting = true;
  const submitBtn = form.querySelector('button[type="submit"]');
  const btnText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = "Iniciando...";

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
      isSubmitting = false;
      submitBtn.disabled = false;
      submitBtn.textContent = btnText;
    }
  } catch (error) {
    console.error("Error en la solicitud:", error);
    mostrarError("Error de conexión con el servidor");
    isSubmitting = false;
    submitBtn.disabled = false;
    submitBtn.textContent = btnText;
  }
});

// Función para mostrar error con mejor accesibilidad
function mostrarError(mensaje) {
  if (mensajeError) {
    mensajeError.textContent = mensaje || "Error al iniciar sesión";
    mensajeError.classList.remove("escondido");
    mensajeError.focus();
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
      mensajeError.classList.add("escondido");
    }, 5000);
  }
}

// Limpiar errores cuando el usuario empieza a escribir
document.getElementById("user").addEventListener("input", () => {
  if (mensajeError && !mensajeError.classList.contains("escondido")) {
    mensajeError.classList.add("escondido");
  }
});

document.getElementById("password").addEventListener("input", () => {
  if (mensajeError && !mensajeError.classList.contains("escondido")) {
    mensajeError.classList.add("escondido");
  }
});

// Toggle password visibility
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.querySelector(".toggle-password");
  const passwordInput = document.getElementById("password");
  const eyeIcon = document.querySelector(".eye-icon");
  const eyeClosedIcon = document.querySelector(".eye-closed-icon");

  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      
      const isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";
      
      // Toggle icons
      if (isPassword) {
        eyeIcon.style.display = "none";
        eyeClosedIcon.style.display = "block";
        toggleBtn.setAttribute("aria-label", "Ocultar contraseña");
      } else {
        eyeIcon.style.display = "block";
        eyeClosedIcon.style.display = "none";
        toggleBtn.setAttribute("aria-label", "Mostrar contraseña");
      }
    });
  }
});

const form = document.getElementById('register-form');
const mensajeError = document.querySelector(".error");

// Prevenir multiple submit
let isSubmitting = false;

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Prevenir envíos duplicados
    if (isSubmitting) return;
    
    // Obtener valores del formulario
    const username = document.getElementById('user').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    
    // Validar campos
    if (!username || !email || !password) {
        mostrarError("Por favor completa todos los campos");
        return;
    }
    
    // Validar que el nombre de usuario tenga al menos 3 caracteres
    if (username.length < 3) {
        mostrarError("El nombre de usuario debe tener al menos 3 caracteres");
        return;
    }
    
    // Validar que la contraseña tenga al menos 6 caracteres
    if (password.length < 6) {
        mostrarError("La contraseña debe tener al menos 6 caracteres");
        return;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        mostrarError("Por favor ingresa un correo válido");
        return;
    }
    
    isSubmitting = true;
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Creando cuenta...";

    try {
        const res = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        });
        
        const resJson = await res.json();
        
        if (res.ok) {
            console.log("✅ Registro exitoso:", resJson.message);
            // Redirigir al login después de 500ms
            setTimeout(() => {
                window.location.href = resJson.redirect || "/";
            }, 500);
        } else {
            console.error("❌ Error en registro:", resJson.error.message);
            mostrarError(resJson.error.message);
            isSubmitting = false;
            submitBtn.disabled = false;
            submitBtn.textContent = btnText;
        }
    } catch (error) {
        console.error('Error en solicitud:', error);
        mostrarError("Error de conexión con el servidor");
        isSubmitting = false;
        submitBtn.disabled = false;
        submitBtn.textContent = btnText;
    }
});

// Función para mostrar error con mejor accesibilidad
function mostrarError(mensaje) {
    if (mensajeError) {
        mensajeError.textContent = mensaje || "Error al crear la cuenta";
        mensajeError.classList.remove("escondido");
        mensajeError.focus();
        
        // Auto-ocultar después de 5 segundos
        setTimeout(() => {
            mensajeError.classList.add("escondido");
        }, 5000);
    }
}

// Limpiar errores cuando el usuario empieza a escribir
document.getElementById('user').addEventListener('input', () => {
    if (mensajeError && !mensajeError.classList.contains("escondido")) {
        mensajeError.classList.add("escondido");
    }
});

document.getElementById('email').addEventListener('input', () => {
    if (mensajeError && !mensajeError.classList.contains("escondido")) {
        mensajeError.classList.add("escondido");
    }
});

document.getElementById('password').addEventListener('input', () => {
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
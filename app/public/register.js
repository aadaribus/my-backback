const form = document.getElementById('register-form');
const mensajeError = document.querySelector(".error");

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Obtener valores del formulario
    const username = document.getElementById('user').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    
    // Validar campos
    if (!username || !email || !password) {
        mostrarError("Por favor completa todos los campos");
        return;
    }
    
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
        }
    } catch (error) {
        console.error('Error en solicitud:', error);
        mostrarError("Error de conexión con el servidor");
    }
});

// Función para mostrar error
function mostrarError(mensaje) {
    if (mensajeError) {
        mensajeError.textContent = mensaje || "Error al crear la cuenta";
        mensajeError.classList.remove("escondido");
        
        // Auto-ocultar después de 5 segundos
        setTimeout(() => {
            mensajeError.classList.add("escondido");
        }, 5000);
    }
}
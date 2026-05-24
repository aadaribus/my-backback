 // Cargar información del usuario
    async function cargarUsuario() {
      try {
        const response = await fetch("/api/usuario");
        if (response.ok) {
          const usuario = await response.json();
          const userNameElement = document.getElementById("user-name");
          if (userNameElement) {
            userNameElement.textContent = usuario.username;
          }
        }
      } catch (error) {
        console.error("Error al cargar usuario:", error);
      }
    }

    document.addEventListener("DOMContentLoaded", cargarUsuario);
const fab = document.getElementById('fab');
const fabMenu = document.getElementById('fabMenu');
const modal = document.getElementById('modal');
const closeBtn = document.getElementById('close');
const formContent = document.getElementById('formContent');

let menuOpen = false;

// Mostrar/ocultar menú con mejor accesibilidad
fab.addEventListener('click', () => {
  menuOpen = !menuOpen;
  fabMenu.style.display = menuOpen ? 'flex' : 'none';
  fab.setAttribute('aria-expanded', menuOpen);
});

// Cerrar menú al hacer clic en cualquier botón
fabMenu.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.form;
    formContent.innerHTML = generarFormulario(type);
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    fabMenu.style.display = 'none';
    menuOpen = false;
    fab.setAttribute('aria-expanded', 'false');
    
    // Enfocar el primer input en el modal
    setTimeout(() => {
      const firstInput = modal.querySelector('input, textarea');
      if (firstInput) firstInput.focus();
    }, 100);
  });
});

// Cerrar modal al hacer clic en el botón X
closeBtn.addEventListener('click', () => {
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
  fab.focus();
});

// Cerrar modal al hacer clic fuera del contenido (click en backdrop)
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    fab.focus();
  }
});

// Cerrar modal con tecla ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.style.display === 'flex') {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    fab.focus();
  }
});

// Cerrar sesión al hacer clic en la imagen de logout
const logoutLink = document.querySelector('.logout-link');
if (logoutLink) {
  logoutLink.addEventListener('click', async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        window.location.href = '/';
      } else {
        console.error('Error al cerrar sesión');
      }
    } catch (error) {
      console.error('Error en logout:', error);
    }
  });
}

// Generador de formularios mejorado
function generarFormulario(type) {
  switch(type) {
    case 'materia':
      return `
        <div class="containers">
          <h2 id="modal-title" class="formh-title">Crear Materia</h2>
          <input 
            class="formh-input" 
            type="text" 
            placeholder="Nombre de la materia"
            required
            aria-label="Nombre de la materia"
          >
          <input 
            class="formh-input" 
            type="text" 
            placeholder="Profesor"
            aria-label="Profesor"
          >
          <button class="form-btn" type="button">Guardar</button>
        </div>`;
    case 'perfil':
      return `
        <div class="containers">
          <h2 id="modal-title" class="formh-title">Editar Perfil</h2>
          <input 
            class="formh-input" 
            type="text" 
            placeholder="Primer Nombre"
            aria-label="Primer Nombre"
          >
          <input 
            class="formh-input" 
            type="text" 
            placeholder="Segundo Nombre"
            aria-label="Segundo Nombre"
          >
          <input 
            class="formh-input" 
            type="text" 
            placeholder="Primer Apellido"
            aria-label="Primer Apellido"
          >
          <input 
            class="formh-input" 
            type="text" 
            placeholder="Segundo Apellido"
            aria-label="Segundo Apellido"
          >
          <input 
            class="formh-input" 
            type="email" 
            placeholder="Correo"
            aria-label="Correo"
          >
          <input 
            class="formh-input" 
            type="text" 
            placeholder="Universidad/Instituto"
            aria-label="Universidad o Instituto"
          >
          <input 
            class="formh-input" 
            type="text" 
            placeholder="Año en curso"
            aria-label="Año en curso"
          >
          <input 
            class="formh-input" 
            type="text" 
            placeholder="Fecha de finalización"
            aria-label="Fecha de finalización"
          >
          <button class="form-btn" type="button">Guardar</button>
        </div>`;
    case 'apunte':
      return `
        <div class="containers">
          <h2 id="modal-title" class="formh-title">Apunte Rápido</h2>
          <textarea 
            class="formh-textarea" 
            placeholder="Escribe tu apunte"
            required
            aria-label="Contenido del apunte"
          ></textarea>
          <button class="form-btn" type="button">Guardar</button>
        </div>`;
    case 'grupo':
      return `
        <div class="containers">
          <h2 id="modal-title" class="formh-title">Crear Grupo</h2>
          <input 
            class="formh-input" 
            type="text" 
            placeholder="Nombre del grupo"
            required
            aria-label="Nombre del grupo"
          >
          <button class="form-btn" type="button">Guardar</button>
        </div>`;
    case 'evento':
      return `
        <div class="containers">
          <h2 id="modal-title" class="formh-title">Crear Evento</h2>
          <input 
            class="formh-input" 
            type="text" 
            placeholder="Nombre del evento"
            required
            aria-label="Nombre del evento"
          >
          <input 
            class="formh-input" 
            type="date"
            required
            aria-label="Fecha del evento"
          >
          <button class="form-btn" type="button">Guardar</button>
        </div>`;
    default:
      return '';
  }
}

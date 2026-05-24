// Obtener y mostrar nombre del usuario
async function cargarNombreUsuario() {
  try {
    const response = await fetch('/api/usuario', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      const userNameElement = document.getElementById('user-name');
      if (userNameElement && data.username) {
        userNameElement.textContent = data.username;
      }
    } else {
      console.error('Error al obtener nombre del usuario');
    }
  } catch (error) {
    console.error('Error al cargar nombre de usuario:', error);
  }
}

// Cargar nombre del usuario cuando carga la página
document.addEventListener('DOMContentLoaded', () => {
  cargarNombreUsuario();
  initializeModals();
});

// ========== MODALS FUNCTIONALITY ==========

const modalOverlay = document.getElementById('modalOverlay');

// Abrir modal
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    modalOverlay.classList.add('active');
  }
}

// Cerrar modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
  // Verificar si hay otros modales abiertos
  const allModals = document.querySelectorAll('.modal.active');
  if (allModals.length === 0) {
    modalOverlay.classList.remove('active');
  }
}

// Inicializar eventos de modales
function initializeModals() {
  // Event listeners para abrir modales desde el menu
  const menuLinks = document.querySelectorAll('.menu-options a[data-modal]');
  menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const modalType = link.getAttribute('data-modal');
      const modalId = modalType + 'Modal';
      openModal(modalId);
    });
  });

  // Event listeners para cerrar modales
  const closeButtons = document.querySelectorAll('.modal-close');
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modalId = button.getAttribute('data-close');
      closeModal(modalId);
    });
  });

  // Event listeners para botones cancelar
  const cancelButtons = document.querySelectorAll('.btn-cancel');
  cancelButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modalId = button.getAttribute('data-close');
      closeModal(modalId);
    });
  });

  // Cerrar modal al hacer clic en el overlay
  modalOverlay.addEventListener('click', () => {
    const allModals = document.querySelectorAll('.modal.active');
    allModals.forEach(modal => {
      modal.classList.remove('active');
    });
    modalOverlay.classList.remove('active');
  });

  // Prevenir que el click en el contenido del modal cierre el modal
  const modalContents = document.querySelectorAll('.modal-content');
  modalContents.forEach(content => {
    content.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  });

  // Cerrar modal con tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const allModals = document.querySelectorAll('.modal.active');
      allModals.forEach(modal => {
        modal.classList.remove('active');
      });
      modalOverlay.classList.remove('active');
    }
  });
}

// ========== END MODALS FUNCTIONALITY ==========

// Cerrar sesión al hacer clic en el botón de logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async (event) => {
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
// Ir a la página About al hacer clic en el botón
const aboutBtn = document.getElementById('aboutBtn');
if (aboutBtn) {
  aboutBtn.addEventListener('click', (event) => {
    event.preventDefault();
    window.location.href = '/about';
  });
}
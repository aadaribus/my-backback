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

// ========== CUADERNO DIGITAL FUNCTIONALITY ==========

const notebookBtn = document.getElementById('notebookBtn');
const notebookModal = document.getElementById('notebookModal');
const notebookEditor = document.getElementById('notebookEditor');
const dropZone = document.getElementById('dropZone');
const notebookEntries = document.getElementById('notebookEntries');
const saveNotebookBtn = document.getElementById('saveNotebook');

let currentNotebookData = {
  subject: 'Sin asignar',
  entries: []
};

// Archivo inputs
const fileInput = document.getElementById('fileInput');
const imageInput = document.getElementById('imageInput');
const audioInput = document.getElementById('audioInput');
const videoInput = document.getElementById('videoInput');

// Toolbar buttons
const boldBtn = document.getElementById('boldBtn');
const italicBtn = document.getElementById('italicBtn');
const underlineBtn = document.getElementById('underlineBtn');
const fileBtn = document.getElementById('fileBtn');
const imageBtn = document.getElementById('imageBtn');
const audioBtn = document.getElementById('audioBtn');
const videoBtn = document.getElementById('videoBtn');
const clearBtn = document.getElementById('clearBtn');

// Abrir cuaderno digital
if (notebookBtn) {
  notebookBtn.addEventListener('click', () => {
    openModal('notebookModal');
    loadNotebookData();
  });
}

// Guardar cuaderno digital
if (saveNotebookBtn) {
  saveNotebookBtn.addEventListener('click', () => {
    saveNotebookEntry();
  });
}

// Toolbar - Formateo de texto
if (boldBtn) {
  boldBtn.addEventListener('click', () => document.execCommand('bold', false, null));
}
if (italicBtn) {
  italicBtn.addEventListener('click', () => document.execCommand('italic', false, null));
}
if (underlineBtn) {
  underlineBtn.addEventListener('click', () => document.execCommand('underline', false, null));
}
if (clearBtn) {
  clearBtn.addEventListener('click', () => document.execCommand('removeFormat', false, null));
}

// Botones de archivo
if (fileBtn) {
  fileBtn.addEventListener('click', () => fileInput.click());
}
if (imageBtn) {
  imageBtn.addEventListener('click', () => imageInput.click());
}
if (audioBtn) {
  audioBtn.addEventListener('click', () => audioInput.click());
}
if (videoBtn) {
  videoBtn.addEventListener('click', () => videoInput.click());
}

// Event listeners para inputs de archivo
if (fileInput) {
  fileInput.addEventListener('change', (e) => handleFileUpload(e.target.files, 'file'));
}
if (imageInput) {
  imageInput.addEventListener('change', (e) => handleFileUpload(e.target.files, 'image'));
}
if (audioInput) {
  audioInput.addEventListener('change', (e) => handleFileUpload(e.target.files, 'audio'));
}
if (videoInput) {
  videoInput.addEventListener('change', (e) => handleFileUpload(e.target.files, 'video'));
}

// Drag & Drop
if (dropZone) {
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    
    // Determinar tipo de archivo
    if (files[0]) {
      const fileType = files[0].type;
      if (fileType.startsWith('image/')) {
        handleFileUpload(files, 'image');
      } else if (fileType.startsWith('audio/')) {
        handleFileUpload(files, 'audio');
      } else if (fileType.startsWith('video/')) {
        handleFileUpload(files, 'video');
      } else {
        handleFileUpload(files, 'file');
      }
    }
  });
}

// Manejar carga de archivos
function handleFileUpload(files, type) {
  if (files.length === 0) return;

  const file = files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    insertMediaToEditor(e.target.result, type, file.name);
  };

  if (type === 'file') {
    reader.readAsDataURL(file);
  } else {
    reader.readAsDataURL(file);
  }
}

// Insertar media en el editor
function insertMediaToEditor(data, type, filename) {
  let element = '';
  
  switch(type) {
    case 'image':
      element = `<img src="${data}" alt="Imagen" style="max-width: 100%; max-height: 300px; margin: 10px 0; border-radius: 4px;">`;
      break;
    case 'audio':
      element = `<audio controls style="margin: 10px 0; width: 100%;"><source src="${data}"></audio>`;
      break;
    case 'video':
      element = `<video controls style="max-width: 100%; max-height: 400px; margin: 10px 0; border-radius: 4px;"><source src="${data}"></video>`;
      break;
    case 'file':
      element = `<a href="${data}" download="${filename}" style="display: inline-block; background: #5e3a22; color: white; padding: 8px 12px; border-radius: 4px; text-decoration: none; margin: 10px 0; font-size: 13px;">📥 ${filename}</a>`;
      break;
  }

  // Insertar en el editor
  if (notebookEditor && element) {
    notebookEditor.focus();
    document.execCommand('insertHTML', false, element);
  }
}

// Guardar entrada del cuaderno con timestamp
function saveNotebookEntry() {
  const content = notebookEditor.innerHTML;
  
  if (!content || content.trim() === '<br>') {
    alert('Por favor escribe algo en el cuaderno');
    return;
  }

  // Crear entrada con timestamp
  const now = new Date();
  const timestamp = now.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const entry = {
    id: Date.now(),
    timestamp: timestamp,
    content: content,
    subject: currentNotebookData.subject
  };

  // Agregar entrada al array
  currentNotebookData.entries.unshift(entry);

  // Mostrar entrada en la UI
  displayEntry(entry);

  // Guardar en localStorage
  localStorage.setItem(`notebook_${currentNotebookData.subject}`, JSON.stringify(currentNotebookData));

  // Enviar al servidor (si existe endpoint)
  saveToServer(entry);

  // Limpiar editor
  notebookEditor.innerHTML = '';

  alert('✅ Entrada guardada correctamente');
}

// Mostrar entrada en la UI
function displayEntry(entry) {
  const entryDiv = document.createElement('div');
  entryDiv.className = 'notebook-entry';
  entryDiv.innerHTML = `
    <div class="entry-timestamp">📅 ${entry.timestamp}</div>
    <div class="entry-content">${entry.content}</div>
  `;

  notebookEntries.insertBefore(entryDiv, notebookEntries.firstChild);
}

// Cargar datos del cuaderno
function loadNotebookData() {
  // Aquí se cargará el nombre de la materia actual
  // Por ahora, usamos un valor por defecto
  const subjectName = document.querySelector('.notebook-subject');
  if (subjectName) {
    currentNotebookData.subject = subjectName.textContent || 'Sin asignar';
  }

  // Limpiar entradas
  notebookEntries.innerHTML = '';
  notebookEditor.innerHTML = '';

  // Cargar del localStorage
  const saved = localStorage.getItem(`notebook_${currentNotebookData.subject}`);
  if (saved) {
    try {
      currentNotebookData = JSON.parse(saved);
      // Mostrar todas las entradas guardadas
      currentNotebookData.entries.forEach(entry => {
        displayEntry(entry);
      });
    } catch (e) {
      console.error('Error al cargar cuaderno:', e);
    }
  }
}

// Guardar en servidor (placeholder)
function saveToServer(entry) {
  // Este endpoint deberá ser implementado en el backend
  fetch('/api/cuaderno/guardar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      subject: entry.subject,
      content: entry.content,
      timestamp: entry.timestamp
    })
  }).catch(err => console.log('Nota: No hay conexión con el servidor', err));
}

// ========== END CUADERNO DIGITAL FUNCTIONALITY ==========

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
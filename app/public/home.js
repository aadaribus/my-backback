/* ==========================================================================
   🔄 CARGA DE DATOS DE USUARIO
   ========================================================================== */
async function cargarNombreUsuario() {
  try {
    const response = await fetch('/api/usuario', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    if (response.ok) {
      const data = await response.json();
      const userNameElement = document.getElementById('user-name');
      if (userNameElement) {
        const displayName = data.username || data.email || data.local_id || 'Usuario';
        userNameElement.textContent = displayName;
      }
    } else {
      console.error('Error al obtener nombre del usuario');
    }
  } catch (error) {
    console.error('Error al cargar nombre de usuario:', error);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  cargarNombreUsuario();
  initializeModals();
  initializeThemeToggle();
  await loadUserSubjectsForTasks();
});

function initializeThemeToggle() {
  const darkModeToggle = document.getElementById('darkModeToggle');

  function applyTheme(theme) {
    const isDark = theme === 'dark';
    document.body.classList.toggle('dark-mode', isDark);
    document.body.classList.toggle('light-mode', !isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    if (darkModeToggle) {
      darkModeToggle.checked = isDark;
    }
    localStorage.setItem('mi-mochila-theme', isDark ? 'dark' : 'light');
  }

  const savedTheme = localStorage.getItem('mi-mochila-theme');
  applyTheme(savedTheme || 'dark');

  if (darkModeToggle) {
    darkModeToggle.addEventListener('change', (event) => {
      applyTheme(event.target.checked ? 'dark' : 'light');
    });
  }
}

/* ==========================================================================
   🪟 FUNCIONALIDAD DE MODALES PREMIUM (Con Animaciones)
   ========================================================================== */
const modalOverlay = document.getElementById('modalOverlay');

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    // Primero cambiamos el display por JS si es necesario, pero usando clases para CSS
    modalOverlay.style.display = 'block';
    modal.style.display = 'block';
    
    // Pequeño delay para permitir que la animación CSS (fade-in / scale) se ejecute
    setTimeout(() => {
      modalOverlay.classList.add('active');
      modal.classList.add('active');
    }, 10);
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    
    const allModals = document.querySelectorAll('.modal.active');
    if (allModals.length === 0) {
      modalOverlay.classList.remove('active');
    }

    // Ocultamos completamente del layout después de terminar la transición CSS (300ms)
    setTimeout(() => {
      modal.style.display = 'none';
      if (allModals.length === 0) modalOverlay.style.display = 'none';
    }, 300);
  }
}

function initializeModals() {
  // Abrir modales desde el menú principal
  const menuLinks = document.querySelectorAll('.menu-options a[data-modal]');
  menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const modalType = link.getAttribute('data-modal');
      openModal(modalType + 'Modal');
    });
  });

  // Botones de cierre (X)
  const closeButtons = document.querySelectorAll('.modal-close');
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modalId = button.getAttribute('data-close') || button.closest('.modal').id;
      closeModal(modalId);
    });
  });

  // Botones de Cancelar en formularios
  const cancelButtons = document.querySelectorAll('.btn-cancel');
  cancelButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modalId = button.getAttribute('data-close') || button.closest('.modal').id;
      closeModal(modalId);
    });
  });

  // Cerrar al hacer clic en el fondo difuminado
  modalOverlay.addEventListener('click', () => {
    const allModals = document.querySelectorAll('.modal.active');
    allModals.forEach(modal => closeModal(modal.id));
  });

  // Detener propagación para no cerrar el modal al hacer clic por dentro
  const modalContents = document.querySelectorAll('.modal-content');
  modalContents.forEach(content => {
    content.addEventListener('click', (e) => e.stopPropagation());
  });

  // Cerrar con la tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const allModals = document.querySelectorAll('.modal.active');
      allModals.forEach(modal => closeModal(modal.id));
    }
  });
}

/* ==========================================================================
   📝 FUNCIONALIDAD: CUADERNO DIGITAL
   ========================================================================== */
const notebookBtn = document.getElementById('notebookBtn');
const notebookEditor = document.getElementById('notebookEditor');
const dropZone = document.getElementById('dropZone');
const notebookEntries = document.getElementById('notebookEntries');
const saveNotebookBtn = document.getElementById('saveNotebook');

let currentNotebookData = { subject: 'Sin asignar', entries: [] };

// Inputs ocultos de archivos
const fileInput = document.getElementById('fileInput');
const imageInput = document.getElementById('imageInput');
const audioInput = document.getElementById('audioInput');
const videoInput = document.getElementById('videoInput');

// Botones de la barra de herramientas (Toolbar)
const boldBtn = document.getElementById('boldBtn');
const italicBtn = document.getElementById('italicBtn');
const underlineBtn = document.getElementById('underlineBtn');
const fileBtn = document.getElementById('fileBtn');
const imageBtn = document.getElementById('imageBtn');
const audioBtn = document.getElementById('audioBtn');
const videoBtn = document.getElementById('videoBtn');
const clearBtn = document.getElementById('clearBtn');

if (notebookBtn) {
  notebookBtn.addEventListener('click', () => {
    window.location.href = '/materials';
  });
}

if (saveNotebookBtn) {
  saveNotebookBtn.addEventListener('click', () => saveNotebookEntry());
}

// Formateadores nativos del editor
if (boldBtn) boldBtn.addEventListener('click', () => document.execCommand('bold', false, null));
if (italicBtn) italicBtn.addEventListener('click', () => document.execCommand('italic', false, null));
if (underlineBtn) underlineBtn.addEventListener('click', () => document.execCommand('underline', false, null));
if (clearBtn) clearBtn.addEventListener('click', () => document.execCommand('removeFormat', false, null));

// Desencadenadores de clics para archivos
if (fileBtn) fileBtn.addEventListener('click', () => fileInput.click());
if (imageBtn) imageBtn.addEventListener('click', () => imageInput.click());
if (audioBtn) audioBtn.addEventListener('click', () => audioInput.click());
if (videoBtn) videoBtn.addEventListener('click', () => videoInput.click());

// Listeners de carga de archivos
if (fileInput) fileInput.addEventListener('change', (e) => handleFileUpload(e.target.files, 'file'));
if (imageInput) imageInput.addEventListener('change', (e) => handleFileUpload(e.target.files, 'image'));
if (audioInput) audioInput.addEventListener('change', (e) => handleFileUpload(e.target.files, 'audio'));
if (videoInput) videoInput.addEventListener('change', (e) => handleFileUpload(e.target.files, 'video'));

// Zona de Drag & Drop
if (dropZone) {
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });
  
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const fileType = files[0].type;
      if (fileType.startsWith('image/')) handleFileUpload(files, 'image');
      else if (fileType.startsWith('audio/')) handleFileUpload(files, 'audio');
      else if (fileType.startsWith('video/')) handleFileUpload(files, 'video');
      else handleFileUpload(files, 'file');
    }
  });
}

function handleFileUpload(files, type) {
  if (files.length === 0) return;
  const file = files[0];
  const reader = new FileReader();
  reader.onload = (e) => insertMediaToEditor(e.target.result, type, file.name);
  reader.readAsDataURL(file);
}

function insertMediaToEditor(data, type, filename) {
  let element = '';
  switch(type) {
    case 'image':
      element = `<img src="${data}" alt="Imagen" style="max-width: 100%; max-height: 300px; margin: 10px 0; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">`;
      break;
    case 'audio':
      element = `<audio controls style="margin: 10px 0; width: 100%; border-radius: 8px;"><source src="${data}"></audio>`;
      break;
    case 'video':
      element = `<video controls style="max-width: 100%; max-height: 400px; margin: 10px 0; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);"><source src="${data}"></video>`;
      break;
    case 'file':
      element = `<a href="${data}" download="${filename}" style="display: inline-flex; align-items: center; background: var(--primary, #8b5cf6); color: white; padding: 10px 16px; border-radius: 8px; text-decoration: none; margin: 10px 0; font-size: 14px; font-weight: 500; gap: 8px; box-shadow: 0 4px 10px rgba(138, 92, 246, 0.2);">📥 ${filename}</a>`;
      break;
  }
  if (notebookEditor && element) {
    notebookEditor.focus();
    document.execCommand('insertHTML', false, element);
  }
}

function saveNotebookEntry() {
  const content = notebookEditor.innerHTML;
  if (!content || content.trim() === '<br>') {
    Swal.fire({ icon: 'warning', title: 'Espacio vacío', text: 'Por favor escribe algo en tu cuaderno.', background: '#1a1435', color: '#fff', confirmButtonColor: '#8b5cf6' });
    return;
  }

  const now = new Date();
  const timestamp = now.toLocaleString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const entry = { id: Date.now(), timestamp: timestamp, content: content, subject: currentNotebookData.subject };

  currentNotebookData.entries.unshift(entry);
  displayEntry(entry);

  localStorage.setItem(`notebook_${currentNotebookData.subject}`, JSON.stringify(currentNotebookData));
  saveToServer(entry);
  notebookEditor.innerHTML = '';

  Swal.fire({ icon: 'success', title: '¡Guardado!', text: 'Entrada guardada en tu cuaderno digital.', background: '#1a1435', color: '#fff', confirmButtonColor: '#8b5cf6', timer: 2000, showConfirmButton: false });
}

function displayEntry(entry) {
  const entryDiv = document.createElement('div');
  entryDiv.className = 'notebook-entry';
  entryDiv.style = "background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; margin-bottom: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.2);";
  entryDiv.innerHTML = `
    <div class="entry-timestamp" style="font-size: 0.8rem; color: #06b6d4; font-weight: 500; margin-bottom: 8px;">📅 ${entry.timestamp}</div>
    <div class="entry-content" style="color: #f3f4f6; font-size: 0.95rem; line-height: 1.5;">${entry.content}</div>
  `;
  notebookEntries.insertBefore(entryDiv, notebookEntries.firstChild);
}

function loadNotebookData() {
  const subjectName = document.querySelector('.notebook-subject');
  if (subjectName) {
    currentNotebookData.subject = subjectName.textContent || 'Sin asignar';
  }
  notebookEntries.innerHTML = '';
  notebookEditor.innerHTML = '';

  const saved = localStorage.getItem(`notebook_${currentNotebookData.subject}`);
  if (saved) {
    try {
      currentNotebookData = JSON.parse(saved);
      currentNotebookData.entries.forEach(entry => displayEntry(entry));
    } catch (e) {
      console.error('Error al cargar cuaderno:', e);
    }
  }
}

/* ==========================================================================
   📚 FUNCIONALIDAD: AGREGAR MATERIAS
   ========================================================================== */
const materiaForm = document.getElementById('materiaForm') || document.querySelector('#materiaModal form');
const taskSubjectSelect = document.getElementById('taskSubjectSelect');
const taskSubjectEmpty = document.getElementById('taskSubjectEmpty');
const historySubjectSelect = document.getElementById('historySubjectSelect');
const historySubjectEmpty = document.getElementById('historySubjectEmpty');
const taskList = document.getElementById('taskList');
const historyContent = document.getElementById('historyContent');
const tareaForm = document.getElementById('tareaForm');

function setEmptyTaskState(message = 'Selecciona una materia para ver sus tareas.') {
  if (!taskList) return;
  taskList.innerHTML = `<div class="empty-state">${message}</div>`;
}

function setEmptyHistoryState(message = 'Selecciona una materia para ver su historial.') {
  if (!historyContent) return;
  historyContent.innerHTML = `<div class="empty-state">${message}</div>`;
}

function renderTaskList(tasks) {
  if (!taskList) return;
  taskList.innerHTML = '';

  const fragment = document.createDocumentFragment();
  tasks.forEach((task) => {
    const dueDate = task.datetarea ? new Date(task.datetarea).toLocaleDateString('es-ES') : 'Sin fecha';
    const completed = task.completed ? '✅ Completada' : '⏳ Pendiente';
    const card = document.createElement('div');
    card.className = 'task-card';
    card.innerHTML = `
      <div class="task-card-header">
        <strong>${task.tareaname || 'Tarea sin título'}</strong>
        <span>${completed}</span>
      </div>
      <div class="task-card-body">
        <p>${task.tareadescription || 'Sin descripción'}</p>
        <small>Fecha límite: ${dueDate}</small>
      </div>
    `;
    fragment.appendChild(card);
  });

  taskList.appendChild(fragment);
}

function renderHistoryContent(entries) {
  if (!historyContent) return;
  historyContent.innerHTML = '';

  const fragment = document.createDocumentFragment();
  entries.forEach((entry) => {
    const dateLabel = entry.created_at
      ? new Date(entry.created_at).toLocaleString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
      : 'Fecha desconocida';

    const card = document.createElement('div');
    card.className = 'history-card';
    card.innerHTML = `
      <div class="history-card-header">
        <span>${dateLabel}</span>
      </div>
      <div class="history-card-body">
        <p>${entry.texmaterial || 'Sin contenido disponible para esta entrada.'}</p>
      </div>
    `;
    fragment.appendChild(card);
  });

  historyContent.appendChild(fragment);
}

async function loadTasksForSubject(materialuser_id) {
  if (!taskList) return;
  if (!materialuser_id) {
    setEmptyTaskState();
    return;
  }

  taskList.innerHTML = '<div class="empty-state">Cargando tareas...</div>';

  try {
    const response = await fetch(`/api/tareapro?materialuser_id=${encodeURIComponent(materialuser_id)}`, {
      method: 'GET',
      credentials: 'include'
    });
    const data = await response.json();

    if (!response.ok || !Array.isArray(data.tareas)) {
      setEmptyTaskState('No se pudo cargar las tareas para esta materia.');
      return;
    }

    if (!data.tareas.length) {
      setEmptyTaskState('Aún no hay tareas para esta materia.');
      return;
    }

    renderTaskList(data.tareas);
  } catch (error) {
    console.error('Error al cargar tareas:', error);
    setEmptyTaskState('No se pudo cargar las tareas para esta materia.');
  }
}

async function loadHistoryForSubject(materialuser_id) {
  if (!historyContent) return;
  if (!materialuser_id) {
    setEmptyHistoryState();
    return;
  }

  historyContent.innerHTML = '<div class="empty-state">Cargando historial...</div>';

  try {
    const response = await fetch(`/api/bookdigital/${encodeURIComponent(materialuser_id)}`, {
      method: 'GET',
      credentials: 'include'
    });
    const data = await response.json();

    if (!response.ok || !Array.isArray(data.entries)) {
      setEmptyHistoryState('No se pudo cargar el historial para esta materia.');
      return;
    }

    if (!data.entries.length) {
      setEmptyHistoryState('Aún no hay historial para esta materia.');
      return;
    }

    renderHistoryContent(data.entries);
  } catch (error) {
    console.error('Error al cargar historial:', error);
    setEmptyHistoryState('No se pudo cargar el historial para esta materia.');
  }
}

async function loadUserSubjectsForTasks() {
  if (!taskSubjectSelect && !historySubjectSelect) return;

  try {
    const response = await fetch('/api/materias', {
      method: 'GET',
      credentials: 'include'
    });
    const data = await response.json();

    const subjects = Array.isArray(data.subjects) ? data.subjects : [];

    const taskOptions = ['<option value="">Selecciona una materia</option>'];
    const historyOptions = ['<option value="">Selecciona una materia</option>'];

    if (!subjects.length) {
      if (taskSubjectSelect) {
        taskSubjectSelect.innerHTML = taskOptions.join('');
        taskSubjectSelect.disabled = true;
      }
      if (historySubjectSelect) {
        historySubjectSelect.innerHTML = historyOptions.join('');
        historySubjectSelect.disabled = true;
      }
      if (taskSubjectEmpty) taskSubjectEmpty.style.display = 'block';
      if (historySubjectEmpty) historySubjectEmpty.style.display = 'block';
      setEmptyTaskState('Aún no tienes materias. Crea una materia para ver tareas.');
      setEmptyHistoryState('Aún no tienes materias. Crea una materia para ver historial.');
      return;
    }

    if (taskSubjectSelect) {
      taskSubjectSelect.disabled = false;
      taskSubjectSelect.innerHTML = taskOptions.join('');
    }
    if (historySubjectSelect) {
      historySubjectSelect.disabled = false;
      historySubjectSelect.innerHTML = historyOptions.join('');
    }
    if (taskSubjectEmpty) taskSubjectEmpty.style.display = 'none';
    if (historySubjectEmpty) historySubjectEmpty.style.display = 'none';

    subjects.forEach((subject) => {
      const id = subject.id || subject.subject_id || '';
      const label = subject.name || subject.admaterial || 'Materia';
      const optionHtml = `<option value="${id}">${label}</option>`;
      if (taskSubjectSelect) taskSubjectSelect.insertAdjacentHTML('beforeend', optionHtml);
      if (historySubjectSelect) historySubjectSelect.insertAdjacentHTML('beforeend', optionHtml);
    });

    setEmptyTaskState();
    setEmptyHistoryState();
  } catch (error) {
    console.error('Error al cargar materias para tareas:', error);
    if (taskSubjectSelect) {
      taskSubjectSelect.innerHTML = '<option value="">Selecciona una materia</option>';
      taskSubjectSelect.disabled = true;
    }
    if (historySubjectSelect) {
      historySubjectSelect.innerHTML = '<option value="">Selecciona una materia</option>';
      historySubjectSelect.disabled = true;
    }
    if (taskSubjectEmpty) taskSubjectEmpty.style.display = 'block';
    if (historySubjectEmpty) historySubjectEmpty.style.display = 'block';
    setEmptyTaskState('No se pudieron cargar las materias.');
    setEmptyHistoryState('No se pudieron cargar las materias.');
  }
}

if (taskSubjectSelect) {
  taskSubjectSelect.addEventListener('change', () => {
    const materialuser_id = taskSubjectSelect.value;
    if (materialuser_id) {
      loadTasksForSubject(materialuser_id);
    } else {
      setEmptyTaskState();
    }
  });
}

if (historySubjectSelect) {
  historySubjectSelect.addEventListener('change', () => {
    const materialuser_id = historySubjectSelect.value;
    if (materialuser_id) {
      loadHistoryForSubject(materialuser_id);
    } else {
      setEmptyHistoryState();
    }
  });
}

if (tareaForm) {
  tareaForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const taskTitle = tareaForm.querySelector('input[placeholder="Título de la tarea"]')?.value?.trim();
    const taskDescription = tareaForm.querySelector('textarea[placeholder="Descripción de la tarea"]')?.value?.trim();
    const taskDate = tareaForm.querySelector('input[type="date"]')?.value;
    const materialuser_id = taskSubjectSelect?.value;

    if (!taskTitle) {
      Swal.fire({ icon: 'error', title: 'Falta información', text: 'Por favor ingresa el título de la tarea.', background: '#1a1435', color: '#fff', confirmButtonColor: '#8b5cf6' });
      return;
    }

    if (!materialuser_id) {
      Swal.fire({ icon: 'error', title: 'Selecciona materia', text: 'Debes seleccionar una materia para asignar la tarea.', background: '#1a1435', color: '#fff', confirmButtonColor: '#8b5cf6' });
      return;
    }

    try {
      const response = await fetch('/api/tareapro/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          tareaname: taskTitle,
          tareadescription: taskDescription || null,
          datetarea: taskDate || null,
          materialuser_id
        })
      });
      const data = await response.json();

      if (response.ok) {
        Swal.fire({ icon: 'success', title: '¡Tarea creada!', text: `Tarea "${taskTitle}" creada para la materia seleccionada.`, background: '#1a1435', color: '#fff', confirmButtonColor: '#8b5cf6' });
        tareaForm.reset();
        setEmptyTaskState('Selecciona una materia para ver sus tareas.');
        if (materialuser_id) {
          loadTasksForSubject(materialuser_id);
        }
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: data.error || 'No se pudo crear la tarea', background: '#1a1435', color: '#fff' });
      }
    } catch (error) {
      console.error('Error al crear tarea:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo crear la tarea. Intenta de nuevo.', background: '#1a1435', color: '#fff' });
    }
  });
}

/* ==========================================================================
   👤 FUNCIONALIDAD: PERFIL DE USUARIO
   ========================================================================== */
const perfilLink = document.querySelector('a[data-modal="perfil"]');
if (perfilLink) {
  perfilLink.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/perfil', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        const profile = data.profile;

        document.querySelector('#perfilModal input[placeholder="Nombre completo"]').value = profile.full_name || '';
        document.querySelector('#perfilModal input[placeholder="Correo electrónico"]').value = profile.email || '';
        document.querySelector('#perfilModal input[placeholder="Teléfono"]').value = profile.phone || '';
        document.querySelector('#perfilModal input[placeholder="Universidad/Instituto"]').value = profile.institution || '';
        document.querySelector('#perfilModal input[placeholder="Carrera"]').value = profile.career || '';
        
        openModal('perfilModal');
      }
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      openModal('perfilModal');
    }
  });
}

const perfilForm = document.querySelector('#perfilModal form');
if (perfilForm) {
  perfilForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const full_name = perfilForm.querySelector('input[placeholder="Nombre completo"]').value;
    const email = perfilForm.querySelector('input[placeholder="Correo electrónico"]').value;
    const phone = perfilForm.querySelector('input[placeholder="Teléfono"]').value;
    const institution = perfilForm.querySelector('input[placeholder="Universidad/Instituto"]').value;
    const career = perfilForm.querySelector('input[placeholder="Carrera"]').value;

    if (!full_name.trim()) {
      Swal.fire({ icon: 'error', title: 'Falta información', text: 'Por favor ingresa tu nombre completo.', background: '#1a1435', color: '#fff' });
      return;
    }

    try {
      const response = await fetch('/api/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ full_name, email, phone, institution, career })
      });
      const data = await response.json();
      if (response.ok) {
        Swal.fire({ icon: 'success', title: 'Actualizado', text: 'Perfil actualizado exitosamente.', background: '#1a1435', color: '#fff', confirmButtonColor: '#8b5cf6' });
        closeModal('perfilModal');
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: data.error, background: '#1a1435', color: '#fff' });
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
    }
  });
}

function saveToServer(entry) {
  fetch('/api/cuaderno/guardar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject: entry.subject, content: entry.content, timestamp: entry.timestamp })
  }).catch(err => console.log('Nota: Modo offline o sin respuesta del servidor', err));
}

/* ==========================================================================
   🚪 BOTONES ADICIONALES (Cerrar Sesión / Acerca de)
   ========================================================================== */
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async (event) => {
    event.preventDefault();

    const confirmLogout = window.Swal && typeof window.Swal.fire === 'function'
      ? await window.Swal.fire({
          title: '¿Cerrar sesión?',
          text: 'Tendrás que volver a autenticarte para entrar.',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#ef4444',
          cancelButtonColor: 'rgba(255,255,255,0.05)',
          confirmButtonText: 'Sí, salir',
          cancelButtonText: 'Cancelar',
          background: '#1a1435',
          color: '#fff'
        })
      : { isConfirmed: window.confirm('¿Cerrar sesión?') };

    if (confirmLogout.isConfirmed) {
      try {
        document.cookie = 'jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
        const response = await fetch('/api/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });
        if (response.ok || response.status === 401 || response.status === 403) {
          window.location.href = '/';
        } else {
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Error en logout:', error);
        window.location.href = '/';
      }
    }
  });
}

const aboutBtn = document.getElementById('aboutBtn');
if (aboutBtn) {
  aboutBtn.addEventListener('click', (event) => {
    event.preventDefault();
    window.location.href = '/about';
  });
}

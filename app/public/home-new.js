// app/public/home-new.js
// Frontend JavaScript completo con nueva estructura de tablas

// ========== FUNCIONES GLOBALES ==========

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
    }
  } catch (error) {
    console.error('Error al cargar nombre de usuario:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  cargarNombreUsuario();
  initializeModals();
  initializeFormHandlers();
  loadInitialData();
});

// ========== MANEJO DE MODALES ==========

const modalOverlay = document.getElementById('modalOverlay');

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    modalOverlay.classList.add('active');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
  const allModals = document.querySelectorAll('.modal.active');
  if (allModals.length === 0) {
    modalOverlay.classList.remove('active');
  }
}

function initializeModals() {
  // Abrir modales desde el menú
  const menuLinks = document.querySelectorAll('.menu-options a[data-modal]');
  menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const modalType = link.getAttribute('data-modal');
      const modalId = modalType + 'Modal';
      openModal(modalId);
      
      // Cargar datos si es necesario
      if (modalType === 'perfil') loadPerfilData();
      if (modalType === 'historial') loadHistorialData();
    });
  });

  // Cerrar modales con botones
  const closeButtons = document.querySelectorAll('.modal-close, .btn-cancel');
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('.modal');
      if (modal) {
        const modalId = modal.id;
        closeModal(modalId);
      }
    });
  });

  // Cerrar al hacer clic en overlay
  modalOverlay.addEventListener('click', () => {
    const allModals = document.querySelectorAll('.modal.active');
    allModals.forEach(modal => modal.classList.remove('active'));
    modalOverlay.classList.remove('active');
  });

  // Prevenir cierre al hacer clic en contenido
  const modalContents = document.querySelectorAll('.modal-content');
  modalContents.forEach(content => {
    content.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  });

  // Cerrar con ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const allModals = document.querySelectorAll('.modal.active');
      allModals.forEach(modal => modal.classList.remove('active'));
      modalOverlay.classList.remove('active');
    }
  });
}

// ========== PERFIL (PROFILEDATE) ==========

async function loadPerfilData() {
  try {
    const response = await fetch('/api/profiledate', {
      method: 'GET',
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      const profile = data.profile;

      document.querySelector('#perfilModal input[placeholder="Nombre completo"]').value = profile.namecomplet || '';
      document.querySelector('#perfilModal input[placeholder="Correo"]').value = profile.usermail || '';
      document.querySelector('#perfilModal input[placeholder="Teléfono"]').value = profile.userfone || '';
      document.querySelector('#perfilModal input[placeholder="Universidad"]').value = profile.useruni || '';
    }
  } catch (error) {
    console.error('Error al cargar perfil:', error);
  }
}

const perfilForm = document.querySelector('#perfilModal form');
if (perfilForm) {
  perfilForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
      namecomplet: document.querySelector('#perfilModal input[placeholder="Nombre completo"]').value,
      usermail: document.querySelector('#perfilModal input[placeholder="Correo"]').value,
      userfone: document.querySelector('#perfilModal input[placeholder="Teléfono"]').value,
      useruni: document.querySelector('#perfilModal input[placeholder="Universidad"]').value
    };

    try {
      const response = await fetch('/api/profiledate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('✅ Perfil actualizado exitosamente');
        closeModal('perfilModal');
        perfilForm.reset();
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.error}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    }
  });
}

// ========== MATERIAS (MATERIALUSER) ==========

const materiaForm = document.querySelector('#materiaModal form');
if (materiaForm) {
  materiaForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
      admaterial: materiaForm.querySelector('input[placeholder="Nombre de la materia"]').value,
      nameprof: materiaForm.querySelector('input[placeholder="Profesor"]').value,
      horauser: materiaForm.querySelector('input[placeholder="Horario"]').value,
      descriptionmateria: materiaForm.querySelector('textarea[placeholder="Descripción"]').value
    };

    try {
      const response = await fetch('/api/materialuser/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(`✅ Materia "${formData.admaterial}" creada`);
        closeModal('materiaModal');
        materiaForm.reset();
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.error}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    }
  });
}

// ========== CUADERNO DIGITAL (BOOKDIGITAL) ==========

let mediaRecorder;
let recordedChunks = [];
let currentStream;

const notebookBtn = document.getElementById('notebookBtn');
if (notebookBtn) {
  notebookBtn.addEventListener('click', () => {
    openModal('notebookModal');
    loadMateriasParaCuaderno();
  });
}

async function loadMateriasParaCuaderno() {
  try {
    const response = await fetch('/api/materialuser', {
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      const select = document.querySelector('#notebookModal select[name="materia"]');
      if (select) {
        select.innerHTML = '<option value="">Selecciona una materia</option>';
        data.materiales.forEach(mat => {
          const option = document.createElement('option');
          option.value = mat.id;
          option.text = `${mat.admaterial} - ${mat.nameprof}`;
          select.appendChild(option);
        });
      }
    }
  } catch (error) {
    console.error('Error cargando materias:', error);
  }
}

// Funciones para cámara
async function iniciarCamara(tipoVideo) {
  try {
    currentStream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'user' },
      audio: false 
    });

    const videoElement = document.getElementById('cameraPreview');
    if (videoElement) {
      videoElement.srcObject = currentStream;
      videoElement.style.display = 'block';
    }

    const captureBtn = document.getElementById('capturePhotoBtn');
    if (captureBtn) {
      captureBtn.style.display = 'block';
      captureBtn.onclick = () => capturarFoto(videoElement);
    }
  } catch (error) {
    alert('❌ Error al acceder a la cámara: ' + error.message);
  }
}

function capturarFoto(videoElement) {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoElement, 0, 0);
  
  const dataUrl = canvas.toDataURL('image/jpeg');
  insertarMedia(dataUrl, 'image');
  
  detenerCamara();
}

function detenerCamara() {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
    const videoElement = document.getElementById('cameraPreview');
    if (videoElement) {
      videoElement.style.display = 'none';
    }
  }
}

// Funciones para micrófono
async function iniciarMicrófono() {
  try {
    currentStream = await navigator.mediaDevices.getUserMedia({ 
      audio: true,
      video: false 
    });

    mediaRecorder = new MediaRecorder(currentStream);
    recordedChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      recordedChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      insertarMedia(url, 'audio');
      detenerMicrófono();
    };

    mediaRecorder.start();

    const recordingIndicator = document.getElementById('recordingIndicator');
    if (recordingIndicator) {
      recordingIndicator.style.display = 'block';
    }
  } catch (error) {
    alert('❌ Error al acceder al micrófono: ' + error.message);
  }
}

function detenerMicrófono() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }
  const indicator = document.getElementById('recordingIndicator');
  if (indicator) {
    indicator.style.display = 'none';
  }
}

function insertarMedia(dataUrl, tipo) {
  const editor = document.getElementById('notebookEditor');
  if (!editor) return;

  let elemento = '';
  switch(tipo) {
    case 'image':
      elemento = `<img src="${dataUrl}" alt="Imagen" style="max-width:100%; margin:10px 0; border-radius:4px;">`;
      break;
    case 'audio':
      elemento = `<audio controls style="width:100%; margin:10px 0;"><source src="${dataUrl}"></audio>`;
      break;
    case 'video':
      elemento = `<video controls style="max-width:100%; margin:10px 0;"><source src="${dataUrl}"></video>`;
      break;
  }

  if (elemento) {
    editor.innerHTML += elemento;
  }
}

// Guardar entrada en cuaderno
const saveNotebookBtn = document.getElementById('saveNotebookBtn');
if (saveNotebookBtn) {
  saveNotebookBtn.addEventListener('click', async () => {
    const materiaSelect = document.querySelector('#notebookModal select[name="materia"]');
    const editor = document.getElementById('notebookEditor');

    if (!materiaSelect.value) {
      alert('⚠️ Selecciona una materia');
      return;
    }

    if (!editor.innerHTML.trim()) {
      alert('⚠️ Escribe algo en el cuaderno');
      return;
    }

    const formData = {
      materialuser_id: parseInt(materiaSelect.value),
      texmaterial: editor.innerHTML
    };

    try {
      const response = await fetch('/api/bookdigital/guardar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('✅ Entrada guardada en historial');
        closeModal('notebookModal');
        editor.innerHTML = '';
        materiaSelect.value = '';
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.error}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    }
  });
}

// ========== HISTORIAL ==========

async function loadHistorialData() {
  try {
    const response = await fetch('/api/bookhistory', {
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      const historialList = document.querySelector('#historialModal .history-list');
      
      if (historialList) {
        historialList.innerHTML = '';
        
        if (data.history.length === 0) {
          historialList.innerHTML = '<li style="padding:10px; text-align:center; color:#999;">No hay entradas en el historial</li>';
          return;
        }

        data.history.forEach(entry => {
          const li = document.createElement('li');
          li.style.cssText = 'padding:10px; border-bottom:1px solid #ddd; cursor:pointer;';
          li.innerHTML = `
            <strong>${entry.admaterial}</strong><br>
            <small>${entry.nameprof} - ${entry.horauser}</small><br>
            <small style="color:#999;">${new Date(entry.saved_at).toLocaleString('es-ES')}</small>
          `;
          li.onclick = () => {
            alert(`
📖 ${entry.admaterial}
👨‍🏫 ${entry.nameprof}
🕐 ${entry.horauser}

📝 Contenido:
${entry.texmaterial || 'Sin texto'}

📅 ${new Date(entry.saved_at).toLocaleString('es-ES')}
            `);
          };
          historialList.appendChild(li);
        });
      }
    }
  } catch (error) {
    console.error('Error cargando historial:', error);
  }
}

// ========== GRUPOS (GRUPPRO) ==========

const gruposForm = document.querySelector('#gruposModal form');
if (gruposForm) {
  gruposForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
      grupname: gruposForm.querySelector('input[placeholder="Nombre del grupo"]').value,
      grupdecription: gruposForm.querySelector('textarea[placeholder="Descripción del grupo"]').value,
      grupmail: gruposForm.querySelector('input[placeholder="Email del miembro a invitar"]').value
    };

    try {
      const response = await fetch('/api/gruppro/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(`✅ Grupo "${formData.grupname}" creado`);
        closeModal('gruposModal');
        gruposForm.reset();
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.error}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    }
  });
}

// ========== TAREAS (TAREAPRO) ==========

const tareasForm = document.querySelector('#tareasModal form');
if (tareasForm) {
  tareasForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
      tareaname: tareasForm.querySelector('input[placeholder="Título de la tarea"]').value,
      tareadescription: tareasForm.querySelector('textarea[placeholder="Descripción de la tarea"]').value,
      datetarea: tareasForm.querySelector('input[type="date"]').value
    };

    try {
      const response = await fetch('/api/tareapro/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(`✅ Tarea "${formData.tareaname}" creada`);
        closeModal('tareasModal');
        tareasForm.reset();
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.error}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    }
  });
}

// ========== FUNCIONES DE INICIALIZACIÓN ==========

function initializeFormHandlers() {
  // Inicializar handlers específicos de la aplicación
}

function loadInitialData() {
  // Cargar datos iniciales si es necesario
}

// ========== LOGOUT ==========

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (error) {
      console.error('Error en logout:', error);
    }
  });
}

const aboutBtn = document.getElementById('aboutBtn');
if (aboutBtn) {
  aboutBtn.addEventListener('click', () => {
    window.location.href = '/about';
  });
}

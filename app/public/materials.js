const subjectsGrid = document.getElementById('subjectsGrid');
const subjectModal = document.getElementById('subjectModal');
const notebookModal = document.getElementById('notebookModal');
const subjectForm = document.getElementById('subjectForm');
const openSubjectModalBtn = document.getElementById('openSubjectModal');
const cancelSubjectModalBtn = document.getElementById('cancelSubjectModal');
const closeNotebookModalBtn = document.getElementById('closeNotebookModal');
const saveNotebookBtn = document.getElementById('saveNotebook');
const notebookEditor = document.getElementById('notebookEditor');
const notebookHistory = document.getElementById('notebookHistory');
const notebookSubjectTitle = document.getElementById('notebookSubjectTitle');
const editSubjectModal = document.getElementById('editSubjectModal');
const editSubjectForm = document.getElementById('editSubjectForm');
const cancelEditSubjectModalBtn = document.getElementById('cancelEditSubjectModal');

let currentSubject = null;
let currentNotebook = null;

function openSubjectModal() {
  subjectModal.classList.add('active');
}

function closeSubjectModal() {
  subjectModal.classList.remove('active');
  subjectForm.reset();
}

function openNotebookModal(subject) {
  currentSubject = subject;
  notebookSubjectTitle.textContent = `Cuaderno de ${subject.name}`;
  notebookModal.classList.add('active');
  loadNotebookEntries(subject.id);
}

function closeNotebookModal() {
  notebookModal.classList.remove('active');
  notebookEditor.innerHTML = '';
  notebookHistory.innerHTML = '';
}

function openEditSubjectModal(subject) {
  currentSubject = subject;
  editSubjectForm.elements.name.value = subject.name || '';
  editSubjectForm.elements.professor.value = subject.professor || '';
  editSubjectForm.elements.schedule.value = subject.schedule || '';
  editSubjectForm.elements.description.value = subject.description || '';
  editSubjectModal.classList.add('active');
}

function closeEditSubjectModal() {
  editSubjectModal.classList.remove('active');
  editSubjectForm.reset();
}

async function loadSubjects() {
  try {
    const response = await fetch('/api/materias', { credentials: 'include' });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'No se pudieron cargar las materias');
    }

    renderSubjects(data.subjects || []);
  } catch (error) {
    console.error(error);
    subjectsGrid.innerHTML = '<div class="empty-state">No se pudieron cargar tus materias.</div>';
  }
}

function renderSubjects(subjects) {
  subjectsGrid.innerHTML = '';

  if (!subjects.length) {
    subjectsGrid.innerHTML = '<div class="empty-state">Aún no tienes materias. Crea la primera para empezar tu cuaderno digital.</div>';
    return;
  }

  const fragment = document.createDocumentFragment();

  subjects.forEach((subject) => {
    const card = document.createElement('article');
    card.className = 'subject-card';
    card.innerHTML = `
      <div>
        <h3>${subject.name}</h3>
        <p>${subject.description || 'Sin descripción'}</p>
      </div>
      <div class="subject-actions">
        <button type="button" class="edit-btn" data-action="edit">✏️</button>
        <button type="button" class="delete-btn" data-action="delete">🗑️</button>
      </div>
      <div class="subject-meta">
        <span>${subject.professor || 'Sin profesor'}</span>
        <strong>Ver cuaderno</strong>
      </div>
    `;

    card.querySelector('[data-action="edit"]').addEventListener('click', (event) => {
      event.stopPropagation();
      openEditSubjectModal(subject);
    });

    card.querySelector('[data-action="delete"]').addEventListener('click', async (event) => {
      event.stopPropagation();
      const confirmDelete = confirm(`¿Eliminar la materia "${subject.name}"?`);
      if (!confirmDelete) return;

      try {
        const response = await fetch(`/api/materias/${subject.id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'No se pudo eliminar');
        await loadSubjects();
      } catch (error) {
        alert(error.message);
      }
    });

    card.addEventListener('click', () => openNotebookModal(subject));
    fragment.appendChild(card);
  });

  subjectsGrid.appendChild(fragment);
}

subjectForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(subjectForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    const response = await fetch('/api/materias/crear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'No se pudo crear la materia');
    }

    closeSubjectModal();
    await loadSubjects();
  } catch (error) {
    alert(error.message);
  }
});

openSubjectModalBtn.addEventListener('click', openSubjectModal);
cancelSubjectModalBtn.addEventListener('click', closeSubjectModal);
closeNotebookModalBtn.addEventListener('click', closeNotebookModal);
cancelEditSubjectModalBtn.addEventListener('click', closeEditSubjectModal);

subjectModal.addEventListener('click', (event) => {
  if (event.target === subjectModal) closeSubjectModal();
});

notebookModal.addEventListener('click', (event) => {
  if (event.target === notebookModal) closeNotebookModal();
});

editSubjectModal.addEventListener('click', (event) => {
  if (event.target === editSubjectModal) closeEditSubjectModal();
});

editSubjectForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!currentSubject) return;

  const payload = {
    name: editSubjectForm.elements.name.value.trim(),
    professor: editSubjectForm.elements.professor.value.trim(),
    schedule: editSubjectForm.elements.schedule.value.trim(),
    description: editSubjectForm.elements.description.value.trim()
  };

  try {
    const response = await fetch(`/api/materias/${currentSubject.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'No se pudo actualizar');
    closeEditSubjectModal();
    await loadSubjects();
  } catch (error) {
    alert(error.message);
  }
});

document.querySelectorAll('[data-command]').forEach((button) => {
  button.addEventListener('click', () => {
    const command = button.getAttribute('data-command');
    document.execCommand(command, false, null);
    notebookEditor.focus();
  });
});

async function loadNotebookEntries(subjectId) {
  try {
    const response = await fetch(`/api/cuaderno/materia/${subjectId}`, { credentials: 'include' });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'No se pudo abrir el cuaderno');
    }

    currentNotebook = data.notebook_id;
    notebookHistory.innerHTML = '<div class="entry-card"><div class="time">Cargando...</div><div class="content">Recuperando tus apuntes…</div></div>';

    const entriesResponse = await fetch(`/api/cuaderno/${data.notebook_id}`, { credentials: 'include' });
    const entriesData = await entriesResponse.json();

    if (!entriesResponse.ok) {
      throw new Error(entriesData.error || 'No se pudo obtener el historial');
    }

    renderEntries(entriesData.entries || []);
  } catch (error) {
    notebookHistory.innerHTML = '<div class="entry-card"><div class="time">Sin registro</div><div class="content">Aún no hay apuntes guardados para esta materia.</div></div>';
    console.error(error);
  }
}

function renderEntries(entries) {
  notebookHistory.innerHTML = '';
  if (!entries.length) {
    notebookHistory.innerHTML = '<div class="entry-card"><div class="time">Sin registro</div><div class="content">Tu primer apunte aparecerá aquí.</div></div>';
    return;
  }

  const fragment = document.createDocumentFragment();
  entries.forEach((entry) => {
    const card = document.createElement('div');
    card.className = 'entry-card';
    card.innerHTML = `
      <div class="time">${entry.created_at || 'Reciente'}</div>
      <div class="content">${entry.content}</div>
    `;
    fragment.appendChild(card);
  });

  notebookHistory.appendChild(fragment);
}

saveNotebookBtn.addEventListener('click', async () => {
  const content = notebookEditor.innerHTML.trim();
  if (!content || content === '<br>') {
    alert('Escribe algo antes de guardar.');
    return;
  }

  if (!currentSubject || !currentNotebook) {
    alert('Selecciona una materia antes de guardar.');
    return;
  }

  try {
    const response = await fetch('/api/cuaderno/guardar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ notebook_id: currentNotebook, content, subject_name: currentSubject.name })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'No se pudo guardar el apunte');
    }

    notebookEditor.innerHTML = '';
    await loadNotebookEntries(currentSubject.id);
  } catch (error) {
    alert(error.message);
  }
});

loadSubjects();

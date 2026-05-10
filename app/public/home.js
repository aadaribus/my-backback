const fab = document.getElementById('fab');
const fabMenu = document.getElementById('fabMenu');
const modal = document.getElementById('modal');
const closeBtn = document.getElementById('close');
const formContent = document.getElementById('formContent');

// Mostrar/ocultar menú
fab.addEventListener('click', () => {
  fabMenu.style.display = fabMenu.style.display === 'flex' ? 'none' : 'flex';
});

// Abrir modal con formulario
fabMenu.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.form;
    formContent.innerHTML = generarFormulario(type);
    modal.style.display = 'flex';
    fabMenu.style.display = 'none';
  });
});

// Cerrar modal
closeBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

// Cerrar sesión al hacer clic en la imagen de logout
const logoutLink = document.querySelector('.logout-link');
if (logoutLink) {
  logoutLink.addEventListener('click', (event) => {
    event.preventDefault();
    document.cookie = 'jwt=; path=/; max-age=0';
    document.cookie = 'jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/';
  });
}

// Generador de formularios
function generarFormulario(type) {
  switch(type) {
    case 'materia':
      return `
              <div class="containers">
              <h2 class="formh-title">Crear Materia</h2>
              <input class="formh-input" type="text" placeholder="Nombre de la materia">
              <input class="formh-input" type="text" placeholder="Profesor">
              <button class="formh-btn">Guardar</button>
              </div>`;
    case 'perfil':
      return `<div class="containers">
              <h2 class="formh-title">Editar Perfil</h2>
              <input class="formh-input" type="text" placeholder="1er Nombre">
              <input class="formh-input" type="text" placeholder="2do Nombre">
              <input class="formh-input" type="text" placeholder="1er Apellido">
              <input class="formh-input" type="text" placeholder="2do Apellido">
              <input class="formh-input" type="email" placeholder="Correo">
              <input class="formh-input" type="text" placeholder="Universidad/Instituto">
              <input class="formh-input" type="text" placeholder="Año en curso">
              <input class="formh-input" type="text" placeholder="Fecha de finalizacion">
              <button class="formh-btn">Guardar</button>
              </div>`;
    case 'apunte':
      return `
              <div class="containers">
              <h2 class="formh-title">Apunte Rápido</h2>
              <textarea class="formh-textarea" placeholder="Escribe tu apunte"></textarea>
              <button class="formh-btn">Guardar</button>
              </div>`;
    case 'grupo':
      return `
              <div class="containers">
              <h2 class="formh-title">Crear Grupo</h2>
              <input class="formh-input" type="text" placeholder="Nombre del grupo">
              <button class="formh-btn">Guardar</button>
              </div>`;
              case 'evento':
                return `
                        <div class="containers">
                        <h2 class="formh-title">Crear Evento</h2>
                        <input class="formh-input" type="text" placeholder="Nombre del evento">
                        <input class="formh-input" type="date" placeholder="Fecha del evento">
                        <button class="formh-btn">Guardar</button>
                        </div>`;
    default:
      return '';

  }
}

const API = '/api/contactos';

const $ = (sel) => document.querySelector(sel);
const lista = $('#lista');
const contador = $('#contador');
const buscar = $('#buscar');
const modal = $('#modal');
const form = $('#form');

let editId = null;
let fotoSeleccionada = null;
let debounce;

// ===== Utilidades =====
function iniciales(nombre, apellidos) {
  return ((nombre?.[0] || '') + (apellidos?.[0] || '')).toUpperCase() || '?';
}

function formatoFecha(f) {
  if (!f) return 'Sin fecha';
  const d = new Date(f);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function escapar(t) {
  const div = document.createElement('div');
  div.textContent = t ?? '';
  return div.innerHTML;
}

function toast(msg, tipo = 'ok') {
  const el = $('#toast');
  el.textContent = msg;
  el.className = `toast show ${tipo}`;
  el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    el.classList.remove('show');
  }, 2600);
}

// ===== Render =====
function skeletons() {
  lista.innerHTML = Array.from({ length: 6 })
    .map(() => '<div class="skeleton"></div>')
    .join('');
}

function render(contactos) {
  contador.textContent = `${contactos.length} contacto${
    contactos.length === 1 ? '' : 's'
  }`;

  if (contactos.length === 0) {
    lista.innerHTML = `
      <div class="empty">
        <div class="big">-</div>
        <p>No hay contactos para mostrar.</p>
      </div>`;
    return;
  }

  lista.innerHTML = contactos
    .map((c) => {
      const avatar = c.foto_url
        ? `<img class="avatar" src="${escapar(c.foto_url)}" alt="" />`
        : `<div class="avatar">${iniciales(c.nombre, c.apellidos)}</div>`;
      return `
      <article class="card">
        <div class="card-top">
          ${avatar}
          <div>
            <div class="card-name">${escapar(c.nombre)} ${escapar(c.apellidos)}</div>
            <div class="card-mail">${escapar(c.correo)}</div>
          </div>
        </div>
        <div class="card-meta">Nacimiento: ${formatoFecha(c.fecha_nac)}</div>
        <div class="card-actions">
          <button class="icon-btn edit" data-edit="${c.id}">Editar</button>
          <button class="icon-btn del" data-del="${c.id}">Eliminar</button>
        </div>
      </article>`;
    })
    .join('');
}

// ===== Carga de datos =====
async function cargar(apellido = '') {
  skeletons();
  try {
    const url = apellido ? `${API}?apellido=${encodeURIComponent(apellido)}` : API;
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    render(await res.json());
  } catch {
    lista.innerHTML =
      '<div class="empty"><p>No se pudo conectar con el servidor.</p></div>';
    toast('Error al cargar contactos', 'err');
  }
}

// ===== Modal =====
function abrirModal(contacto = null) {
  editId = contacto?.id ?? null;
  fotoSeleccionada = null;
  $('#modal-title').textContent = contacto ? 'Editar contacto' : 'Nuevo contacto';
  $('#contacto-id').value = contacto?.id ?? '';
  $('#nombre').value = contacto?.nombre ?? '';
  $('#apellidos').value = contacto?.apellidos ?? '';
  $('#correo').value = contacto?.correo ?? '';
  $('#fecha_nac').value = contacto?.fecha_nac
    ? contacto.fecha_nac.slice(0, 10)
    : '';
  $('#foto').value = '';

  const img = $('#avatar-img');
  const letra = $('#avatar-letra');
  if (contacto?.foto_url) {
    img.src = contacto.foto_url;
    img.hidden = false;
    letra.hidden = true;
  } else {
    img.hidden = true;
    letra.hidden = false;
    letra.textContent = contacto
      ? iniciales(contacto.nombre, contacto.apellidos)
      : '?';
  }

  modal.hidden = false;
}

function cerrarModal() {
  modal.hidden = true;
}

// ===== Eventos =====
$('#btn-nuevo').addEventListener('click', () => abrirModal());
$('#btn-cerrar').addEventListener('click', cerrarModal);
$('#btn-cancelar').addEventListener('click', cerrarModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) cerrarModal();
});

$('#foto').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  fotoSeleccionada = file;
  const img = $('#avatar-img');
  img.src = URL.createObjectURL(file);
  img.hidden = false;
  $('#avatar-letra').hidden = true;
});

buscar.addEventListener('input', (e) => {
  clearTimeout(debounce);
  debounce = setTimeout(() => cargar(e.target.value.trim()), 300);
});

$('#btn-limpiar').addEventListener('click', () => {
  buscar.value = '';
  cargar();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = $('#btn-guardar');
  btn.disabled = true;
  btn.textContent = 'Guardando...';

  const fd = new FormData();
  fd.append('nombre', $('#nombre').value.trim());
  fd.append('apellidos', $('#apellidos').value.trim());
  fd.append('correo', $('#correo').value.trim());
  fd.append('fecha_nac', $('#fecha_nac').value);
  if (fotoSeleccionada) fd.append('foto', fotoSeleccionada);

  try {
    const res = await fetch(editId ? `${API}/${editId}` : API, {
      method: editId ? 'PUT' : 'POST',
      body: fd
    });
    if (!res.ok) throw new Error();
    cerrarModal();
    toast(editId ? 'Contacto actualizado' : 'Contacto creado');
    cargar(buscar.value.trim());
  } catch {
    toast('Error al guardar', 'err');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Guardar';
  }
});

lista.addEventListener('click', async (e) => {
  const editBtn = e.target.closest('[data-edit]');
  const delBtn = e.target.closest('[data-del]');

  if (editBtn) {
    const res = await fetch(`${API}/${editBtn.dataset.edit}`);
    if (res.ok) abrirModal(await res.json());
    return;
  }

  if (delBtn) {
    if (!confirm('Eliminar este contacto?')) return;
    try {
      const res = await fetch(`${API}/${delBtn.dataset.del}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error();
      toast('Contacto eliminado');
      cargar(buscar.value.trim());
    } catch {
      toast('Error al eliminar', 'err');
    }
  }
});

// ===== Inicio =====
cargar();

(function () {
  const TOKEN_KEY = 'jwt_token';
  const USER_KEY = 'jwt_user';
  const ROLES_KEY = 'jwt_roles';

  function decodeJwt(token) {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodeURIComponent(escape(decoded)));
    } catch (_e) {
      return null;
    }
  }

  function isExpired(token) {
    const payload = decodeJwt(token);
    if (!payload || !payload.exp) return true;
    return payload.exp * 1000 <= Date.now();
  }

  const Auth = {
    setSession(token, user, roles) {
      sessionStorage.setItem(TOKEN_KEY, token);
      if (user) sessionStorage.setItem(USER_KEY, JSON.stringify(user));
      if (roles) sessionStorage.setItem(ROLES_KEY, JSON.stringify(roles));
    },
    getToken() {
      return sessionStorage.getItem(TOKEN_KEY);
    },
    getUser() {
      try { return JSON.parse(sessionStorage.getItem(USER_KEY) || 'null'); }
      catch (_e) { return null; }
    },
    getRoles() {
      try { return JSON.parse(sessionStorage.getItem(ROLES_KEY) || '[]'); }
      catch (_e) { return []; }
    },
    setUser(user) {
      if (user) sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    },
    clear() {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(ROLES_KEY);
    },
    isAuthenticated() {
      const token = this.getToken();
      if (!token) return false;
      if (isExpired(token)) {
        this.clear();
        return false;
      }
      return true;
    },
    hasRole(role) {
      return (this.getRoles() || []).includes(role);
    },
    requireAuth() {
      if (!this.isAuthenticated()) {
        window.location.replace('/signIn');
        return false;
      }
      return true;
    },
    requireGuest() {
      if (this.isAuthenticated()) {
        const roles = this.getRoles();
        const target = roles.includes('admin') ? '/admin' : '/dashboard';
        window.location.replace(target);
        return false;
      }
      return true;
    },
    requireRole(role) {
      if (!this.requireAuth()) return false;
      if (!this.hasRole(role)) {
        window.location.replace('/403');
        return false;
      }
      return true;
    },
    logout() {
      this.clear();
      window.location.replace('/signIn');
    },
    async api(path, { method = 'GET', body, auth = true } = {}) {
      const headers = { 'Content-Type': 'application/json' };
      if (auth) {
        const token = this.getToken();
        if (!token) {
          this.logout();
          throw new Error('No autenticado');
        }
        headers['Authorization'] = 'Bearer ' + token;
      }
      const opts = { method, headers };
      if (body !== undefined) opts.body = JSON.stringify(body);
      const res = await fetch(path, opts);
      if (res.status === 401) {
        const data = await safeJson(res);
        if (data && data.code === 'TOKEN_EXPIRED') {
          alert('Tu sesion ha expirado. Inicia sesion nuevamente.');
        }
        this.logout();
        throw new Error((data && data.message) || 'No autorizado');
      }
      const data = await safeJson(res);
      if (!res.ok) {
        throw new Error((data && data.message) || ('Error ' + res.status));
      }
      return data;
    }
  };

  async function safeJson(res) {
    try { return await res.json(); } catch (_e) { return null; }
  }

  window.Auth = Auth;
})();

function buildNav(activeKey) {
  if (!window.Auth || !Auth.isAuthenticated()) return '';
  const user = Auth.getUser();
  const roles = Auth.getRoles();
  const isAdmin = roles.includes('admin');
  const initials = user
    ? ((user.name || '?').charAt(0) + (user.lastName || '').charAt(0)).toUpperCase()
    : '';

  return `
    <div class="nav">
      <div class="nav-inner">
        <a href="${isAdmin ? '/admin' : '/dashboard'}" class="brand">
          <span class="brand-mark"></span>
          <span>Auth Console</span>
        </a>
        <div class="nav-links">
          ${isAdmin
            ? `<a href="/admin" class="nav-link ${activeKey === 'admin' ? 'active' : ''}">Administracion</a>`
            : ''}
          <a href="/dashboard" class="nav-link ${activeKey === 'dashboard' ? 'active' : ''}">Inicio</a>
          <a href="/profile" class="nav-link ${activeKey === 'profile' ? 'active' : ''}">Mi cuenta</a>
        </div>
        <div class="nav-user">
          <div class="avatar">${initials || '--'}</div>
          <span class="muted">${user ? (user.email || '') : ''}</span>
          <button class="btn btn-ghost btn-sm" id="navLogoutBtn" type="button">Cerrar sesion</button>
        </div>
      </div>
    </div>
  `;
}

function mountNav(activeKey) {
  const slot = document.getElementById('nav-slot');
  if (!slot) return;
  slot.innerHTML = buildNav(activeKey);
  const btn = document.getElementById('navLogoutBtn');
  if (btn) btn.addEventListener('click', () => Auth.logout());
}

function showAlert(target, message, kind = 'error') {
  const el = document.querySelector(target);
  if (!el) return;
  el.className = 'alert alert-' + kind;
  el.textContent = message;
  el.classList.remove('hidden');
}
function clearAlert(target) {
  const el = document.querySelector(target);
  if (!el) return;
  el.classList.add('hidden');
  el.textContent = '';
}

function fmtDate(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('es-PE', { year: 'numeric', month: 'short', day: '2-digit' });
}
function fmtDateTime(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleString('es-PE', {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
}
function toInputDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const pad = n => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}
function rolesText(user) {
  return (user.roles || []).map(r => r.name || r).join(', ');
}
function initials(user) {
  if (!user) return '--';
  return ((user.name || '?').charAt(0) + (user.lastName || '').charAt(0)).toUpperCase();
}

/* ============================================================
   LittleSteps Pediatric Care - auth.js
   FRONTEND DEMO AUTHENTICATION ONLY.
   Demo credentials are stored here in plain text for
   demonstration purposes. A real deployment MUST use a backend
   with hashed credentials, secure sessions and proper access
   control. Client-side role checks are NOT security.
   ============================================================ */
'use strict';

(function () {
  const DEMO_USERS = [
    { email: 'parent@littlestepsdemo.com', password: 'parent123', role: 'parent', name: 'Priya Sharma (Demo)' },
    { email: 'admin@littlestepsdemo.com', password: 'admin123', role: 'admin', name: 'Clinic Admin (Demo)' }
  ];

  const PREFIX = window.location.pathname.replace(/\\/g, '/').includes('/dashboard/') ? '../' : '';

  /**
   * Attempt demo login. Returns { ok, role, name, error }.
   */
  function demoLogin(email, password) {
    const normalized = String(email || '').trim().toLowerCase();
    const user = DEMO_USERS.find((u) => u.email === normalized && u.password === String(password));
    if (!user) {
      return { ok: false, error: 'Invalid demo credentials. Use one of the demo accounts shown on this page.' };
    }
    const session = { role: user.role, name: user.name, email: user.email, loginAt: Date.now(), demo: true };
    try { localStorage.setItem('ls_session', JSON.stringify(session)); } catch { /* ignore */ }
    return { ok: true, role: user.role, name: user.name };
  }

  function logout(redirectToLogin = true) {
    try { localStorage.removeItem('ls_session'); } catch { /* ignore */ }
    if (redirectToLogin) window.location.href = PREFIX + 'login.html?signedout=1';
  }

  /**
   * Demo dashboard session helper. Dashboards open directly — there is no
   * login gate and no redirect to login.html. If no session exists (or the
   * stored session belongs to the other demo role), a demo session for the
   * requested role is used so the welcome message and role-specific UI work.
   * @param {'parent'|'admin'} role
   */
  function requireRole(role) {
    let session = null;
    try { session = JSON.parse(localStorage.getItem('ls_session') || 'null'); } catch { session = null; }

    // Stored session already matches this dashboard — use it as-is.
    if (session && session.role === role) return session;

    // Otherwise run this dashboard with a demo session for its own role.
    const demo = {
      role,
      name: role === 'admin' ? 'Clinic Admin (Demo)' : 'Priya Sharma (Demo)',
      email: role === 'admin' ? 'admin@littlestepsdemo.com' : 'parent@littlestepsdemo.com',
      loginAt: Date.now(),
      demo: true
    };
    if (!session || !session.role) {
      // No session at all: remember it so later navigation stays consistent.
      try { localStorage.setItem('ls_session', JSON.stringify(demo)); } catch { /* ignore */ }
    }
    return demo;
  }

  /* ---------- Login page wiring (login.html) ---------- */
  function initLoginPage() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    const emailEl = form.elements['email'];
    const passwordEl = form.elements['password'];
    const errorEl = document.getElementById('loginError');
    const params = new URLSearchParams(window.location.search);

    if (params.get('signedout') === '1') {
      const note = document.getElementById('loginNotice');
      if (note) { note.textContent = 'You have been signed out (demo).'; note.classList.remove('hidden'); }
    }
    if (params.get('denied') === '1') {
      const note = document.getElementById('loginNotice');
      if (note) { note.textContent = 'Please sign in with a demo account to view that page.'; note.classList.remove('hidden'); }
    }

    // Show / hide password
    const toggle = document.getElementById('togglePassword');
    toggle?.addEventListener('click', () => {
      const showing = passwordEl.type === 'text';
      passwordEl.type = showing ? 'password' : 'text';
      toggle.setAttribute('aria-pressed', String(!showing));
      toggle.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
      const eye = toggle.querySelector('[data-icon="eye"]');
      const eyeOff = toggle.querySelector('[data-icon="eyeOff"]');
      eye?.classList.toggle('hidden', !showing);
      eyeOff?.classList.toggle('hidden', showing);
    });

    // Demo credential fill buttons
    document.querySelectorAll('[data-fill-demo]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const [email, password] = btn.getAttribute('data-fill-demo').split('|');
        emailEl.value = email;
        passwordEl.value = password;
        errorEl?.classList.add('hidden');
        passwordEl.focus();
      });
    });

    document.getElementById('forgotPasswordLink')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.LittleSteps) window.LittleSteps.toast('Demo only: use the demo credentials shown above. No reset email is sent.', 'info');
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = emailEl.value.trim();
      const password = passwordEl.value;
      const fail = (msg) => {
        if (errorEl) { errorEl.textContent = msg; errorEl.classList.remove('hidden'); }
      };
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { fail('Please enter a valid email address.'); return; }
      if (password.length < 6) { fail('Password must be at least 6 characters.'); return; }

      const result = demoLogin(email, password);
      if (!result.ok) { fail(result.error); return; }

      if (errorEl) errorEl.classList.add('hidden');
      const next = params.get('next');
      const target = (next && next.startsWith('/')) || (next && !next.includes('://'))
        ? next
        : (result.role === 'admin' ? 'dashboard/admin-dashboard.html' : 'dashboard/parent-dashboard.html');
      window.location.href = target;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoginPage);
  } else {
    initLoginPage();
  }

  window.LittleStepsAuth = { DEMO_USERS, demoLogin, logout, requireRole };
})();

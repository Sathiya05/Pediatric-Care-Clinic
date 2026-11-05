/* ============================================================
   LittleSteps Pediatric Care - main.js
   Shared behaviour for every page:
   - Theme (light/dark) + RTL initialisation & persistence
   - Toast notifications
   - FAQ accordions
   - Back-to-top button
   - Form validation helpers
   - Demo data seeding (localStorage) & reset
   ============================================================ */
'use strict';

const LittleSteps = (() => {
  const LS = {
    theme: 'ls_theme',
    dir: 'ls_dir',
    session: 'ls_session',
    seeded: 'ls_demo_seeded'
  };

  /* ---------- Safe DOM helpers ---------- */
  const qs = (sel, ctx) => (ctx || document).querySelector(sel);
  const qsa = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  const escapeHTML = (value) =>
    String(value ?? '').replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));

  const store = {
    get(key, fallback = null) {
      try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { console.warn('LittleSteps: storage unavailable', e); }
    },
    remove(key) { try { localStorage.removeItem(key); } catch { /* noop */ } }
  };

  /* ---------- Date & age helpers ---------- */
  const todayISO = () => new Date().toISOString().slice(0, 10);

  const formatDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
    if (Number.isNaN(d.getTime())) return escapeHTML(iso);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const calcAge = (dobIso) => {
    const dob = new Date(dobIso + 'T00:00:00');
    if (Number.isNaN(dob.getTime())) return { years: 0, months: 0, label: '—' };
    const now = new Date();
    let years = now.getFullYear() - dob.getFullYear();
    let months = now.getMonth() - dob.getMonth();
    if (now.getDate() < dob.getDate()) months -= 1;
    if (months < 0) { years -= 1; months += 12; }
    if (years < 0) { years = 0; months = 0; }
    const label = years === 0 ? `${months} mo` : `${years} yr ${months} mo`;
    return { years, months, label };
  };

  /* ---------- Theme ---------- */
  const getPreferredTheme = () => {
    try {
      const saved = localStorage.getItem(LS.theme);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch { /* ignore */ }
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  };

  const applyTheme = (theme) => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try { localStorage.setItem(LS.theme, theme); } catch { /* ignore */ }
    qsa('[data-action="toggle-theme"]').forEach((btn) => {
      const isDark = theme === 'dark';
      btn.setAttribute('aria-pressed', String(isDark));
      btn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
      btn.setAttribute('aria-label', btn.title);
      const sun = qs('[data-icon="sun"]', btn);
      const moon = qs('[data-icon="moon"]', btn);
      if (sun) sun.classList.toggle('hidden', isDark);
      if (moon) moon.classList.toggle('hidden', !isDark);
    });
  };

  const toggleTheme = () => applyTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark');

  /* ---------- RTL ---------- */
  const getPreferredDir = () => {
    try { const saved = localStorage.getItem(LS.dir); if (saved === 'rtl' || saved === 'ltr') return saved; } catch { /* ignore */ }
    return 'ltr';
  };

  const applyDir = (dir) => {
    document.documentElement.setAttribute('dir', dir);
    try { localStorage.setItem(LS.dir, dir); } catch { /* ignore */ }
    qsa('[data-action="toggle-rtl"]').forEach((btn) => {
      const isRtl = dir === 'rtl';
      btn.setAttribute('aria-pressed', String(isRtl));
      btn.title = isRtl ? 'Switch to left-to-right layout' : 'Switch to right-to-left layout';
      btn.setAttribute('aria-label', btn.title);
    });
  };

  const toggleDir = () => applyDir(document.documentElement.getAttribute('dir') === 'rtl' ? 'ltr' : 'rtl');

  /* ---------- Toast ---------- */
  const ensureToastContainer = () => {
    let container = qs('#toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'true');
      document.body.appendChild(container);
    }
    return container;
  };

  const toast = (message, type = 'info') => {
    const container = ensureToastContainer();
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    const icon = type === 'success'
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93 9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
      : type === 'error'
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    el.innerHTML = `<span class="shrink-0 mt-0.5 ${type === 'success' ? 'text-emerald-600' : type === 'error' ? 'text-red-600' : 'text-[color:var(--primary)]'}">${icon}</span><span>${escapeHTML(message)}</span>`;
    container.appendChild(el);
    window.setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateY(6px)'; window.setTimeout(() => el.remove(), 250); }, 4200);
  };

  /* ---------- FAQ accordion ---------- */
  const initFAQ = () => {
    qsa('.faq-item').forEach((item) => {
      const btn = qs('.faq-question', item);
      if (!btn) return;
      btn.setAttribute('aria-expanded', item.dataset.open === 'true' ? 'true' : 'false');
      btn.addEventListener('click', () => {
        const open = item.dataset.open === 'true';
        const single = item.hasAttribute('data-single');
        if (single && !open) {
          qsa('.faq-item[data-single]').forEach((other) => {
            other.dataset.open = 'false';
            qs('.faq-question', other)?.setAttribute('aria-expanded', 'false');
          });
        }
        item.dataset.open = String(!open);
        btn.setAttribute('aria-expanded', String(!open));
      });
    });
  };

  /* ---------- Back to top ---------- */
  const initBackToTop = () => {
    if (qs('#backToTop')) return;
    const btn = document.createElement('button');
    btn.id = 'backToTop';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Back to top');
    btn.title = 'Back to top';
    btn.className = 'fixed bottom-6 end-5 z-[60] btn-icon shadow-soft opacity-0 pointer-events-none transition-all duration-300 bg-[color:var(--card)]';
    btn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5"/><polyline points="5 12 12 5 19 12"/></svg>';
    document.body.appendChild(btn);
    const onScroll = () => {
      const show = window.scrollY > 420;
      btn.classList.toggle('opacity-0', !show);
      btn.classList.toggle('pointer-events-none', !show);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  /* ---------- Validation helpers ---------- */
  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim());
  const isPhone = (v) => /^\+?[0-9][0-9\s\-()]{6,19}$/.test(String(v).trim());
  const isNotPastDate = (iso) => !!iso && iso >= todayISO();

  const setFieldError = (input, message) => {
    const wrapper = input.closest('.field-wrap') || input.parentElement;
    let err = qs('.field-error', wrapper);
    if (message) {
      if (!err) {
        err = document.createElement('p');
        err.className = 'field-error';
        err.setAttribute('role', 'alert');
        wrapper.appendChild(err);
      }
      err.textContent = message;
      input.setAttribute('aria-invalid', 'true');
      input.classList.add('border-red-500');
    } else {
      if (err) err.remove();
      input.removeAttribute('aria-invalid');
      input.classList.remove('border-red-500');
    }
  };

  /* ============================================================
     Demo data seeding (localStorage). NEVER real patient data.
     ============================================================ */
  const SEED_KEYS = ['ls_parents', 'ls_children', 'ls_appointments', 'ls_vaccines', 'ls_growth', 'ls_history', 'ls_messages', 'ls_doctors'];

  const seedData = () => ({
    ls_parents: [
      { id: 'par1', name: 'Priya Sharma', email: 'priya.demo@example.com', phone: '+1 (555) 210-3344', since: '2025-01-12' },
      { id: 'par2', name: 'Rahul Mehta', email: 'rahul.demo@example.com', phone: '+1 (555) 873-1190', since: '2025-03-02' },
      { id: 'par3', name: 'Anita Desai', email: 'anita.demo@example.com', phone: '+1 (555) 642-7781', since: '2025-04-18' },
      { id: 'par4', name: 'Karan Patel', email: 'karan.demo@example.com', phone: '+1 (555) 390-5521', since: '2025-06-30' },
      { id: 'par5', name: 'Sara Iyer', email: 'sara.demo@example.com', phone: '+1 (555) 745-9012', since: '2025-08-09' },
      { id: 'par6', name: 'Dev Malhotra', email: 'dev.demo@example.com', phone: '+1 (555) 128-6643', since: '2025-09-21' }
    ],
    ls_children: [
      { id: 'ch1', parentId: 'par1', name: 'Aarav Sharma', dob: '2021-06-14', gender: 'Male', bloodGroup: 'B+', avatar: 'child-avatar-2.jpg' },
      { id: 'ch2', parentId: 'par1', name: 'Mishka Sharma', dob: '2024-03-02', gender: 'Female', bloodGroup: 'O+', avatar: 'child-avatar-1.jpg' },
      { id: 'ch3', parentId: 'par2', name: 'Vivaan Mehta', dob: '2019-11-20', gender: 'Male', bloodGroup: 'A+', avatar: 'child-avatar-2.jpg' },
      { id: 'ch4', parentId: 'par3', name: 'Ira Desai', dob: '2022-08-09', gender: 'Female', bloodGroup: 'AB+', avatar: 'child-avatar-3.jpg' },
      { id: 'ch5', parentId: 'par4', name: 'Reyansh Patel', dob: '2023-01-25', gender: 'Male', bloodGroup: 'O-', avatar: 'child-avatar-2.jpg' }
    ],
    ls_appointments: [
      { id: 'ap1', parentId: 'par1', parentName: 'Priya Sharma', childName: 'Aarav Sharma', childDob: '2021-06-14', email: 'priya.demo@example.com', phone: '+1 (555) 210-3344', type: 'Well-child visit', date: offsetDate(14), time: '10:30', notes: 'Routine 4-year checkup.', status: 'Confirmed', createdAt: offsetDate(-20) },
      { id: 'ap2', parentId: 'par1', parentName: 'Priya Sharma', childName: 'Mishka Sharma', childDob: '2024-03-02', email: 'priya.demo@example.com', phone: '+1 (555) 210-3344', type: 'Vaccination', date: offsetDate(32), time: '11:15', notes: 'Demo visit - 18-month vaccines discussion.', status: 'Pending', createdAt: offsetDate(-6) },
      { id: 'ap3', parentId: 'par2', parentName: 'Rahul Mehta', childName: 'Vivaan Mehta', childDob: '2019-11-20', email: 'rahul.demo@example.com', phone: '+1 (555) 873-1190', type: 'Growth monitoring', date: offsetDate(0), time: '09:00', notes: 'Height & weight tracking.', status: 'Confirmed', createdAt: offsetDate(-12) },
      { id: 'ap4', parentId: 'par3', parentName: 'Anita Desai', childName: 'Ira Desai', childDob: '2022-08-09', email: 'anita.demo@example.com', phone: '+1 (555) 642-7781', type: 'Developmental screening', date: offsetDate(-30), time: '15:45', notes: 'Completed developmental review.', status: 'Completed', createdAt: offsetDate(-45) },
      { id: 'ap5', parentId: 'par4', parentName: 'Karan Patel', childName: 'Reyansh Patel', childDob: '2023-01-25', email: 'karan.demo@example.com', phone: '+1 (555) 390-5521', type: 'Nutrition guidance', date: offsetDate(-75), time: '13:00', notes: 'First solids guidance.', status: 'Completed', createdAt: offsetDate(-90) }
    ],
    ls_vaccines: [
      { id: 'vac1', childId: 'ch1', name: 'Diphtheria-Tetanus-Pertussis (DTaP) booster — illustrative', dueDate: offsetDate(21), completedDate: null, status: 'pending' },
      { id: 'vac2', childId: 'ch1', name: 'MMR (measles, mumps, rubella) — illustrative', dueDate: '2022-06-20', completedDate: '2022-06-25', status: 'completed' },
      { id: 'vac3', childId: 'ch1', name: 'Influenza (seasonal) — illustrative', dueDate: offsetDate(-160), completedDate: offsetDate(-158), status: 'completed' },
      { id: 'vac4', childId: 'ch2', name: 'Hepatitis B (birth dose + follow-ups) — illustrative', dueDate: '2024-03-02', completedDate: '2024-03-02', status: 'completed' },
      { id: 'vac5', childId: 'ch2', name: 'PCV (pneumococcal) — illustrative', dueDate: offsetDate(10), completedDate: null, status: 'pending' },
      { id: 'vac6', childId: 'ch3', name: 'Tdap booster (adolescent) — illustrative', dueDate: offsetDate(45), completedDate: null, status: 'pending' }
    ],
    ls_growth: [
      { id: 'gr1', childId: 'ch1', date: offsetDate(-400), height: 96, weight: 14.2, head: 50 },
      { id: 'gr2', childId: 'ch1', date: offsetDate(-300), height: 99, weight: 15.0, head: 50.5 },
      { id: 'gr3', childId: 'ch1', date: offsetDate(-200), height: 102, weight: 15.8, head: 51 },
      { id: 'gr4', childId: 'ch1', date: offsetDate(-120), height: 105, weight: 16.6, head: 51 },
      { id: 'gr5', childId: 'ch1', date: offsetDate(-45), height: 108, weight: 17.4, head: 51.2 },
      { id: 'gr6', childId: 'ch2', date: offsetDate(-180), height: 66, weight: 7.6, head: 43 },
      { id: 'gr7', childId: 'ch2', date: offsetDate(-90), height: 70, weight: 8.4, head: 44 },
      { id: 'gr8', childId: 'ch2', date: offsetDate(-15), height: 74, weight: 9.1, head: 44.5 }
    ],
    ls_history: [
      { id: 'hi1', childId: 'ch1', date: offsetDate(-30), title: 'Well-child visit (demo)', detail: 'Routine checkup. Growth on expected trajectory; guidance given on sleep routine.' },
      { id: 'hi2', childId: 'ch1', date: offsetDate(-140), title: 'Seasonal allergies discussion (demo)', detail: 'Environmental allergy symptoms discussed; pediatrician recommended monitoring.' },
      { id: 'hi3', childId: 'ch2', date: offsetDate(-15), title: '6-month review (demo)', detail: 'Feeding and sleep reviewed. Weight and length recorded.' }
    ],
    ls_messages: [
      { id: 'msg1', name: 'Nora Kapoor', email: 'nora.demo@example.com', subject: 'Question about immunization visit', message: 'Hello, we would like to know what to bring to Mishka\'s vaccination visit. Thank you!', date: offsetDate(-2), read: false },
      { id: 'msg2', name: 'Imran Sheikh', email: 'imran.demo@example.com', subject: 'Rescheduling request (demo)', message: 'Could we move Saturday\'s appointment to the following week?', date: offsetDate(-4), read: false },
      { id: 'msg3', name: 'Laila Thomas', email: 'laila.demo@example.com', subject: 'Thank you note', message: 'Thank you for the warm welcome during our first visit!', date: offsetDate(-9), read: true },
      { id: 'msg4', name: 'Owen Brooks', email: 'owen.demo@example.com', subject: 'Nutrition guidance', message: 'Looking for advice on healthy snacks for a picky eater, age 3.', date: offsetDate(-13), read: true }
    ],
    ls_doctors: [
      { id: 'doc1', name: 'Dr. Amara Bennett, MD, FAAP (Demo)', specialty: 'General Pediatrics', qualification: 'MD, Fellowship in General Pediatrics — 12 yrs experience (demo profile)', availability: 'Available', days: 'Mon · Tue · Thu', avatar: 'doctor-1.jpg' },
      { id: 'doc2', name: 'Dr. Rajiv Nair, MD, DCH (Demo)', specialty: 'Developmental-Behavioral Pediatrics', qualification: 'MD, DCH, Fellowship in Developmental Pediatrics — 10 yrs experience (demo profile)', availability: 'Available', days: 'Tue · Wed · Fri', avatar: 'doctor-2.jpg' },
      { id: 'doc3', name: 'Dr. Elena Petrova, MD, MPH (Demo)', specialty: 'Pediatric Nutrition & Wellness', qualification: 'MD, MPH — 8 yrs experience (demo profile)', availability: 'On leave', days: 'Mon · Wed', avatar: 'doctor-3.jpg' },
      { id: 'doc4', name: 'Dr. Marcus Whitfield, MD (Demo)', specialty: 'Newborn & Adolescent Care', qualification: 'MD, Residency in Pediatrics — 9 yrs experience (demo profile)', availability: 'Available', days: 'Thu · Fri · Sat', avatar: 'doctor-4.jpg' }
    ]
  });

  function offsetDate(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  const seedDemoData = () => {
    const seed = seedData();
    Object.entries(seed).forEach(([key, value]) => {
      if (localStorage.getItem(key) === null) store.set(key, value);
    });
    store.set(LS.seeded, true);
  };

  const resetDemoData = () => {
    SEED_KEYS.forEach((key) => store.remove(key));
    store.remove(LS.seeded);
    seedDemoData();
    toast('Demo data has been reset to the original sample records. Reloading…', 'success');
    window.setTimeout(() => window.location.reload(), 700);
  };

  /* ---------- Session ---------- */
  const getSession = () => store.get(LS.session, null);
  const clearSession = () => store.remove(LS.session);

  /* ---------- Global click delegation ---------- */
  document.addEventListener('click', (event) => {
    const themeBtn = event.target.closest('[data-action="toggle-theme"]');
    if (themeBtn) { event.preventDefault(); toggleTheme(); return; }
    const rtlBtn = event.target.closest('[data-action="toggle-rtl"]');
    if (rtlBtn) { event.preventDefault(); toggleDir(); return; }
    const resetBtn = event.target.closest('[data-action="reset-demo-data"]');
    if (resetBtn) { event.preventDefault(); resetDemoData(); return; }
  });

  /* ---------- Contact form (contact.html) ---------- */
  const initContactForm = () => {
    const form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = form.elements['contactName'];
      const email = form.elements['contactEmail'];
      const subject = form.elements['contactSubject'];
      const message = form.elements['contactMessage'];
      let ok = true;
      if (name.value.trim().length < 2) { setFieldError(name, 'Please enter your name.'); ok = false; } else setFieldError(name, '');
      if (!isEmail(email.value)) { setFieldError(email, 'Please enter a valid email address.'); ok = false; } else setFieldError(email, '');
      if (subject.value.trim().length < 3) { setFieldError(subject, 'Please add a short subject.'); ok = false; } else setFieldError(subject, '');
      if (message.value.trim().length < 10) { setFieldError(message, 'Please write at least 10 characters.'); ok = false; } else setFieldError(message, '');
      if (!ok) { toast('Please fix the highlighted fields.', 'error'); return; }

      const messages = store.get('ls_messages', []);
      messages.push({
        id: 'msg-' + Date.now(),
        name: name.value.trim(),
        email: email.value.trim(),
        subject: subject.value.trim(),
        message: message.value.trim(),
        date: todayISO(),
        read: false,
        source: 'contact-form-demo'
      });
      store.set('ls_messages', messages);
      form.reset();
      toast('Message saved to the demo inbox (this device only). No email was sent.', 'success');
    });
  };

  /* ---------- Init on DOM ready ---------- */
  const init = () => {
    applyTheme(getPreferredTheme());
    applyDir(getPreferredDir());
    initFAQ();
    initBackToTop();
    initContactForm();
    if (!store.get(LS.seeded)) seedDemoData();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    qs, qsa, escapeHTML, store, formatDate, calcAge, todayISO, offsetDate,
    getPreferredTheme, applyTheme, toggleTheme, applyDir, toggleDir,
    toast, isEmail, isPhone, isNotPastDate, setFieldError,
    seedDemoData, resetDemoData, getSession, clearSession, SEED_KEYS
  };
})();

window.LittleSteps = LittleSteps;

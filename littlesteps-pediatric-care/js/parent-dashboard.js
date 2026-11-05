/* ============================================================
   LittleSteps Pediatric Care - parent-dashboard.js
   Renders the demo parent dashboard: children profiles,
   appointments, vaccination tracker, growth chart (Chart.js),
   health history, settings. Demo data only — localStorage.
   ============================================================ */
'use strict';

(function () {
  const LS = window.LittleSteps;
  if (!LS) return;

  /* ---------- Session guard (demo-level only) ---------- */
  const session = window.LittleStepsAuth ? window.LittleStepsAuth.requireRole('parent') : null;
  if (!session) return;

  const AVATAR_BASE = '../images/dashboard/';
  const FALLBACK_AVATAR = '../images/hero/fallback.jpg';
  const getChildren = () => LS.store.get('ls_children', []);
  const setChildren = (c) => LS.store.set('ls_children', c);
  const getAppointments = () => LS.store.get('ls_appointments', []);
  const setAppointments = (a) => LS.store.set('ls_appointments', a);
  const getVaccines = () => LS.store.get('ls_vaccines', []);
  const getGrowth = () => LS.store.get('ls_growth', []);
  const setGrowth = (g) => LS.store.set('ls_growth', g);
  const getHistory = () => LS.store.get('ls_history', []);
  const setHistory = (h) => LS.store.set('ls_history', h);

  /* ---------- Welcome ---------- */
  const welcome = document.getElementById('dashWelcome');
  if (welcome) welcome.textContent = `Welcome back, ${session.name.replace(' (Demo)', '')}!`;

  /* ============================================================
     View switching (sidebar)
     ============================================================ */
  const viewLinks = LS.qsa('[data-view]');
  const views = LS.qsa('.dash-view');
  const showView = (name) => {
    views.forEach((v) => v.classList.toggle('hidden', v.id !== `view-${name}`));
    viewLinks.forEach((link) => link.classList.toggle('active', link.dataset.view === name));
    // Close the menu drawer after navigation
    setSidebar(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  viewLinks.forEach((link) => link.addEventListener('click', (e) => { e.preventDefault(); showView(link.dataset.view); }));

  const sidebar = document.getElementById('dashSidebar');
  const overlay = document.getElementById('dashSidebarOverlay');
  const toggleBtn = document.getElementById('dashSidebarToggle');
  const iconOpen = document.getElementById('dashIconOpen');
  const iconClose = document.getElementById('dashIconClose');
  const setSidebar = (open) => {
    sidebar?.classList.toggle('sidebar-open', open);
    overlay?.classList.toggle('hidden', !open);
    toggleBtn?.setAttribute('aria-expanded', String(open));
    iconOpen?.classList.toggle('hidden', open);
    iconClose?.classList.toggle('hidden', !open);
  };
  toggleBtn?.addEventListener('click', () => setSidebar(!sidebar.classList.contains('sidebar-open')));
  overlay?.addEventListener('click', () => setSidebar(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setSidebar(false); });
  // Reset drawer state when the viewport grows into desktop (>= 1377px)
  window.addEventListener('resize', () => { if (window.innerWidth >= 1377) setSidebar(false); });

  /* ---------- Notifications dropdown (top bar + menu drawer) ---------- */
  const wireNotif = (btnId, panelId) => {
    const btn = document.getElementById(btnId);
    const panel = document.getElementById(panelId);
    if (!btn || !panel) return;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.classList.toggle('hidden');
      btn.setAttribute('aria-expanded', String(!panel.classList.contains('hidden')));
    });
    document.addEventListener('click', () => panel.classList.add('hidden'));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') panel.classList.add('hidden'); });
  };
  wireNotif('parentNotifBtn', 'parentNotifPanel');
  wireNotif('drawerNotifBtn', 'drawerNotifPanel');

  /* ---------- Logout ---------- */
  LS.qsa('[data-action="logout"]').forEach((btn) => btn.addEventListener('click', () => {
    if (window.LittleStepsAuth) window.LittleStepsAuth.logout();
  }));

  /* ============================================================
     Overview stats
     ============================================================ */
  const renderStats = () => {
    const children = getChildren();
    const appointments = getAppointments();
    const vaccines = getVaccines();
    const growth = getGrowth();
    const today = LS.todayISO();

    const upcoming = appointments.filter((a) => a.date >= today && ['Confirmed', 'Pending'].includes(a.status));
    const pendingVaccines = vaccines.filter((v) => v.status === 'pending');
    const latestGrowth = growth.slice().sort((a, b) => b.date.localeCompare(a.date))[0];

    const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
    set('statChildren', String(children.length));
    set('statUpcoming', String(upcoming.length));
    set('statVaccines', String(pendingVaccines.length));
    set('statGrowth', latestGrowth ? `${LS.formatDate(latestGrowth.date)}` : '—');
  };

  /* ============================================================
     Overview preview cards (appointments + vaccine reminders)
     ============================================================ */
  const renderOverviewCards = () => {
    const today = LS.todayISO();
    const children = getChildren();

    /* --- Upcoming appointments --- */
    const apptList = document.getElementById('ovAppointments');
    if (apptList) {
      const upcoming = getAppointments()
        .filter((a) => a.date >= today && ['Confirmed', 'Pending'].includes(a.status))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 3);
      if (!upcoming.length) {
        apptList.innerHTML = '<li class="text-sm text-[color:var(--text-secondary)]">No upcoming appointments in the demo data.</li>';
      } else {
        apptList.innerHTML = upcoming.map((a) => `
          <li class="flex items-start justify-between gap-3 rounded-2xl bg-[color:var(--accent)] px-4 py-3">
            <span>
              <span class="block font-heading font-bold text-sm">${LS.escapeHTML(a.type)}</span>
              <span class="block text-xs text-[color:var(--text-secondary)]">${LS.escapeHTML(a.childName)} · ${LS.escapeHTML(LS.formatDate(a.date))} at ${LS.escapeHTML(a.time)}</span>
            </span>
            <span class="${a.status === 'Confirmed' ? 'badge-success' : 'badge-warning'} shrink-0">${LS.escapeHTML(a.status)}</span>
          </li>`).join('');
      }
    }

    /* --- Vaccine reminders --- */
    const vacList = document.getElementById('ovVaccines');
    if (vacList) {
      const nameOf = (id) => children.find((c) => c.id === id)?.name || 'General';
      const pending = getVaccines()
        .filter((v) => v.status === 'pending')
        .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
        .slice(0, 3);
      if (!pending.length) {
        vacList.innerHTML = '<li class="text-sm text-[color:var(--text-secondary)]">No pending vaccines in the demo data — all caught up!</li>';
      } else {
        vacList.innerHTML = pending.map((v) => `
          <li class="flex items-start justify-between gap-3 rounded-2xl bg-[color:var(--accent)] px-4 py-3">
            <span>
              <span class="block font-heading font-bold text-sm">${LS.escapeHTML(v.name)}</span>
              <span class="block text-xs text-[color:var(--text-secondary)]">${LS.escapeHTML(nameOf(v.childId))} · due ${LS.escapeHTML(LS.formatDate(v.dueDate))}</span>
            </span>
            <span class="badge-warning shrink-0">Due</span>
          </li>`).join('');
      }
    }
  };

  /* ============================================================
     My Children
     ============================================================ */
  const renderChildren = () => {
    const grid = document.getElementById('childrenGrid');
    if (!grid) return;
    const children = getChildren();
    if (!children.length) {
      grid.innerHTML = '<div class="empty-state col-span-full"><p class="font-heading font-bold text-lg">No children added yet</p><p class="text-sm text-[color:var(--text-secondary)] mt-1">Use the form to add a child profile (demo data stays on this device).</p></div>';
      return;
    }
    grid.innerHTML = children.map((child) => {
      const age = LS.calcAge(child.dob);
      const avatar = child.avatar ? AVATAR_BASE + LS.escapeHTML(child.avatar) : FALLBACK_AVATAR;
      return `
      <article class="card card-hover p-5 flex flex-col items-center text-center gap-3">
        <img src="${avatar}" alt="Portrait of ${LS.escapeHTML(child.name)} (demo avatar)" width="96" height="96" loading="lazy"
             class="w-24 h-24 rounded-full object-cover border-4 border-[color:var(--accent)]" onerror="this.onerror=null;this.src='${FALLBACK_AVATAR}'">
        <div>
          <h3 class="font-heading font-bold text-lg">${LS.escapeHTML(child.name)}</h3>
          <p class="text-xs text-[color:var(--text-secondary)]">${LS.escapeHTML(child.gender || '')} · Blood group ${LS.escapeHTML(child.bloodGroup || '—')}</p>
        </div>
        <dl class="grid grid-cols-2 gap-2 text-xs w-full">
          <div class="rounded-2xl bg-[color:var(--peach)] p-2"><dt class="text-[color:var(--text-secondary)]">Date of birth</dt><dd class="font-bold">${LS.escapeHTML(LS.formatDate(child.dob))}</dd></div>
          <div class="rounded-2xl bg-[color:var(--accent)] p-2"><dt class="text-[color:var(--text-secondary)]">Age</dt><dd class="font-bold">${LS.escapeHTML(age.label)}</dd></div>
        </dl>
        <button type="button" class="btn-ghost btn-sm" data-remove-child="${LS.escapeHTML(child.id)}">Remove (demo)</button>
      </article>`;
    }).join('');
  };

  document.getElementById('addChildForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.target;
    const name = form.elements['childName'].value.trim();
    const dob = form.elements['childDob'].value;
    const gender = form.elements['childGender'].value;
    const bloodGroup = form.elements['childBloodGroup'].value.trim();
    if (name.length < 2) { LS.toast('Please enter the child\'s name.', 'error'); return; }
    if (!dob || dob > LS.todayISO()) { LS.toast('Date of birth cannot be in the future.', 'error'); return; }
    const children = getChildren();
    const avatars = ['child-avatar-1.jpg', 'child-avatar-2.jpg', 'child-avatar-3.jpg'];
    children.push({ id: 'ch-' + Date.now(), parentId: 'par1', name, dob, gender, bloodGroup: bloodGroup || '—', avatar: avatars[children.length % avatars.length] });
    setChildren(children);
    form.reset();
    LS.toast('Child profile added (stored only on this device).', 'success');
    refreshAll();
  });

  document.getElementById('childrenGrid')?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-remove-child]');
    if (!btn) return;
    const id = btn.getAttribute('data-remove-child');
    setChildren(getChildren().filter((c) => c.id !== id));
    LS.toast('Child profile removed from demo data.', 'info');
    refreshAll();
  });

  /* ============================================================
     Appointments
     ============================================================ */
  const statusBadge = (status) => ({
    'Confirmed': '<span class="badge-success">Confirmed</span>',
    'Pending': '<span class="badge-warning">Pending</span>',
    'Completed': '<span class="badge-info">Completed</span>',
    'Cancelled': '<span class="badge-danger">Cancelled</span>'
  }[status] || '<span class="badge-neutral">' + LS.escapeHTML(status) + '</span>');

  const renderAppointments = () => {
    const today = LS.todayISO();
    const mine = getAppointments().filter((a) => !a.parentId || a.parentId === 'par1' || a.source === 'website-demo');
    const upcoming = mine.filter((a) => a.date >= today && a.status !== 'Cancelled').sort((a, b) => a.date.localeCompare(b.date));
    const past = mine.filter((a) => a.date < today || a.status === 'Cancelled').sort((a, b) => b.date.localeCompare(a.date));

    const renderList = (list, containerId, emptyText) => {
      const el = document.getElementById(containerId);
      if (!el) return;
      if (!list.length) { el.innerHTML = `<p class="text-sm text-[color:var(--text-secondary)] py-4">${emptyText}</p>`; return; }
      el.innerHTML = list.map((a) => `
        <li class="flex flex-col sm:flex-row sm:items-center gap-3 border border-[color:var(--border)] rounded-2xl p-4 bg-[color:var(--card)]">
          <div class="flex-1">
            <p class="font-heading font-bold">${LS.escapeHTML(a.type)} <span class="text-[color:var(--text-secondary)] font-normal">· ${LS.escapeHTML(a.childName)}</span></p>
            <p class="text-sm text-[color:var(--text-secondary)]">${LS.escapeHTML(LS.formatDate(a.date))} at ${LS.escapeHTML(a.time)}${a.reference ? ' · Ref ' + LS.escapeHTML(a.reference) : ''}</p>
          </div>
          <div class="flex items-center gap-2">
            ${statusBadge(a.status)}
            ${a.date >= today && a.status !== 'Cancelled' ? `<button type="button" class="btn-danger btn-sm" data-cancel-appointment="${LS.escapeHTML(a.id)}">Cancel</button>` : ''}
          </div>
        </li>`).join('');
    };

    renderList(upcoming, 'upcomingAppointments', 'No upcoming appointments. Book one from the Appointments page.');
    renderList(past, 'pastAppointments', 'No previous appointments yet.');
  };

  document.getElementById('view-appointments')?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-cancel-appointment]');
    if (!btn) return;
    const id = btn.getAttribute('data-cancel-appointment');
    const appointments = getAppointments();
    const appt = appointments.find((a) => a.id === id);
    if (appt) {
      appt.status = 'Cancelled';
      setAppointments(appointments);
      LS.toast('Appointment cancelled in demo data.', 'info');
      refreshAll();
    }
  });

  /* ============================================================
     Growth records + Chart.js
     ============================================================ */
  let growthChart = null;

  const renderGrowthChart = () => {
    const canvas = document.getElementById('growthChart');
    if (!canvas || typeof window.Chart === 'undefined') return;
    const records = getGrowth().slice().sort((a, b) => a.date.localeCompare(b.date));
    // Chart shows Aarav (ch1) by default; otherwise the first child found
    const targetId = records.some((r) => r.childId === 'ch1') ? 'ch1' : records[0]?.childId;
    const points = records.filter((r) => r.childId === targetId);
    const labels = points.map((r) => LS.formatDate(r.date));
    const heights = points.map((r) => r.height);
    const weights = points.map((r) => r.weight);

    const gridColor = document.documentElement.classList.contains('dark') ? 'rgba(203,213,225,.15)' : 'rgba(100,116,139,.18)';

    if (growthChart) growthChart.destroy();
    growthChart = new window.Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Height (cm)', data: heights, borderColor: '#287C91', backgroundColor: 'rgba(40,124,145,.15)', tension: 0.35, fill: true, yAxisID: 'y' },
          { label: 'Weight (kg)', data: weights, borderColor: '#F4A261', backgroundColor: 'rgba(244,162,97,.15)', tension: 0.35, fill: true, yAxisID: 'y1' }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' }, title: { display: true, text: 'Growth measurements (demo records)' } },
        scales: {
          x: { grid: { color: gridColor } },
          y: { position: 'left', title: { display: true, text: 'cm' }, grid: { color: gridColor } },
          y1: { position: 'right', title: { display: true, text: 'kg' }, grid: { drawOnChartArea: false } }
        }
      }
    });
  };

  const renderGrowthTable = () => {
    const tbody = document.getElementById('growthTableBody');
    if (!tbody) return;
    const records = getGrowth().slice().sort((a, b) => b.date.localeCompare(a.date));
    if (!records.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-6 text-[color:var(--text-secondary)]">No measurements yet.</td></tr>';
      return;
    }
    const children = getChildren();
    const nameOf = (id) => children.find((c) => c.id === id)?.name || '—';
    tbody.innerHTML = records.map((r) => `
      <tr>
        <td class="font-semibold">${LS.escapeHTML(nameOf(r.childId))}</td>
        <td>${LS.escapeHTML(LS.formatDate(r.date))}</td>
        <td>${LS.escapeHTML(String(r.height))} cm</td>
        <td>${LS.escapeHTML(String(r.weight))} kg</td>
        <td>${r.head ? LS.escapeHTML(String(r.head)) + ' cm' : '—'}</td>
      </tr>`).join('');
  };

  document.getElementById('addMeasurementForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.target;
    const childId = form.elements['measureChild'].value;
    const date = form.elements['measureDate'].value;
    const height = parseFloat(form.elements['height'].value);
    const weight = parseFloat(form.elements['weight'].value);
    const headRaw = form.elements['head'].value;
    const head = headRaw ? parseFloat(headRaw) : null;
    if (!childId || !date || Number.isNaN(height) || Number.isNaN(weight) || height <= 0 || weight <= 0) {
      LS.toast('Please fill child, date, height and weight with valid values.', 'error');
      return;
    }
    const records = getGrowth();
    records.push({ id: 'gr-' + Date.now(), childId, date, height, weight, head });
    setGrowth(records);
    form.reset();
    form.elements['measureDate'].value = LS.todayISO();
    LS.toast('Measurement saved (demo record on this device).', 'success');
    renderGrowthTable();
    renderGrowthChart();
    renderStats();
  });

  // Populate child select in measurement form
  const measureChild = document.getElementById('measureChild');
  if (measureChild) {
    measureChild.innerHTML = '<option value="">Select child…</option>' + getChildren().map((c) => `<option value="${LS.escapeHTML(c.id)}">${LS.escapeHTML(c.name)}</option>`).join('');
  }
  const measureDate = document.getElementById('measureDate');
  if (measureDate) measureDate.value = LS.todayISO();

  /* ============================================================
     Health history
     ============================================================ */
  const renderHistory = () => {
    const list = document.getElementById('historyList');
    if (!list) return;
    const history = getHistory().slice().sort((a, b) => b.date.localeCompare(a.date));
    const children = getChildren();
    const nameOf = (id) => children.find((c) => c.id === id)?.name || 'General';
    if (!history.length) {
      list.innerHTML = '<li class="text-sm text-[color:var(--text-secondary)]">No history entries yet.</li>';
      return;
    }
    list.innerHTML = history.map((h) => `
      <li class="border border-[color:var(--border)] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-start gap-3">
        <div class="flex-1">
          <p class="font-heading font-bold">${LS.escapeHTML(h.title)} <span class="text-xs font-normal text-[color:var(--text-secondary)]">· ${LS.escapeHTML(nameOf(h.childId))} · ${LS.escapeHTML(LS.formatDate(h.date))}</span></p>
          <p class="text-sm text-[color:var(--text-secondary)] mt-1">${LS.escapeHTML(h.detail)}</p>
        </div>
        <button type="button" class="btn-ghost btn-sm text-red-600 dark:text-red-400" data-remove-history="${LS.escapeHTML(h.id)}">Delete</button>
      </li>`).join('');
  };

  document.getElementById('addHistoryForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.target;
    const title = form.elements['historyTitle'].value.trim();
    const detail = form.elements['historyDetail'].value.trim();
    const childId = form.elements['historyChild'].value;
    if (title.length < 3 || detail.length < 5) { LS.toast('Please enter a title and a short description.', 'error'); return; }
    const history = getHistory();
    history.push({ id: 'hi-' + Date.now(), childId: childId || 'general', date: LS.todayISO(), title, detail });
    setHistory(history);
    form.reset();
    LS.toast('Health history entry added (demo).', 'success');
    renderHistory();
  });

  const historyChild = document.getElementById('historyChild');
  if (historyChild) {
    historyChild.innerHTML = '<option value="general">General</option>' + getChildren().map((c) => `<option value="${LS.escapeHTML(c.id)}">${LS.escapeHTML(c.name)}</option>`).join('');
  }

  document.getElementById('historyList')?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-remove-history]');
    if (!btn) return;
    setHistory(getHistory().filter((h) => h.id !== btn.getAttribute('data-remove-history')));
    LS.toast('History entry deleted (demo).', 'info');
    renderHistory();
  });

  /* ============================================================
     Settings
     ============================================================ */
  const profile = LS.store.get('ls_parent_profile', { name: 'Priya Sharma', email: 'priya.demo@example.com', phone: '+1 (555) 210-3344' });
  const profileForm = document.getElementById('parentProfileForm');
  if (profileForm) {
    profileForm.elements['profileName'].value = profile.name || '';
    profileForm.elements['profileEmail'].value = profile.email || '';
    profileForm.elements['profilePhone'].value = profile.phone || '';
    profileForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = profileForm.elements['profileName'].value.trim();
      const email = profileForm.elements['profileEmail'].value.trim();
      const phone = profileForm.elements['profilePhone'].value.trim();
      if (name.length < 2 || !LS.isEmail(email) || !LS.isPhone(phone)) {
        LS.toast('Please check your name, email and phone number.', 'error');
        return;
      }
      LS.store.set('ls_parent_profile', { name, email, phone });
      LS.toast('Profile saved on this device (demo).', 'success');
    });
  }

  document.getElementById('demoPasswordForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.target;
    const next = form.elements['newPassword'].value;
    const confirm = form.elements['confirmPassword'].value;
    if (next.length < 8) { LS.toast('Demo password must be at least 8 characters.', 'error'); return; }
    if (next !== confirm) { LS.toast('Passwords do not match.', 'error'); return; }
    form.reset();
    LS.toast('Password change is a UI demonstration only — no credentials were stored or sent.', 'info');
  });

  /* ---------- Refresh & init ---------- */
  function refreshAll() {
    renderStats();
    renderOverviewCards();
    renderChildren();
    renderAppointments();
    renderGrowthTable();
    renderGrowthChart();
    renderHistory();
    window.LittleStepsVaccination?.populateChildControls();
    window.LittleStepsVaccination?.render();
  }

  refreshAll();
  showView('overview');
})();

/* ============================================================
   LittleSteps Pediatric Care - admin-dashboard.js
   Demo admin panel for clinic staff. All data is sample data
   stored in localStorage. No real patient information is used
   or secured by this frontend-only project.
   ============================================================ */
'use strict';

(function () {
  const LS = window.LittleSteps;
  if (!LS) return;

  /* ---------- Session guard (demo-level only) ---------- */
  const session = window.LittleStepsAuth ? window.LittleStepsAuth.requireRole('admin') : null;
  if (!session) return;

  const AVATAR_BASE = '../images/doctors/';
  const FALLBACK_AVATAR = '../images/hero/fallback.jpg';

  const get = (k, fb) => LS.store.get(k, fb);
  const set = (k, v) => LS.store.set(k, v);
  const getAppointments = () => get('ls_appointments', []);
  const getParents = () => get('ls_parents', []);
  const getChildren = () => get('ls_children', []);
  const getDoctors = () => get('ls_doctors', []);
  const getVaccines = () => get('ls_vaccines', []);
  const getMessages = () => get('ls_messages', []);

  const welcome = document.getElementById('adminWelcome');
  if (welcome) welcome.textContent = `Welcome, ${session.name.replace(' (Demo)', '')}`;

  /* ============================================================
     View switching
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

  LS.qsa('[data-action="logout"]').forEach((btn) => btn.addEventListener('click', () => {
    if (window.LittleStepsAuth) window.LittleStepsAuth.logout();
  }));

  /* ============================================================
     Overview stats
     ============================================================ */
  const renderStats = () => {
    const appointments = getAppointments();
    const today = LS.todayISO();
    const todays = appointments.filter((a) => a.date === today);
    const availableDoctors = getDoctors().filter((d) => d.availability === 'Available');

    const setText = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
    setText('adminStatTotalAppt', String(appointments.length));
    setText('adminStatToday', String(todays.length));
    setText('adminStatParents', String(getParents().length));
    setText('adminStatChildren', String(getChildren().length));
    setText('adminStatDoctors', String(availableDoctors.length));
  };

  /* ============================================================
     Overview preview cards (today's schedule, unread messages,
     vaccines due, doctors on duty)
     ============================================================ */
  const renderOverviewCards = () => {
    const today = LS.todayISO();

    /* --- Today's schedule --- */
    const todayList = document.getElementById('adminOvToday');
    if (todayList) {
      const todays = getAppointments()
        .filter((a) => a.date === today)
        .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
        .slice(0, 4);
      if (!todays.length) {
        todayList.innerHTML = '<li class="text-sm text-[color:var(--text-secondary)]">No appointments scheduled for today in the demo data.</li>';
      } else {
        todayList.innerHTML = todays.map((a) => `
          <li class="flex items-start justify-between gap-3 rounded-2xl bg-[color:var(--accent)] px-4 py-3">
            <span>
              <span class="block font-heading font-bold text-sm">${LS.escapeHTML(a.time)} · ${LS.escapeHTML(a.type)}</span>
              <span class="block text-xs text-[color:var(--text-secondary)]">${LS.escapeHTML(a.childName)} with ${LS.escapeHTML(a.parentName)}</span>
            </span>
            ${statusBadge(a.status)}
          </li>`).join('');
      }
    }

    /* --- Unread messages --- */
    const msgList = document.getElementById('adminOvMessages');
    if (msgList) {
      const unread = getMessages()
        .filter((m) => !m.read)
        .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
        .slice(0, 3);
      if (!unread.length) {
        msgList.innerHTML = '<li class="text-sm text-[color:var(--text-secondary)]">Inbox clear — no unread demo messages.</li>';
      } else {
        msgList.innerHTML = unread.map((m) => `
          <li class="rounded-2xl bg-[color:var(--accent)] px-4 py-3">
            <p class="font-heading font-bold text-sm">${LS.escapeHTML(m.subject)}</p>
            <p class="text-xs text-[color:var(--text-secondary)]">${LS.escapeHTML(m.name)} · ${LS.escapeHTML(LS.formatDate(m.date))}</p>
          </li>`).join('');
      }
    }

    /* --- Vaccines due --- */
    const vacList = document.getElementById('adminOvVaccines');
    if (vacList) {
      const nameOf = (id) => getChildren().find((c) => c.id === id)?.name || 'General';
      const due = getVaccines()
        .filter((v) => v.status === 'pending')
        .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
        .slice(0, 3);
      if (!due.length) {
        vacList.innerHTML = '<li class="text-sm text-[color:var(--text-secondary)]">No pending vaccination records.</li>';
      } else {
        vacList.innerHTML = due.map((v) => `
          <li class="flex items-start justify-between gap-3 rounded-2xl bg-[color:var(--accent)] px-4 py-3">
            <span>
              <span class="block font-heading font-bold text-sm">${LS.escapeHTML(v.name)}</span>
              <span class="block text-xs text-[color:var(--text-secondary)]">${LS.escapeHTML(nameOf(v.childId))} · due ${LS.escapeHTML(LS.formatDate(v.dueDate))}</span>
            </span>
            <span class="badge-warning shrink-0">Due</span>
          </li>`).join('');
      }
    }

    /* --- Doctors on duty --- */
    const docList = document.getElementById('adminOvDoctors');
    if (docList) {
      const available = getDoctors().filter((d) => d.availability === 'Available').slice(0, 4);
      if (!available.length) {
        docList.innerHTML = '<li class="text-sm text-[color:var(--text-secondary)] col-span-full">No doctors marked as available in the demo data.</li>';
      } else {
        docList.innerHTML = available.map((d) => `
          <li class="flex items-center gap-3 rounded-2xl bg-[color:var(--accent)] px-4 py-3">
            <img src="../images/doctors/${LS.escapeHTML(d.avatar || '')}" alt="" width="40" height="40" loading="lazy" class="w-10 h-10 rounded-full object-cover shrink-0" onerror="this.src='../images/hero/fallback.jpg'">
            <span class="min-w-0">
              <span class="block font-heading font-bold text-sm truncate">${LS.escapeHTML(d.name)}</span>
              <span class="block text-xs text-[color:var(--text-secondary)] truncate">${LS.escapeHTML(d.specialty)} · ${LS.escapeHTML(d.days || '—')}</span>
            </span>
          </li>`).join('');
      }
    }
  };

  /* ============================================================
     Appointments management
     ============================================================ */
  const statusBadge = (status) => ({
    'Confirmed': '<span class="badge-success">Confirmed</span>',
    'Pending': '<span class="badge-warning">Pending</span>',
    'Completed': '<span class="badge-info">Completed</span>',
    'Cancelled': '<span class="badge-danger">Cancelled</span>'
  }[status] || '<span class="badge-neutral">' + LS.escapeHTML(status) + '</span>');

  const renderAppointments = () => {
    const tbody = document.getElementById('adminApptTableBody');
    if (!tbody) return;
    const search = (document.getElementById('adminApptSearch')?.value || '').trim().toLowerCase();
    const date = document.getElementById('adminApptDate')?.value || '';
    const type = document.getElementById('adminApptType')?.value || '';

    let rows = getAppointments().slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    if (search) rows = rows.filter((a) => [a.parentName, a.childName, a.email].join(' ').toLowerCase().includes(search));
    if (date) rows = rows.filter((a) => a.date === date);
    if (type) rows = rows.filter((a) => a.type === type);

    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-[color:var(--text-secondary)]">No appointments match these filters.</td></tr>';
      return;
    }
    tbody.innerHTML = rows.map((a) => `
      <tr data-id="${LS.escapeHTML(a.id)}">
        <td>
          <p class="font-semibold">${LS.escapeHTML(a.parentName)}</p>
          <p class="text-xs text-[color:var(--text-secondary)]">${LS.escapeHTML(a.email)}</p>
        </td>
        <td>${LS.escapeHTML(a.childName)}</td>
        <td>${LS.escapeHTML(a.type)}</td>
        <td>${LS.escapeHTML(LS.formatDate(a.date))}<br><span class="text-xs text-[color:var(--text-secondary)]">${LS.escapeHTML(a.time)}</span></td>
        <td>${statusBadge(a.status)}</td>
        <td>
          <div class="flex flex-wrap gap-1.5">
            <button type="button" class="btn-outline btn-sm" data-appt-status="Confirmed">Approve</button>
            <button type="button" class="btn-ghost btn-sm" data-appt-status="Completed">Complete</button>
            <button type="button" class="btn-danger btn-sm" data-appt-status="Cancelled">Cancel</button>
          </div>
        </td>
      </tr>`).join('');
  };

  ['adminApptSearch', 'adminApptDate', 'adminApptType'].forEach((id) => {
    document.getElementById(id)?.addEventListener('input', renderAppointments);
    document.getElementById(id)?.addEventListener('change', renderAppointments);
  });

  document.getElementById('adminApptTableBody')?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-appt-status]');
    if (!btn) return;
    const row = btn.closest('tr');
    const id = row?.dataset.id;
    const appointments = getAppointments();
    const appt = appointments.find((a) => a.id === id);
    if (!appt) return;
    appt.status = btn.getAttribute('data-appt-status');
    set('ls_appointments', appointments);
    LS.toast(`Appointment marked as ${appt.status} (demo).`, 'success');
    renderAppointments();
    renderStats();
  });

  /* ============================================================
     Parents management
     ============================================================ */
  const renderParents = () => {
    const list = document.getElementById('adminParentsList');
    if (!list) return;
    const search = (document.getElementById('adminParentSearch')?.value || '').trim().toLowerCase();
    let parents = getParents();
    if (search) parents = parents.filter((p) => [p.name, p.email, p.phone].join(' ').toLowerCase().includes(search));
    if (!parents.length) {
      list.innerHTML = '<li class="text-sm text-[color:var(--text-secondary)] py-6 text-center">No parents match your search.</li>';
      return;
    }
    const children = getChildren();
    list.innerHTML = parents.map((p) => {
      const kidCount = children.filter((c) => c.parentId === p.id).length;
      return `
      <li class="flex flex-col sm:flex-row sm:items-center gap-3 border border-[color:var(--border)] rounded-2xl p-4 bg-[color:var(--card)]">
        <div class="flex-1">
          <p class="font-heading font-bold">${LS.escapeHTML(p.name)}</p>
          <p class="text-sm text-[color:var(--text-secondary)]">${LS.escapeHTML(p.email)} · ${LS.escapeHTML(p.phone)}</p>
        </div>
        <div class="text-xs text-[color:var(--text-secondary)]">
          <p>${kidCount} child${kidCount === 1 ? '' : 'ren'}</p>
          <p>Since ${LS.escapeHTML(LS.formatDate(p.since))}</p>
        </div>
      </li>`;
    }).join('');
  };
  document.getElementById('adminParentSearch')?.addEventListener('input', renderParents);

  /* ============================================================
     Children records
     ============================================================ */
  const renderChildren = () => {
    const tbody = document.getElementById('adminChildrenTableBody');
    if (!tbody) return;
    const search = (document.getElementById('adminChildSearch')?.value || '').trim().toLowerCase();
    const parents = getParents();
    const appointments = getAppointments();
    const parentName = (id) => parents.find((p) => p.id === id)?.name || '—';

    let children = getChildren();
    if (search) children = children.filter((c) => [c.name, parentName(c.parentId)].join(' ').toLowerCase().includes(search));

    if (!children.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-[color:var(--text-secondary)]">No children match your search.</td></tr>';
      return;
    }
    tbody.innerHTML = children.map((c) => {
      const age = LS.calcAge(c.dob);
      const apptCount = appointments.filter((a) => a.childName === c.name).length;
      return `
      <tr>
        <td class="font-semibold">${LS.escapeHTML(c.name)}</td>
        <td>${LS.escapeHTML(age.label)}<span class="block text-xs text-[color:var(--text-secondary)]">DOB ${LS.escapeHTML(LS.formatDate(c.dob))}</span></td>
        <td>${LS.escapeHTML(parentName(c.parentId))}</td>
        <td>${apptCount}</td>
        <td><span class="badge-neutral">${LS.escapeHTML(c.gender || '—')}</span></td>
      </tr>`;
    }).join('');
  };
  document.getElementById('adminChildSearch')?.addEventListener('input', renderChildren);

  /* ============================================================
     Doctor management
     ============================================================ */
  const renderDoctors = () => {
    const grid = document.getElementById('adminDoctorsGrid');
    if (!grid) return;
    const doctors = getDoctors();
    if (!doctors.length) {
      grid.innerHTML = '<p class="text-sm text-[color:var(--text-secondary)]">No doctors in demo data. Add one below.</p>';
      return;
    }
    grid.innerHTML = doctors.map((d) => `
      <article class="card p-5 flex flex-col gap-3" data-id="${LS.escapeHTML(d.id)}">
        <div class="flex items-center gap-4">
          <img src="${AVATAR_BASE}${LS.escapeHTML(d.avatar || 'doctor-1.jpg')}" alt="Portrait of ${LS.escapeHTML(d.name)} (demo profile)" width="72" height="72" loading="lazy"
               class="w-[72px] h-[72px] rounded-2xl object-cover object-top border border-[color:var(--border)]" onerror="this.onerror=null;this.src='${FALLBACK_AVATAR}'">
          <div>
            <h3 class="font-heading font-bold leading-snug">${LS.escapeHTML(d.name)}</h3>
            <p class="text-xs text-[color:var(--text-secondary)]">${LS.escapeHTML(d.specialty)}</p>
          </div>
        </div>
        <p class="text-xs text-[color:var(--text-secondary)]">${LS.escapeHTML(d.qualification || '')}</p>
        <div class="flex items-center justify-between gap-2 mt-auto">
          <span class="${d.availability === 'Available' ? 'badge-success' : 'badge-warning'}">${LS.escapeHTML(d.availability)}</span>
          <span class="text-xs text-[color:var(--text-secondary)]">${LS.escapeHTML(d.days || '')}</span>
        </div>
        <div class="flex gap-2">
          <button type="button" class="btn-outline btn-sm flex-1" data-edit-doctor="${LS.escapeHTML(d.id)}">Edit</button>
          <button type="button" class="btn-danger btn-sm flex-1" data-remove-doctor="${LS.escapeHTML(d.id)}">Remove</button>
        </div>
      </article>`).join('');
  };

  const doctorModal = document.getElementById('doctorModal');
  const doctorForm = document.getElementById('doctorForm');

  const openDoctorModal = (doctor) => {
    if (!doctorModal || !doctorForm) return;
    doctorForm.reset();
    doctorForm.elements['doctorId'].value = doctor?.id || '';
    doctorForm.elements['doctorName'].value = doctor?.name || '';
    doctorForm.elements['doctorSpecialty'].value = doctor?.specialty || '';
    doctorForm.elements['doctorQualification'].value = doctor?.qualification || '';
    doctorForm.elements['doctorDays'].value = doctor?.days || '';
    doctorForm.elements['doctorAvailability'].value = doctor?.availability || 'Available';
    document.getElementById('doctorModalTitle').textContent = doctor ? 'Edit demo doctor' : 'Add demo doctor';
    doctorModal.classList.remove('hidden');
    doctorModal.setAttribute('aria-hidden', 'false');
    doctorForm.elements['doctorName'].focus();
  };

  const closeDoctorModal = () => {
    doctorModal?.classList.add('hidden');
    doctorModal?.setAttribute('aria-hidden', 'true');
  };

  document.getElementById('addDoctorBtn')?.addEventListener('click', () => openDoctorModal(null));
  document.getElementById('closeDoctorModal')?.addEventListener('click', closeDoctorModal);
  doctorModal?.addEventListener('click', (e) => { if (e.target === doctorModal) closeDoctorModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDoctorModal(); });

  doctorForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const f = doctorForm.elements;
    const name = f['doctorName'].value.trim();
    const specialty = f['doctorSpecialty'].value.trim();
    if (name.length < 3 || specialty.length < 3) { LS.toast('Please enter name and specialty.', 'error'); return; }
    const doctors = getDoctors();
    const id = f['doctorId'].value;
    const payload = {
      name, specialty,
      qualification: f['doctorQualification'].value.trim(),
      days: f['doctorDays'].value.trim(),
      availability: f['doctorAvailability'].value,
      avatar: 'doctor-1.jpg'
    };
    if (id) {
      const idx = doctors.findIndex((d) => d.id === id);
      if (idx > -1) doctors[idx] = { ...doctors[idx], ...payload };
      LS.toast('Demo doctor profile updated.', 'success');
    } else {
      doctors.push({ ...payload, id: 'doc-' + Date.now() });
      LS.toast('Demo doctor added to sample data.', 'success');
    }
    set('ls_doctors', doctors);
    closeDoctorModal();
    renderDoctors();
    renderStats();
  });

  document.getElementById('adminDoctorsGrid')?.addEventListener('click', (event) => {
    const editBtn = event.target.closest('[data-edit-doctor]');
    const removeBtn = event.target.closest('[data-remove-doctor]');
    if (editBtn) {
      const doctor = getDoctors().find((d) => d.id === editBtn.getAttribute('data-edit-doctor'));
      openDoctorModal(doctor || null);
    } else if (removeBtn) {
      const id = removeBtn.getAttribute('data-remove-doctor');
      const doctor = getDoctors().find((d) => d.id === id);
      if (doctor && window.confirm(`Remove ${doctor.name} from demo data?`)) {
        set('ls_doctors', getDoctors().filter((d) => d.id !== id));
        LS.toast('Demo doctor removed.', 'info');
        renderDoctors();
        renderStats();
      }
    }
  });

  /* ============================================================
     Vaccination records
     ============================================================ */
  const renderVaccines = () => {
    const tbody = document.getElementById('adminVaccineTableBody');
    if (!tbody) return;
    const search = (document.getElementById('adminVaccineSearch')?.value || '').trim().toLowerCase();
    const status = document.getElementById('adminVaccineFilter')?.value || '';
    const children = getChildren();
    const nameOf = (id) => children.find((c) => c.id === id)?.name || '—';

    let rows = getVaccines().slice().sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
    if (status) rows = rows.filter((r) => r.status === status);
    if (search) rows = rows.filter((r) => [r.name, nameOf(r.childId)].join(' ').toLowerCase().includes(search));

    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-[color:var(--text-secondary)]">No vaccination records match.</td></tr>';
      return;
    }
    tbody.innerHTML = rows.map((r) => `
      <tr data-id="${LS.escapeHTML(r.id)}">
        <td class="font-semibold">${LS.escapeHTML(r.name)}</td>
        <td>${LS.escapeHTML(nameOf(r.childId))}</td>
        <td>${LS.escapeHTML(LS.formatDate(r.dueDate))}</td>
        <td>${r.status === 'completed' ? '<span class="badge-success">Completed</span>' : '<span class="badge-warning">Pending</span>'}</td>
        <td><button type="button" class="btn-outline btn-sm" data-toggle-vaccine>${r.status === 'completed' ? 'Mark pending' : 'Mark done'}</button></td>
      </tr>`).join('');
  };
  ['adminVaccineSearch', 'adminVaccineFilter'].forEach((id) => {
    document.getElementById(id)?.addEventListener('input', renderVaccines);
    document.getElementById(id)?.addEventListener('change', renderVaccines);
  });
  document.getElementById('adminVaccineTableBody')?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-toggle-vaccine]');
    if (!btn) return;
    const id = btn.closest('tr')?.dataset.id;
    const vaccines = getVaccines();
    const record = vaccines.find((r) => r.id === id);
    if (!record) return;
    record.status = record.status === 'completed' ? 'pending' : 'completed';
    record.completedDate = record.status === 'completed' ? LS.todayISO() : null;
    set('ls_vaccines', vaccines);
    LS.toast('Vaccination record updated (demo).', 'success');
    renderVaccines();
  });

  /* ============================================================
     Messages
     ============================================================ */
  const renderMessages = () => {
    const list = document.getElementById('adminMessagesList');
    if (!list) return;
    const filter = document.getElementById('adminMessageFilter')?.value || 'all';
    let messages = getMessages().slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    if (filter === 'unread') messages = messages.filter((m) => !m.read);
    if (filter === 'read') messages = messages.filter((m) => m.read);

    const unread = getMessages().filter((m) => !m.read).length;
    const badge = document.getElementById('adminUnreadBadge');
    if (badge) {
      badge.textContent = String(unread);
      badge.classList.toggle('hidden', unread === 0);
    }

    if (!messages.length) {
      list.innerHTML = '<li class="text-sm text-[color:var(--text-secondary)] py-6 text-center">No messages in this view.</li>';
      return;
    }
    list.innerHTML = messages.map((m) => `
      <li class="border rounded-2xl p-4 ${m.read ? 'border-[color:var(--border)] bg-[color:var(--card)]' : 'border-[color:var(--primary)] bg-[color:var(--accent)]'}" data-id="${LS.escapeHTML(m.id)}">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="font-heading font-bold">${LS.escapeHTML(m.subject)} ${m.read ? '' : '<span class="badge-info align-middle">New</span>'}</p>
            <p class="text-xs text-[color:var(--text-secondary)]">${LS.escapeHTML(m.name)} · ${LS.escapeHTML(m.email)} · ${LS.escapeHTML(LS.formatDate(m.date))}</p>
          </div>
          <button type="button" class="btn-outline btn-sm shrink-0" data-toggle-read>${m.read ? 'Mark unread' : 'Mark read'}</button>
        </div>
        <p class="text-sm mt-2">${LS.escapeHTML(m.message)}</p>
      </li>`).join('');
  };
  document.getElementById('adminMessageFilter')?.addEventListener('change', renderMessages);
  document.getElementById('adminMessagesList')?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-toggle-read]');
    if (!btn) return;
    const id = btn.closest('li')?.dataset.id;
    const messages = getMessages();
    const msg = messages.find((m) => m.id === id);
    if (!msg) return;
    msg.read = !msg.read;
    set('ls_messages', messages);
    LS.toast(msg.read ? 'Message marked as read.' : 'Message marked as unread.', 'info');
    renderMessages();
  });

  /* ============================================================
     Settings
     ============================================================ */
  const clinicDefaults = {
    clinicName: 'LittleSteps Pediatric Care',
    phone: '+1 (555) 123-4567',
    email: 'hello@littlesteps-demo.com',
    address: '123 Wellness Avenue, Suite 210, Springfield, ST 40021',
    hours: 'Mon–Sat: 8:30 AM – 6:30 PM · Sun: 9:00 AM – 1:00 PM'
  };
  const clinicForm = document.getElementById('clinicSettingsForm');
  if (clinicForm) {
    const saved = { ...clinicDefaults, ...get('ls_clinic', {}) };
    Object.entries(saved).forEach(([key, value]) => { if (clinicForm.elements[key]) clinicForm.elements[key].value = value; });
    clinicForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = {};
      Object.keys(clinicDefaults).forEach((key) => { data[key] = clinicForm.elements[key].value.trim(); });
      set('ls_clinic', data);
      LS.toast('Clinic settings saved on this device (demo).', 'success');
    });
  }

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
  wireNotif('adminNotifBtn', 'adminNotifPanel');
  wireNotif('drawerNotifBtn', 'drawerNotifPanel');

  /* ---------- Init ---------- */
  renderStats();
  renderOverviewCards();
  renderAppointments();
  renderParents();
  renderChildren();
  renderDoctors();
  renderVaccines();
  renderMessages();
  showView('overview');
})();

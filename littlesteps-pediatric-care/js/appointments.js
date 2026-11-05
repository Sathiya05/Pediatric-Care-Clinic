/* ============================================================
   LittleSteps Pediatric Care - appointments.js
   Appointment booking form: validation, demo creation,
   success/error messaging. Stores ONLY demo data in
   localStorage. No appointment is sent to a real clinic.
   ============================================================ */
'use strict';

(function () {
  const LS = window.LittleSteps;
  if (!LS) return;

  const form = document.getElementById('appointmentForm');
  if (!form) return;

  const fields = {
    parentName: form.elements['parentName'],
    childName: form.elements['childName'],
    childDob: form.elements['childDob'],
    email: form.elements['email'],
    phone: form.elements['phone'],
    type: form.elements['appointmentType'],
    date: form.elements['date'],
    time: form.elements['time'],
    notes: form.elements['notes']
  };

  // Never allow booking in the past
  fields.date.min = LS.todayISO();
  fields.childDob.max = LS.todayISO();

  // Pre-fill from quick-booking links, e.g. appointments.html?childName=Ana&type=Vaccination&date=2026-12-01
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('childName')) fields.childName.value = params.get('childName').slice(0, 80);
    if (params.get('parentName')) fields.parentName.value = params.get('parentName').slice(0, 80);
    if (params.get('type')) {
      const wanted = params.get('type').toLowerCase();
      const option = Array.from(fields.type.options).find((o) => o.value.toLowerCase() === wanted || o.textContent.toLowerCase() === wanted);
      if (option) fields.type.value = option.value;
    }
    if (params.get('date') && params.get('date') >= LS.todayISO()) fields.date.value = params.get('date');
  } catch { /* ignore malformed query strings */ }

  const validators = [
    { el: fields.parentName, test: (v) => v.trim().length >= 2, msg: 'Please enter the parent or guardian name.' },
    { el: fields.childName, test: (v) => v.trim().length >= 2, msg: 'Please enter the child\'s name.' },
    { el: fields.childDob, test: (v) => !!v && v <= LS.todayISO(), msg: 'Child date of birth cannot be in the future.' },
    { el: fields.email, test: LS.isEmail, msg: 'Please enter a valid email address.' },
    { el: fields.phone, test: LS.isPhone, msg: 'Please enter a valid phone number (digits, spaces, +, -, parentheses).' },
    { el: fields.type, test: (v) => !!v, msg: 'Please choose an appointment type.' },
    { el: fields.date, test: (v) => !!v && v >= LS.todayISO(), msg: 'Please choose today or a future date.' },
    { el: fields.time, test: (v) => !!v, msg: 'Please choose a preferred time slot.' }
  ];

  // Live re-validation once a field has been marked invalid
  validators.forEach(({ el, test, msg }) => {
    el.addEventListener('blur', () => { if (el.getAttribute('aria-invalid') === 'true') LS.setFieldError(el, test(el.value) ? '' : msg); });
  });

  const generateRef = () => 'LS-' + Date.now().toString(36).toUpperCase().slice(-6) + '-' + Math.floor(Math.random() * 900 + 100);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    let valid = true;
    let firstInvalid = null;

    validators.forEach(({ el, test, msg }) => {
      const ok = test(el.value);
      LS.setFieldError(el, ok ? '' : msg);
      if (!ok) { valid = false; if (!firstInvalid) firstInvalid = el; }
    });

    const notes = fields.notes.value.trim();
    if (notes.length > 500) {
      LS.setFieldError(fields.notes, 'Please keep notes under 500 characters.');
      valid = false;
      if (!firstInvalid) firstInvalid = fields.notes;
    }

    if (!valid) {
      LS.toast('Please fix the highlighted fields and try again.', 'error');
      firstInvalid?.focus();
      return;
    }

    const appointment = {
      id: 'ap-' + Date.now(),
      parentId: 'par1',
      parentName: fields.parentName.value.trim(),
      childName: fields.childName.value.trim(),
      childDob: fields.childDob.value,
      email: fields.email.value.trim(),
      phone: fields.phone.value.trim(),
      type: fields.type.value,
      date: fields.date.value,
      time: fields.time.value,
      notes,
      status: 'Pending',
      reference: generateRef(),
      createdAt: LS.todayISO(),
      source: 'website-demo'
    };

    const existing = LS.store.get('ls_appointments', []);
    existing.push(appointment);
    LS.store.set('ls_appointments', existing);

    // Success panel
    const successCard = document.getElementById('appointmentSuccess');
    const refEl = document.getElementById('appointmentReference');
    const summaryEl = document.getElementById('appointmentSummary');
    if (successCard && refEl && summaryEl) {
      refEl.textContent = appointment.reference;
      summaryEl.innerHTML = [
        `<li><strong>Child:</strong> ${LS.escapeHTML(appointment.childName)}</li>`,
        `<li><strong>Type:</strong> ${LS.escapeHTML(appointment.type)}</li>`,
        `<li><strong>Date &amp; time:</strong> ${LS.escapeHTML(LS.formatDate(appointment.date))} at ${LS.escapeHTML(appointment.time)}</li>`,
        `<li><strong>Parent email:</strong> ${LS.escapeHTML(appointment.email)}</li>`
      ].join('');
      successCard.classList.remove('hidden');
      successCard.setAttribute('tabindex', '-1');
      successCard.focus();
      form.classList.add('hidden');
    }

    LS.toast('Demo appointment saved on this device. No message was sent to a real clinic.', 'success');
    form.reset();
    fields.date.min = LS.todayISO();
    fields.childDob.max = LS.todayISO();
  });

  const bookAnother = document.getElementById('bookAnotherBtn');
  bookAnother?.addEventListener('click', () => {
    document.getElementById('appointmentSuccess')?.classList.add('hidden');
    form.classList.remove('hidden');
    form.parentName?.focus();
  });
})();

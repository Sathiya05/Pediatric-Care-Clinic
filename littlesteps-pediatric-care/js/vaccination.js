/* ============================================================
   LittleSteps Pediatric Care - vaccination.js
   Renders and manages DEMO vaccination records in the parent
   dashboard. The schedule is illustrative only; always confirm
   with your child's pediatrician and official guidance.
   ============================================================ */
'use strict';

(function () {
  const LS = window.LittleSteps;
  if (!LS) return;

  const tableBody = document.getElementById('vaccineTableBody');
  const filterEl = document.getElementById('vaccineFilter');
  const childFilterEl = document.getElementById('vaccineChildFilter');
  const addForm = document.getElementById('addVaccineForm');
  const childSelect = document.getElementById('vaccineChildSelect');

  // On non-dashboard pages there is nothing to wire up.
  if (!tableBody && !addForm) return;

  const getRecords = () => LS.store.get('ls_vaccines', []);
  const setRecords = (records) => LS.store.set('ls_vaccines', records);
  const getChildren = () => LS.store.get('ls_children', []);

  const populateChildControls = () => {
    const children = getChildren();
    [childSelect, childFilterEl].forEach((select) => {
      if (!select) return;
      const current = select.value;
      const options = ['<option value="">' + (select === childFilterEl ? 'All children' : 'Select child…') + '</option>']
        .concat(children.map((c) => `<option value="${LS.escapeHTML(c.id)}">${LS.escapeHTML(c.name)}</option>`));
      select.innerHTML = options.join('');
      if (current) select.value = current;
    });
  };

  const statusBadge = (status) => status === 'completed'
    ? '<span class="badge-success">Completed</span>'
    : '<span class="badge-warning">Pending</span>';

  const render = () => {
    if (!tableBody) return;
    const records = getRecords();
    const children = getChildren();
    const nameOf = (childId) => children.find((c) => c.id === childId)?.name || 'Unknown child';
    const filter = filterEl?.value || 'all';
    const childFilter = childFilterEl?.value || '';

    let visible = records.slice();
    if (filter !== 'all') visible = visible.filter((r) => r.status === filter);
    if (childFilter) visible = visible.filter((r) => r.childId === childFilter);
    visible.sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));

    if (!visible.length) {
      tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-[color:var(--text-secondary)]">No records match this filter yet. Add one using the form.</td></tr>`;
      return;
    }

    tableBody.innerHTML = visible.map((record) => `
      <tr data-id="${LS.escapeHTML(record.id)}">
        <td class="font-semibold">${LS.escapeHTML(record.name)}<br><span class="text-xs font-normal text-[color:var(--text-secondary)]">${LS.escapeHTML(nameOf(record.childId))}</span></td>
        <td>${LS.escapeHTML(LS.formatDate(record.dueDate))}</td>
        <td>${record.completedDate ? LS.escapeHTML(LS.formatDate(record.completedDate)) : '—'}</td>
        <td>${statusBadge(record.status)}</td>
        <td>
          ${record.status === 'pending'
            ? `<button type="button" class="btn-outline btn-sm" data-action="mark-complete">Mark done</button>`
            : `<button type="button" class="btn-ghost btn-sm" data-action="mark-pending">Mark pending</button>`}
        </td>
      </tr>`).join('');
  };

  // Delegated row actions
  tableBody?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-action="mark-complete"], [data-action="mark-pending"]');
    if (!btn) return;
    const row = btn.closest('tr');
    const id = row?.dataset.id;
    const records = getRecords();
    const record = records.find((r) => r.id === id);
    if (!record) return;
    if (btn.dataset.action === 'mark-complete') {
      record.status = 'completed';
      record.completedDate = LS.todayISO();
      LS.toast('Vaccination marked as completed (demo record).', 'success');
    } else {
      record.status = 'pending';
      record.completedDate = null;
      LS.toast('Vaccination marked as pending (demo record).', 'info');
    }
    setRecords(records);
    render();
  });

  filterEl?.addEventListener('change', render);
  childFilterEl?.addEventListener('change', render);

  addForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const nameEl = addForm.elements['vaccineName'];
    const dueEl = addForm.elements['vaccineDueDate'];
    const childEl = addForm.elements['vaccineChild'];

    const name = nameEl.value.trim();
    const due = dueEl.value;
    const childId = childEl?.value;

    let ok = true;
    if (name.length < 3) { LS.setFieldError(nameEl, 'Please enter the vaccination name.'); ok = false; } else { LS.setFieldError(nameEl, ''); }
    if (!due) { LS.setFieldError(dueEl, 'Please choose a due date.'); ok = false; } else { LS.setFieldError(dueEl, ''); }
    if (childEl && !childId) { LS.setFieldError(childEl, 'Please select a child.'); ok = false; } else if (childEl) { LS.setFieldError(childEl, ''); }
    if (!ok) { LS.toast('Please complete the vaccination record form.', 'error'); return; }

    const records = getRecords();
    records.push({
      id: 'vac-' + Date.now(),
      childId: childId || 'unassigned',
      name,
      dueDate: due,
      completedDate: null,
      status: 'pending'
    });
    setRecords(records);
    addForm.reset();
    LS.toast('Demo vaccination record added. Confirm real schedules with your pediatrician.', 'success');
    render();
  });

  // Public API so the parent dashboard can refresh after seeding/reset
  window.LittleStepsVaccination = { render, populateChildControls };

  populateChildControls();
  render();
})();

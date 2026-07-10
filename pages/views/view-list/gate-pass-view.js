/* ── Gate Pass View ──────────────────────────── */
(function () {
  'use strict';
  window.VIEW_VIEWS = window.VIEW_VIEWS || {};

  const HOST = '_gpv_host';
  const allData = [
    { gp: 'GP-2024-00001', by: 'Juan Dela Cruz', date: '2024-03-10', purpose: 'Site Inspection',    status: 'Approved',  out: '2024-03-10 08:00', inn: '2024-03-10 17:00', doc: 'GP-0001.pdf' },
    { gp: 'GP-2024-00002', by: 'Maria Santos',   date: '2024-04-22', purpose: 'Equipment Delivery', status: 'Pending',   out: '—',                inn: '—',                doc: '—' },
    { gp: 'GP-2024-00003', by: 'Jose Reyes',     date: '2024-05-01', purpose: 'Maintenance Work',   status: 'Approved',  out: '2024-05-01 09:30', inn: '2024-05-01 16:45', doc: 'GP-0003.pdf' },
    { gp: 'GP-2024-00004', by: 'Ana Gomez',      date: '2024-02-15', purpose: 'Audit Visit',        status: 'Cancelled', out: '—',                inn: '—',                doc: '—' },
    { gp: 'GP-2024-00005', by: 'Pedro Lim',      date: '2024-01-30', purpose: 'Stock Transfer',     status: 'Approved',  out: '2024-01-30 07:00', inn: '2024-01-30 15:00', doc: 'GP-0005.pdf' },
    { gp: 'GP-2024-00006', by: 'Rosa Valdez',    date: '2024-06-12', purpose: 'Repair Service',     status: 'Pending',   out: '—',                inn: '—',                doc: '—' },
  ];

  let filtered = [], page = 1, _cancelIdx = null;
  const PAGE = 10;
  let _listeners = [];
  function on(el, evt, fn) { el.addEventListener(evt, fn); _listeners.push({ el, evt, fn }); }

  function renderTable() {
    const tbody = document.getElementById('views-tbody');
    if (!tbody) return;
    const start = (page - 1) * PAGE;
    const slice = filtered.slice(start, start + PAGE);
    if (!slice.length) {
      tbody.innerHTML = `<tr><td colspan="8" class="dash-empty">No data available in table</td></tr>`;
      VH.updateShowing([], 1, PAGE); return;
    }
    tbody.innerHTML = slice.map((r, i) => `<tr>
      <td>${VH.idBadge(r.gp)}</td>
      <td>${r.by}</td>
      <td>${r.date}</td>
      <td style="max-width:160px;white-space:normal;">${r.purpose}</td>
      <td>${VH.pill(r.status)}</td>
      <td style="font-size:12px;color:var(--text-secondary);white-space:nowrap;">${VH.dash(r.out)}</td>
      <td style="font-size:12px;color:var(--text-secondary);white-space:nowrap;">${VH.dash(r.inn)}</td>
      <td>${VH.actionBtns(start + i)}</td>
    </tr>`).join('');
    VH.updateShowing(filtered, page, PAGE);
  }

  window._vView = function (idx) {
    const r = filtered[idx];
    VH.viewModal({
      hostId: HOST, overlayId: '_gpv_view_ov', title: 'Gate Pass Details', headClass: 'vm-head--view',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="margin-right:6px"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>',
      rows: [
        ['Gate Pass #',   VH.idBadge(r.gp)],
        ['Requested By',  r.by],
        ['Date',          r.date],
        ['Purpose',       r.purpose],
        ['Status',        VH.pill(r.status)],
        ['Time Out',      VH.dash(r.out)],
        ['Time In',       VH.dash(r.inn)],
        ['Document',      VH.docLink(r.doc)],
      ],
    });
  };

  window._vUpload = function (idx) {
    const r = filtered[idx];
    VH.uploadModal({
      hostId: HOST, overlayId: '_gpv_upl_ov', label: r.gp,
      onConfirm: () => { r.doc = 'uploaded.pdf'; renderTable(); Toast && Toast.show(`Uploaded for ${r.gp}.`, 'success'); },
    });
  };

  window._vCancel = function (idx) {
    _cancelIdx = idx;
    VH.cancelModal({
      hostId: HOST, overlayId: '_gpv_cancel_ov', recordId: filtered[idx].gp,
      onConfirm: () => {
        if (_cancelIdx === null) return;
        const r = filtered[_cancelIdx];
        r.status = 'Cancelled'; r.out = '—'; r.inn = '—';
        const orig = allData.find(d => d.gp === r.gp);
        if (orig) { orig.status = 'Cancelled'; orig.out = '—'; orig.inn = '—'; }
        renderTable(); Toast && Toast.show(`${r.gp} cancelled.`, 'success'); _cancelIdx = null;
      },
    });
  };

  function onLoad() {
    filtered = [...allData]; page = 1;
    const df = document.getElementById('views-date-from');
    const dt = document.getElementById('views-date-to');
    if (df) df.value = '2024-01-01'; if (dt) dt.value = '2024-12-31';
    const thead = document.getElementById('views-thead');
    if (thead) thead.innerHTML = `<tr>
      <th>GATE PASS #</th><th>REQUESTED BY</th><th>DATE</th><th>PURPOSE</th>
      <th>STATUS</th><th>TIME OUT</th><th>TIME IN</th><th>ACTION</th>
    </tr>`;
    renderTable();
    const searchEl = document.getElementById('views-search');
    if (searchEl) on(searchEl, 'input', () => {
      const q = searchEl.value.toLowerCase();
      filtered = q ? allData.filter(r => Object.values(r).join(' ').toLowerCase().includes(q)) : [...allData];
      page = 1; renderTable();
    });
  }

  function onUnload() {
    _listeners.forEach(({ el, evt, fn }) => el.removeEventListener(evt, fn));
    _listeners = []; filtered = []; _cancelIdx = null;
    delete window._vView; delete window._vUpload; delete window._vCancel;
    const h = document.getElementById(HOST); if (h) h.remove();
  }

  window.VIEW_VIEWS['gate-pass-view'] = {
    label: 'Gate Pass View', group: 'Gate Pass', hasDateBar: true,
    filterFields: ['GatePassNumber', 'RequestedBy', 'Date', 'Purpose', 'Status'],
    columns: ['Gate Pass #', 'Requested By', 'Date', 'Purpose', 'Status', 'Time Out', 'Time In', 'Action'],
    onLoad, onUnload,
  };
}());

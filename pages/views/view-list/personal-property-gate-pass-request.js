/* ── Personal Property Gate Pass Request View ── */
(function () {
  'use strict';
  window.VIEW_VIEWS = window.VIEW_VIEWS || {};

  const HOST = '_ppgp_host';
  const allData = [
    { pp: 'PP-2024-00001', by: 'Juan Dela Cruz',  date: '2024-03-10', purpose: 'Site Inspection',    status: 'Approved',  inn: '08:00', out: '17:00', doc: 'PP-0001.pdf' },
    { pp: 'PP-2024-00002', by: 'Maria Santos',    date: '2024-04-22', purpose: 'Equipment Transfer',  status: 'Pending',   inn: '—',     out: '—',     doc: '—' },
    { pp: 'PP-2024-00003', by: 'Jose Reyes',      date: '2024-05-01', purpose: 'Delivery Support',    status: 'Approved',  inn: '09:30', out: '16:45', doc: 'PP-0003.pdf' },
    { pp: 'PP-2024-00004', by: 'Ana Gomez',       date: '2024-02-15', purpose: 'Client Visit',        status: 'Cancelled', inn: '—',     out: '—',     doc: '—' },
    { pp: 'PP-2024-00005', by: 'Pedro Lim',       date: '2024-01-30', purpose: 'Maintenance Run',     status: 'Approved',  inn: '07:00', out: '15:00', doc: 'PP-0005.pdf' },
    { pp: 'PP-2024-00006', by: 'Rosa Valdez',     date: '2024-06-12', purpose: 'Repair Errand',       status: 'Pending',   inn: '—',     out: '—',     doc: '—' },
    { pp: 'PP-2025-00001', by: 'Carlo Mendoza',   date: '2025-01-20', purpose: 'Office Supply Pickup', status: 'Approved', inn: '08:30', out: '12:00', doc: 'PP-2025-0001.pdf' },
  ];

  let filtered = [], page = 1, _cancelIdx = null;
  const PAGE = 10;
  let _listeners = [];
  function on(el, evt, fn) { el.addEventListener(evt, fn); _listeners.push({ el, evt, fn }); }

  function inOutBadge(val, type) {
    if (!val || val === '—') return `<span class="v-muted">—</span>`;
    const bg  = type === 'in'  ? '#f0fdf4' : '#fff7ed';
    const col = type === 'in'  ? '#166534' : '#c2410c';
    return `<span class="v-pill" style="background:${bg};color:${col};font-size:11px;">${val}</span>`;
  }

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
      <td>${VH.idBadge(r.pp)}</td>
      <td>${r.by}</td>
      <td>${r.date}</td>
      <td style="max-width:160px;white-space:normal;">${r.purpose}</td>
      <td>${VH.pill(r.status)}</td>
      <td>${inOutBadge(r.inn, 'in')}</td>
      <td>${inOutBadge(r.out, 'out')}</td>
      <td>${VH.actionBtns(start + i)}</td>
    </tr>`).join('');
    VH.updateShowing(filtered, page, PAGE);
  }

  window._vView = function (idx) {
    const r = filtered[idx];
    VH.viewModal({
      hostId: HOST, overlayId: '_ppgp_view_ov', title: 'Personal Gate Pass Details', headClass: 'vm-head--view',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="margin-right:6px"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>',
      rows: [
        ['Personal Pass #', VH.idBadge(r.pp)],
        ['Requested By',    r.by],
        ['Date',            r.date],
        ['Purpose',         r.purpose],
        ['Status',          VH.pill(r.status)],
        ['Time In',         inOutBadge(r.inn, 'in')],
        ['Time Out',        inOutBadge(r.out, 'out')],
        ['Document',        VH.docLink(r.doc)],
      ],
    });
  };

  window._vUpload = function (idx) {
    const r = filtered[idx];
    VH.uploadModal({
      hostId: HOST, overlayId: '_ppgp_upl_ov', label: r.pp,
      onConfirm: () => { r.doc = 'uploaded.pdf'; renderTable(); Toast && Toast.show(`Uploaded for ${r.pp}.`, 'success'); },
    });
  };

  window._vCancel = function (idx) {
    _cancelIdx = idx;
    VH.cancelModal({
      hostId: HOST, overlayId: '_ppgp_cancel_ov', recordId: filtered[idx].pp,
      onConfirm: () => {
        if (_cancelIdx === null) return;
        const r = filtered[_cancelIdx];
        r.status = 'Cancelled'; r.inn = '—'; r.out = '—';
        const orig = allData.find(d => d.pp === r.pp);
        if (orig) { orig.status = 'Cancelled'; orig.inn = '—'; orig.out = '—'; }
        renderTable(); Toast && Toast.show(`${r.pp} cancelled.`, 'success'); _cancelIdx = null;
      },
    });
  };

  function onLoad() {
    filtered = [...allData]; page = 1;
    const df = document.getElementById('views-date-from');
    const dt = document.getElementById('views-date-to');
    if (df) df.value = '2024-01-01'; if (dt) dt.value = '2025-12-31';
    const thead = document.getElementById('views-thead');
    if (thead) thead.innerHTML = `<tr>
      <th>PERSONAL PASS #</th><th>REQUESTED BY</th><th>DATE</th><th>PURPOSE</th>
      <th>STATUS</th><th>IN</th><th>OUT</th><th>ACTION</th>
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

  window.VIEW_VIEWS['personal-property-gate-pass-request'] = {
    label: 'Personal Property Gate Pass Request View', group: 'Gate Pass', hasDateBar: true,
    filterFields: ['DayPassNumber', 'RequestedBy', 'Date', 'Purpose', 'Status'],
    columns: ['Personal Pass #', 'Requested By', 'Date', 'Purpose', 'Status', 'In', 'Out', 'Action'],
    onLoad, onUnload,
  };
}());

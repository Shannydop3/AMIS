/* ── Stock Disposal History ──────────────────── */
(function () {
  'use strict';
  window.VIEW_VIEWS = window.VIEW_VIEWS || {};

  const HOST = '_sdh_host';
  const allData = [
    { dispNo: 'SD-2026-00055', by: 'BERNA JOY MONTEMAYOR', date: '2026-04-25', status: 'Disposed',  remarks: '—',                    doc: 'SD-0055.pdf' },
    { dispNo: 'SD-2026-00052', by: 'Christian Lugue',       date: '2026-04-18', status: 'Pending',   remarks: '—',                    doc: '—' },
    { dispNo: 'SD-2026-00049', by: 'Ana Gomez',             date: '2026-04-10', status: 'Cancelled', remarks: 'Duplicate entry',      doc: '—' },
    { dispNo: 'SD-2026-00046', by: 'Jose Reyes',            date: '2026-03-28', status: 'Disposed',  remarks: '—',                    doc: 'SD-0046.pdf' },
    { dispNo: 'SD-2026-00043', by: 'Pedro Lim',             date: '2026-03-15', status: 'Declined',  remarks: 'Awaiting BAC sign-off',doc: '—' },
    { dispNo: 'SD-2026-00040', by: 'Rosa Valdez',           date: '2026-03-01', status: 'Disposed',  remarks: '—',                    doc: 'SD-0040.pdf' },
    { dispNo: 'SD-2026-00037', by: 'Carlo Mendoza',         date: '2026-02-20', status: 'Pending',   remarks: '—',                    doc: '—' },
    { dispNo: 'SD-2026-00034', by: 'BERNA JOY MONTEMAYOR', date: '2026-02-08', status: 'Disposed',  remarks: '—',                    doc: 'SD-0034.pdf' },
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
      tbody.innerHTML = `<tr><td colspan="7" class="dash-empty">No data available in table</td></tr>`;
      VH.updateShowing([], 1, PAGE); return;
    }
    tbody.innerHTML = slice.map((r, i) => `<tr>
      <td>${VH.idBadge(r.dispNo, 'purple')}</td>
      <td>${r.by}</td>
      <td>${r.date}</td>
      <td>${VH.pill(r.status)}</td>
      <td style="max-width:160px;white-space:normal;">${VH.dash(r.remarks)}</td>
      <td>${VH.docLink(r.doc)}</td>
      <td>${VH.actionBtns(start + i)}</td>
    </tr>`).join('');
    VH.updateShowing(filtered, page, PAGE);
  }

  window._vView = function (idx) {
    const r = filtered[idx];
    VH.viewModal({
      hostId: HOST, overlayId: '_sdh_view_ov', title: 'Stock Disposal Details', headClass: 'vm-head--view',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="margin-right:6px"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>',
      rows: [
        ['Disposal #',   VH.idBadge(r.dispNo, 'purple')],
        ['Disposed By',  r.by],
        ['Date',         r.date],
        ['Status',       VH.pill(r.status)],
        ['Remarks',      VH.dash(r.remarks)],
        ['Document',     VH.docLink(r.doc)],
      ],
    });
  };

  window._vUpload = function (idx) {
    const r = filtered[idx];
    VH.uploadModal({
      hostId: HOST, overlayId: '_sdh_upl_ov', label: r.dispNo,
      onConfirm: () => { r.doc = 'uploaded.pdf'; renderTable(); Toast && Toast.show(`Uploaded for ${r.dispNo}.`, 'success'); },
    });
  };

  window._vCancel = function (idx) {
    _cancelIdx = idx;
    VH.cancelModal({
      hostId: HOST, overlayId: '_sdh_cancel_ov', recordId: filtered[idx].dispNo,
      onConfirm: () => {
        if (_cancelIdx === null) return;
        const r = filtered[_cancelIdx];
        r.status = 'Cancelled'; r.remarks = 'Cancelled by user';
        const orig = allData.find(d => d.dispNo === r.dispNo);
        if (orig) { orig.status = 'Cancelled'; orig.remarks = 'Cancelled by user'; }
        renderTable(); Toast && Toast.show(`${r.dispNo} cancelled.`, 'success'); _cancelIdx = null;
      },
    });
  };

  function onLoad() {
    filtered = [...allData]; page = 1;
    const df = document.getElementById('views-date-from');
    const dt = document.getElementById('views-date-to');
    if (df) df.value = '2026-01-01'; if (dt) dt.value = '2026-05-07';
    const thead = document.getElementById('views-thead');
    if (thead) thead.innerHTML = `<tr>
      <th>DISPOSAL #</th><th>DISPOSED BY</th><th>DATE</th>
      <th>STATUS</th><th>DECLINE/CANCEL REMARKS</th><th>DOCUMENT</th><th>ACTION</th>
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

  window.VIEW_VIEWS['stock-disposal-history'] = {
    label: 'Stock Disposal History', group: 'Stock', hasDateBar: true,
    filterFields: ['DisposalNumber', 'DisposedBy', 'Date', 'Status'],
    columns: ['Disposal #', 'Disposed By', 'Date', 'Status', 'Decline/Cancel Remarks', 'Document', 'Action'],
    onLoad, onUnload,
  };
}());

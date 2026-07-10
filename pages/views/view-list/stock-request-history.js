/* ── Stock Request History ───────────────────── */
(function () {
  'use strict';
  window.VIEW_VIEWS = window.VIEW_VIEWS || {};

  const HOST = '_srh_host';
  const allData = [
    { reqNo: 'SR-2026-00421', reqBy: 'Maria Santos',    remarks: 'Office supplies for Q2',      date: '2026-04-10', status: 'Approved',   cancelRemarks: '—',                  doc: 'PO-0421.pdf' },
    { reqNo: 'SR-2026-00398', reqBy: 'Juan dela Cruz',  remarks: 'Printer cartridges',           date: '2026-04-03', status: 'Pending',    cancelRemarks: '—',                  doc: '—' },
    { reqNo: 'SR-2026-00375', reqBy: 'Ana Reyes',       remarks: 'Cleaning materials',           date: '2026-03-28', status: 'Declined',   cancelRemarks: 'Budget not approved', doc: '—' },
    { reqNo: 'SR-2026-00352', reqBy: 'Pedro Lim',       remarks: 'Desktop accessories',          date: '2026-03-15', status: 'Approved',   cancelRemarks: '—',                  doc: 'PO-0352.pdf' },
    { reqNo: 'SR-2026-00330', reqBy: 'Rosa Gomez',      remarks: 'Network cables and switches',  date: '2026-03-01', status: 'Cancelled',  cancelRemarks: 'Duplicate request',   doc: '—' },
    { reqNo: 'SR-2026-00311', reqBy: 'Carlo Mendoza',   remarks: 'Whiteboard markers and eraser',date: '2026-02-20', status: 'Processing', cancelRemarks: '—',                  doc: '—' },
    { reqNo: 'SR-2026-00295', reqBy: 'Luisa Tan',       remarks: 'Filing folders and binders',   date: '2026-02-10', status: 'Approved',   cancelRemarks: '—',                  doc: 'PO-0295.pdf' },
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
      <td>${VH.idBadge(r.reqNo, 'green')}</td>
      <td>${r.reqBy}</td>
      <td style="max-width:180px;white-space:normal;">${r.remarks}</td>
      <td>${r.date}</td>
      <td>${VH.pill(r.status)}</td>
      <td style="max-width:160px;white-space:normal;">${VH.dash(r.cancelRemarks)}</td>
      <td>${VH.docLink(r.doc)}</td>
      <td>${VH.actionBtns(start + i)}</td>
    </tr>`).join('');
    VH.updateShowing(filtered, page, PAGE);
  }

  window._vView = function (idx) {
    const r = filtered[idx];
    VH.viewModal({
      hostId: HOST, overlayId: '_srh_view_ov', title: 'Stock Request Details', headClass: 'vm-head--view',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="margin-right:6px"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>',
      rows: [
        ['Request #', VH.idBadge(r.reqNo, 'green')],
        ['Requested By', r.reqBy],
        ['Remarks', r.remarks],
        ['Date', r.date],
        ['Status', VH.pill(r.status)],
        ['Decline/Cancel Remarks', VH.dash(r.cancelRemarks)],
        ['Document', VH.docLink(r.doc)],
      ],
    });
  };

  window._vUpload = function (idx) {
    const r = filtered[idx];
    VH.uploadModal({
      hostId: HOST, overlayId: '_srh_upl_ov', label: r.reqNo,
      onConfirm: () => { r.doc = 'uploaded.pdf'; renderTable(); Toast && Toast.show(`Uploaded for ${r.reqNo}.`, 'success'); },
    });
  };

  window._vCancel = function (idx) {
    _cancelIdx = idx;
    VH.cancelModal({
      hostId: HOST, overlayId: '_srh_cancel_ov', recordId: filtered[idx].reqNo,
      onConfirm: () => {
        if (_cancelIdx === null) return;
        const r = filtered[_cancelIdx];
        r.status = 'Cancelled'; r.cancelRemarks = 'Cancelled by user';
        const orig = allData.find(d => d.reqNo === r.reqNo);
        if (orig) { orig.status = 'Cancelled'; orig.cancelRemarks = 'Cancelled by user'; }
        renderTable(); Toast && Toast.show(`${r.reqNo} cancelled.`, 'success'); _cancelIdx = null;
      },
    });
  };

  function onLoad() {
    filtered = [...allData]; page = 1;
    const df = document.getElementById('views-date-from');
    const dt = document.getElementById('views-date-to');
    if (df) df.value = '2026-02-01'; if (dt) dt.value = '2026-05-07';
    const thead = document.getElementById('views-thead');
    if (thead) thead.innerHTML = `<tr>
      <th>REQUEST #</th><th>REQUEST BY</th><th>REMARKS</th><th>DATE</th>
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

  window.VIEW_VIEWS['stock-request-history'] = {
    label: 'Stock Request History', group: 'Stock', hasDateBar: false,
    filterFields: ['RequestNumber', 'RequestedBy', 'Remarks', 'Date', 'Status'],
    columns: ['Request #', 'Request By', 'Remarks', 'Date', 'Status', 'Decline/Cancel Remarks', 'Document', 'Action'],
    onLoad, onUnload,
  };
}());

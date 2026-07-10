/* ── Stock Issuance History ──────────────────── */
(function () {
  'use strict';
  window.VIEW_VIEWS = window.VIEW_VIEWS || {};

  const HOST = '_sih_host';
  const allData = [
    { issNo: 'SIH-2024-00001', issuedTo: 'Juan Dela Cruz',  remarks: 'Monthly supplies',       date: '2024-03-10', status: 'Issued',    cancelRemarks: '—',                  doc: 'receipt_001.pdf' },
    { issNo: 'SIH-2024-00002', issuedTo: 'Maria Santos',    remarks: 'Office materials',        date: '2024-04-22', status: 'Returned',  cancelRemarks: '—',                  doc: 'receipt_002.pdf' },
    { issNo: 'SIH-2024-00003', issuedTo: 'Jose Reyes',      remarks: 'Lab equipment request',   date: '2024-05-01', status: 'Pending',   cancelRemarks: '—',                  doc: '—' },
    { issNo: 'SIH-2024-00004', issuedTo: 'Ana Gomez',       remarks: 'IT supplies',             date: '2024-02-15', status: 'Cancelled', cancelRemarks: 'Insufficient stock', doc: '—' },
    { issNo: 'SIH-2024-00005', issuedTo: 'Pedro Lim',       remarks: 'Janitorial items',        date: '2024-01-30', status: 'Issued',    cancelRemarks: '—',                  doc: 'receipt_005.pdf' },
    { issNo: 'SIH-2024-00006', issuedTo: 'Rosa Valdez',     remarks: 'Printer cartridges',      date: '2024-06-12', status: 'Declined',  cancelRemarks: 'Awaiting approval',  doc: '—' },
    { issNo: 'SIH-2024-00007', issuedTo: 'Carlo Mendoza',   remarks: 'Safety gear',             date: '2024-07-03', status: 'Issued',    cancelRemarks: '—',                  doc: 'receipt_007.pdf' },
    { issNo: 'SIH-2024-00008', issuedTo: 'Liza Torres',     remarks: 'Electrical supplies',     date: '2024-08-19', status: 'Returned',  cancelRemarks: '—',                  doc: 'receipt_008.pdf' },
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
      <td>${VH.idBadge(r.issNo, 'green')}</td>
      <td>${r.issuedTo}</td>
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
      hostId: HOST, overlayId: '_sih_view_ov', title: 'Stock Issuance Details', headClass: 'vm-head--view',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="margin-right:6px"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>',
      rows: [
        ['Issuance #', VH.idBadge(r.issNo, 'green')],
        ['Issued To', r.issuedTo],
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
      hostId: HOST, overlayId: '_sih_upl_ov', label: r.issNo,
      onConfirm: () => { r.doc = 'uploaded.pdf'; renderTable(); Toast && Toast.show(`Uploaded for ${r.issNo}.`, 'success'); },
    });
  };

  window._vCancel = function (idx) {
    _cancelIdx = idx;
    VH.cancelModal({
      hostId: HOST, overlayId: '_sih_cancel_ov', recordId: filtered[idx].issNo,
      onConfirm: () => {
        if (_cancelIdx === null) return;
        const r = filtered[_cancelIdx];
        r.status = 'Cancelled'; r.cancelRemarks = 'Cancelled by user';
        const orig = allData.find(d => d.issNo === r.issNo);
        if (orig) { orig.status = 'Cancelled'; orig.cancelRemarks = 'Cancelled by user'; }
        renderTable(); Toast && Toast.show(`${r.issNo} cancelled.`, 'success'); _cancelIdx = null;
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
      <th>ISSUANCE #</th><th>ISSUED TO</th><th>REMARKS</th><th>DATE</th>
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

  window.VIEW_VIEWS['stock-issuance-history'] = {
    label: 'Stock Issuance History', group: 'Stock', hasDateBar: true,
    filterFields: ['IssuanceNo', 'IssuedTo', 'Remarks', 'Date', 'Status'],
    columns: ['Issuance #', 'Issued To', 'Remarks', 'Date', 'Status', 'Decline/Cancel Remarks', 'Document', 'Action'],
    onLoad, onUnload,
  };
}());

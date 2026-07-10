/* ── Property Return History ─────────────────── */
(function () {
  'use strict';
  window.VIEW_VIEWS = window.VIEW_VIEWS || {};

  const HOST = '_prh_host';
  const allData = [
    { txType: 'Return', retNo: 'RET-2026-00051', by: 'BERNA JOY MONTEMAYOR', date: '2026-04-25', status: 'Approved',  doc: 'RET-0051.pdf' },
    { txType: 'Return', retNo: 'RET-2026-00048', by: 'Christian Lugue',       date: '2026-04-18', status: 'Pending',   doc: '—' },
    { txType: 'Return', retNo: 'RET-2026-00045', by: 'Ana Gomez',             date: '2026-04-10', status: 'Cancelled', doc: '—' },
    { txType: 'Return', retNo: 'RET-2026-00042', by: 'Jose Reyes',            date: '2026-03-28', status: 'Approved',  doc: 'RET-0042.pdf' },
    { txType: 'Return', retNo: 'RET-2026-00039', by: 'Pedro Lim',             date: '2026-03-15', status: 'Declined',  doc: '—' },
    { txType: 'Return', retNo: 'RET-2026-00036', by: 'Rosa Valdez',           date: '2026-03-01', status: 'Approved',  doc: 'RET-0036.pdf' },
    { txType: 'Return', retNo: 'RET-2026-00033', by: 'Carlo Mendoza',         date: '2026-02-20', status: 'Pending',   doc: '—' },
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
      <td><span class="v-pill" style="background:#f3f4f6;color:#374151;">${r.txType}</span></td>
      <td>${VH.idBadge(r.retNo)}</td>
      <td>${r.by}</td>
      <td>${r.date}</td>
      <td>${VH.pill(r.status)}</td>
      <td>${VH.docLink(r.doc)}</td>
      <td>${VH.actionBtns(start + i)}</td>
    </tr>`).join('');
    VH.updateShowing(filtered, page, PAGE);
  }

  window._vView = function (idx) {
    const r = filtered[idx];
    VH.viewModal({
      hostId: HOST, overlayId: '_prh_view_ov', title: 'Property Return Details', headClass: 'vm-head--view',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="margin-right:6px"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>',
      rows: [
        ['Transaction Type', r.txType],
        ['Return #',         VH.idBadge(r.retNo)],
        ['Return By',        r.by],
        ['Return Date',      r.date],
        ['Status',           VH.pill(r.status)],
        ['Document',         VH.docLink(r.doc)],
      ],
    });
  };

  window._vUpload = function (idx) {
    const r = filtered[idx];
    VH.uploadModal({
      hostId: HOST, overlayId: '_prh_upl_ov', label: r.retNo,
      onConfirm: () => { r.doc = 'uploaded.pdf'; renderTable(); Toast && Toast.show(`Uploaded for ${r.retNo}.`, 'success'); },
    });
  };

  window._vCancel = function (idx) {
    _cancelIdx = idx;
    VH.cancelModal({
      hostId: HOST, overlayId: '_prh_cancel_ov', recordId: filtered[idx].retNo,
      onConfirm: () => {
        if (_cancelIdx === null) return;
        const r = filtered[_cancelIdx];
        r.status = 'Cancelled';
        const orig = allData.find(d => d.retNo === r.retNo);
        if (orig) orig.status = 'Cancelled';
        renderTable(); Toast && Toast.show(`${r.retNo} cancelled.`, 'success'); _cancelIdx = null;
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
      <th>TRANSACTION TYPE</th><th>RETURN #</th><th>RETURN BY</th>
      <th>RETURN DATE</th><th>STATUS</th><th>DOCUMENT</th><th>ACTION</th>
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

  window.VIEW_VIEWS['property-return-history'] = {
    label: 'Property Return History', group: 'Property', hasDateBar: true,
    filterFields: ['ReturnNumber', 'ReturnBy', 'ReturnDate', 'Status'],
    columns: ['Transaction Type', 'Return #', 'Return By', 'Return Date', 'Status', 'Document', 'Action'],
    onLoad, onUnload,
  };
}());

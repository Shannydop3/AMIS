/* ── Inventory Count View ────────────────────── */
(function () {
  'use strict';
  window.VIEW_VIEWS = window.VIEW_VIEWS || {};

  const HOST = '_icv_host';
  const allData = [
    { name: 'IC-2024-00001', desc: 'Annual Stock Count – Warehouse A',     label: 'WH-A',  label2: 'Zone 1', type: 'Physical',  date: '2024-03-10', status: 'Completed', doc: 'ic_report_001.pdf' },
    { name: 'IC-2024-00002', desc: 'Mid-Year Inventory – Office Supplies', label: 'OFF-B', label2: 'Zone 2', type: 'Perpetual', date: '2024-06-22', status: 'Pending',   doc: '—' },
    { name: 'IC-2024-00003', desc: 'Lab Equipment Count',                  label: 'LAB-C', label2: 'Zone 1', type: 'Physical',  date: '2024-09-05', status: 'Cancelled', doc: '—' },
    { name: 'IC-2024-00004', desc: 'IT Assets Count – Floor 3',            label: 'IT-D',  label2: 'Zone 3', type: 'Physical',  date: '2024-11-18', status: 'Completed', doc: 'ic_report_004.pdf' },
    { name: 'IC-2025-00001', desc: 'Q1 Supplies Inventory',                label: 'SUP-E', label2: 'Zone 2', type: 'Perpetual', date: '2025-01-30', status: 'Pending',   doc: '—' },
    { name: 'IC-2025-00002', desc: 'Janitorial Items Count',               label: 'JAN-F', label2: 'Zone 4', type: 'Physical',  date: '2025-03-12', status: 'Completed', doc: 'ic_report_006.pdf' },
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
      <td>${VH.idBadge(r.name)}</td>
      <td style="max-width:200px;white-space:normal;">${r.desc}</td>
      <td>${r.label}</td>
      <td>${r.label2}</td>
      <td><span class="v-pill" style="background:#f3f4f6;color:#374151;">${r.type}</span></td>
      <td>${r.date}</td>
      <td>${VH.pill(r.status)}</td>
      <td>${VH.actionBtns(start + i)}</td>
    </tr>`).join('');
    VH.updateShowing(filtered, page, PAGE);
  }

  window._vView = function (idx) {
    const r = filtered[idx];
    VH.viewModal({
      hostId: HOST, overlayId: '_icv_view_ov', title: 'Inventory Count Details', headClass: 'vm-head--view',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="margin-right:6px"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>',
      rows: [
        ['Inventory Name', VH.idBadge(r.name)],
        ['Description',    r.desc],
        ['Label',          `${r.label} / ${r.label2}`],
        ['Inventory Type', r.type],
        ['Date',           r.date],
        ['Status',         VH.pill(r.status)],
        ['Document',       VH.docLink(r.doc)],
      ],
    });
  };

  window._vUpload = function (idx) {
    const r = filtered[idx];
    VH.uploadModal({
      hostId: HOST, overlayId: '_icv_upl_ov', label: r.name,
      onConfirm: () => { r.doc = 'uploaded.pdf'; renderTable(); Toast && Toast.show(`Uploaded for ${r.name}.`, 'success'); },
    });
  };

  window._vCancel = function (idx) {
    _cancelIdx = idx;
    VH.cancelModal({
      hostId: HOST, overlayId: '_icv_cancel_ov', recordId: filtered[idx].name,
      onConfirm: () => {
        if (_cancelIdx === null) return;
        const r = filtered[_cancelIdx];
        r.status = 'Cancelled';
        const orig = allData.find(d => d.name === r.name);
        if (orig) orig.status = 'Cancelled';
        renderTable(); Toast && Toast.show(`${r.name} cancelled.`, 'success'); _cancelIdx = null;
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
      <th>INVENTORY NAME</th><th>DESCRIPTION</th><th>LABEL</th><th>LABEL</th>
      <th>INVENTORY TYPE</th><th>DATE</th><th>STATUS</th><th>ACTION</th>
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

  window.VIEW_VIEWS['inventory-count-view'] = {
    label: 'Inventory Count View', group: 'Stock', hasDateBar: true,
    filterFields: ['InventoryNumber', 'InventoryName', 'Description', 'Status', 'Date'],
    columns: ['Inventory Name', 'Description', 'Label', 'Label', 'Inventory Type', 'Date', 'Status', 'Action'],
    onLoad, onUnload,
  };
}());

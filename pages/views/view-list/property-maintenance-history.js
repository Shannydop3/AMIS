/* ── Property Maintenance History ────────────── */
(function () {
  'use strict';
  window.VIEW_VIEWS = window.VIEW_VIEWS || {};

  const HOST = '_pmh_host';
  const allData = [
    { propNo: 'PROP-2024-00142', desc: 'Laptop Dell XPS 15',     serial: 'DL2024XPS001', by: 'Juan Dela Cruz', date: '2024-03-10', pct: 75,  type: 'Preventive', doc: '—' },
    { propNo: 'PROP-2024-00089', desc: 'Epson Projector EB-X41', serial: 'EP2024X41002', by: 'Maria Santos',   date: '2024-04-22', pct: 100, type: 'Corrective', doc: 'MR-0089.pdf' },
    { propNo: 'PROP-2023-00511', desc: 'HP LaserJet Pro MFP',    serial: 'HP2023LJP003', by: 'Jose Reyes',     date: '2024-05-01', pct: 50,  type: 'Preventive', doc: '—' },
    { propNo: 'PROP-2024-00203', desc: 'Standing Aircon Carrier', serial: 'CA2024SAC004', by: 'Ana Gomez',      date: '2024-02-15', pct: 100, type: 'Corrective', doc: 'MR-0203.pdf' },
    { propNo: 'PROP-2023-00388', desc: 'Desktop PC Lenovo',      serial: 'LN2023DPC005', by: 'Pedro Lim',      date: '2024-01-30', pct: 25,  type: 'Preventive', doc: '—' },
  ];

  let filtered = [], page = 1, _cancelIdx = null;
  const PAGE = 10;
  let _listeners = [];
  function on(el, evt, fn) { el.addEventListener(evt, fn); _listeners.push({ el, evt, fn }); }

  function pctBadge(pct) {
    let bg, color;
    if (pct === 100)    { bg = '#dcfce7'; color = '#15803d'; }
    else if (pct >= 50) { bg = '#dbeafe'; color = '#1e40af'; }
    else if (pct >= 25) { bg = '#fef3c7'; color = '#92400e'; }
    else                { bg = '#fee2e2'; color = '#b91c1c'; }
    return `<span class="v-pill" style="background:${bg};color:${color};">${pct}%</span>`;
  }

  function typeBadge(type) {
    return type === 'Corrective'
      ? `<span class="v-pill" style="background:#fef3c7;color:#92400e;">${type}</span>`
      : `<span class="v-pill" style="background:#ede9fe;color:#6d28d9;">${type}</span>`;
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
      <td>${VH.idBadge(r.propNo)}</td>
      <td>${r.desc}</td>
      <td style="font-size:12px;color:var(--text-secondary);">${r.serial}</td>
      <td>${r.by}</td>
      <td>${r.date}</td>
      <td style="text-align:center;">${pctBadge(r.pct)}</td>
      <td style="text-align:center;">${typeBadge(r.type)}</td>
      <td>${VH.actionBtns(start + i)}</td>
    </tr>`).join('');
    VH.updateShowing(filtered, page, PAGE);
  }

  window._vView = function (idx) {
    const r = filtered[idx];
    VH.viewModal({
      hostId: HOST, overlayId: '_pmh_view_ov', title: 'Maintenance Record', headClass: 'vm-head--view',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="margin-right:6px"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>',
      rows: [
        ['Property #', VH.idBadge(r.propNo)],
        ['Description', r.desc],
        ['Serial #', r.serial],
        ['Created By', r.by],
        ['Created Date', r.date],
        ['% of Completion', pctBadge(r.pct)],
        ['Maintenance Type', typeBadge(r.type)],
        ['Document', VH.docLink(r.doc)],
      ],
    });
  };

  window._vUpload = function (idx) {
    const r = filtered[idx];
    VH.uploadModal({
      hostId: HOST, overlayId: '_pmh_upl_ov', label: r.propNo,
      onConfirm: () => { r.doc = 'uploaded.pdf'; renderTable(); Toast && Toast.show(`Uploaded for ${r.propNo}.`, 'success'); },
    });
  };

  window._vCancel = function (idx) {
    _cancelIdx = idx;
    VH.cancelModal({
      hostId: HOST, overlayId: '_pmh_cancel_ov', recordId: filtered[idx].propNo,
      onConfirm: () => {
        if (_cancelIdx === null) return;
        const r = filtered[_cancelIdx];
        r.pct = 0;
        const orig = allData.find(d => d.propNo === r.propNo);
        if (orig) orig.pct = 0;
        renderTable();
        Toast && Toast.show(`${r.propNo} cancelled.`, 'success');
        _cancelIdx = null;
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
      <th>PROPERTY #</th><th>DESCRIPTION</th><th>SERIAL #</th>
      <th>CREATED BY</th><th>CREATED DATE</th>
      <th style="text-align:center;">% OF COMPLETION</th>
      <th style="text-align:center;">MAINTENANCE TYPE</th>
      <th style="text-align:center;">ACTION</th>
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

  window.VIEW_VIEWS['property-maintenance-history'] = {
    label: 'Property Maintenance History', group: 'Property', hasDateBar: true,
    filterFields: ['PropertyNumber', 'Description', 'SerialNumber', 'CreatedBy', 'Date', 'MaintenanceType'],
    columns: ['Property #', 'Description', 'Serial #', 'Created By', 'Created Date', '% of Completion', 'Maintenance Type', 'Action'],
    onLoad, onUnload,
  };
}());

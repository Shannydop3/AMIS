/* ── Tagging History ─────────────────────────── */
(function () {
  'use strict';
  window.VIEW_VIEWS = window.VIEW_VIEWS || {};

  const HOST = '_th_host';
  const allData = [
    { propNo: 'PROP-2024-00142', printer: 'HP LaserJet Pro M404dn', ip: '192.168.1.101', date: '2024-03-10' },
    { propNo: 'PROP-2024-00089', printer: 'Epson L3150',            ip: '192.168.1.102', date: '2024-04-22' },
    { propNo: 'PROP-2023-00511', printer: 'Canon PIXMA G3010',      ip: '192.168.1.103', date: '2024-05-01' },
    { propNo: 'PROP-2024-00203', printer: 'Brother DCP-T510W',      ip: '192.168.1.104', date: '2024-02-15' },
    { propNo: 'PROP-2023-00388', printer: 'Samsung M2020W',          ip: '192.168.1.105', date: '2024-01-30' },
    { propNo: 'PROP-2025-00011', printer: 'HP DeskJet 2710',        ip: '192.168.1.106', date: '2025-01-15' },
    { propNo: 'PROP-2025-00022', printer: 'Epson EcoTank L5290',    ip: '192.168.1.107', date: '2025-02-20' },
  ];

  let filtered = [], page = 1;
  const PAGE = 10;
  let _listeners = [];
  function on(el, evt, fn) { el.addEventListener(evt, fn); _listeners.push({ el, evt, fn }); }

  function renderTable() {
    const tbody = document.getElementById('views-tbody');
    if (!tbody) return;
    const start = (page - 1) * PAGE;
    const slice = filtered.slice(start, start + PAGE);
    if (!slice.length) {
      tbody.innerHTML = `<tr><td colspan="4" class="dash-empty">No data available in table</td></tr>`;
      VH.updateShowing([], 1, PAGE); return;
    }
    tbody.innerHTML = slice.map(r => `<tr>
      <td>${VH.idBadge(r.propNo)}</td>
      <td>${r.printer}</td>
      <td style="font-family:monospace;font-size:12px;">${r.ip}</td>
      <td style="font-size:12px;color:var(--text-secondary);">${r.date}</td>
    </tr>`).join('');
    VH.updateShowing(filtered, page, PAGE);
  }

  function onLoad() {
    filtered = [...allData]; page = 1;
    const df = document.getElementById('views-date-from');
    const dt = document.getElementById('views-date-to');
    if (df) df.value = '2024-01-01'; if (dt) dt.value = '2025-12-31';
    const thead = document.getElementById('views-thead');
    if (thead) thead.innerHTML = `<tr>
      <th>PROPERTY NUMBER</th><th>PRINTER NAME</th>
      <th>IP ADDRESS</th><th>DATE CREATED</th>
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
    _listeners = []; filtered = [];
    const h = document.getElementById(HOST); if (h) h.remove();
  }

  window.VIEW_VIEWS['tagging-history'] = {
    label: 'Tagging History', group: 'Reports', hasDateBar: true,
    filterFields: ['PropertyNumber', 'PrinterName', 'IPAddress', 'DateCreated'],
    columns: ['Property Number', 'Printer Name', 'IP Address', 'Date Created'],
    onLoad, onUnload,
  };
}());

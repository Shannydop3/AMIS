/* ── RSPI View ───────────────────────────────── */
(function () {
  'use strict';
  window.VIEW_VIEWS = window.VIEW_VIEWS || {};

  const HOST = '_rspi_host';
  const allData = [
    { code: 'LAPTOP-003',          propNo: 'PROP-2025-00101', qty: 1,  desc: 'Laptop Dell XPS 15 – Intel Core i7, 16GB RAM, 512GB SSD' },
    { code: 'PRINTER-001',         propNo: 'PROP-2025-00102', qty: 1,  desc: 'HP LaserJet Pro M404dn Printer, Auto Duplex, 40ppm' },
    { code: 'PRINTER-002',         propNo: 'PROP-2025-00103', qty: 1,  desc: 'Epson LQ-2190 Dot Matrix Printer, 24-pin, 80-column' },
    { code: 'UPS-001',             propNo: 'PROP-2025-00104', qty: 2,  desc: 'UPS 1500VA Battery Backup with AVR and 6 Outlets' },
    { code: 'CCTV-SET-001',        propNo: 'PROP-2025-00105', qty: 1,  desc: 'CCTV Camera Set 8 Channels with DVR and 1TB HDD' },
    { code: 'SWITCH-001',          propNo: 'PROP-2025-00106', qty: 1,  desc: 'Cisco Catalyst 2960 24-Port Network Switch, PoE' },
    { code: 'AIRCON-001',          propNo: 'PROP-2025-00107', qty: 1,  desc: 'Standing Air Conditioner 2HP Carrier, Inverter Type' },
    { code: 'MONITOR-001',         propNo: 'PROP-2025-00108', qty: 3,  desc: 'Dell 27" IPS Monitor, 4K UHD, HDMI & DisplayPort' },
    { code: 'WEBCAM-001',          propNo: 'PROP-2025-00109', qty: 5,  desc: 'Logitech C920 HD Pro Webcam, 1080p, AutoFocus' },
    { code: 'SCANNER-001',         propNo: 'PROP-2025-00110', qty: 1,  desc: 'Fujitsu fi-7160 Document Scanner, Duplex, 60ppm' },
  ];

  let filtered = [], page = 1;
  const PAGE = 10;
  let _listeners = [];
  function on(el, evt, fn) { el.addEventListener(evt, fn); _listeners.push({ el, evt, fn }); }

  function injectPrintBtn() {
    const existing = document.getElementById('_rspi_print_btn');
    if (existing) existing.remove();
    const btn = document.createElement('button');
    btn.id = '_rspi_print_btn';
    btn.className = 'vm-btn-confirm vm-btn-confirm--view';
    btn.style.cssText = 'margin-top:14px;display:inline-flex;align-items:center;gap:6px;';
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
        <polyline points="6 9 6 2 18 2 18 9"/>
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
        <rect x="6" y="14" width="12" height="8"/>
      </svg> Print`;
    btn.addEventListener('click', () => {
      Toast && Toast.show('Opening print dialog…', 'info');
      window.print();
    });
    const footer = document.getElementById('views-table-footer');
    if (footer) footer.after(btn);
  }

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
      <td>${VH.idBadge(r.code)}</td>
      <td>${VH.idBadge(r.propNo, 'green')}</td>
      <td style="text-align:center;font-weight:600;">${r.qty}</td>
      <td style="max-width:280px;white-space:normal;">${r.desc}</td>
    </tr>`).join('');
    VH.updateShowing(filtered, page, PAGE);
  }

  function onLoad() {
    filtered = [...allData]; page = 1;
    const thead = document.getElementById('views-thead');
    if (thead) thead.innerHTML = `<tr>
      <th>ITEM CODE</th>
      <th>PROPERTY NUMBER</th>
      <th style="text-align:center;">QUANTITY</th>
      <th>DESCRIPTION</th>
    </tr>`;
    renderTable();
    requestAnimationFrame(() => injectPrintBtn());
    const searchEl = document.getElementById('views-search');
    if (searchEl) on(searchEl, 'input', () => {
      const q = searchEl.value.toLowerCase();
      filtered = q
        ? allData.filter(r => Object.values(r).join(' ').toLowerCase().includes(q))
        : [...allData];
      page = 1; renderTable();
    });
  }

  function onUnload() {
    _listeners.forEach(({ el, evt, fn }) => el.removeEventListener(evt, fn));
    _listeners = []; filtered = [];
    const btn = document.getElementById('_rspi_print_btn'); if (btn) btn.remove();
    const h = document.getElementById(HOST); if (h) h.remove();
  }

  window.VIEW_VIEWS['rspi-view'] = {
    label: 'RSPI View', group: 'Reports', hasDateBar: false,
    filterFields: ['ItemCode', 'PropertyNumber', 'Quantity', 'Description'],
    columns: ['Item Code', 'Property Number', 'Quantity', 'Description'],
    onLoad, onUnload,
  };
}());

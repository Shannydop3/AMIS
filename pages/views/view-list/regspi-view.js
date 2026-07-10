/* ── RegSPI View ─────────────────────────────── */
(function () {
  'use strict';
  window.VIEW_VIEWS = window.VIEW_VIEWS || {};

  const HOST = '_regspi_host';
  const allData = [
    { date: '2026-01-15', propNo: 'PROP-2025-00101', desc: 'Laptop Dell XPS 15 – Intel Core i7',          life: '5 years', amount: '₱85,000.00', remarks: '—' },
    { date: '2026-02-10', propNo: 'PROP-2025-00102', desc: 'HP LaserJet Pro M404dn',                       life: '5 years', amount: '₱22,500.00', remarks: '—' },
    { date: '2026-03-01', propNo: 'PROP-2025-00103', desc: 'Epson LQ-2190 Dot Matrix Printer',             life: '7 years', amount: '₱18,000.00', remarks: 'For encoding unit' },
    { date: '2026-03-20', propNo: 'PROP-2025-00104', desc: 'Uninterruptible Power Supply 1500VA',          life: '3 years', amount: '₱12,000.00', remarks: '—' },
    { date: '2026-04-05', propNo: 'PROP-2025-00105', desc: 'CCTV Camera Set (8 channels)',                 life: '5 years', amount: '₱45,000.00', remarks: 'Installed at lobby' },
    { date: '2026-04-18', propNo: 'PROP-2025-00106', desc: 'Cisco Catalyst 2960 Network Switch',           life: '7 years', amount: '₱38,500.00', remarks: '—' },
    { date: '2026-04-25', propNo: 'PROP-2025-00107', desc: 'Standing Air Conditioner 2HP Carrier',         life: '10 years', amount: '₱55,000.00', remarks: 'For server room' },
  ];

  let filtered = [], page = 1;
  const PAGE = 10;
  let _listeners = [];
  function on(el, evt, fn) { el.addEventListener(evt, fn); _listeners.push({ el, evt, fn }); }

  /* ── Print button helper ── */
  function injectPrintBtn(container) {
    const existing = document.getElementById('_regspi_print_btn');
    if (existing) existing.remove();
    const btn = document.createElement('button');
    btn.id = '_regspi_print_btn';
    btn.className = 'vm-btn-confirm vm-btn-confirm--view';
    btn.style.cssText = 'margin-top:14px;display:inline-flex;align-items:center;gap:6px;';
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
      <polyline points="6 9 6 2 18 2 18 9"/>
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
      <rect x="6" y="14" width="12" height="8"/>
    </svg> Print ▾`;
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
      tbody.innerHTML = `<tr><td colspan="6" class="dash-empty">No data available in table</td></tr>`;
      VH.updateShowing([], 1, PAGE); return;
    }
    tbody.innerHTML = slice.map(r => `<tr>
      <td style="font-size:12px;color:var(--text-secondary);white-space:nowrap;">${r.date}</td>
      <td>${VH.idBadge(r.propNo)}</td>
      <td style="max-width:220px;white-space:normal;">${r.desc}</td>
      <td style="text-align:center;">${r.life}</td>
      <td style="text-align:right;font-weight:600;color:var(--primary-dark);">${r.amount}</td>
      <td style="color:${r.remarks==='—'?'#adb5bd':'inherit'};">${r.remarks}</td>
    </tr>`).join('');
    VH.updateShowing(filtered, page, PAGE);
  }

  function onLoad() {
    filtered = [...allData]; page = 1;
    const df = document.getElementById('views-date-from');
    const dt = document.getElementById('views-date-to');
    if (df) df.value = '2026-01-01'; if (dt) dt.value = '2026-05-07';
    const thead = document.getElementById('views-thead');
    if (thead) thead.innerHTML = `<tr>
      <th>DATE</th><th>PROPERTY NUMBER</th><th>ITEM DESCRIPTION</th>
      <th style="text-align:center;">ESTIMATED USEFUL LIFE</th>
      <th style="text-align:right;">AMOUNT</th><th>REMARKS</th>
    </tr>`;
    renderTable();
    /* Inject print button after the table footer */
    requestAnimationFrame(() => injectPrintBtn());
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
    const btn = document.getElementById('_regspi_print_btn'); if (btn) btn.remove();
    const h = document.getElementById(HOST); if (h) h.remove();
  }

  window.VIEW_VIEWS['regspi-view'] = {
    label: 'RegSPI View', group: 'Reports', hasDateBar: true,
    filterFields: ['ItemCode', 'PropertyNumber', 'ClassificationName', 'CategoryName', 'BrandName', 'ModelName'],
    columns: ['Date', 'Property Number', 'Item Description', 'Estimated Useful Life', 'Amount', 'Remarks'],
    onLoad, onUnload,
  };
}());

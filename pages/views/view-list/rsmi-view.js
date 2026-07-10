/* ── RSMI View ───────────────────────────────── */
(function () {
  'use strict';
  window.VIEW_VIEWS = window.VIEW_VIEWS || {};

  const HOST = '_rsmi_host';
  const allData = [
    { code: 'ALCO-10404010-0002', dept: 'Asset Management Section',    issuance: 'SI-2026-00301', qty: 5,  desc: 'ALCOHOL, Ethyl, 1 Gallon' },
    { code: 'PAPER-10404010-0010', dept: 'Accounting Division',        issuance: 'SI-2026-00298', qty: 20, desc: 'Bond Paper, A4, 80gsm' },
    { code: 'PEN-10404010-0015',   dept: 'Budget Division',            issuance: 'SI-2026-00290', qty: 5,  desc: 'Ballpen, Black, Box of 12' },
    { code: 'FOLD-10404990-0030',  dept: 'Cash Division',              issuance: 'SI-2026-00280', qty: 100,desc: 'Folder, Expanded, Long' },
    { code: 'RUBB-10404010-0018',  dept: 'Administrative Service',     issuance: 'SI-2026-00275', qty: 6,  desc: 'Rubber Band, No. 18, 350g' },
    { code: 'STPL-10404010-0022',  dept: 'Commission On Audit',        issuance: 'SI-2026-00270', qty: 2,  desc: 'Stapler, Heavy Duty' },
    { code: 'TAPE-10404010-0025',  dept: 'Central Office',             issuance: 'SI-2026-00265', qty: 10, desc: 'Tape, Transparent, 48mm x 50m' },
    { code: 'BOOTS-10404990-0001', dept: 'Civil Works Unit',           issuance: 'SI-2026-00260', qty: 3,  desc: 'Rain Boots' },
  ];

  const DEPTS = [
    '--- Select User Department ---',
    'Accounting Division', 'Administrative Service', 'Asset Management Section',
    'Bids and Awards Committee Secretariat', 'Budget Division', 'Cash Division',
    'Central Office', 'Central Receiving and Releasing Unit',
    'Chief Information Officers (CIO) CORPS', 'Civil Works Unit', 'Commission On Audit',
  ];

  let filtered = [], page = 1;
  const PAGE = 10;
  let _listeners = [], _deptSel = null;
  function on(el, evt, fn) { el.addEventListener(evt, fn); _listeners.push({ el, evt, fn }); }

  function injectDeptRow() {
    const existing = document.getElementById('_rsmi_dept_row');
    if (existing) existing.remove();
    const wrap = document.createElement('div');
    wrap.id = '_rsmi_dept_row';
    wrap.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:14px;flex-wrap:wrap;';
    wrap.innerHTML = `
      <label style="font-size:0.82rem;font-weight:600;color:var(--text-secondary);white-space:nowrap;">
        User Department:
      </label>`;
    const sel = document.createElement('select');
    sel.style.cssText = 'height:34px;border:1px solid var(--border);border-radius:var(--radius-sm);padding:0 10px;font-size:0.78rem;color:var(--text-primary);background:var(--bg);min-width:260px;cursor:pointer;outline:none;font-family:inherit;';
    DEPTS.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d; opt.textContent = d;
      sel.appendChild(opt);
    });
    on(sel, 'change', () => {
      const q = sel.value === DEPTS[0] ? '' : sel.value;
      filtered = q ? allData.filter(r => r.dept === q) : [...allData];
      page = 1; renderTable();
    });
    _deptSel = sel;
    wrap.appendChild(sel);
    /* Insert before the toolbar (views-toolbar) */
    const toolbar = document.getElementById('views-toolbar');
    if (toolbar) toolbar.before(wrap);
  }

  function injectPrintBtn() {
    const existing = document.getElementById('_rsmi_print_btn');
    if (existing) existing.remove();
    const btn = document.createElement('button');
    btn.id = '_rsmi_print_btn';
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
      tbody.innerHTML = `<tr><td colspan="5" class="dash-empty">No data available in table</td></tr>`;
      VH.updateShowing([], 1, PAGE); return;
    }
    tbody.innerHTML = slice.map(r => `<tr>
      <td>${VH.idBadge(r.code, 'green')}</td>
      <td>${r.dept}</td>
      <td><code style="font-size:11px;background:#f3f4f6;color:#374151;padding:2px 6px;border-radius:4px;">${r.issuance}</code></td>
      <td style="text-align:center;font-weight:600;">${r.qty}</td>
      <td style="max-width:200px;white-space:normal;">${r.desc}</td>
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
      <th>ITEM CODE</th><th>USER DEPARTMENT</th>
      <th>ISSUANCE NUMBER</th><th style="text-align:center;">QUANTITY</th><th>DESCRIPTION</th>
    </tr>`;
    renderTable();
    requestAnimationFrame(() => {
      injectDeptRow();
      injectPrintBtn();
    });
    const searchEl = document.getElementById('views-search');
    if (searchEl) on(searchEl, 'input', () => {
      const dept = _deptSel && _deptSel.value !== DEPTS[0] ? _deptSel.value : '';
      const q = searchEl.value.toLowerCase();
      filtered = allData.filter(r => {
        const deptOk = !dept || r.dept === dept;
        const searchOk = !q || Object.values(r).join(' ').toLowerCase().includes(q);
        return deptOk && searchOk;
      });
      page = 1; renderTable();
    });
  }

  function onUnload() {
    _listeners.forEach(({ el, evt, fn }) => el.removeEventListener(evt, fn));
    _listeners = []; filtered = []; _deptSel = null;
    const deptRow = document.getElementById('_rsmi_dept_row'); if (deptRow) deptRow.remove();
    const btn = document.getElementById('_rsmi_print_btn'); if (btn) btn.remove();
    const h = document.getElementById(HOST); if (h) h.remove();
  }

  window.VIEW_VIEWS['rsmi-view'] = {
    label: 'RSMI View', group: 'Reports', hasDateBar: true,
    filterFields: ['ItemCode', 'UserDepartment', 'IssuanceNumber', 'Quantity', 'Description'],
    columns: ['Item Code', 'User Department', 'Issuance Number', 'Quantity', 'Description'],
    onLoad, onUnload,
  };
}());

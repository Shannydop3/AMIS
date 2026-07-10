/* ============================================
   AMIS – Dashboard Page Script
   ============================================ */
'use strict';

// Wait for layout.js to finish injecting the sidebar + header
// before touching any DOM elements.
document.addEventListener('amis:layout-ready', () => {

  /* ── Auth ─────────────────────────────────── */
  Auth.requireAuth('../login/login.html');

  // NOTE: user info (name, role, avatar) is already populated
  // by layout.js — no need to do it again here.

  /* ── KPI tile counts (Supabase) ─────────────
     Each tile shows a live COUNT(*) from an operational table.
     Fails silently to a "—" placeholder if the query errors. */
  (async function loadKpis() {
    const db = await window.AMIS_READY;
    if (!db) return;
    async function count(table, filter) {
      let q = db.from(table).select('id', { count: 'exact', head: true });
      if (filter) filter.forEach(f => { q = q.eq(f.col, f.val); });
      const { count: n, error } = await q;
      if (error) throw error;
      return n || 0;
    }
    function paint(id, val) {
      const el = document.getElementById(id);
      if (el) el.textContent = String(val);
    }
    try {
      const [issued, onStock, pendingApproval, openInventory, propertyPending] = await Promise.all([
        count('property_records',   [{ col: 'status', val: 'Issued' }]).catch(() => 0),
        count('stock_records',      null).catch(() => 0),
        count('property_requests',  [{ col: 'status', val: 'Pending' }]).catch(() => 0),
        count('inventory_counts',   [{ col: 'status', val: 'Draft' }]).catch(() => 0),
        count('property_records',   [{ col: 'status', val: 'Active' }]).catch(() => 0)
      ]);
      paint('kpi-issued',                issued);
      paint('kpi-onstock',               onStock);
      paint('kpi-pendingupload',         0);              // No dedicated table yet
      paint('kpi-pendingverification',   propertyPending);
      paint('kpi-pendingapproval',       pendingApproval);
      paint('kpi-openinventory',         openInventory);
    } catch (err) {
      console.warn('[dashboard] KPI load failed', err);
      ['kpi-issued','kpi-onstock','kpi-pendingupload','kpi-pendingverification','kpi-pendingapproval','kpi-openinventory']
        .forEach(id => paint(id, 0));
    }
  })();

  /* ── Collapsible Cards ────────────────────── */
  document.querySelectorAll('.dash-card__head.dash-collapsible').forEach(head => {
    head.addEventListener('click', e => {
      const clickedTbar = e.target.closest('.tbar__view-btn') || e.target.closest('.tbar__dots');
      if (clickedTbar) return;
      head.closest('.dash-card').classList.toggle('collapsed');
    });
  });

  /* ── Expand / Collapse All ────────────────── */
  const expandAllBtn = document.getElementById('btn-expand-all');
  const btnLabel     = expandAllBtn.querySelector('span');

  function updateExpandBtn() {
    const allExpanded = [...document.querySelectorAll('.dash-card__head.dash-collapsible')]
      .every(h => !h.closest('.dash-card').classList.contains('collapsed'));
    expandAllBtn.classList.toggle('all-expanded', allExpanded);
    btnLabel.textContent = allExpanded ? 'Collapse All' : 'Expand All';
  }

  expandAllBtn.addEventListener('click', () => {
    const allExpanded = expandAllBtn.classList.contains('all-expanded');
    document.querySelectorAll('.dash-card__head.dash-collapsible').forEach(head => {
      head.closest('.dash-card').classList.toggle('collapsed', allExpanded);
    });
    updateExpandBtn();
  });

  // Keep button label in sync when individual cards are toggled
  document.querySelectorAll('.dash-card__head.dash-collapsible').forEach(head => {
    head.addEventListener('click', () => updateExpandBtn());
  });


  document.querySelectorAll('.dash-card__head.dash-collapsible').forEach(head => {
    head.closest('.dash-card').classList.add('collapsed');
  });

  /* ── Table Search ─────────────────────────── */
  document.querySelectorAll('.dash-search').forEach(input => {
    input.addEventListener('input', () => {
      const tbl = document.getElementById(input.dataset.table);
      if (!tbl) return;
      const q = input.value.toLowerCase();
      tbl.querySelectorAll('tbody tr').forEach(row => {
        if (row.querySelector('.dash-empty')) return;
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  });

  /* ── Tile / KPI clicks ────────────────────── */
  document.querySelectorAll('.dash-tile, .dash-inv-tile').forEach(tile => {
    tile.addEventListener('click', () => {
      Toast.show(`${tile.querySelector('.dash-tile__lbl')?.textContent || ''} detail view coming soon.`, 'info');
    });
  });
  document.querySelectorAll('.dash-kpi').forEach(kpi => {
    kpi.style.cursor = 'pointer';
    kpi.addEventListener('click', () => {
      Toast.show(`${kpi.querySelector('.dash-kpi__lbl')?.textContent || ''} detail view coming soon.`, 'info');
    });
  });

  /* ══════════════════════════════════════════
     FLOATING DROPDOWN
  ══════════════════════════════════════════ */
  const floatDrop = document.createElement('div');
  floatDrop.id = 'tbar-float-drop';
  floatDrop.style.cssText = `
    position: fixed;
    background: #fff;
    border: 1px solid #D1DCE8;
    border-radius: 10px;
    box-shadow: 0 8px 32px rgba(10,61,124,0.18);
    min-width: 180px;
    z-index: 99999;
    overflow: hidden;
    display: none;
    animation: tbarFadeIn 0.15s ease;
  `;
  document.body.appendChild(floatDrop);

  const styleEl = document.createElement('style');
  styleEl.textContent = `
    @keyframes tbarFadeIn {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    #tbar-float-drop button {
      display: flex; align-items: center; gap: 10px;
      width: 100%; padding: 9px 14px;
      background: none; border: none;
      font-size: 0.8rem; color: #0D1B2A;
      cursor: pointer; text-align: left;
      white-space: nowrap; font-family: inherit;
      transition: background 0.12s;
    }
    #tbar-float-drop button:hover { background: rgba(10,61,124,0.06); color: #0A3D7C; }
    #tbar-float-drop button svg { width: 15px; height: 15px; flex-shrink: 0; color: #4A6080; }
    #tbar-float-drop hr { border: none; border-top: 1px solid #D1DCE8; margin: 4px 0; }
    #tbar-float-drop .drop-section-label {
      font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.1em; color: #8A9BB0; padding: 8px 14px 4px;
      pointer-events: none;
    }
    #tbar-float-drop .drop-col-row {
      display: flex; align-items: center; gap: 9px;
      width: 100%; padding: 7px 14px;
      background: none; border: none;
      font-size: 0.8rem; color: #0D1B2A;
      cursor: pointer; text-align: left; font-family: inherit;
    }
    #tbar-float-drop .drop-col-row:hover { background: rgba(10,61,124,0.05); }
    #tbar-float-drop .drop-col-row input { width:14px; height:14px; accent-color:#1976D2; cursor:pointer; flex-shrink:0; }
    #tbar-float-drop .drop-active { color: #0A3D7C; font-weight: 700; background: rgba(10,61,124,0.05); }
    #tbar-float-drop .drop-active svg { color: #0A3D7C; }
    #tbar-float-drop .drop-col-scroll::-webkit-scrollbar { width: 4px; }
    #tbar-float-drop .drop-col-scroll::-webkit-scrollbar-thumb { background: #D1DCE8; border-radius: 99px; }
    #tbar-float-drop .drop-col-scroll { scrollbar-width: thin; scrollbar-color: #D1DCE8 transparent; }
  `;
  document.head.appendChild(styleEl);

  let activeDropBtn = null;

  function openFloat(anchorEl, buildFn) {
    if (activeDropBtn === anchorEl) { closeFloat(); return; }
    activeDropBtn = anchorEl;
    floatDrop.innerHTML = '';
    buildFn(floatDrop);
    floatDrop.style.display = 'block';

    requestAnimationFrame(() => {
      const rect = anchorEl.getBoundingClientRect();
      const w = floatDrop.offsetWidth;
      let top  = rect.bottom + 6;
      let left = rect.right - w;
      if (left < 8) left = 8;
      if (top + floatDrop.offsetHeight > window.innerHeight - 8)
        top = rect.top - floatDrop.offsetHeight - 6;
      floatDrop.style.top  = top  + 'px';
      floatDrop.style.left = left + 'px';
    });
  }

  function closeFloat() {
    floatDrop.style.display = 'none';
    activeDropBtn = null;
  }

  document.addEventListener('click', e => {
    if (!floatDrop.contains(e.target) && e.target !== activeDropBtn) closeFloat();
  });

  floatDrop.addEventListener('scroll',     e => e.stopPropagation(), { passive: true, capture: true });
  floatDrop.addEventListener('wheel',      e => e.stopPropagation(), { passive: true, capture: true });
  floatDrop.addEventListener('touchmove',  e => e.stopPropagation(), { passive: true, capture: true });

  /* Close dropdown on page scroll, but NOT when scrolling inside the dropdown itself */
  const pageContent = document.getElementById('page-content');
  if (pageContent) {
    pageContent.addEventListener('scroll', () => closeFloat(), { passive: true });
  }
  window.addEventListener('scroll', () => closeFloat(), { passive: true });

  /* ── Chart instances ──────────────────────── */
  const chartInstances = {};
  const CHART_COLORS = [
    '#1565C0','#0e8073','#d35400','#7d3c98','#c0392b','#1e8449',
    '#2471a3','#117864','#b7770d','#6c3483','#922b21','#1d6a39'
  ];

  /* ── Get visible table data ────────────────── */
  function getTableData(tbl) {
    const headers = [];
    tbl.querySelectorAll('thead th').forEach(th => {
      if (th.style.display !== 'none') headers.push(th.textContent.trim());
    });
    const rows = [];
    tbl.querySelectorAll('tbody tr').forEach(row => {
      if (row.querySelector('.dash-empty') || row.style.display === 'none') return;
      const cells = [];
      row.querySelectorAll('td').forEach((td, i) => {
        const th = tbl.querySelectorAll('thead th')[i];
        if (!th || th.style.display !== 'none') cells.push(td.textContent.trim());
      });
      if (cells.length) rows.push(cells);
    });
    return { headers, rows };
  }

  /* ── Copy ─────────────────────────────────── */
  function copyTable(tbl) {
    const { headers, rows } = getTableData(tbl);
    const text = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
    navigator.clipboard.writeText(text)
      .then(() => Toast.show('Table copied to clipboard.', 'success'))
      .catch(() => Toast.show('Copy failed.', 'error'));
  }

  /* ── CSV ──────────────────────────────────── */
  function exportCSV(tbl, title) {
    const { headers, rows } = getTableData(tbl);
    const esc = v => `"${v.replace(/"/g,'""')}"`;
    const csv = [headers.map(esc).join(','), ...rows.map(r => r.map(esc).join(','))].join('\n');
    dlBlob(csv, title + '.csv', 'text/csv');
    Toast.show('CSV exported.', 'success');
  }

  /* ── Excel ────────────────────────────────── */
  function exportExcel(tbl, title) {
    const { headers, rows } = getTableData(tbl);
    let html = `<table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>`;
    rows.forEach(r => { html += `<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`; });
    html += '</tbody></table>';
    const full = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body>${html}</body></html>`;
    dlBlob(full, title + '.xls', 'application/vnd.ms-excel');
    Toast.show('Excel file exported.', 'success');
  }

  /* ── Print ────────────────────────────────── */
  function printTable(tbl, title) {
    const { headers, rows } = getTableData(tbl);
    const html = `<html><head><title>${title}</title>
    <style>body{font-family:Arial,sans-serif;font-size:12px}h2{color:#0A3D7C;margin-bottom:12px}
    table{border-collapse:collapse;width:100%}th{background:#0A3D7C;color:#fff;padding:6px 8px;text-align:left;font-size:11px}
    td{padding:5px 8px;border-bottom:1px solid #ddd}tr:nth-child(even)td{background:#f5f7fa}
    @media print{@page{margin:1cm}}</style></head>
    <body><h2>${title}</h2>
    <table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table></body></html>`;
    const w = window.open('','_blank');
    w.document.write(html); w.document.close(); w.focus();
    setTimeout(() => { w.print(); w.close(); }, 400);
  }

  /* ── Download blob ───────────────────────── */
  function dlBlob(content, filename, mime) {
    const url = URL.createObjectURL(new Blob([content], { type: mime }));
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  /* ── Render chart ─────────────────────────── */
  function renderChart(cardEl, tableId, chartType) {
    const tbl = document.getElementById(tableId);
    const vw  = cardEl.querySelector('.dash-view-wrap');
    if (!vw) return;
    const tableWrap = vw.querySelector('.dash-table-wrap');
    const chartWrap = vw.querySelector('.dash-chart-wrap');
    const canvas    = chartWrap.querySelector('.dash-chart-canvas');

    if (chartInstances[tableId]) { chartInstances[tableId].destroy(); delete chartInstances[tableId]; }

    const { headers, rows } = getTableData(tbl);
    if (!rows.length) { Toast.show('No data to chart.', 'warning'); return; }

    const labels = rows.map(r => r[0]);
    let valCol = rows[0].length - 1;
    for (let i = rows[0].length - 1; i >= 0; i--) {
      if (!isNaN(parseFloat(rows[0][i]))) { valCol = i; break; }
    }
    const data = rows.map(r => parseFloat(r[valCol]) || 0);

    tableWrap.style.display = 'none';
    chartWrap.style.display = 'block';

    const datasets = [{ data, backgroundColor: CHART_COLORS.slice(0, data.length), borderRadius: chartType === 'bar' ? 4 : 0 }];
    chartInstances[tableId] = new Chart(canvas, {
      type: chartType,
      data: { labels, datasets: chartType === 'bar' ? [{ ...datasets[0], label: headers[valCol] || 'Value' }] : datasets },
      options: {
        responsive: true,
        plugins: { legend: { display: chartType === 'pie', position: 'bottom', labels: { font: { size: 11 } } } },
        scales: chartType === 'bar' ? { y: { beginAtZero: true } } : {}
      }
    });
  }

  /* ── Switch to table view ────────────────── */
  function showTableView(cardEl, tableId) {
    const vw = cardEl.querySelector('.dash-view-wrap');
    if (!vw) return;
    vw.querySelector('.dash-table-wrap').style.display = '';
    vw.querySelector('.dash-chart-wrap').style.display = 'none';
    if (chartInstances[tableId]) { chartInstances[tableId].destroy(); delete chartInstances[tableId]; }
  }

  /* ── Column visibility ───────────────────── */
  function toggleColumn(tbl, colIndex, visible) {
    tbl.querySelectorAll('tr').forEach(row => {
      const cell = row.querySelectorAll('th, td')[colIndex];
      if (cell) cell.style.display = visible ? '' : 'none';
    });
  }

  /* ── Build 3-dot dropdown content ─────────── */
  function buildDotsContent(container, tableId, title, cardEl) {
    const actions = [
      { label: 'Copy',  icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>', fn: () => copyTable(document.getElementById(tableId)) },
      { label: 'Excel', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/></svg>', fn: () => exportExcel(document.getElementById(tableId), title) },
      { label: 'CSV',   icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>', fn: () => exportCSV(document.getElementById(tableId), title) },
      { label: 'Print', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>', fn: () => printTable(document.getElementById(tableId), title) },
    ];
    actions.forEach(a => {
      const btn = document.createElement('button');
      btn.innerHTML = `${a.icon} ${a.label}`;
      btn.addEventListener('click', () => { closeFloat(); a.fn(); });
      container.appendChild(btn);
    });

    container.appendChild(document.createElement('hr'));

    const lbl = document.createElement('div');
    lbl.className = 'drop-section-label';
    lbl.textContent = 'Column Visibility';
    container.appendChild(lbl);

    // Scrollable wrapper — shows up to 5 rows (~34px each) then scrolls
    const colScroll = document.createElement('div');
    colScroll.className = 'drop-col-scroll';
    colScroll.style.cssText = 'overflow-y: auto; max-height: calc(5 * 34px); overscroll-behavior: contain;';
    container.appendChild(colScroll);

    const tbl = document.getElementById(tableId);
    tbl.querySelectorAll('thead th').forEach((th, i) => {
      const row = document.createElement('label');
      row.className = 'drop-col-row';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = th.style.display !== 'none';
      cb.addEventListener('change', e => { e.stopPropagation(); toggleColumn(tbl, i, cb.checked); });
      row.appendChild(cb);
      row.appendChild(document.createTextNode(th.textContent.trim()));
      colScroll.appendChild(row);
    });
  }

  /* ── Build view dropdown content ─────────── */
  function buildViewContent(container, tableId, cardEl, currentMode, onSwitch) {
    const views = [
      { key: 'table', label: 'Table',     icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>' },
      { key: 'bar',   label: 'Bar Graph', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="10" width="4" height="10"/><rect x="10" y="6" width="4" height="14"/><rect x="18" y="2" width="4" height="18"/></svg>' },
      { key: 'pie',   label: 'Pie Graph', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>' },
    ];
    views.forEach(v => {
      const btn = document.createElement('button');
      btn.innerHTML = `${v.icon} ${v.label}`;
      if (v.key === currentMode[tableId]) btn.classList.add('drop-active');
      btn.addEventListener('click', () => {
        closeFloat();
        currentMode[tableId] = v.key;
        onSwitch(v);
      });
      container.appendChild(btn);
    });
  }

  /* ── Build toolbars ───────────────────────── */
  const viewMode = {};

  document.querySelectorAll('.tbar[data-table]').forEach(tbarEl => {
    const tableId = tbarEl.dataset.table;
    const title   = tbarEl.dataset.title || tableId;
    const cardEl  = tbarEl.closest('.dash-card');
    viewMode[tableId] = 'table';

    const viewBtn = document.createElement('button');
    viewBtn.className = 'tbar__view-btn';
    viewBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
      <span class="tbar__view-label">Table</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:11px;height:11px">
        <polyline points="6 9 12 15 18 9"/>
      </svg>`;
    viewBtn.addEventListener('click', e => {
      e.stopPropagation();
      openFloat(viewBtn, container => {
        buildViewContent(container, tableId, cardEl, viewMode, v => {
          viewBtn.querySelector('.tbar__view-label').textContent = v.label;
          if (v.key === 'table') showTableView(cardEl, tableId);
          else renderChart(cardEl, tableId, v.key);
        });
      });
    });

    const dotsBtn = document.createElement('button');
    dotsBtn.className = 'tbar__dots';
    dotsBtn.title = 'Options';
    dotsBtn.textContent = '⋮';
    dotsBtn.addEventListener('click', e => {
      e.stopPropagation();
      openFloat(dotsBtn, container => {
        buildDotsContent(container, tableId, title, cardEl);
      });
    });

    tbarEl.appendChild(viewBtn);
    tbarEl.appendChild(dotsBtn);
  });

});
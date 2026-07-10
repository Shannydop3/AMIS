/* ============================================
   AMIS – Views Page Script
   ============================================ */
'use strict';

document.addEventListener('amis:layout-ready', () => {

  /* ── Auth ─────────────────────────────────── */
  Auth.requireAuth('../login/login.html');

  /* ══════════════════════════════════════════
     COLLAPSIBLE CARDS
  ══════════════════════════════════════════ */
  document.querySelectorAll('.dash-card__head.dash-collapsible').forEach(head => {
    head.addEventListener('click', e => {
      if (e.target.closest('.tbar__view-btn') || e.target.closest('.tbar__dots')) return;
      head.closest('.dash-card').classList.toggle('collapsed');
    });
  });

  /* ══════════════════════════════════════════
     FLOATING DROPDOWN  (identical to dashboard.js)
  ══════════════════════════════════════════ */
  const floatDrop = document.createElement('div');
  floatDrop.id = 'tbar-float-drop';
  floatDrop.style.cssText = [
    'position:fixed',
    'background:#fff',
    'border:1px solid #D1DCE8',
    'border-radius:10px',
    'box-shadow:0 8px 32px rgba(10,61,124,0.18)',
    'min-width:180px',
    'z-index:99999',
    'overflow:hidden',
    'display:none',
    'animation:tbarFadeIn 0.15s ease',
  ].join(';');
  document.body.appendChild(floatDrop);

  const styleEl = document.createElement('style');
  styleEl.textContent = `
    @keyframes tbarFadeIn {
      from { opacity:0; transform:translateY(-6px); }
      to   { opacity:1; transform:translateY(0); }
    }
    #tbar-float-drop button {
      display:flex; align-items:center; gap:10px;
      width:100%; padding:9px 14px;
      background:none; border:none;
      font-size:0.8rem; color:#0D1B2A;
      cursor:pointer; text-align:left;
      white-space:nowrap; font-family:inherit;
      transition:background 0.12s;
    }
    #tbar-float-drop button:hover { background:rgba(10,61,124,0.06); color:#0A3D7C; }
    #tbar-float-drop button svg   { width:15px; height:15px; flex-shrink:0; color:#4A6080; }
    #tbar-float-drop hr           { border:none; border-top:1px solid #D1DCE8; margin:4px 0; }
    #tbar-float-drop .drop-section-label {
      font-size:0.68rem; font-weight:700; text-transform:uppercase;
      letter-spacing:0.1em; color:#8A9BB0; padding:8px 14px 4px;
      pointer-events:none;
    }
    #tbar-float-drop .drop-col-row {
      display:flex; align-items:center; gap:9px;
      width:100%; padding:7px 14px;
      background:none; border:none;
      font-size:0.8rem; color:#0D1B2A;
      cursor:pointer; text-align:left; font-family:inherit;
    }
    #tbar-float-drop .drop-col-row:hover { background:rgba(10,61,124,0.05); }
    #tbar-float-drop .drop-col-row input { width:14px; height:14px; accent-color:#1976D2; cursor:pointer; flex-shrink:0; }
    #tbar-float-drop .drop-active { color:#0A3D7C; font-weight:700; background:rgba(10,61,124,0.05); }
    #tbar-float-drop .drop-active svg { color:#0A3D7C; }
    #tbar-float-drop .drop-col-scroll { overflow-y:auto; max-height:calc(5 * 34px); overscroll-behavior:contain; scrollbar-width:thin; scrollbar-color:#D1DCE8 transparent; }
    #tbar-float-drop .drop-col-scroll::-webkit-scrollbar { width:4px; }
    #tbar-float-drop .drop-col-scroll::-webkit-scrollbar-thumb { background:#D1DCE8; border-radius:99px; }
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
      const w    = floatDrop.offsetWidth;
      let top    = rect.bottom + 6;
      let left   = rect.right - w;
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
  floatDrop.addEventListener('scroll',    e => e.stopPropagation(), { passive: true, capture: true });
  floatDrop.addEventListener('wheel',     e => e.stopPropagation(), { passive: true, capture: true });
  floatDrop.addEventListener('touchmove', e => e.stopPropagation(), { passive: true, capture: true });

  const pageContent = document.getElementById('page-content');
  if (pageContent) pageContent.addEventListener('scroll', () => closeFloat(), { passive: true });
  window.addEventListener('scroll', () => closeFloat(), { passive: true });

  /* ══════════════════════════════════════════
     TABLE UTILITIES  (identical to dashboard.js)
  ══════════════════════════════════════════ */
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

  function copyTable(tbl) {
    const { headers, rows } = getTableData(tbl);
    const text = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
    navigator.clipboard.writeText(text)
      .then(() => Toast.show('Table copied to clipboard.', 'success'))
      .catch(() => Toast.show('Copy failed.', 'error'));
  }

  function exportCSV(tbl, title) {
    const { headers, rows } = getTableData(tbl);
    const esc = v => `"${v.replace(/"/g, '""')}"`;
    const csv = [headers.map(esc).join(','), ...rows.map(r => r.map(esc).join(','))].join('\n');
    dlBlob(csv, title + '.csv', 'text/csv');
    Toast.show('CSV exported.', 'success');
  }

  function exportExcel(tbl, title) {
    const { headers, rows } = getTableData(tbl);
    let html = `<table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>`;
    rows.forEach(r => { html += `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`; });
    html += '</tbody></table>';
    const full = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body>${html}</body></html>`;
    dlBlob(full, title + '.xls', 'application/vnd.ms-excel');
    Toast.show('Excel file exported.', 'success');
  }

  function printTable(tbl, title) {
    const { headers, rows } = getTableData(tbl);
    const html = `<html><head><title>${title}</title>
    <style>body{font-family:Arial,sans-serif;font-size:12px}h2{color:#0A3D7C;margin-bottom:12px}
    table{border-collapse:collapse;width:100%}th{background:#0A3D7C;color:#fff;padding:6px 8px;text-align:left;font-size:11px}
    td{padding:5px 8px;border-bottom:1px solid #ddd}tr:nth-child(even)td{background:#f5f7fa}
    @media print{@page{margin:1cm}}</style></head>
    <body><h2>${title}</h2>
    <table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table></body></html>`;
    const w = window.open('', '_blank');
    w.document.write(html); w.document.close(); w.focus();
    setTimeout(() => { w.print(); w.close(); }, 400);
  }

  function dlBlob(content, filename, mime) {
    const url = URL.createObjectURL(new Blob([content], { type: mime }));
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  function toggleColumn(tbl, colIndex, visible) {
    tbl.querySelectorAll('tr').forEach(row => {
      const cell = row.querySelectorAll('th, td')[colIndex];
      if (cell) cell.style.display = visible ? '' : 'none';
    });
  }

  /* ══════════════════════════════════════════
     CHART  (identical to dashboard.js)
  ══════════════════════════════════════════ */
  const chartInstances = {};
  const CHART_COLORS = [
    '#1565C0','#0e8073','#d35400','#7d3c98','#c0392b','#1e8449',
    '#2471a3','#117864','#b7770d','#6c3483','#922b21','#1d6a39'
  ];

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

  function showTableView(cardEl, tableId) {
    const vw = cardEl.querySelector('.dash-view-wrap');
    if (!vw) return;
    vw.querySelector('.dash-table-wrap').style.display = '';
    vw.querySelector('.dash-chart-wrap').style.display = 'none';
    if (chartInstances[tableId]) { chartInstances[tableId].destroy(); delete chartInstances[tableId]; }
  }

  /* ══════════════════════════════════════════
     TBAR BUILDERS
  ══════════════════════════════════════════ */
  const viewMode = {};

  /* Build the ⋮ dots dropdown content — copy/excel/csv/print + col visibility */
  function buildDotsContent(container, tableId, title) {
    const actions = [
      { label: 'Copy',  icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',  fn: () => copyTable(document.getElementById(tableId)) },
      { label: 'Excel', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/></svg>', fn: () => exportExcel(document.getElementById(tableId), title) },
      { label: 'CSV',   icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',                               fn: () => exportCSV(document.getElementById(tableId), title) },
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

    const colScroll = document.createElement('div');
    colScroll.className = 'drop-col-scroll';
    container.appendChild(colScroll);

    const tbl = document.getElementById(tableId);
    if (tbl) {
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
  }

  /* Build view-switcher dropdown content (table / bar / pie) */
  function buildViewContent(container, tableId, cardEl, onSwitch) {
    const views = [
      { key: 'table', label: 'Table',     icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>' },
      { key: 'bar',   label: 'Bar Graph', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="10" width="4" height="10"/><rect x="10" y="6" width="4" height="14"/><rect x="18" y="2" width="4" height="18"/></svg>' },
      { key: 'pie',   label: 'Pie Graph', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>' },
    ];
    views.forEach(v => {
      const btn = document.createElement('button');
      btn.innerHTML = `${v.icon} ${v.label}`;
      if (v.key === (viewMode[tableId] || 'table')) btn.classList.add('drop-active');
      btn.addEventListener('click', () => {
        closeFloat();
        viewMode[tableId] = v.key;
        onSwitch(v);
      });
      container.appendChild(btn);
    });
  }

  /* ── Build dots-only tbar (for Advance Filter card) ── */
  function buildDotsOnlyTbar(tbarEl) {
    const tableId = tbarEl.dataset.table;
    const title   = tbarEl.dataset.title || tableId;

    const dotsBtn = document.createElement('button');
    dotsBtn.className = 'tbar__dots';
    dotsBtn.title = 'Options';
    dotsBtn.textContent = '⋮';
    dotsBtn.addEventListener('click', e => {
      e.stopPropagation();
      openFloat(dotsBtn, container => buildDotsContent(container, tableId, title));
    });
    tbarEl.appendChild(dotsBtn);
  }

  /* ── Build full tbar (view-switcher + dots) for data cards ── */
  function buildFullTbar(tbarEl) {
    // Clear any previously built buttons
    tbarEl.innerHTML = '';

    const tableId = tbarEl.dataset.table;
    const title   = tbarEl.dataset.title || tableId;
    const cardEl  = tbarEl.closest('.dash-card');

    viewMode[tableId] = viewMode[tableId] || 'table';

    /* View-switcher button */
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
        buildViewContent(container, tableId, cardEl, v => {
          viewBtn.querySelector('.tbar__view-label').textContent = v.label;
          if (v.key === 'table') showTableView(cardEl, tableId);
          else renderChart(cardEl, tableId, v.key);
        });
      });
    });

    /* Dots button */
    const dotsBtn = document.createElement('button');
    dotsBtn.className = 'tbar__dots';
    dotsBtn.title = 'Options';
    dotsBtn.textContent = '⋮';
    dotsBtn.addEventListener('click', e => {
      e.stopPropagation();
      openFloat(dotsBtn, container => buildDotsContent(container, tableId, title));
    });

    tbarEl.appendChild(viewBtn);
    tbarEl.appendChild(dotsBtn);
  }

  /* ── Wire up the Advance Filter tbar (dots only, no view-switcher) ── */
  const advfTbar = document.getElementById('advf-tbar');
  if (advfTbar) buildDotsOnlyTbar(advfTbar);

  /* ── The data card tbar is built (or rebuilt) when a view loads ── */

  /* ══════════════════════════════════════════
     TABLE SEARCH
  ══════════════════════════════════════════ */
  document.addEventListener('input', e => {
    const input = e.target.closest('.dash-search');
    if (!input) return;
    const tbl = document.getElementById(input.dataset.table);
    if (!tbl) return;
    const q = input.value.toLowerCase();
    tbl.querySelectorAll('tbody tr').forEach(row => {
      if (row.querySelector('.dash-empty')) return;
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });

  /* ══════════════════════════════════════════
     ADVANCE FILTER
  ══════════════════════════════════════════ */
  let advfFields        = [];
  let advfFilters       = [];
  let advfSelectedField = '';

  const advfLogicSel     = document.getElementById('advf-logic');
  const advfFilterByBtn  = document.getElementById('advf-filterby-btn');
  const advfFilterByLbl  = document.getElementById('advf-filterby-label');
  const advfFilterByDrop = document.getElementById('advf-filterby-drop');
  const advfFieldSearch  = document.getElementById('advf-field-search');
  const advfFieldList    = document.getElementById('advf-field-list');
  const advfOpSel        = document.getElementById('advf-operator');
  const advfValInp       = document.getElementById('advf-value');
  const advfAddBtn       = document.getElementById('advf-add');
  const advfRowsTbody    = document.getElementById('advf-rows');
  const advfShowing      = document.getElementById('advf-showing');
  const advfRowSearch    = document.getElementById('advf-row-search');

  function renderFieldList(query) {
    advfFieldList.innerHTML = '';
    const q = (query || '').toLowerCase();
    const filtered = advfFields.filter(f => !q || f.toLowerCase().includes(q));
    if (!filtered.length) {
      advfFieldList.innerHTML = '<li class="advf-drop-empty">No fields found</li>';
      return;
    }
    filtered.forEach(f => {
      const li = document.createElement('li');
      li.className = 'advf-drop-item' + (f === advfSelectedField ? ' advf-drop-item--active' : '');
      li.textContent = f;
      li.addEventListener('click', () => {
        advfSelectedField = f;
        advfFilterByLbl.textContent = f;
        advfFilterByDrop.style.display = 'none';
        renderFieldList();
      });
      advfFieldList.appendChild(li);
    });
  }

  advfFilterByBtn.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = advfFilterByDrop.style.display !== 'none';
    advfFilterByDrop.style.display = isOpen ? 'none' : 'block';
    if (!isOpen) { advfFieldSearch.value = ''; renderFieldList(); advfFieldSearch.focus(); }
  });

  advfFieldSearch.addEventListener('input', () => renderFieldList(advfFieldSearch.value));

  /* Close filter-by dropdown when clicking outside */
  document.addEventListener('click', e => {
    const wrap = document.getElementById('advf-filterby-wrap');
    if (wrap && !wrap.contains(e.target)) advfFilterByDrop.style.display = 'none';
  });

  function renderAdvfRows() {
    advfRowsTbody.innerHTML = '';
    if (!advfFilters.length) {
      advfRowsTbody.innerHTML = '<tr><td colspan="6" class="dash-empty">No filters applied.</td></tr>';
      advfShowing.textContent = 'Showing 0 to 0 of 0 entries';
      return;
    }
    const q = advfRowSearch ? advfRowSearch.value.toLowerCase() : '';
    let shown = 0;
    advfFilters.forEach((f, i) => {
      if (q && ![f.logic, f.field, f.op, f.value].join(' ').toLowerCase().includes(q)) return;
      shown++;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${f.logic}</td>
        <td>${f.field}</td>
        <td>${f.op}</td>
        <td>${f.value}</td>
        <td><span class="advf-active-badge"></span></td>
        <td style="white-space:nowrap;">
          <button class="advf-act-btn advf-act-btn--edit" data-i="${i}" title="Edit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="advf-act-btn advf-act-btn--del" data-i="${i}" title="Delete">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
            </svg>
          </button>
        </td>`;
      advfRowsTbody.appendChild(tr);
    });
    if (!shown) {
      advfRowsTbody.innerHTML = '<tr><td colspan="6" class="dash-empty">No matching filters.</td></tr>';
    }
    const n = advfFilters.length;
    advfShowing.textContent = `Showing 1 to ${n} of ${n} entries`;
  }

  advfAddBtn.addEventListener('click', () => {
    if (!advfSelectedField) { Toast.show('Please select a Filter By field.', 'warning'); return; }
    if (!advfOpSel.value)   { Toast.show('Please select an Operator.', 'warning'); return; }
    const val = advfValInp.value.trim();
    if (!val) { Toast.show('Please enter a Value.', 'warning'); return; }
    advfFilters.push({ logic: advfLogicSel.value || 'AND', field: advfSelectedField, op: advfOpSel.value, value: val });
    renderAdvfRows();
    advfValInp.value = '';
    Toast.show('Filter added.', 'success', 2000);
  });

  advfRowsTbody.addEventListener('click', e => {
    const del = e.target.closest('.advf-act-btn--del');
    if (del) {
      advfFilters.splice(parseInt(del.dataset.i), 1);
      renderAdvfRows();
    }
    const edit = e.target.closest('.advf-act-btn--edit');
    if (edit) {
      const i = parseInt(edit.dataset.i);
      const f = advfFilters[i];
      advfLogicSel.value = f.logic;
      advfSelectedField  = f.field;
      advfFilterByLbl.textContent = f.field;
      advfOpSel.value    = f.op;
      advfValInp.value   = f.value;
      advfFilters.splice(i, 1);
      renderAdvfRows();
    }
  });

  if (advfRowSearch) advfRowSearch.addEventListener('input', renderAdvfRows);

  /* ══════════════════════════════════════════
     CATEGORY SELECT → LOAD VIEW
  ══════════════════════════════════════════ */
  let currentKey = null;

  const sel            = document.getElementById('view-category');
  const titleEl        = document.getElementById('views-content-title');
  const pageTitleEl    = document.getElementById('views-page-title');
  const pageSubEl      = document.getElementById('views-page-sub');
  const emptyState     = document.getElementById('views-empty-state');
  const viewsToolbar   = document.getElementById('views-toolbar');
  const viewsViewWrap  = document.getElementById('views-view-wrap');
  const viewsFooter    = document.getElementById('views-table-footer');
  const viewsThead     = document.getElementById('views-thead');
  const viewsTbody     = document.getElementById('views-tbody');
  const viewsShowing   = document.getElementById('views-showing-info');
  const dateBar        = document.getElementById('views-date-bar');
  const viewsTbarEl    = document.getElementById('views-tbar');
  const cardViews      = document.getElementById('card-views-data');

  function loadView(key) {
    const view = (window.VIEW_VIEWS || {})[key];
    if (!view) { console.warn('[views] not found:', key); return; }

    if (currentKey && window.VIEW_VIEWS[currentKey]?.onUnload)
      window.VIEW_VIEWS[currentKey].onUnload();
    currentKey = key;

    /* Sync dropdown */
    sel.value = key;

    /* Update Advance Filter fields for this view */
    advfFields        = view.filterFields || [];
    advfSelectedField = '';
    advfFilterByLbl.textContent = 'Select Filter';
    renderFieldList();

    /* Date bar */
    if (view.hasDateBar) {
      const today = new Date().toISOString().slice(0, 10);
      document.getElementById('views-date-from').value = today;
      document.getElementById('views-date-to').value   = today;
      dateBar.style.display = '';
    } else {
      dateBar.style.display = 'none';
    }

    /* Titles */
    titleEl.textContent     = view.label;
    pageTitleEl.textContent = view.label;
    pageSubEl.textContent   = (view.group || 'Views') + ' › ' + view.label;
    document.title          = 'AMIS – ' + view.label + ' | DICT';
    const breadcrumb = document.getElementById('page-title');
    if (breadcrumb) breadcrumb.textContent = view.label;

    /* thead */
    viewsThead.innerHTML = '<tr>' + view.columns.map(c => `<th>${c}</th>`).join('') + '</tr>';

    /* tbody reset */
    viewsTbody.innerHTML = `<tr><td colspan="${view.columns.length}" class="dash-empty">No records found.</td></tr>`;

    /* Show elements */
    emptyState.style.display    = 'none';
    viewsToolbar.style.display  = '';
    viewsViewWrap.style.display = '';
    viewsFooter.style.display   = '';
    viewsShowing.textContent    = 'Showing 0 to 0 of 0 entries';

    /* Update tbar title and rebuild with correct columns */
    viewsTbarEl.dataset.title = view.label;
    buildFullTbar(viewsTbarEl);

    /* Reset to table view */
    showTableView(cardViews, 'views-table');
    viewMode['views-table'] = 'table';

    cardViews.classList.remove('collapsed');

    if (view.onLoad) view.onLoad();

    setTimeout(() => cardViews.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  }

  sel.addEventListener('change', function () {
    if (this.value) loadView(this.value);
  });

  /* Auto-load from URL ?view=KEY */
  const urlKey = new URLSearchParams(window.location.search).get('view');
  if (urlKey) loadView(urlKey);

  window.VIEW_LOAD = loadView;

});
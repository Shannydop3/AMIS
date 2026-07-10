/* ============================================
   AMIS – Files Data Page Script
   ============================================ */
'use strict';

document.addEventListener('amis:layout-ready', () => {

  /* ── Auth ─────────────────────────────────── */
  Auth.requireAuth('../login/login.html');

  /* ═══════════════════════════════════════════
     COLLAPSIBLE CARDS
  ═══════════════════════════════════════════ */
  document.querySelectorAll('.fd-collapsible').forEach(head => {
    head.addEventListener('click', e => {
      if (e.target.closest('.fd-add-btn') || e.target.closest('.fd-tbar')) return;
      head.closest('.fd-card').classList.toggle('collapsed');
      updateExpandBtn();
    });
  });
  document.querySelectorAll('.fd-card').forEach(card => card.classList.add('collapsed'));

  /* ── Expand / Collapse All ── */
  const expandAllBtn = document.getElementById('fd-btn-expand-all');
  const expandBtnLabel = expandAllBtn ? expandAllBtn.querySelector('span') : null;

  function updateExpandBtn() {
    if (!expandAllBtn) return;
    const allExpanded = [...document.querySelectorAll('.fd-collapsible')]
      .every(h => !h.closest('.fd-card').classList.contains('collapsed'));
    expandAllBtn.classList.toggle('all-expanded', allExpanded);
    if (expandBtnLabel) expandBtnLabel.textContent = allExpanded ? 'Collapse All' : 'Expand All';
  }

  if (expandAllBtn) {
    expandAllBtn.addEventListener('click', () => {
      const allExpanded = expandAllBtn.classList.contains('all-expanded');
      document.querySelectorAll('.fd-collapsible').forEach(head => {
        head.closest('.fd-card').classList.toggle('collapsed', allExpanded);
      });
      updateExpandBtn();
    });
  }

  /* ═══════════════════════════════════════════
     SEARCH
  ═══════════════════════════════════════════ */
  document.querySelectorAll('.fd-search').forEach(input => {
    input.addEventListener('input', () => {
      const tbl = document.getElementById(input.dataset.table);
      if (!tbl) return;
      const q = input.value.toLowerCase();
      tbl.querySelectorAll('tbody tr').forEach(row => {
        if (row.querySelector('.fd-empty')) return;
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  });

  /* ═══════════════════════════════════════════
     SORT
  ═══════════════════════════════════════════ */
  document.querySelectorAll('.fd-sort').forEach(sel => {
    sel.addEventListener('change', () => {
      const tbl = document.getElementById(sel.dataset.table);
      if (!tbl) return;
      const tbody = tbl.querySelector('tbody');
      const rows  = Array.from(tbody.querySelectorAll('tr')).filter(r => !r.querySelector('.fd-empty'));
      if (!rows.length) return;
      const val = sel.value;
      rows.sort((a, b) => {
        const aText = (a.cells[1]?.textContent || '').trim();
        const bText = (b.cells[1]?.textContent || '').trim();
        if (val === 'az') return aText.localeCompare(bText);
        if (val === 'za') return bText.localeCompare(aText);
        const aNum = parseInt(a.cells[0]?.textContent || '0');
        const bNum = parseInt(b.cells[0]?.textContent || '0');
        if (val === 'newest') return bNum - aNum;
        if (val === 'oldest') return aNum - bNum;
        return 0;
      });
      rows.forEach(r => tbody.appendChild(r));
    });
  });

  /* ═══════════════════════════════════════════
     FLOATING DOTS DROPDOWN
  ═══════════════════════════════════════════ */
  const floatDrop = document.getElementById('fd-float-drop');
  let activeDotsBtn = null;

  function openFloat(anchorEl, buildFn) {
    if (activeDotsBtn === anchorEl) { closeFloat(); return; }
    activeDotsBtn = anchorEl;
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
    activeDotsBtn = null;
  }

  document.addEventListener('click', e => {
    if (!floatDrop.contains(e.target) && e.target !== activeDotsBtn) closeFloat();
  });

  /* ── Table export helpers ────────────────── */
  function getTableData(tbl) {
    const headers = [];
    tbl.querySelectorAll('thead th').forEach(th => {
      if (th.style.display !== 'none') headers.push(th.textContent.trim());
    });
    const rows = [];
    tbl.querySelectorAll('tbody tr').forEach(row => {
      if (row.querySelector('.fd-empty') || row.style.display === 'none') return;
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
    const esc = v => '"' + v.replace(/"/g,'""') + '"';
    const csv = [headers.map(esc).join(','), ...rows.map(r => r.map(esc).join(','))].join('\n');
    dlBlob(csv, title + '.csv', 'text/csv');
    Toast.show('CSV exported.', 'success');
  }

  function exportExcel(tbl, title) {
    const { headers, rows } = getTableData(tbl);
    let html = '<table><thead><tr>' + headers.map(h => '<th>' + h + '</th>').join('') + '</tr></thead><tbody>';
    rows.forEach(r => { html += '<tr>' + r.map(c => '<td>' + c + '</td>').join('') + '</tr>'; });
    html += '</tbody></table>';
    const full = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body>' + html + '</body></html>';
    dlBlob(full, title + '.xls', 'application/vnd.ms-excel');
    Toast.show('Excel file exported.', 'success');
  }

  function printTable(tbl, title) {
    const { headers, rows } = getTableData(tbl);
    const html = '<html><head><title>' + title + '</title><style>body{font-family:Arial,sans-serif;font-size:12px}h2{color:#0A3D7C;margin-bottom:12px}table{border-collapse:collapse;width:100%}th{background:#0A3D7C;color:#fff;padding:6px 8px;text-align:left;font-size:11px}td{padding:5px 8px;border-bottom:1px solid #ddd}tr:nth-child(even)td{background:#f5f7fa}@media print{@page{margin:1cm}}</style></head><body><h2>' + title + '</h2><table><thead><tr>' + headers.map(h => '<th>' + h + '</th>').join('') + '</tr></thead><tbody>' + rows.map(r => '<tr>' + r.map(c => '<td>' + c + '</td>').join('') + '</tr>').join('') + '</tbody></table></body></html>';
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

  /* ── Build dots dropdown ─────────────────── */
  function buildDotsContent(container, tableId, title) {
    const tbl = document.getElementById(tableId);
    const actions = [
      { label: 'Copy',  icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>', fn: () => copyTable(tbl) },
      { label: 'Excel', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/></svg>', fn: () => exportExcel(tbl, title) },
      { label: 'CSV',   icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>', fn: () => exportCSV(tbl, title) },
      { label: 'Print', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>', fn: () => printTable(tbl, title) },
    ];
    actions.forEach(a => {
      const btn = document.createElement('button');
      btn.innerHTML = a.icon + ' ' + a.label;
      btn.addEventListener('click', () => { closeFloat(); a.fn(); });
      container.appendChild(btn);
    });
    container.appendChild(document.createElement('hr'));
    const lbl = document.createElement('div');
    lbl.className = 'fd-drop-section-label';
    lbl.textContent = 'Column Visibility';
    container.appendChild(lbl);
    tbl.querySelectorAll('thead th').forEach((th, i) => {
      const row = document.createElement('label');
      row.className = 'fd-drop-col-row';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = th.style.display !== 'none';
      cb.addEventListener('change', e => { e.stopPropagation(); toggleColumn(tbl, i, cb.checked); });
      row.appendChild(cb);
      row.appendChild(document.createTextNode(th.textContent.trim()));
      container.appendChild(row);
    });
  }

  /* ── Build toolbars ──────────────────────── */
  document.querySelectorAll('.fd-tbar[data-table]').forEach(tbarEl => {
    const tableId = tbarEl.dataset.table;
    const title   = tbarEl.dataset.title || tableId;
    const dotsBtn = document.createElement('button');
    dotsBtn.className = 'fd-tbar__dots';
    dotsBtn.title = 'Options';
    dotsBtn.textContent = '\u22EE';
    dotsBtn.addEventListener('click', e => {
      e.stopPropagation();
      openFloat(dotsBtn, container => buildDotsContent(container, tableId, title));
    });
    tbarEl.appendChild(dotsBtn);
  });

  /* ═══════════════════════════════════════════
     SVG ICONS
  ═══════════════════════════════════════════ */
  const EDIT_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
  const DEL_ICON  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>';
  const PLUS_SVG  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';

  /* ═══════════════════════════════════════════
     TABLE SCHEMAS
  ═══════════════════════════════════════════ */
  const TABLE_SCHEMAS = {
    'tbl-coa': [
      { id:'code', label:'Account Code', type:'text', req:true },
      { id:'name', label:'Account Name', type:'text', req:true },
      { id:'type', label:'Account Type', type:'select', req:true,
        options:['Asset','Liability','Equity','Revenue','Expense','Cost of Sales','Other Income','Other Expense'] },
    ],
    'tbl-category': [
      { id:'name', label:'Category Name', type:'text', req:true },
      { id:'desc', label:'Description',   type:'textarea' },
    ],
    'tbl-brand': [
      { id:'name', label:'Brand Name',  type:'text', req:true },
      { id:'desc', label:'Description', type:'textarea' },
    ],
    'tbl-model': [
      { id:'name', label:'Model Name',  type:'text', req:true },
      { id:'desc', label:'Description', type:'textarea' },
    ],
    'tbl-classification': [
      { id:'name', label:'Classification Name', type:'text', req:true },
      { id:'desc', label:'Description',         type:'textarea' },
    ],
    'tbl-uom': [
      { id:'name', label:'Unit of Measurement', type:'text', req:true },
      { id:'code', label:'Code',                type:'text', req:true },
      { id:'desc', label:'Description',         type:'textarea' },
    ],
    'tbl-supplier': [
      { id:'name',    label:'Supplier Name', type:'text',  req:true },
      { id:'contact', label:'Contact',       type:'text' },
      { id:'email',   label:'Email',         type:'email' },
    ],
    'tbl-region': [
      { id:'name', label:'Region',      type:'text', req:true },
      { id:'code', label:'Region Code', type:'text', req:true },
    ],
    'tbl-branch': [
      { id:'name',   label:'Branch',      type:'text', req:true },
      { id:'code',   label:'Branch Code', type:'text', req:true },
      { id:'region', label:'Region',      type:'select-table', req:true,
        sourceTable:'tbl-region', sourceCol:1, addSchema:'tbl-region', addLabel:'Region' },
      { id:'desc',   label:'Description', type:'textarea' },
    ],
    'tbl-office': [
      { id:'name',   label:'Office',      type:'text', req:true },
      { id:'branch', label:'Branch',      type:'select-table', req:true,
        sourceTable:'tbl-branch', sourceCol:1, addSchema:'tbl-branch', addLabel:'Branch' },
      { id:'desc',   label:'Description', type:'textarea' },
    ],
    'tbl-userdept': [
      { id:'name', label:'User Department', type:'text', req:true },
      { id:'desc', label:'Description',     type:'textarea' },
    ],
    'tbl-jobtitle': [
      { id:'name', label:'Job Title',       type:'text', req:true },
      { id:'dept', label:'User Department', type:'select-table', req:true,
        sourceTable:'tbl-userdept', sourceCol:1, addSchema:'tbl-userdept', addLabel:'User Department' },
      { id:'desc', label:'Description',     type:'textarea' },
    ],
    'tbl-custodian': [
      { id:'name', label:'Custodian Type', type:'text', req:true },
      { id:'desc', label:'Description',    type:'textarea' },
    ],
    'tbl-property': [
      { id:'code',  label:'Item Code',   type:'text',     req:true },
      { id:'desc',  label:'Description', type:'textarea', req:true },
      { id:'brand', label:'Brand',       type:'select-table',
        sourceTable:'tbl-brand', sourceCol:1, addSchema:'tbl-brand', addLabel:'Brand' },
      { id:'model', label:'Model',       type:'select-table',
        sourceTable:'tbl-model', sourceCol:1, addSchema:'tbl-model', addLabel:'Model' },
    ],
    'tbl-stock': [
      { id:'code', label:'Item Code',   type:'text',     req:true },
      { id:'desc', label:'Description', type:'textarea', req:true },
      { id:'unit', label:'Unit',        type:'select-table',
        sourceTable:'tbl-uom', sourceCol:1, addSchema:'tbl-uom', addLabel:'Unit of Measurement' },
    ],
    'tbl-task': [
      { id:'name',  label:'Task Name',       type:'text', req:true },
      { id:'desc',  label:'Description',     type:'textarea' },
      { id:'steps', label:'Number of Steps (max 10)', type:'number', max:10 },
    ],
    'tbl-tag': [
      { id:'tag',  label:'Tag Name', type:'text', req:true },
      { id:'type', label:'Tag Type', type:'select', req:true,
        options:['Barcode and RFID Sticker','Barcode Sticker','RFID Hard Tag'] },
      { id:'desc', label:'Description', type:'textarea' },
    ],
    'tbl-secq': [
      { id:'question', label:'Question', type:'textarea', req:true },
    ],
  };

  /* ── Get live options from a source table ── */
  function getLiveOptions(sourceTableId, sourceCol, selectedVal) {
    const tbl  = document.getElementById(sourceTableId);
    let opts   = '<option value="">— Select —</option>';
    if (tbl) {
      tbl.querySelectorAll('tbody tr').forEach(tr => {
        if (tr.querySelector('.fd-empty')) return;
        const val = tr.cells[sourceCol] ? tr.cells[sourceCol].textContent.trim() : '';
        if (val) opts += '<option value="' + val + '"' + (val === selectedVal ? ' selected' : '') + '>' + val + '</option>';
      });
    }
    return opts;
  }

  /* ── Get raw option strings from a source table ── */
  function getRawOptions(sourceTableId, sourceCol) {
    const tbl = document.getElementById(sourceTableId);
    const out = [];
    if (tbl) {
      tbl.querySelectorAll('tbody tr').forEach(function(tr) {
        if (tr.querySelector('.fd-empty')) return;
        const val = tr.cells[sourceCol] ? tr.cells[sourceCol].textContent.trim() : '';
        if (val) out.push(val);
      });
    }
    return out;
  }

  /* ═══════════════════════════════════════════
     BUILD MODAL FIELDS
  ═══════════════════════════════════════════ */
  function buildModalFields(fields, data) {
    data = data || {};
    let html = '';

    fields.forEach(function(f) {
      const val      = data[f.id] || '';
      const reqMark  = f.req ? '<span class="fd-req">*</span>' : '';
      let input      = '';

      if (f.type === 'textarea') {
        input = '<textarea class="fd-minput fd-mtextarea" id="mf-' + f.id + '" rows="3" maxlength="500">' + val + '</textarea>'
              + '<span class="fd-char-counter" id="mf-' + f.id + '-counter">' + (500 - val.length) + ' remaining character(s)</span>';

      } else if (f.type === 'number') {
        const maxAttr = f.max ? ' max="' + f.max + '"' : '';
        input = '<input type="number" class="fd-minput" id="mf-' + f.id + '" value="' + val + '" min="0"' + maxAttr + ' />';

      } else if (f.type === 'select') {
        let opts = '<option value="">— Select —</option>';
        f.options.forEach(function(o) {
          opts += '<option value="' + o + '"' + (val === o ? ' selected' : '') + '>' + o + '</option>';
        });
        input = '<div class="fd-select-wrap"><select class="fd-minput fd-mselect" id="mf-' + f.id + '">' + opts + '</select><svg class="fd-select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></div>';

      } else if (f.type === 'select-table') {
        const rawOpts = getRawOptions(f.sourceTable, f.sourceCol);
        const selId   = 'mf-' + f.id;
        const dropId  = 'drop-' + f.id;
        const srchId  = 'srch-' + f.id;
        input = '<div class="fd-select-add-row">'
              + '<div class="fd-select-wrap fd-select-wrap--grow fd-custom-sel-wrap" id="wrap-' + f.id + '">'
              +   '<button type="button" class="fd-minput fd-custom-sel-btn" id="' + selId + '" data-value="' + val + '">'
              +     '<span class="fd-custom-sel-text">' + (val || '— Select —') + '</span>'
              +     '<svg class="fd-select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="position:relative;right:auto;top:auto;transform:none;pointer-events:none;flex-shrink:0"><polyline points="6 9 12 15 18 9"/></svg>'
              +   '</button>'
              +   '<div class="fd-custom-sel-drop" id="' + dropId + '" style="display:none">'
              +     '<div class="fd-custom-sel-search-wrap"><input type="text" class="fd-custom-sel-search" id="' + srchId + '" placeholder="Search…" autocomplete="off" /></div>'
              +     '<ul class="fd-custom-sel-list">'
              +       '<li class="fd-custom-sel-item fd-custom-sel-placeholder" data-val="">— Select —</li>'
              +       rawOpts.map(function(o) {
                        return '<li class="fd-custom-sel-item' + (o === val ? ' fd-custom-sel-active' : '') + '" data-val="' + o + '">' + o + '</li>';
                      }).join('')
              +     '</ul>'
              +   '</div>'
              +   '<input type="hidden" class="fd-custom-sel-hidden" id="' + selId + '-hidden" name="' + selId + '" value="' + val + '" />'
              + '</div>'
              + '<button type="button" class="fd-inline-add-btn" data-add-schema="' + f.addSchema + '" data-add-label="' + f.addLabel + '" data-select-id="' + selId + '" data-source-table="' + f.sourceTable + '" data-source-col="' + f.sourceCol + '" title="Add new ' + f.addLabel + '">'
              + PLUS_SVG + '<span>New</span></button>'
              + '</div>';

      } else {
        input = '<input type="' + (f.type || 'text') + '" class="fd-minput" id="mf-' + f.id + '" value="' + val + '" />';
      }

      html += '<div class="fd-mfield"><label class="fd-mlabel" for="mf-' + f.id + '">' + f.label + ' ' + reqMark + '</label>' + input + '</div>';
    });

    html += '<div class="fd-mfield">'
          + '<label class="fd-mlabel">Status</label>'
          + '<div class="fd-toggle-wrap">'
          + '<label class="fd-toggle"><input type="checkbox" id="mf-active"' + (data.active !== false ? ' checked' : '') + ' /><span class="fd-toggle-slider"></span></label>'
          + '<span class="fd-toggle-label" id="mf-active-label">' + (data.active !== false ? 'Active' : 'Inactive') + '</span>'
          + '</div></div>';

    return html;
  }

  /* ═══════════════════════════════════════════
     INLINE "+" SUB-MODAL
  ═══════════════════════════════════════════ */
  function openInlineAddModal(cfg) {
    const schemaKey = cfg.schemaKey;
    const label     = cfg.label;
    const onSaved   = cfg.onSaved;
    const schema    = TABLE_SCHEMAS[schemaKey];
    if (!schema) return;

    let fieldsHtml = '';
    schema.forEach(function(f) {
      const reqMark = f.req ? '<span class="fd-req">*</span>' : '';
      let inp = '';
      if (f.type === 'textarea') {
        inp = '<textarea class="fd-minput fd-mtextarea" id="sub-' + f.id + '" rows="2" maxlength="500"></textarea>'
            + '<span class="fd-char-counter" id="sub-' + f.id + '-counter">500 remaining character(s)</span>';
      } else if (f.type === 'number') {
        const maxAttr = f.max ? ' max="' + f.max + '"' : '';
        inp = '<input type="number" class="fd-minput" id="sub-' + f.id + '" min="0"' + maxAttr + ' />';
      } else if (f.type === 'select') {
        f.options.forEach(function(o) { opts += '<option value="' + o + '">' + o + '</option>'; });
        inp = '<div class="fd-select-wrap"><select class="fd-minput fd-mselect" id="sub-' + f.id + '">' + opts + '</select><svg class="fd-select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></div>';
      } else {
        inp = '<input type="' + (f.type || 'text') + '" class="fd-minput" id="sub-' + f.id + '" />';
      }
      fieldsHtml += '<div class="fd-mfield"><label class="fd-mlabel">' + f.label + ' ' + reqMark + '</label>' + inp + '</div>';
    });

    const overlay = document.createElement('div');
    overlay.className = 'fd-submodal-overlay';
    overlay.innerHTML =
      '<div class="fd-submodal">'
    + '<div class="fd-submodal__head">'
    + '<div class="fd-submodal__title-wrap">' + PLUS_SVG + '<span class="fd-submodal__title">Add ' + label + '</span></div>'
    + '<button class="fd-modal__close fd-submodal__close">&times;</button>'
    + '</div>'
    + '<div class="fd-submodal__body">' + fieldsHtml + '</div>'
    + '<div class="fd-submodal__foot">'
    + '<button class="fd-modal-cancel fd-submodal__cancel">Cancel</button>'
    + '<button class="fd-modal-save fd-submodal__save"><span class="sub-save-txt">Save</span><span class="fd-btn-spinner hidden"></span></button>'
    + '</div></div>';

    document.body.appendChild(overlay);

    // Wire char counters inside sub-modal
    overlay.querySelectorAll('.fd-mtextarea[maxlength]').forEach(function(ta) {
      const counter = overlay.querySelector('#sub-' + ta.id.replace('sub-','') + '-counter');
      if (!counter) return;
      ta.addEventListener('input', function() {
        const remaining = 500 - ta.value.length;
        counter.textContent = remaining + ' remaining character(s)';
        counter.style.color = remaining < 50 ? 'var(--error)' : '';
      });
    });
    // Enforce max on number inputs in sub-modal
    overlay.querySelectorAll('input[type="number"][max]').forEach(function(inp) {
      inp.addEventListener('change', function() {
        const max = parseInt(inp.getAttribute('max'));
        if (parseInt(inp.value) > max) { inp.value = max; }
        if (parseInt(inp.value) < 0)   { inp.value = 0; }
      });
    });

    const close = function() { document.body.removeChild(overlay); };
    overlay.querySelector('.fd-submodal__close').addEventListener('click', close);
    overlay.querySelector('.fd-submodal__cancel').addEventListener('click', close);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });

    overlay.querySelector('.fd-submodal__save').addEventListener('click', async function() {
      for (const f of schema) {
        if (f.req) {
          const el = overlay.querySelector('#sub-' + f.id);
          if (el && !el.value.trim()) {
            el.focus();
            el.style.borderColor = 'var(--error)';
            Toast.show(f.label + ' is required.', 'error');
            setTimeout(function() { el.style.borderColor = ''; }, 1500);
            return;
          }
        }
      }

      const saveBtn  = overlay.querySelector('.fd-submodal__save');
      const saveTxtEl = saveBtn.querySelector('.sub-save-txt');
      const spinEl    = saveBtn.querySelector('.fd-btn-spinner');
      saveBtn.disabled = true;
      saveTxtEl.classList.add('hidden');
      spinEl.classList.remove('hidden');

      const rowData = { active: true };
      schema.forEach(function(f) {
        const el = overlay.querySelector('#sub-' + f.id);
        if (el) rowData[f.id] = el.value.trim();
      });

      try {
        const row = window.FD_DB
          ? await window.FD_DB.insert(schemaKey, rowData)
          : (await delay(400), Object.assign({ id: null }, rowData));
        addRowToTable(schemaKey, schema, row, row.id);

        const primaryField = schema.find(function(f) { return f.req; });
        const newValue = primaryField ? row[primaryField.id] : '';

        close();
        Toast.show(label + ' added successfully.', 'success');
        if (onSaved) onSaved(newValue);
      } catch (err) {
        console.error('[fd] sub-modal insert failed', err);
        Toast.show(err.message || 'Failed to save.', 'error');
        saveBtn.disabled = false;
        saveTxtEl.classList.remove('hidden');
        spinEl.classList.add('hidden');
      }
    });
  }

  /* ── Wire inline + buttons ────────────────── */
  function wireInlineAddButtons(container) {
    container.querySelectorAll('.fd-inline-add-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const schemaKey   = btn.dataset.addSchema;
        const label       = btn.dataset.addLabel;
        const selectId    = btn.dataset.selectId;
        const sourceTable = btn.dataset.sourceTable;
        const sourceCol   = parseInt(btn.dataset.sourceCol || '1');

        openInlineAddModal({
          schemaKey: schemaKey,
          label:     label,
          onSaved:   function(newValue) {
            // Refresh custom dropdown list
            const wrap = document.querySelector('.fd-custom-sel-wrap [id="' + selectId + '"]');
            if (wrap) {
              const wrapEl  = wrap.closest('.fd-custom-sel-wrap');
              const list    = wrapEl.querySelector('.fd-custom-sel-list');
              const hidden  = wrapEl.querySelector('.fd-custom-sel-hidden');
              const textEl  = wrapEl.querySelector('.fd-custom-sel-text');
              const newOpts = getRawOptions(sourceTable, sourceCol);
              list.innerHTML = '<li class="fd-custom-sel-item fd-custom-sel-placeholder" data-val="">— Select —</li>'
                + newOpts.map(function(o) {
                    return '<li class="fd-custom-sel-item' + (o === newValue ? ' fd-custom-sel-active' : '') + '" data-val="' + o + '">' + o + '</li>';
                  }).join('');
              if (newValue) { hidden.value = newValue; wrap.dataset.value = newValue; textEl.textContent = newValue; }
              wireCustomSelects(wrapEl.closest('.fd-modal__body') || document);
            }
          }
        });
      });
    });
  }

  /* ═══════════════════════════════════════════
     MODAL SYSTEM
  ═══════════════════════════════════════════ */
  const modal       = document.getElementById('fd-modal');
  const modalTitle  = document.getElementById('fd-modal-title');
  const modalBody   = document.getElementById('fd-modal-body');
  const modalClose  = document.getElementById('fd-modal-close');
  const modalCancel = document.getElementById('fd-modal-cancel');
  const modalSave   = document.getElementById('fd-modal-save');
  const saveTxt     = modalSave.querySelector('.fd-modal-save-text');
  const saveSpinner = modalSave.querySelector('.fd-btn-spinner');

  const delModal   = document.getElementById('fd-delete-modal');
  const delClose   = document.getElementById('fd-delete-close');
  const delCancel  = document.getElementById('fd-delete-cancel');
  const delConfirm = document.getElementById('fd-delete-confirm');

  function openModal()     { modal.style.display = 'flex'; }
  function closeModal()    { modal.style.display = 'none'; }
  function openDelModal()  { delModal.style.display = 'flex'; }
  function closeDelModal() { delModal.style.display = 'none'; }

  modalClose.addEventListener('click',  closeModal);
  modalCancel.addEventListener('click', closeModal);
  delClose.addEventListener('click',    closeDelModal);
  delCancel.addEventListener('click',   closeDelModal);
  modal.addEventListener('click',    function(e) { if (e.target === modal)    closeModal(); });
  delModal.addEventListener('click', function(e) { if (e.target === delModal) closeDelModal(); });

  function getModalValues(fields) {
    const data = {};
    fields.forEach(function(f) {
      if (f.type === 'select-table') {
        const hidden = document.getElementById('mf-' + f.id + '-hidden');
        data[f.id] = hidden ? hidden.value.trim() : '';
      } else {
        const el = document.getElementById('mf-' + f.id);
        if (el) data[f.id] = el.value.trim();
      }
    });
    const activeEl = document.getElementById('mf-active');
    data.active = activeEl ? activeEl.checked : true;
    return data;
  }

  function validateModal(fields) {
    for (const f of fields) {
      if (f.req) {
        if (f.type === 'select-table') {
          const hidden = document.getElementById('mf-' + f.id + '-hidden');
          const btn    = document.getElementById('mf-' + f.id);
          if (!hidden || !hidden.value.trim()) {
            if (btn) { btn.style.borderColor = 'var(--error)'; setTimeout(function() { btn.style.borderColor = ''; }, 1500); }
            Toast.show(f.label + ' is required.', 'error');
            return false;
          }
        } else {
          const el = document.getElementById('mf-' + f.id);
          if (el && !el.value.trim()) {
            el.focus();
            el.style.borderColor = 'var(--error)';
            Toast.show(f.label + ' is required.', 'error');
            setTimeout(function() { el.style.borderColor = ''; }, 1500);
            return false;
          }
        }
      }
    }
    return true;
  }

  function wireToggleLabel() {
    const cb  = document.getElementById('mf-active');
    const lbl = document.getElementById('mf-active-label');
    if (cb && lbl) cb.addEventListener('change', function() { lbl.textContent = cb.checked ? 'Active' : 'Inactive'; });
    // Wire 500-char counters
    document.querySelectorAll('.fd-mtextarea[maxlength]').forEach(function(ta) {
      const counterId = ta.id + '-counter';
      const counter = document.getElementById(counterId);
      if (!counter) return;
      ta.addEventListener('input', function() {
        const remaining = 500 - ta.value.length;
        counter.textContent = remaining + ' remaining character(s)';
        counter.style.color = remaining < 50 ? 'var(--error)' : '';
      });
    });
    // Enforce max on number inputs
    document.querySelectorAll('.fd-minput[type="number"][max]').forEach(function(inp) {
      inp.addEventListener('change', function() {
        const max = parseInt(inp.getAttribute('max'));
        if (parseInt(inp.value) > max) { inp.value = max; }
        if (parseInt(inp.value) < 0)   { inp.value = 0; }
      });
    });
    // Wire custom searchable selects
    wireCustomSelects(document);
  }

  /* ── Custom searchable select dropdowns ─── */
  function wireCustomSelects(container) {
    container.querySelectorAll('.fd-custom-sel-btn').forEach(function(btn) {
      const wrap   = btn.closest('.fd-custom-sel-wrap');
      const drop   = wrap.querySelector('.fd-custom-sel-drop');
      const search = wrap.querySelector('.fd-custom-sel-search');
      const list   = wrap.querySelector('.fd-custom-sel-list');
      const hidden = wrap.querySelector('.fd-custom-sel-hidden');
      const textEl = btn.querySelector('.fd-custom-sel-text');

      // Toggle dropdown
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const isOpen = drop.style.display !== 'none';
        // Close all other open drops first
        document.querySelectorAll('.fd-custom-sel-drop').forEach(function(d) { d.style.display = 'none'; });
        if (!isOpen) {
          drop.style.display = 'block';
          search.value = '';
          filterList(list, '');
          setTimeout(function() { search.focus(); }, 50);
        }
      });

      // Filter on search
      search.addEventListener('input', function() {
        filterList(list, search.value.toLowerCase());
      });
      // Prevent closing when clicking inside drop
      drop.addEventListener('mousedown', function(e) { e.preventDefault(); });

      // Select item
      list.addEventListener('click', function(e) {
        const item = e.target.closest('.fd-custom-sel-item');
        if (!item) return;
        const val = item.dataset.val;
        btn.dataset.value = val;
        hidden.value = val;
        textEl.textContent = val || '— Select —';
        list.querySelectorAll('.fd-custom-sel-item').forEach(function(i) { i.classList.remove('fd-custom-sel-active'); });
        item.classList.add('fd-custom-sel-active');
        drop.style.display = 'none';
        // Sync validation highlight
        btn.style.borderColor = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.fd-custom-sel-wrap')) {
        document.querySelectorAll('.fd-custom-sel-drop').forEach(function(d) { d.style.display = 'none'; });
      }
    }, { capture: true });
  }

  function filterList(list, q) {
    list.querySelectorAll('.fd-custom-sel-item').forEach(function(item) {
      if (item.classList.contains('fd-custom-sel-placeholder')) { item.style.display = q ? 'none' : ''; return; }
      item.style.display = item.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  }

  /* ── Open ADD modal ───────────────────────── */
  document.querySelectorAll('.fd-add-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const tableId = btn.dataset.table;
      const title   = btn.dataset.title || 'Entry';
      const fields  = TABLE_SCHEMAS[tableId] || [];

      modalTitle.textContent = 'Add ' + title;
      modalBody.innerHTML    = buildModalFields(fields);
      wireToggleLabel();
      wireInlineAddButtons(modalBody);
      openModal();

      modalSave.onclick = async function() {
        if (!validateModal(fields)) return;
        const data = getModalValues(fields);

        saveTxt.classList.add('hidden');
        saveSpinner.classList.remove('hidden');
        modalSave.disabled = true;

        try {
          const row = window.FD_DB
            ? await window.FD_DB.insert(tableId, data)
            : (await delay(600), Object.assign({ id: null }, data));
          addRowToTable(tableId, fields, row, row.id);
          closeModal();
          Toast.show(title + ' added successfully.', 'success');
        } catch (err) {
          console.error('[fd] insert failed', err);
          Toast.show(err.message || 'Failed to save.', 'error');
        } finally {
          saveTxt.classList.remove('hidden');
          saveSpinner.classList.add('hidden');
          modalSave.disabled = false;
        }
      };
    });
  });

  /* ── Add row to table ─────────────────────── */
  function addRowToTable(tableId, fields, data, rowId) {
    const tbl   = document.getElementById(tableId);
    const tbody = tbl.querySelector('tbody');
    const empty = tbody.querySelector('.fd-empty');
    if (empty) empty.closest('tr').remove();

    const num = tbody.querySelectorAll('tr').length + 1;
    const tr  = document.createElement('tr');
    if (rowId) tr.dataset.rowId = rowId;

    const numTd = document.createElement('td');
    numTd.textContent = num;
    tr.appendChild(numTd);

    fields.forEach(function(f) {
      const td = document.createElement('td');
      if (f.id === 'code') td.className = 'fd-code';
      if (f.type === 'textarea') td.title = data[f.id] || '';
      td.textContent = data[f.id] || '';
      tr.appendChild(td);
    });

    const activeTd = document.createElement('td');
    activeTd.innerHTML = data.active !== false
      ? '<span class="fd-badge fd-badge--active">Active</span>'
      : '<span class="fd-badge fd-badge--inactive">Inactive</span>';
    tr.appendChild(activeTd);

    const actionsTd = document.createElement('td');
    actionsTd.className = 'fd-actions';
    actionsTd.innerHTML = '<button class="fd-btn-edit" title="Edit">' + EDIT_ICON + '</button>'
                        + '<button class="fd-btn-delete" title="Delete">' + DEL_ICON + '</button>';
    tr.appendChild(actionsTd);

    wireRowButtons(tr, tableId, fields);
    tbody.appendChild(tr);
    updateFooterCount(tbl);
  }

  /* ── Wire edit & delete ───────────────────── */
  function wireRowButtons(tr, tableId, fields) {
    const editBtn = tr.querySelector('.fd-btn-edit');
    const delBtn  = tr.querySelector('.fd-btn-delete');

    if (editBtn) {
      editBtn.addEventListener('click', function() {
        const schema   = TABLE_SCHEMAS[tableId] || fields;
        const tblEl    = document.getElementById(tableId);
        const thead    = tblEl.querySelectorAll('thead th');
        const data     = {};

        schema.forEach(function(f) {
          let colIdx = -1;
          thead.forEach(function(th, i) {
            if (th.textContent.trim().toLowerCase().includes(f.label.toLowerCase().slice(0, 5))) colIdx = i;
          });
          if (colIdx >= 0 && tr.cells[colIdx]) data[f.id] = tr.cells[colIdx].textContent.trim();
        });
        const badgeEl = tr.querySelector('.fd-badge');
        data.active = badgeEl ? badgeEl.classList.contains('fd-badge--active') : true;

        const tbarEl   = document.querySelector('.fd-tbar[data-table="' + tableId + '"]');
        const titleStr = tbarEl ? tbarEl.dataset.title : tableId;

        modalTitle.textContent = 'Edit ' + titleStr;
        modalBody.innerHTML    = buildModalFields(schema, data);
        wireToggleLabel();
        wireInlineAddButtons(modalBody);
        openModal();

        modalSave.onclick = async function() {
          if (!validateModal(schema)) return;
          const updated = getModalValues(schema);

          saveTxt.classList.add('hidden');
          saveSpinner.classList.remove('hidden');
          modalSave.disabled = true;

          try {
            const row = window.FD_DB && tr.dataset.rowId
              ? await window.FD_DB.update(tableId, tr.dataset.rowId, updated)
              : (await delay(500), Object.assign({}, updated));

            schema.forEach(function(f, idx) {
              const cell = tr.cells[idx + 1];
              if (cell) cell.textContent = row[f.id] || '';
            });
            const activeTd = tr.querySelector('.fd-badge') ? tr.querySelector('.fd-badge').closest('td') : null;
            if (activeTd) {
              activeTd.innerHTML = row.active !== false
                ? '<span class="fd-badge fd-badge--active">Active</span>'
                : '<span class="fd-badge fd-badge--inactive">Inactive</span>';
            }

            closeModal();
            Toast.show(titleStr + ' updated successfully.', 'success');
          } catch (err) {
            console.error('[fd] update failed', err);
            Toast.show(err.message || 'Failed to update.', 'error');
          } finally {
            saveTxt.classList.remove('hidden');
            saveSpinner.classList.add('hidden');
            modalSave.disabled = false;
          }
        };
      });
    }

    if (delBtn) {
      delBtn.addEventListener('click', function() {
        openDelModal();
        delConfirm.onclick = async function() {
          const tbl = document.getElementById(tableId);
          try {
            if (window.FD_DB && tr.dataset.rowId) {
              await window.FD_DB.remove(tableId, tr.dataset.rowId);
            }
            tr.style.transition = 'opacity 0.25s';
            tr.style.opacity = '0';
            await delay(250);
            tr.remove();
            const tbody = tbl.querySelector('tbody');
            if (!tbody.querySelectorAll('tr').length) {
              const colCount = tbl.querySelectorAll('thead th').length;
              tbody.innerHTML = '<tr><td colspan="' + colCount + '" class="fd-empty">No data available in table</td></tr>';
            }
            updateFooterCount(tbl);
            closeDelModal();
            Toast.show('Record deleted.', 'success');
          } catch (err) {
            console.error('[fd] delete failed', err);
            Toast.show(err.message || 'Failed to delete.', 'error');
            closeDelModal();
          }
        };
      });
    }
  }

  /* ── Wire existing rows ───────────────────── */
  function wireAllStaticRows() {
    document.querySelectorAll('.fd-tbl').forEach(function(tbl) {
      const tableId = tbl.id;
      const fields  = TABLE_SCHEMAS[tableId] || [];
      tbl.querySelectorAll('tbody tr').forEach(function(tr) {
        if (!tr.querySelector('.fd-empty')) wireRowButtons(tr, tableId, fields);
      });
    });
  }
  wireAllStaticRows();

  /* ── Bootstrap from Supabase ──────────────── */
  if (window.FD_DB) {
    Loader.show('Loading reference data...');
    window.FD_DB.bootstrap({
      renderRow: function (schemaKey, uiRow) {
        const fields = TABLE_SCHEMAS[schemaKey] || [];
        addRowToTable(schemaKey, fields, uiRow, uiRow.id);
      },
      afterTable: function (schemaKey, tblEl) {
        updateFooterCount(tblEl);
      }
    }).catch(function (err) {
      console.error('[fd] bootstrap failed', err);
      Toast.show('Failed to load some tables. ' + (err.message || ''), 'error');
    }).finally(function () {
      Loader.hide();
    });
  }

  /* ── Footer count updater ─────────────────── */
  function updateFooterCount(tbl) {
    const card = tbl.closest('.fd-card');
    if (!card) return;
    const footer = card.querySelector('.fd-count');
    if (!footer) return;
    const rows = tbl.querySelectorAll('tbody tr:not(:has(.fd-empty))').length;
    footer.textContent = rows > 0 ? 'Showing 1 to ' + rows + ' of ' + rows + ' entries' : 'Showing 0 to 0 of 0 entries';
  }

  function delay(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }

});
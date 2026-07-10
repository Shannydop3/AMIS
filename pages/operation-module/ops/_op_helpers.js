/* ============================================
   AMIS – Operation Module: Shared Helpers
   ops/_op_helpers.js

   Load this FIRST before all other ops/*.js.
   Uses the exact same CSS classes as dashboard.css
   and views.css for full design consistency:
   dash-card, dash-card__head, dash-tbl, dash-filter-row,
   dash-input, dash-table-footer, dash-chevron, dash-empty, etc.
   ============================================ */

/* ── Op-specific CSS (only what dashboard.css doesn't already cover) ── */
function _OP_sharedCSS() {
  return `
/* ─ Op form layout ───────────────────────── */
.op-form-grid   { display:grid; grid-template-columns:1fr 1fr; gap:0 40px; }
.op-form-grid-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:0 28px; }
@media(max-width:960px){ .op-form-grid-3{ grid-template-columns:1fr 1fr; } }
@media(max-width:720px){ .op-form-grid,.op-form-grid-3{ grid-template-columns:1fr; gap:0; } }

/* ─ Form row ─────────────────────────────── */
.op-fg { display:flex; align-items:flex-start; gap:0; padding:7px 0; border-bottom:1px solid #f0f3f7; }
.op-fg:last-child { border-bottom:none; }
.op-label {
  min-width:158px; flex-shrink:0;
  font-size:0.75rem; font-weight:600; color:var(--text-secondary);
  padding-top:9px; text-transform:uppercase; letter-spacing:0.04em; line-height:1.3;
}
.op-label .req { color:var(--error); margin-right:1px; }

/* ─ Form controls ────────────────────────── */
.op-control {
  flex:1; padding:7px 11px;
  border:1.5px solid var(--border); border-radius:var(--radius-md);
  font-family:'Inter',sans-serif; font-size:0.875rem;
  color:var(--text-primary); background:var(--bg-card);
  transition:border-color 0.15s,box-shadow 0.15s; min-width:0;
}
.op-control::placeholder { color:var(--text-muted); }
.op-control:focus { outline:none; border-color:var(--accent); box-shadow:0 0 0 3px rgba(25,118,210,0.1); background:#fff; }
.op-control[readonly] { background:#f7f9fc; color:var(--text-secondary); cursor:default; }
.op-control[readonly]:focus { border-color:var(--border); box-shadow:none; }
textarea.op-control { resize:vertical; min-height:76px; line-height:1.5; }
select.op-control {
  cursor:pointer; appearance:none; -webkit-appearance:none;
  background:var(--bg-card) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%238A9BB0' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E") no-repeat right 10px center;
}
select.op-control:focus { border-color:var(--accent); box-shadow:0 0 0 3px rgba(25,118,210,0.1); }

/* ─ Select + inline add button ───────────── */
.op-select-group { flex:1; display:flex; gap:6px; align-items:center; min-width:0; }
.op-select-group select.op-control { flex:1; }
.op-btn-add {
  width:30px; height:30px; border-radius:6px; background:#198754; color:#fff;
  border:none; cursor:pointer; display:flex; align-items:center; justify-content:center;
  flex-shrink:0; transition:background 0.15s,transform 0.12s;
}
.op-btn-add:hover { background:#146c43; transform:scale(1.05); }
.op-btn-add svg { width:14px; height:14px; }

/* ─ Required note ────────────────────────── */
.op-req-note {
  font-size:0.77rem; color:var(--error);
  display:flex; align-items:center; gap:5px;
  margin-bottom:14px; padding:7px 12px;
  background:rgba(183,28,28,0.04); border:1px solid rgba(183,28,28,0.1); border-radius:var(--radius-sm);
}
.op-req-note svg { width:13px; height:13px; flex-shrink:0; }

/* ─ Action bar ───────────────────────────── */
.op-action-bar {
  display:flex; align-items:center; justify-content:space-between; gap:10px;
  background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-md);
  padding:12px 18px; margin-bottom:18px; box-shadow:var(--shadow-sm); flex-wrap:wrap;
}
.op-action-bar__left  { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.op-action-bar__right { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }

/* ─ Buttons ──────────────────────────────── */
.op-btn {
  border:none; border-radius:var(--radius-md); cursor:pointer;
  font-family:'Barlow','Segoe UI',sans-serif; font-size:0.82rem; font-weight:700;
  display:inline-flex; align-items:center; gap:6px; padding:8px 16px;
  transition:opacity 0.15s,box-shadow 0.15s,background 0.15s; white-space:nowrap;
}
.op-btn svg { width:14px; height:14px; flex-shrink:0; }
.op-btn--primary { background:linear-gradient(135deg,var(--primary-dark) 0%,var(--primary-light) 100%); color:#fff; box-shadow:0 4px 12px rgba(10,61,124,0.25); }
.op-btn--primary:hover { opacity:0.92; box-shadow:0 6px 18px rgba(10,61,124,0.35); }
.op-btn--secondary { background:var(--bg-card); color:var(--text-secondary); border:1.5px solid var(--border); }
.op-btn--secondary:hover { background:var(--bg); border-color:#b8c4d4; color:var(--text-primary); }
.op-btn--teal   { background:#0d9488; color:#fff; } .op-btn--teal:hover   { background:#0a7d73; }
.op-btn--amber  { background:#d97706; color:#fff; } .op-btn--amber:hover  { background:#b45309; }
.op-btn--danger { background:var(--error); color:#fff; } .op-btn--danger:hover { background:#8b1212; }

/* ─ Count pill ───────────────────────────── */
.op-count-pill {
  background:rgba(10,61,124,0.07); color:var(--primary);
  border:1px solid rgba(10,61,124,0.16); padding:5px 14px;
  border-radius:20px; font-size:0.78rem; font-weight:600;
  display:inline-flex; align-items:center; gap:6px; white-space:nowrap;
}
.op-count-pill svg { width:13px; height:13px; }
.op-count-num { font-size:0.95rem; font-weight:800; }

/* ─ Tabs ─────────────────────────────────── */
.op-tab-bar { display:flex; border-bottom:2px solid var(--border); margin-bottom:14px; }
.op-tab-btn {
  background:none; border:none; cursor:pointer;
  font-family:'Inter',sans-serif; font-size:0.84rem; font-weight:500;
  color:var(--text-muted); padding:9px 22px;
  border-bottom:2px solid transparent; margin-bottom:-2px;
  transition:color 0.18s,border-color 0.18s;
  display:flex; align-items:center; gap:7px;
}
.op-tab-btn.active { color:var(--primary); border-bottom-color:var(--primary); font-weight:600; }
.op-tab-btn:hover:not(.active) { color:var(--text-primary); }
.op-tab-count { background:rgba(10,61,124,0.1); color:var(--primary); font-size:0.67rem; font-weight:700; padding:1px 7px; border-radius:10px; }
.op-tab-btn.active .op-tab-count { background:var(--primary); color:#fff; }
.op-tab-panel { display:none; }
.op-tab-panel.active { display:block; }

/* ─ Instruction strip ────────────────────── */
.op-instruction {
  background:rgba(10,61,124,0.04); border:1px solid rgba(10,61,124,0.1);
  border-radius:var(--radius-sm); padding:9px 14px; margin-bottom:14px;
  font-size:0.78rem; color:var(--text-secondary);
  display:flex; align-items:flex-start; gap:8px; line-height:1.55;
}
.op-instruction svg { width:14px; height:14px; flex-shrink:0; margin-top:1px; color:var(--accent); }

/* ─ Section divider ──────────────────────── */
.op-section-label {
  font-size:0.68rem; font-weight:700; text-transform:uppercase;
  letter-spacing:0.08em; color:var(--text-muted);
  margin:16px 0 6px; padding-bottom:5px; border-bottom:1px solid var(--border);
}

/* ─ Toggle ───────────────────────────────── */
.op-toggle-wrap { display:flex; align-items:center; gap:10px; padding-top:6px; }
.op-toggle { position:relative; width:42px; height:22px; flex-shrink:0; }
.op-toggle input { opacity:0; width:0; height:0; }
.op-toggle-slider { position:absolute; inset:0; background:var(--border); border-radius:99px; cursor:pointer; transition:background 0.2s; }
.op-toggle-slider::before { content:''; position:absolute; left:3px; top:3px; width:16px; height:16px; border-radius:50%; background:#fff; transition:transform 0.2s; box-shadow:0 1px 4px rgba(0,0,0,0.2); }
.op-toggle input:checked + .op-toggle-slider { background:var(--accent); }
.op-toggle input:checked + .op-toggle-slider::before { transform:translateX(20px); }
.op-toggle-label { font-size:0.82rem; color:var(--text-secondary); }

/* ─ Status badges ────────────────────────── */
.op-badge { display:inline-block; font-size:0.67rem; padding:3px 10px; border-radius:99px; font-weight:600; white-space:nowrap; }
.op-badge--blue   { background:rgba(10,61,124,0.1);  color:var(--primary-dark); }
.op-badge--green  { background:rgba(30,132,73,0.12); color:#145a32; }
.op-badge--amber  { background:rgba(211,84,0,0.1);   color:#784212; }
.op-badge--red    { background:rgba(192,57,43,0.1);  color:#78281f; }
.op-badge--teal   { background:rgba(13,148,136,0.1); color:#065f46; }

.op-status { display:inline-flex; align-items:center; gap:5px; font-size:0.67rem; font-weight:600; padding:3px 10px; border-radius:99px; white-space:nowrap; }
.op-status--draft    { background:rgba(139,141,148,0.12); color:#374151; }
.op-status--pending  { background:rgba(211,84,0,0.1);     color:#784212; }
.op-status--approved { background:rgba(30,132,73,0.12);   color:#145a32; }
.op-status--rejected { background:rgba(192,57,43,0.1);    color:#78281f; }

/* ─ Row action buttons ───────────────────── */
.op-row-btns { display:flex; align-items:center; gap:4px; }
.op-row-btn {
  width:28px; height:28px; border:none; border-radius:var(--radius-sm);
  cursor:pointer; display:flex; align-items:center; justify-content:center;
  transition:background 0.15s,color 0.15s,transform 0.12s;
}
.op-row-btn svg { width:13px; height:13px; }
.op-row-btn--edit   { background:rgba(25,118,210,0.08); color:var(--accent); }
.op-row-btn--edit:hover   { background:var(--accent); color:#fff; transform:translateY(-1px); }
.op-row-btn--delete { background:rgba(183,28,28,0.08); color:var(--error); }
.op-row-btn--delete:hover { background:var(--error); color:#fff; transform:translateY(-1px); }
.op-row-btn--view   { background:rgba(6,182,212,0.1); color:#0891b2; }
.op-row-btn--view:hover   { background:#0891b2; color:#fff; transform:translateY(-1px); }
`;
}

/* ── SVG helpers ─────────────────────────── */
function _icon(paths, w, h) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="${w||16}" height="${h||16}">${paths}</svg>`;
}
function _infoIcon() {
  return `<svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`;
}
function _chevron() {
  return `<svg class="dash-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>`;
}

/* ── Field builders ──────────────────────── */
function _field(label, type, id, ph, req, readonly, val) {
  return `<div class="op-fg">
    <label class="op-label" for="${id}">${req ? '<span class="req">*</span>' : ''}${label}:</label>
    <input type="${type||'text'}" class="op-control" id="${id}" placeholder="${ph||''}" ${readonly ? 'readonly' : ''} ${val !== undefined ? `value="${val}"` : ''}/>
  </div>`;
}
function _fieldTextarea(label, id, ph, req) {
  return `<div class="op-fg">
    <label class="op-label" for="${id}">${req ? '<span class="req">*</span>' : ''}${label}:</label>
    <textarea class="op-control" id="${id}" rows="3" placeholder="${ph||''}"></textarea>
  </div>`;
}
function _fieldSelect(label, id, options, ph, req, withAdd) {
  const opts = `<option value="">${ph || 'Select…'}</option>${options.map(o => `<option value="${o}">${o}</option>`).join('')}`;
  const sel  = `<select class="op-control" id="${id}">${opts}</select>`;
  const add  = withAdd ? `<button class="op-btn-add" title="Add new" type="button">${_icon('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>')}</button>` : '';
  return `<div class="op-fg">
    <label class="op-label" for="${id}">${req ? '<span class="req">*</span>' : ''}${label}:</label>
    <div class="op-select-group">${sel}${add}</div>
  </div>`;
}
function _fieldDate(label, id, req, val) {
  return `<div class="op-fg">
    <label class="op-label" for="${id}">${req ? '<span class="req">*</span>' : ''}${label}:</label>
    <input type="date" class="op-control" id="${id}" ${val ? `value="${val}"` : ''}/>
  </div>`;
}
function _fieldNumber(label, id, ph, req, min, max) {
  return `<div class="op-fg">
    <label class="op-label" for="${id}">${req ? '<span class="req">*</span>' : ''}${label}:</label>
    <input type="number" class="op-control" id="${id}" placeholder="${ph||'0'}" ${min !== undefined ? `min="${min}"` : ''} ${max !== undefined ? `max="${max}"` : ''}/>
  </div>`;
}

/* ── Common data ─────────────────────────── */
var _REGIONS  = ['NCR','Region I','Region II','Region III','Region IV-A','Region IV-B','Region V','Region VI','Region VII','Region VIII','Region IX','Region X','Region XI','Region XII','CARAGA','CAR','BARMM'];
var _BRANCHES = ['CP Garcia','Studio 7','Vitro Makati','Region I Office','Region II Office','Region III Office'];
var _OFFICES  = ['IMB-OBD','VITRO MAKATI','GSD','ORD'];
var _USERS    = ['ARBIE FLORES','JOVILYN MENDOZA','BERNA JOY MONTEMAYOR','JOHN PATRICK DAGUISO','LIZA RABENA'];
var _CUSTODIAN_TYPES = ['Common-Use Office Supplies and Equipment','Property Plant and Equipment','Semi-Expendable'];

/* ──────────────────────────────────────────
   SHARED HTML BLOCKS
   All use exact dashboard.css classes:
   dash-card, dash-card__head, dash-card__body,
   dash-tbl, dash-filter-row, dash-input,
   dash-table-footer, dash-chevron, dash-empty
   ────────────────────────────────────────── */

/* Search toolbar — identical to dashboard filter rows */
function _tableToolbar(searchId) {
  return `<div class="dash-filter-row">
    <input type="text" class="dash-input op-tbl-search" id="${searchId}"
      placeholder="Search…" style="flex:1;min-width:140px;max-width:280px;">
  </div>`;
}

/* Table footer — identical to dashboard */
function _tableFooter(prefix) {
  return `<div class="dash-table-footer">
    <span id="${prefix}-info">Showing 0 to 0 of 0 entries</span>
    <span class="dash-pager">Previous &nbsp; Next</span>
  </div>`;
}

/* Full card builder using dash-card classes */
function _card(id, iconPaths, title, headRight, bodyHtml, startOpen) {
  const collapsed = startOpen ? '' : ' collapsed';
  return `
<div class="dash-card dash-mb${collapsed}" id="${id}">
  <div class="dash-card__head dash-collapsible">
    <span style="display:flex;align-items:center;gap:8px;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           width="15" height="15" style="opacity:0.85;flex-shrink:0;">${iconPaths}</svg>
      ${title}
    </span>
    <div class="dash-head-right">
      ${headRight || ''}
      ${_chevron()}
    </div>
  </div>
  <div class="dash-card__body">${bodyHtml}</div>
</div>`;
}

/* ── Wire: collapsible cards ─────────────── */
function _OP_wireCards(container) {
  container.querySelectorAll('.dash-card__head.dash-collapsible').forEach(function(head) {
    head.addEventListener('click', function(e) {
      if (e.target.closest('.op-btn') || e.target.closest('.op-tab-btn') ||
          e.target.closest('.dash-head-right button')) return;
      head.closest('.dash-card').classList.toggle('collapsed');
    });
  });
}

/* ── Wire: tabs ──────────────────────────── */
function _OP_wireTabs(container) {
  container.querySelectorAll('.op-tab-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var panelId = btn.dataset.tab;
      var tabBar  = btn.closest('.op-tab-bar');
      if (!tabBar) return;
      tabBar.querySelectorAll('.op-tab-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var body = btn.closest('.dash-card__body');
      if (body) {
        body.querySelectorAll('.op-tab-panel').forEach(function(p) { p.classList.remove('active'); });
        var panel = body.querySelector('#' + panelId);
        if (panel) panel.classList.add('active');
      }
    });
  });
}

/* ── Wire: table search ──────────────────── */
function _OP_wireSearch(container) {
  container.querySelectorAll('.op-tbl-search').forEach(function(input) {
    input.addEventListener('input', function() {
      var scope = input.closest('.op-tab-panel.active') ||
                  input.closest('.dash-card__body') ||
                  container;
      var tbl = scope.querySelector('.dash-tbl');
      if (!tbl) return;
      var q = input.value.toLowerCase();
      tbl.querySelectorAll('tbody tr').forEach(function(row) {
        if (row.querySelector('.dash-empty')) return;
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  });
}

/* ── Wire: add buttons (stub) ────────────── */
function _OP_wireAddBtns(container) {
  container.querySelectorAll('.op-btn-add').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      Toast.show('Quick-add form coming soon.', 'info', 2500);
    });
  });
}

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

/* ── Common data (populated at bootstrap by _OP_bootstrapRefs) ─── */
var _REGIONS         = [];
var _BRANCHES        = [];
var _OFFICES         = [];
var _USERS           = [];
var _CUSTODIAN_TYPES = [];
var _SUPPLIERS       = [];
var _UOMS            = [];

// Same data indexed as name → id for FK resolution at save time.
var _OP_REF_IDS = {
  regions: {}, branches: {}, offices: {}, profiles: {},
  custodian_types: {}, suppliers: {}, units_of_measurement: {}
};

// Fallback demo data (used when Supabase isn't configured or query fails).
var _OP_FALLBACK = {
  regions:  ['NCR','Region I','Region II','Region III'],
  branches: ['CP Garcia','Studio 7','Vitro Makati'],
  offices:  ['IMB-OBD','VITRO MAKATI','GSD','ORD'],
  users:    ['Admin User'],
  custodian_types: ['Property Plant and Equipment','Semi-Expendable'],
  suppliers: [],
  uoms:      ['Piece','Set','Box']
};

/**
 * _OP_bootstrapRefs()
 *   Fills the _REGIONS / _BRANCHES / etc. arrays (and _OP_REF_IDS)
 *   from Supabase. Safe to call multiple times. operation-module.js
 *   awaits this before calling any op sub-view's onLoad().
 */
async function _OP_bootstrapRefs(force) {
  if (_OP_bootstrapRefs._done && !force) return;
  _OP_bootstrapRefs._done = true;

  const client = window.AMIS_READY ? await window.AMIS_READY : null;
  if (!client) {
    _REGIONS         = _OP_FALLBACK.regions.slice();
    _BRANCHES        = _OP_FALLBACK.branches.slice();
    _OFFICES         = _OP_FALLBACK.offices.slice();
    _USERS           = _OP_FALLBACK.users.slice();
    _CUSTODIAN_TYPES = _OP_FALLBACK.custodian_types.slice();
    _SUPPLIERS       = _OP_FALLBACK.suppliers.slice();
    _UOMS            = _OP_FALLBACK.uoms.slice();
    return;
  }

  async function pull(table, displayCol) {
    const { data, error } = await client.from(table).select('id, ' + displayCol).order(displayCol);
    if (error) { console.warn('[op-refs] load ' + table + ' failed', error); return []; }
    const map = {};
    data.forEach(function (r) { map[r[displayCol]] = r.id; });
    _OP_REF_IDS[table] = map;
    return data.map(function (r) { return r[displayCol]; });
  }

  const [regions, branches, offices, custodians, suppliers, uoms, profiles] = await Promise.all([
    pull('regions', 'name'),
    pull('branches', 'name'),
    pull('offices', 'name'),
    pull('custodian_types', 'name'),
    pull('suppliers', 'name'),
    pull('units_of_measurement', 'name'),
    (async () => {
      const { data, error } = await client
        .from('profiles')
        .select('id, full_name, email, is_active')
        .eq('is_active', true)
        .order('full_name');
      if (error) { console.warn('[op-refs] load profiles failed', error); return []; }
      const map = {};
      const names = data.map(function (p) {
        const label = (p.full_name || (p.email || '').split('@')[0]).toUpperCase();
        map[label] = p.id;
        return label;
      });
      _OP_REF_IDS.profiles = map;
      return names;
    })()
  ]);

  _REGIONS         = regions.length         ? regions         : _OP_FALLBACK.regions.slice();
  _BRANCHES        = branches.length        ? branches        : _OP_FALLBACK.branches.slice();
  _OFFICES         = offices.length         ? offices         : _OP_FALLBACK.offices.slice();
  _CUSTODIAN_TYPES = custodians.length      ? custodians      : _OP_FALLBACK.custodian_types.slice();
  _SUPPLIERS       = suppliers.length       ? suppliers       : _OP_FALLBACK.suppliers.slice();
  _UOMS            = uoms.length            ? uoms            : _OP_FALLBACK.uoms.slice();
  _USERS           = profiles.length        ? profiles        : _OP_FALLBACK.users.slice();
}

/**
 * _OP_saveHeader({ table, fields, extra, container })
 *   Reads form fields, resolves FK name→id via _OP_REF_IDS,
 *   inserts into `table`, and returns the created row.
 *
 *   fields = [
 *     { id: 'gr-pr-no',    db: 'pr_number' },
 *     { id: 'gr-supplier', db: 'supplier_id', fk: 'suppliers' },
 *     { id: 'gr-date',     db: 'received_at' },      // dates: value passed through
 *     { id: 'gr-remarks',  db: 'remarks' },
 *   ]
 *   extra = static columns to always set, e.g. { status: 'Received' }
 */
async function _OP_saveHeader(cfg) {
  const client = window.AMIS_READY ? await window.AMIS_READY : null;
  if (!client) throw new Error('Database is not configured.');

  const row = Object.assign({}, cfg.extra || {});
  for (const f of cfg.fields) {
    const el = document.getElementById(f.id);
    if (!el) continue;
    let val = el.value == null ? '' : String(el.value).trim();
    if (!val) { row[f.db] = null; continue; }
    if (f.fk) {
      const map = _OP_REF_IDS[f.fk] || {};
      row[f.db] = map[val] || null;
    } else if (f.number) {
      const n = Number(val);
      row[f.db] = Number.isFinite(n) ? n : null;
    } else {
      row[f.db] = val;
    }
  }

  const { data, error } = await client
    .from(cfg.table)
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * _OP_loadHistory({ table, container, columns, rowFn })
 *   Renders a "History" list of the most recent 20 records
 *   from `table` into container.
 */
async function _OP_loadHistory(cfg) {
  const client = window.AMIS_READY ? await window.AMIS_READY : null;
  const tbody  = cfg.container.querySelector('#' + cfg.tbodyId);
  if (!tbody) return;
  if (!client) {
    tbody.innerHTML = '<tr><td colspan="' + cfg.columns.length + '" class="dash-empty">Database not configured.</td></tr>';
    return;
  }
  tbody.innerHTML = '<tr><td colspan="' + cfg.columns.length + '" class="dash-empty">Loading…</td></tr>';
  try {
    let q = client.from(cfg.table).select(cfg.select || '*').order('created_at', { ascending: false }).limit(20);
    const { data, error } = await q;
    if (error) throw error;
    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="' + cfg.columns.length + '" class="dash-empty">No records yet.</td></tr>';
      return;
    }
    tbody.innerHTML = data.map(function (r) {
      const cells = cfg.rowFn(r).map(function (c) { return '<td>' + (c == null ? '—' : c) + '</td>'; }).join('');
      return '<tr>' + cells + '</tr>';
    }).join('');
  } catch (err) {
    console.error('[op] history load failed', err);
    tbody.innerHTML = '<tr><td colspan="' + cfg.columns.length + '" class="dash-empty">Failed to load history: ' + (err.message || 'error') + '</td></tr>';
  }
}

/* ──────────────────────────────────────────
   _OP_QUICK_SAVE — one-liner save-button wiring
   for the remaining Operation Module sub-views.

   Each entry describes a MINIMAL header insert to the
   matching Postgres table. Line-item / child-row support
   comes later (needs UI for picking property_records / stock_items).

   Usage in an ops/*.js file:
     <button onclick="_OP_quickSave('property-transfer')">Save</button>
   ────────────────────────────────────────── */
var _OP_QUICK_SAVE_CONFIGS = {
  'tagging': {
    table: 'taggings',
    fields: [
      { id: 'tag-gr-by',     db: 'printer_name' } // best-effort mapping
    ],
    extra: {},
    successMsg: 'Tag record saved.'
  },
  'property-issuance': {
    table: 'property_issuances',
    numberField: { db: 'issuance_no', id: 'piss-ics', prefix: 'ICS' },
    fields: [
      { id: 'piss-by',       db: 'issued_by', fk: 'profiles' },
      { id: 'piss-employee', db: 'issued_to', fk: 'profiles' },
      { id: 'piss-remarks',  db: 'remarks' }
    ],
    extra: { status: 'Issued' },
    successMsg: 'Property issuance saved.'
  },
  'stock-issuance': {
    table: 'stock_issuances',
    numberField: { db: 'issuance_no', id: 'si-ris', prefix: 'RIS' },
    fields: [
      { id: 'si-by',       db: 'issued_by', fk: 'profiles' },
      { id: 'si-employee', db: 'issued_to', fk: 'profiles' },
      { id: 'si-remarks',  db: 'remarks' }
    ],
    extra: { status: 'Issued' },
    successMsg: 'Stock issuance saved.'
  },
  'property-transfer': {
    table: 'property_transfers',
    numberField: { db: 'transfer_number', id: 'ptrans-no', prefix: 'TR' },
    fields: [
      { id: 'ptrans-by',         db: 'transacted_by',  fk: 'profiles' },
      { id: 'ptrans-from-office',db: 'from_office_id', fk: 'offices'  },
      { id: 'ptrans-to-office',  db: 'to_office_id',   fk: 'offices'  },
      { id: 'ptrans-remarks',    db: 'remarks' }
    ],
    extra: { status: 'Pending' },
    successMsg: 'Transfer saved.'
  },
  'property-return': {
    table: 'property_returns',
    numberField: { db: 'return_number', id: 'pret-no', prefix: 'PR' },
    fields: [
      { id: 'pret-by',      db: 'returned_by', fk: 'profiles' },
      { id: 'pret-remarks', db: 'remarks' }
    ],
    extra: { status: 'Returned' },
    successMsg: 'Return record saved.'
  },
  'property-return-request': {
    table: 'property_returns',
    numberField: { db: 'return_number', id: 'pretreq-no', prefix: 'PRR' },
    fields: [
      { id: 'pretreq-by',      db: 'returned_by', fk: 'profiles' },
      { id: 'pretreq-remarks', db: 'remarks' }
    ],
    extra: { status: 'Pending' },
    successMsg: 'Return request submitted.'
  },
  'stock-return': {
    table: 'stock_returns',
    numberField: { db: 'return_number', id: 'sret-no', prefix: 'SR' },
    fields: [
      { id: 'sret-by',      db: 'returned_by', fk: 'profiles' },
      { id: 'sret-remarks', db: 'remarks' }
    ],
    extra: { status: 'Returned' },
    successMsg: 'Stock return saved.'
  },
  'property-maintenance-request': {
    table: 'property_maintenances',
    numberField: { db: 'maintenance_number', id: 'pmreq-no', prefix: 'MR' },
    fields: [
      { id: 'pmreq-issue-type', db: 'maintenance_type' },
      { id: 'pmreq-by',         db: 'created_by', fk: 'profiles' },
      { id: 'pmreq-issue',      db: 'remarks' }
    ],
    extra: { status: 'Pending' },
    successMsg: 'Maintenance request submitted.'
  },
  'property-maintenance': {
    table: 'property_maintenances',
    numberField: { db: 'maintenance_number', id: 'pm-no', prefix: 'MT' },
    fields: [
      { id: 'pm-type',    db: 'maintenance_type' },
      { id: 'pm-by',      db: 'created_by', fk: 'profiles' },
      { id: 'pm-remarks', db: 'remarks' }
    ],
    extra: { status: 'Maintenance' },
    successMsg: 'Maintenance record saved.'
  },
  'property-verification': {
    table: 'audit_trail',
    fields: [
      { id: 'pv-remarks', db: 'activity' }
    ],
    extra: { entity: 'property_records' },
    successMsg: 'Verification logged.'
  },
  'property-gate-pass-request': {
    table: 'gate_passes',
    numberField: { db: 'gate_pass_number', id: 'gpr-no', prefix: 'GP' },
    fields: [
      { id: 'gpr-by',      db: 'requested_by', fk: 'profiles' },
      { id: 'gpr-purpose', db: 'purpose' }
    ],
    extra: { status: 'Pending' },
    successMsg: 'Gate pass request submitted.'
  },
  'personal-property-gate-pass-request': {
    table: 'personal_property_gate_passes',
    numberField: { db: 'day_pass_number', id: 'ppgpr-no', prefix: 'PGP' },
    fields: [
      { id: 'ppgpr-by',      db: 'requested_by', fk: 'profiles' },
      { id: 'ppgpr-purpose', db: 'purpose' }
    ],
    extra: { status: 'Pending' },
    successMsg: 'Personal gate pass submitted.'
  },
  'inventory-count': {
    table: 'inventory_counts',
    numberField: { db: 'inventory_number', id: 'ic-no', prefix: 'INV' },
    fields: [
      { id: 'ic-type',      db: 'inventory_name' },
      { id: 'ic-remarks',   db: 'description' },
      { id: 'ic-conducted', db: 'created_by', fk: 'profiles' }
    ],
    extra: { status: 'Draft' },
    successMsg: 'Inventory count saved.'
  },
  'property-disposal': {
    table: 'property_disposals',
    numberField: { db: 'disposal_number', id: 'pdisp-no', prefix: 'DSP' },
    fields: [
      { id: 'pdisp-by',      db: 'disposed_by', fk: 'profiles' },
      { id: 'pdisp-just',    db: 'remarks' }
    ],
    extra: { status: 'Disposed' },
    successMsg: 'Disposal record saved.'
  },
  'property-disposal-request': {
    table: 'property_disposals',
    numberField: { db: 'disposal_number', id: 'pdispreq-no', prefix: 'DR' },
    fields: [
      { id: 'pdispreq-by',      db: 'disposed_by', fk: 'profiles' },
      { id: 'pdispreq-just',    db: 'remarks' }
    ],
    extra: { status: 'Pending' },
    successMsg: 'Disposal request submitted.'
  },
  'stock-disposal': {
    table: 'stock_disposals',
    numberField: { db: 'disposal_number', id: 'sdisp-no', prefix: 'SDSP' },
    fields: [
      { id: 'sdisp-by',      db: 'disposed_by', fk: 'profiles' },
      { id: 'sdisp-just',    db: 'remarks' }
    ],
    extra: { status: 'Disposed' },
    successMsg: 'Stock disposal saved.'
  }
};

async function _OP_quickSave(viewKey) {
  const cfg = _OP_QUICK_SAVE_CONFIGS[viewKey];
  if (!cfg) { Toast.show('No save config for ' + viewKey, 'error'); return; }
  try {
    const extra = Object.assign({}, cfg.extra || {});
    if (cfg.numberField) {
      const numEl = document.getElementById(cfg.numberField.id);
      const val   = numEl && numEl.value.trim();
      extra[cfg.numberField.db] = val ||
        (cfg.numberField.prefix + '-' + new Date().getFullYear() + '-' + Date.now().toString().slice(-6));
    }
    await _OP_saveHeader({ table: cfg.table, fields: cfg.fields, extra: extra });
    Toast.show(cfg.successMsg || 'Record saved.', 'success');
  } catch (err) {
    console.error('[op] quickSave failed for ' + viewKey, err);
    Toast.show(err.message || 'Failed to save.', 'error');
  }
}
window._OP_quickSave = _OP_quickSave;

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

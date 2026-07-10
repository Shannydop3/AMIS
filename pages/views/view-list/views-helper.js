/* ============================================================
   AMIS – Views Shared Helper  (views-helper.js)
   Load this BEFORE all view-list/*.js files and views.js
   ============================================================ */
(function () {
  'use strict';

  /* ── Status pill colours ── */
  const PILL_MAP = {
    // Green
    Issued:       'background:#dcfce7;color:#15803d;',
    Approved:     'background:#dcfce7;color:#15803d;',
    Completed:    'background:#dcfce7;color:#15803d;',
    Disposed:     'background:#ede9fe;color:#6d28d9;',
    Returned:     'background:#dcfce7;color:#15803d;',
    // Blue
    Processing:   'background:#dbeafe;color:#1e40af;',
    'In Progress':'background:#dbeafe;color:#1e40af;',
    // Amber
    Pending:      'background:#fef3c7;color:#92400e;',
    // Red
    Declined:     'background:#fee2e2;color:#b91c1c;',
    Cancelled:    'background:#f1f5f9;color:#475569;',
  };

  function pill(status) {
    const s = PILL_MAP[status] || 'background:#f3f4f6;color:#374151;';
    return `<span class="v-pill" style="${s}">${status}</span>`;
  }

  /* ── First-col blue badge ── */
  function idBadge(text, variant) {
    const cls = variant ? `v-id v-id--${variant}` : 'v-id';
    return `<span class="${cls}">${text}</span>`;
  }

  /* ── Muted dash ── */
  function dash(val) {
    return (!val || val === '—')
      ? `<span class="v-muted">—</span>`
      : val;
  }

  /* ── Doc link ── */
  function docLink(doc) {
    if (!doc || doc === '—') return `<span class="v-muted">—</span>`;
    return `<a href="#" class="v-doc-link" style="color:#1976D2;font-size:12px;text-decoration:none;"
              onclick="event.preventDefault();(typeof Toast!=='undefined'&&Toast.show('Opening ${doc}','info'))">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:3px;vertical-align:middle;">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>${doc}</a>`;
  }

  /* ── Action buttons ── */
  function actionBtns(rowIdx, { view = true, upload = true, cancel = true } = {}) {
    let html = `<div class="v-act-wrap">`;
    if (view) html += `
      <button class="v-btn v-btn--view" onclick="window._vView(${rowIdx})" title="View">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </button>`;
    if (upload) html += `
      <button class="v-btn v-btn--upload" onclick="window._vUpload(${rowIdx})" title="Upload">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
      </button>`;
    if (cancel) html += `
      <button class="v-btn v-btn--cancel" onclick="window._vCancel(${rowIdx})" title="Cancel">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
        </svg>
      </button>`;
    html += `</div>`;
    return html;
  }

  /* ── Modal host ── */
  function getHost(id) {
    let m = document.getElementById(id);
    if (!m) { m = document.createElement('div'); m.id = id; document.body.appendChild(m); }
    return m;
  }

  /* ── Build view-detail modal ── */
  function viewModal({ hostId, overlayId, title, rows, headClass = 'vm-head--view', icon = '' }) {
    const host = getHost(hostId);
    const tableRows = rows.map(([label, val], i) =>
      `<tr><td>${label}</td><td>${val ?? '<span class="v-muted">—</span>'}</td></tr>`
    ).join('');

    host.innerHTML = `
      <div class="vm-overlay" id="${overlayId}" onclick="if(event.target===this)this.remove()">
        <div class="vm-modal">
          <div class="vm-head ${headClass}">
            <span class="vm-head__title">${icon}${title}</span>
            <button class="vm-close" onclick="document.getElementById('${overlayId}').remove()">×</button>
          </div>
          <div class="vm-body">
            <table class="vm-table">${tableRows}</table>
          </div>
          <div class="vm-foot">
            <button class="vm-btn-confirm vm-btn-confirm--view"
              onclick="document.getElementById('${overlayId}').remove()">Close</button>
          </div>
        </div>
      </div>`;
  }

  /* ── Build upload modal ── */
  function uploadModal({ hostId, overlayId, label, onConfirm }) {
    const host = getHost(hostId);
    host.innerHTML = `
      <div class="vm-overlay" id="${overlayId}" onclick="if(event.target===this)this.remove()">
        <div class="vm-modal vm-modal--sm">
          <div class="vm-head vm-head--upload">
            <span class="vm-head__title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Upload Document
            </span>
            <button class="vm-close" onclick="document.getElementById('${overlayId}').remove()">×</button>
          </div>
          <div class="vm-body">
            <p style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:12px;">
              Attach a document for <strong style="color:var(--text-primary);">${label}</strong>
            </p>
            <label class="vm-upload-area" for="_vm_file_inp_${overlayId}">
              <input type="file" id="_vm_file_inp_${overlayId}" accept=".pdf,.doc,.docx,.jpg,.png">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <p>Click to browse or drop a file here</p>
              <p style="font-size:0.72rem;margin-top:4px;">PDF, DOC, DOCX, JPG, PNG accepted</p>
            </label>
            <div id="_vm_fname_${overlayId}" style="font-size:0.78rem;color:var(--accent);min-height:18px;"></div>
          </div>
          <div class="vm-foot">
            <button class="vm-btn-cancel-action" onclick="document.getElementById('${overlayId}').remove()">Cancel</button>
            <button class="vm-btn-confirm vm-btn-confirm--upload" id="_vm_upload_ok_${overlayId}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Upload
            </button>
          </div>
        </div>
      </div>`;

    // wire file input display
    const inp = document.getElementById(`_vm_file_inp_${overlayId}`);
    const fnameEl = document.getElementById(`_vm_fname_${overlayId}`);
    if (inp && fnameEl) {
      inp.addEventListener('change', () => {
        fnameEl.textContent = inp.files[0] ? `Selected: ${inp.files[0].name}` : '';
      });
    }
    const okBtn = document.getElementById(`_vm_upload_ok_${overlayId}`);
    if (okBtn) {
      okBtn.addEventListener('click', () => {
        document.getElementById(overlayId).remove();
        if (onConfirm) onConfirm();
      });
    }
  }

  /* ── Build cancel confirm modal ── */
  function cancelModal({ hostId, overlayId, recordId, onConfirm }) {
    const host = getHost(hostId);
    host.innerHTML = `
      <div class="vm-overlay" id="${overlayId}" onclick="if(event.target===this)this.remove()">
        <div class="vm-modal vm-modal--sm">
          <div class="vm-head vm-head--cancel">
            <span class="vm-head__title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              Confirm Cancellation
            </span>
            <button class="vm-close" onclick="document.getElementById('${overlayId}').remove()">×</button>
          </div>
          <div class="vm-body" style="text-align:center;padding:28px 24px;">
            <div class="vm-confirm-icon vm-confirm-icon--cancel">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
              </svg>
            </div>
            <p class="vm-confirm-msg">
              Are you sure you want to cancel<br><strong>${recordId}</strong>?<br>
              <span style="font-size:0.78rem;color:var(--text-muted);">This action cannot be undone.</span>
            </p>
          </div>
          <div class="vm-foot">
            <button class="vm-btn-cancel-action" onclick="document.getElementById('${overlayId}').remove()">No, Keep</button>
            <button class="vm-btn-confirm vm-btn-confirm--cancel" id="_vm_cancel_ok_${overlayId}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Yes, Cancel
            </button>
          </div>
        </div>
      </div>`;

    const okBtn = document.getElementById(`_vm_cancel_ok_${overlayId}`);
    if (okBtn) {
      okBtn.addEventListener('click', () => {
        document.getElementById(overlayId).remove();
        if (onConfirm) onConfirm();
      });
    }
  }

  /* ── Showing-info updater ── */
  function updateShowing(filtered, page, pageSize) {
    const el = document.getElementById('views-showing-info');
    if (!el) return;
    const total = filtered.length;
    if (!total) { el.textContent = 'Showing 0 to 0 of 0 entries'; return; }
    const start = (page - 1) * pageSize + 1;
    const end   = Math.min(page * pageSize, total);
    el.textContent = `Showing ${start} to ${end} of ${total} entries`;
  }

  /* ──────────────────────────────────────────
     _V_loadTable(cfg)
     Generic "SELECT + paint tbody" for View pages.

       cfg = {
         table:    'goods_receipts',
         select:   '*, receiver:profiles!goods_receipts_received_by_fkey(full_name,email)',
         orderBy:  'created_at',
         ascending:false,
         limit:    200,
         filter:   (q) => q.eq('status', 'Issued'),      // optional
         rowFn:    (dbRow) => [cell1, cell2, ...]        // cells align with view.columns
       }
     ────────────────────────────────────────── */
  async function loadTable(cfg) {
    const tbody = document.getElementById('views-tbody');
    const thead = document.getElementById('views-thead');
    if (!tbody) return;
    const colCount = thead ? thead.querySelectorAll('th').length : 8;
    tbody.innerHTML = `<tr><td colspan="${colCount}" class="dash-empty">Loading…</td></tr>`;

    const client = window.AMIS_READY ? await window.AMIS_READY : null;
    if (!client) {
      tbody.innerHTML = `<tr><td colspan="${colCount}" class="dash-empty">Database not configured.</td></tr>`;
      return;
    }
    try {
      let q = client.from(cfg.table).select(cfg.select || '*');
      if (cfg.filter) q = cfg.filter(q);
      q = q.order(cfg.orderBy || 'created_at', { ascending: cfg.ascending !== false ? false : true });
      q = q.limit(cfg.limit || 200);
      const { data, error } = await q;
      if (error) throw error;
      if (!data || !data.length) {
        tbody.innerHTML = `<tr><td colspan="${colCount}" class="dash-empty">No records found.</td></tr>`;
        updateShowing([], 1, 1);
        return;
      }
      tbody.innerHTML = data.map(r => {
        const cells = cfg.rowFn(r).map(c => `<td>${c == null ? '<span class="v-muted">—</span>' : c}</td>`).join('');
        return `<tr>${cells}</tr>`;
      }).join('');
      updateShowing(data, 1, data.length);
    } catch (err) {
      console.error('[views] load failed for', cfg.table, err);
      tbody.innerHTML = `<tr><td colspan="${colCount}" class="dash-empty">Failed to load: ${err.message || err}</td></tr>`;
    }
  }

  /* ── Expose globally ── */
  window.VH = { pill, idBadge, dash, docLink, actionBtns, viewModal, uploadModal, cancelModal, updateShowing, getHost, loadTable };
  window._V_loadTable = loadTable;
}());

/* ============================================
   AMIS – User Management Page Script
   3-dot dropdown mirrors files-data.js exactly:
   fixed-position floating panel, closes on page
   scroll, scrollable Column Visibility section.
   ============================================ */
'use strict';

document.addEventListener('amis:layout-ready', () => {

  /* ── Auth ─────────────────────────────────── */
  Auth.requireAuth('../login/login.html');

  /* ══════════════════════════════════════════
     DATA
  ══════════════════════════════════════════ */
  let users = [
    { id:1,  name:'BUITRE, MARY ROSE',          empno:'1202306074', email:'maryrose.buitre@dict.gov.ph',      role:'',              custodian:false, administrative:false, approver:false, active:true  },
    { id:2,  name:'LIGOT, EDWIN',                empno:'1202208111', email:'edwin.ligot@dict.gov.ph',          role:'',              custodian:false, administrative:false, approver:false, active:true  },
    { id:3,  name:'ALMIROL, DAVID',              empno:'1202208118', email:'david.almirol@dict.gov.ph',        role:'',              custodian:false, administrative:false, approver:false, active:true  },
    { id:4,  name:'EVANGELISTA, KRYZTLE LOVE',   empno:'1202304080', email:'kryztle.evangelista@dict.gov.ph',  role:'',              custodian:false, administrative:false, approver:false, active:true  },
    { id:5,  name:'DEDORO, MAE',                 empno:'1202305078', email:'mae.dedoro@dict.gov.ph',           role:'',              custodian:false, administrative:false, approver:false, active:true  },
    { id:6,  name:'VALDERRAMA, DOMINIQUE KENJI', empno:'1202306120', email:'dominique.valderrama@dict.gov.ph', role:'',              custodian:false, administrative:false, approver:false, active:true  },
    { id:7,  name:'JACOB, DANILO',               empno:'1202401064', email:'danilo.jacob@dict.gov.ph',         role:'',              custodian:false, administrative:false, approver:false, active:true  },
    { id:8,  name:'CELESTE, METZILYN',            empno:'1202401065', email:'metzilyn.celeste@dict.gov.ph',     role:'',              custodian:false, administrative:false, approver:false, active:true  },
    { id:9,  name:'BUÑAO, JESTONY',              empno:'1202401066', email:'jestony.bunao@dict.gov.ph',        role:'',              custodian:false, administrative:false, approver:false, active:true  },
    { id:10, name:'JUDILLA, DENNIS',             empno:'1202401067', email:'dennis.judilla@dict.gov.ph',       role:'',              custodian:false, administrative:false, approver:false, active:true  },
    { id:11, name:'MONTEMAYOR, BERNA JOY',       empno:'1202401068', email:'bernajoy.montemayor@dict.gov.ph',  role:'Administrator', custodian:true,  administrative:true,  approver:true,  active:true  },
    { id:12, name:'REYES, JOSE',                 empno:'1202401069', email:'jose.reyes@dict.gov.ph',           role:'Custodian',     custodian:true,  administrative:false, approver:false, active:true  },
    { id:13, name:'SANTOS, ANNA MARIE',          empno:'1202401070', email:'annamarie.santos@dict.gov.ph',     role:'Viewer',        custodian:false, administrative:false, approver:false, active:false },
    { id:14, name:'GARCIA, PEDRO',               empno:'1202401071', email:'pedro.garcia@dict.gov.ph',         role:'Approver',      custodian:false, administrative:false, approver:true,  active:true  },
    { id:15, name:'DELA CRUZ, MARIA',            empno:'1202401072', email:'maria.delacruz@dict.gov.ph',       role:'',              custodian:false, administrative:false, approver:false, active:true  },
  ];

  let nextId      = 16;
  let currentPage = 1;
  let pageSize    = 10;
  let searchTerm  = '';
  let sortCol     = null;
  let sortDir     = 'asc';
  let editId      = null;
  let actionId    = null;

  /* ══════════════════════════════════════════
     ICON STRINGS
  ══════════════════════════════════════════ */
  const boolYes = `<span class="um-bool um-bool--yes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></span>`;
  const boolNo  = `<span class="um-bool um-bool--no"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span>`;

  const ICON_SIGNOUT  = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"/></svg>`;
  const ICON_RESETPWD = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>`;
  const ICON_EDIT     = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`;

  /* ══════════════════════════════════════════
     FLOATING DROPDOWN  (exact files-data pattern)
  ══════════════════════════════════════════ */
  const floatDrop    = document.getElementById('um-float-drop');
  let   activeDotsBtn = null;

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

  /* Close on any outside click */
  document.addEventListener('click', e => {
    if (!floatDrop.contains(e.target) && e.target !== activeDotsBtn) closeFloat();
  });

  /* Prevent the dropdown itself from triggering a close via scroll events */
  floatDrop.addEventListener('scroll',    e => e.stopPropagation(), { passive: true, capture: true });
  floatDrop.addEventListener('wheel',     e => e.stopPropagation(), { passive: true, capture: true });
  floatDrop.addEventListener('touchmove', e => e.stopPropagation(), { passive: true, capture: true });

  /* ── Close on page-content scroll (files-data pattern) ── */
  const pageContent = document.getElementById('page-content');
  if (pageContent) {
    pageContent.addEventListener('scroll', () => closeFloat(), { passive: true });
  }
  window.addEventListener('scroll', () => closeFloat(), { passive: true });

  /* ══════════════════════════════════════════
     COLUMN VISIBILITY HELPER
  ══════════════════════════════════════════ */
  function toggleColumn(colIndex, visible) {
    const tbl  = document.getElementById('user-table');
    const disp = visible ? '' : 'none';

    /* Hide the <col> element so table-layout:auto fully releases the width */
    const cols = tbl.querySelectorAll('colgroup col');
    if (cols[colIndex]) cols[colIndex].style.display = disp;

    /* Hide every th/td in that column position */
    tbl.querySelectorAll('tr').forEach(row => {
      const cell = row.querySelectorAll('th, td')[colIndex];
      if (cell) cell.style.display = disp;
    });
  }

  /* Re-apply hidden state to newly rendered tbody rows.
     Called after every renderTable() because innerHTML wipes inline styles. */
  function reapplyColumnVisibility() {
    const tbl  = document.getElementById('user-table');
    const cols = tbl.querySelectorAll('colgroup col');
    cols.forEach((col, i) => {
      if (col.style.display === 'none') {
        tbl.querySelectorAll('tbody tr').forEach(row => {
          const cell = row.querySelectorAll('td')[i];
          if (cell) cell.style.display = 'none';
        });
      }
    });
  }

  /* ══════════════════════════════════════════
     BUILD DOTS DROPDOWN CONTENT
     (Copy / Excel / CSV / Print + hr +
      "Column Visibility" label + scrollable
      checkbox list — identical to files-data)
  ══════════════════════════════════════════ */
  function buildDotsContent(container) {
    const tbl = document.getElementById('user-table');

    /* ── Export / utility actions ── */
    const actions = [
      {
        label: 'Copy',
        icon:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`,
        fn:    doCopy,
      },
      {
        label: 'Excel',
        icon:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/></svg>`,
        fn:    doExcel,
      },
      {
        label: 'CSV',
        icon:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
        fn:    doCsv,
      },
      {
        label: 'Print',
        icon:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>`,
        fn:    doPrint,
      },
    ];

    actions.forEach(a => {
      const btn = document.createElement('button');
      btn.innerHTML = `${a.icon} ${a.label}`;
      btn.addEventListener('click', () => { closeFloat(); a.fn(); });
      container.appendChild(btn);
    });

    /* ── Divider ── */
    container.appendChild(document.createElement('hr'));

    /* ── "Column Visibility" section label ── */
    const lbl = document.createElement('div');
    lbl.className = 'um-drop-section-label';
    lbl.textContent = 'Column Visibility';
    container.appendChild(lbl);

    /* ── Scrollable column list (max 5 rows × ~34 px each) ── */
    const colScroll = document.createElement('div');
    colScroll.className = 'um-drop-col-scroll';
    colScroll.style.cssText =
      'overflow-y:auto; max-height:calc(5 * 34px); overscroll-behavior:contain;' +
      'scrollbar-width:thin; scrollbar-color:#D1DCE8 transparent;';
    container.appendChild(colScroll);

    tbl.querySelectorAll('thead th').forEach((th, i) => {
      const row = document.createElement('label');
      row.className = 'um-drop-col-row';

      const cb = document.createElement('input');
      cb.type    = 'checkbox';
      cb.checked = th.style.display !== 'none';
      cb.addEventListener('change', e => {
        e.stopPropagation();
        toggleColumn(i, cb.checked);
      });

      row.appendChild(cb);
      row.appendChild(document.createTextNode(th.textContent.trim()));
      colScroll.appendChild(row);
    });
  }

  /* ══════════════════════════════════════════
     BUILD TOOLBAR DOTS BUTTON
  ══════════════════════════════════════════ */
  const tbarEl  = document.getElementById('um-tbar');
  const dotsBtn = document.createElement('button');
  dotsBtn.className   = 'um-tbar__dots';
  dotsBtn.title       = 'Options';
  dotsBtn.textContent = '⋮';
  dotsBtn.addEventListener('click', e => {
    e.stopPropagation();
    openFloat(dotsBtn, buildDotsContent);
  });
  tbarEl.appendChild(dotsBtn);

  /* ══════════════════════════════════════════
     TABLE RENDER
  ══════════════════════════════════════════ */
  function getFiltered() {
    let data = [...users];
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      data = data.filter(u =>
        u.name.toLowerCase().includes(s)  ||
        u.empno.includes(s)               ||
        u.email.toLowerCase().includes(s) ||
        (u.role || '').toLowerCase().includes(s)
      );
    }
    if (sortCol) {
      data.sort((a, b) => {
        const av = (a[sortCol] || '').toString().toLowerCase();
        const bv = (b[sortCol] || '').toString().toLowerCase();
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }
    return data;
  }

  function renderTable() {
    const filtered   = getFiltered();
    const total      = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * pageSize;
    const end   = Math.min(start + pageSize, total);
    const page  = filtered.slice(start, end);

    const tbody = document.getElementById('table-body');
    tbody.innerHTML = page.length === 0
      ? `<tr><td colspan="9" class="um-empty">No users found.</td></tr>`
      : page.map(u => `
          <tr>
            <td class="um-name">${u.name}</td>
            <td>${u.empno}</td>
            <td class="um-email">${u.email.toLowerCase()}</td>
            <td class="um-role">${u.role || '—'}</td>
            <td style="text-align:center">${u.custodian      ? boolYes : boolNo}</td>
            <td style="text-align:center">${u.administrative ? boolYes : boolNo}</td>
            <td style="text-align:center">${u.approver       ? boolYes : boolNo}</td>
            <td style="text-align:center">
              <span class="um-badge ${u.active ? 'um-badge--active' : 'um-badge--inactive'}">
                ${u.active ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td>
              <div class="um-actions">
                <button class="um-btn-action um-btn-signout"
                        title="Force Sign Out"
                        onclick="doForceSignout(${u.id})">${ICON_SIGNOUT}</button>
                <button class="um-btn-action um-btn-resetpwd"
                        title="Reset Password"
                        onclick="doResetPassword(${u.id})">${ICON_RESETPWD}</button>
                <button class="um-btn-action um-btn-edituser"
                        title="Edit User Info"
                        onclick="editUser(${u.id})">${ICON_EDIT}</button>
              </div>
            </td>
          </tr>
        `).join('');

    document.getElementById('showing-info').textContent = total === 0
      ? 'Showing 0 to 0 of 0 entries'
      : `Showing ${start + 1} to ${end} of ${total} entries`;

    renderPagination(totalPages);
    syncSortHeaders();
    reapplyColumnVisibility();
  }

  function renderPagination(totalPages) {
    const pag   = document.getElementById('pagination');
    const pages = [];

    pages.push(`<button class="page-btn" onclick="goPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>`);

    const range = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 2) range.push(i);
      else if (range[range.length - 1] !== '...') range.push('...');
    }
    range.forEach(r => {
      if (r === '...') pages.push(`<button class="page-btn" disabled>…</button>`);
      else pages.push(`<button class="page-btn ${r === currentPage ? 'active' : ''}" onclick="goPage(${r})">${r}</button>`);
    });

    pages.push(`<button class="page-btn" onclick="goPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>`);
    pag.innerHTML = pages.join('');
  }

  function syncSortHeaders() {
    document.querySelectorAll('.um-tbl thead th.sortable').forEach(th => {
      th.classList.remove('sort-asc', 'sort-desc');
      if (th.dataset.col === sortCol)
        th.classList.add(sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
    });
  }

  function goPage(p) {
    const totalPages = Math.max(1, Math.ceil(getFiltered().length / pageSize));
    if (p < 1 || p > totalPages) return;
    currentPage = p;
    renderTable();
  }

  /* ══════════════════════════════════════════
     SORT — column header clicks
  ══════════════════════════════════════════ */
  document.querySelectorAll('.um-tbl thead th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      if (sortCol === col) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
      else { sortCol = col; sortDir = 'asc'; }
      currentPage = 1;
      renderTable();
    });
  });

  /* ══════════════════════════════════════════
     SORT DROPDOWN
  ══════════════════════════════════════════ */
  document.getElementById('um-sort').addEventListener('change', function () {
    const val = this.value;
    if (!val) { sortCol = null; sortDir = 'asc'; }
    else {
      const [col, dir] = val.split('-');
      sortCol = col === 'empno' ? 'empno' : col === 'email' ? 'email' : 'name';
      sortDir = dir === 'za' ? 'desc' : 'asc';
    }
    currentPage = 1;
    renderTable();
  });

  /* ══════════════════════════════════════════
     SEARCH
  ══════════════════════════════════════════ */
  document.getElementById('search-input').addEventListener('input', e => {
    searchTerm  = e.target.value;
    currentPage = 1;
    renderTable();
  });

  /* ══════════════════════════════════════════
     PAGE SIZE
  ══════════════════════════════════════════ */
  document.getElementById('page-size').addEventListener('change', e => {
    pageSize    = +e.target.value;
    currentPage = 1;
    renderTable();
  });

  /* ══════════════════════════════════════════
     EXPORT / COPY HELPERS
  ══════════════════════════════════════════ */
  const HEADERS = ['Name', 'Emp #', 'Email', 'Role', 'Custodian', 'Admin', 'Approver', 'Active'];
  function rowArr(u) {
    return [u.name, u.empno, u.email, u.role || '—',
            yn(u.custodian), yn(u.administrative), yn(u.approver), yn(u.active)];
  }

  function doCopy() {
    const text = [HEADERS.join('\t'), ...getFiltered().map(u => rowArr(u).join('\t'))].join('\n');
    navigator.clipboard.writeText(text)
      .then(() => Toast.show('Table copied to clipboard.', 'success'))
      .catch(() => Toast.show('Copy failed.', 'error'));
  }

  function doExcel() {
    let html = `<table><thead><tr>${HEADERS.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>`;
    getFiltered().forEach(u => { html += `<tr>${rowArr(u).map(c => `<td>${c}</td>`).join('')}</tr>`; });
    html += `</tbody></table>`;
    const full = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body>${html}</body></html>`;
    dlBlob(full, 'users.xls', 'application/vnd.ms-excel');
    Toast.show('Excel file exported.', 'success');
  }

  function doCsv() {
    const esc = v => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [HEADERS, ...getFiltered().map(rowArr)].map(r => r.map(esc).join(',')).join('\n');
    dlBlob(csv, 'users.csv', 'text/csv');
    Toast.show('CSV exported.', 'success');
  }

  function doPrint() {
    const html = `<html><head><title>User List</title>
      <style>body{font-family:Arial,sans-serif;font-size:12px}h2{color:#0A3D7C;margin-bottom:12px}
      table{border-collapse:collapse;width:100%}th{background:#0A3D7C;color:#fff;padding:6px 8px;text-align:left;font-size:11px}
      td{padding:5px 8px;border-bottom:1px solid #ddd}tr:nth-child(even)td{background:#f5f7fa}
      @media print{@page{margin:1cm}}</style></head>
      <body><h2>User List</h2>
      <table><thead><tr>${HEADERS.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${getFiltered().map(u => `<tr>${rowArr(u).map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></body></html>`;
    const w = window.open('', '_blank');
    w.document.write(html); w.document.close(); w.focus();
    setTimeout(() => { w.print(); w.close(); }, 400);
  }

  function dlBlob(content, filename, mime) {
    const url = URL.createObjectURL(new Blob([content], { type: mime }));
    const a   = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  function yn(v) { return v ? 'Yes' : 'No'; }

  /* ══════════════════════════════════════════
     ACTION: FORCE SIGN OUT
  ══════════════════════════════════════════ */
  function doForceSignout(id) {
    actionId = id;
    const u  = users.find(u => u.id === id);
    document.getElementById('confirm-signout-msg').textContent =
      `Are you sure you want to force sign out "${u?.name}"? They will be immediately logged out of all sessions.`;
    document.getElementById('confirm-signout').classList.add('open');
  }

  document.getElementById('confirm-signout-cancel').addEventListener('click', () => {
    document.getElementById('confirm-signout').classList.remove('open');
    actionId = null;
  });
  document.getElementById('confirm-signout-ok').addEventListener('click', () => {
    const u = users.find(u => u.id === actionId);
    document.getElementById('confirm-signout').classList.remove('open');
    actionId = null;
    if (u) Toast.show(`${u.name} has been signed out of all sessions.`, 'success');
  });
  document.getElementById('confirm-signout').addEventListener('click', e => {
    if (e.target === e.currentTarget) {
      document.getElementById('confirm-signout').classList.remove('open');
      actionId = null;
    }
  });

  /* ══════════════════════════════════════════
     ACTION: RESET PASSWORD
  ══════════════════════════════════════════ */
  function doResetPassword(id) {
    actionId = id;
    const u  = users.find(u => u.id === id);
    document.getElementById('confirm-reset-msg').textContent =
      `A password reset link will be sent to ${u?.email}. Continue?`;
    document.getElementById('confirm-reset').classList.add('open');
  }

  document.getElementById('confirm-reset-cancel').addEventListener('click', () => {
    document.getElementById('confirm-reset').classList.remove('open');
    actionId = null;
  });
  document.getElementById('confirm-reset-ok').addEventListener('click', () => {
    const u = users.find(u => u.id === actionId);
    document.getElementById('confirm-reset').classList.remove('open');
    actionId = null;
    if (u) Toast.show(`Password reset link sent to ${u.email}.`, 'success', 4000);
  });
  document.getElementById('confirm-reset').addEventListener('click', e => {
    if (e.target === e.currentTarget) {
      document.getElementById('confirm-reset').classList.remove('open');
      actionId = null;
    }
  });

  /* ══════════════════════════════════════════
     ACTION: EDIT USER INFO
  ══════════════════════════════════════════ */
  function editUser(id) {
    const u = users.find(u => u.id === id);
    if (!u) return;
    editId = id;
    const parts = u.name.split(', ');
    document.getElementById('f-lastname').value         = parts[0] || '';
    document.getElementById('f-firstname').value        = parts[1] || '';
    document.getElementById('f-middlename').value       = '';
    document.getElementById('f-empno').value            = u.empno;
    document.getElementById('f-email').value            = u.email;
    document.getElementById('f-role').value             = u.role || '';
    document.getElementById('f-custodian').checked      = u.custodian;
    document.getElementById('f-administrative').checked = u.administrative;
    document.getElementById('f-approver').checked       = u.approver;
    document.getElementById('f-active').checked         = u.active;
    document.getElementById('pwd-group').style.display  = 'none';
    openModal('Edit User Info');
  }

  /* ══════════════════════════════════════════
     ADD USER
  ══════════════════════════════════════════ */
  document.getElementById('btn-add').addEventListener('click', () => {
    editId = null;
    document.getElementById('pwd-group').style.display = '';
    clearForm();
    openModal('Add New User');
  });

  /* ══════════════════════════════════════════
     MODAL HELPERS
  ══════════════════════════════════════════ */
  function openModal(title) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('user-modal').classList.add('open');
  }

  function closeModal() {
    document.getElementById('user-modal').classList.remove('open');
    clearForm();
    editId = null;
  }

  function clearForm() {
    ['f-lastname','f-firstname','f-middlename','f-empno','f-email','f-password'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    document.getElementById('f-role').value             = '';
    document.getElementById('f-custodian').checked      = false;
    document.getElementById('f-administrative').checked = false;
    document.getElementById('f-approver').checked       = false;
    document.getElementById('f-active').checked         = true;
  }

  document.getElementById('modal-close').addEventListener('click',  closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('user-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });

  /* ── Save ── */
  document.getElementById('modal-save').addEventListener('click', () => {
    const lastname  = document.getElementById('f-lastname').value.trim();
    const firstname = document.getElementById('f-firstname').value.trim();
    const empno     = document.getElementById('f-empno').value.trim();
    const email     = document.getElementById('f-email').value.trim();

    if (!lastname || !firstname || !empno || !email) {
      Toast.show('Please fill in all required fields.', 'error');
      return;
    }

    const userData = {
      name:           `${lastname.toUpperCase()}, ${firstname.toUpperCase()}`,
      empno, email,
      role:           document.getElementById('f-role').value,
      custodian:      document.getElementById('f-custodian').checked,
      administrative: document.getElementById('f-administrative').checked,
      approver:       document.getElementById('f-approver').checked,
      active:         document.getElementById('f-active').checked,
    };

    if (editId) {
      const idx = users.findIndex(u => u.id === editId);
      if (idx > -1) users[idx] = { ...users[idx], ...userData };
      Toast.show('User updated successfully.', 'success');
    } else {
      users.unshift({ id: nextId++, ...userData });
      Toast.show('User added successfully.', 'success');
    }

    closeModal();
    renderTable();
  });

  /* ══════════════════════════════════════════
     INIT
  ══════════════════════════════════════════ */
  renderTable();

  /* Expose globals for inline onclick attributes */
  window.goPage          = goPage;
  window.editUser        = editUser;
  window.doForceSignout  = doForceSignout;
  window.doResetPassword = doResetPassword;

});
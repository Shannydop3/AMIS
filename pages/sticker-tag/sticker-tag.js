/* ============================================
   AMIS – Sticker Tag Page Script
   ============================================ */
'use strict';

let stickerHistory = JSON.parse(localStorage.getItem('dictStickerHistory') || '[]');
let pages          = JSON.parse(localStorage.getItem('dictStickerPages')   || '[[]]');
let currentPageIdx = 0;
let navOffset      = 0;
let openModalIndex = null;

const MAX_PER_PAGE = 12;
const NAV_VISIBLE  = 5;

const FIELDS = [
  { key: 'propnum',   label: 'PROPERTY NUMBER'      },
  { key: 'assetclas', label: 'ASSET CLASSIFICATION'  },
  { key: 'item',      label: 'ITEM/BRAND/MODEL'      },
  { key: 'serial',    label: 'SERIAL NUMBER'         },
  { key: 'cost',      label: 'ACQUISITION COST'      },
  { key: 'acqdate',   label: 'ACQUISITION DATE'      },
  { key: 'location',  label: 'LOCATION'              },
  { key: 'person',    label: 'PERSON ACCOUNTABLE'    },
];

const HISTORY_COLS = [
  { key: 'num',       label: '#'                     },
  { key: 'propnum',   label: 'Property Number'       },
  { key: 'assetclas', label: 'Asset Classification'  },
  { key: 'item',      label: 'Item / Brand / Model'  },
  { key: 'serial',    label: 'Serial Number'         },
  { key: 'cost',      label: 'Acquisition Cost'      },
  { key: 'acqdate',   label: 'Acquisition Date'      },
  { key: 'location',  label: 'Location'              },
  { key: 'person',    label: 'Person Accountable'    },
  { key: 'timestamp', label: 'Date Added'            },
  { key: 'status',    label: 'Status'                },
];

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];


// ── Helpers ─────────────────────────────────────

function formatDateLong(raw) {
  if (!raw) return '';
  const p = String(raw).split('-');
  if (p.length !== 3) return raw;
  const m = parseInt(p[1], 10), d = parseInt(p[2], 10);
  if (!m || !d) return raw;
  return `${MONTH_NAMES[m - 1]} ${String(d).padStart(2, '0')}, ${p[0]}`;
}

function allowNumbers(e) {
  const ch = String.fromCharCode(e.which || e.keyCode);
  if (/[\d.\-]/.test(ch) || e.keyCode === 8) return true;
  e.preventDefault(); return false;
}

function allowLetters(e) {
  const ch = String.fromCharCode(e.which || e.keyCode);
  if (/[a-zA-Z\s.\-\/,']/.test(ch) || e.keyCode === 8) return true;
  e.preventDefault(); return false;
}

function enforceNumbers(el) { el.value = el.value.replace(/[^\d.\-]/g, ''); }
function enforceLetters(el) { el.value = el.value.replace(/[^a-zA-Z\s.\-\/,'.]/g, ''); }

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function v(id) { return (document.getElementById(id)?.value || '').trim(); }

function setStatus(msg, color) {
  const bar = document.getElementById('statusBar');
  if (!bar) return;
  bar.textContent  = msg;
  bar.style.color  = color || '';
  clearTimeout(bar._t);
  bar._t = setTimeout(() => {
    bar.style.color  = '';
    bar.textContent  = 'Ready. Fill in all fields and click Add to Page.';
  }, 5000);
}

function saveHistory() {
  try { localStorage.setItem('dictStickerHistory', JSON.stringify(stickerHistory)); } catch (e) {}
}

function savePages() {
  try { localStorage.setItem('dictStickerPages', JSON.stringify(pages)); } catch (e) {}
}

function updateNum(val) {
  document.getElementById('stickerNumDisplay').textContent = val.trim() || '—';
}


// ── Sticker builder ──────────────────────────────

function buildStickerHTML(data, index, isEmpty, isModal) {
  const num       = data.num || '';
  const clickAttr = (!isEmpty && !isModal) ? `onclick="openModal(${index})"` : '';

  const fieldRows = FIELDS.map(f => {
    let val = isEmpty ? '' : (data[f.key] || '');
    if (f.key === 'acqdate' && val) val = formatDateLong(val);
    return `<div class="s-field-row">
      <div class="s-field-label">${f.label}</div>
      <div class="s-field-value">${escHtml(val)}</div>
    </div>`;
  }).join('');

  return `
  <div class="sticker${isEmpty ? ' empty' : ''}" id="sticker_${index}" ${clickAttr}>
    <div class="s-title-bar"><span class="s-title-text">Property Inventory Tag</span></div>
    <div class="s-body">
      <div class="s-left">
        <div class="s-logo-wrap">
  <img src="../../assets/dict-logo.png" alt="DICT"
       style="width:11mm;height:auto;object-fit:contain;display:block;"
       onerror="this.style.display='none'">
  <img src="../../assets/dict-name.png" alt="DICT"
       style="width:11mm;height:auto;object-fit:contain;display:block;"
       onerror="this.style.display='none'">
</div>
        <div class="s-warning">Note: Removing or<br>tampering of this sticker<br>is punishable by law</div>
        <div class="s-number-badge">${escHtml(num)}</div>
      </div>
      <div class="s-right">
        <div class="s-table-fields">${fieldRows}</div>
        <div class="s-sig-line">Signatures of Personnel Conducting/Witnessing the Physical Count</div>
        <div class="s-table-dates">
          <div class="s-date-row"><div class="s-date-cell-left">DATE:___/___/202_</div><div class="s-date-cell-right"></div></div>
          <div class="s-date-row"><div class="s-date-cell-left">DATE:___/___/202_</div><div class="s-date-cell-right"></div></div>
          <div class="s-date-row"><div class="s-date-cell-left">DATE:___/___/202_</div><div class="s-date-cell-right"></div></div>
        </div>
      </div>
    </div>
    <div class="s-footer"></div>
    ${isEmpty ? '' : '<div class="sticker-hover-overlay"><span>👁 VIEW</span></div>'}
  </div>`;
}


// ── Page render ──────────────────────────────────

function renderPage() {
  const page     = document.getElementById('a4Page');
  const stickers = pages[currentPageIdx] || [];
  let html = '';
  for (let i = 0; i < MAX_PER_PAGE; i++) {
    html += (i < stickers.length)
      ? buildStickerHTML(stickers[i], i, false, false)
      : buildStickerHTML({}, i, true, false);
  }
  page.innerHTML = html;
  renderPageNav();
}

function renderPageNav() {
  const nav = document.getElementById('pageNav');
  if (!nav) return;
  const total      = pages.length;
  const showArrows = total > NAV_VISIBLE;

  if (currentPageIdx < navOffset) navOffset = currentPageIdx;
  if (currentPageIdx >= navOffset + NAV_VISIBLE) navOffset = currentPageIdx - NAV_VISIBLE + 1;
  if (total > NAV_VISIBLE) navOffset = Math.max(0, Math.min(navOffset, total - NAV_VISIBLE));
  else navOffset = 0;

  const start = navOffset;
  const end   = Math.min(start + NAV_VISIBLE, total);

  let html = `<span class="page-nav-label">Page</span>`;
  if (showArrows) {
    html += `<button class="page-nav-arrow" onclick="navShift(-1)" ${start === 0 ? 'disabled' : ''}>&#8249;</button>`;
  }
  for (let i = start; i < end; i++) {
    const cls = i === currentPageIdx
      ? 'page-dot active'
      : pages[i].length >= MAX_PER_PAGE ? 'page-dot full' : 'page-dot';
    html += `<button class="${cls}" onclick="goToPage(${i})" title="Page ${i + 1} — ${pages[i].length}/12">${i + 1}</button>`;
  }
  if (showArrows) {
    html += `<button class="page-nav-arrow" onclick="navShift(1)" ${end >= total ? 'disabled' : ''}>&#8250;</button>`;
  }
  nav.innerHTML = html;
}

function navShift(dir) {
  navOffset = Math.max(0, Math.min(navOffset + dir, pages.length - NAV_VISIBLE));
  renderPageNav();
}

function goToPage(idx) {
  currentPageIdx = idx;
  clearGlobalSearchHighlights();
  renderPage();
}


// ── Global search ────────────────────────────────

function globalSearchSticker(query) {
  const q      = String(query).trim().toLowerCase();
  const badge  = document.getElementById('searchBadge');
  const badge2 = document.getElementById('searchBadge2');
  clearGlobalSearchHighlights();

  function setBadges(display, text, className) {
    [badge, badge2].forEach(b => { if (!b) return; b.style.display = display; if (text !== null) { b.textContent = text; b.className = className; } });
  }

  if (!q) { setBadges('none', null, ''); return; }

  let matches = [];
  pages.forEach((pageArr, pi) => {
    pageArr.forEach((sticker, si) => {
      if (Object.values(sticker).some(val => String(val).toLowerCase().includes(q)))
        matches.push({ pageIdx: pi, stickerIdx: si });
    });
  });

  if (matches.length === 0) {
    setBadges('inline-block', 'Not found', 'st-search-badge not-found');
    return;
  }

  setBadges('inline-block', `${matches.length} found`, 'st-search-badge');

  const firstMatch = matches[0];
  if (currentPageIdx !== firstMatch.pageIdx) {
    currentPageIdx = firstMatch.pageIdx;
    renderPage();
  }

  const currentMatchIdxSet = new Set(
    matches.filter(m => m.pageIdx === currentPageIdx).map(m => m.stickerIdx)
  );
  for (let i = 0; i < MAX_PER_PAGE; i++) {
    const el = document.getElementById(`sticker_${i}`);
    if (!el || el.classList.contains('empty')) continue;
    el.classList.toggle('search-highlight', currentMatchIdxSet.has(i));
    el.classList.toggle('search-dim', !currentMatchIdxSet.has(i));
  }
}

function clearGlobalSearchHighlights() {
  for (let i = 0; i < MAX_PER_PAGE; i++) {
    const el = document.getElementById(`sticker_${i}`);
    if (el) el.classList.remove('search-highlight', 'search-dim');
  }
}


// ── Page management ──────────────────────────────

function createNewPage() {
  if ((pages[currentPageIdx] || []).length < MAX_PER_PAGE) {
    if (!confirm(`Current page still has ${MAX_PER_PAGE - pages[currentPageIdx].length} empty slots.\nCreate a new page anyway?`)) return;
  }
  pages.push([]);
  currentPageIdx = pages.length - 1;
  savePages(); renderPage();
  setStatus(`📄 Page ${pages.length} created.`, '#1e6e3d');
}

function deleteCurrentPage() {
  if (pages.length === 1) {
    if (!confirm('This is the only page. Clear all stickers from it?')) return;
    pages[0] = []; currentPageIdx = 0;
    savePages(); renderPage();
    setStatus('Page cleared.', '#c0392b'); return;
  }
  const count = (pages[currentPageIdx] || []).length;
  if (!confirm(count > 0
    ? `Delete Page ${currentPageIdx + 1}? It contains ${count} sticker(s).\n(History is preserved.)`
    : `Delete empty Page ${currentPageIdx + 1}?`)) return;
  pages.splice(currentPageIdx, 1);
  if (currentPageIdx >= pages.length) currentPageIdx = pages.length - 1;
  savePages(); renderPage();
  setStatus(`🗑 Page deleted. Now on page ${currentPageIdx + 1}.`, '#c0392b');
}


// ── Collect + validate ───────────────────────────

function collectData() {
  return {
    num:       v('inp_num'),
    propnum:   v('inp_propnum'),
    assetclas: v('inp_assetclas'),
    item:      v('inp_item'),
    serial:    v('inp_serial'),
    cost:      v('inp_cost'),
    acqdate:   v('inp_acqdate'),
    location:  v('inp_location'),
    person:    v('inp_person'),
    timestamp: new Date().toLocaleString('en-PH', {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    }),
    status: 'Printed',
  };
}

function validateData(data, skipNumCheck) {
  const errors = [];
  if (!skipNumCheck) {
    if (!data.num) {
      errors.push('Item number is required.');
    } else if (isNaN(data.num) || Number(data.num) < 1) {
      errors.push('Item number must be a positive integer.');
    } else {
      const numStr  = String(data.num);
      const allNums = pages.flatMap(p => p.map(s => String(s.num)));
      if (allNums.includes(numStr)) errors.push(`Sticker #${data.num} already exists.`);
    }
  }
  if (!data.propnum)   errors.push('Property number is required.');
  if (!data.assetclas) errors.push('Asset classification is required.');
  if (!data.item)      errors.push('Item/brand/model is required.');
  if (!data.serial)    errors.push('Serial number is required.');
  if (!data.cost)      errors.push('Acquisition cost is required.');
  if (!data.acqdate)   errors.push('Acquisition date is required.');
  if (!data.location)  errors.push('Location is required.');
  if (!data.person)    errors.push('Person accountable is required.');
  return errors;
}

function highlightErrors(data, prefix) {
  ['num','propnum','assetclas','item','serial','cost','acqdate','location','person'].forEach(id => {
    const el  = document.getElementById(`${prefix}_${id}`);
    const val = (data[id] || '').trim();
    if (el) el.classList.toggle('input-error', !val);
  });
}


// ── Add / print / clear ──────────────────────────

function addStickerToPage() {
  const data   = collectData();
  const errors = validateData(data, false);
  if (errors.length) {
    highlightErrors(data, 'inp');
    setStatus('⚠ ' + errors[0], '#c0392b');
    return;
  }
  if ((pages[currentPageIdx] || []).length >= MAX_PER_PAGE) {
    setStatus('⚠ Page is full (12 stickers). Create a new page.', '#c0392b');
    return;
  }
  pages[currentPageIdx].push(data);
  stickerHistory.unshift({ ...data });
  savePages(); saveHistory(); renderPage();

  // Clear inputs
  ['inp_num','inp_propnum','inp_assetclas','inp_item','inp_serial',
   'inp_cost','inp_acqdate','inp_location','inp_person'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('stickerNumDisplay').textContent = '—';
  setStatus(`✅ Sticker #${data.num} added to page ${currentPageIdx + 1}.`, '#1e6e3d');
}

function printCurrentPage() {
  switchView('print');
  setTimeout(() => window.print(), 100);
}

function clearCurrentPage() {
  const count = (pages[currentPageIdx] || []).length;
  if (count === 0) { setStatus('Page is already empty.', ''); return; }
  if (!confirm(`Clear ${count} sticker(s) from page ${currentPageIdx + 1}?\n(History is preserved.)`)) return;
  pages[currentPageIdx] = [];
  savePages(); renderPage();
  setStatus('Page cleared. History preserved.', '#c0392b');
}


// ── Modal ────────────────────────────────────────

function openModal(index) {
  const data = (pages[currentPageIdx] || [])[index];
  if (!data) return;
  openModalIndex = index;
  document.getElementById('modalTitle').textContent          = `Sticker #${data.num} — Preview`;
  document.getElementById('modalEditPane').style.display     = 'none';
  document.getElementById('modalPreviewPane').style.display  = '';
  renderModalPreview(data);
  document.getElementById('stickerModal').classList.add('open');
}

function renderModalPreview(data) {
  document.getElementById('modalBody').innerHTML = `
    <div class="modal-sticker-outer">
      <div class="modal-sticker-scale">
        ${buildStickerHTML(data, -1, false, true)}
      </div>
    </div>`;
}

function switchToEditMode() {
  if (openModalIndex === null) return;
  const data = (pages[currentPageIdx] || [])[openModalIndex];
  if (!data) return;
  document.getElementById('edit_num').value      = data.num       || '';
  document.getElementById('edit_propnum').value  = data.propnum   || '';
  document.getElementById('edit_assetclas').value= data.assetclas || '';
  document.getElementById('edit_item').value     = data.item      || '';
  document.getElementById('edit_serial').value   = data.serial    || '';
  document.getElementById('edit_cost').value     = data.cost      || '';
  document.getElementById('edit_acqdate').value  = data.acqdate   || '';
  document.getElementById('edit_location').value = data.location  || '';
  document.getElementById('edit_person').value   = data.person    || '';
  document.getElementById('editStatus').textContent              = '';
  document.getElementById('modalPreviewPane').style.display      = 'none';
  document.getElementById('modalEditPane').style.display         = '';
}

function switchToPreviewMode() {
  document.getElementById('modalEditPane').style.display     = 'none';
  document.getElementById('modalPreviewPane').style.display  = '';
  if (openModalIndex !== null) {
    const data = (pages[currentPageIdx] || [])[openModalIndex];
    if (data) renderModalPreview(data);
  }
}

function saveEditedSticker() {
  if (openModalIndex === null) return;
  const old = (pages[currentPageIdx] || [])[openModalIndex];
  if (!old) return;

  const edited = {
    num:       (document.getElementById('edit_num').value       || '').trim(),
    propnum:   (document.getElementById('edit_propnum').value   || '').trim(),
    assetclas: (document.getElementById('edit_assetclas').value || '').trim(),
    item:      (document.getElementById('edit_item').value      || '').trim(),
    serial:    (document.getElementById('edit_serial').value    || '').trim(),
    cost:      (document.getElementById('edit_cost').value      || '').trim(),
    acqdate:   (document.getElementById('edit_acqdate').value   || '').trim(),
    location:  (document.getElementById('edit_location').value  || '').trim(),
    person:    (document.getElementById('edit_person').value    || '').trim(),
    timestamp: old.timestamp,
    status:    'Printed',
  };

  const sameNum = String(edited.num) === String(old.num);
  const errors  = validateData(edited, sameNum);

  if (errors.length) {
    highlightErrors(edited, 'edit');
    document.getElementById('editStatus').textContent = '⚠ ' + errors[0];
    return;
  }

  pages[currentPageIdx][openModalIndex] = edited;
  const hIdx = stickerHistory.findIndex(h => String(h.num) === String(old.num));
  if (hIdx >= 0) stickerHistory[hIdx] = { ...edited };
  savePages(); saveHistory(); renderPage();

  document.getElementById('editStatus').textContent = '';
  openModalIndex = pages[currentPageIdx].findIndex(s => String(s.num) === String(edited.num));
  const updData  = openModalIndex >= 0 ? pages[currentPageIdx][openModalIndex] : null;
  document.getElementById('modalTitle').textContent         = updData ? `Sticker #${updData.num} — Preview` : 'Sticker Preview';
  document.getElementById('modalEditPane').style.display    = 'none';
  document.getElementById('modalPreviewPane').style.display = '';
  if (updData) renderModalPreview(updData);
  setStatus(`✅ Sticker #${edited.num} updated.`, '#1e6e3d');
}

function closeModal(e) {
  if (e && e.target !== document.getElementById('stickerModal')) return;
  document.getElementById('stickerModal').classList.remove('open');
  document.getElementById('modalBody').innerHTML = '';
  openModalIndex = null;
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

function deleteCurrentSticker() {
  if (openModalIndex === null) return;
  const data = (pages[currentPageIdx] || [])[openModalIndex];
  if (!data) return;
  if (!confirm(`Delete Sticker #${data.num} from this page?\n(History is preserved)`)) return;
  pages[currentPageIdx].splice(openModalIndex, 1);
  savePages();
  document.getElementById('stickerModal').classList.remove('open');
  document.getElementById('modalBody').innerHTML = '';
  openModalIndex = null;
  renderPage();
  setStatus(`🗑 Sticker #${data.num} removed. History preserved.`, '#c0392b');
}


// ── History ──────────────────────────────────────

function renderHistory(data) {
  data = data || stickerHistory;
  document.getElementById('historyCount').textContent =
    `${stickerHistory.length} record${stickerHistory.length !== 1 ? 's' : ''}`;

  const thead = document.getElementById('historyHead');
  if (thead) {
    thead.innerHTML = HISTORY_COLS.map((c, i) =>
      `<th${i === 0 ? ' class="col-num"' : ''}>${escHtml(c.label)}</th>`).join('');
  }

  const tbody   = document.getElementById('historyBody');
  const colSpan = HISTORY_COLS.length;

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${colSpan}" class="history-empty">No stickers created yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map(s => {
    const cells = HISTORY_COLS.map((c, i) => {
      if (c.key === 'status') return `<td><span class="badge-printed">PRINTED</span></td>`;
      let val = s[c.key] || '—';
      if (c.key === 'acqdate' && val !== '—') val = formatDateLong(val);
      val = escHtml(val);
      return `<td${i === 0 ? ' class="num-col"' : ''} title="${val}">${val}</td>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('');
}

function filterHistory() {
  const q = document.getElementById('historySearch').value.toLowerCase();
  if (!q) { renderHistory(); return; }
  renderHistory(stickerHistory.filter(s =>
    Object.values(s).some(val => String(val).toLowerCase().includes(q))));
}


// ── View switcher ────────────────────────────────

function switchView(viewId) {
  const printView   = document.getElementById('view-print');
  const historyView = document.getElementById('view-history');
  const tabPrint    = document.getElementById('tabPrint');
  const tabHistory  = document.getElementById('tabHistory');
  const searchWrap  = document.getElementById('searchWrap');
  const formPanel   = document.getElementById('stickerFormPanel');

  if (viewId === 'history') {
    printView.classList.remove('active');
    historyView.classList.add('active');
    tabPrint.classList.remove('active');
    tabHistory.classList.add('active');
    if (searchWrap) searchWrap.style.display = 'none';
    if (formPanel)  formPanel.style.display  = 'none';
    renderHistory();
  } else {
    historyView.classList.remove('active');
    printView.classList.add('active');
    tabHistory.classList.remove('active');
    tabPrint.classList.add('active');
    if (searchWrap) searchWrap.style.display = '';
    if (formPanel)  formPanel.style.display  = '';
  }
}


// ── Print helpers ────────────────────────────────

let _removedEmptyStickers = [];
let _printGridWrapper     = null;

window.addEventListener('beforeprint', () => {
  const pv = document.getElementById('view-print');
  const hv = document.getElementById('view-history');
  if (pv) pv.classList.add('active');
  if (hv) hv.classList.remove('active');

  const a4 = document.getElementById('a4Page');
  if (!a4) return;

  _removedEmptyStickers = [];
  a4.querySelectorAll('.sticker.empty').forEach(el => {
    _removedEmptyStickers.push({ el, parent: el.parentNode, nextSibling: el.nextSibling });
    el.parentNode.removeChild(el);
  });

  const filled = Array.from(a4.querySelectorAll('.sticker'));
  if (filled.length > 0) {
    _printGridWrapper = document.createElement('div');
    _printGridWrapper.className = 'sticker-print-grid';
    a4.insertBefore(_printGridWrapper, filled[0]);
    filled.forEach(el => _printGridWrapper.appendChild(el));
  }
});

window.addEventListener('afterprint', () => {
  const a4 = document.getElementById('a4Page');
  if (!a4) return;

  if (_printGridWrapper && _printGridWrapper.parentNode) {
    const parent = _printGridWrapper.parentNode;
    while (_printGridWrapper.firstChild)
      parent.insertBefore(_printGridWrapper.firstChild, _printGridWrapper);
    parent.removeChild(_printGridWrapper);
    _printGridWrapper = null;
  }

  _removedEmptyStickers.forEach(({ el, parent, nextSibling }) => {
    if (nextSibling && nextSibling.parentNode === parent) parent.insertBefore(el, nextSibling);
    else parent.appendChild(el);
  });
  _removedEmptyStickers = [];
});


// ── Init — waits for layout.js shell ────────────

document.addEventListener('amis:layout-ready', () => {
  if (!pages || pages.length === 0) pages = [[]];
  currentPageIdx = 0;
  renderPage();
});
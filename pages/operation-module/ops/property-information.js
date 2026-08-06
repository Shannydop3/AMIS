/* ops/property-information.js */
window.OP_VIEWS = window.OP_VIEWS || {};
window.OP_VIEWS['property-information'] = {
  label:'Property Information', group:'Receiving & Tagging',
  columns:['Property No.','Description','Unit Cost','Date Acquired','Condition','Accountable Officer','Region','Branch','Status'],
  onLoad:function(c){
    c.innerHTML=_PI_html();
    _OP_wireCards(c);_OP_wireSearch(c);_OP_wireAddBtns(c);
    _PI_wireActions(c);
    _PI_search(c);
  },
  onUnload:function(){}
};

async function _PI_search(container) {
  const client = window.AMIS_READY ? await window.AMIS_READY : null;
  const tbody = container.querySelector('#pi-results-tbody');
  if (!tbody) return;
  if (!client) {
    tbody.innerHTML = '<tr><td colspan="13" class="dash-empty">Database not configured.</td></tr>';
    return;
  }

  const propNo = (document.getElementById('pi-prop-no')||{}).value?.trim();
  const itemCode = (document.getElementById('pi-item-code')||{}).value?.trim();
  const region  = (document.getElementById('pi-region')||{}).value;
  const branch  = (document.getElementById('pi-branch')||{}).value;
  const statusV = (document.getElementById('pi-status')||{}).value;

  tbody.innerHTML = '<tr><td colspan="13" class="dash-empty">Searching…</td></tr>';
  try {
    let q = client
      .from('property_records')
      .select('id, item_code, property_number, description, serial_number, acquired_cost, date_of_acquisition, status, brand:brands(name), model:models(name), classification:classifications(name), region:regions(name), branch:branches(name), assignee:profiles!property_records_assigned_to_fkey(full_name,email)')
      .order('created_at', { ascending: false })
      .limit(200);
    if (propNo)   q = q.ilike('property_number', '%' + propNo + '%');
    if (itemCode) q = q.ilike('item_code', '%' + itemCode + '%');
    if (statusV)  q = q.eq('status', statusV);
    // Region/branch filters require joining to the FK. Client-side filter after fetch is simpler.
    const { data, error } = await q;
    if (error) throw error;
    let rows = data || [];
    if (region) rows = rows.filter(r => r.region?.name === region);
    if (branch) rows = rows.filter(r => r.branch?.name === branch);

    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="13" class="dash-empty">No property records match your filters.</td></tr>';
      return;
    }
    tbody.innerHTML = rows.map(r => {
      const officer = r.assignee ? (r.assignee.full_name || r.assignee.email) : 'NA';
      return `<tr>
        <td>${r.property_number || '—'}</td>
        <td>${r.item_code || '—'}</td>
        <td class="dash-truncate">${r.description || '—'}</td>
        <td>${r.classification?.name || '—'}</td>
        <td>${r.brand?.name || '—'}</td>
        <td class="dash-truncate">${r.model?.name || '—'}</td>
        <td>${r.serial_number || 'NA'}</td>
        <td>${officer}</td>
        <td>${r.region?.name || '—'}</td>
        <td>${r.branch?.name || '—'}</td>
        <td>${_PI_statusPill(r.status)}</td>
        <td>${r.date_of_acquisition || '—'}</td>
        <td><div class="op-row-btns">
          <button class="op-row-btn op-row-btn--view" onclick="Toast.show('Detail modal coming soon.','info')">${_icon('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>')}</button>
        </div></td>
      </tr>`;
    }).join('');
  } catch (err) {
    console.error('[pi] search failed', err);
    tbody.innerHTML = '<tr><td colspan="13" class="dash-empty">Search failed: ' + (err.message || err) + '</td></tr>';
  }
}

function _PI_statusPill(s) {
  const cls = {
    'Active': 'dash-pill--blue',
    'Issued': 'dash-pill--green',
    'Returned': 'dash-pill--amber',
    'Maintenance': 'dash-pill--red',
    'Disposed': 'dash-pill--red'
  }[s] || '';
  return `<span class="dash-pill ${cls}">${s || '—'}</span>`;
}

function _PI_wireActions(container) {
  const searchBtn = container.querySelector('#pi-search-btn');
  const clearBtn  = container.querySelector('#pi-clear-btn');
  if (searchBtn) searchBtn.addEventListener('click', () => _PI_search(container));
  if (clearBtn) clearBtn.addEventListener('click', () => {
    container.querySelectorAll('#pi-search input, #pi-search select').forEach(el => {
      if (el.tagName === 'SELECT') el.selectedIndex = 0;
      else el.value = '';
    });
    _PI_search(container);
  });
}

function _PI_html(){return`
<style>${_OP_sharedCSS()}</style>
${_card('pi-search','<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>','Search Property','',`
  <div class="op-form-grid">
    <div>
      ${_field('Property No.','text','pi-prop-no','Enter property number')}
      ${_field('Item Code','text','pi-item-code','Enter item code')}
      ${_fieldSelect('Classification','pi-class',['LAPTOP','PRINTER','MONITOR','SWITCHGEAR','SERVER','PROJECTOR','CAMERA'],'Select Classification')}
    </div>
    <div>
      ${_fieldSelect('Region','pi-region',_REGIONS,'Select Region')}
      ${_fieldSelect('Branch','pi-branch',_BRANCHES,'Select Branch')}
      ${_fieldSelect('Status','pi-status',['Active','Issued','Returned','Maintenance','Disposed'],'Select Status')}
    </div>
  </div>
  <div style="margin-top:12px;display:flex;gap:8px;">
    <button class="op-btn op-btn--primary" id="pi-search-btn">${_icon('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>')} Search</button>
    <button class="op-btn op-btn--secondary" id="pi-clear-btn">${_icon('<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>')} Clear</button>
  </div>
`,true)}
${_card('pi-results','<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>','Property Records','',`
  ${_tableToolbar('pi-search-inp')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" id="pi-results-tbl" style="min-width:1100px;">
      <thead><tr><th>Property No.</th><th>Item Code</th><th>Description</th><th>Classification</th><th>Brand</th><th>Model</th><th>Serial No.</th><th>Accountable Officer</th><th>Region</th><th>Branch</th><th>Status</th><th>Date Acquired</th><th>Actions</th></tr></thead>
      <tbody id="pi-results-tbody"><tr><td colspan="13" class="dash-empty">Loading…</td></tr></tbody>
    </table>
  </div>
  ${_tableFooter('pi')}
`)}`;
}


window.OP_VIEWS=window.OP_VIEWS||{};
window.OP_VIEWS['property-transfer']={label:'Property Transfer',group:'Transfer & Return',
columns:['Transfer No.','Property No.','Description','Date Transferred','From','To','Approved By','Status'],
onLoad:function(c){
  c.innerHTML=_PTRANS_html();
  _OP_wireCards(c);_OP_wireSearch(c);_OP_wireAddBtns(c);
  _PTRANS_wireActions(c);
  _PTRANS_loadAvailable(c);
  _PTRANS_loadHistory(c);
},onUnload:function(){}};

async function _PTRANS_loadAvailable(container) {
  const client = window.AMIS_READY ? await window.AMIS_READY : null;
  const tbody = container.querySelector('#ptrans-items-tbody');
  if (!tbody) return;
  if (!client) { tbody.innerHTML = '<tr><td colspan="9" class="dash-empty">Database not configured.</td></tr>'; return; }
  try {
    const { data, error } = await client
      .from('property_records')
      .select('id, item_code, property_number, description, serial_number, brand:brands(name), model:models(name), office:offices(name), assignee:profiles!property_records_assigned_to_fkey(full_name,email)')
      .eq('status', 'Issued')
      .order('property_number');
    if (error) throw error;
    if (!data.length) { tbody.innerHTML = '<tr><td colspan="9" class="dash-empty">No issued properties available for transfer.</td></tr>'; return; }
    tbody.innerHTML = data.map(r => `
      <tr data-prop-id="${r.id}">
        <td><input type="checkbox" class="ptrans-check" data-prop-id="${r.id}"></td>
        <td><strong>${r.property_number || '—'}</strong></td>
        <td>${r.item_code || '—'}</td>
        <td>${r.description || '—'}</td>
        <td>${r.brand?.name || '—'}</td>
        <td>${r.model?.name || '—'}</td>
        <td>${r.serial_number || '—'}</td>
        <td>${r.assignee ? (r.assignee.full_name || r.assignee.email) : '—'}</td>
        <td>${r.office?.name || '—'}</td>
      </tr>`).join('');
    container.addEventListener('change', (e) => {
      if (e.target.classList.contains('ptrans-check')) {
        const n = container.querySelectorAll('.ptrans-check:checked').length;
        const pill = container.querySelector('.op-count-num');
        if (pill) pill.textContent = String(n);
      }
    });
  } catch (err) {
    console.error('[ptrans] load failed', err);
    tbody.innerHTML = '<tr><td colspan="9" class="dash-empty">Failed to load: ' + (err.message || err) + '</td></tr>';
  }
}

function _PTRANS_wireActions(container) {
  const saveBtn = container.querySelector('#ptrans-save');
  const resetBtn = container.querySelector('#ptrans-reset');
  if (saveBtn) saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    try {
      const num = (document.getElementById('ptrans-no')||{}).value ||
                  ('TR-' + new Date().getFullYear() + '-' + Date.now().toString().slice(-6));
      const client = await window.AMIS_READY;
      if (!client) throw new Error('Database not configured.');

      const byId       = _OP_REF_IDS.profiles?.[(document.getElementById('ptrans-by')||{}).value] || null;
      const fromOfcId  = _OP_REF_IDS.offices?.[(document.getElementById('ptrans-from-office')||{}).value] || null;
      const toOfcId    = _OP_REF_IDS.offices?.[(document.getElementById('ptrans-to-office')||{}).value] || null;
      const toOfficer  = _OP_REF_IDS.profiles?.[(document.getElementById('ptrans-to-officer')||{}).value] || null;

      const { data: header, error: hErr } = await client
        .from('property_transfers')
        .insert({
          transfer_number: num,
          transacted_by:   byId,
          from_office_id:  fromOfcId,
          to_office_id:    toOfcId,
          status:          'Approved',
          remarks:         (document.getElementById('ptrans-remarks')||{}).value || null
        })
        .select()
        .single();
      if (hErr) throw hErr;

      const picked = Array.from(container.querySelectorAll('.ptrans-check:checked')).map(cb => cb.dataset.propId);
      if (picked.length) {
        const items = picked.map(pid => ({ transfer_id: header.id, property_record_id: pid }));
        const { error: iErr } = await client.from('property_transfer_items').insert(items);
        if (iErr) throw iErr;
        const patch = {};
        if (toOfcId)   patch.office_id   = toOfcId;
        if (toOfficer) patch.assigned_to = toOfficer;
        if (Object.keys(patch).length) {
          const { error: uErr } = await client.from('property_records').update(patch).in('id', picked);
          if (uErr) throw uErr;
        }
      }

      Toast.show('Transfer saved (' + picked.length + ' property record(s)).', 'success');
      _PTRANS_loadHistory(container);
      _PTRANS_loadAvailable(container);
    } catch (err) {
      console.error('[ptrans] save failed', err);
      Toast.show(err.message || 'Failed to save transfer.', 'error');
    } finally {
      saveBtn.disabled = false;
    }
  });
  if (resetBtn) resetBtn.addEventListener('click', () => {
    container.querySelectorAll('.op-control').forEach(el => {
      if (el.readOnly) return;
      if (el.tagName === 'SELECT') { el.selectedIndex = 0; return; }
      el.value = '';
    });
    container.querySelectorAll('.ptrans-check').forEach(cb => cb.checked = false);
    Toast.show('Form reset.', 'info', 1500);
  });
}

function _PTRANS_loadHistory(container) {
  return _OP_loadHistory({
    table: 'property_transfers',
    container: container,
    tbodyId: 'ptrans-rec-tbody',
    columns: ['Transfer No.','Date','From','To','Transacted By','Status','Created'],
    select: 'id, transfer_number, transferred_at, status, remarks, created_at, from_office:offices!property_transfers_from_office_id_fkey(name), to_office:offices!property_transfers_to_office_id_fkey(name), actor:profiles!property_transfers_transacted_by_fkey(full_name,email)',
    rowFn: r => [
      '<strong>' + (r.transfer_number || '—') + '</strong>',
      r.transferred_at || '—',
      r.from_office?.name || '—',
      r.to_office?.name || '—',
      r.actor ? (r.actor.full_name || r.actor.email) : '—',
      r.status || '—',
      new Date(r.created_at).toLocaleDateString()
    ]
  });
}

function _PTRANS_html(){return`<style>${_OP_sharedCSS()}</style>
${_card('ptrans-det','<path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"/>','Transfer Details','',`
  <p class="op-req-note">${_infoIcon()} Fields marked <strong>*</strong> are required.</p>
  <div class="op-form-grid">
    <div>
      ${_field('Transfer No.','text','ptrans-no','Auto-generated',false,true)}
      ${_field('Date Transferred','text','ptrans-date','',false,true,new Date().toLocaleDateString('en-US'))}
      <div class="op-section-label">Transfer From</div>
      ${_fieldSelect('From Region','ptrans-from-region',_REGIONS,'Select Region',true,true)}
      ${_fieldSelect('From Branch','ptrans-from-branch',_BRANCHES,'Select Branch',true,true)}
      ${_fieldSelect('From Office','ptrans-from-office',_OFFICES,'Select Office',false,true)}
      ${_fieldSelect('Current Accountable Officer','ptrans-from-officer',_USERS,'Select Officer',true,true)}
      ${_fieldTextarea('Remarks','ptrans-remarks','Enter transfer notes…')}
    </div>
    <div>
      <div class="op-section-label">Transfer To</div>
      ${_fieldSelect('To Region','ptrans-to-region',_REGIONS,'Select Region',true,true)}
      ${_fieldSelect('To Branch','ptrans-to-branch',_BRANCHES,'Select Branch',true,true)}
      ${_fieldSelect('To Office','ptrans-to-office',_OFFICES,'Select Office',false,true)}
      ${_fieldSelect('New Accountable Officer','ptrans-to-officer',_USERS,'Select Officer',true,true)}
      <div class="op-section-label">Approval</div>
      ${_fieldSelect('Approved By','ptrans-approver',_USERS,'Select Approver',true,true)}
      ${_fieldSelect('Transferred By','ptrans-by',_USERS,'Select Personnel',true,true)}
    </div>
  </div>
`,true)}

<div class="op-action-bar"><div class="op-action-bar__left">
  <button class="op-btn op-btn--primary" id="ptrans-save">${_icon('<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>')} Save Transfer</button>
  <button class="op-btn op-btn--secondary" id="ptrans-reset">${_icon('<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>')} Reset</button>
</div><div class="op-action-bar__right"><span class="op-count-pill">${_icon('<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/>')} <span class="op-count-num">0</span> Item(s) Selected</span></div></div>
${_card('ptrans-items','<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>','Select Properties to Transfer','',`
  <div class="op-instruction">${_icon('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>')} Only "Issued" properties are eligible for transfer.</div>
  ${_tableToolbar('ptrans-items-srch')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" id="ptrans-items-tbl" style="min-width:900px;">
      <thead><tr><th style="width:36px"></th><th>Property No.</th><th>Item Code</th><th>Description</th><th>Brand</th><th>Model</th><th>Serial No.</th><th>Accountable Officer</th><th>Current Location</th></tr></thead>
      <tbody id="ptrans-items-tbody"><tr><td colspan="9" class="dash-empty">Loading…</td></tr></tbody>
    </table>
  </div>${_tableFooter('ptrans-items')}
`)}
${_card('ptrans-rec','<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>','Records','',`
  ${_tableToolbar('ptrans-rec-srch')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" style="min-width:900px;">
      <thead><tr><th>Transfer No.</th><th>Date</th><th>From</th><th>To</th><th>Transacted By</th><th>Status</th><th>Created</th></tr></thead>
      <tbody id="ptrans-rec-tbody"><tr><td colspan="7" class="dash-empty">Loading…</td></tr></tbody>
    </table>
  </div>${_tableFooter('ptrans-rec')}
`)}`;}

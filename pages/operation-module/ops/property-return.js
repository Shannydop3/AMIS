
window.OP_VIEWS=window.OP_VIEWS||{};
window.OP_VIEWS['property-return']={label:'Property Return',group:'Transfer & Return',
columns:['Return No.','Property No.','Description','Date Returned','Returned By','Received By','Condition','Status'],
onLoad:function(c){
  c.innerHTML=_PRET_html();
  _OP_wireCards(c);_OP_wireSearch(c);_OP_wireAddBtns(c);
  _PRET_wireActions(c);
  _PRET_loadAvailable(c);
  _PRET_loadHistory(c);
},onUnload:function(){}};

async function _PRET_loadAvailable(container) {
  const client = window.AMIS_READY ? await window.AMIS_READY : null;
  const tbody = container.querySelector('#pret-items-tbody');
  if (!tbody) return;
  if (!client) { tbody.innerHTML = '<tr><td colspan="9" class="dash-empty">Database not configured.</td></tr>'; return; }
  try {
    const { data, error } = await client
      .from('property_records')
      .select('id, item_code, property_number, description, serial_number, issued_date, brand:brands(name), model:models(name)')
      .eq('status', 'Issued')
      .order('property_number');
    if (error) throw error;
    if (!data.length) { tbody.innerHTML = '<tr><td colspan="9" class="dash-empty">No issued properties found.</td></tr>'; return; }
    tbody.innerHTML = data.map(r => `
      <tr data-prop-id="${r.id}">
        <td><input type="checkbox" class="pret-check" data-prop-id="${r.id}"></td>
        <td><strong>${r.property_number || '—'}</strong></td>
        <td>${r.item_code || '—'}</td>
        <td>${r.description || '—'}</td>
        <td>${r.brand?.name || '—'}</td>
        <td>${r.model?.name || '—'}</td>
        <td>${r.serial_number || '—'}</td>
        <td>${r.issued_date || '—'}</td>
        <td>—</td>
      </tr>`).join('');
    container.addEventListener('change', (e) => {
      if (e.target.classList.contains('pret-check')) {
        const n = container.querySelectorAll('.pret-check:checked').length;
        const pill = container.querySelector('.op-count-num');
        if (pill) pill.textContent = String(n);
      }
    });
  } catch (err) {
    console.error('[pret] load failed', err);
    tbody.innerHTML = '<tr><td colspan="9" class="dash-empty">Failed to load: ' + (err.message || err) + '</td></tr>';
  }
}

function _PRET_wireActions(container) {
  const saveBtn = container.querySelector('#pret-save');
  const resetBtn = container.querySelector('#pret-reset');
  if (saveBtn) saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    try {
      const num = (document.getElementById('pret-no')||{}).value ||
                  ('PR-' + new Date().getFullYear() + '-' + Date.now().toString().slice(-6));
      const client = await window.AMIS_READY;
      if (!client) throw new Error('Database not configured.');

      const byId = _OP_REF_IDS.profiles?.[(document.getElementById('pret-by')||{}).value] || null;

      const { data: header, error: hErr } = await client
        .from('property_returns')
        .insert({
          return_number: num,
          returned_by:   byId,
          status:        'Returned',
          remarks:       (document.getElementById('pret-remarks')||{}).value || null
        })
        .select()
        .single();
      if (hErr) throw hErr;

      const picked = Array.from(container.querySelectorAll('.pret-check:checked')).map(cb => cb.dataset.propId);
      if (picked.length) {
        const items = picked.map(pid => ({ return_id: header.id, property_record_id: pid }));
        const { error: iErr } = await client.from('property_return_items').insert(items);
        if (iErr) throw iErr;
        const { error: uErr } = await client
          .from('property_records')
          .update({ status: 'Active', assigned_to: null })
          .in('id', picked);
        if (uErr) throw uErr;
      }

      Toast.show('Return saved (' + picked.length + ' property record(s)).', 'success');
      _PRET_loadHistory(container);
      _PRET_loadAvailable(container);
    } catch (err) {
      console.error('[pret] save failed', err);
      Toast.show(err.message || 'Failed to save return.', 'error');
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
    container.querySelectorAll('.pret-check').forEach(cb => cb.checked = false);
    Toast.show('Form reset.', 'info', 1500);
  });
}

function _PRET_loadHistory(container) {
  return _OP_loadHistory({
    table: 'property_returns',
    container: container,
    tbodyId: 'pret-rec-tbody',
    columns: ['Return No.','Date','Returned By','Status','Remarks','Created'],
    select: 'id, return_number, returned_at, status, remarks, created_at, actor:profiles!property_returns_returned_by_fkey(full_name,email)',
    rowFn: r => [
      '<strong>' + (r.return_number || '—') + '</strong>',
      r.returned_at || '—',
      r.actor ? (r.actor.full_name || r.actor.email) : '—',
      r.status || '—',
      (r.remarks || '').slice(0, 60),
      new Date(r.created_at).toLocaleDateString()
    ]
  });
}

function _PRET_html(){return`<style>${_OP_sharedCSS()}</style>
${_card('pret-det','<path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>','Property Return Details','',`
  <p class="op-req-note">${_infoIcon()} Fields marked <strong>*</strong> are required.</p>
  <div class="op-form-grid">
    <div>
      ${_field('Return No.','text','pret-no','Auto-generated',false,true)}
      ${_field('Date Returned','text','pret-date','',false,true,new Date().toLocaleDateString('en-US'))}
      ${_fieldSelect('Returned By','pret-by',_USERS,'Select Personnel',true,true)}
      ${_fieldSelect('Received By','pret-received',_USERS,'Select Receiver',true,true)}
      ${_fieldSelect('Region','pret-region',_REGIONS,'Select Region',true,true)}
      ${_fieldSelect('Branch','pret-branch',_BRANCHES,'Select Branch',true,true)}
    </div>
    <div>
      ${_fieldSelect('Condition','pret-condition',['Good','Fair','Poor','For Repair','Damaged','Disposed'],'Select Condition',true,false)}
      ${_fieldSelect('Return Reason','pret-reason',['End of Employment','Transfer of Assignment','Voluntary Return','Equipment Upgrade','Damaged/Defective'],'Select Reason',true,false)}
      ${_fieldSelect('Approver','pret-approver',_USERS,'Select Approver',true,true)}
      ${_fieldTextarea('Remarks','pret-remarks','Enter return notes…')}
    </div>
  </div>
`,true)}

<div class="op-action-bar"><div class="op-action-bar__left">
  <button class="op-btn op-btn--primary" id="pret-save">${_icon('<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>')} Save Return</button>
  <button class="op-btn op-btn--secondary" id="pret-reset">${_icon('<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>')} Reset</button>
</div><div class="op-action-bar__right"><span class="op-count-pill">${_icon('<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/>')} <span class="op-count-num">0</span> Item(s) Selected</span></div></div>
${_card('pret-items','<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>','Select Properties to Return','',`
  <div class="op-instruction">${_icon('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>')} Only "Issued" properties can be returned.</div>
  ${_tableToolbar('pret-items-srch')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" id="pret-items-tbl" style="min-width:900px;">
      <thead><tr><th style="width:36px"></th><th>Property No.</th><th>Item Code</th><th>Description</th><th>Brand</th><th>Model</th><th>Serial No.</th><th>Date Issued</th><th>ICS No.</th></tr></thead>
      <tbody id="pret-items-tbody"><tr><td colspan="9" class="dash-empty">Loading…</td></tr></tbody>
    </table>
  </div>${_tableFooter('pret-items')}
`)}
${_card('pret-rec','<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>','Records','',`
  ${_tableToolbar('pret-rec-srch')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" style="min-width:800px;">
      <thead><tr><th>Return No.</th><th>Date</th><th>Returned By</th><th>Status</th><th>Remarks</th><th>Created</th></tr></thead>
      <tbody id="pret-rec-tbody"><tr><td colspan="6" class="dash-empty">Loading…</td></tr></tbody>
    </table>
  </div>${_tableFooter('pret-rec')}
`)}`;}

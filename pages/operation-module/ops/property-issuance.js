window.OP_VIEWS=window.OP_VIEWS||{};
window.OP_VIEWS['property-issuance']={label:'Property Issuance',group:'Issuance',columns:['ICS No.','Property No.','Description','Date Issued','Issued To','Issued By','Quantity','Unit Cost','Status'],
onLoad:function(c){
  c.innerHTML=_PISS_html();
  _OP_wireCards(c);_OP_wireSearch(c);_OP_wireAddBtns(c);
  _PISS_wireActions(c);
  _PISS_loadAvailableProperties(c);
  _PISS_loadHistory(c);
},onUnload:function(){}};

async function _PISS_loadAvailableProperties(container) {
  const client = window.AMIS_READY ? await window.AMIS_READY : null;
  const tbody = container.querySelector('#piss-items-tbl tbody');
  if (!tbody) return;
  if (!client) {
    tbody.innerHTML = '<tr><td colspan="9" class="dash-empty">Database not configured.</td></tr>';
    return;
  }
  try {
    const { data, error } = await client
      .from('property_records')
      .select('id, item_code, property_number, description, serial_number, acquired_cost, brand:brands(name), model:models(name), classification:classifications(name)')
      .eq('status', 'Active')
      .order('property_number');
    if (error) throw error;
    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="9" class="dash-empty">No properties with status "Active" available. Receive property via Goods Receive first.</td></tr>';
      return;
    }
    tbody.innerHTML = data.map(r => `
      <tr data-prop-id="${r.id}">
        <td><input type="checkbox" class="piss-check" data-prop-id="${r.id}"></td>
        <td>${r.item_code || '—'}</td>
        <td><strong>${r.property_number || '—'}</strong></td>
        <td>${r.description || '—'}</td>
        <td>${r.brand?.name || '—'}</td>
        <td>${r.model?.name || '—'}</td>
        <td>${r.serial_number || '—'}</td>
        <td>${r.acquired_cost != null ? r.acquired_cost : '—'}</td>
        <td>${r.classification?.name || '—'}</td>
      </tr>`).join('');
    container.addEventListener('change', (e) => {
      if (e.target.classList.contains('piss-check')) {
        const n = container.querySelectorAll('.piss-check:checked').length;
        const pill = container.querySelector('.op-count-num');
        if (pill) pill.textContent = String(n);
      }
    });
  } catch (err) {
    console.error('[piss] load failed', err);
    tbody.innerHTML = '<tr><td colspan="9" class="dash-empty">Failed to load: ' + (err.message || err) + '</td></tr>';
  }
}

function _PISS_wireActions(container) {
  const saveBtn = container.querySelector('#piss-save');
  const resetBtn = container.querySelector('#piss-reset');
  if (saveBtn) saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    try {
      const num = (document.getElementById('piss-ics') || {}).value ||
                  ('ICS-' + new Date().getFullYear() + '-' + Date.now().toString().slice(-6));
      const client = await window.AMIS_READY;
      if (!client) throw new Error('Database not configured.');

      const issuedById = _OP_REF_IDS.profiles?.[(document.getElementById('piss-by')||{}).value] || null;
      const issuedToId = _OP_REF_IDS.profiles?.[(document.getElementById('piss-employee')||{}).value] || null;

      const { data: header, error: hErr } = await client
        .from('property_issuances')
        .insert({
          issuance_no: num,
          issued_by:   issuedById,
          issued_to:   issuedToId,
          status:      'Issued',
          remarks:     (document.getElementById('piss-remarks')||{}).value || null
        })
        .select()
        .single();
      if (hErr) throw hErr;

      const picked = Array.from(container.querySelectorAll('.piss-check:checked'))
        .map(cb => cb.dataset.propId);

      if (picked.length) {
        const items = picked.map(pid => ({
          issuance_id: header.id,
          property_record_id: pid,
          quantity: 1
        }));
        const { error: iErr } = await client.from('property_issuance_items').insert(items);
        if (iErr) throw iErr;
        const { error: uErr } = await client
          .from('property_records')
          .update({ status: 'Issued', assigned_to: issuedToId, issued_date: new Date().toISOString().slice(0,10) })
          .in('id', picked);
        if (uErr) throw uErr;
      }

      Toast.show('Issuance saved (' + picked.length + ' property record(s)).', 'success');
      _PISS_loadHistory(container);
      _PISS_loadAvailableProperties(container);
    } catch (err) {
      console.error('[piss] save failed', err);
      Toast.show(err.message || 'Failed to save issuance.', 'error');
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
    container.querySelectorAll('.piss-check').forEach(cb => cb.checked = false);
    Toast.show('Form reset.', 'info', 1500);
  });
}

function _PISS_loadHistory(container) {
  return _OP_loadHistory({
    table:     'property_issuances',
    container: container,
    tbodyId:   'piss-rec-tbody',
    columns:   ['ICS No.','Issued To','Issued By','Date','Status','Created'],
    select:    'id, issuance_no, issued_at, status, remarks, created_at, recipient:profiles!property_issuances_issued_to_fkey(full_name,email), issuer:profiles!property_issuances_issued_by_fkey(full_name,email)',
    rowFn: r => [
      '<strong>' + (r.issuance_no || '—') + '</strong>',
      r.recipient ? (r.recipient.full_name || r.recipient.email) : '—',
      r.issuer    ? (r.issuer.full_name || r.issuer.email) : '—',
      r.issued_at || '—',
      r.status || '—',
      new Date(r.created_at).toLocaleDateString()
    ]
  });
}

function _PISS_html(){return`<style>${_OP_sharedCSS()}</style>
${_card('piss-det','<path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>','Property Issuance Details','',`
  <p class="op-req-note">${_infoIcon()} Fields marked <strong>*</strong> are required.</p>
  <div class="op-form-grid">
    <div>
      ${_field('ICS No.','text','piss-ics','Leave blank to auto-generate',false)}
      ${_fieldSelect('Custodian Type','piss-custodian',_CUSTODIAN_TYPES,'Select Custodian Type',true,false)}
      ${_fieldSelect('Property Type','piss-type',['PPE','SEP','Common-Use'],'Select Type',true,false)}
      ${_fieldSelect('Issued By','piss-by',_USERS,'Select Personnel',true,true)}
      ${_fieldSelect('Region','piss-region',_REGIONS,'Select Region',true,true)}
      ${_fieldSelect('Branch','piss-branch',_BRANCHES,'Select Branch',true,true)}
      ${_fieldSelect('Office','piss-office',_OFFICES,'Select Office',false,true)}
      ${_fieldTextarea('Remarks','piss-remarks','Enter remarks…')}
    </div>
    <div>
      ${_fieldDate('Date Issued','piss-date',false,new Date().toISOString().slice(0,10))}
      <div class="op-section-label">Recipient Information</div>
      ${_fieldSelect('User Department','piss-dept',['IMB','OBD','GSD','ICT'],'Select Department',true,true)}
      ${_fieldSelect('Employee','piss-employee',_USERS,'Select Employee',true,true)}
      ${_field('First Name','text','piss-fname','Auto-filled',false,true)}
      ${_field('Last Name','text','piss-lname','Auto-filled',false,true)}
      ${_field('Employee No.','text','piss-empno','Auto-filled',false,true)}
      ${_field('Job Title','text','piss-jobtitle','Auto-filled',false,true)}
      ${_field('E-mail','email','piss-email','Auto-filled',false,true)}
      <div class="op-section-label">Flags</div>
      <div class="op-fg"><label class="op-label">Is Custodian:</label><div class="op-toggle-wrap"><label class="op-toggle"><input type="checkbox" id="piss-cust"><span class="op-toggle-slider"></span></label><span class="op-toggle-label">No</span></div></div>
      <div class="op-fg"><label class="op-label">Is Approver:</label><div class="op-toggle-wrap"><label class="op-toggle"><input type="checkbox" id="piss-appr"><span class="op-toggle-slider"></span></label><span class="op-toggle-label">No</span></div></div>
    </div>
  </div>
`,true)}
<div class="op-action-bar"><div class="op-action-bar__left">
  <button class="op-btn op-btn--primary" id="piss-save">${_icon('<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>')} Save Issuance</button>
  <button class="op-btn op-btn--secondary" id="piss-reset">${_icon('<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>')} Reset</button>
</div><div class="op-action-bar__right">
  <span class="op-count-pill">${_icon('<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/>')} <span class="op-count-num">0</span> Item(s) Selected</span>
</div></div>
${_card('piss-items','<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>','Select Properties to Issue','',`
  <div class="op-instruction">${_icon('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>')} Only properties with status "Active" are available for issuance.</div>
  ${_tableToolbar('piss-items-srch')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" id="piss-items-tbl" style="min-width:900px;">
      <thead><tr><th style="width:36px"></th><th>Item Code</th><th>Property No.</th><th>Description</th><th>Brand</th><th>Model</th><th>Serial No.</th><th>Acquired Cost</th><th>Classification</th></tr></thead>
      <tbody><tr><td colspan="9" class="dash-empty">Loading…</td></tr></tbody>
    </table>
  </div>${_tableFooter('piss-items')}
`)}
${_card('piss-rec','<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>','List of Issuance Records','',`
  ${_tableToolbar('piss-rec-srch')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" style="min-width:700px;">
      <thead><tr><th>ICS No.</th><th>Issued To</th><th>Issued By</th><th>Date</th><th>Status</th><th>Created</th></tr></thead>
      <tbody id="piss-rec-tbody"><tr><td colspan="6" class="dash-empty">Loading…</td></tr></tbody>
    </table>
  </div>${_tableFooter('piss-rec')}
`)}`;}

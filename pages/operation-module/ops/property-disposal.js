
window.OP_VIEWS=window.OP_VIEWS||{};
window.OP_VIEWS['property-disposal']={label:'Property Disposal',group:'Disposal',
columns:['Disposal No.','Property No.','Description','Date Disposed','Method','Appraised Value','Disposed By','Approved By','Status'],
onLoad:function(c){
  c.innerHTML=_PDISP_html();
  _OP_wireCards(c);_OP_wireSearch(c);_OP_wireAddBtns(c);
  _PDISP_wireActions(c);
  _PDISP_loadAvailable(c);
  _PDISP_loadHistory(c);
},onUnload:function(){}};

async function _PDISP_loadAvailable(container) {
  const client = window.AMIS_READY ? await window.AMIS_READY : null;
  const tbody = container.querySelector('#pdisp-items-tbody');
  if (!tbody) return;
  if (!client) { tbody.innerHTML = '<tr><td colspan="10" class="dash-empty">Database not configured.</td></tr>'; return; }
  try {
    const { data, error } = await client
      .from('property_records')
      .select('id, item_code, property_number, description, serial_number, acquired_cost, status, brand:brands(name), model:models(name)')
      .in('status', ['Active','Returned','Maintenance'])
      .order('property_number');
    if (error) throw error;
    if (!data.length) { tbody.innerHTML = '<tr><td colspan="10" class="dash-empty">No properties eligible for disposal.</td></tr>'; return; }
    tbody.innerHTML = data.map(r => `
      <tr data-prop-id="${r.id}">
        <td><input type="checkbox" class="pdisp-check" data-prop-id="${r.id}"></td>
        <td>—</td>
        <td><strong>${r.property_number || '—'}</strong></td>
        <td>${r.item_code || '—'}</td>
        <td>${r.description || '—'}</td>
        <td>${r.brand?.name || '—'}</td>
        <td>${r.model?.name || '—'}</td>
        <td>${r.serial_number || '—'}</td>
        <td>${r.acquired_cost != null ? r.acquired_cost : '—'}</td>
        <td>${r.status || '—'}</td>
      </tr>`).join('');
    container.addEventListener('change', (e) => {
      if (e.target.classList.contains('pdisp-check')) {
        const n = container.querySelectorAll('.pdisp-check:checked').length;
        const pill = container.querySelector('.op-count-num');
        if (pill) pill.textContent = String(n);
      }
    });
  } catch (err) {
    console.error('[pdisp] load failed', err);
    tbody.innerHTML = '<tr><td colspan="10" class="dash-empty">Failed to load: ' + (err.message || err) + '</td></tr>';
  }
}

function _PDISP_wireActions(container) {
  const saveBtn = container.querySelector('#pdisp-save');
  const resetBtn = container.querySelector('#pdisp-reset');
  if (saveBtn) saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    try {
      const num = (document.getElementById('pdisp-no')||{}).value ||
                  ('DSP-' + new Date().getFullYear() + '-' + Date.now().toString().slice(-6));
      const client = await window.AMIS_READY;
      if (!client) throw new Error('Database not configured.');

      const byId    = _OP_REF_IDS.profiles?.[(document.getElementById('pdisp-by')||{}).value] || null;
      const reason  = (document.getElementById('pdisp-just')||{}).value || null;
      const today   = new Date().toISOString().slice(0,10);

      const { data: header, error: hErr } = await client
        .from('property_disposals')
        .insert({
          disposal_number: num,
          disposed_by:     byId,
          disposed_at:     today,
          status:          'Disposed',
          remarks:         (document.getElementById('pdisp-remarks')||{}).value || null
        })
        .select()
        .single();
      if (hErr) throw hErr;

      const picked = Array.from(container.querySelectorAll('.pdisp-check:checked')).map(cb => cb.dataset.propId);
      if (picked.length) {
        const items = picked.map(pid => ({ disposal_id: header.id, property_record_id: pid, reason: reason }));
        const { error: iErr } = await client.from('property_disposal_items').insert(items);
        if (iErr) throw iErr;
        const { error: uErr } = await client
          .from('property_records')
          .update({ status: 'Disposed', disposed_date: today })
          .in('id', picked);
        if (uErr) throw uErr;
      }

      Toast.show('Disposal saved (' + picked.length + ' property record(s)).', 'success');
      _PDISP_loadHistory(container);
      _PDISP_loadAvailable(container);
    } catch (err) {
      console.error('[pdisp] save failed', err);
      Toast.show(err.message || 'Failed to save disposal.', 'error');
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
    container.querySelectorAll('.pdisp-check').forEach(cb => cb.checked = false);
    Toast.show('Form reset.', 'info', 1500);
  });
}

function _PDISP_loadHistory(container) {
  return _OP_loadHistory({
    table: 'property_disposals',
    container: container,
    tbodyId: 'pdisp-rec-tbody',
    columns: ['Disposal No.','Date','Disposed By','Status','Remarks','Created'],
    select: 'id, disposal_number, disposed_at, status, remarks, created_at, actor:profiles!property_disposals_disposed_by_fkey(full_name,email)',
    rowFn: r => [
      '<strong>' + (r.disposal_number || '—') + '</strong>',
      r.disposed_at || '—',
      r.actor ? (r.actor.full_name || r.actor.email) : '—',
      r.status || '—',
      (r.remarks || '').slice(0, 60),
      new Date(r.created_at).toLocaleDateString()
    ]
  });
}

function _PDISP_html(){return`<style>${_OP_sharedCSS()}</style>
${_card('pdisp-det','<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>','Property Disposal Details','',`
  <p class="op-req-note">${_infoIcon()} Fields marked <strong>*</strong> are required.</p>
  <div class="op-form-grid">
    <div>
      ${_field('Disposal No.','text','pdisp-no','Auto-generated',false,true)}
      ${_field('Date of Disposal','text','pdisp-date','',false,true,new Date().toLocaleDateString('en-US'))}
      ${_fieldSelect('Disposal Method','pdisp-method',['Auction','Donation','Destruction','Recycling','Transfer to Another Agency','Trade-In','Other'],'Select Method',true,false)}
      ${_field('Appraised Value (₱)','text','pdisp-value','Enter appraised amount')}
      ${_fieldSelect('Disposed By','pdisp-by',_USERS,'Select Personnel',true,true)}
      ${_fieldSelect('Region','pdisp-region',_REGIONS,'Select Region',true,true)}
      ${_fieldSelect('Branch','pdisp-branch',_BRANCHES,'Select Branch',true,true)}
    </div>
    <div>
      ${_fieldSelect('Disposal Board Chairperson','pdisp-chair',_USERS,'Select Chairperson',false,true)}
      ${_fieldSelect('Approved By','pdisp-approver',_USERS,'Select Approver',true,true)}
      ${_field('Disposal Resolution No.','text','pdisp-resolution','Enter resolution number')}
      ${_fieldTextarea('Disposal Justification','pdisp-just','Describe the justification for disposal…',true)}
      ${_fieldTextarea('Remarks','pdisp-remarks','Enter remarks…')}
    </div>
  </div>
`,true)}
<div class="op-action-bar"><div class="op-action-bar__left">
  <button class="op-btn op-btn--primary" id="pdisp-save">${_icon('<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>')} Save Disposal</button>
  <button class="op-btn op-btn--secondary" id="pdisp-reset">${_icon('<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>')} Reset</button>
</div><div class="op-action-bar__right">
  <span class="op-count-pill" style="background:rgba(183,28,28,0.08);color:#78281f;border-color:rgba(183,28,28,0.2);">${_icon('<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>')} <span class="op-count-num" style="color:#78281f;">0</span> Item(s) for Disposal</span>
</div></div>
${_card('pdisp-items','<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>','Select Properties for Disposal','',`
  <div class="op-instruction">${_icon('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>')} Only properties approved via a Disposal Request may be selected. Verify appraised values before proceeding.</div>
  ${_tableToolbar('pdisp-items-srch')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" id="pdisp-items-tbl" style="min-width:1000px;">
      <thead><tr><th style="width:36px"></th><th>Disposal Request No.</th><th>Property No.</th><th>Item Code</th><th>Description</th><th>Brand</th><th>Model</th><th>Serial No.</th><th>Appraised Value</th><th>Status</th></tr></thead>
      <tbody id="pdisp-items-tbody"><tr><td colspan="10" class="dash-empty">Loading…</td></tr></tbody>
    </table>
  </div>${_tableFooter('pdisp-items')}
`)}
${_card('pdisp-rec','<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>','Property Disposal Records','',`
  ${_tableToolbar('pdisp-rec-srch')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" style="min-width:800px;">
      <thead><tr><th>Disposal No.</th><th>Date</th><th>Disposed By</th><th>Status</th><th>Remarks</th><th>Created</th></tr></thead>
      <tbody id="pdisp-rec-tbody"><tr><td colspan="6" class="dash-empty">Loading…</td></tr></tbody>
    </table>
  </div>${_tableFooter('pdisp-rec')}
`)}`;}

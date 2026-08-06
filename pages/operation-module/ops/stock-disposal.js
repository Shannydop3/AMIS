
window.OP_VIEWS=window.OP_VIEWS||{};
window.OP_VIEWS['stock-disposal']={label:'Stock Disposal',group:'Disposal',
columns:['Disposal No.','Stock No.','Description','Date Disposed','Quantity','Method','Reason','Disposed By','Approved By','Status'],
onLoad:function(c){
  c.innerHTML=_SDISP_html();
  _OP_wireCards(c);_OP_wireSearch(c);_OP_wireAddBtns(c);
  _SDISP_wireActions(c);
  _SDISP_loadAvailable(c);
  _SDISP_loadHistory(c);
},onUnload:function(){}};

async function _SDISP_loadAvailable(container) {
  const client = window.AMIS_READY ? await window.AMIS_READY : null;
  const tbody = container.querySelector('#sdisp-items-tbody');
  if (!tbody) return;
  if (!client) { tbody.innerHTML = '<tr><td colspan="9" class="dash-empty">Database not configured.</td></tr>'; return; }
  try {
    const { data, error } = await client
      .from('stock_records')
      .select('id, item_code, description, quantity, item_id, unit:units_of_measurement(name), item:stock_items(id, item_code, description, unit:units_of_measurement(name))')
      .gt('quantity', 0)
      .order('item_code');
    if (error) throw error;
    if (!data.length) { tbody.innerHTML = '<tr><td colspan="9" class="dash-empty">No stock on hand.</td></tr>'; return; }
    tbody.innerHTML = data.map(r => {
      const code = r.item_code || r.item?.item_code || '—';
      const desc = r.description || r.item?.description || '—';
      const unit = r.unit?.name || r.item?.unit?.name || '—';
      const avail = Number(r.quantity || 0);
      return `<tr data-stock-record-id="${r.id}" data-item-id="${r.item_id || ''}">
        <td><input type="checkbox" class="sdisp-check"></td>
        <td><span class="dash-pill dash-pill--green">${code}</span></td>
        <td>${desc}</td>
        <td>${unit}</td>
        <td>${avail}</td>
        <td><input type="number" class="dash-input sdisp-qty" style="width:70px;" min="1" max="${avail}" placeholder="0"></td>
        <td><select class="dash-select sdisp-cond"><option value="">Select…</option><option>Expired</option><option>Damaged</option><option>Fair</option></select></td>
        <td>—</td>
        <td>—</td>
      </tr>`;
    }).join('');
    container.addEventListener('change', (e) => {
      if (e.target.classList.contains('sdisp-check')) {
        const n = container.querySelectorAll('.sdisp-check:checked').length;
        const pill = container.querySelector('.op-count-num');
        if (pill) pill.textContent = String(n);
      }
    });
  } catch (err) {
    console.error('[sdisp] load failed', err);
    tbody.innerHTML = '<tr><td colspan="9" class="dash-empty">Failed to load: ' + (err.message || err) + '</td></tr>';
  }
}

function _SDISP_wireActions(container) {
  const saveBtn = container.querySelector('#sdisp-save');
  const resetBtn = container.querySelector('#sdisp-reset');
  if (saveBtn) saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    try {
      const num = (document.getElementById('sdisp-no')||{}).value ||
                  ('SDSP-' + new Date().getFullYear() + '-' + Date.now().toString().slice(-6));
      const client = await window.AMIS_READY;
      if (!client) throw new Error('Database not configured.');

      const byId  = _OP_REF_IDS.profiles?.[(document.getElementById('sdisp-by')||{}).value] || null;
      const today = new Date().toISOString().slice(0,10);

      const rows = Array.from(container.querySelectorAll('#sdisp-items-tbl tbody tr[data-stock-record-id]'));
      const picks = [];
      for (const tr of rows) {
        if (!tr.querySelector('.sdisp-check')?.checked) continue;
        const qty = parseInt(tr.querySelector('.sdisp-qty')?.value || '0', 10);
        if (!qty || qty <= 0) continue;
        const avail = parseInt(tr.cells[4]?.textContent || '0', 10);
        if (qty > avail) throw new Error(`Qty ${qty} exceeds available ${avail} for ${tr.cells[1].textContent.trim()}.`);
        picks.push({ stockRecordId: tr.dataset.stockRecordId, stockItemId: tr.dataset.itemId || null, qty });
      }

      const { data: header, error: hErr } = await client
        .from('stock_disposals')
        .insert({
          disposal_number: num,
          disposed_by:     byId,
          disposed_at:     today,
          status:          'Disposed',
          remarks:         (document.getElementById('sdisp-remarks')||{}).value || null
        })
        .select()
        .single();
      if (hErr) throw hErr;

      if (picks.length) {
        const items = picks.filter(p => p.stockItemId).map(p => ({
          disposal_id: header.id,
          stock_item_id: p.stockItemId,
          quantity: p.qty
        }));
        if (items.length) {
          const { error: iErr } = await client.from('stock_disposal_items').insert(items);
          if (iErr) throw iErr;
        }
        for (const p of picks) {
          const { data: sr } = await client.from('stock_records').select('quantity').eq('id', p.stockRecordId).maybeSingle();
          const newQty = Math.max(0, Number(sr?.quantity || 0) - p.qty);
          await client.from('stock_records').update({ quantity: newQty }).eq('id', p.stockRecordId);
        }
      }

      Toast.show('Disposal saved (' + picks.length + ' line(s)).', 'success');
      _SDISP_loadHistory(container);
      _SDISP_loadAvailable(container);
    } catch (err) {
      console.error('[sdisp] save failed', err);
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
    container.querySelectorAll('.sdisp-check').forEach(cb => cb.checked = false);
    container.querySelectorAll('.sdisp-qty').forEach(el => el.value = '');
    Toast.show('Form reset.', 'info', 1500);
  });
}

function _SDISP_loadHistory(container) {
  return _OP_loadHistory({
    table: 'stock_disposals',
    container: container,
    tbodyId: 'sdisp-rec-tbody',
    columns: ['Disposal No.','Date','Disposed By','Status','Remarks','Created'],
    select: 'id, disposal_number, disposed_at, status, remarks, created_at, actor:profiles!stock_disposals_disposed_by_fkey(full_name,email)',
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

function _SDISP_html(){return`<style>${_OP_sharedCSS()}</style>
${_card('sdisp-det','<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>','Stock Disposal Details','',`
  <p class="op-req-note">${_infoIcon()} Fields marked <strong>*</strong> are required.</p>
  <div class="op-form-grid">
    <div>
      ${_field('Disposal No.','text','sdisp-no','Auto-generated',false,true)}
      ${_field('Date of Disposal','text','sdisp-date','',false,true,new Date().toLocaleDateString('en-US'))}
      ${_fieldSelect('Disposal Method','sdisp-method',['Destruction','Recycling','Donation','Incineration','Other'],'Select Method',true,false)}
      ${_fieldSelect('Disposed By','sdisp-by',_USERS,'Select Personnel',true,true)}
      ${_fieldSelect('Region','sdisp-region',_REGIONS,'Select Region',true,true)}
      ${_fieldSelect('Branch','sdisp-branch',_BRANCHES,'Select Branch',true,true)}
    </div>
    <div>
      ${_fieldSelect('Approved By','sdisp-approver',_USERS,'Select Approver',true,true)}
      ${_field('Disposal Resolution No.','text','sdisp-resolution','Enter resolution number')}
      ${_fieldSelect('Disposal Reason','sdisp-reason',['Expired','Damaged','Obsolete','Excess Stock','No Longer Needed','Other'],'Select Reason',true,false)}
      ${_fieldTextarea('Disposal Justification','sdisp-just','Describe the justification for disposal…',true)}
      ${_fieldTextarea('Remarks','sdisp-remarks','Enter remarks…')}
    </div>
  </div>
`,true)}
<div class="op-action-bar"><div class="op-action-bar__left">
  <button class="op-btn op-btn--primary" id="sdisp-save">${_icon('<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>')} Save Disposal</button>
  <button class="op-btn op-btn--secondary" id="sdisp-reset">${_icon('<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>')} Reset</button>
</div><div class="op-action-bar__right">
  <span class="op-count-pill" style="background:rgba(183,28,28,0.08);color:#78281f;border-color:rgba(183,28,28,0.2);">${_icon('<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>')} <span class="op-count-num" style="color:#78281f;">0</span> Stock Item(s) for Disposal</span>
</div></div>
${_card('sdisp-items','<path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>','Select Stock Items for Disposal','',`
  <div class="op-instruction">${_icon('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>')} Select stock items and specify the quantity to dispose. Partial disposal of a stock item is allowed.</div>
  ${_tableToolbar('sdisp-items-srch')}
  <div class="dash-table-wrap">
    <table class="dash-tbl" id="sdisp-items-tbl">
      <thead><tr><th style="width:36px"></th><th>Item Code</th><th>Description</th><th>Unit</th><th>On Hand Qty</th><th>Qty to Dispose</th><th>Condition</th><th>Unit Cost</th><th>Total Value</th></tr></thead>
      <tbody id="sdisp-items-tbody"><tr><td colspan="9" class="dash-empty">Loading…</td></tr></tbody>
    </table>
  </div>${_tableFooter('sdisp-items')}
`)}
${_card('sdisp-rec','<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>','Stock Disposal Records','',`
  ${_tableToolbar('sdisp-rec-srch')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" style="min-width:800px;">
      <thead><tr><th>Disposal No.</th><th>Date</th><th>Disposed By</th><th>Status</th><th>Remarks</th><th>Created</th></tr></thead>
      <tbody id="sdisp-rec-tbody"><tr><td colspan="6" class="dash-empty">Loading…</td></tr></tbody>
    </table>
  </div>${_tableFooter('sdisp-rec')}
`)}`;}

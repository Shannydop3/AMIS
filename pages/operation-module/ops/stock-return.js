
window.OP_VIEWS=window.OP_VIEWS||{};
window.OP_VIEWS['stock-return']={label:'Stock Return',group:'Transfer & Return',
columns:['Return No.','Stock No.','Description','Date Returned','Returned By','Quantity','Condition','Status'],
onLoad:function(c){
  c.innerHTML=_SRET_html();
  _OP_wireCards(c);_OP_wireSearch(c);_OP_wireAddBtns(c);
  _SRET_wireActions(c);
  _SRET_loadAvailable(c);
  _SRET_loadHistory(c);
},onUnload:function(){}};

async function _SRET_loadAvailable(container) {
  const client = window.AMIS_READY ? await window.AMIS_READY : null;
  const tbody = container.querySelector('#sret-items-tbody');
  if (!tbody) return;
  if (!client) { tbody.innerHTML = '<tr><td colspan="8" class="dash-empty">Database not configured.</td></tr>'; return; }
  try {
    const { data, error } = await client
      .from('stock_items')
      .select('id, item_code, description, unit:units_of_measurement(name)')
      .order('item_code');
    if (error) throw error;
    if (!data.length) { tbody.innerHTML = '<tr><td colspan="8" class="dash-empty">No stock items in catalog.</td></tr>'; return; }
    tbody.innerHTML = data.map(r => `
      <tr data-item-id="${r.id}">
        <td><input type="checkbox" class="sret-check"></td>
        <td>—</td>
        <td><span class="dash-pill dash-pill--green">${r.item_code || '—'}</span></td>
        <td>${r.description || '—'}</td>
        <td>${r.unit?.name || '—'}</td>
        <td>—</td>
        <td><input type="number" class="dash-input sret-qty" style="width:70px;" min="1" placeholder="0"></td>
        <td>—</td>
      </tr>`).join('');
    container.addEventListener('change', (e) => {
      if (e.target.classList.contains('sret-check')) {
        const n = container.querySelectorAll('.sret-check:checked').length;
        const pill = container.querySelector('.op-count-num');
        if (pill) pill.textContent = String(n);
      }
    });
  } catch (err) {
    console.error('[sret] load failed', err);
    tbody.innerHTML = '<tr><td colspan="8" class="dash-empty">Failed to load: ' + (err.message || err) + '</td></tr>';
  }
}

function _SRET_wireActions(container) {
  const saveBtn = container.querySelector('#sret-save');
  const resetBtn = container.querySelector('#sret-reset');
  if (saveBtn) saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    try {
      const num = (document.getElementById('sret-no')||{}).value ||
                  ('SR-' + new Date().getFullYear() + '-' + Date.now().toString().slice(-6));
      const client = await window.AMIS_READY;
      if (!client) throw new Error('Database not configured.');

      const byId = _OP_REF_IDS.profiles?.[(document.getElementById('sret-by')||{}).value] || null;
      const regionId = _OP_REF_IDS.regions?.[(document.getElementById('sret-region')||{}).value] || null;

      const rows = Array.from(container.querySelectorAll('#sret-items-tbl tbody tr[data-item-id]'));
      const picks = [];
      for (const tr of rows) {
        if (!tr.querySelector('.sret-check')?.checked) continue;
        const qty = parseInt(tr.querySelector('.sret-qty')?.value || '0', 10);
        if (!qty || qty <= 0) continue;
        picks.push({ stockItemId: tr.dataset.itemId, qty, code: tr.cells[2]?.textContent.trim(), desc: tr.cells[3]?.textContent.trim() });
      }

      const { data: header, error: hErr } = await client
        .from('stock_returns')
        .insert({
          return_number: num,
          returned_by:   byId,
          status:        'Returned',
          remarks:       (document.getElementById('sret-remarks')||{}).value || null
        })
        .select()
        .single();
      if (hErr) throw hErr;

      if (picks.length) {
        const items = picks.map(p => ({
          return_id: header.id,
          stock_item_id: p.stockItemId,
          quantity: p.qty
        }));
        const { error: iErr } = await client.from('stock_return_items').insert(items);
        if (iErr) throw iErr;
        for (const p of picks) {
          const { data: existing } = await client.from('stock_records').select('id, quantity').eq('item_id', p.stockItemId).maybeSingle();
          if (existing) {
            await client.from('stock_records').update({ quantity: Number(existing.quantity || 0) + p.qty }).eq('id', existing.id);
          } else {
            await client.from('stock_records').insert({ item_id: p.stockItemId, item_code: p.code, description: p.desc, quantity: p.qty, region_id: regionId });
          }
        }
      }

      Toast.show('Return saved (' + picks.length + ' line(s)).', 'success');
      _SRET_loadHistory(container);
      _SRET_loadAvailable(container);
    } catch (err) {
      console.error('[sret] save failed', err);
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
    container.querySelectorAll('.sret-check').forEach(cb => cb.checked = false);
    container.querySelectorAll('.sret-qty').forEach(el => el.value = '');
    Toast.show('Form reset.', 'info', 1500);
  });
}

function _SRET_loadHistory(container) {
  return _OP_loadHistory({
    table: 'stock_returns',
    container: container,
    tbodyId: 'sret-rec-tbody',
    columns: ['Return No.','Date','Returned By','Status','Remarks','Created'],
    select: 'id, return_number, returned_at, status, remarks, created_at, actor:profiles!stock_returns_returned_by_fkey(full_name,email)',
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

function _SRET_html(){return`<style>${_OP_sharedCSS()}</style>
${_card('sret-det','<path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>','Stock Return Details','',`
  <p class="op-req-note">${_infoIcon()} Fields marked <strong>*</strong> are required.</p>
  <div class="op-form-grid">
    <div>
      ${_field('Return No.','text','sret-no','Auto-generated',false,true)}
      ${_field('Date Returned','text','sret-date','',false,true,new Date().toLocaleDateString('en-US'))}
      ${_fieldSelect('Returned By','sret-by',_USERS,'Select Personnel',true,true)}
      ${_fieldSelect('Received By','sret-received',_USERS,'Select Receiver',true,true)}
      ${_fieldSelect('Region','sret-region',_REGIONS,'Select Region',true,true)}
      ${_fieldSelect('Branch','sret-branch',_BRANCHES,'Select Branch',true,true)}
    </div>
    <div>
      ${_fieldSelect('Condition','sret-condition',['Good','Fair','Poor','Damaged','Expired'],'Select Condition',true,false)}
      ${_fieldSelect('Return Reason','sret-reason',['Excess Quantity','Wrong Item','Unused Stock','Damaged on Receipt','Other'],'Select Reason',true,false)}
      ${_fieldSelect('Approver','sret-approver',_USERS,'Select Approver',true,true)}
      ${_fieldTextarea('Remarks','sret-remarks','Enter remarks…')}
    </div>
  </div>
`,true)}

<div class="op-action-bar"><div class="op-action-bar__left">
  <button class="op-btn op-btn--primary" id="sret-save">${_icon('<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>')} Save Return</button>
  <button class="op-btn op-btn--secondary" id="sret-reset">${_icon('<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>')} Reset</button>
</div><div class="op-action-bar__right"><span class="op-count-pill">${_icon('<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/>')} <span class="op-count-num">0</span> Item(s) Selected</span></div></div>
${_card('sret-items','<path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>','Select Stock Items to Return','',`
  <div class="op-instruction">${_icon('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>')} Select issued stock items and enter the quantity to return.</div>
  ${_tableToolbar('sret-items-srch')}
  <div class="dash-table-wrap">
    <table class="dash-tbl" id="sret-items-tbl">
      <thead><tr><th style="width:36px"></th><th>RIS No.</th><th>Item Code</th><th>Description</th><th>Unit</th><th>Issued Qty</th><th>Return Qty</th><th>Condition</th></tr></thead>
      <tbody id="sret-items-tbody"><tr><td colspan="8" class="dash-empty">Loading…</td></tr></tbody>
    </table>
  </div>${_tableFooter('sret-items')}
`)}
${_card('sret-rec','<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>','Records','',`
  ${_tableToolbar('sret-rec-srch')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" style="min-width:800px;">
      <thead><tr><th>Return No.</th><th>Date</th><th>Returned By</th><th>Status</th><th>Remarks</th><th>Created</th></tr></thead>
      <tbody id="sret-rec-tbody"><tr><td colspan="6" class="dash-empty">Loading…</td></tr></tbody>
    </table>
  </div>${_tableFooter('sret-rec')}
`)}`;}

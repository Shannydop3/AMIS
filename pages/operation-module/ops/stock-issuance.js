
window.OP_VIEWS=window.OP_VIEWS||{};
window.OP_VIEWS['stock-issuance']={label:'Stock Issuance',group:'Issuance',
columns:['RIS No.','Stock No.','Description','Date Issued','Issued To','Qty','Unit Cost','Total Cost','Purpose'],
onLoad:function(c){
  c.innerHTML=_SI_html();
  _OP_wireCards(c);_OP_wireSearch(c);_OP_wireAddBtns(c);
  _SI_wireActions(c);
  _SI_loadAvailable(c);
  _SI_loadHistory(c);
},onUnload:function(){}};

async function _SI_loadAvailable(container) {
  const client = window.AMIS_READY ? await window.AMIS_READY : null;
  const tbody = container.querySelector('#si-items-tbody');
  if (!tbody) return;
  if (!client) { tbody.innerHTML = '<tr><td colspan="8" class="dash-empty">Database not configured.</td></tr>'; return; }
  try {
    const { data, error } = await client
      .from('stock_records')
      .select('id, item_code, description, quantity, item_id, unit:units_of_measurement(name), item:stock_items(id, item_code, description, unit:units_of_measurement(name))')
      .gt('quantity', 0)
      .order('item_code');
    if (error) throw error;
    if (!data.length) { tbody.innerHTML = '<tr><td colspan="8" class="dash-empty">No stock on hand. Receive stock via Goods Receive first.</td></tr>'; return; }
    tbody.innerHTML = data.map(r => {
      const code = r.item_code || r.item?.item_code || '—';
      const desc = r.description || r.item?.description || '—';
      const unit = r.unit?.name || r.item?.unit?.name || '—';
      const avail = Number(r.quantity || 0);
      return `<tr data-stock-record-id="${r.id}" data-item-id="${r.item_id || ''}">
        <td><input type="checkbox" class="si-check"></td>
        <td><span class="dash-pill dash-pill--green">${code}</span></td>
        <td>${desc}</td>
        <td>${unit}</td>
        <td>${avail}</td>
        <td><input type="number" class="dash-input si-qty" style="width:70px;" min="1" max="${avail}" placeholder="0"></td>
        <td>—</td>
        <td>—</td>
      </tr>`;
    }).join('');
    container.addEventListener('change', (e) => {
      if (e.target.classList.contains('si-check')) {
        const n = container.querySelectorAll('.si-check:checked').length;
        const pill = container.querySelector('.op-count-num');
        if (pill) pill.textContent = String(n);
      }
    });
  } catch (err) {
    console.error('[si] load failed', err);
    tbody.innerHTML = '<tr><td colspan="8" class="dash-empty">Failed to load: ' + (err.message || err) + '</td></tr>';
  }
}

function _SI_wireActions(container) {
  const saveBtn = container.querySelector('#si-save');
  const resetBtn = container.querySelector('#si-reset');
  if (saveBtn) saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    try {
      const num = (document.getElementById('si-ris')||{}).value ||
                  ('RIS-' + new Date().getFullYear() + '-' + Date.now().toString().slice(-6));
      const client = await window.AMIS_READY;
      if (!client) throw new Error('Database not configured.');

      const issuedById = _OP_REF_IDS.profiles?.[(document.getElementById('si-by')||{}).value] || null;
      const issuedToId = _OP_REF_IDS.profiles?.[(document.getElementById('si-employee')||{}).value] || null;

      const rows = Array.from(container.querySelectorAll('#si-items-tbl tbody tr[data-stock-record-id]'));
      const picks = [];
      for (const tr of rows) {
        if (!tr.querySelector('.si-check')?.checked) continue;
        const qty = parseInt(tr.querySelector('.si-qty')?.value || '0', 10);
        if (!qty || qty <= 0) continue;
        const stockRecordId = tr.dataset.stockRecordId;
        const stockItemId   = tr.dataset.itemId || null;
        const avail = parseInt(tr.cells[4]?.textContent || '0', 10);
        if (qty > avail) throw new Error(`Qty ${qty} exceeds available ${avail} for ${tr.cells[1].textContent.trim()}.`);
        picks.push({ stockRecordId, stockItemId, qty });
      }

      const { data: header, error: hErr } = await client
        .from('stock_issuances')
        .insert({
          issuance_no: num,
          issued_by:   issuedById,
          issued_to:   issuedToId,
          status:      'Issued',
          remarks:     (document.getElementById('si-purpose')||{}).value || null
        })
        .select()
        .single();
      if (hErr) throw hErr;

      if (picks.length) {
        const items = picks.filter(p => p.stockItemId).map(p => ({
          issuance_id: header.id,
          stock_item_id: p.stockItemId,
          quantity: p.qty
        }));
        if (items.length) {
          const { error: iErr } = await client.from('stock_issuance_items').insert(items);
          if (iErr) throw iErr;
        }
        for (const p of picks) {
          const { data: sr } = await client.from('stock_records').select('quantity').eq('id', p.stockRecordId).maybeSingle();
          const newQty = Math.max(0, Number(sr?.quantity || 0) - p.qty);
          await client.from('stock_records').update({ quantity: newQty }).eq('id', p.stockRecordId);
        }
      }

      Toast.show('Issuance saved (' + picks.length + ' line(s)).', 'success');
      _SI_loadHistory(container);
      _SI_loadAvailable(container);
    } catch (err) {
      console.error('[si] save failed', err);
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
    container.querySelectorAll('.si-check').forEach(cb => cb.checked = false);
    container.querySelectorAll('.si-qty').forEach(el => el.value = '');
    Toast.show('Form reset.', 'info', 1500);
  });
}

function _SI_loadHistory(container) {
  return _OP_loadHistory({
    table: 'stock_issuances',
    container: container,
    tbodyId: 'si-rec-tbody',
    columns: ['RIS No.','Date','Issued To','Status','Remarks','Created'],
    select: 'id, issuance_no, issued_at, status, remarks, created_at, recipient:profiles!stock_issuances_issued_to_fkey(full_name,email)',
    rowFn: r => [
      '<strong>' + (r.issuance_no || '—') + '</strong>',
      r.issued_at || '—',
      r.recipient ? (r.recipient.full_name || r.recipient.email) : '—',
      r.status || '—',
      (r.remarks || '').slice(0, 60),
      new Date(r.created_at).toLocaleDateString()
    ]
  });
}

function _SI_html(){return`<style>${_OP_sharedCSS()}</style>
${_card('si-det','<path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>','Stock Issuance Details','',`
  <p class="op-req-note">${_infoIcon()} Fields marked <strong>*</strong> are required.</p>
  <div class="op-form-grid">
    <div>
      ${_field('RIS No.','text','si-ris','Auto-generated',false,true)}
      ${_fieldSelect('Custodian Type','si-custodian',_CUSTODIAN_TYPES,'Select Custodian Type',true,false)}
      ${_fieldSelect('Issued By','si-by',_USERS,'Select Personnel',true,true)}
      ${_fieldSelect('Region','si-region',_REGIONS,'Select Region',true,true)}
      ${_fieldSelect('Branch','si-branch',_BRANCHES,'Select Branch',true,true)}
      ${_fieldTextarea('Purpose','si-purpose','Describe purpose of issuance…',true)}
      ${_fieldTextarea('Remarks','si-remarks','Enter remarks…')}
    </div>
    <div>
      ${_field('Date Issued','text','si-date','',false,true,new Date().toLocaleDateString('en-US'))}
      <div class="op-section-label">Recipient</div>
      ${_fieldSelect('User Department','si-dept',['IMB','OBD','GSD','ICT'],'Select Department',true,true)}
      ${_fieldSelect('Employee','si-employee',_USERS,'Select Employee',true,true)}
      ${_field('First Name','text','si-fname','Auto-filled',false,true)}
      ${_field('Last Name','text','si-lname','Auto-filled',false,true)}
      ${_field('Employee No.','text','si-empno','Auto-filled',false,true)}
      ${_field('E-mail','email','si-email','Auto-filled',false,true)}
      ${_fieldSelect('Approver','si-approver',_USERS,'Select Approver',true,true)}
    </div>
  </div>
`,true)}
<div class="op-action-bar"><div class="op-action-bar__left">
  <button class="op-btn op-btn--primary" id="si-save">${_icon('<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>')} Save Issuance</button>
  <button class="op-btn op-btn--secondary" id="si-reset">${_icon('<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>')} Reset</button>
</div><div class="op-action-bar__right">
  <span class="op-count-pill">${_icon('<path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>')} <span class="op-count-num">0</span> Stock Item(s) Selected</span>
</div></div>
${_card('si-items','<path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>','Select Stock Items','',`
  <div class="op-instruction">${_icon('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>')} Select stock items and enter the quantity to issue. Available quantity must not be exceeded.</div>
  ${_tableToolbar('si-items-srch')}
  <div class="dash-table-wrap">
    <table class="dash-tbl" id="si-items-tbl">
      <thead><tr><th style="width:36px"></th><th>Item Code</th><th>Description</th><th>Unit</th><th>Available Qty</th><th>Qty to Issue</th><th>Unit Cost</th><th>Total Cost</th></tr></thead>
      <tbody id="si-items-tbody"><tr><td colspan="8" class="dash-empty">Loading…</td></tr></tbody>
    </table>
  </div>${_tableFooter('si-items')}
`)}
${_card('si-rec','<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>','Stock Issuance Records','',`
  ${_tableToolbar('si-rec-srch')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" style="min-width:800px;">
      <thead><tr><th>RIS No.</th><th>Date</th><th>Issued To</th><th>Status</th><th>Remarks</th><th>Created</th></tr></thead>
      <tbody id="si-rec-tbody"><tr><td colspan="6" class="dash-empty">Loading…</td></tr></tbody>
    </table>
  </div>${_tableFooter('si-rec')}
`)}`;}

/* ============================================
   AMIS – Operation Module: Goods Receive
   ops/goods-receive.js
   ============================================ */
window.OP_VIEWS = window.OP_VIEWS || {};
window.OP_VIEWS['goods-receive'] = {
  label:   'Goods Receive',
  group:   'Receiving & Tagging',
  columns: ['GRR No.','Date Received','Supplier','Item Description','Quantity','Unit','Unit Cost','Total Cost','Received By','Remarks'],
  onLoad:   function(c){
    c.innerHTML = _GR_html();
    _OP_wireCards(c); _OP_wireTabs(c); _OP_wireSearch(c); _OP_wireAddBtns(c);
    _GR_wireActions(c);
    _GR_loadItemCatalogs(c);
    _GR_loadHistory(c);
  },
  onUnload: function(){}
};

async function _GR_loadItemCatalogs(container) {
  const client = window.AMIS_READY ? await window.AMIS_READY : null;
  if (!client) return;
  try {
    const [propRes, stockRes] = await Promise.all([
      client.from('property_items').select('id, item_code, description, brand:brands(name), model:models(name)').order('item_code'),
      client.from('stock_items').select('id, item_code, description, unit:units_of_measurement(name)').order('item_code')
    ]);
    _GR_renderCatalog(container, 'gr-prop-tbl', propRes.data || [], /*isStock*/false);
    _GR_renderCatalog(container, 'gr-stock-tbl', stockRes.data || [], /*isStock*/true);
    _GR_wireCatalogInputs(container);
  } catch (err) {
    console.error('[gr] catalog load failed', err);
    Toast.show('Failed to load catalog: ' + (err.message || err), 'error');
  }
}

function _GR_renderCatalog(container, tblId, rows, isStock) {
  const tbl = container.querySelector('#' + tblId);
  if (!tbl) return;
  const tbody = tbl.querySelector('tbody');
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="${isStock ? 7 : 8}" class="dash-empty">No ${isStock ? 'stock' : 'property'} items in catalog. Add some via Files Data → ${isStock ? 'Stock' : 'Property'}.</td></tr>`;
    return;
  }
  const numInput = (id) => `<input type="number" min="1" max="999" value="1" class="dash-input gr-qty-input" data-item-id="${id}" style="width:70px">`;
  const costInput = (id) => `<input type="number" min="0" step="0.01" value="0" class="dash-input gr-cost-input" data-item-id="${id}" style="width:110px">`;
  const check   = (id) => `<input type="checkbox" class="gr-item-check" data-item-id="${id}" data-tab="${isStock ? 'stock' : 'prop'}">`;

  if (isStock) {
    tbody.innerHTML = rows.map(r => `
      <tr data-item-id="${r.id}">
        <td>${check(r.id)}</td>
        <td><span class="dash-pill dash-pill--green">${r.item_code || '—'}</span></td>
        <td>${r.description || '—'}</td>
        <td>${r.unit?.name || '—'}</td>
        <td>${numInput(r.id)}</td>
        <td>${costInput(r.id)}</td>
        <td>—</td>
      </tr>`).join('');
    const thead = tbl.querySelector('thead tr');
    if (thead && thead.cells.length === 5) {
      thead.innerHTML = `<th style="width:36px"><input type="checkbox" class="gr-select-all" data-tab="stock"></th><th>Item Code</th><th>Description</th><th>Unit</th><th>Qty</th><th>Unit Cost</th><th>Action</th>`;
    }
  } else {
    tbody.innerHTML = rows.map(r => `
      <tr data-item-id="${r.id}">
        <td>${check(r.id)}</td>
        <td><span class="dash-pill dash-pill--red">${r.item_code || '—'}</span></td>
        <td>${r.description || '—'}</td>
        <td>${r.brand?.name || '—'}</td>
        <td>${r.model?.name || '—'}</td>
        <td>${numInput(r.id)}</td>
        <td>${costInput(r.id)}</td>
        <td>—</td>
      </tr>`).join('');
    const thead = tbl.querySelector('thead tr');
    if (thead && thead.cells.length === 7) {
      thead.innerHTML = `<th style="width:36px"><input type="checkbox" class="gr-select-all" data-tab="prop"></th><th>Item Code</th><th>Description</th><th>Brand</th><th>Model</th><th>Qty</th><th>Unit Cost</th><th>Action</th>`;
    }
  }
}

function _GR_wireCatalogInputs(container) {
  const update = () => {
    const checked = container.querySelectorAll('.gr-item-check:checked');
    const propCount = container.querySelectorAll('.gr-item-check[data-tab="prop"]:checked').length;
    const stockCount = container.querySelectorAll('.gr-item-check[data-tab="stock"]:checked').length;
    const countEl = container.querySelector('#gr-count');
    if (countEl) countEl.textContent = String(checked.length);
    const propTabCount = container.querySelector('.op-tab-btn[data-tab="gr-prop-tab"] .op-tab-count');
    const stockTabCount = container.querySelector('.op-tab-btn[data-tab="gr-stock-tab"] .op-tab-count');
    if (propTabCount) propTabCount.textContent = String(propCount);
    if (stockTabCount) stockTabCount.textContent = String(stockCount);
  };
  container.addEventListener('change', (e) => {
    if (e.target.classList.contains('gr-select-all')) {
      const tab = e.target.dataset.tab;
      container.querySelectorAll(`.gr-item-check[data-tab="${tab}"]`).forEach(cb => { cb.checked = e.target.checked; });
    }
    if (e.target.classList.contains('gr-item-check') || e.target.classList.contains('gr-select-all')) {
      update();
    }
  });
  update();
}

function _GR_wireActions(container) {
  const saveBtn  = container.querySelector('#gr-save');
  const resetBtn = container.querySelector('#gr-reset');
  if (saveBtn) saveBtn.addEventListener('click', async function () {
    saveBtn.disabled = true;
    const originalText = saveBtn.innerHTML;
    saveBtn.textContent = 'Saving…';
    try {
      const grNumber = (document.getElementById('gr-grr-no') || {}).value ||
                       ('GRR-' + new Date().getFullYear() + '-' + Date.now().toString().slice(-6));
      const header = await _OP_saveHeader({
        table: 'goods_receipts',
        fields: [
          { id: 'gr-supplier',    db: 'supplier_id', fk: 'suppliers' },
          { id: 'gr-received-by', db: 'received_by', fk: 'profiles' },
          { id: 'gr-date',        db: 'received_at' },
          { id: 'gr-remarks',     db: 'remarks' },
        ],
        extra: {
          gr_number: grNumber,
          status:    'Received'
        }
      });

      const summary = await _GR_persistLineItems(container, header);
      const bits = [];
      if (summary.propertyRecords) bits.push(`${summary.propertyRecords} property record(s)`);
      if (summary.stockLines)     bits.push(`${summary.stockLines} stock line(s)`);
      const suffix = bits.length ? ' (' + bits.join(', ') + ')' : '';
      Toast.show('Goods receive saved' + suffix + '.', 'success');
      _GR_loadHistory(container);
    } catch (err) {
      console.error('[gr] save failed', err);
      Toast.show(err.message || 'Failed to save record.', 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = originalText;
    }
  });
  if (resetBtn) resetBtn.addEventListener('click', function () {
    container.querySelectorAll('.op-control').forEach(function (el) {
      if (el.readOnly) return;
      if (el.tagName === 'SELECT') { el.selectedIndex = 0; return; }
      el.value = '';
    });
    container.querySelectorAll('.gr-item-check').forEach(cb => cb.checked = false);
    container.querySelectorAll('.gr-qty-input').forEach(el => el.value = '1');
    container.querySelectorAll('.gr-cost-input').forEach(el => el.value = '0');
    _GR_wireCatalogInputs(container);
    Toast.show('Form reset.', 'info', 1500);
  });
}

// Insert property_records + stock_records + goods_receipt_items after header save.
async function _GR_persistLineItems(container, header) {
  const client = await window.AMIS_READY;
  if (!client) return { propertyRecords: 0, stockLines: 0 };

  const regionId = _OP_REF_IDS.regions?.[(document.getElementById('gr-region')||{}).value] || null;
  const branchId = _OP_REF_IDS.branches?.[(document.getElementById('gr-branch')||{}).value] || null;
  const supplierId = _OP_REF_IDS.suppliers?.[(document.getElementById('gr-supplier')||{}).value] || null;
  const assigneeId = _OP_REF_IDS.profiles?.[(document.getElementById('gr-assigned')||{}).value] || null;
  const receivedAt = (document.getElementById('gr-date')||{}).value || null;

  // -- Property records ------------------------------------------------------
  const propRows = Array.from(container.querySelectorAll('#gr-prop-tbl tbody tr[data-item-id]'));
  const propertyInserts = [];
  const grItems = [];
  for (const tr of propRows) {
    const check = tr.querySelector('.gr-item-check');
    if (!check?.checked) continue;
    const itemId = tr.dataset.itemId;
    const qty = Math.max(1, parseInt(tr.querySelector('.gr-qty-input')?.value || '1', 10));
    const cost = parseFloat(tr.querySelector('.gr-cost-input')?.value || '0') || null;
    const code = tr.cells[1]?.textContent.trim();
    const description = tr.cells[2]?.textContent.trim();
    for (let i = 0; i < qty; i++) {
      propertyInserts.push({
        item_id:            itemId,
        item_code:          code,
        description:        description,
        property_number:    header.gr_number + '-' + String(i + 1).padStart(3, '0') + '-' + String(propertyInserts.length + 1).padStart(3, '0'),
        supplier_id:        supplierId,
        region_id:          regionId,
        branch_id:          branchId,
        acquired_cost:      cost,
        date_of_acquisition:receivedAt,
        assigned_to:        assigneeId,
        status:             'Active'
      });
    }
  }
  if (propertyInserts.length) {
    const { data: prRows, error: prErr } = await client
      .from('property_records')
      .insert(propertyInserts)
      .select('id');
    if (prErr) throw prErr;
    (prRows || []).forEach(row => {
      grItems.push({
        goods_receipt_id:   header.id,
        property_record_id: row.id,
        quantity:           1
      });
    });
  }

  // -- Stock lines -----------------------------------------------------------
  const stockRows = Array.from(container.querySelectorAll('#gr-stock-tbl tbody tr[data-item-id]'));
  let stockLineCount = 0;
  for (const tr of stockRows) {
    const check = tr.querySelector('.gr-item-check');
    if (!check?.checked) continue;
    const itemId = tr.dataset.itemId;
    const qty = Math.max(1, parseInt(tr.querySelector('.gr-qty-input')?.value || '1', 10));
    const cost = parseFloat(tr.querySelector('.gr-cost-input')?.value || '0') || null;
    grItems.push({
      goods_receipt_id: header.id,
      stock_item_id:    itemId,
      quantity:         qty,
      unit_cost:        cost
    });
    // Increment / create stock_records for that item.
    const { data: existing } = await client
      .from('stock_records')
      .select('id, quantity')
      .eq('item_id', itemId)
      .maybeSingle();
    if (existing) {
      await client
        .from('stock_records')
        .update({ quantity: Number(existing.quantity || 0) + qty })
        .eq('id', existing.id);
    } else {
      const code = tr.cells[1]?.textContent.trim();
      const description = tr.cells[2]?.textContent.trim();
      await client.from('stock_records').insert({
        item_id:     itemId,
        item_code:   code,
        description: description,
        quantity:    qty,
        region_id:   regionId
      });
    }
    stockLineCount++;
  }

  if (grItems.length) {
    const { error: gErr } = await client.from('goods_receipt_items').insert(grItems);
    if (gErr) throw gErr;
  }

  return { propertyRecords: propertyInserts.length, stockLines: stockLineCount };
}

function _GR_loadHistory(container) {
  return _OP_loadHistory({
    table:     'goods_receipts',
    container: container,
    tbodyId:   'gr-rec-tbody',
    columns:   ['GRR No.','Date','Supplier','Received By','Status','Remarks','Created'],
    select:    'id, gr_number, received_at, status, remarks, created_at, supplier:suppliers(name), receiver:profiles!goods_receipts_received_by_fkey(full_name, email)',
    rowFn: function (r) {
      const supplier = r.supplier ? r.supplier.name : '—';
      const receiver = r.receiver ? (r.receiver.full_name || r.receiver.email) : '—';
      return [
        '<strong>' + (r.gr_number || '—') + '</strong>',
        r.received_at || '—',
        supplier,
        receiver,
        r.status || '—',
        (r.remarks || '').slice(0, 60),
        new Date(r.created_at).toLocaleDateString()
      ];
    }
  });
}

function _GR_html() { return `
<style>${_OP_sharedCSS()}</style>

${_card('gr-details','<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/>',
'Goods Receive Details','',`
  <p class="op-req-note">${_infoIcon()} Fields marked <strong>*</strong> are required.</p>
  <div class="op-form-grid">
    <div>
      ${_field('GRR Number','text','gr-grr-no','Leave blank to auto-generate',false)}
      ${_field('PR Number','text','gr-pr-no','Enter PR Number',true)}
      ${_field('PO Number','text','gr-po-no','Enter PO Number',true)}
      ${_field('Invoice Number','text','gr-invoice','Enter Invoice Number')}
      ${_field('DR Number','text','gr-dr-no','Enter DR Number')}
      ${_fieldSelect('Supplier','gr-supplier',_SUPPLIERS,'Select Supplier',true,true)}
      ${_fieldTextarea('Remarks','gr-remarks','Enter remarks or notes…')}
    </div>
    <div>
      ${_fieldDate('Date Received','gr-date',true,new Date().toISOString().slice(0,10))}
      ${_fieldSelect('Custodian Type','gr-custodian',_CUSTODIAN_TYPES,'Select Custodian',true,false)}
      ${_fieldSelect('Received By','gr-received-by',_USERS,'Select Receiver',true,true)}
      ${_fieldSelect('Assigned Person','gr-assigned',_USERS,'Select Person',false,true)}
      ${_fieldSelect('Region','gr-region',_REGIONS,'Select Region',true,true)}
      ${_fieldSelect('Branch','gr-branch',_BRANCHES,'Select Branch',true,true)}
      ${_fieldSelect('Approver','gr-approver',_USERS,'Select Approver',true,true)}
    </div>
  </div>
`, true)}

<div class="op-action-bar">
  <div class="op-action-bar__left">
    <button class="op-btn op-btn--primary" id="gr-save">${_icon('<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>')} Save Record</button>
    <button class="op-btn op-btn--secondary" id="gr-reset">${_icon('<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>')} Reset</button>
  </div>
  <div class="op-action-bar__right">
    <span class="op-count-pill">${_icon('<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/>')} <span class="op-count-num" id="gr-count">0</span> Item(s) Added</span>
  </div>
</div>

${_card('gr-items','<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>',
'Items','',`
  <div class="op-tab-bar">
    <button class="op-tab-btn active" data-tab="gr-prop-tab">Property <span class="op-tab-count">0</span></button>
    <button class="op-tab-btn" data-tab="gr-stock-tab">Stock <span class="op-tab-count">0</span></button>
  </div>
  <div class="op-tab-panel active" id="gr-prop-tab">
    <div class="op-instruction">${_icon('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>')} Select property items from the list below to add to this goods receive transaction.</div>
    ${_tableToolbar('gr-prop-search')}
    <div class="dash-table-wrap">
      <table class="dash-tbl" id="gr-prop-tbl">
        <thead><tr><th>Item Code</th><th>Description</th><th>Long Description</th><th>Brand</th><th>Model</th><th>Unit Cost</th><th>Action</th></tr></thead>
        <tbody><tr><td colspan="7" class="dash-empty">No property items available.</td></tr></tbody>
      </table>
    </div>
    ${_tableFooter('gr-prop')}
  </div>
  <div class="op-tab-panel" id="gr-stock-tab">
    <div class="op-instruction">${_icon('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>')} Select stock items below to add to this goods receive transaction.</div>
    ${_tableToolbar('gr-stock-search')}
    <div class="dash-table-wrap">
      <table class="dash-tbl" id="gr-stock-tbl">
        <thead><tr><th>Item Code</th><th>Description</th><th>Unit</th><th>Unit Cost</th><th>Action</th></tr></thead>
        <tbody><tr><td colspan="5" class="dash-empty">No stock items available.</td></tr></tbody>
      </table>
    </div>
    ${_tableFooter('gr-stock')}
  </div>
`)}

${_card('gr-records','<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>',
'List of Goods Receive Records','',`
  ${_tableToolbar('gr-rec-search')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" id="gr-rec-tbl" style="min-width:900px;">
      <thead><tr><th>GRR No.</th><th>Date</th><th>Supplier</th><th>Received By</th><th>Status</th><th>Remarks</th><th>Created</th></tr></thead>
      <tbody id="gr-rec-tbody"><tr><td colspan="7" class="dash-empty">Loading…</td></tr></tbody>
    </table>
  </div>
  ${_tableFooter('gr-rec')}
`)}`;
}


window.OP_VIEWS=window.OP_VIEWS||{};
window.OP_VIEWS['stock-request']={label:'Stock Request',group:'Requests',
columns:['Request No.','Date Requested','Requested By','Stock No.','Description','Quantity','Purpose','Status','Approved By'],
onLoad:function(c){
  c.innerHTML=_SREQ_html();
  _OP_wireCards(c);_OP_wireSearch(c);_OP_wireAddBtns(c);
  _SREQ_wireActions(c);
  _SREQ_loadHistory(c);
},onUnload:function(){}};

function _SREQ_wireActions(container) {
  const saveBtn  = container.querySelector('#sreq-save');
  const resetBtn = container.querySelector('#sreq-reset');
  if (saveBtn) saveBtn.addEventListener('click', async function () {
    saveBtn.disabled = true;
    try {
      const num = (document.getElementById('sreq-no') || {}).value ||
                  ('SREQ-' + new Date().getFullYear() + '-' + Date.now().toString().slice(-6));
      await _OP_saveHeader({
        table: 'stock_requests',
        fields: [
          { id: 'sreq-by',      db: 'requested_by', fk: 'profiles' },
          { id: 'sreq-purpose', db: 'remarks' }
        ],
        extra: {
          request_number: num,
          status:         'Pending'
        }
      });
      Toast.show('Stock request submitted.', 'success');
      _SREQ_loadHistory(container);
    } catch (err) {
      console.error('[sreq] save failed', err);
      Toast.show(err.message || 'Failed to submit request.', 'error');
    } finally {
      saveBtn.disabled = false;
    }
  });
  if (resetBtn) resetBtn.addEventListener('click', function () {
    container.querySelectorAll('.op-control').forEach(function (el) {
      if (el.readOnly) return;
      if (el.tagName === 'SELECT') { el.selectedIndex = 0; return; }
      el.value = '';
    });
    Toast.show('Form reset.', 'info', 1500);
  });
}

function _SREQ_loadHistory(container) {
  return _OP_loadHistory({
    table:     'stock_requests',
    container: container,
    tbodyId:   'sreq-rec-tbody',
    columns:   ['Request No.','Requested By','Status','Purpose','Created'],
    select:    'id, request_number, status, remarks, created_at, requester:profiles!stock_requests_requested_by_fkey(full_name, email)',
    rowFn: function (r) {
      const requester = r.requester ? (r.requester.full_name || r.requester.email) : '—';
      return [
        '<strong>' + (r.request_number || '—') + '</strong>',
        requester,
        r.status || '—',
        (r.remarks || '').slice(0, 60),
        new Date(r.created_at).toLocaleDateString()
      ];
    }
  });
}

function _SREQ_html(){return`<style>${_OP_sharedCSS()}</style>
${_card('sreq-det','<path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6z"/><polyline points="14 2 14 8 20 8"/>','Stock Request Details','',`
  <p class="op-req-note">${_infoIcon()} Fields marked <strong>*</strong> are required.</p>
  <div class="op-form-grid">
    <div>
      ${_field('Request No.','text','sreq-no','Leave blank to auto-generate',false)}
      ${_fieldSelect('Custodian Type','sreq-custodian',_CUSTODIAN_TYPES,'Select Custodian Type',true,false)}
      ${_fieldSelect('Requested By','sreq-by',_USERS,'Select Requestor',true,true)}
      ${_fieldSelect('Region','sreq-region',_REGIONS,'Select Region',true,true)}
      ${_fieldSelect('Branch','sreq-branch',_BRANCHES,'Select Branch',true,true)}
    </div>
    <div>
      ${_fieldDate('Date Requested','sreq-date',false,new Date().toISOString().slice(0,10))}
      ${_fieldTextarea('Purpose','sreq-purpose','Describe the purpose of this request…',true)}
      ${_fieldTextarea('Remarks','sreq-remarks','Enter remarks…')}
      ${_fieldSelect('Approver','sreq-approver',_USERS,'Select Approver',true,true)}
    </div>
  </div>
`,true)}

<div class="op-action-bar"><div class="op-action-bar__left">
  <button class="op-btn op-btn--primary" id="sreq-save">${_icon('<path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/>')} Submit Request</button>
  <button class="op-btn op-btn--secondary" id="sreq-reset">${_icon('<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>')} Reset</button>
</div><div class="op-action-bar__right"><span class="op-count-pill">${_icon('<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/>')} <span class="op-count-num">0</span> Item(s) Selected</span></div></div>
${_card('sreq-items','<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>','Select Stock Items to Request','',`
  <div class="op-instruction">${_icon('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>')} Select stock items and specify the quantity needed. Available stock determines the maximum.</div>
  ${_tableToolbar('sreq-items-srch')}
  <div class="dash-table-wrap">
    <table class="dash-tbl">
      <thead><tr><th><input type="checkbox"></th><th>Item Code</th><th>Description</th><th>Unit</th><th>On Hand Qty</th><th>Requested Qty</th><th>Unit Cost</th></tr></thead>
      <tbody><tr><td colspan="7" class="dash-empty">No stock items available. Add stock items via Files Data → Stock.</td></tr></tbody>
    </table>
  </div>${_tableFooter('sreq-items')}
`)}
${_card('sreq-rec','<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>','Records','',`
  ${_tableToolbar('sreq-rec-srch')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" style="min-width:700px;">
      <thead><tr><th>Request No.</th><th>Requested By</th><th>Status</th><th>Purpose</th><th>Created</th></tr></thead>
      <tbody id="sreq-rec-tbody"><tr><td colspan="5" class="dash-empty">Loading…</td></tr></tbody>
    </table>
  </div>${_tableFooter('sreq-rec')}
`)}`;}

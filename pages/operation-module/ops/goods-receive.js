/* ============================================
   AMIS – Operation Module: Goods Receive
   ops/goods-receive.js
   ============================================ */
window.OP_VIEWS = window.OP_VIEWS || {};
window.OP_VIEWS['goods-receive'] = {
  label:   'Goods Receive',
  group:   'Receiving & Tagging',
  columns: ['GRR No.','Date Received','Supplier','Item Description','Quantity','Unit','Unit Cost','Total Cost','Received By','Remarks'],
  onLoad:   function(c){ c.innerHTML = _GR_html(); _OP_wireCards(c); _OP_wireTabs(c); _OP_wireSearch(c); _OP_wireAddBtns(c); },
  onUnload: function(){}
};

function _GR_html() { return `
<style>${_OP_sharedCSS()}</style>

${_card('gr-details','<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/>',
'Goods Receive Details','',`
  <p class="op-req-note">${_infoIcon()} Fields marked <strong>*</strong> are required.</p>
  <div class="op-form-grid">
    <div>
      ${_field('PR Number','text','gr-pr-no','Enter PR Number',true)}
      ${_field('PO Number','text','gr-po-no','Enter PO Number',true)}
      ${_field('Invoice Number','text','gr-invoice','Enter Invoice Number')}
      ${_field('DR Number','text','gr-dr-no','Enter DR Number')}
      ${_fieldSelect('Supplier','gr-supplier',['Supplier A','Supplier B','Supplier C'],'Select Supplier',true,true)}
      ${_fieldTextarea('Remarks','gr-remarks','Enter remarks or notes…')}
    </div>
    <div>
      ${_field('Date of Acquisition','text','gr-date','',false,true,new Date().toLocaleDateString('en-US'))}
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
    <button class="op-btn op-btn--primary" onclick="Toast.show('Record saved as draft.','success')">${_icon('<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>')} Save Draft</button>
    <button class="op-btn op-btn--secondary" onclick="Toast.show('Form reset.','info')">${_icon('<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>')} Reset</button>
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
      <thead><tr><th>GRR No.</th><th>Date Received</th><th>Supplier</th><th>Item Description</th><th>Qty</th><th>Unit Cost</th><th>Total Cost</th><th>Received By</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody><tr><td colspan="10" class="dash-empty">No records found.</td></tr></tbody>
    </table>
  </div>
  ${_tableFooter('gr-rec')}
`)}`;
}

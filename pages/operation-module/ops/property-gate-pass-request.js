
window.OP_VIEWS=window.OP_VIEWS||{};
window.OP_VIEWS['property-gate-pass-request']={label:'Property Gate Pass Request',group:'Gate Pass & Inventory',
columns:['Gate Pass No.','Date','Property / Item','Description','Purpose','Requested By','Approved By','Status','Expected Return'],
onLoad:function(c){c.innerHTML=_GPR_html();_OP_wireCards(c);_OP_wireTabs(c);_OP_wireSearch(c);_OP_wireAddBtns(c);},onUnload:function(){}};
function _GPR_html(){return`<style>${_OP_sharedCSS()}</style>
${_card('gpr-det','<path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>','Gate Pass Request Details','',`
  <p class="op-req-note">${_infoIcon()} Fields marked <strong>*</strong> are required.</p>
  <div class="op-form-grid">
    <div>
      ${_field('Gate Pass No.','text','gpr-no','Auto-generated',false,true)}
      ${_field('Date of Request','text','gpr-date','',false,true,new Date().toLocaleDateString('en-US'))}
      ${_fieldSelect('Requested By','gpr-by',_USERS,'Select Requestor',true,true)}
      ${_fieldSelect('Region','gpr-region',_REGIONS,'Select Region',true,true)}
      ${_fieldSelect('Branch','gpr-branch',_BRANCHES,'Select Branch',true,true)}
    </div>
    <div>
      ${_field('Expected Return Date','text','gpr-return','',true)}
      ${_fieldSelect('Purpose Type','gpr-purpose-type',['Repair','Calibration','Demonstration','Off-site Use','Other'],'Select Purpose',true,false)}
      ${_fieldTextarea('Purpose Details','gpr-purpose','Describe the purpose for taking out the property…',true)}
      ${_fieldSelect('Approver','gpr-approver',_USERS,'Select Approver',true,true)}
      ${_fieldTextarea('Remarks','gpr-remarks','Enter remarks…')}
    </div>
  </div>
`,true)}
<div class="op-action-bar"><div class="op-action-bar__left">
  <button class="op-btn op-btn--primary" onclick="Toast.show('Gate pass request submitted.','success')">${_icon('<path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/>')} Submit Request</button>
  <button class="op-btn op-btn--secondary" onclick="Toast.show('Form reset.','info')">${_icon('<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>')} Reset</button>
</div><div class="op-action-bar__right">
  <span class="op-count-pill">${_icon('<path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>')} <span class="op-count-num">0</span> Item(s) Added</span>
</div></div>
${_card('gpr-items','<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>','Select Items for Gate Pass','',`
  <div class="op-tab-bar">
    <button class="op-tab-btn active" data-tab="gpr-prop-tab">Property <span class="op-tab-count">0</span></button>
    <button class="op-tab-btn" data-tab="gpr-stock-tab">Stock <span class="op-tab-count">0</span></button>
  </div>
  <div class="op-tab-panel active" id="gpr-prop-tab">
    <div class="op-instruction">${_icon('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>')} Select issued properties you wish to take out. A gate pass is required for all property movement outside the premises.</div>
    ${_tableToolbar('gpr-prop-srch')}
    <div class="dash-table-wrap dash-table-wrap--scroll">
      <table class="dash-tbl" style="min-width:900px;">
        <thead><tr><th><input type="checkbox"></th><th>Property No.</th><th>Item Code</th><th>Description</th><th>Brand</th><th>Model</th><th>Serial No.</th><th>Accountable Officer</th></tr></thead>
        <tbody><tr><td colspan="8" class="dash-empty">No issued properties available.</td></tr></tbody>
      </table>
    </div>${_tableFooter('gpr-prop')}
  </div>
  <div class="op-tab-panel" id="gpr-stock-tab">
    <div class="op-instruction">${_icon('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>')} Select stock items and enter the quantity to take out.</div>
    ${_tableToolbar('gpr-stock-srch')}
    <div class="dash-table-wrap">
      <table class="dash-tbl">
        <thead><tr><th><input type="checkbox"></th><th>Item Code</th><th>Description</th><th>Unit</th><th>On Hand</th><th>Qty to Take Out</th></tr></thead>
        <tbody><tr><td colspan="6" class="dash-empty">No stock items available.</td></tr></tbody>
      </table>
    </div>${_tableFooter('gpr-stock')}
  </div>
`)}
${_card('gpr-rec','<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>','Gate Pass Records','',`
  ${_tableToolbar('gpr-rec-srch')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" style="min-width:1000px;">
      <thead><tr><th>Gate Pass No.</th><th>Date</th><th>Item</th><th>Description</th><th>Purpose</th><th>Requested By</th><th>Approved By</th><th>Expected Return</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody><tr><td colspan="10" class="dash-empty">No gate pass records found.</td></tr></tbody>
    </table>
  </div>${_tableFooter('gpr-rec')}
`)}`;}

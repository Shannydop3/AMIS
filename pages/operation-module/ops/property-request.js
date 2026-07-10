window.OP_VIEWS=window.OP_VIEWS||{};
window.OP_VIEWS['property-request']={label:'Property Request',group:'Requests',
columns:['Request No.','Date Requested','Requested By','Description','Quantity','Purpose','Status','Approved By'],
onLoad:function(c){c.innerHTML=_PREQ_html();_OP_wireCards(c);_OP_wireSearch(c);_OP_wireAddBtns(c);},onUnload:function(){}};
function _PREQ_html(){return`<style>${_OP_sharedCSS()}</style>
${_card('preq-det','<path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6z"/><polyline points="14 2 14 8 20 8"/>','Request Details','',`
  <p class="op-req-note">${_infoIcon()} Fields marked <strong>*</strong> are required.</p>
  <div class="op-form-grid">
    <div>
      ${_field('Request No.','text','preq-no','Auto-generated',false,true)}
      ${_fieldSelect('Requested By','preq-by',_USERS,'Select Requestor',true,true)}
      ${_fieldSelect('Region','preq-region',_REGIONS,'Select Region',true,true)}
      ${_fieldSelect('Branch','preq-branch',_BRANCHES,'Select Branch',true,true)}
      ${_fieldSelect('Office','preq-office',_OFFICES,'Select Office',false,true)}
    </div>
    <div>
      ${_field('Date Requested','text','preq-date','',false,true,new Date().toLocaleDateString('en-US'))}
      ${_fieldTextarea('Purpose','preq-purpose','Describe the purpose of this request…',true)}
      ${_fieldTextarea('Remarks','preq-remarks','Enter remarks…')}
      ${_fieldSelect('Approver','preq-approver',_USERS,'Select Approver',true,true)}
    </div>
  </div>
`,true)}
<div class="op-action-bar"><div class="op-action-bar__left">
  <button class="op-btn op-btn--primary" onclick="Toast.show('Request submitted.','success')">${_icon('<path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/>')} Submit Request</button>
  <button class="op-btn op-btn--secondary" onclick="Toast.show('Form reset.','info')">${_icon('<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>')} Reset</button>
</div><div class="op-action-bar__right">
  <span class="op-count-pill">${_icon('<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/>')} <span class="op-count-num">0</span> Item(s) Added</span>
</div></div>
${_card('preq-items','<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>','Select Properties to Request','',`
  <div class="op-instruction">${_icon('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>')} Select the properties you wish to request. Only properties assigned to your custodian type are shown.</div>
  ${_tableToolbar('preq-items-srch')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" style="min-width:780px;">
      <thead><tr><th><input type="checkbox"></th><th>Item Code</th><th>Description</th><th>Classification</th><th>Category</th><th>Brand</th><th>Model</th></tr></thead>
      <tbody><tr><td colspan="7" class="dash-empty">No properties available for request.</td></tr></tbody>
    </table>
  </div>${_tableFooter('preq-items')}
`)}
${_card('preq-rec','<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>','Property Request Records','',`
  ${_tableToolbar('preq-rec-srch')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" style="min-width:900px;">
      <thead><tr><th>Request No.</th><th>Date Requested</th><th>Requested By</th><th>Description</th><th>Qty</th><th>Purpose</th><th>Status</th><th>Approved By</th><th>Actions</th></tr></thead>
      <tbody><tr><td colspan="9" class="dash-empty">No property request records found.</td></tr></tbody>
    </table>
  </div>${_tableFooter('preq-rec')}
`)}`;}

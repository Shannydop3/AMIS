
window.OP_VIEWS=window.OP_VIEWS||{};
window.OP_VIEWS['property-return-request']={label:'Property Return Request',group:'Transfer & Return',
columns:['Request No.','Date Requested','Property No.','Description','Reason','Requested By','Status','Approved By'],
onLoad:function(c){c.innerHTML=_PRETREQ_html();_OP_wireCards(c);_OP_wireSearch(c);_OP_wireAddBtns(c);},onUnload:function(){}};
function _PRETREQ_html(){return`<style>${_OP_sharedCSS()}</style>
${_card('pretreq-det','<path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>','Return Request Details','',`
  <p class="op-req-note">${_infoIcon()} Fields marked <strong>*</strong> are required.</p>
  <div class="op-form-grid">
    <div>
      ${_field('Request No.','text','pretreq-no','Auto-generated',false,true)}
      ${_field('Date Requested','text','pretreq-date','',false,true,new Date().toLocaleDateString('en-US'))}
      ${_fieldSelect('Requested By','pretreq-by',_USERS,'Select Requestor',true,true)}
      ${_fieldSelect('Region','pretreq-region',_REGIONS,'Select Region',true,true)}
      ${_fieldSelect('Branch','pretreq-branch',_BRANCHES,'Select Branch',true,true)}
    </div>
    <div>
      ${_fieldSelect('Return Reason','pretreq-reason',['End of Employment','Transfer of Assignment','Voluntary Return','Equipment Upgrade','Damaged/Defective'],'Select Reason',true,false)}
      ${_fieldSelect('Approver','pretreq-approver',_USERS,'Select Approver',true,true)}
      ${_fieldTextarea('Remarks','pretreq-remarks','Describe why you are returning this property…',true)}
    </div>
  </div>
`,true)}

<div class="op-action-bar"><div class="op-action-bar__left">
  <button class="op-btn op-btn--primary" onclick="Toast.show('Request submitted.','success')">${_icon('<path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/>')} Submit Request</button>
  <button class="op-btn op-btn--secondary" onclick="Toast.show('Form reset.','info')">${_icon('<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>')} Reset</button>
</div><div class="op-action-bar__right"><span class="op-count-pill">${_icon('<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/>')} <span class="op-count-num">0</span> Item(s) Selected</span></div></div>
${_card('pretreq-items','<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>','Select Properties for Return Request','',`
  <div class="op-instruction">${_icon('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>')} Only "Issued" properties assigned to you are listed.</div>
  ${_tableToolbar('pretreq-items-srch')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" style="min-width:900px;">
      <thead><tr><th><input type="checkbox"></th><th>Property No.</th><th>Item Code</th><th>Description</th><th>Brand</th><th>Model</th><th>Serial No.</th><th>Date Issued</th><th>ICS No.</th></tr></thead>
      <tbody><tr><td colspan="9" class="dash-empty">No issued properties found.</td></tr></tbody>
    </table>
  </div>${_tableFooter('pretreq-items')}
`)}
${_card('pretreq-rec','<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>','Records','',`
  ${_tableToolbar('pretreq-rec-srch')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" style="min-width:900px;">
      <thead><tr><th>Request No.</th><th>Date Requested</th><th>Property No.</th><th>Description</th><th>Reason</th><th>Requested By</th><th>Status</th><th>Approved By</th><th>Actions</th></tr></thead>
      <tbody><tr><td colspan="9" class="dash-empty">No records found.</td></tr></tbody>
    </table>
  </div>${_tableFooter('pretreq-rec')}
`)}`;}

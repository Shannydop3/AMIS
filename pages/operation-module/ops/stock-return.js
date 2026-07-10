
window.OP_VIEWS=window.OP_VIEWS||{};
window.OP_VIEWS['stock-return']={label:'Stock Return',group:'Transfer & Return',
columns:['Return No.','Stock No.','Description','Date Returned','Returned By','Quantity','Condition','Status'],
onLoad:function(c){c.innerHTML=_SRET_html();_OP_wireCards(c);_OP_wireSearch(c);_OP_wireAddBtns(c);},onUnload:function(){}};
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
  <button class="op-btn op-btn--primary" onclick="Toast.show('Stock return saved.','success')">${_icon('<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>')} Save</button>
  <button class="op-btn op-btn--secondary" onclick="Toast.show('Form reset.','info')">${_icon('<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>')} Reset</button>
</div><div class="op-action-bar__right"><span class="op-count-pill">${_icon('<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/>')} <span class="op-count-num">0</span> Item(s) Selected</span></div></div>
${_card('sret-items','<path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>','Select Stock Items to Return','',`
  <div class="op-instruction">${_icon('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>')} Select issued stock items and enter the quantity to return.</div>
  ${_tableToolbar('sret-items-srch')}
  <div class="dash-table-wrap">
    <table class="dash-tbl">
      <thead><tr><th><input type="checkbox"></th><th>RIS No.</th><th>Item Code</th><th>Description</th><th>Unit</th><th>Issued Qty</th><th>Return Qty</th><th>Condition</th></tr></thead>
      <tbody><tr><td colspan="8" class="dash-empty">No issued stock items found.</td></tr></tbody>
    </table>
  </div>${_tableFooter('sret-items')}
`)}
${_card('sret-rec','<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>','Records','',`
  ${_tableToolbar('sret-rec-srch')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" style="min-width:900px;">
      <thead><tr><th>Return No.</th><th>Date Returned</th><th>Stock No.</th><th>Description</th><th>Returned By</th><th>Qty</th><th>Condition</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody><tr><td colspan="9" class="dash-empty">No records found.</td></tr></tbody>
    </table>
  </div>${_tableFooter('sret-rec')}
`)}`;}


window.OP_VIEWS=window.OP_VIEWS||{};
window.OP_VIEWS['property-transfer']={label:'Property Transfer',group:'Transfer & Return',
columns:['Transfer No.','Property No.','Description','Date Transferred','From','To','Approved By','Status'],
onLoad:function(c){c.innerHTML=_PTRANS_html();_OP_wireCards(c);_OP_wireSearch(c);_OP_wireAddBtns(c);},onUnload:function(){}};
function _PTRANS_html(){return`<style>${_OP_sharedCSS()}</style>
${_card('ptrans-det','<path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"/>','Transfer Details','',`
  <p class="op-req-note">${_infoIcon()} Fields marked <strong>*</strong> are required.</p>
  <div class="op-form-grid">
    <div>
      ${_field('Transfer No.','text','ptrans-no','Auto-generated',false,true)}
      ${_field('Date Transferred','text','ptrans-date','',false,true,new Date().toLocaleDateString('en-US'))}
      <div class="op-section-label">Transfer From</div>
      ${_fieldSelect('From Region','ptrans-from-region',_REGIONS,'Select Region',true,true)}
      ${_fieldSelect('From Branch','ptrans-from-branch',_BRANCHES,'Select Branch',true,true)}
      ${_fieldSelect('From Office','ptrans-from-office',_OFFICES,'Select Office',false,true)}
      ${_fieldSelect('Current Accountable Officer','ptrans-from-officer',_USERS,'Select Officer',true,true)}
      ${_fieldTextarea('Remarks','ptrans-remarks','Enter transfer notes…')}
    </div>
    <div>
      <div class="op-section-label">Transfer To</div>
      ${_fieldSelect('To Region','ptrans-to-region',_REGIONS,'Select Region',true,true)}
      ${_fieldSelect('To Branch','ptrans-to-branch',_BRANCHES,'Select Branch',true,true)}
      ${_fieldSelect('To Office','ptrans-to-office',_OFFICES,'Select Office',false,true)}
      ${_fieldSelect('New Accountable Officer','ptrans-to-officer',_USERS,'Select Officer',true,true)}
      <div class="op-section-label">Approval</div>
      ${_fieldSelect('Approved By','ptrans-approver',_USERS,'Select Approver',true,true)}
      ${_fieldSelect('Transferred By','ptrans-by',_USERS,'Select Personnel',true,true)}
    </div>
  </div>
`,true)}

<div class="op-action-bar"><div class="op-action-bar__left">
  <button class="op-btn op-btn--primary" onclick="Toast.show('Transfer saved as draft.','success')">${_icon('<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>')} Save Draft</button>
  <button class="op-btn op-btn--secondary" onclick="Toast.show('Form reset.','info')">${_icon('<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>')} Reset</button>
</div><div class="op-action-bar__right"><span class="op-count-pill">${_icon('<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/>')} <span class="op-count-num">0</span> Item(s) Selected</span></div></div>
${_card('ptrans-items','<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>','Select Properties to Transfer','',`
  <div class="op-instruction">${_icon('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>')} Only "Issued" properties are eligible for transfer.</div>
  ${_tableToolbar('ptrans-items-srch')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" style="min-width:900px;">
      <thead><tr><th><input type="checkbox"></th><th>Property No.</th><th>Item Code</th><th>Description</th><th>Brand</th><th>Model</th><th>Serial No.</th><th>Accountable Officer</th><th>Current Location</th></tr></thead>
      <tbody><tr><td colspan="9" class="dash-empty">No issued properties available for transfer.</td></tr></tbody>
    </table>
  </div>${_tableFooter('ptrans-items')}
`)}
${_card('ptrans-rec','<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>','Records','',`
  ${_tableToolbar('ptrans-rec-srch')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" style="min-width:900px;">
      <thead><tr><th>Transfer No.</th><th>Date</th><th>Property No.</th><th>Description</th><th>From</th><th>To</th><th>Transferred By</th><th>Approved By</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody><tr><td colspan="10" class="dash-empty">No records found.</td></tr></tbody>
    </table>
  </div>${_tableFooter('ptrans-rec')}
`)}`;}

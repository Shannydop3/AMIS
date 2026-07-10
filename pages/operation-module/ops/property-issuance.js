window.OP_VIEWS=window.OP_VIEWS||{};
window.OP_VIEWS['property-issuance']={label:'Property Issuance',group:'Issuance',columns:['ICS No.','Property No.','Description','Date Issued','Issued To','Issued By','Quantity','Unit Cost','Status'],
onLoad:function(c){c.innerHTML=_PISS_html();_OP_wireCards(c);_OP_wireSearch(c);_OP_wireAddBtns(c);},onUnload:function(){}};
function _PISS_html(){return`<style>${_OP_sharedCSS()}</style>
${_card('piss-det','<path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>','Property Issuance Details','',`
  <p class="op-req-note">${_infoIcon()} Fields marked <strong>*</strong> are required.</p>
  <div class="op-form-grid">
    <div>
      ${_field('ICS No.','text','piss-ics','Auto-generated',false,true)}
      ${_fieldSelect('Custodian Type','piss-custodian',_CUSTODIAN_TYPES,'Select Custodian Type',true,false)}
      ${_fieldSelect('Property Type','piss-type',['PPE','SEP','Common-Use'],'Select Type',true,false)}
      ${_fieldSelect('Issued By','piss-by',_USERS,'Select Personnel',true,true)}
      ${_fieldSelect('Region','piss-region',_REGIONS,'Select Region',true,true)}
      ${_fieldSelect('Branch','piss-branch',_BRANCHES,'Select Branch',true,true)}
      ${_fieldSelect('Office','piss-office',_OFFICES,'Select Office',false,true)}
      ${_fieldTextarea('Remarks','piss-remarks','Enter remarks…')}
    </div>
    <div>
      ${_field('Date Issued','text','piss-date','',false,true,new Date().toLocaleDateString('en-US'))}
      <div class="op-section-label">Recipient Information</div>
      ${_fieldSelect('User Department','piss-dept',['IMB','OBD','GSD','ICT'],'Select Department',true,true)}
      ${_fieldSelect('Employee','piss-employee',_USERS,'Select Employee',true,true)}
      ${_field('First Name','text','piss-fname','Auto-filled',false,true)}
      ${_field('Last Name','text','piss-lname','Auto-filled',false,true)}
      ${_field('Employee No.','text','piss-empno','Auto-filled',false,true)}
      ${_field('Job Title','text','piss-jobtitle','Auto-filled',false,true)}
      ${_field('E-mail','email','piss-email','Auto-filled',false,true)}
      <div class="op-section-label">Flags</div>
      <div class="op-fg"><label class="op-label">Is Custodian:</label><div class="op-toggle-wrap"><label class="op-toggle"><input type="checkbox" id="piss-cust"><span class="op-toggle-slider"></span></label><span class="op-toggle-label">No</span></div></div>
      <div class="op-fg"><label class="op-label">Is Approver:</label><div class="op-toggle-wrap"><label class="op-toggle"><input type="checkbox" id="piss-appr"><span class="op-toggle-slider"></span></label><span class="op-toggle-label">No</span></div></div>
    </div>
  </div>
`,true)}
<div class="op-action-bar"><div class="op-action-bar__left">
  <button class="op-btn op-btn--primary" onclick="Toast.show('Saved as draft.','success')">${_icon('<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>')} Save Draft</button>
  <button class="op-btn op-btn--secondary" onclick="Toast.show('Form reset.','info')">${_icon('<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>')} Reset</button>
</div><div class="op-action-bar__right">
  <span class="op-count-pill">${_icon('<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/>')} <span class="op-count-num">0</span> Item(s) Selected</span>
</div></div>
${_card('piss-items','<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>','Select Properties to Issue','',`
  <div class="op-instruction">${_icon('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>')} Only properties with status "On Stock" are available for issuance.</div>
  ${_tableToolbar('piss-items-srch')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" style="min-width:900px;">
      <thead><tr><th><input type="checkbox"></th><th>Item Code</th><th>Property No.</th><th>Description</th><th>Brand</th><th>Model</th><th>Serial No.</th><th>Unit Cost</th><th>Classification</th></tr></thead>
      <tbody><tr><td colspan="9" class="dash-empty">No on-stock properties available for issuance.</td></tr></tbody>
    </table>
  </div>${_tableFooter('piss-items')}
`)}
${_card('piss-rec','<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>','List of Issuance Records','',`
  ${_tableToolbar('piss-rec-srch')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" style="min-width:900px;">
      <thead><tr><th>ICS No.</th><th>Date Issued</th><th>Property No.</th><th>Description</th><th>Issued To</th><th>Issued By</th><th>Region</th><th>Branch</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody><tr><td colspan="10" class="dash-empty">No issuance records found.</td></tr></tbody>
    </table>
  </div>${_tableFooter('piss-rec')}
`)}}`;}

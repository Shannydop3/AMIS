
window.OP_VIEWS=window.OP_VIEWS||{};
window.OP_VIEWS['property-verification']={label:'Property Verification',group:'Maintenance & Verification',
columns:['Verification No.','Property No.','Description','Date Verified','Verified By','Condition','Location','Status'],
onLoad:function(c){c.innerHTML=_PV_html();_OP_wireCards(c);_OP_wireSearch(c);_OP_wireAddBtns(c);},onUnload:function(){}};
function _PV_html(){return`<style>${_OP_sharedCSS()}</style>
${_card('pv-det','<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>','Verification Details','',`
  <p class="op-req-note">${_infoIcon()} Fields marked <strong>*</strong> are required.</p>
  <div class="op-form-grid">
    <div>
      ${_field('Verification No.','text','pv-no','Auto-generated',false,true)}
      ${_field('Date Verified','text','pv-date','',false,true,new Date().toLocaleDateString('en-US'))}
      ${_fieldSelect('Verified By','pv-by',_USERS,'Select Verifier',true,true)}
      ${_fieldSelect('Region','pv-region',_REGIONS,'Select Region',true,true)}
      ${_fieldSelect('Branch','pv-branch',_BRANCHES,'Select Branch',true,true)}
      ${_fieldSelect('Office','pv-office',_OFFICES,'Select Office',false,true)}
    </div>
    <div>
      ${_fieldSelect('Verification Type','pv-type',['Annual Physical Inventory','Spot Check','Post-Issuance','Special Audit'],'Select Type',true,false)}
      ${_fieldSelect('Approver','pv-approver',_USERS,'Select Approver',true,true)}
      ${_fieldTextarea('Remarks','pv-remarks','Enter verification notes…')}
    </div>
  </div>
`,true)}
<div class="op-action-bar"><div class="op-action-bar__left">
  <button class="op-btn op-btn--primary" onclick="_OP_quickSave('property-verification')">${_icon('<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>')} Save</button>
  <button class="op-btn op-btn--secondary" onclick="Toast.show('Form reset.','info')">${_icon('<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>')} Reset</button>
</div><div class="op-action-bar__right">
  <span class="op-count-pill">${_icon('<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>')} <span class="op-count-num">0</span> Item(s) Verified</span>
</div></div>
${_card('pv-items','<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>','Properties for Verification','',`
  <div class="op-instruction">${_icon('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>')} Review each property and update its condition and current location. Properties pending verification are shown.</div>
  ${_tableToolbar('pv-items-srch')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" style="min-width:1000px;">
      <thead><tr><th>Property No.</th><th>Item Code</th><th>Description</th><th>Accountable Officer</th><th>Expected Location</th><th>Condition</th><th>Actual Location</th><th>Remarks</th><th>Verified</th></tr></thead>
      <tbody><tr><td colspan="9" class="dash-empty">No properties pending verification.</td></tr></tbody>
    </table>
  </div>${_tableFooter('pv-items')}
`)}
${_card('pv-rec','<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>','Verification Records','',`
  ${_tableToolbar('pv-rec-srch')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" style="min-width:900px;">
      <thead><tr><th>Verification No.</th><th>Date</th><th>Property No.</th><th>Description</th><th>Verified By</th><th>Condition</th><th>Location</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody><tr><td colspan="9" class="dash-empty">No verification records found.</td></tr></tbody>
    </table>
  </div>${_tableFooter('pv-rec')}
`)}`;}

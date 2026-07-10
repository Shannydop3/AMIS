
window.OP_VIEWS=window.OP_VIEWS||{};
window.OP_VIEWS['property-disposal-request']={label:'Property Disposal Request',group:'Disposal',
columns:['Request No.','Date Requested','Property No.','Description','Reason','Requested By','Method','Status','Approved By'],
onLoad:function(c){c.innerHTML=_PDISPREQ_html();_OP_wireCards(c);_OP_wireSearch(c);_OP_wireAddBtns(c);},onUnload:function(){}};
function _PDISPREQ_html(){return`<style>${_OP_sharedCSS()}</style>
${_card('pdispreq-det','<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>','Disposal Request Details','',`
  <p class="op-req-note">${_infoIcon()} Fields marked <strong>*</strong> are required.</p>
  <div class="op-form-grid">
    <div>
      ${_field('Request No.','text','pdispreq-no','Auto-generated',false,true)}
      ${_field('Date Requested','text','pdispreq-date','',false,true,new Date().toLocaleDateString('en-US'))}
      ${_fieldSelect('Requested By','pdispreq-by',_USERS,'Select Requestor',true,true)}
      ${_fieldSelect('Region','pdispreq-region',_REGIONS,'Select Region',true,true)}
      ${_fieldSelect('Branch','pdispreq-branch',_BRANCHES,'Select Branch',true,true)}
    </div>
    <div>
      ${_fieldSelect('Disposal Reason','pdispreq-reason',['Beyond Economical Repair','Obsolete/Outdated','Fully Depreciated','Damaged Beyond Repair','End of Useful Life','Surplus/Excess','Other'],'Select Reason',true,false)}
      ${_fieldSelect('Recommended Method','pdispreq-method',['Auction','Donation','Destruction','Recycling','Transfer to Another Agency','Trade-In','Other'],'Select Method',false,false)}
      ${_fieldSelect('Approver','pdispreq-approver',_USERS,'Select Approver',true,true)}
      ${_fieldTextarea('Justification','pdispreq-just','Provide detailed justification for disposal…',true)}
      ${_fieldTextarea('Remarks','pdispreq-remarks','Additional remarks…')}
    </div>
  </div>
`,true)}
<div class="op-action-bar"><div class="op-action-bar__left">
  <button class="op-btn op-btn--primary" onclick="Toast.show('Disposal request submitted.','success')">${_icon('<path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/>')} Submit Request</button>
  <button class="op-btn op-btn--secondary" onclick="Toast.show('Form reset.','info')">${_icon('<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>')} Reset</button>
</div><div class="op-action-bar__right">
  <span class="op-count-pill" style="background:rgba(183,28,28,0.08);color:#78281f;border-color:rgba(183,28,28,0.2);">${_icon('<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>')} <span class="op-count-num" style="color:#78281f;">0</span> Item(s) for Disposal</span>
</div></div>
${_card('pdispreq-items','<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>','Select Properties for Disposal Request','',`
  <div class="op-instruction">${_icon('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>')} Select properties you wish to request for disposal. Properties must be in your custody or under your branch.</div>
  ${_tableToolbar('pdispreq-items-srch')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" style="min-width:1000px;">
      <thead><tr><th><input type="checkbox"></th><th>Property No.</th><th>Item Code</th><th>Description</th><th>Brand</th><th>Model</th><th>Serial No.</th><th>Condition</th><th>Accountable Officer</th><th>Date Acquired</th></tr></thead>
      <tbody><tr><td colspan="10" class="dash-empty">No properties available for disposal request.</td></tr></tbody>
    </table>
  </div>${_tableFooter('pdispreq-items')}
`)}
${_card('pdispreq-rec','<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>','Disposal Request Records','',`
  ${_tableToolbar('pdispreq-rec-srch')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" style="min-width:1000px;">
      <thead><tr><th>Request No.</th><th>Date Requested</th><th>Property No.</th><th>Description</th><th>Reason</th><th>Requested By</th><th>Method</th><th>Status</th><th>Approved By</th><th>Actions</th></tr></thead>
      <tbody><tr><td colspan="10" class="dash-empty">No disposal request records found.</td></tr></tbody>
    </table>
  </div>${_tableFooter('pdispreq-rec')}
`)}`;}

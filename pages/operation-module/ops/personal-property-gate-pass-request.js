
window.OP_VIEWS=window.OP_VIEWS||{};
window.OP_VIEWS['personal-property-gate-pass-request']={label:'Personal Property Gate Pass Request',group:'Gate Pass & Inventory',
columns:['Request No.','Date','Employee','Item Description','Serial / Model','Purpose','Expected Return','Status','Approved By'],
onLoad:function(c){c.innerHTML=_PPGPR_html();_OP_wireCards(c);_OP_wireSearch(c);_OP_wireAddBtns(c);},onUnload:function(){}};
function _PPGPR_html(){return`<style>${_OP_sharedCSS()}</style>
${_card('ppgpr-det','<path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>','Personal Property Gate Pass Details','',`
  <p class="op-req-note">${_infoIcon()} Fields marked <strong>*</strong> are required.</p>
  <div class="op-instruction" style="margin-bottom:16px;">${_icon('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>')} Use this form to request a gate pass for your personal property (not government-issued). Items brought into and out of the premises require this pass.</div>
  <div class="op-form-grid">
    <div>
      ${_field('Request No.','text','ppgpr-no','Auto-generated',false,true)}
      ${_field('Date of Request','text','ppgpr-date','',false,true,new Date().toLocaleDateString('en-US'))}
      ${_fieldSelect('Employee','ppgpr-employee',_USERS,'Select Employee',true,true)}
      ${_field('Employee No.','text','ppgpr-empno','Auto-filled',false,true)}
      ${_field('Department','text','ppgpr-dept','Auto-filled',false,true)}
      ${_fieldSelect('Region','ppgpr-region',_REGIONS,'Select Region',true,true)}
      ${_fieldSelect('Branch','ppgpr-branch',_BRANCHES,'Select Branch',true,true)}
    </div>
    <div>
      ${_field('Expected Return Date','text','ppgpr-return','',true)}
      ${_fieldSelect('Approver','ppgpr-approver',_USERS,'Select Approver',true,true)}
      ${_fieldTextarea('Purpose','ppgpr-purpose','Describe why you are bringing this item in/out…',true)}
      ${_fieldTextarea('Remarks','ppgpr-remarks','Additional notes…')}
    </div>
  </div>
`,true)}
<div class="op-action-bar"><div class="op-action-bar__left">
  <button class="op-btn op-btn--primary" onclick="Toast.show('Gate pass request submitted.','success')">${_icon('<path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/>')} Submit Request</button>
  <button class="op-btn op-btn--secondary" onclick="Toast.show('Form reset.','info')">${_icon('<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>')} Reset</button>
</div><div class="op-action-bar__right">
  <span class="op-count-pill">${_icon('<path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>')} <span class="op-count-num">0</span> Item(s) Listed</span>
</div></div>
${_card('ppgpr-items','<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>','Personal Items to Include','',`
  <div style="display:flex;justify-content:flex-end;margin-bottom:10px;">
    <button class="op-btn op-btn--primary" style="font-size:0.78rem;padding:7px 14px;" onclick="Toast.show('Add item form coming soon.','info')">${_icon('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>')} Add Personal Item</button>
  </div>
  <div class="dash-table-wrap">
    <table class="dash-tbl">
      <thead><tr><th>#</th><th>Item Description</th><th>Brand / Model</th><th>Serial No.</th><th>Color</th><th>Quantity</th><th>Remarks</th><th>Action</th></tr></thead>
      <tbody><tr><td colspan="8" class="dash-empty">No personal items added yet. Click "Add Personal Item" to begin.</td></tr></tbody>
    </table>
  </div>
`)}
${_card('ppgpr-rec','<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>','Personal Gate Pass Records','',`
  ${_tableToolbar('ppgpr-rec-srch')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" style="min-width:900px;">
      <thead><tr><th>Request No.</th><th>Date</th><th>Employee</th><th>Item Description</th><th>Purpose</th><th>Expected Return</th><th>Approved By</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody><tr><td colspan="9" class="dash-empty">No personal gate pass records found.</td></tr></tbody>
    </table>
  </div>${_tableFooter('ppgpr-rec')}
`)}`;}

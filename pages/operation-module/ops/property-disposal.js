
window.OP_VIEWS=window.OP_VIEWS||{};
window.OP_VIEWS['property-disposal']={label:'Property Disposal',group:'Disposal',
columns:['Disposal No.','Property No.','Description','Date Disposed','Method','Appraised Value','Disposed By','Approved By','Status'],
onLoad:function(c){c.innerHTML=_PDISP_html();_OP_wireCards(c);_OP_wireSearch(c);_OP_wireAddBtns(c);},onUnload:function(){}};
function _PDISP_html(){return`<style>${_OP_sharedCSS()}</style>
${_card('pdisp-det','<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>','Property Disposal Details','',`
  <p class="op-req-note">${_infoIcon()} Fields marked <strong>*</strong> are required.</p>
  <div class="op-form-grid">
    <div>
      ${_field('Disposal No.','text','pdisp-no','Auto-generated',false,true)}
      ${_field('Date of Disposal','text','pdisp-date','',false,true,new Date().toLocaleDateString('en-US'))}
      ${_fieldSelect('Disposal Method','pdisp-method',['Auction','Donation','Destruction','Recycling','Transfer to Another Agency','Trade-In','Other'],'Select Method',true,false)}
      ${_field('Appraised Value (₱)','text','pdisp-value','Enter appraised amount')}
      ${_fieldSelect('Disposed By','pdisp-by',_USERS,'Select Personnel',true,true)}
      ${_fieldSelect('Region','pdisp-region',_REGIONS,'Select Region',true,true)}
      ${_fieldSelect('Branch','pdisp-branch',_BRANCHES,'Select Branch',true,true)}
    </div>
    <div>
      ${_fieldSelect('Disposal Board Chairperson','pdisp-chair',_USERS,'Select Chairperson',false,true)}
      ${_fieldSelect('Approved By','pdisp-approver',_USERS,'Select Approver',true,true)}
      ${_field('Disposal Resolution No.','text','pdisp-resolution','Enter resolution number')}
      ${_fieldTextarea('Disposal Justification','pdisp-just','Describe the justification for disposal…',true)}
      ${_fieldTextarea('Remarks','pdisp-remarks','Enter remarks…')}
    </div>
  </div>
`,true)}
<div class="op-action-bar"><div class="op-action-bar__left">
  <button class="op-btn op-btn--primary" onclick="_OP_quickSave('property-disposal')">${_icon('<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>')} Save Draft</button>
  <button class="op-btn op-btn--amber" onclick="Toast.show('Submitting for approval…','info')">${_icon('<path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/>')} Submit for Approval</button>
  <button class="op-btn op-btn--secondary" onclick="Toast.show('Form reset.','info')">${_icon('<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>')} Reset</button>
</div><div class="op-action-bar__right">
  <span class="op-count-pill" style="background:rgba(183,28,28,0.08);color:#78281f;border-color:rgba(183,28,28,0.2);">${_icon('<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>')} <span class="op-count-num" style="color:#78281f;">0</span> Item(s) for Disposal</span>
</div></div>
${_card('pdisp-items','<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>','Select Properties for Disposal','',`
  <div class="op-instruction">${_icon('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>')} Only properties approved via a Disposal Request may be selected. Verify appraised values before proceeding.</div>
  ${_tableToolbar('pdisp-items-srch')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" style="min-width:1000px;">
      <thead><tr><th><input type="checkbox"></th><th>Disposal Request No.</th><th>Property No.</th><th>Item Code</th><th>Description</th><th>Brand</th><th>Model</th><th>Serial No.</th><th>Appraised Value</th><th>Condition</th></tr></thead>
      <tbody><tr><td colspan="10" class="dash-empty">No approved disposal requests found.</td></tr></tbody>
    </table>
  </div>${_tableFooter('pdisp-items')}
`)}
${_card('pdisp-rec','<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>','Property Disposal Records','',`
  ${_tableToolbar('pdisp-rec-srch')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" style="min-width:1000px;">
      <thead><tr><th>Disposal No.</th><th>Date</th><th>Property No.</th><th>Description</th><th>Method</th><th>Appraised Value</th><th>Disposed By</th><th>Approved By</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody><tr><td colspan="10" class="dash-empty">No disposal records found.</td></tr></tbody>
    </table>
  </div>${_tableFooter('pdisp-rec')}
`)}`;}

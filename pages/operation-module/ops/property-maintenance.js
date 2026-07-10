
window.OP_VIEWS=window.OP_VIEWS||{};
window.OP_VIEWS['property-maintenance']={label:'Property Maintenance',group:'Maintenance & Verification',
columns:['Maintenance No.','Property No.','Description','Date','Type','Performed By','Cost','Condition After','Next Schedule'],
onLoad:function(c){c.innerHTML=_PM_html();_OP_wireCards(c);_OP_wireSearch(c);_OP_wireAddBtns(c);},onUnload:function(){}};
function _PM_html(){return`<style>${_OP_sharedCSS()}</style>
${_card('pm-det','<path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>','Maintenance Details','',`
  <p class="op-req-note">${_infoIcon()} Fields marked <strong>*</strong> are required.</p>
  <div class="op-form-grid">
    <div>
      ${_field('Maintenance No.','text','pm-no','Auto-generated',false,true)}
      ${_field('Date of Maintenance','text','pm-date','',false,true,new Date().toLocaleDateString('en-US'))}
      ${_field('Property No.','text','pm-prop-no','Enter Property Number',true)}
      ${_field('Item Code','text','pm-item-code','Auto-filled',false,true)}
      ${_field('Description','text','pm-desc','Auto-filled',false,true)}
      ${_field('Serial No.','text','pm-serial','Auto-filled',false,true)}
      ${_field('Maintenance Cost (₱)','text','pm-cost','Enter amount')}
    </div>
    <div>
      ${_fieldSelect('Maintenance Type','pm-type',['Preventive','Corrective','Predictive','Emergency'],'Select Type',true,false)}
      ${_fieldTextarea('Work Done','pm-work','Describe the maintenance work performed…',true)}
      ${_fieldSelect('Performed By','pm-by',_USERS,'Select Technician',true,true)}
      ${_fieldSelect('Supervised By','pm-supervised',_USERS,'Select Supervisor',false,true)}
      ${_field('Next Maintenance Date','text','pm-next-date','')}
      ${_fieldSelect('Condition After','pm-condition',['Good','Fair','For Monitoring','For Disposal'],'Select Condition',true,false)}
      ${_fieldTextarea('Remarks','pm-remarks','Enter remarks…')}
    </div>
  </div>
`,true)}
<div class="op-action-bar"><div class="op-action-bar__left">
  <button class="op-btn op-btn--primary" onclick="Toast.show('Maintenance record saved.','success')">${_icon('<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>')} Save Record</button>
  <button class="op-btn op-btn--secondary" onclick="Toast.show('Form reset.','info')">${_icon('<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>')} Reset</button>
</div><div class="op-action-bar__right">
  <button class="op-btn op-btn--teal" onclick="Toast.show('Print maintenance report coming soon.','info')">${_icon('<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>')} Print Report</button>
</div></div>
${_card('pm-rec','<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>','Maintenance Records','',`
  ${_tableToolbar('pm-rec-srch')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" style="min-width:1000px;">
      <thead><tr><th>Maintenance No.</th><th>Date</th><th>Property No.</th><th>Description</th><th>Type</th><th>Performed By</th><th>Cost</th><th>Condition After</th><th>Next Schedule</th><th>Actions</th></tr></thead>
      <tbody><tr><td colspan="10" class="dash-empty">No maintenance records found.</td></tr></tbody>
    </table>
  </div>${_tableFooter('pm-rec')}
`)}`;}

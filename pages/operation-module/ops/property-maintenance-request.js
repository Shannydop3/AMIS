
window.OP_VIEWS=window.OP_VIEWS||{};
window.OP_VIEWS['property-maintenance-request']={label:'Property Maintenance Request',group:'Maintenance & Verification',
columns:['Request No.','Property No.','Description','Date Requested','Issue Type','Priority','Requested By','Status','Approved By'],
onLoad:function(c){c.innerHTML=_PMREQ_html();_OP_wireCards(c);_OP_wireSearch(c);_OP_wireAddBtns(c);},onUnload:function(){}};
function _PMREQ_html(){return`<style>${_OP_sharedCSS()}</style>
${_card('pmreq-det','<path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>','Maintenance Request Details','',`
  <p class="op-req-note">${_infoIcon()} Fields marked <strong>*</strong> are required.</p>
  <div class="op-form-grid">
    <div>
      ${_field('Request No.','text','pmreq-no','Auto-generated',false,true)}
      ${_field('Date Requested','text','pmreq-date','',false,true,new Date().toLocaleDateString('en-US'))}
      ${_field('Property No.','text','pmreq-prop-no','Enter Property Number',true)}
      ${_field('Item Code','text','pmreq-item-code','Auto-filled on lookup',false,true)}
      ${_field('Description','text','pmreq-desc','Auto-filled on lookup',false,true)}
      ${_field('Serial No.','text','pmreq-serial','Auto-filled on lookup',false,true)}
      ${_fieldSelect('Requested By','pmreq-by',_USERS,'Select Requestor',true,true)}
    </div>
    <div>
      ${_fieldSelect('Issue Type','pmreq-issue-type',['Hardware Failure','Software Issue','Physical Damage','Performance Degradation','Preventive Maintenance','Other'],'Select Issue Type',true,false)}
      ${_fieldTextarea('Issue Description','pmreq-issue','Describe the issue in detail…',true)}
      ${_fieldSelect('Priority','pmreq-priority',['Low','Medium','High','Critical'],'Select Priority',true,false)}
      ${_fieldSelect('Region','pmreq-region',_REGIONS,'Select Region',true,true)}
      ${_fieldSelect('Branch','pmreq-branch',_BRANCHES,'Select Branch',true,true)}
      ${_fieldSelect('Approver','pmreq-approver',_USERS,'Select Approver',true,true)}
      ${_fieldTextarea('Remarks','pmreq-remarks','Additional remarks…')}
    </div>
  </div>
`,true)}
<div class="op-action-bar"><div class="op-action-bar__left">
  <button class="op-btn op-btn--primary" onclick="Toast.show('Maintenance request submitted.','success')">${_icon('<path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/>')} Submit Request</button>
  <button class="op-btn op-btn--secondary" onclick="Toast.show('Form reset.','info')">${_icon('<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>')} Reset</button>
</div></div>
${_card('pmreq-rec','<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>','Maintenance Request Records','',`
  ${_tableToolbar('pmreq-rec-srch')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" style="min-width:1000px;">
      <thead><tr><th>Request No.</th><th>Date</th><th>Property No.</th><th>Description</th><th>Issue Type</th><th>Priority</th><th>Requested By</th><th>Status</th><th>Approved By</th><th>Actions</th></tr></thead>
      <tbody><tr><td colspan="10" class="dash-empty">No maintenance request records found.</td></tr></tbody>
    </table>
  </div>${_tableFooter('pmreq-rec')}
`)}`;}

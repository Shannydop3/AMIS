
window.OP_VIEWS=window.OP_VIEWS||{};
window.OP_VIEWS['stock-request']={label:'Stock Request',group:'Requests',
columns:['Request No.','Date Requested','Requested By','Stock No.','Description','Quantity','Purpose','Status','Approved By'],
onLoad:function(c){c.innerHTML=_SREQ_html();_OP_wireCards(c);_OP_wireSearch(c);_OP_wireAddBtns(c);},onUnload:function(){}};
function _SREQ_html(){return`<style>${_OP_sharedCSS()}</style>
${_card('sreq-det','<path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6z"/><polyline points="14 2 14 8 20 8"/>','Stock Request Details','',`
  <p class="op-req-note">${_infoIcon()} Fields marked <strong>*</strong> are required.</p>
  <div class="op-form-grid">
    <div>
      ${_field('Request No.','text','sreq-no','Auto-generated',false,true)}
      ${_fieldSelect('Custodian Type','sreq-custodian',_CUSTODIAN_TYPES,'Select Custodian Type',true,false)}
      ${_fieldSelect('Requested By','sreq-by',_USERS,'Select Requestor',true,true)}
      ${_fieldSelect('Region','sreq-region',_REGIONS,'Select Region',true,true)}
      ${_fieldSelect('Branch','sreq-branch',_BRANCHES,'Select Branch',true,true)}
    </div>
    <div>
      ${_field('Date Requested','text','sreq-date','',false,true,new Date().toLocaleDateString('en-US'))}
      ${_fieldTextarea('Purpose','sreq-purpose','Describe the purpose of this request…',true)}
      ${_fieldTextarea('Remarks','sreq-remarks','Enter remarks…')}
      ${_fieldSelect('Approver','sreq-approver',_USERS,'Select Approver',true,true)}
    </div>
  </div>
`,true)}

<div class="op-action-bar"><div class="op-action-bar__left">
  <button class="op-btn op-btn--primary" onclick="Toast.show('Request submitted.','success')">${_icon('<path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/>')} Submit Request</button>
  <button class="op-btn op-btn--secondary" onclick="Toast.show('Form reset.','info')">${_icon('<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>')} Reset</button>
</div><div class="op-action-bar__right"><span class="op-count-pill">${_icon('<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/>')} <span class="op-count-num">0</span> Item(s) Selected</span></div></div>
${_card('sreq-items','<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>','Select Stock Items to Request','',`
  <div class="op-instruction">${_icon('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>')} Select stock items and specify the quantity needed. Available stock determines the maximum.</div>
  ${_tableToolbar('sreq-items-srch')}
  <div class="dash-table-wrap">
    <table class="dash-tbl">
      <thead><tr><th><input type="checkbox"></th><th>Item Code</th><th>Description</th><th>Unit</th><th>On Hand Qty</th><th>Requested Qty</th><th>Unit Cost</th></tr></thead>
      <tbody>
        <tr><td><input type="checkbox"></td><td><span class="dash-pill dash-pill--green">ALCO-10404010-0002</span></td><td>ALCOHOL, Ethyl, 1 Gallon</td><td>GALLON</td><td>50</td><td><input type="number" class="dash-input" style="width:70px;" min="1" max="50" placeholder="0"></td><td>₱580.00</td></tr>
        <tr><td><input type="checkbox"></td><td><span class="dash-pill dash-pill--green">BOOTS-10404990-0001</span></td><td>Rain Boots</td><td>PAIRS</td><td>10</td><td><input type="number" class="dash-input" style="width:70px;" min="1" max="10" placeholder="0"></td><td>₱1,200.00</td></tr>
      </tbody>
    </table>
  </div>${_tableFooter('sreq-items')}
`)}
${_card('sreq-rec','<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>','Records','',`
  ${_tableToolbar('sreq-rec-srch')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" style="min-width:900px;">
      <thead><tr><th>Request No.</th><th>Date Requested</th><th>Stock No.</th><th>Description</th><th>Requested By</th><th>Qty</th><th>Purpose</th><th>Status</th><th>Approved By</th><th>Actions</th></tr></thead>
      <tbody><tr><td colspan="10" class="dash-empty">No records found.</td></tr></tbody>
    </table>
  </div>${_tableFooter('sreq-rec')}
`)}`;}

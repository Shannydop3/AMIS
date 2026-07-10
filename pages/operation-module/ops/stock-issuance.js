
window.OP_VIEWS=window.OP_VIEWS||{};
window.OP_VIEWS['stock-issuance']={label:'Stock Issuance',group:'Issuance',
columns:['RIS No.','Stock No.','Description','Date Issued','Issued To','Qty','Unit Cost','Total Cost','Purpose'],
onLoad:function(c){c.innerHTML=_SI_html();_OP_wireCards(c);_OP_wireSearch(c);_OP_wireAddBtns(c);},onUnload:function(){}};
function _SI_html(){return`<style>${_OP_sharedCSS()}</style>
${_card('si-det','<path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>','Stock Issuance Details','',`
  <p class="op-req-note">${_infoIcon()} Fields marked <strong>*</strong> are required.</p>
  <div class="op-form-grid">
    <div>
      ${_field('RIS No.','text','si-ris','Auto-generated',false,true)}
      ${_fieldSelect('Custodian Type','si-custodian',_CUSTODIAN_TYPES,'Select Custodian Type',true,false)}
      ${_fieldSelect('Issued By','si-by',_USERS,'Select Personnel',true,true)}
      ${_fieldSelect('Region','si-region',_REGIONS,'Select Region',true,true)}
      ${_fieldSelect('Branch','si-branch',_BRANCHES,'Select Branch',true,true)}
      ${_fieldTextarea('Purpose','si-purpose','Describe purpose of issuance…',true)}
      ${_fieldTextarea('Remarks','si-remarks','Enter remarks…')}
    </div>
    <div>
      ${_field('Date Issued','text','si-date','',false,true,new Date().toLocaleDateString('en-US'))}
      <div class="op-section-label">Recipient</div>
      ${_fieldSelect('User Department','si-dept',['IMB','OBD','GSD','ICT'],'Select Department',true,true)}
      ${_fieldSelect('Employee','si-employee',_USERS,'Select Employee',true,true)}
      ${_field('First Name','text','si-fname','Auto-filled',false,true)}
      ${_field('Last Name','text','si-lname','Auto-filled',false,true)}
      ${_field('Employee No.','text','si-empno','Auto-filled',false,true)}
      ${_field('E-mail','email','si-email','Auto-filled',false,true)}
      ${_fieldSelect('Approver','si-approver',_USERS,'Select Approver',true,true)}
    </div>
  </div>
`,true)}
<div class="op-action-bar"><div class="op-action-bar__left">
  <button class="op-btn op-btn--primary" onclick="_OP_quickSave('stock-issuance')">${_icon('<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>')} Save Draft</button>
  <button class="op-btn op-btn--secondary" onclick="Toast.show('Form reset.','info')">${_icon('<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>')} Reset</button>
</div><div class="op-action-bar__right">
  <span class="op-count-pill">${_icon('<path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>')} <span class="op-count-num">0</span> Stock Item(s) Selected</span>
</div></div>
${_card('si-items','<path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>','Select Stock Items','',`
  <div class="op-instruction">${_icon('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>')} Select stock items and enter the quantity to issue. Available quantity must not be exceeded.</div>
  ${_tableToolbar('si-items-srch')}
  <div class="dash-table-wrap">
    <table class="dash-tbl">
      <thead><tr><th><input type="checkbox"></th><th>Item Code</th><th>Description</th><th>Unit</th><th>Available Qty</th><th>Qty to Issue</th><th>Unit Cost</th><th>Total Cost</th></tr></thead>
      <tbody>
        <tr><td><input type="checkbox"></td><td><span class="dash-pill dash-pill--green">ALCO-10404010-0002</span></td><td>ALCOHOL, Ethyl, 1 Gallon</td><td>GALLON</td><td>50</td><td><input type="number" class="dash-input" style="width:70px;" min="1" max="50" placeholder="0"></td><td>₱580.00</td><td>—</td></tr>
        <tr><td><input type="checkbox"></td><td><span class="dash-pill dash-pill--green">BOOTS-10404990-0001</span></td><td>Rain Boots</td><td>PAIRS</td><td>10</td><td><input type="number" class="dash-input" style="width:70px;" min="1" max="10" placeholder="0"></td><td>₱1,200.00</td><td>—</td></tr>
      </tbody>
    </table>
  </div>${_tableFooter('si-items')}
`)}
${_card('si-rec','<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>','Stock Issuance Records','',`
  ${_tableToolbar('si-rec-srch')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" style="min-width:900px;">
      <thead><tr><th>RIS No.</th><th>Date Issued</th><th>Stock No.</th><th>Description</th><th>Issued To</th><th>Qty</th><th>Unit Cost</th><th>Total Cost</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody><tr><td colspan="10" class="dash-empty">No stock issuance records found.</td></tr></tbody>
    </table>
  </div>${_tableFooter('si-rec')}
`)}`;}

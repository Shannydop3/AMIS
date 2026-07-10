
window.OP_VIEWS=window.OP_VIEWS||{};
window.OP_VIEWS['stock-disposal']={label:'Stock Disposal',group:'Disposal',
columns:['Disposal No.','Stock No.','Description','Date Disposed','Quantity','Method','Reason','Disposed By','Approved By','Status'],
onLoad:function(c){c.innerHTML=_SDISP_html();_OP_wireCards(c);_OP_wireSearch(c);_OP_wireAddBtns(c);},onUnload:function(){}};
function _SDISP_html(){return`<style>${_OP_sharedCSS()}</style>
${_card('sdisp-det','<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>','Stock Disposal Details','',`
  <p class="op-req-note">${_infoIcon()} Fields marked <strong>*</strong> are required.</p>
  <div class="op-form-grid">
    <div>
      ${_field('Disposal No.','text','sdisp-no','Auto-generated',false,true)}
      ${_field('Date of Disposal','text','sdisp-date','',false,true,new Date().toLocaleDateString('en-US'))}
      ${_fieldSelect('Disposal Method','sdisp-method',['Destruction','Recycling','Donation','Incineration','Other'],'Select Method',true,false)}
      ${_fieldSelect('Disposed By','sdisp-by',_USERS,'Select Personnel',true,true)}
      ${_fieldSelect('Region','sdisp-region',_REGIONS,'Select Region',true,true)}
      ${_fieldSelect('Branch','sdisp-branch',_BRANCHES,'Select Branch',true,true)}
    </div>
    <div>
      ${_fieldSelect('Approved By','sdisp-approver',_USERS,'Select Approver',true,true)}
      ${_field('Disposal Resolution No.','text','sdisp-resolution','Enter resolution number')}
      ${_fieldSelect('Disposal Reason','sdisp-reason',['Expired','Damaged','Obsolete','Excess Stock','No Longer Needed','Other'],'Select Reason',true,false)}
      ${_fieldTextarea('Disposal Justification','sdisp-just','Describe the justification for disposal…',true)}
      ${_fieldTextarea('Remarks','sdisp-remarks','Enter remarks…')}
    </div>
  </div>
`,true)}
<div class="op-action-bar"><div class="op-action-bar__left">
  <button class="op-btn op-btn--primary" onclick="Toast.show('Stock disposal saved as draft.','success')">${_icon('<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>')} Save Draft</button>
  <button class="op-btn op-btn--amber" onclick="Toast.show('Submitting for approval…','info')">${_icon('<path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/>')} Submit for Approval</button>
  <button class="op-btn op-btn--secondary" onclick="Toast.show('Form reset.','info')">${_icon('<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>')} Reset</button>
</div><div class="op-action-bar__right">
  <span class="op-count-pill" style="background:rgba(183,28,28,0.08);color:#78281f;border-color:rgba(183,28,28,0.2);">${_icon('<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>')} <span class="op-count-num" style="color:#78281f;">0</span> Stock Item(s) for Disposal</span>
</div></div>
${_card('sdisp-items','<path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>','Select Stock Items for Disposal','',`
  <div class="op-instruction">${_icon('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>')} Select stock items and specify the quantity to dispose. Partial disposal of a stock item is allowed.</div>
  ${_tableToolbar('sdisp-items-srch')}
  <div class="dash-table-wrap">
    <table class="dash-tbl">
      <thead><tr><th><input type="checkbox"></th><th>Item Code</th><th>Description</th><th>Unit</th><th>On Hand Qty</th><th>Qty to Dispose</th><th>Condition</th><th>Unit Cost</th><th>Total Value</th></tr></thead>
      <tbody>
        <tr>
          <td><input type="checkbox"></td>
          <td><span class="dash-pill dash-pill--green">ALCO-10404010-0002</span></td>
          <td>ALCOHOL, Ethyl, 1 Gallon</td><td>GALLON</td><td>50</td>
          <td><input type="number" class="dash-input" style="width:70px;" min="1" max="50" placeholder="0"></td>
          <td><select class="dash-select"><option value="">Select…</option><option>Expired</option><option>Damaged</option><option>Fair</option></select></td>
          <td>₱580.00</td><td>—</td>
        </tr>
      </tbody>
    </table>
  </div>${_tableFooter('sdisp-items')}
`)}
${_card('sdisp-rec','<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>','Stock Disposal Records','',`
  ${_tableToolbar('sdisp-rec-srch')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" style="min-width:1000px;">
      <thead><tr><th>Disposal No.</th><th>Date</th><th>Stock No.</th><th>Description</th><th>Qty</th><th>Method</th><th>Reason</th><th>Disposed By</th><th>Approved By</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody><tr><td colspan="11" class="dash-empty">No stock disposal records found.</td></tr></tbody>
    </table>
  </div>${_tableFooter('sdisp-rec')}
`)}`;}

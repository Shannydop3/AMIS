
window.OP_VIEWS=window.OP_VIEWS||{};
window.OP_VIEWS['inventory-count']={label:'Inventory Count',group:'Gate Pass & Inventory',
columns:['Item No.','Description','Unit','Book Qty','Physical Count','Variance','Unit Cost','Total Value','Condition'],
onLoad:function(c){c.innerHTML=_IC_html();_OP_wireCards(c);_OP_wireTabs(c);_OP_wireSearch(c);_OP_wireAddBtns(c);},onUnload:function(){}};
function _IC_html(){return`<style>${_OP_sharedCSS()}</style>
${_card('ic-det','<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>','Inventory Count Details','',`
  <p class="op-req-note">${_infoIcon()} Fields marked <strong>*</strong> are required.</p>
  <div class="op-form-grid">
    <div>
      ${_field('Inventory No.','text','ic-no','Auto-generated',false,true)}
      ${_field('Count Date','text','ic-date','',false,true,new Date().toLocaleDateString('en-US'))}
      ${_fieldSelect('Inventory Type','ic-type',['Annual Physical Inventory','Quarterly Count','Spot Check','Special Count'],'Select Type',true,false)}
      ${_fieldSelect('Conducted By','ic-conducted',_USERS,'Select Personnel',true,true)}
      ${_fieldSelect('Witnessed By','ic-witnessed',_USERS,'Select Witness',false,true)}
    </div>
    <div>
      ${_fieldSelect('Region','ic-region',_REGIONS,'Select Region',true,true)}
      ${_fieldSelect('Branch','ic-branch',_BRANCHES,'Select Branch',true,true)}
      ${_fieldSelect('Office','ic-office',_OFFICES,'Select Office',false,true)}
      ${_fieldSelect('Approver','ic-approver',_USERS,'Select Approver',true,true)}
      ${_fieldTextarea('Remarks','ic-remarks','Enter inventory count notes…')}
    </div>
  </div>
`,true)}
<div class="op-action-bar"><div class="op-action-bar__left">
  <button class="op-btn op-btn--primary" onclick="Toast.show('Inventory count saved as draft.','success')">${_icon('<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>')} Save Draft</button>
  <button class="op-btn op-btn--teal" onclick="Toast.show('Generating variance report…','info')">${_icon('<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>')} Variance Report</button>
  <button class="op-btn op-btn--secondary" onclick="Toast.show('Form reset.','info')">${_icon('<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>')} Reset</button>
</div><div class="op-action-bar__right">
  <span class="op-count-pill" style="background:rgba(30,132,73,0.1);color:#145a32;border-color:rgba(30,132,73,0.2);">${_icon('<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>')} <span class="op-count-num" style="color:#145a32;">0</span> Matched</span>
  <span class="op-count-pill" style="background:rgba(183,28,28,0.1);color:#78281f;border-color:rgba(183,28,28,0.2);">${_icon('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>')} <span class="op-count-num" style="color:#78281f;">0</span> Variance(s)</span>
</div></div>
${_card('ic-sheet','<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>','Count Sheet','',`
  <div class="op-tab-bar">
    <button class="op-tab-btn active" data-tab="ic-prop-tab">Property <span class="op-tab-count">0</span></button>
    <button class="op-tab-btn" data-tab="ic-stock-tab">Stock <span class="op-tab-count">0</span></button>
  </div>
  <div class="op-tab-panel active" id="ic-prop-tab">
    <div class="op-instruction">${_icon('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>')} Enter the physical count for each property. Variance is calculated automatically.</div>
    ${_tableToolbar('ic-prop-srch')}
    <div class="dash-table-wrap dash-table-wrap--scroll">
      <table class="dash-tbl" style="min-width:1000px;">
        <thead><tr><th>Property No.</th><th>Item Code</th><th>Description</th><th>Accountable Officer</th><th>Book Qty</th><th>Physical Count</th><th>Variance</th><th>Condition</th><th>Remarks</th></tr></thead>
        <tbody><tr><td colspan="9" class="dash-empty">No properties loaded for count.</td></tr></tbody>
      </table>
    </div>${_tableFooter('ic-prop')}
  </div>
  <div class="op-tab-panel" id="ic-stock-tab">
    <div class="op-instruction">${_icon('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>')} Enter the physical count for each stock item. Variance is calculated automatically.</div>
    ${_tableToolbar('ic-stock-srch')}
    <div class="dash-table-wrap dash-table-wrap--scroll">
      <table class="dash-tbl" style="min-width:1000px;">
        <thead><tr><th>Item Code</th><th>Description</th><th>Unit</th><th>Book Qty</th><th>Physical Count</th><th>Variance</th><th>Unit Cost</th><th>Total Value</th><th>Condition</th><th>Remarks</th></tr></thead>
        <tbody>
          <tr>
            <td><span class="dash-pill dash-pill--green">ALCO-10404010-0002</span></td>
            <td>ALCOHOL, Ethyl, 1 Gallon</td><td>GALLON</td><td>50</td>
            <td><input type="number" class="dash-input" style="width:70px;" min="0" placeholder="0"></td>
            <td style="color:var(--text-muted);">—</td><td>₱580.00</td><td>₱29,000.00</td>
            <td><select class="dash-select"><option value="">Select…</option><option>Good</option><option>Fair</option><option>Damaged</option></select></td>
            <td><input type="text" class="dash-input" style="font-size:0.75rem;" placeholder="Remarks…"></td>
          </tr>
        </tbody>
      </table>
    </div>${_tableFooter('ic-stock')}
  </div>
`)}
${_card('ic-rec','<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>','Inventory Count Records','',`
  ${_tableToolbar('ic-rec-srch')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" style="min-width:900px;">
      <thead><tr><th>Inventory No.</th><th>Date</th><th>Type</th><th>Branch</th><th>Conducted By</th><th>Items Counted</th><th>Variances</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody><tr><td colspan="9" class="dash-empty">No inventory count records found.</td></tr></tbody>
    </table>
  </div>${_tableFooter('ic-rec')}
`)}`;}

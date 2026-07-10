/* ops/property-information.js */
window.OP_VIEWS = window.OP_VIEWS || {};
window.OP_VIEWS['property-information'] = {
  label:'Property Information', group:'Receiving & Tagging',
  columns:['Property No.','Description','Unit Cost','Date Acquired','Condition','Accountable Officer','Region','Branch','Status'],
  onLoad:function(c){c.innerHTML=_PI_html();_OP_wireCards(c);_OP_wireSearch(c);},
  onUnload:function(){}
};
function _PI_html(){return`
<style>${_OP_sharedCSS()}</style>
${_card('pi-search','<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>','Search Property','',`
  <div class="op-form-grid">
    <div>
      ${_field('Property No.','text','pi-prop-no','Enter property number')}
      ${_field('Item Code','text','pi-item-code','Enter item code')}
      ${_fieldSelect('Classification','pi-class',['LAPTOP','PRINTER','MONITOR','SWITCHGEAR','SERVER','PROJECTOR','CAMERA'],'Select Classification')}
    </div>
    <div>
      ${_fieldSelect('Region','pi-region',_REGIONS,'Select Region')}
      ${_fieldSelect('Branch','pi-branch',_BRANCHES,'Select Branch')}
      ${_fieldSelect('Status','pi-status',['Issued','On Stock','Pending Upload','Pending Verification','Pending Approval'],'Select Status')}
    </div>
  </div>
  <div style="margin-top:12px;display:flex;gap:8px;">
    <button class="op-btn op-btn--primary" onclick="Toast.show('Searching…','info',1500)">${_icon('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>')} Search</button>
    <button class="op-btn op-btn--secondary" onclick="Toast.show('Filters cleared.','info')">${_icon('<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>')} Clear</button>
  </div>
`,true)}
${_card('pi-results','<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>','Property Records','',`
  ${_tableToolbar('pi-search-inp')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" style="min-width:1100px;">
      <thead><tr><th>Property No.</th><th>Item Code</th><th>Description</th><th>Classification</th><th>Brand</th><th>Model</th><th>Serial No.</th><th>Accountable Officer</th><th>Region</th><th>Branch</th><th>Status</th><th>Date Acquired</th><th>Actions</th></tr></thead>
      <tbody>
        <tr>
          <td>2024-10605010-0004-05</td><td><span class="dash-pill dash-pill--blue">SWITCHGEAR</span></td>
          <td class="dash-truncate">ABB Medium Voltage Switchgear 13.8KV</td>
          <td>SWITCHGEAR</td><td>ABB</td><td class="dash-truncate">ABB Medium Voltage</td><td>NA</td>
          <td>LIZA RABENA</td><td>NCR</td><td>STUDIO 7</td>
          <td><span class="dash-pill dash-pill--green">Issued</span></td><td>12/29/2022</td>
          <td><div class="op-row-btns">
            <button class="op-row-btn op-row-btn--view" onclick="Toast.show('View coming soon.','info')">${_icon('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>')}</button>
            <button class="op-row-btn op-row-btn--edit" onclick="Toast.show('Edit coming soon.','info')">${_icon('<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>')}</button>
          </div></td>
        </tr>
        <tr>
          <td>2025-10405030-0040-01</td><td><span class="dash-pill dash-pill--blue">LAPTOP-003</span></td>
          <td class="dash-truncate">Intel Corei5 1135G7 – Travelmate TMP414</td>
          <td>LAPTOP</td><td>ACER</td><td class="dash-truncate">Travelmate TMP414-51-59KM</td><td>NXVP2SP00B</td>
          <td>BERNA JOY MONTEMAYOR</td><td>NCR</td><td>CP GARCIA</td>
          <td><span class="dash-pill dash-pill--green">Issued</span></td><td>1/9/2025</td>
          <td><div class="op-row-btns">
            <button class="op-row-btn op-row-btn--view" onclick="Toast.show('View coming soon.','info')">${_icon('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>')}</button>
            <button class="op-row-btn op-row-btn--edit" onclick="Toast.show('Edit coming soon.','info')">${_icon('<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>')}</button>
          </div></td>
        </tr>
      </tbody>
    </table>
  </div>
  ${_tableFooter('pi')}
`)}`;
}

/* ops/tagging.js */
window.OP_VIEWS = window.OP_VIEWS || {};
window.OP_VIEWS['tagging'] = {
  label:'Tagging / Re-tagging', group:'Receiving & Tagging',
  columns:['Tag No.','Date Tagged','Property No.','Description','Tagged By','Location','Tag Type','Remarks'],
  onLoad:function(c){
    c.innerHTML=_TAG_html();
    _OP_wireCards(c);_OP_wireTabs(c);_OP_wireSearch(c);_OP_wireAddBtns(c);
    _TAG_wireActions(c);
    _TAG_loadHistory(c);
  },
  onUnload:function(){}
};

function _TAG_wireActions(container) {
  const saveBtn  = container.querySelector('#tag-save');
  const resetBtn = container.querySelector('#tag-reset');
  if (saveBtn) saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    try {
      const client = await window.AMIS_READY;
      if (!client) throw new Error('Database not configured.');

      const activeTab = container.querySelector('.op-tab-panel.active')?.id || 'tag-gr-tab';
      let propertyNumber = null;
      let printerName    = null;

      if (activeTab === 'tag-prop-tab') {
        propertyNumber = (document.getElementById('tag-prop-no')||{}).value?.trim() || null;
        printerName    = (document.getElementById('tag-prop-by')||{}).value || null;
      } else if (activeTab === 'tag-stock-tab') {
        printerName    = (document.getElementById('tag-stock-by')||{}).value || null;
      } else {
        printerName    = (document.getElementById('tag-gr-by')||{}).value || null;
      }

      let propertyRecordId = null;
      if (propertyNumber) {
        const { data: rec } = await client
          .from('property_records')
          .select('id')
          .eq('property_number', propertyNumber)
          .maybeSingle();
        propertyRecordId = rec?.id || null;
        if (!propertyRecordId) throw new Error(`Property number "${propertyNumber}" not found in property_records.`);
      }

      const { error } = await client.from('taggings').insert({
        property_record_id: propertyRecordId,
        printer_name: printerName
      });
      if (error) throw error;

      Toast.show('Tag record saved.', 'success');
      _TAG_loadHistory(container);
    } catch (err) {
      console.error('[tag] save failed', err);
      Toast.show(err.message || 'Failed to save tag record.', 'error');
    } finally {
      saveBtn.disabled = false;
    }
  });
  if (resetBtn) resetBtn.addEventListener('click', () => {
    container.querySelectorAll('.op-control').forEach(el => {
      if (el.readOnly) return;
      if (el.tagName === 'SELECT') { el.selectedIndex = 0; return; }
      el.value = '';
    });
    Toast.show('Form reset.', 'info', 1500);
  });
}

function _TAG_loadHistory(container) {
  return _OP_loadHistory({
    table: 'taggings',
    container: container,
    tbodyId: 'tag-rec-tbody',
    columns: ['Property No.','Printer','IP Address','Created'],
    select: 'id, printer_name, ip_address, created_at, property:property_records(property_number, description)',
    rowFn: r => [
      '<strong>' + (r.property?.property_number || '—') + '</strong>',
      r.property?.description || '—',
      r.printer_name || '—',
      new Date(r.created_at).toLocaleString()
    ]
  });
}

function _TAG_html(){return`
<style>${_OP_sharedCSS()}</style>
${_card('tag-details','<path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42z"/><circle cx="5.5" cy="5.5" r="1.5"/>','Tagging Details','',`
  <p class="op-req-note">${_infoIcon()} Fields marked <strong>*</strong> are required.</p>
  <div class="op-tab-bar">
    <button class="op-tab-btn active" data-tab="tag-gr-tab">Goods Receive</button>
    <button class="op-tab-btn" data-tab="tag-prop-tab">Property</button>
    <button class="op-tab-btn" data-tab="tag-stock-tab">Stock</button>
  </div>
  <div class="op-tab-panel active" id="tag-gr-tab">
    <div class="op-form-grid">
      <div>
        ${_fieldSelect('GRR Number','tag-grr',['GRR-2025-001','GRR-2025-002','GRR-2025-003'],'Select GRR',true,false)}
        ${_fieldSelect('Tag Type','tag-type-gr',['Barcode and RFID Sticker','Barcode Sticker','RFID Hard Tag'],'Select Type',true,false)}
        ${_fieldTextarea('Remarks','tag-gr-remarks','Enter remarks…')}
      </div>
      <div>
        ${_field('Date Tagged','text','tag-gr-date','',false,true,new Date().toLocaleDateString('en-US'))}
        ${_fieldSelect('Tagged By','tag-gr-by',_USERS,'Select Personnel',true,true)}
        ${_fieldSelect('Region','tag-gr-region',_REGIONS,'Select Region',true,true)}
        ${_fieldSelect('Branch','tag-gr-branch',_BRANCHES,'Select Branch',true,true)}
      </div>
    </div>
  </div>
  <div class="op-tab-panel" id="tag-prop-tab">
    <div class="op-form-grid">
      <div>
        ${_field('Property No.','text','tag-prop-no','Enter Property Number',true)}
        ${_field('Item Code','text','tag-prop-code','Auto-filled',false,true)}
        ${_fieldSelect('Tag Type','tag-type-prop',['Barcode and RFID Sticker','Barcode Sticker','RFID Hard Tag'],'Select Type',true,false)}
        ${_fieldTextarea('Remarks','tag-prop-remarks','Enter remarks…')}
      </div>
      <div>
        ${_field('Description','text','tag-prop-desc','Auto-filled',false,true)}
        ${_field('Serial No.','text','tag-prop-serial','Auto-filled',false,true)}
        ${_fieldSelect('Tagged By','tag-prop-by',_USERS,'Select Personnel',true,true)}
        ${_fieldSelect('Region','tag-prop-region',_REGIONS,'Select Region',true,true)}
        ${_fieldSelect('Branch','tag-prop-branch',_BRANCHES,'Select Branch',true,true)}
      </div>
    </div>
  </div>
  <div class="op-tab-panel" id="tag-stock-tab">
    <div class="op-form-grid">
      <div>
        ${_field('Item Code','text','tag-stock-code','Enter Item Code',true)}
        ${_fieldSelect('Tag Type','tag-type-stock',['Barcode and RFID Sticker','Barcode Sticker','RFID Hard Tag'],'Select Type',true,false)}
        ${_fieldTextarea('Remarks','tag-stock-remarks','Enter remarks…')}
      </div>
      <div>
        ${_field('Description','text','tag-stock-desc','Auto-filled',false,true)}
        ${_fieldSelect('Tagged By','tag-stock-by',_USERS,'Select Personnel',true,true)}
        ${_fieldSelect('Region','tag-stock-region',_REGIONS,'Select Region',true,true)}
        ${_fieldSelect('Branch','tag-stock-branch',_BRANCHES,'Select Branch',true,true)}
      </div>
    </div>
  </div>
`,true)}
<div class="op-action-bar">
  <div class="op-action-bar__left">
    <button class="op-btn op-btn--primary" id="tag-save">${_icon('<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>')} Save Tag</button>
    <button class="op-btn op-btn--secondary" id="tag-reset">${_icon('<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>')} Reset</button>
  </div>
  <div class="op-action-bar__right">
    <button class="op-btn op-btn--teal" onclick="Toast.show('Print tag coming soon.','info')">${_icon('<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>')} Print Tag</button>
  </div>
</div>
${_card('tag-records','<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>','Tagging Records','',`
  ${_tableToolbar('tag-rec-search')}
  <div class="dash-table-wrap dash-table-wrap--scroll">
    <table class="dash-tbl" style="min-width:820px;">
      <thead><tr><th>Property No.</th><th>Description</th><th>Printer</th><th>Created</th></tr></thead>
      <tbody id="tag-rec-tbody"><tr><td colspan="4" class="dash-empty">Loading…</td></tr></tbody>
    </table>
  </div>
  ${_tableFooter('tag-rec')}
`)}`;
}

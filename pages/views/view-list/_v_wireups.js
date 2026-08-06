/* ============================================================
   AMIS – Views: Supabase onLoad wire-ups
   view-list/_v_wireups.js

   Runs after every view-list/*.js file registers its config in
   window.VIEW_VIEWS. Attaches an `onLoad` to each entry so the
   Views page router paints real Supabase data instead of the
   hard-coded arrays that were originally in each file.

   Load order (see views.html):
     views-helper.js       ← defines _V_loadTable()
     view-list/*.js        ← declare label / columns / filterFields
     view-list/_v_wireups.js  ← THIS FILE — attaches onLoad
     views.js              ← router — calls onLoad()
   ============================================================ */
(function () {
  'use strict';
  const V = window.VIEW_VIEWS = window.VIEW_VIEWS || {};

  // Reusable renderers ---------------------------------------------------
  const dash = (v) => (v == null || v === '') ? '<span class="v-muted">—</span>' : v;
  const date = (v) => v ? new Date(v).toLocaleDateString() : '<span class="v-muted">—</span>';
  const dt   = (v) => v ? new Date(v).toLocaleString()    : '<span class="v-muted">—</span>';
  const status = (v) => {
    if (!v) return '<span class="v-muted">—</span>';
    if (typeof window.VH?.pill === 'function') return window.VH.pill(v);
    return v;
  };
  const bold = (v) => v ? `<strong>${v}</strong>` : '<span class="v-muted">—</span>';
  const person = (r) => r ? (r.full_name || r.email) : null;

  function attach(key, cfg) {
    if (!V[key]) return;
    V[key].onLoad = function () { if (window._V_loadTable) window._V_loadTable(cfg); };
  }

  // ── Masterlists ─────────────────────────────────────────────────────
  attach('property-masterlist', {
    table: 'property_records',
    select: `id, item_code, description, property_number, long_description, serial_number,
             pr_number, po_number, invoice_number, dr_number,
             warehouse_name, location, area,
             date_of_acquisition, useful_life,
             warranty_start_date, warranty_end_date,
             insurance_start_date, insurance_end_date, expiry_date,
             acquired_cost, status, disposed_date, issued_date, last_maintenance_date,
             classification:classifications(name),
             category:categories(name),
             brand:brands(name),
             model:models(name),
             region:regions(name),
             branch:branches(name),
             office:offices(name),
             assignee:profiles!property_records_assigned_to_fkey(full_name,email)`,
    rowFn: r => [
      dash(r.item_code), dash(r.description), bold(r.property_number),
      dash(r.long_description), dash(r.serial_number),
      dash(r.classification?.name), dash(r.category?.name),
      dash(r.brand?.name), dash(r.model?.name),
      dash(r.pr_number), dash(r.po_number), dash(r.invoice_number), dash(r.dr_number),
      '<span class="v-muted">—</span>',      // Issuance # — from property_issuance_items
      dash(person(r.assignee)),
      dash(r.region?.name), dash(r.branch?.name), dash(r.office?.name),
      date(r.date_of_acquisition), dash(r.useful_life),
      '<span class="v-muted">—</span>',      // Remaining Useful Life (computed)
      date(r.last_maintenance_date),
      date(r.warranty_end_date), date(r.insurance_end_date), date(r.expiry_date),
      dash(r.acquired_cost), dash(r.acquired_cost),
      status(r.status),
      date(r.disposed_date), date(r.issued_date), date(r.last_maintenance_date),
      '—','—','—','—','—'                   // Inventory columns — from inventory_count_items
    ]
  });

  attach('stock-masterlist', {
    table: 'stock_records',
    select: `id, item_code, description, quantity,
             unit:units_of_measurement(name),
             region:regions(name)`,
    rowFn: r => [
      dash(r.item_code), dash(r.description), dash(r.quantity), dash(r.unit?.name),
      '—', dash(r.region?.name), '—'
    ]
  });

  // ── History views ───────────────────────────────────────────────────
  attach('good-receive-history', {
    table: 'goods_receipts',
    select: `id, gr_number, received_at, status, remarks, created_at,
             receiver:profiles!goods_receipts_received_by_fkey(full_name,email),
             items:goods_receipt_items(id)`,
    rowFn: r => [
      bold(r.gr_number), dash(person(r.receiver)),
      dash(r.items?.length || 0),             // No. of items
      date(r.received_at), dash(r.remarks),
      '<span class="v-muted">—</span>',        // Document
      '<span class="v-muted">—</span>'         // Action
    ]
  });

  attach('property-issuance-history', {
    table: 'property_issuances',
    select: `id, issuance_no, issued_at, status, remarks, created_at,
             recipient:profiles!property_issuances_issued_to_fkey(full_name,email),
             items:property_issuance_items(id, property:property_records(property_number, description))`,
    rowFn: r => {
      const first = r.items?.[0]?.property;
      const propNo = first?.property_number || '—';
      const desc   = first?.description || '—';
      const suffix = (r.items?.length > 1) ? ` +${r.items.length - 1} more` : '';
      return [
        bold(r.issuance_no), propNo, desc + suffix,
        dash(person(r.recipient)),
        date(r.issued_at), status(r.status),
        dash(r.remarks), '<span class="v-muted">—</span>', '<span class="v-muted">—</span>'
      ];
    }
  });

  attach('property-request-history', {
    table: 'property_requests',
    select: `id, request_number, requested_at, return_date, status, remarks, created_at,
             requester:profiles!property_requests_requested_by_fkey(full_name,email)`,
    rowFn: r => [
      bold(r.request_number), dash(person(r.requester)),
      date(r.return_date), date(r.created_at),
      status(r.status), dash(r.remarks),
      '<span class="v-muted">—</span>', '<span class="v-muted">—</span>'
    ]
  });

  attach('property-transfer-history', {
    table: 'property_transfers',
    select: `id, transfer_number, transferred_at, status, remarks, created_at,
             actor:profiles!property_transfers_transacted_by_fkey(full_name,email)`,
    rowFn: r => [
      bold(r.transfer_number), dash(r.remarks), dash(person(r.actor)),
      date(r.transferred_at), '—',
      '<span class="v-muted">—</span>', '<span class="v-muted">—</span>'
    ]
  });

  attach('property-maintenance-history', {
    table: 'property_maintenances',
    select: `id, maintenance_number, maintenance_type, scheduled_at, completed_at, status, remarks, created_at,
             actor:profiles!property_maintenances_created_by_fkey(full_name,email),
             property:property_records(property_number, description, serial_number)`,
    rowFn: r => [
      dash(r.property?.property_number), dash(r.property?.description), dash(r.property?.serial_number),
      dash(person(r.actor)), date(r.created_at),
      dash(r.completed_at ? '100%' : (r.status === 'Maintenance' ? '50%' : '0%')),
      dash(r.maintenance_type), '<span class="v-muted">—</span>'
    ]
  });

  attach('gate-pass-view', {
    table: 'gate_passes',
    select: `id, gate_pass_number, purpose, status, issued_at, created_at,
             requester:profiles!gate_passes_requested_by_fkey(full_name,email)`,
    rowFn: r => [
      bold(r.gate_pass_number), dash(person(r.requester)),
      date(r.issued_at), dash(r.purpose), status(r.status),
      '—', '—', '<span class="v-muted">—</span>'
    ]
  });

  attach('stock-issuance-history', {
    table: 'stock_issuances',
    select: `id, issuance_no, issued_at, status, remarks, created_at,
             recipient:profiles!stock_issuances_issued_to_fkey(full_name,email)`,
    rowFn: r => [
      bold(r.issuance_no), dash(person(r.recipient)), dash(r.remarks),
      date(r.issued_at), status(r.status),
      '<span class="v-muted">—</span>', '<span class="v-muted">—</span>', '<span class="v-muted">—</span>'
    ]
  });

  attach('stock-request-history', {
    table: 'stock_requests',
    select: `id, request_number, requested_at, status, remarks, created_at,
             requester:profiles!stock_requests_requested_by_fkey(full_name,email)`,
    rowFn: r => [
      bold(r.request_number), dash(person(r.requester)), dash(r.remarks),
      date(r.requested_at || r.created_at), status(r.status),
      '<span class="v-muted">—</span>', '<span class="v-muted">—</span>', '<span class="v-muted">—</span>'
    ]
  });

  attach('inventory-count-view', {
    table: 'inventory_counts',
    select: `id, inventory_number, inventory_name, description, site, location,
             status, started_at, completed_at, created_at`,
    rowFn: r => [
      dash(r.inventory_name), dash(r.description),
      dash(r.inventory_number), dash(r.site),
      '—',                                     // Inventory Type isn't a column
      date(r.created_at), status(r.status), '<span class="v-muted">—</span>'
    ]
  });

  attach('property-disposal-history', {
    table: 'property_disposals',
    select: `id, disposal_number, disposed_at, status, remarks, created_at,
             actor:profiles!property_disposals_disposed_by_fkey(full_name,email)`,
    filter: q => q.eq('status', 'Disposed'),
    rowFn: r => [
      bold(r.disposal_number), '—', dash(person(r.actor)),
      date(r.disposed_at), status(r.status), dash(r.remarks),
      '<span class="v-muted">—</span>', '<span class="v-muted">—</span>'
    ]
  });

  attach('property-disposal-request-history', {
    table: 'property_disposals',
    select: `id, disposal_number, disposed_at, status, remarks, created_at,
             actor:profiles!property_disposals_disposed_by_fkey(full_name,email)`,
    filter: q => q.eq('status', 'Pending'),
    rowFn: r => [
      bold(r.disposal_number), dash(person(r.actor)),
      date(r.disposed_at), status(r.status), dash(r.remarks),
      '<span class="v-muted">—</span>', '<span class="v-muted">—</span>'
    ]
  });

  attach('property-return-history', {
    table: 'property_returns',
    select: `id, return_number, returned_at, status, remarks, created_at,
             actor:profiles!property_returns_returned_by_fkey(full_name,email)`,
    rowFn: r => [
      '—', bold(r.return_number), dash(person(r.actor)),
      date(r.returned_at), status(r.status),
      '<span class="v-muted">—</span>', '<span class="v-muted">—</span>'
    ]
  });

  attach('stock-disposal-history', {
    table: 'stock_disposals',
    select: `id, disposal_number, disposed_at, status, remarks, created_at,
             actor:profiles!stock_disposals_disposed_by_fkey(full_name,email)`,
    rowFn: r => [
      bold(r.disposal_number), dash(person(r.actor)),
      date(r.disposed_at), status(r.status), dash(r.remarks),
      '<span class="v-muted">—</span>', '<span class="v-muted">—</span>'
    ]
  });

  attach('personal-property-gate-pass-request', {
    table: 'personal_property_gate_passes',
    select: `id, day_pass_number, purpose, status, issued_at, created_at,
             requester:profiles!personal_property_gate_passes_requested_by_fkey(full_name,email)`,
    rowFn: r => [
      bold(r.day_pass_number), dash(person(r.requester)),
      date(r.issued_at), dash(r.purpose), status(r.status),
      '—', '—', '<span class="v-muted">—</span>'
    ]
  });

  attach('tagging-history', {
    table: 'taggings',
    select: `id, printer_name, ip_address, created_at,
             prop:property_records(property_number)`,
    rowFn: r => [
      dash(r.prop?.property_number), dash(r.printer_name),
      dash(r.ip_address), dt(r.created_at)
    ]
  });

  attach('audit-trail', {
    table: 'audit_trail',
    select: `id, user_name, activity, ip_address, created_at,
             user:profiles(full_name, email)`,
    rowFn: r => {
      const who = r.user_name || (r.user ? (r.user.full_name || r.user.email) : '—');
      return [dash(who), dash(r.activity), dt(r.created_at), dash(r.ip_address)];
    }
  });

  attach('property-movement', {
    table: 'property_transfers',
    select: `id, transfer_number, transferred_at, remarks,
             from_office:offices!property_transfers_from_office_id_fkey(name),
             to_office:offices!property_transfers_to_office_id_fkey(name)`,
    rowFn: r => [
      dash(r.transfer_number),
      `Transfer${r.from_office ? ' from ' + r.from_office.name : ''}${r.to_office ? ' to ' + r.to_office.name : ''}`,
      date(r.transferred_at),
      '<span class="v-muted">—</span>'
    ]
  });

  // ── Card/ledger views (property catalog) ─────────────────────────────
  const propCardCfg = (extraFilter) => ({
    table: 'property_items',
    select: `id, item_code, description,
             classification:classifications(name),
             category:categories(name),
             brand:brands(name),
             model:models(name)`,
    filter: extraFilter,
    rowFn: r => [
      dash(r.item_code), dash(r.description),
      dash(r.classification?.name), dash(r.category?.name),
      dash(r.brand?.name), dash(r.model?.name),
      '<span class="v-muted">—</span>'
    ]
  });
  attach('property-card',    propCardCfg());
  attach('ppe-ledger-card',  propCardCfg(q => q.ilike('classification.name', '%PPE%')));
  attach('sep-ledger-card',  propCardCfg(q => q.ilike('classification.name', '%Semi-Expendable%')));

  attach('stock-card', {
    table: 'stock_items',
    select: `id, item_code, description,
             classification:classifications(name),
             unit:units_of_measurement(name)`,
    rowFn: r => [
      dash(r.item_code), dash(r.description),
      dash(r.classification?.name),
      dash(r.unit?.name),
      '—','—','<span class="v-muted">—</span>'
    ]
  });

  // ── Report views (property-based summaries) ──────────────────────────
  attach('regspi-view', {
    table: 'property_records',
    select: `id, property_number, description, useful_life, acquired_cost, date_of_acquisition, status`,
    rowFn: r => [
      date(r.date_of_acquisition), dash(r.property_number),
      dash(r.description), dash(r.useful_life),
      dash(r.acquired_cost), dash(r.status)
    ]
  });

  attach('rspi-view', {
    table: 'property_records',
    select: `id, item_code, property_number, description`,
    filter: q => q.eq('status', 'Active'),
    rowFn: r => [
      dash(r.item_code), dash(r.property_number), '1', dash(r.description)
    ]
  });

  attach('rsmi-view', {
    table: 'stock_issuance_items',
    select: `id, quantity,
             issuance:stock_issuances(issuance_no),
             stock:stock_items(item_code, description)`,
    rowFn: r => [
      dash(r.stock?.item_code),
      '<span class="v-muted">—</span>',
      dash(r.issuance?.issuance_no),
      dash(r.quantity),
      dash(r.stock?.description)
    ]
  });
})();

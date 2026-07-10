/* ============================================
   AMIS – Files Data ↔ Supabase repository layer
   ============================================
   Loaded BEFORE files-data.js. Exposes `window.FD_DB` with:
     - REPOS         : mapping of UI table id → DB table + field map
     - bootstrap(ctx): SELECT every table + render its <tbody>
     - insert(schemaKey, uiData) → { id, ui }
     - update(schemaKey, id, uiData) → { id, ui }
     - remove(schemaKey, id) → void
   The `ctx` argument passed to bootstrap is { onRow, onEmpty, wireRow }
   supplied by files-data.js to keep rendering rules in one place.
   ============================================ */
'use strict';

(function () {

  // Repo config -----------------------------------------------------
  // ui.name  – key used inside the UI schema (TABLE_SCHEMAS[...][*].id)
  // db.name  – actual Postgres column name
  // fk       – set when the UI field is a "select-table" foreign key
  //            { parent: 'regions', display: 'name' } means "look up
  //            the parent row by display=parent.<display>", persist
  //            <db.name>=parent.id, and on read embed parent as `parent`.
  const REPOS = {
    'tbl-coa': {
      table: 'chart_of_accounts',
      fields: [
        { ui: 'code', db: 'code' },
        { ui: 'name', db: 'name' },
        { ui: 'type', db: 'type' }
      ]
    },
    'tbl-category': {
      table: 'categories',
      fields: [
        { ui: 'name', db: 'name' },
        { ui: 'desc', db: 'description' }
      ]
    },
    'tbl-brand': {
      table: 'brands',
      fields: [
        { ui: 'name', db: 'name' },
        { ui: 'desc', db: 'description' }
      ]
    },
    'tbl-model': {
      table: 'models',
      fields: [
        { ui: 'name', db: 'name' },
        { ui: 'desc', db: 'description' }
      ]
    },
    'tbl-classification': {
      table: 'classifications',
      fields: [
        { ui: 'name', db: 'name' },
        { ui: 'desc', db: 'description' }
      ]
    },
    'tbl-uom': {
      table: 'units_of_measurement',
      fields: [
        { ui: 'name', db: 'name' },
        { ui: 'code', db: 'code' },
        { ui: 'desc', db: 'description' }
      ]
    },
    'tbl-supplier': {
      table: 'suppliers',
      fields: [
        { ui: 'name',    db: 'name' },
        { ui: 'contact', db: 'contact' },
        { ui: 'email',   db: 'email' }
      ]
    },
    'tbl-region': {
      table: 'regions',
      fields: [
        { ui: 'name', db: 'name' },
        { ui: 'code', db: 'code' }
      ]
    },
    'tbl-branch': {
      table: 'branches',
      fields: [
        { ui: 'name',   db: 'name' },
        { ui: 'code',   db: 'code' },
        { ui: 'region', db: 'region_id', fk: { parent: 'regions', alias: 'region', display: 'name' } },
        { ui: 'desc',   db: 'description' }
      ]
    },
    'tbl-office': {
      table: 'offices',
      fields: [
        { ui: 'name',   db: 'name' },
        { ui: 'branch', db: 'branch_id', fk: { parent: 'branches', alias: 'branch', display: 'name' } },
        { ui: 'desc',   db: 'description' }
      ]
    },
    'tbl-userdept': {
      table: 'user_departments',
      fields: [
        { ui: 'name', db: 'name' },
        { ui: 'desc', db: 'description' }
      ]
    },
    'tbl-jobtitle': {
      table: 'job_titles',
      fields: [
        { ui: 'name', db: 'name' },
        { ui: 'dept', db: 'department_id', fk: { parent: 'user_departments', alias: 'department', display: 'name' } },
        { ui: 'desc', db: 'description' }
      ]
    },
    'tbl-custodian': {
      table: 'custodian_types',
      fields: [
        { ui: 'name', db: 'name' },
        { ui: 'desc', db: 'description' }
      ]
    },
    'tbl-property': {
      table: 'property_items',
      fields: [
        { ui: 'code',  db: 'item_code' },
        { ui: 'desc',  db: 'description' },
        { ui: 'brand', db: 'brand_id', fk: { parent: 'brands', alias: 'brand', display: 'name' } },
        { ui: 'model', db: 'model_id', fk: { parent: 'models', alias: 'model', display: 'name' } }
      ]
    },
    'tbl-stock': {
      table: 'stock_items',
      fields: [
        { ui: 'code', db: 'item_code' },
        { ui: 'desc', db: 'description' },
        { ui: 'unit', db: 'unit_id', fk: { parent: 'units_of_measurement', alias: 'unit', display: 'name' } }
      ]
    },
    'tbl-task': {
      table: 'tasks',
      fields: [
        { ui: 'name',  db: 'name' },
        { ui: 'desc',  db: 'description' },
        { ui: 'steps', db: 'num_steps', integer: true }
      ]
    },
    'tbl-tag': {
      table: 'tags',
      fields: [
        { ui: 'tag',  db: 'name' },
        { ui: 'type', db: 'tag_type' },
        { ui: 'desc', db: 'description' }
      ]
    },
    'tbl-secq': {
      table: 'security_questions',
      fields: [
        { ui: 'question', db: 'question' }
      ]
    }
  };

  // Cache: parent-table name → Map<displayValue, id>
  const fkCache = {};

  async function db() {
    const client = await window.AMIS_READY;
    if (!client) throw new Error('Database is not configured (common/config.js missing?).');
    return client;
  }

  // Resolve one FK: given parent table + display value, return id.
  async function resolveFk(parentTable, display, value) {
    if (!value) return null;
    fkCache[parentTable] = fkCache[parentTable] || new Map();
    if (fkCache[parentTable].has(value)) return fkCache[parentTable].get(value);
    const client = await db();
    const { data, error } = await client
      .from(parentTable)
      .select(`id, ${display}`)
      .eq(display, value)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    fkCache[parentTable].set(value, data.id);
    return data.id;
  }

  // Invalidate FK cache for a table (called after insert/update/delete of parent).
  function invalidateFkCache(table) {
    delete fkCache[table];
  }

  // Convert UI-shape row → DB-shape row (resolving FKs).
  async function uiToDb(schemaKey, uiData) {
    const repo = REPOS[schemaKey];
    const row  = {};
    for (const f of repo.fields) {
      const raw = uiData[f.ui];
      const val = raw === undefined || raw === '' ? null : raw;
      if (f.fk) {
        row[f.db] = await resolveFk(f.fk.parent, f.fk.display, val);
      } else if (f.integer) {
        row[f.db] = val === null ? null : parseInt(val, 10);
      } else {
        row[f.db] = val;
      }
    }
    if ('active' in uiData) row.active = !!uiData.active;
    return row;
  }

  // Convert DB row → UI-shape row (using embedded FK aliases).
  function dbToUi(schemaKey, dbRow) {
    const repo = REPOS[schemaKey];
    const ui   = { id: dbRow.id, active: dbRow.active !== false };
    for (const f of repo.fields) {
      if (f.fk) {
        const parent = dbRow[f.fk.alias];
        ui[f.ui] = parent ? (parent[f.fk.display] || '') : '';
      } else {
        const v = dbRow[f.db];
        ui[f.ui] = v === null || v === undefined ? '' : v;
      }
    }
    return ui;
  }

  // Build the .select() string for a table, embedding FK aliases.
  function selectClause(schemaKey) {
    const repo = REPOS[schemaKey];
    const parts = ['*'];
    for (const f of repo.fields) {
      if (f.fk) parts.push(`${f.fk.alias}:${f.fk.parent}(${f.fk.display})`);
    }
    return parts.join(', ');
  }

  // Fetch all rows for a table (returns UI-shape).
  async function fetchAll(schemaKey) {
    const client = await db();
    const repo   = REPOS[schemaKey];
    const { data, error } = await client
      .from(repo.table)
      .select(selectClause(schemaKey))
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data.map(r => dbToUi(schemaKey, r));
  }

  // Insert one row. Returns UI-shape row (with .id).
  async function insert(schemaKey, uiData) {
    const client = await db();
    const repo   = REPOS[schemaKey];
    const dbRow  = await uiToDb(schemaKey, uiData);
    const { data, error } = await client
      .from(repo.table)
      .insert(dbRow)
      .select(selectClause(schemaKey))
      .single();
    if (error) throw error;
    invalidateFkCache(repo.table);
    return dbToUi(schemaKey, data);
  }

  // Update one row. Returns UI-shape row.
  async function update(schemaKey, id, uiData) {
    const client = await db();
    const repo   = REPOS[schemaKey];
    const dbRow  = await uiToDb(schemaKey, uiData);
    const { data, error } = await client
      .from(repo.table)
      .update(dbRow)
      .eq('id', id)
      .select(selectClause(schemaKey))
      .single();
    if (error) throw error;
    invalidateFkCache(repo.table);
    return dbToUi(schemaKey, data);
  }

  async function remove(schemaKey, id) {
    const client = await db();
    const repo   = REPOS[schemaKey];
    const { error } = await client.from(repo.table).delete().eq('id', id);
    if (error) throw error;
    invalidateFkCache(repo.table);
  }

  // Bootstrap: iterate all repos, load rows, hand each one back to
  // the caller so it can render a <tr>. Caller supplies:
  //   renderRow(schemaKey, uiRow)  – must return the created <tr>
  //   afterAll()                   – called once per table after all rows rendered
  async function bootstrap(ctx) {
    const client = await window.AMIS_READY;
    if (!client) {
      console.warn('[fd-db] Supabase not configured; showing static data only.');
      return;
    }
    const keys = Object.keys(REPOS);
    await Promise.all(keys.map(async schemaKey => {
      const repo  = REPOS[schemaKey];
      const tblEl = document.getElementById(schemaKey);
      if (!tblEl) return;
      const tbody = tblEl.querySelector('tbody');
      if (!tbody) return;

      try {
        const rows = await fetchAll(schemaKey);
        tbody.innerHTML = '';
        if (!rows.length) {
          const colCount = tblEl.querySelectorAll('thead th').length;
          tbody.innerHTML = '<tr><td colspan="' + colCount + '" class="fd-empty">No data available in table</td></tr>';
        } else {
          rows.forEach(r => ctx.renderRow(schemaKey, r));
        }
      } catch (err) {
        console.error('[fd-db] failed to load', repo.table, err);
        const colCount = tblEl.querySelectorAll('thead th').length;
        tbody.innerHTML = '<tr><td colspan="' + colCount + '" class="fd-empty">Failed to load (' + (err.message || 'error') + ')</td></tr>';
      }
      if (ctx.afterTable) ctx.afterTable(schemaKey, tblEl);
    }));
  }

  window.FD_DB = { REPOS, bootstrap, insert, update, remove: remove };
})();

-- ============================================================================
--  AMIS – Row-Level Security policies
--  Run AFTER 01_schema.sql.
--
--  Policy model (MVP):
--    - Everyone authenticated can SELECT reference / master data + records.
--    - Only Administrators (profiles.role = 'Administrator') can INSERT / UPDATE / DELETE.
--    - profiles: users can read all profiles, edit only their own; admins can edit any.
--    - audit_trail: everyone can INSERT (their own), admins can SELECT all.
--  Tighten later per module.
-- ============================================================================

-- Enable RLS on all public tables ---------------------------------------------
do $$
declare t text;
begin
  for t in
    select tablename from pg_tables where schemaname='public'
  loop
    execute format('alter table public.%I enable row level security;', t);
  end loop;
end $$;

-- Reusable helper policies via a function -------------------------------------
-- (Postgres doesn't have per-schema "grant policies" so we spell them out.)

-- ── profiles ────────────────────────────────────────────────────────────────
drop policy if exists "profiles: read all"           on public.profiles;
drop policy if exists "profiles: update self"        on public.profiles;
drop policy if exists "profiles: admin full access"  on public.profiles;

create policy "profiles: read all"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles: update self"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles: admin full access"
  on public.profiles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ── Generic master / operational tables ─────────────────────────────────────
-- Read for any authenticated user; write for Administrators only.
do $$
declare
  t text;
  master text[] := array[
    'chart_of_accounts','categories','brands','models','classifications',
    'units_of_measurement','suppliers','regions','branches','offices',
    'user_departments','job_titles','custodian_types','property_items',
    'stock_items','tasks','tags','security_questions',
    'property_records','stock_records',
    'goods_receipts','goods_receipt_items',
    'property_issuances','property_issuance_items',
    'property_requests','property_request_items',
    'property_transfers','property_transfer_items',
    'property_returns','property_return_items',
    'property_maintenances',
    'property_disposals','property_disposal_items',
    'stock_issuances','stock_issuance_items',
    'stock_requests','stock_request_items',
    'stock_returns','stock_return_items',
    'stock_disposals','stock_disposal_items',
    'gate_passes','gate_pass_items','personal_property_gate_passes',
    'inventory_counts','inventory_count_items','taggings'
  ];
begin
  foreach t in array master loop
    execute format('drop policy if exists "%1$s: authenticated read" on public.%1$I;', t);
    execute format('drop policy if exists "%1$s: admin write"        on public.%1$I;', t);

    execute format(
      'create policy "%1$s: authenticated read" on public.%1$I '
      'for select to authenticated using (true);', t);

    execute format(
      'create policy "%1$s: admin write" on public.%1$I '
      'for all to authenticated using (public.is_admin()) with check (public.is_admin());',
      t);
  end loop;
end $$;

-- ── audit_trail ─────────────────────────────────────────────────────────────
drop policy if exists "audit: insert own"  on public.audit_trail;
drop policy if exists "audit: admin read"  on public.audit_trail;

create policy "audit: insert own"
  on public.audit_trail for insert
  to authenticated
  with check (user_id = auth.uid() or user_id is null);

create policy "audit: admin read"
  on public.audit_trail for select
  to authenticated
  using (public.is_admin() or user_id = auth.uid());

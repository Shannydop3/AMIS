-- ============================================================================
--  AMIS – Automatic audit-trail triggers
--  Run this file in Supabase → SQL Editor → New query → paste → Run.
--
--  Every operational INSERT / UPDATE / DELETE writes a row to
--  public.audit_trail describing the change. All entries record the
--  authenticated user (auth.uid()), the entity name, the row PK, and
--  a small JSONB diff. RLS still governs who can *read* audit_trail.
--
--  Safe to re-run: functions are CREATE OR REPLACE and the loop drops
--  existing triggers before recreating them.
-- ============================================================================

-- Helper: current user's display name (falls back to email prefix / 'system').
create or replace function public.current_user_name()
returns text language sql stable security definer set search_path = public as $$
  select coalesce(
    (select full_name from public.profiles where id = auth.uid()),
    (select split_part(email,'@',1) from public.profiles where id = auth.uid()),
    'system'
  );
$$;

-- Generic audit trigger function ---------------------------------------------
create or replace function public.audit_row_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  entity_name text := TG_TABLE_NAME;
  entity_pk   uuid := null;
  verb        text;
  meta        jsonb := '{}'::jsonb;
begin
  if TG_OP = 'INSERT' then
    verb := 'Created';
    entity_pk := (row_to_json(NEW)->>'id')::uuid;
    meta := jsonb_build_object('new', to_jsonb(NEW));
  elsif TG_OP = 'UPDATE' then
    verb := 'Updated';
    entity_pk := (row_to_json(NEW)->>'id')::uuid;
    meta := jsonb_build_object(
      'before', to_jsonb(OLD),
      'after',  to_jsonb(NEW)
    );
  elsif TG_OP = 'DELETE' then
    verb := 'Deleted';
    entity_pk := (row_to_json(OLD)->>'id')::uuid;
    meta := jsonb_build_object('old', to_jsonb(OLD));
  end if;

  -- Never audit the audit_trail itself (would recurse forever).
  if entity_name = 'audit_trail' then
    return coalesce(NEW, OLD);
  end if;

  insert into public.audit_trail (
    user_id, user_name, activity, entity, entity_id, metadata
  ) values (
    auth.uid(),
    public.current_user_name(),
    verb || ' ' || entity_name,
    entity_name,
    entity_pk,
    meta
  );
  return coalesce(NEW, OLD);
end $$;

-- Attach the trigger to every operational table ------------------------------
do $$
declare
  t text;
  audited text[] := array[
    -- Master / reference
    'chart_of_accounts','categories','brands','models','classifications',
    'units_of_measurement','suppliers','regions','branches','offices',
    'user_departments','job_titles','custodian_types','property_items',
    'stock_items','tasks','tags','security_questions',
    -- Operational records
    'property_records','stock_records',
    -- Operational transactions
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
    'inventory_counts','inventory_count_items','taggings',
    -- Profile changes (not auth.users — that lives in auth schema)
    'profiles'
  ];
begin
  foreach t in array audited loop
    execute format(
      'drop trigger if exists trg_audit_%1$s on public.%1$I;'
      'create trigger trg_audit_%1$s '
      '  after insert or update or delete on public.%1$I '
      '  for each row execute function public.audit_row_change();',
      t
    );
  end loop;
end $$;

-- RLS on audit_trail was created in db/02_rls.sql:
--   INSERT: any authenticated user can insert their own row.
--   SELECT: administrators + the acting user themselves.
-- The trigger runs as SECURITY DEFINER so it bypasses the INSERT policy
-- (necessary because auth.uid() may be null during service tasks).

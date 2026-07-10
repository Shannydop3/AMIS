-- ============================================================================
--  AMIS – Supabase Postgres schema
--  Run this file in Supabase → SQL Editor → New query → paste → Run.
--  Safe to re-run: everything is CREATE IF NOT EXISTS / DROP-safe within
--  transactions where practical.
-- ============================================================================

-- Extensions ------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- Enums -----------------------------------------------------------------------
do $$ begin
  create type user_role      as enum ('Administrator','Staff','Viewer');
  exception when duplicate_object then null;
end $$;

do $$ begin
  create type account_type   as enum
    ('Asset','Liability','Equity','Revenue','Expense','Cost of Sales','Other Income','Other Expense');
  exception when duplicate_object then null;
end $$;

do $$ begin
  create type tag_type_enum  as enum
    ('Barcode and RFID Sticker','Barcode Sticker','RFID Hard Tag');
  exception when duplicate_object then null;
end $$;

do $$ begin
  create type record_status  as enum
    ('Draft','Pending','Approved','Rejected','Issued','Received',
     'In Transit','Returned','Disposed','Maintenance','Cancelled','Active','Inactive');
  exception when duplicate_object then null;
end $$;

-- ============================================================================
--  1. AUTH – profiles (extends Supabase auth.users)
-- ============================================================================
create table if not exists public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  full_name      text        not null,
  email          text        not null,
  role           user_role   not null default 'Staff',
  department_id  uuid,
  job_title_id   uuid,
  is_active      boolean     not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists idx_profiles_role on public.profiles(role);

-- Trigger: auto-create a profile row when auth.users gets a new user
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'Staff')
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Utility: current user's role
create or replace function public.current_role()
returns user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role from public.profiles where id = auth.uid()) = 'Administrator', false);
$$;

-- ============================================================================
--  2. MASTER / REFERENCE DATA  (Files Data page)
-- ============================================================================

create table if not exists public.chart_of_accounts (
  id          uuid primary key default gen_random_uuid(),
  code        text unique not null,
  name        text        not null,
  type        account_type not null,
  active      boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text unique not null,
  description text,
  active      boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.brands (
  id          uuid primary key default gen_random_uuid(),
  name        text unique not null,
  description text,
  active      boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.models (
  id          uuid primary key default gen_random_uuid(),
  name        text        not null,
  brand_id    uuid        references public.brands(id) on delete set null,
  description text,
  active      boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (name, brand_id)
);

create table if not exists public.classifications (
  id          uuid primary key default gen_random_uuid(),
  name        text unique not null,
  description text,
  active      boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.units_of_measurement (
  id          uuid primary key default gen_random_uuid(),
  name        text        not null,
  code        text unique not null,
  description text,
  active      boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.suppliers (
  id          uuid primary key default gen_random_uuid(),
  name        text unique not null,
  contact     text,
  email       text,
  active      boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.regions (
  id          uuid primary key default gen_random_uuid(),
  name        text unique not null,
  code        text unique not null,
  active      boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.branches (
  id          uuid primary key default gen_random_uuid(),
  name        text        not null,
  code        text unique not null,
  region_id   uuid        references public.regions(id) on delete set null,
  description text,
  active      boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.offices (
  id          uuid primary key default gen_random_uuid(),
  name        text        not null,
  branch_id   uuid        references public.branches(id) on delete set null,
  description text,
  active      boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (name, branch_id)
);

create table if not exists public.user_departments (
  id          uuid primary key default gen_random_uuid(),
  name        text unique not null,
  description text,
  active      boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.job_titles (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  department_id uuid references public.user_departments(id) on delete set null,
  description   text,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (name, department_id)
);

create table if not exists public.custodian_types (
  id          uuid primary key default gen_random_uuid(),
  name        text unique not null,
  description text,
  active      boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Property catalog (item template)
create table if not exists public.property_items (
  id                uuid primary key default gen_random_uuid(),
  item_code         text unique not null,
  description       text        not null,
  brand_id          uuid references public.brands(id)          on delete set null,
  model_id          uuid references public.models(id)          on delete set null,
  category_id       uuid references public.categories(id)      on delete set null,
  classification_id uuid references public.classifications(id) on delete set null,
  active            boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Stock catalog (item template)
create table if not exists public.stock_items (
  id                 uuid primary key default gen_random_uuid(),
  item_code          text unique not null,
  description        text        not null,
  unit_id            uuid references public.units_of_measurement(id) on delete set null,
  classification_id  uuid references public.classifications(id)      on delete set null,
  custodian_type_id  uuid references public.custodian_types(id)      on delete set null,
  min_stock_level    integer not null default 0,
  active             boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),
  name        text unique not null,
  description text,
  num_steps   smallint check (num_steps between 0 and 10),
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.tags (
  id          uuid primary key default gen_random_uuid(),
  name        text unique not null,
  tag_type    tag_type_enum not null,
  description text,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.security_questions (
  id          uuid primary key default gen_random_uuid(),
  question    text unique not null,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- FK back to profiles now that user_departments + job_titles exist
alter table public.profiles
  drop constraint if exists profiles_department_id_fkey,
  add  constraint profiles_department_id_fkey
       foreign key (department_id) references public.user_departments(id) on delete set null,
  drop constraint if exists profiles_job_title_id_fkey,
  add  constraint profiles_job_title_id_fkey
       foreign key (job_title_id) references public.job_titles(id) on delete set null;

-- ============================================================================
--  3. OPERATIONAL – individual property units (tagged assets)
-- ============================================================================
create table if not exists public.property_records (
  id                    uuid primary key default gen_random_uuid(),
  property_number       text unique not null,
  item_id               uuid references public.property_items(id) on delete set null,
  item_code             text,
  description           text,
  long_description      text,
  serial_number         text,
  category_id           uuid references public.categories(id),
  brand_id              uuid references public.brands(id),
  model_id              uuid references public.models(id),
  classification_id     uuid references public.classifications(id),
  supplier_id           uuid references public.suppliers(id),
  pr_number             text,
  po_number             text,
  invoice_number        text,
  dr_number             text,
  region_id             uuid references public.regions(id),
  branch_id             uuid references public.branches(id),
  office_id             uuid references public.offices(id),
  warehouse_name        text,
  location              text,
  area                  text,
  date_of_acquisition   date,
  useful_life           integer,
  acquired_cost         numeric(14,2),
  warranty_start_date   date,
  warranty_end_date     date,
  insurance_start_date  date,
  insurance_end_date    date,
  expiry_date           date,
  status                record_status not null default 'Active',
  assigned_to           uuid references public.profiles(id) on delete set null,
  disposed_date         date,
  issued_date           date,
  last_maintenance_date date,
  created_by            uuid references public.profiles(id),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index if not exists idx_prop_status on public.property_records(status);
create index if not exists idx_prop_office on public.property_records(office_id);
create index if not exists idx_prop_assigned on public.property_records(assigned_to);

-- Stock on hand
create table if not exists public.stock_records (
  id           uuid primary key default gen_random_uuid(),
  item_id      uuid references public.stock_items(id) on delete restrict,
  item_code    text not null,
  description  text,
  quantity     numeric(14,2) not null default 0,
  unit_id      uuid references public.units_of_measurement(id),
  region_id    uuid references public.regions(id),
  location     text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists idx_stock_item on public.stock_records(item_id);

-- ============================================================================
--  4. OPERATIONAL TRANSACTIONS  (headers + line items)
--     Kept lean; add columns per module UI as needed.
-- ============================================================================

-- Goods receipts
create table if not exists public.goods_receipts (
  id             uuid primary key default gen_random_uuid(),
  gr_number      text unique not null,
  supplier_id    uuid references public.suppliers(id),
  received_by    uuid references public.profiles(id),
  received_at    date not null default current_date,
  status         record_status not null default 'Received',
  remarks        text,
  created_at     timestamptz not null default now()
);

create table if not exists public.goods_receipt_items (
  id                 uuid primary key default gen_random_uuid(),
  goods_receipt_id   uuid not null references public.goods_receipts(id) on delete cascade,
  property_record_id uuid references public.property_records(id),
  stock_item_id      uuid references public.stock_items(id),
  quantity           numeric(14,2) not null default 1,
  unit_cost          numeric(14,2),
  remarks            text
);

-- Generic transaction pattern (issuance / request / transfer / return / disposal / maintenance)
-- One header table per transaction kind for reporting clarity.
create table if not exists public.property_issuances (
  id             uuid primary key default gen_random_uuid(),
  issuance_no    text unique not null,
  issued_by      uuid references public.profiles(id),
  issued_to      uuid references public.profiles(id),
  issued_at      date not null default current_date,
  status         record_status not null default 'Issued',
  remarks        text,
  created_at     timestamptz not null default now()
);
create table if not exists public.property_issuance_items (
  id                  uuid primary key default gen_random_uuid(),
  issuance_id         uuid not null references public.property_issuances(id) on delete cascade,
  property_record_id  uuid references public.property_records(id),
  quantity            integer not null default 1,
  remarks             text
);

create table if not exists public.property_requests (
  id             uuid primary key default gen_random_uuid(),
  request_number text unique not null,
  requested_by   uuid references public.profiles(id),
  return_date    date,
  status         record_status not null default 'Pending',
  remarks        text,
  created_at     timestamptz not null default now()
);
create table if not exists public.property_request_items (
  id            uuid primary key default gen_random_uuid(),
  request_id    uuid not null references public.property_requests(id) on delete cascade,
  item_id       uuid references public.property_items(id),
  quantity      integer not null default 1,
  remarks       text
);

create table if not exists public.property_transfers (
  id                 uuid primary key default gen_random_uuid(),
  transfer_number    text unique not null,
  transacted_by      uuid references public.profiles(id),
  from_office_id     uuid references public.offices(id),
  to_office_id       uuid references public.offices(id),
  transferred_at     date not null default current_date,
  status             record_status not null default 'Pending',
  remarks            text,
  created_at         timestamptz not null default now()
);
create table if not exists public.property_transfer_items (
  id                 uuid primary key default gen_random_uuid(),
  transfer_id        uuid not null references public.property_transfers(id) on delete cascade,
  property_record_id uuid references public.property_records(id),
  remarks            text
);

create table if not exists public.property_returns (
  id             uuid primary key default gen_random_uuid(),
  return_number  text unique not null,
  returned_by    uuid references public.profiles(id),
  returned_at    date not null default current_date,
  status         record_status not null default 'Returned',
  remarks        text,
  created_at     timestamptz not null default now()
);
create table if not exists public.property_return_items (
  id                 uuid primary key default gen_random_uuid(),
  return_id          uuid not null references public.property_returns(id) on delete cascade,
  property_record_id uuid references public.property_records(id),
  remarks            text
);

create table if not exists public.property_maintenances (
  id                 uuid primary key default gen_random_uuid(),
  maintenance_number text unique not null,
  property_record_id uuid references public.property_records(id),
  maintenance_type   text,
  created_by         uuid references public.profiles(id),
  scheduled_at       date,
  completed_at       date,
  status             record_status not null default 'Maintenance',
  remarks            text,
  created_at         timestamptz not null default now()
);

create table if not exists public.property_disposals (
  id              uuid primary key default gen_random_uuid(),
  disposal_number text unique not null,
  disposed_by     uuid references public.profiles(id),
  disposed_at     date not null default current_date,
  status          record_status not null default 'Disposed',
  remarks         text,
  created_at      timestamptz not null default now()
);
create table if not exists public.property_disposal_items (
  id                 uuid primary key default gen_random_uuid(),
  disposal_id        uuid not null references public.property_disposals(id) on delete cascade,
  property_record_id uuid references public.property_records(id),
  reason             text
);

-- Stock transactions
create table if not exists public.stock_issuances (
  id            uuid primary key default gen_random_uuid(),
  issuance_no   text unique not null,
  issued_by     uuid references public.profiles(id),
  issued_to     uuid references public.profiles(id),
  issued_at     date not null default current_date,
  status        record_status not null default 'Issued',
  remarks       text,
  created_at    timestamptz not null default now()
);
create table if not exists public.stock_issuance_items (
  id             uuid primary key default gen_random_uuid(),
  issuance_id    uuid not null references public.stock_issuances(id) on delete cascade,
  stock_item_id  uuid references public.stock_items(id),
  quantity       numeric(14,2) not null default 0,
  remarks        text
);

create table if not exists public.stock_requests (
  id             uuid primary key default gen_random_uuid(),
  request_number text unique not null,
  requested_by   uuid references public.profiles(id),
  requested_at   date not null default current_date,
  status         record_status not null default 'Pending',
  remarks        text,
  created_at     timestamptz not null default now()
);
create table if not exists public.stock_request_items (
  id            uuid primary key default gen_random_uuid(),
  request_id    uuid not null references public.stock_requests(id) on delete cascade,
  stock_item_id uuid references public.stock_items(id),
  quantity      numeric(14,2) not null default 0
);

create table if not exists public.stock_returns (
  id            uuid primary key default gen_random_uuid(),
  return_number text unique not null,
  returned_by   uuid references public.profiles(id),
  returned_at   date not null default current_date,
  status        record_status not null default 'Returned',
  remarks       text,
  created_at    timestamptz not null default now()
);
create table if not exists public.stock_return_items (
  id            uuid primary key default gen_random_uuid(),
  return_id     uuid not null references public.stock_returns(id) on delete cascade,
  stock_item_id uuid references public.stock_items(id),
  quantity      numeric(14,2) not null default 0
);

create table if not exists public.stock_disposals (
  id              uuid primary key default gen_random_uuid(),
  disposal_number text unique not null,
  disposed_by     uuid references public.profiles(id),
  disposed_at     date not null default current_date,
  status          record_status not null default 'Disposed',
  remarks         text,
  created_at      timestamptz not null default now()
);
create table if not exists public.stock_disposal_items (
  id            uuid primary key default gen_random_uuid(),
  disposal_id   uuid not null references public.stock_disposals(id) on delete cascade,
  stock_item_id uuid references public.stock_items(id),
  quantity      numeric(14,2) not null default 0
);

-- Gate passes
create table if not exists public.gate_passes (
  id               uuid primary key default gen_random_uuid(),
  gate_pass_number text unique not null,
  requested_by     uuid references public.profiles(id),
  purpose          text,
  status           record_status not null default 'Pending',
  issued_at        date not null default current_date,
  created_at       timestamptz not null default now()
);
create table if not exists public.gate_pass_items (
  id                 uuid primary key default gen_random_uuid(),
  gate_pass_id       uuid not null references public.gate_passes(id) on delete cascade,
  property_record_id uuid references public.property_records(id),
  remarks            text
);

create table if not exists public.personal_property_gate_passes (
  id               uuid primary key default gen_random_uuid(),
  day_pass_number  text unique not null,
  requested_by     uuid references public.profiles(id),
  purpose          text,
  status           record_status not null default 'Pending',
  issued_at        date not null default current_date,
  created_at       timestamptz not null default now()
);

-- Inventory counts
create table if not exists public.inventory_counts (
  id               uuid primary key default gen_random_uuid(),
  inventory_number text unique not null,
  inventory_name   text        not null,
  description      text,
  site             text,
  location         text,
  status           record_status not null default 'Draft',
  started_at       date,
  completed_at     date,
  created_by       uuid references public.profiles(id),
  created_at       timestamptz not null default now()
);
create table if not exists public.inventory_count_items (
  id                 uuid primary key default gen_random_uuid(),
  inventory_id       uuid not null references public.inventory_counts(id) on delete cascade,
  property_record_id uuid references public.property_records(id),
  counted            boolean not null default false,
  remarks            text
);

-- Tagging (label printing history)
create table if not exists public.taggings (
  id                 uuid primary key default gen_random_uuid(),
  property_record_id uuid references public.property_records(id),
  tag_id             uuid references public.tags(id),
  printer_name       text,
  ip_address         inet,
  created_at         timestamptz not null default now()
);

-- ============================================================================
--  5. AUDIT TRAIL
-- ============================================================================
create table if not exists public.audit_trail (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete set null,
  user_name   text,
  activity    text        not null,
  entity      text,
  entity_id   uuid,
  ip_address  inet,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists idx_audit_user on public.audit_trail(user_id);
create index if not exists idx_audit_date on public.audit_trail(created_at desc);

-- ============================================================================
--  6. updated_at auto-touch trigger (generic)
-- ============================================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
declare t text;
begin
  for t in
    select tablename from pg_tables
    where schemaname='public'
      and tablename in (
        'profiles','chart_of_accounts','categories','brands','models',
        'classifications','units_of_measurement','suppliers','regions',
        'branches','offices','user_departments','job_titles','custodian_types',
        'property_items','stock_items','tasks','tags','security_questions',
        'property_records','stock_records'
      )
  loop
    execute format(
      'drop trigger if exists trg_touch_%1$s on public.%1$I;'
      'create trigger trg_touch_%1$s before update on public.%1$I '
      '  for each row execute function public.touch_updated_at();',
      t);
  end loop;
end $$;

-- ============================================================================
--  AMIS – Make every FK that points at public.profiles use ON DELETE SET NULL.
--  Safe to re-run: the do-block rewrites existing constraints in place.
--  After running this once, deleting an auth.users row (which cascades to
--  public.profiles) will just NULL out that user's references in any
--  operational table, instead of blocking the delete.
-- ============================================================================
do $$
declare
  r record;
begin
  for r in
    select
      con.conname,
      cls.relname       as tbl,
      att.attname       as col
    from   pg_constraint con
    join   pg_class      cls  on cls.oid = con.conrelid
    join   pg_namespace  nsp  on nsp.oid = cls.relnamespace
    join   pg_attribute  att  on att.attrelid = cls.oid
                             and att.attnum   = con.conkey[1]
    where  con.contype   = 'f'
      and  nsp.nspname   = 'public'
      and  con.confrelid = 'public.profiles'::regclass
      and  con.confdeltype <> 'n'                -- 'n' = SET NULL
  loop
    execute format(
      'alter table public.%I drop constraint %I;'
      'alter table public.%I add constraint %I '
      '  foreign key (%I) references public.profiles(id) on delete set null;',
      r.tbl, r.conname,
      r.tbl, r.conname, r.col
    );
    raise notice 'rewrote %.% (%) to ON DELETE SET NULL', r.tbl, r.col, r.conname;
  end loop;
end $$;

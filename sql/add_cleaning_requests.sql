-- Allow clinic cleaning requests in the existing requests table.
-- Run once in the Supabase SQL editor.

do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'supply_requests'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%kind%'
  loop
    execute format('alter table public.supply_requests drop constraint %I', constraint_name);
  end loop;
end $$;

alter table public.supply_requests
  add constraint supply_requests_kind_check
  check (kind in ('external', 'internal', 'dispose', 'return', 'cleaning'));

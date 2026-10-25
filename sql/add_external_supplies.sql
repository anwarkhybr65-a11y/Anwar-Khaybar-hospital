-- Catalog used by external clinic requests.
-- Run once in the Supabase SQL editor.

create table if not exists public.external_supplies (
  id uuid primary key default gen_random_uuid(),
  item_name text not null default '',
  unit text not null default '',
  item_type text not null default '',
  supplier_id text not null default '',
  supplier_name text not null default '',
  price numeric not null default 0,
  stock integer not null default 0,
  expiry_date date,
  created_at timestamptz not null default now()
);

alter table public.external_supplies enable row level security;

drop policy if exists public_all_external_supplies on public.external_supplies;
create policy public_all_external_supplies on public.external_supplies
  for all to anon, authenticated using (true) with check (true);

grant select, insert, update, delete on public.external_supplies to anon, authenticated;

notify pgrst, 'reload schema';

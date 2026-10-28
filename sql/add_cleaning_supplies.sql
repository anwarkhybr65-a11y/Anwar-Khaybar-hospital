-- Cleaning supplies warehouse and withdrawals.
-- Run once in the Supabase SQL editor.

create table if not exists public.cleaning_inventory (
  id uuid primary key default gen_random_uuid(),
  item_name text not null default '',
  unit text not null default '',
  item_type text not null default '',
  supplier_id text not null default '',
  supplier_name text not null default '',
  price numeric not null default 0,
  stock integer not null default 0,
  min_stock integer not null default 1,
  updated_at timestamptz not null default now()
);

create table if not exists public.cleaning_withdrawals (
  id uuid primary key default gen_random_uuid(),
  item_id uuid,
  item_name text not null default '',
  unit text not null default '',
  department text not null default '',
  quantity integer not null default 0,
  unit_price numeric not null default 0,
  withdrawn_at date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.cleaning_inventory enable row level security;
alter table public.cleaning_withdrawals enable row level security;

drop policy if exists public_all_cleaning_inventory on public.cleaning_inventory;
create policy public_all_cleaning_inventory on public.cleaning_inventory
  for all to anon, authenticated using (true) with check (true);

drop policy if exists public_all_cleaning_withdrawals on public.cleaning_withdrawals;
create policy public_all_cleaning_withdrawals on public.cleaning_withdrawals
  for all to anon, authenticated using (true) with check (true);

grant select, insert, update, delete on public.cleaning_inventory to anon, authenticated;
grant select, insert, update, delete on public.cleaning_withdrawals to anon, authenticated;

notify pgrst, 'reload schema';

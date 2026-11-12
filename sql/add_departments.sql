-- مستودعات إضافية، سجل المدخلات، وسجل الصرف
-- نفّذ هذا الملف مرة واحدة من SQL Editor في Supabase
-- الأصناف الحالية تبقى في مستودع الأسنان

alter table public.dental_warehouse add column if not exists warehouse text not null default 'dental';

alter table public.dental_warehouse drop constraint if exists dental_warehouse_kind_check;
alter table public.dental_warehouse
  add constraint dental_warehouse_kind_check check (warehouse in ('dental', 'general', 'medical'));

create table if not exists public.warehouse_inputs (
  id uuid primary key default gen_random_uuid(),
  warehouse text not null default 'dental',
  product_id text not null default '',
  product_name text not null default '',
  unit text not null default '',
  quantity numeric not null default 0,
  recorded_at date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.dispense_log (
  id uuid primary key default gen_random_uuid(),
  clinic_id text not null default '',
  product_id text not null default '',
  product_name text not null default '',
  quantity numeric not null default 0,
  unit_price numeric not null default 0,
  dispensed_at date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.warehouse_inputs enable row level security;
alter table public.dispense_log enable row level security;

drop policy if exists public_all_warehouse_inputs on public.warehouse_inputs;
create policy public_all_warehouse_inputs on public.warehouse_inputs
  for all to anon, authenticated using (true) with check (true);

drop policy if exists public_all_dispense_log on public.dispense_log;
create policy public_all_dispense_log on public.dispense_log
  for all to anon, authenticated using (true) with check (true);

grant select, insert, update, delete on public.warehouse_inputs to anon, authenticated;
grant select, insert, update, delete on public.dispense_log to anon, authenticated;

notify pgrst, 'reload schema';

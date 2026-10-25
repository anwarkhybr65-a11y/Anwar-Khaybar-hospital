-- تاريخ الصلاحية وعلامة التلف في مستودع الأسنان، وسجل الإتلاف
-- نفّذ هذا الملف مرة واحدة من SQL Editor في Supabase

alter table public.dental_warehouse add column if not exists expiry_date date;
alter table public.dental_warehouse add column if not exists damaged boolean not null default false;

create table if not exists public.disposal_log (
  id uuid primary key default gen_random_uuid(),
  product_id text,
  product_name text,
  unit text,
  item_type text,
  supplier_name text,
  quantity numeric not null default 0,
  unit_price numeric not null default 0,
  reason text not null,
  expiry_date date,
  disposed_at date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.disposal_log enable row level security;
drop policy if exists "public_all_disposal_log" on public.disposal_log;
create policy "public_all_disposal_log" on public.disposal_log for all using (true) with check (true);
grant all on public.disposal_log to anon, authenticated;

notify pgrst, 'reload schema';

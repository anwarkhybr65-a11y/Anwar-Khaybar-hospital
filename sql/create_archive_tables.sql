-- أرشيف الموقع: جدول واحد لملفات السحوبات، وجدول لسجل الأسعار
-- نفّذ هذا الملف مرة واحدة من SQL Editor في Supabase

create table if not exists public.archive_withdrawals (
  id uuid primary key default gen_random_uuid(),
  clinic_id text,
  product_name text,
  product_id text,
  withdrawal_date date,
  quantity numeric default 0,
  requester text,
  unit_price numeric default 0,
  source_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.archive_prices (
  id uuid primary key default gen_random_uuid(),
  item_id text,
  item_name text,
  item_type text,
  unit text,
  supplier_id text,
  supplier_name text,
  price numeric default 0,
  recorded_date date,
  created_at timestamptz not null default now()
);

alter table public.archive_withdrawals enable row level security;
alter table public.archive_prices enable row level security;

drop policy if exists "public_all_archive_withdrawals" on public.archive_withdrawals;
drop policy if exists "public_all_archive_prices" on public.archive_prices;

create policy "public_all_archive_withdrawals" on public.archive_withdrawals for all using (true) with check (true);
create policy "public_all_archive_prices" on public.archive_prices for all using (true) with check (true);

grant all on public.archive_withdrawals to anon, authenticated;
grant all on public.archive_prices to anon, authenticated;

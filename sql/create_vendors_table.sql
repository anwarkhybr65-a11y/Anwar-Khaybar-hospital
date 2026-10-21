-- جدول الموردين
-- نفّذ هذا الملف مرة واحدة من SQL Editor في Supabase

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text,
  phone text,
  email text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.vendors enable row level security;

drop policy if exists "public_all_vendors" on public.vendors;
create policy "public_all_vendors" on public.vendors for all using (true) with check (true);

grant all on public.vendors to anon, authenticated;

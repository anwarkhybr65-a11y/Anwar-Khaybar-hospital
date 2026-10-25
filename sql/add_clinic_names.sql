-- أسماء العيادات القابلة للتعديل من الإعدادات
-- نفّذ هذا الملف مرة واحدة من SQL Editor في Supabase

create table if not exists public.clinic_names (
  id text primary key,
  name text not null,
  updated_at timestamptz not null default now()
);

alter table public.clinic_names enable row level security;
drop policy if exists "public_all_clinic_names" on public.clinic_names;
create policy "public_all_clinic_names" on public.clinic_names for all using (true) with check (true);
grant all on public.clinic_names to anon, authenticated;

notify pgrst, 'reload schema';

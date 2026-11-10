-- حد تنبيه النفاد لكل صنف
-- نفّذ هذا الملف مرة واحدة من SQL Editor في Supabase

alter table public.dental_warehouse
  add column if not exists min_stock integer not null default 6;

alter table public.clinic_inventory
  add column if not exists min_stock integer not null default 6;

notify pgrst, 'reload schema';

-- السعر الفعلي المدفوع لكل صنف، ويُستخدم عند وجود تخفيض من المورد
-- نفّذ هذا الملف مرة واحدة من SQL Editor في Supabase

alter table public.dental_warehouse add column if not exists actual_price numeric;
alter table public.emergency_supplies add column if not exists actual_price numeric;
alter table public.external_supplies add column if not exists actual_price numeric;
alter table public.cleaning_inventory add column if not exists actual_price numeric;

notify pgrst, 'reload schema';

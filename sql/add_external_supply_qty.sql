-- Quantity and expiry for the external supplies catalog.
-- Run once in the Supabase SQL editor.

alter table public.external_supplies add column if not exists stock integer not null default 0;
alter table public.external_supplies add column if not exists expiry_date date;

notify pgrst, 'reload schema';

-- Daily account activity log.
-- Run once in the Supabase SQL editor.

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  username text not null default '',
  role text not null default '',
  staff_kind text not null default '',
  clinic_id text not null default '',
  action text not null default '',
  detail text not null default '',
  happened_at timestamptz not null default now()
);

alter table public.activity_log enable row level security;

drop policy if exists public_all_activity_log on public.activity_log;
create policy public_all_activity_log on public.activity_log
  for all to anon, authenticated using (true) with check (true);

grant select, insert, update, delete on public.activity_log to anon, authenticated;

notify pgrst, 'reload schema';

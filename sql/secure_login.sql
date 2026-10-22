-- تسجيل الدخول بدون تخزين كلمات المرور في المتصفح
-- نفّذ هذا الملف مرة واحدة من SQL Editor في Supabase
-- التحقق يتم داخل قاعدة البيانات، والملف يخزن بصمة bcrypt فقط

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  letter text not null,
  color text not null,
  created_at timestamptz not null default now()
);

alter table public.app_users enable row level security;

revoke all on table public.app_users from anon, authenticated;

insert into public.app_users (username, password_hash, letter, color)
values
  ('يوسف الجهني', '$2a$10$aHGeVXbnXjp1slgRDVq6.OoaCc0lPko.XowD6.sZs2cHm97cwG226', 'ي', '#0d6e6e'),
  ('احمد الجيزاوي', '$2a$10$bB2GBklj3qjm0JHc0nGvEe7Q.eAyjpR4FxjoezcEo2MKPg5dwk0m6', 'أ', '#0b2c3d'),
  ('الإدارة', '$2a$10$iEaLqmVdzIdEOY1xpX8t1eIhDZ8Exatrt5TevERaGPD/iZ/oO.teO', 'إ', '#c9a227'),
  ('خدمة العملاء', '$2a$10$KLyuqqr0lbbambl4MS8TROvIgTOIv2bn/zDrkWtAYHEoANJpfYTHa', 'خ', '#1b8a5a')
on conflict (username) do update
  set password_hash = excluded.password_hash,
      letter = excluded.letter,
      color = excluded.color;

create or replace function public.login_app_user(p_username text, p_password text)
returns table (username text, letter text, color text)
language sql
stable
security definer
set search_path = public, extensions
as $$
  select u.username, u.letter, u.color
  from public.app_users u
  where u.username = p_username
    and u.password_hash = crypt(p_password, u.password_hash);
$$;

revoke all on function public.login_app_user(text, text) from public;
grant execute on function public.login_app_user(text, text) to anon, authenticated;

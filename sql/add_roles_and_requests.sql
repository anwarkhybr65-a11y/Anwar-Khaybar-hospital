-- Roles, account management, clinic requests, and clinic stock.
-- Run once in the Supabase SQL editor after secure_login.sql.
-- This file never contains passwords.

alter table public.app_users add column if not exists role text not null default 'admin';
alter table public.app_users add column if not exists clinic_id text not null default '';
alter table public.app_users add column if not exists staff_kind text not null default '';
alter table public.app_users add column if not exists is_banned boolean not null default false;

alter table public.app_users drop constraint if exists app_users_role_check;
alter table public.app_users
  add constraint app_users_role_check check (role in ('admin', 'deputy', 'staff'));

alter table public.app_users drop constraint if exists app_users_staff_kind_check;
alter table public.app_users
  add constraint app_users_staff_kind_check check (staff_kind in ('', 'doctor', 'nurse'));

create table if not exists public.supply_requests (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('external', 'internal', 'dispose', 'return')),
  clinic_id text not null default '',
  product_id text not null default '',
  product_name text not null default '',
  quantity numeric not null default 0,
  expiry_date date,
  note text not null default '',
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_by text not null default '',
  created_at timestamptz not null default now(),
  reviewed_by text not null default '',
  reviewed_at timestamptz,
  applied boolean not null default false,
  saved boolean not null default false
);

alter table public.supply_requests add column if not exists saved boolean not null default false;

create table if not exists public.clinic_inventory (
  id uuid primary key default gen_random_uuid(),
  clinic_id text not null default '',
  product_id text not null default '',
  product_name text not null default '',
  unit text not null default '',
  quantity numeric not null default 0,
  expiry_date date,
  updated_at timestamptz not null default now()
);

alter table public.supply_requests enable row level security;
alter table public.clinic_inventory enable row level security;

drop policy if exists public_all_supply_requests on public.supply_requests;
create policy public_all_supply_requests on public.supply_requests
  for all to anon, authenticated using (true) with check (true);

drop policy if exists public_all_clinic_inventory on public.clinic_inventory;
create policy public_all_clinic_inventory on public.clinic_inventory
  for all to anon, authenticated using (true) with check (true);

grant select, insert, update, delete on public.supply_requests to anon, authenticated;
grant select, insert, update, delete on public.clinic_inventory to anon, authenticated;

create or replace function public.random_login_code(p_len integer, p_chars text)
returns text
language plpgsql
as $$
declare
  result text := '';
  i integer;
begin
  for i in 1..p_len loop
    result := result || substr(p_chars, 1 + floor(random() * length(p_chars))::integer, 1);
  end loop;
  return result;
end;
$$;

revoke all on function public.random_login_code(integer, text) from public, anon, authenticated;

drop function if exists public.login_app_user(text, text);

create or replace function public.login_app_user(p_username text, p_password text)
returns table (
  username text,
  letter text,
  color text,
  role text,
  clinic_id text,
  staff_kind text,
  is_banned boolean
)
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  return query
  select u.username, u.letter, u.color, u.role, u.clinic_id, u.staff_kind, u.is_banned
  from public.app_users u
  where u.username = btrim(p_username)
    and u.password_hash = crypt(p_password, u.password_hash)
  limit 1;
end;
$$;

revoke all on function public.login_app_user(text, text) from public;
grant execute on function public.login_app_user(text, text) to anon, authenticated;

create or replace function public.assert_admin(p_actor text, p_password text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if not exists (
    select 1 from public.app_users u
    where u.username = btrim(p_actor)
      and u.role = 'admin'
      and u.is_banned = false
      and u.password_hash = crypt(p_password, u.password_hash)
  ) then
    raise exception 'admin_required';
  end if;
end;
$$;

revoke all on function public.assert_admin(text, text) from public, anon, authenticated;

create or replace function public.list_app_users(p_actor text, p_password text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  perform public.assert_admin(p_actor, p_password);
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'username', u.username,
      'role', u.role,
      'clinicId', u.clinic_id,
      'staffKind', u.staff_kind,
      'banned', u.is_banned,
      'letter', u.letter
    ) order by u.role, u.username)
    from public.app_users u
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.list_app_users(text, text) from public;
grant execute on function public.list_app_users(text, text) to anon, authenticated;

create or replace function public.manage_app_user(
  p_actor text,
  p_password text,
  p_action text,
  p_role text default '',
  p_clinic_id text default '',
  p_staff_kind text default '',
  p_target text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  new_username text;
  new_password text;
  tries integer := 0;
  admin_count integer;
  deputy_count integer;
  staff_count integer;
begin
  perform public.assert_admin(p_actor, p_password);

  if p_action = 'create' then
    if p_role not in ('admin', 'deputy', 'staff') then
      return jsonb_build_object('ok', false, 'message', 'invalid_role');
    end if;
    if p_role = 'staff' and (btrim(p_clinic_id) = '' or p_staff_kind not in ('doctor', 'nurse')) then
      return jsonb_build_object('ok', false, 'message', 'staff_details_required');
    end if;

    select count(*) into admin_count from public.app_users where role = 'admin' and is_banned = false;
    select count(*) into deputy_count from public.app_users where role = 'deputy' and is_banned = false;
    if p_role = 'admin' and admin_count >= 2 then
      return jsonb_build_object('ok', false, 'message', 'admin_limit');
    end if;
    if p_role = 'deputy' and deputy_count >= 1 then
      return jsonb_build_object('ok', false, 'message', 'deputy_limit');
    end if;
    if p_role = 'staff' then
      select count(*) into staff_count
      from public.app_users
      where role = 'staff' and is_banned = false
        and clinic_id = btrim(p_clinic_id) and staff_kind = p_staff_kind;
      if staff_count >= 1 then
        return jsonb_build_object('ok', false, 'message', 'staff_limit');
      end if;
    end if;

    loop
      tries := tries + 1;
      new_username := public.random_login_code(4, 'ABCDEFGHJKLMNPQRSTUVWXYZ@#$&*');
      exit when not exists (select 1 from public.app_users where username = new_username);
      if tries > 30 then
        return jsonb_build_object('ok', false, 'message', 'username_failed');
      end if;
    end loop;
    new_password := public.random_login_code(6, '0123456789');

    insert into public.app_users (username, password_hash, letter, color, role, clinic_id, staff_kind, is_banned)
    values (
      new_username,
      crypt(new_password, gen_salt('bf')),
      substr(new_username, 1, 1),
      case p_role when 'admin' then '#1e3a5f' when 'deputy' then '#0f6e56' else '#3d4f66' end,
      p_role,
      case when p_role = 'staff' then btrim(p_clinic_id) else '' end,
      case when p_role = 'staff' then p_staff_kind else '' end,
      false
    );

    return jsonb_build_object('ok', true, 'username', new_username, 'password', new_password);
  end if;

  if btrim(p_target) = '' or btrim(p_target) = btrim(p_actor) then
    return jsonb_build_object('ok', false, 'message', 'invalid_target');
  end if;

  if p_action = 'ban' then
    update public.app_users set is_banned = true where username = btrim(p_target);
    return jsonb_build_object('ok', true);
  end if;

  if p_action = 'unban' then
    update public.app_users set is_banned = false where username = btrim(p_target);
    return jsonb_build_object('ok', true);
  end if;

  if p_action = 'reset' then
    new_password := public.random_login_code(6, '0123456789');
    update public.app_users
    set password_hash = crypt(new_password, gen_salt('bf'))
    where username = btrim(p_target);
    if not found then
      return jsonb_build_object('ok', false, 'message', 'not_found');
    end if;
    return jsonb_build_object('ok', true, 'username', btrim(p_target), 'password', new_password);
  end if;

  return jsonb_build_object('ok', false, 'message', 'invalid_action');
end;
$$;

revoke all on function public.manage_app_user(text, text, text, text, text, text, text) from public;
grant execute on function public.manage_app_user(text, text, text, text, text, text, text) to anon, authenticated;

notify pgrst, 'reload schema';

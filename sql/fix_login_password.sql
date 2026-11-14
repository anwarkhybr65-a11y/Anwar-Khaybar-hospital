-- يجعل الرقم الظاهر في جدول الإدارة هو كلمة المرور التي يقبلها الدخول.
-- شغّل هذا الملف مرة واحدة ثم أعد تحميل الصفحة.
-- الملف لا يحتوي كلمات مرور.

alter table public.app_users
  add column if not exists password_note text not null default '';

create or replace function public.login_name_key(p_name text)
returns text
language sql
immutable
as $$
  select regexp_replace(
    translate(btrim(coalesce(p_name, '')), 'أإآىةؤئ', 'ااايهاي'),
    '\s+', '', 'g'
  );
$$;

revoke all on function public.login_name_key(text) from public, anon, authenticated;

create or replace function public.password_note_matches(p_note text, p_typed text)
returns boolean
language sql
immutable
as $$
  select btrim(coalesce(p_note, '')) ~ '^[0-9]{6}$'
     and btrim(p_note) = btrim(coalesce(p_typed, ''));
$$;

revoke all on function public.password_note_matches(text, text) from public, anon, authenticated;

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
declare
  typed text := btrim(p_password);
  found_username text;
  found_letter text;
  found_color text;
  found_role text;
  found_clinic text;
  found_kind text;
  found_banned boolean;
  found_hash text;
  found_note text;
begin
  select u.username, u.letter, u.color, u.role, u.clinic_id, u.staff_kind, u.is_banned, u.password_hash, btrim(coalesce(u.password_note, ''))
  into found_username, found_letter, found_color, found_role, found_clinic, found_kind, found_banned, found_hash, found_note
  from public.app_users u
  where public.login_name_key(u.username) = public.login_name_key(p_username)
    and (
      u.password_hash = crypt(typed, u.password_hash)
      or public.password_note_matches(u.password_note, typed)
      or (btrim(coalesce(u.password_hash, '')) ~ '^[0-9]{6}$' and btrim(u.password_hash) = typed)
    )
  order by case when u.username = btrim(p_username) then 0 else 1 end
  limit 1;

  if found_username is null then
    return;
  end if;

  begin
    if found_hash is distinct from crypt(typed, found_hash) then
      update public.app_users
      set password_hash = crypt(typed, gen_salt('bf')),
          password_note = typed
      where username = found_username;
    elsif found_note is distinct from typed then
      update public.app_users
      set password_note = typed
      where username = found_username;
    end if;
  exception when others then
    null;
  end;

  return query
  select found_username, found_letter, found_color, found_role, found_clinic, found_kind, found_banned;
end;
$$;

revoke all on function public.login_app_user(text, text) from public;
grant execute on function public.login_app_user(text, text) to anon, authenticated;

create or replace function public.manage_app_user(
  p_actor text,
  p_password text,
  p_action text,
  p_role text default '',
  p_clinic_id text default '',
  p_staff_kind text default '',
  p_target text default '',
  p_username text default ''
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

  if p_action = 'rename' then
    if btrim(p_target) = '' or btrim(p_username) = '' then
      return jsonb_build_object('ok', false, 'message', 'invalid_target');
    end if;
    if btrim(p_target) = btrim(p_username) then
      return jsonb_build_object('ok', true, 'username', btrim(p_username));
    end if;
    if exists (select 1 from public.app_users where username = btrim(p_username)) then
      return jsonb_build_object('ok', false, 'message', 'username_taken');
    end if;
    update public.app_users
    set username = btrim(p_username),
        letter = substr(btrim(p_username), 1, 1)
    where username = btrim(p_target);
    if not found then
      return jsonb_build_object('ok', false, 'message', 'not_found');
    end if;
    return jsonb_build_object('ok', true, 'username', btrim(p_username));
  end if;

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

    if btrim(p_username) <> '' then
      new_username := btrim(p_username);
      if exists (select 1 from public.app_users where username = new_username) then
        return jsonb_build_object('ok', false, 'message', 'username_taken');
      end if;
    else
      loop
        tries := tries + 1;
        new_username := public.random_login_code(4, 'ABCDEFGHJKLMNPQRSTUVWXYZ@#$&*');
        exit when not exists (select 1 from public.app_users where username = new_username);
        if tries > 30 then
          return jsonb_build_object('ok', false, 'message', 'username_failed');
        end if;
      end loop;
    end if;
    new_password := public.random_login_code(6, '0123456789');

    insert into public.app_users (username, password_hash, letter, color, role, clinic_id, staff_kind, is_banned, password_note)
    values (
      new_username,
      crypt(new_password, gen_salt('bf')),
      substr(new_username, 1, 1),
      case p_role when 'admin' then '#1e3a5f' when 'deputy' then '#0f6e56' else '#3d4f66' end,
      p_role,
      case when p_role = 'staff' then btrim(p_clinic_id) else '' end,
      case when p_role = 'staff' then p_staff_kind else '' end,
      false,
      new_password
    );

    return jsonb_build_object('ok', true, 'username', new_username, 'password', new_password);
  end if;

  if p_action = 'set_password' then
    if btrim(p_target) = '' then
      return jsonb_build_object('ok', false, 'message', 'invalid_target');
    end if;
    if btrim(p_username) !~ '^[0-9]{6}$' then
      return jsonb_build_object('ok', false, 'message', 'invalid_password');
    end if;
    update public.app_users
    set password_hash = crypt(btrim(p_username), gen_salt('bf')),
        password_note = btrim(p_username)
    where username = btrim(p_target);
    if not found then
      return jsonb_build_object('ok', false, 'message', 'not_found');
    end if;
    return jsonb_build_object('ok', true, 'username', btrim(p_target));
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
    set password_hash = crypt(new_password, gen_salt('bf')),
        password_note = new_password
    where username = btrim(p_target);
    if not found then
      return jsonb_build_object('ok', false, 'message', 'not_found');
    end if;
    return jsonb_build_object('ok', true, 'username', btrim(p_target), 'password', new_password);
  end if;

  return jsonb_build_object('ok', false, 'message', 'invalid_action');
end;
$$;

revoke all on function public.manage_app_user(text, text, text, text, text, text, text, text) from public;
grant execute on function public.manage_app_user(text, text, text, text, text, text, text, text) to anon, authenticated;

notify pgrst, 'reload schema';

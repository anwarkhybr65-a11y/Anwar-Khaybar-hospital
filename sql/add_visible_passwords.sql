-- يحفظ كلمة المرور لتظهر دائماً داخل حساب الإدارة فقط.
-- شغّل هذا الملف مرة واحدة ثم أعد تحميل الصفحة.
-- الملف لا يحتوي كلمات مرور.

alter table public.app_users add column if not exists password_note text not null default '';

create or replace function public.list_app_users(p_actor text, p_password text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  perform public.assert_admin(p_actor, p_password);
  update public.app_users
  set password_note = btrim(p_password)
  where username = btrim(p_actor);
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'username', u.username,
      'role', u.role,
      'clinicId', u.clinic_id,
      'staffKind', u.staff_kind,
      'banned', u.is_banned,
      'letter', u.letter,
      'password', u.password_note
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

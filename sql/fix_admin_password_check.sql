-- يجعل عرض الحسابات يقبل نفس كلمة مرور المسؤول التي يقبلها تسجيل الدخول.
-- شغّل هذا الملف مرة واحدة ثم أعد تحميل الصفحة.
-- الملف لا يحتوي كلمات مرور ولا يغيّر أسماء الحسابات.

create or replace function public.assert_admin(p_actor text, p_password text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  typed text := translate(btrim(coalesce(p_password, '')), '٠١٢٣٤٥٦٧٨٩', '0123456789');
  found_username text;
  found_hash text;
  found_note text;
begin
  select u.username, u.password_hash, btrim(coalesce(u.password_note, ''))
  into found_username, found_hash, found_note
  from public.app_users u
  where u.role = 'admin'
    and u.is_banned = false
    and (
      u.password_hash = crypt(typed, u.password_hash)
      or public.password_note_matches(u.password_note, typed)
      or (
        translate(btrim(coalesce(u.password_hash, '')), '٠١٢٣٤٥٦٧٨٩', '0123456789') ~ '^[0-9]{6}$'
        and translate(btrim(u.password_hash), '٠١٢٣٤٥٦٧٨٩', '0123456789') = typed
      )
    )
  order by case when public.login_name_key(u.username) = public.login_name_key(p_actor) then 0 else 1 end
  limit 1;

  if found_username is null then
    raise exception 'admin_required';
  end if;

  begin
    if found_hash is distinct from crypt(typed, found_hash) then
      update public.app_users
      set password_hash = crypt(typed, gen_salt('bf')),
          password_note = typed
      where app_users.username = found_username;
    elsif found_note is distinct from typed then
      update public.app_users
      set password_note = typed
      where app_users.username = found_username;
    end if;
  exception when others then
    null;
  end;
end;
$$;

revoke all on function public.assert_admin(text, text) from public, anon, authenticated;

notify pgrst, 'reload schema';

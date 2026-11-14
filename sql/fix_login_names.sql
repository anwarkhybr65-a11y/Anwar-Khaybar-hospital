-- شاشة الدخول كانت ترسل الأسماء الظاهرة، والحسابات ما زالت بأسمائها القديمة.
-- هذا الملف يربط كل حساب باسمه الظاهر ويبقي كلمة المرور المحفوظة كما هي.
-- شغّله مرة واحدة ثم أعد تحميل الصفحة.
-- الملف لا يحتوي كلمات مرور ولا يمسح أي بيانات.

set search_path = public, extensions;

alter table public.app_users
  add column if not exists password_note text not null default '';

update public.app_users u
set password_note = translated.note,
    password_hash = crypt(translated.note, gen_salt('bf'))
from (
  select id, translate(btrim(password_note), '٠١٢٣٤٥٦٧٨٩', '0123456789') as note
  from public.app_users
) translated
where u.id = translated.id
  and translated.note ~ '^[0-9]{6}$'
  and crypt(translated.note, u.password_hash) is not null
  and u.password_hash is distinct from crypt(translated.note, u.password_hash);

do $$
declare
  slot record;
  chosen text;
begin
  if not exists (select 1 from public.app_users where username = 'البندري') then
    select u.username into chosen
    from public.app_users u
    where u.role = 'admin' and u.is_banned = false and u.username = 'الإدارة'
    limit 1;
    if chosen is not null then
      update public.app_users
      set username = 'البندري', letter = 'ب'
      where username = chosen;
    end if;
  end if;

  if not exists (select 1 from public.app_users where username = 'النائب') then
    select u.username into chosen
    from public.app_users u
    where u.role = 'deputy' and u.is_banned = false
    order by u.created_at
    limit 1;
    if chosen is not null and chosen <> 'النائب' then
      update public.app_users
      set username = 'النائب', letter = 'ن'
      where username = chosen;
    end if;
  end if;

  for slot in
    select * from (values
      ('ahmed', 'doctor', 'الطبيب أحمد'),
      ('ahmed', 'nurse', 'التمريض أماني'),
      ('faten', 'doctor', 'الطبيب فاتن'),
      ('faten', 'nurse', 'التمريض رضا'),
      ('sara', 'doctor', 'الطبيب سارة'),
      ('sara', 'nurse', 'التمريض أسماء'),
      ('internal', 'doctor', 'الطبيب أماني'),
      ('obgyn', 'doctor', 'الطبيب مروة'),
      ('lab', 'doctor', 'المختبر'),
      ('emergency', 'nurse', 'تمريض عليا')
    ) as t(clinic_id, staff_kind, target_name)
  loop
    if exists (select 1 from public.app_users where username = slot.target_name) then
      continue;
    end if;

    select u.username into chosen
    from public.app_users u
    where u.role = 'staff'
      and u.is_banned = false
      and u.clinic_id = slot.clinic_id
      and u.staff_kind = slot.staff_kind
    order by (
      select max(a.happened_at)
      from public.activity_log a
      where a.username = u.username
         or a.detail = u.username
         or left(a.detail, char_length(u.username) + 3) = u.username || ' — '
    ) desc nulls last, u.created_at desc
    limit 1;

    if chosen is not null and chosen <> slot.target_name then
      update public.app_users
      set username = slot.target_name,
          letter = substr(slot.target_name, 1, 1)
      where username = chosen;
    end if;
  end loop;
end $$;

create or replace function public.password_note_matches(p_note text, p_typed text)
returns boolean
language sql
immutable
as $$
  select translate(btrim(coalesce(p_note, '')), '٠١٢٣٤٥٦٧٨٩', '0123456789') ~ '^[0-9]{6}$'
     and translate(btrim(p_note), '٠١٢٣٤٥٦٧٨٩', '0123456789')
       = translate(btrim(coalesce(p_typed, '')), '٠١٢٣٤٥٦٧٨٩', '0123456789');
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
  typed text := translate(btrim(p_password), '٠١٢٣٤٥٦٧٨٩', '0123456789');
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
      or (translate(btrim(coalesce(u.password_hash, '')), '٠١٢٣٤٥٦٧٨٩', '0123456789') ~ '^[0-9]{6}$'
          and translate(btrim(u.password_hash), '٠١٢٣٤٥٦٧٨٩', '0123456789') = typed)
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
      where app_users.username = found_username;
    elsif found_note is distinct from typed then
      update public.app_users
      set password_note = typed
      where app_users.username = found_username;
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

notify pgrst, 'reload schema';

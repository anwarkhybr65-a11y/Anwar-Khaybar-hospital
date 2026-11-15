-- يعرض أسماء الدخول للشاشة بدون كلمات المرور، حتى يظهر الاسم بعد تغييره.
-- شغّل هذا الملف مرة واحدة ثم أعد تحميل الصفحة.
-- الملف لا يحتوي كلمات مرور ولا يغيّر الحسابات.

create or replace function public.list_login_accounts()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select jsonb_agg(jsonb_build_object(
      'username', u.username,
      'role', u.role,
      'clinicId', u.clinic_id,
      'staffKind', u.staff_kind
    ) order by u.role, u.username)
    from public.app_users u
    where u.is_banned = false
  ), '[]'::jsonb);
$$;

revoke all on function public.list_login_accounts() from public;
grant execute on function public.list_login_accounts() to anon, authenticated;

notify pgrst, 'reload schema';

-- مستودع الأسنان، مستلزمات الطوارئ، وسجل السحوبات
-- نفّذ هذا الملف مرة واحدة من SQL Editor في Supabase
-- الخصم يتم داخل قاعدة البيانات عند تسجيل سحب جديد، ويُعاد عند حذف ذلك السحب
-- السحوبات القديمة تُنسخ دون خصم حتى لا تتغير الكميات المحفوظة مسبقًا

create or replace function public.try_jsonb(value text)
returns jsonb
language plpgsql
immutable
as $$
begin
  if value is null or btrim(value) = '' then
    return null;
  end if;
  return value::jsonb;
exception when others then
  return null;
end;
$$;

create table if not exists public.dental_warehouse (
  id uuid primary key default gen_random_uuid(),
  item_name text not null,
  unit text,
  item_type text,
  supplier_id text,
  supplier_name text,
  price numeric not null default 0,
  stock numeric,
  source_id text,
  updated_at timestamptz,
  created_at timestamptz not null default now(),
  constraint dental_warehouse_stock_nonnegative check (stock is null or stock >= 0)
);

create table if not exists public.emergency_supplies (
  id uuid primary key default gen_random_uuid(),
  item_name text not null,
  unit text,
  item_type text,
  supplier_id text,
  supplier_name text,
  price numeric not null default 0,
  source_id text,
  updated_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.withdrawal_log (
  id uuid primary key default gen_random_uuid(),
  clinic_id text,
  product_id text,
  product_name text,
  withdrawal_date date,
  quantity numeric not null default 0,
  requester text,
  unit_price numeric not null default 0,
  affects_stock boolean not null default false,
  source_id text,
  created_at timestamptz not null default now()
);

create index if not exists dental_warehouse_source_idx on public.dental_warehouse (source_id);
create index if not exists emergency_supplies_source_idx on public.emergency_supplies (source_id);
create index if not exists withdrawal_log_source_idx on public.withdrawal_log (source_id);
create index if not exists withdrawal_log_product_idx on public.withdrawal_log (product_id);

create or replace function public.apply_dental_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  warehouse_id uuid;
  current_stock numeric;
begin
  if tg_op = 'INSERT' then
    if new.affects_stock is not true then
      return new;
    end if;
    if new.product_id is null or btrim(new.product_id) = '' then
      raise exception 'stock_required';
    end if;

    select id, stock
      into warehouse_id, current_stock
    from public.dental_warehouse
    where id::text = new.product_id or source_id = new.product_id
    order by case when id::text = new.product_id then 0 else 1 end
    limit 1
    for update;

    if warehouse_id is null or current_stock is null then
      raise exception 'stock_required';
    end if;
    if current_stock < coalesce(new.quantity, 0) then
      raise exception 'insufficient_stock';
    end if;

    update public.dental_warehouse
      set stock = current_stock - coalesce(new.quantity, 0),
          updated_at = now()
      where id = warehouse_id;
    return new;
  end if;

  if tg_op = 'DELETE' then
    if old.affects_stock is not true then
      return old;
    end if;
    if old.product_id is null or btrim(old.product_id) = '' then
      return old;
    end if;

    update public.dental_warehouse
      set stock = stock + coalesce(old.quantity, 0),
          updated_at = now()
      where stock is not null
        and (id::text = old.product_id or source_id = old.product_id);
    return old;
  end if;

  return null;
end;
$$;

drop trigger if exists withdrawal_log_stock on public.withdrawal_log;
create trigger withdrawal_log_stock
before insert or delete on public.withdrawal_log
for each row execute function public.apply_dental_stock();

create or replace view public.low_stock_alerts as
select id, item_name, unit, item_type, stock
from public.dental_warehouse
where stock is not null and stock < 6;

comment on table public.dental_warehouse is 'مستودع الأسنان';
comment on table public.emergency_supplies is 'مستلزمات الطوارئ';
comment on table public.withdrawal_log is 'سجل السحوبات';

alter table public.dental_warehouse enable row level security;
alter table public.emergency_supplies enable row level security;
alter table public.withdrawal_log enable row level security;

drop policy if exists "public_all_dental_warehouse" on public.dental_warehouse;
drop policy if exists "public_all_emergency_supplies" on public.emergency_supplies;
drop policy if exists "public_all_withdrawal_log" on public.withdrawal_log;

create policy "public_all_dental_warehouse" on public.dental_warehouse for all using (true) with check (true);
create policy "public_all_emergency_supplies" on public.emergency_supplies for all using (true) with check (true);
create policy "public_all_withdrawal_log" on public.withdrawal_log for all using (true) with check (true);

grant all on public.dental_warehouse to anon, authenticated;
grant all on public.emergency_supplies to anon, authenticated;
grant all on public.withdrawal_log to anon, authenticated;
grant select on public.low_stock_alerts to anon, authenticated;

-- نقل الأصناف الحالية دون المساس بكمياتها
do $$
begin
  if to_regclass('public.supplies') is null then
    return;
  end if;

  insert into public.dental_warehouse (
    id, item_name, unit, item_type, supplier_id, supplier_name, price, stock, source_id, updated_at
  )
  select
    s.id,
    coalesce(s.item_name, ''),
    s.unit,
    coalesce(public.try_jsonb(s.category::text)->>'type', ''),
    coalesce(public.try_jsonb(s.category::text)->>'supplierId', ''),
    coalesce(public.try_jsonb(s.category::text)->>'supplierName', ''),
    coalesce((public.try_jsonb(s.category::text)->>'price')::numeric, 0),
    case
      when public.try_jsonb(s.category::text)->>'stock' is null
        or btrim(public.try_jsonb(s.category::text)->>'stock') = '' then null
      else (public.try_jsonb(s.category::text)->>'stock')::numeric
    end,
    s.id::text,
    coalesce(nullif(public.try_jsonb(s.category::text)->>'updatedAt', '')::timestamptz, now())
  from public.supplies s
  where coalesce(public.try_jsonb(s.category::text)->>'category', s.category::text, '') <> 'emergency'
    and not exists (
      select 1 from public.dental_warehouse d
      where d.id = s.id or d.source_id = s.id::text
    );

  insert into public.emergency_supplies (
    id, item_name, unit, item_type, supplier_id, supplier_name, price, source_id, updated_at
  )
  select
    s.id,
    coalesce(s.item_name, ''),
    s.unit,
    coalesce(public.try_jsonb(s.category::text)->>'type', ''),
    coalesce(public.try_jsonb(s.category::text)->>'supplierId', ''),
    coalesce(public.try_jsonb(s.category::text)->>'supplierName', ''),
    coalesce((public.try_jsonb(s.category::text)->>'price')::numeric, 0),
    s.id::text,
    coalesce(nullif(public.try_jsonb(s.category::text)->>'updatedAt', '')::timestamptz, now())
  from public.supplies s
  where public.try_jsonb(s.category::text)->>'category' = 'emergency'
    and not exists (
      select 1 from public.emergency_supplies e
      where e.id = s.id or e.source_id = s.id::text
    );
exception when others then
  raise notice 'supply migration skipped: %', sqlerrm;
end $$;

-- نسخ سجل السحوبات القديم دون خصم الكمية
do $$
declare
  rec record;
begin
  for rec in
    select *
    from (
      values
        ('withdrawals_dr_ahmed', 'ahmed'),
        ('withdrawals_dr_faten', 'faten'),
        ('withdrawals_dr_sara', 'sara')
    ) as clinics(clinic_table, clinic_key)
  loop
    begin
      if to_regclass('public.' || rec.clinic_table) is null then
        continue;
      end if;

      if exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = rec.clinic_table and column_name = 'product_name'
      ) then
        execute format(
          'insert into public.withdrawal_log (id, clinic_id, product_id, product_name, withdrawal_date, quantity, requester, unit_price, affects_stock, source_id)
           select w.id, %L, coalesce(w.product_id::text, ''''), coalesce(w.product_name, ''''), w.withdrawal_date,
                  coalesce(w.quantity, 0), coalesce(w.requester, ''''), coalesce(w.unit_price, 0), false, w.id::text
           from public.%I w
           where not exists (select 1 from public.withdrawal_log l where l.id = w.id or l.source_id = w.id::text)',
          rec.clinic_key, rec.clinic_table
        );
      elsif exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = rec.clinic_table and column_name = 'notes'
      ) then
        execute format(
          'insert into public.withdrawal_log (id, clinic_id, product_id, product_name, withdrawal_date, quantity, requester, unit_price, affects_stock, source_id)
           select w.id, %L,
                  coalesce(public.try_jsonb(w.notes::text)->>''productId'', ''''),
                  coalesce(public.try_jsonb(w.notes::text)->>''productName'', ''''),
                  w.withdrawal_date,
                  coalesce((public.try_jsonb(w.notes::text)->>''quantity'')::numeric, 0),
                  coalesce(public.try_jsonb(w.notes::text)->>''requester'', ''''),
                  coalesce((public.try_jsonb(w.notes::text)->>''unitPrice'')::numeric, 0),
                  false,
                  w.id::text
           from public.%I w
           where not exists (select 1 from public.withdrawal_log l where l.id = w.id or l.source_id = w.id::text)',
          rec.clinic_key, rec.clinic_table
        );
      end if;
    exception when others then
      raise notice 'clinic withdrawal migration skipped for %: %', rec.clinic_table, sqlerrm;
    end;
  end loop;
end $$;

do $$
begin
  if to_regclass('public.doctor_withdrawals') is null then
    return;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'doctor_withdrawals' and column_name = 'notes'
  ) then
    return;
  end if;

  insert into public.withdrawal_log (
    id, clinic_id, product_id, product_name, withdrawal_date, quantity, requester, unit_price, affects_stock, source_id
  )
  select
    w.id,
    coalesce(
      public.try_jsonb(w.notes::text)->>'clinicId',
      case
        when coalesce(w.doctor_name, '') ilike '%فاتن%' or coalesce(w.doctor_name, '') ilike '%faten%' then 'faten'
        when coalesce(w.doctor_name, '') ilike '%سارة%' or coalesce(w.doctor_name, '') ilike '%sara%' then 'sara'
        else 'ahmed'
      end
    ),
    coalesce(public.try_jsonb(w.notes::text)->>'productId', ''),
    coalesce(public.try_jsonb(w.notes::text)->>'productName', ''),
    w.withdrawal_date,
    coalesce((public.try_jsonb(w.notes::text)->>'quantity')::numeric, 0),
    coalesce(public.try_jsonb(w.notes::text)->>'requester', ''),
    coalesce((public.try_jsonb(w.notes::text)->>'unitPrice')::numeric, 0),
    false,
    w.id::text
  from public.doctor_withdrawals w
  where not exists (
    select 1 from public.withdrawal_log l where l.id = w.id or l.source_id = w.id::text
  );
exception when others then
  raise notice 'legacy withdrawal migration skipped: %', sqlerrm;
end $$;

notify pgrst, 'reload schema';

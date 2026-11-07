-- =============================================================================
-- Vroombrite 0008 — washer pay, expenses with bill photos, supplies stock, receipts,
-- cancellation reasons, phone alerts for new bookings.
-- Run once in Supabase → SQL Editor after 0001–0007. Safe to run again.
-- =============================================================================

-- ---------------------------------------------------------------- washer pay
alter table public.staff add column if not exists pay_car  int not null default 0;
alter table public.staff add column if not exists pay_bike int not null default 0;
create table if not exists public.payouts (
  id        bigserial primary key,
  staff_id  uuid not null references public.staff (id) on delete cascade,
  date_from date not null,
  date_to   date not null,
  washes    int  not null default 0,
  amount    int  not null default 0,
  note      text not null default '',
  paid_at   timestamptz not null default now(),
  paid_by   uuid references public.staff (id) on delete set null
);
alter table public.payouts enable row level security;
revoke all on public.payouts from anon, authenticated;
revoke all on sequence public.payouts_id_seq from anon, authenticated;
alter table public.bookings add column if not exists payout_id bigint references public.payouts (id) on delete set null;
alter table public.bookings add column if not exists cancel_reason text;
alter table public.bookings add column if not exists receipt_key text;

-- How many washes a done job counts for: 1, or for a society visit the vehicles ticked (all of them if none were ticked).
create or replace function public.pay_units(b public.bookings) returns int
language sql immutable as $$
  select case when b.items is not null and jsonb_typeof(b.items) = 'array'
              then case when jsonb_array_length(coalesce(b.checks, '[]')) > 0 then jsonb_array_length(b.checks) else jsonb_array_length(b.items) end
              else 1 end;
$$;

-- Done jobs per washer in a date range (by the day they were marked washed), with what each earns.
create or replace function public.owner_pay(p_from date, p_to date) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  if p_to < p_from or p_to - p_from > 120 then raise exception 'Pick a shorter range' using errcode = '22023'; end if;
  return (with j as (
      select b.*, public.pay_units(b) units,
             public.pay_units(b) * case when b.vehicle_type = 'bike' then s.pay_bike else s.pay_car end amount
        from public.bookings b join public.staff s on s.id = b.assigned_to
       where b.status = 'done' and (b.done_at at time zone 'Asia/Kolkata')::date between p_from and p_to)
    select coalesce(jsonb_agg(x order by x ->> 'name'), '[]'::jsonb) from (
      select jsonb_build_object('id', s.id, 'name', s.name, 'role', s.role, 'phone', s.phone, 'active', s.active,
        'pay_car', s.pay_car, 'pay_bike', s.pay_bike,
        'washes', (select coalesce(sum(units), 0) from j where j.assigned_to = s.id),
        'earned', (select coalesce(sum(amount), 0) from j where j.assigned_to = s.id),
        'owed',   (select coalesce(sum(amount), 0) from j where j.assigned_to = s.id and j.payout_id is null),
        'jobs', (select coalesce(jsonb_agg(jsonb_build_object('id', id, 'day', (done_at at time zone 'Asia/Kolkata')::date, 'name', name, 'package', package,
                   'vehicle', vehicle, 'units', units, 'amount', amount, 'paid', payout_id is not null) order by done_at), '[]'::jsonb) from j where j.assigned_to = s.id),
        'payouts', (select coalesce(jsonb_agg(jsonb_build_object('id', p.id, 'from', p.date_from, 'to', p.date_to, 'washes', p.washes, 'amount', p.amount,
                   'note', p.note, 'paid_at', p.paid_at) order by p.paid_at desc), '[]'::jsonb)
                    from (select * from public.payouts where staff_id = s.id order by paid_at desc limit 6) p)) x
        from public.staff s where s.active or exists (select 1 from j where j.assigned_to = s.id)) z);
end $$;

create or replace function public.owner_set_rates(p_staff uuid, p_car int, p_bike int) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  update public.staff set pay_car = greatest(0, least(coalesce(p_car, 0), 100000)), pay_bike = greatest(0, least(coalesce(p_bike, 0), 100000)) where id = p_staff;
  if not found then raise exception 'Unknown washer' using errcode = '22023'; end if;
  perform public.audit('pay_rates', (select name from public.staff where id = p_staff));
  return jsonb_build_object('ok', true);
end $$;

-- Mark everything owed to a washer in the range as paid.
create or replace function public.owner_pay_out(p_staff uuid, p_from date, p_to date, p_note text) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare pid bigint; n int; amt int;
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  select coalesce(sum(public.pay_units(b)), 0), coalesce(sum(public.pay_units(b) * case when b.vehicle_type = 'bike' then s.pay_bike else s.pay_car end), 0)
    into n, amt
    from public.bookings b join public.staff s on s.id = b.assigned_to
   where b.assigned_to = p_staff and b.status = 'done' and b.payout_id is null and (b.done_at at time zone 'Asia/Kolkata')::date between p_from and p_to;
  if n = 0 then raise exception 'Nothing owed in these dates' using errcode = '22023'; end if;
  insert into public.payouts (staff_id, date_from, date_to, washes, amount, note, paid_by)
  values (p_staff, p_from, p_to, n, amt, public.clip(p_note, 120), auth.uid()) returning id into pid;
  update public.bookings b set payout_id = pid
   where b.assigned_to = p_staff and b.status = 'done' and b.payout_id is null and (b.done_at at time zone 'Asia/Kolkata')::date between p_from and p_to;
  perform public.audit('pay_out', (select name from public.staff where id = p_staff) || ' · ₹' || amt);
  return jsonb_build_object('ok', true, 'id', pid, 'washes', n, 'amount', amt);
end $$;

create or replace function public.owner_undo_payout(p_id bigint) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare p public.payouts;
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  delete from public.payouts where id = p_id returning * into p;     -- bookings.payout_id goes back to empty
  if found then perform public.audit('pay_undone', (select name from public.staff where id = p.staff_id) || ' · ₹' || p.amount); end if;
  return jsonb_build_object('ok', true);
end $$;

-- A washer's own pay: this month, still owed, last payments.
create or replace function public.staff_my_pay() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare s public.staff; m0 date := date_trunc('month', public.ist_today())::date;
begin
  if not public.is_staff() then raise exception 'not allowed' using errcode = '42501'; end if;
  select * into s from public.staff where id = auth.uid();
  return (with j as (select b.*, public.pay_units(b) units, public.pay_units(b) * case when b.vehicle_type = 'bike' then s.pay_bike else s.pay_car end amount
                       from public.bookings b where b.assigned_to = s.id and b.status = 'done')
    select jsonb_build_object('pay_car', s.pay_car, 'pay_bike', s.pay_bike,
      'month_washes', (select coalesce(sum(units), 0) from j where (done_at at time zone 'Asia/Kolkata')::date >= m0),
      'month_earned', (select coalesce(sum(amount), 0) from j where (done_at at time zone 'Asia/Kolkata')::date >= m0),
      'owed', (select coalesce(sum(amount), 0) from j where payout_id is null),
      'payouts', (select coalesce(jsonb_agg(jsonb_build_object('from', date_from, 'to', date_to, 'washes', washes, 'amount', amount, 'paid_at', paid_at) order by paid_at desc), '[]'::jsonb)
                  from (select * from public.payouts where staff_id = s.id order by paid_at desc limit 5) p)));
end $$;

-- ---------------------------------------------------------------- expenses (with a bill photo)
create table if not exists public.expenses (
  id          bigserial primary key,
  staff_id    uuid references public.staff (id) on delete set null,
  staff_name  text not null default '',
  day         date not null,
  category    text not null check (category in ('supplies', 'fuel', 'other')),
  amount      int  not null check (amount between 1 and 100000),
  note        text not null default '',
  photo       text,                                   -- Storage: job-photos/bills/<name>.jpg
  status      text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists expenses_day_idx on public.expenses (day);
alter table public.expenses enable row level security;
revoke all on public.expenses from anon, authenticated;
revoke all on sequence public.expenses_id_seq from anon, authenticated;

create or replace function public.staff_add_expense(p jsonb) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare d date := coalesce(nullif(p ->> 'day', '')::date, public.ist_today()); ph text := nullif(p ->> 'photo', ''); r public.expenses;
begin
  if not public.is_staff() then raise exception 'not allowed' using errcode = '42501'; end if;
  if d > public.ist_today() or d < public.ist_today() - 60 then raise exception 'Pick a day in the last two months' using errcode = '22023'; end if;
  if ph is not null and ph !~ '^bills/[0-9a-z-]{4,60}\.jpg$' then raise exception 'bad photo name' using errcode = '22023'; end if;
  insert into public.expenses (staff_id, staff_name, day, category, amount, note, photo, status, reviewed_at)
  values (auth.uid(), coalesce((select name from public.staff where id = auth.uid()), ''), d, p ->> 'category',
          (p ->> 'amount')::int, public.clip(p ->> 'note', 200), ph,
          case when public.is_owner() then 'approved' else 'pending' end, case when public.is_owner() then now() end)
  returning * into r;
  return to_jsonb(r);
end $$;

-- Washers see their own; the owner sees everyone's.
create or replace function public.staff_expenses() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_staff() then raise exception 'not allowed' using errcode = '42501'; end if;
  return (select coalesce(jsonb_agg(to_jsonb(e) order by e.status = 'pending' desc, e.day desc, e.id desc), '[]'::jsonb)
            from (select * from public.expenses where public.is_owner() or staff_id = auth.uid() order by day desc, id desc limit 200) e);
end $$;

create or replace function public.owner_review_expense(p_id bigint, p_status text) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare r public.expenses;
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  if p_status not in ('pending', 'approved', 'rejected') then raise exception 'unknown' using errcode = '22023'; end if;
  update public.expenses set status = p_status, reviewed_at = case when p_status = 'pending' then null else now() end where id = p_id returning * into r;
  if not found then raise exception 'not found' using errcode = '22023'; end if;
  return to_jsonb(r);
end $$;

-- Delete: a washer only their own pending ones; the owner any. Returns the photo so the app can remove the file.
create or replace function public.staff_delete_expense(p_id bigint) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare r public.expenses;
begin
  if not public.is_staff() then raise exception 'not allowed' using errcode = '42501'; end if;
  select * into r from public.expenses where id = p_id;
  if not found then return jsonb_build_object('ok', true); end if;
  if not public.is_owner() and (r.staff_id is distinct from auth.uid() or r.status <> 'pending') then
    raise exception 'Only the owner can delete this now' using errcode = '42501'; end if;
  delete from public.expenses where id = p_id;
  return jsonb_build_object('ok', true, 'photo', r.photo);
end $$;

-- ---------------------------------------------------------------- supplies stock
create table if not exists public.supplies (
  id         bigserial primary key,
  name       text not null check (length(name) between 1 and 60),
  unit       text not null default '',
  qty        numeric(10, 2) not null default 0,
  low        numeric(10, 2) not null default 0,       -- warn at or below this (0 = never)
  position   int  not null default 0,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.staff (id) on delete set null
);
alter table public.supplies enable row level security;
revoke all on public.supplies from anon, authenticated;
revoke all on sequence public.supplies_id_seq from anon, authenticated;
insert into public.supplies (name, unit, position)
select * from (values ('Car shampoo', 'litre', 1), ('Snow foam', 'litre', 2), ('Tyre shine', 'bottle', 3), ('Spray wax', 'bottle', 4),
                      ('Glass cleaner', 'bottle', 5), ('Microfibre cloths', 'pcs', 6), ('Chain lube', 'can', 7)) v
 where not exists (select 1 from public.supplies);

create or replace function public.staff_supplies() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_staff() then raise exception 'not allowed' using errcode = '42501'; end if;
  return (select coalesce(jsonb_agg(jsonb_build_object('id', s.id, 'name', s.name, 'unit', s.unit, 'qty', s.qty, 'low', s.low,
            'is_low', s.low > 0 and s.qty <= s.low, 'updated_at', s.updated_at, 'by', t.name) order by s.position, s.id), '[]'::jsonb)
          from public.supplies s left join public.staff t on t.id = s.updated_by);
end $$;

-- Any staff: used some (negative) or restocked (positive).
create or replace function public.staff_use_supply(p_id bigint, p_delta numeric) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
begin
  if not public.is_staff() then raise exception 'not allowed' using errcode = '42501'; end if;
  if p_delta is null or abs(p_delta) > 1000 then raise exception 'bad amount' using errcode = '22023'; end if;
  update public.supplies set qty = greatest(0, qty + p_delta), updated_at = now(), updated_by = auth.uid() where id = p_id;
  if not found then raise exception 'not found' using errcode = '22023'; end if;
  return public.staff_supplies();
end $$;

-- Owner: the whole list (add / rename / set quantity and warning level / remove with "delete": true).
create or replace function public.owner_save_supplies(p jsonb) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare r jsonb; i int := 0; sid bigint;
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  for r in select * from jsonb_array_elements(coalesce(p, '[]'::jsonb)) loop
    i := i + 1; sid := nullif(r ->> 'id', '')::bigint;
    if (r ->> 'delete')::boolean is true then delete from public.supplies where id = sid; continue; end if;
    if public.clip(r ->> 'name', 60) = '' then continue; end if;
    if sid is null then
      insert into public.supplies (name, unit, qty, low, position, updated_by)
      values (public.clip(r ->> 'name', 60), public.clip(r ->> 'unit', 20), greatest(0, coalesce((r ->> 'qty')::numeric, 0)), greatest(0, coalesce((r ->> 'low')::numeric, 0)), i, auth.uid());
    else
      update public.supplies set name = public.clip(r ->> 'name', 60), unit = public.clip(r ->> 'unit', 20),
             qty = greatest(0, coalesce((r ->> 'qty')::numeric, qty)), low = greatest(0, coalesce((r ->> 'low')::numeric, 0)), position = i,
             updated_at = now(), updated_by = auth.uid() where id = sid;
    end if;
  end loop;
  return public.staff_supplies();
end $$;

-- ---------------------------------------------------------------- receipts
-- The app asks for a receipt link once the job is paid; the link carries a random key.
create or replace function public.staff_receipt(p_id text) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare b public.bookings; k text;
begin
  if not public.is_staff() then raise exception 'not allowed' using errcode = '42501'; end if;
  select * into b from public.bookings where id = p_id for update;
  if not found then raise exception 'booking not found' using errcode = '22023'; end if;
  if b.payment not like 'paid%' then raise exception 'Mark it paid first' using errcode = '22023'; end if;
  k := coalesce(b.receipt_key, substr(md5(random()::text || clock_timestamp()::text || p_id), 1, 16));
  if b.receipt_key is null then update public.bookings set receipt_key = k where id = p_id; end if;
  perform public.ev(p_id, 'message', 'Made a receipt link');
  return jsonb_build_object('id', p_id, 'key', k);
end $$;

-- Website receipt page: only with the right key, only for a paid job, no phone or address.
create or replace function public.public_receipt(p_id text, p_key text) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('id', b.id, 'name', split_part(b.name, ' ', 1), 'wash_date', b.wash_date, 'slot', b.slot,
           'vehicle', b.vehicle, 'plate', b.plate, 'package', b.package, 'extras', b.extras, 'area', b.area,
           'subtotal', b.subtotal, 'discount', b.discount, 'promo', b.promo, 'total', b.total, 'payment', b.payment, 'paid_at', b.paid_at)
    from public.bookings b
   where b.id = p_id and b.receipt_key is not null and b.receipt_key = p_key and b.payment like 'paid%';
$$;

insert into public.message_templates (key, title, body, position) values
  ('receipt', 'Receipt', 'Hi {first_name}, thank you for choosing {brand}! Here is your receipt for {amount}: {link}', 11)
on conflict (key) do nothing;

-- ---------------------------------------------------------------- cancellation reasons
create or replace function public.staff_cancel(p_id text, p_reason text) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare r text := public.clip(p_reason, 80); b public.bookings;
begin
  if not public.is_staff() then raise exception 'not allowed' using errcode = '42501'; end if;
  perform public.staff_update(p_id, 'cancel');
  update public.bookings set cancel_reason = nullif(r, '') where id = p_id returning * into b;
  if r <> '' then perform public.ev(p_id, 'note', 'Reason: ' || r); end if;
  return public.booking_json(b);
end $$;

create or replace function public.owner_cancel_reasons(p_from date, p_to date) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  return (select coalesce(jsonb_agg(jsonb_build_object('name', reason, 'n', n) order by n desc), '[]'::jsonb) from (
            select coalesce(nullif(cancel_reason, ''), 'No reason given') reason, count(*) n from public.bookings
             where status = 'cancelled' and wash_date between p_from and p_to group by 1) x);
end $$;

-- ---------------------------------------------------------------- analytics: expenses and washer pay count as costs
create or replace function public.range_numbers(p_from date, p_to date) returns jsonb
language sql stable security definer set search_path = public as $$
  with r as (select * from public.bookings where wash_date between p_from and p_to),
       firsts as (select phone, min(wash_date) f from public.bookings where status <> 'cancelled' group by phone),
       cost as (select coalesce(sum(c.amount * ((least(p_to, (c.month + interval '1 month')::date - 1) - greatest(p_from, c.month) + 1)::numeric
                       / ((c.month + interval '1 month')::date - c.month))), 0) amt
                from public.costs c where c.month <= p_to and (c.month + interval '1 month')::date - 1 >= p_from),
       spent as (select coalesce(sum(amount), 0) amt from public.expenses where status = 'approved' and day between p_from and p_to),
       wages as (select coalesce(sum(amount), 0) amt from public.payouts where (paid_at at time zone 'Asia/Kolkata')::date between p_from and p_to),
       plans as (select coalesce(sum(price), 0) amt from public.contract_periods
                  where payment like 'paid%' and (paid_at at time zone 'Asia/Kolkata')::date between p_from and p_to)
  select jsonb_build_object(
    'booked',     (select count(*) from r where status <> 'cancelled'),
    'cancelled',  (select count(*) from r where status = 'cancelled'),
    'confirmed',  (select count(*) from r where confirmed_at is not null),
    'washed',     (select count(*) from r where status = 'done'),
    'paid',       (select count(*) from r where status <> 'cancelled' and (payment like 'paid%' or (payment = 'covered' and status = 'done'))),
    'collected',  (select coalesce(sum(total), 0) from r where status <> 'cancelled' and payment like 'paid%') + (select amt from plans),
    'plans_collected', (select amt from plans),
    'booked_value',(select coalesce(sum(total), 0) from r where status <> 'cancelled'),
    'discounts',  (select coalesce(sum(discount), 0) from r where status <> 'cancelled'),
    'avg_ticket', (select coalesce(round(avg(total)), 0) from r where status = 'done' and payment <> 'covered'),
    'customers',  (select count(distinct phone) from r where status <> 'cancelled'),
    'new_customers', (select count(*) from firsts where f between p_from and p_to),
    'review_asked',(select count(*) from r where review_asked_at is not null),
    'reviews',    (select count(*) from public.reviews v join r on r.id = v.booking_id),
    'rating',     (select round(avg(v.rating)::numeric, 1) from public.reviews v join r on r.id = v.booking_id),
    'costs',      (select round(amt) from cost) + (select amt from spent) + (select amt from wages),
    'expenses',   (select amt from spent),
    'wages',      (select amt from wages),
    'ads',        (select coalesce(round(sum(c.amount * ((least(p_to, (c.month + interval '1 month')::date - 1) - greatest(p_from, c.month) + 1)::numeric
                       / ((c.month + interval '1 month')::date - c.month)))), 0)
                   from public.costs c where c.category = 'ads' and c.month <= p_to and (c.month + interval '1 month')::date - 1 >= p_from));
$$;

-- ---------------------------------------------------------------- phone alerts (web push)
-- The "push" edge function makes its own key pair on first use and keeps it here; only the
-- function (with Supabase's service key) can read it. New website bookings call the function.
create table if not exists public.push_config (
  id          int primary key default 1 check (id = 1),
  public_key  text,
  private_key text,
  hook_secret text not null default md5(random()::text || clock_timestamp()::text) || md5(clock_timestamp()::text || random()::text)
);
insert into public.push_config (id) values (1) on conflict (id) do nothing;
create table if not exists public.push_subs (
  id         bigserial primary key,
  staff_id   uuid not null references public.staff (id) on delete cascade,
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  device     text not null default '',
  created_at timestamptz not null default now()
);
alter table public.push_config enable row level security;
alter table public.push_subs enable row level security;
revoke all on public.push_config, public.push_subs from anon, authenticated;
revoke all on sequence public.push_subs_id_seq from anon, authenticated;

create or replace function public.staff_push_subscribe(p jsonb) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
begin
  if not public.is_staff() then raise exception 'not allowed' using errcode = '42501'; end if;
  if coalesce(p ->> 'endpoint', '') !~ '^https://' or coalesce(p ->> 'p256dh', '') = '' or coalesce(p ->> 'auth', '') = '' then
    raise exception 'bad subscription' using errcode = '22023'; end if;
  insert into public.push_subs (staff_id, endpoint, p256dh, auth, device) values (auth.uid(), p ->> 'endpoint', p ->> 'p256dh', p ->> 'auth', public.clip(p ->> 'device', 60))
  on conflict (endpoint) do update set staff_id = excluded.staff_id, p256dh = excluded.p256dh, auth = excluded.auth, device = excluded.device;
  return jsonb_build_object('ok', true, 'devices', (select count(*) from public.push_subs where staff_id = auth.uid()));
end $$;

create or replace function public.staff_push_unsubscribe(p_endpoint text) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
begin
  if not public.is_staff() then raise exception 'not allowed' using errcode = '42501'; end if;
  delete from public.push_subs where endpoint = p_endpoint and staff_id = auth.uid();
  return jsonb_build_object('ok', true);
end $$;

-- For the edge function only (service key).
create or replace function public.push_keys() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('public_key', public_key, 'private_key', private_key) from public.push_config where id = 1;
$$;
create or replace function public.push_save_keys(p_public text, p_private text) returns jsonb
language sql volatile security definer set search_path = public as $$
  update public.push_config set public_key = coalesce(public_key, p_public), private_key = coalesce(private_key, p_private) where id = 1
  returning jsonb_build_object('public_key', public_key);
$$;
-- What to send for a new booking, and to whom (active owners' phones). Only with the right secret.
create or replace function public.push_hook(p_booking text, p_secret text) returns jsonb
language sql stable security definer set search_path = public as $$
  select case when p_secret is null or p_secret <> (select hook_secret from public.push_config where id = 1) then null else jsonb_build_object(
    'booking', (select jsonb_build_object('id', id, 'name', name, 'package', package, 'vehicle', vehicle, 'wash_date', wash_date, 'slot', slot, 'area', area, 'total', total)
                  from public.bookings where id = p_booking),
    'subs', (select coalesce(jsonb_agg(jsonb_build_object('endpoint', s.endpoint, 'p256dh', s.p256dh, 'auth', s.auth)), '[]'::jsonb)
               from public.push_subs s join public.staff t on t.id = s.staff_id where t.active and t.role = 'owner')) end;
$$;
create or replace function public.push_staff_subs(p_staff uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('endpoint', endpoint, 'p256dh', p256dh, 'auth', auth)), '[]'::jsonb) from public.push_subs where staff_id = p_staff;
$$;
create or replace function public.push_drop(p_endpoints text[]) returns void
language sql volatile security definer set search_path = public as $$
  delete from public.push_subs where endpoint = any (p_endpoints);
$$;

-- New website booking → ask the push function to alert the owner. Never blocks the booking.
do $$ begin
  begin create extension if not exists pg_net with schema extensions; exception when others then raise notice 'pg_net not available here: %', sqlerrm; end;
end $$;
create or replace function public.booking_push() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.source = 'website' and to_regproc('net.http_post') is not null then
    begin
      perform net.http_post(
        url := 'https://rcekecnigbtgicvntfbz.supabase.co/functions/v1/push',
        body := jsonb_build_object('booking', new.id, 'secret', (select hook_secret from public.push_config where id = 1)),
        headers := '{"Content-Type": "application/json"}'::jsonb);
    exception when others then null;
    end;
  end if;
  return null;
end $$;
drop trigger if exists booking_push on public.bookings;
create trigger booking_push after insert on public.bookings for each row execute function public.booking_push();

alter table public.audit_log drop constraint if exists audit_log_action_check;
alter table public.audit_log add constraint audit_log_action_check
  check (action in ('export', 'booking_deleted', 'login_added', 'login_switched_on', 'login_switched_off',
                    'login_role', 'login_password', 'login_edited', 'login_deleted', 'messages_saved', 'notice_posted', 'notice_cleared',
                    'offers_saved', 'costs_saved', 'slots_saved', 'day_closed', 'day_reopened', 'pay_rates', 'pay_out', 'pay_undone'));

-- ---------------------------------------------------------------- who may call what
revoke execute on function public.pay_units(public.bookings), public.booking_push(),
                           public.push_keys(), public.push_save_keys(text, text), public.push_hook(text, text),
                           public.push_staff_subs(uuid), public.push_drop(text[]) from public, anon, authenticated;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function public.push_keys(), public.push_save_keys(text, text), public.push_hook(text, text),
                              public.push_staff_subs(uuid), public.push_drop(text[]) to service_role;
  end if;
end $$;
revoke execute on function public.owner_pay(date, date), public.owner_set_rates(uuid, int, int), public.owner_pay_out(uuid, date, date, text),
                           public.owner_undo_payout(bigint), public.staff_my_pay(), public.staff_add_expense(jsonb), public.staff_expenses(),
                           public.owner_review_expense(bigint, text), public.staff_delete_expense(bigint), public.staff_supplies(),
                           public.staff_use_supply(bigint, numeric), public.owner_save_supplies(jsonb), public.staff_receipt(text),
                           public.public_receipt(text, text), public.staff_cancel(text, text), public.owner_cancel_reasons(date, date),
                           public.staff_push_subscribe(jsonb), public.staff_push_unsubscribe(text)
  from public, anon;
grant execute on function public.public_receipt(text, text) to anon, authenticated;
grant execute on function public.owner_pay(date, date), public.owner_set_rates(uuid, int, int), public.owner_pay_out(uuid, date, date, text),
                          public.owner_undo_payout(bigint), public.staff_my_pay(), public.staff_add_expense(jsonb), public.staff_expenses(),
                          public.owner_review_expense(bigint, text), public.staff_delete_expense(bigint), public.staff_supplies(),
                          public.staff_use_supply(bigint, numeric), public.owner_save_supplies(jsonb), public.staff_receipt(text),
                          public.staff_cancel(text, text), public.owner_cancel_reasons(date, date),
                          public.staff_push_subscribe(jsonb), public.staff_push_unsubscribe(text)
  to authenticated;

notify pgrst, 'reload schema';
select 'Done: washer pay, expenses, stock, receipts, cancel reasons and phone alerts are ready' as result;

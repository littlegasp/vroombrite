-- =============================================================================
-- Vroombrite 0007 — monthly plans and society contracts.
-- A contract (a customer's monthly plan, or a society) has fixed weekdays and a time slot.
-- Each month ("period") is paid once; its visits are created as bookings with nothing to collect.
-- Run once in Supabase → SQL Editor after 0001–0006. Safe to run again.
-- =============================================================================

create table if not exists public.contracts (
  id           bigserial primary key,
  kind         text not null check (kind in ('plan', 'society')),
  name         text not null check (length(name) between 1 and 80),          -- customer or society name
  contact_name text not null default '',
  phone        text not null check (phone ~ '^[6-9][0-9]{9}$'),
  address      text not null default '',
  area         text not null default '',
  pin          text not null default '',
  vehicle_type text not null default 'car' check (vehicle_type in ('car', 'bike')),
  vehicle      text not null default '',                                      -- plan: "Car · Sedan"
  plate        text not null default '',
  plan_name    text not null default '',                                      -- "Stay Sharp" / "Society contract"
  package      text not null default '',                                      -- what each visit is
  washes       int  check (washes between 1 and 31),                          -- plan: washes a month; society: null = every chosen day
  weekdays     int[] not null check (array_length(weekdays, 1) between 1 and 7),
  slot         text not null references public.slot_caps (slot) on update cascade,
  price        int  not null default 0 check (price between 0 and 1000000),   -- per month
  assigned_to  uuid references public.staff (id) on delete set null,
  start_date   date not null,
  status       text not null default 'active' check (status in ('active', 'ended')),
  notes        text not null default '',
  lead_id      bigint references public.society_leads (id) on delete set null,
  created_at   timestamptz not null default now(),
  created_by   uuid references public.staff (id) on delete set null
);
create table if not exists public.contract_vehicles (
  id          bigserial primary key,
  contract_id bigint not null references public.contracts (id) on delete cascade,
  position    int not null default 0,
  flat        text not null default '',
  vehicle     text not null default '',
  plate       text not null default ''
);
create table if not exists public.contract_periods (
  id           bigserial primary key,
  contract_id  bigint not null references public.contracts (id) on delete cascade,
  period_start date not null,
  period_end   date not null,
  price        int  not null default 0,
  payment      text not null default 'pending' check (payment in ('pending', 'paid_upi', 'paid_cash')),
  paid_at      timestamptz,
  created_at   timestamptz not null default now(),
  unique (contract_id, period_start)
);
create index if not exists contract_vehicles_c_idx on public.contract_vehicles (contract_id);
create index if not exists contract_periods_c_idx on public.contract_periods (contract_id);
alter table public.contracts enable row level security;
alter table public.contract_vehicles enable row level security;
alter table public.contract_periods enable row level security;
revoke all on public.contracts, public.contract_vehicles, public.contract_periods from anon, authenticated;
revoke all on sequence public.contracts_id_seq, public.contract_vehicles_id_seq, public.contract_periods_id_seq from anon, authenticated;

-- Visits are ordinary bookings that point at their month. "covered" = nothing to collect at the visit.
alter table public.bookings add column if not exists period_id bigint references public.contract_periods (id) on delete set null;
alter table public.bookings add column if not exists items jsonb;      -- society visit: the vehicles, used as its checklist
create index if not exists bookings_period_idx on public.bookings (period_id);
alter table public.bookings drop constraint if exists bookings_payment_check;
alter table public.bookings add constraint bookings_payment_check check (payment in ('pending', 'paid_upi', 'paid_cash', 'refunded', 'covered'));
alter table public.bookings drop constraint if exists bookings_source_chk;
alter table public.bookings add constraint bookings_source_chk
  check (source in ('website', 'phone', 'whatsapp', 'walk_in', 'society', 'instagram', 'repeat', 'plan', 'other'));

insert into public.message_templates (key, title, body, position) values
  ('plan_renew', 'Plan renewal', 'Hi {first_name}, this is {brand}. Your {plan} plan ends on {end}. Shall we continue next month? It''s {price} for {washes}. Just reply YES and we''ll keep the same days and time.', 9),
  ('plan_pay', 'Plan payment due', 'Hi {first_name}, a gentle reminder from {brand}: {price} for your {plan} plan ({period}) is due. You can pay by UPI to {upi}. Thank you!', 10)
on conflict (key) do nothing;

-- Booking json: visits carry their plan (name, visit n of m, washes left, the month's payment).
create or replace function public.booking_json(b public.bookings) returns jsonb
language sql stable security definer set search_path = public as $$
  select to_jsonb(b) - 'updated_by' || jsonb_build_object(
    'credit', coalesce((select sum(amount) from public.referral_credits
                        where referrer_phone = b.phone and status = 'available'), 0),
    'visits', (select count(*) from public.bookings x where x.phone = b.phone and x.status = 'done' and x.id <> b.id),
    'assigned_name', (select name from public.staff s where s.id = b.assigned_to),
    'cust_note', coalesce((select note from public.customer_notes c where c.phone = b.phone), ''),
    'plan', case when b.period_id is null then null else (
      select jsonb_build_object('contract', c.id, 'kind', c.kind, 'name', c.plan_name, 'pay', p.payment, 'end', p.period_end,
        'n',    (select count(*) from public.bookings x where x.period_id = b.period_id and x.status <> 'cancelled' and (x.wash_date, x.id) <= (b.wash_date, b.id)),
        'of',   (select count(*) from public.bookings x where x.period_id = b.period_id and x.status <> 'cancelled'),
        'left', (select count(*) from public.bookings x where x.period_id = b.period_id and x.status not in ('done', 'cancelled')))
      from public.contract_periods p join public.contracts c on c.id = p.contract_id where p.id = b.period_id) end);
$$;

create or replace function public.booking_created_event() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.booking_events (booking_id, actor, actor_name, kind, detail)
  values (new.id, auth.uid(), coalesce((select name from public.staff where id = auth.uid()), ''), 'created',
          case when new.source = 'website' then 'Booked on the website'
               when new.period_id is not null then (select case c.kind when 'plan' then 'Plan visit · ' || c.plan_name else 'Society visit · ' || c.name end
                                                       || ' · ' || to_char(p.period_start, 'DD Mon') || '–' || to_char(p.period_end, 'DD Mon')
                                                    from public.contract_periods p join public.contracts c on c.id = p.contract_id where p.id = new.period_id)
               else 'Added in the staff app · ' || case new.source when 'whatsapp' then 'WhatsApp' when 'walk_in' then 'Walk-in' when 'instagram' then 'Instagram'
                                                        when 'phone' then 'Phone' when 'society' then 'Society' when 'repeat' then 'Repeat' else 'Other' end end
          || case when new.discount > 0 then ' · ' || case new.promo when 'MANUAL' then 'discount' when 'REFERRAL' then 'referral' else new.promo end || ' −₹' || new.discount else '' end);
  return new;
end $$;

-- Society visits can have many vehicles to tick.
create or replace function public.staff_check(p_id text, p_item text, p_on boolean) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare b public.bookings; it text := public.clip(p_item, 120); cur jsonb;
begin
  if not public.is_staff() then raise exception 'not allowed' using errcode = '42501'; end if;
  if it = '' then raise exception 'empty' using errcode = '22023'; end if;
  select * into b from public.bookings where id = p_id for update;
  if not found then raise exception 'booking not found' using errcode = '22023'; end if;
  cur := coalesce((select jsonb_agg(x) from jsonb_array_elements_text(b.checks) x where x <> it), '[]'::jsonb);
  if p_on then
    if jsonb_array_length(cur) >= 220 then raise exception 'Too many ticks' using errcode = '22023'; end if;
    cur := cur || to_jsonb(it);
  end if;
  update public.bookings set checks = cur, updated_at = now(), updated_by = auth.uid() where id = p_id;
  select * into b from public.bookings where id = p_id;
  return public.booking_json(b);
end $$;

-- Covered visits can't be marked paid/unpaid one by one; the month is paid instead.
create or replace function public.covered_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if old.payment = 'covered' and new.payment <> 'covered' then new.payment := 'covered'; new.paid_at := old.paid_at; end if;
  return new;
end $$;
drop trigger if exists covered_guard on public.bookings;
create trigger covered_guard before update of payment on public.bookings for each row execute function public.covered_guard();

-- ---------------------------------------------------------------- helpers
create or replace function public.contract_json(c public.contracts) returns jsonb
language sql stable security definer set search_path = public as $$
  with per as (
    select p.*, (select count(*) from public.bookings x where x.period_id = p.id and x.status <> 'cancelled') planned,
                (select count(*) from public.bookings x where x.period_id = p.id and x.status = 'done') done,
                (select count(*) from public.bookings x where x.period_id = p.id and x.status not in ('done', 'cancelled')) "left"
      from public.contract_periods p where p.contract_id = c.id),
  cur as (select * from per order by (period_start <= public.ist_today()) desc, case when period_start <= public.ist_today() then -extract(epoch from period_start) else extract(epoch from period_start) end limit 1)
  select to_jsonb(c) || jsonb_build_object(
    'assigned_name', (select name from public.staff s where s.id = c.assigned_to),
    'vehicles', (select count(*) from public.contract_vehicles v where v.contract_id = c.id),
    'cur', (select to_jsonb(cur) from cur),
    'last_end', (select max(period_end) from per),
    'due', (select coalesce(sum(price), 0) from per where payment = 'pending' and period_start <= public.ist_today()),
    'renew', c.status = 'active' and coalesce((select max(period_end) from per), c.start_date - 1) - public.ist_today() <= 3);
$$;

-- Days in [d0, d1] on the contract's weekdays, from today on; a plan stops at its washes.
create or replace function public.contract_days(c public.contracts, d0 date, d1 date) returns setof date
language sql stable security definer set search_path = public as $$
  select d::date from generate_series(greatest(d0, public.ist_today()), d1, interval '1 day') d
   where extract(isodow from d)::int = any (c.weekdays) order by d limit coalesce(c.washes, 31);
$$;

create or replace function public.contract_visit(c public.contracts, p_period bigint, p_day date, p_slot text) returns text
language plpgsql volatile security definer set search_path = public as $$
declare v_id text := public.new_booking_id(); veh jsonb; n int;
begin
  if c.kind = 'society' then
    select coalesce(jsonb_agg(trim(both ' ·' from concat_ws(' · ', nullif(v.flat, ''), nullif(v.vehicle, ''), nullif(v.plate, ''))) order by v.position, v.id), '[]'::jsonb), count(*)
      into veh, n from public.contract_vehicles v where v.contract_id = c.id;
  end if;
  insert into public.bookings (id, status, vehicle_type, vehicle, plate, package, wash_date, slot, address, area, pin, name, phone, notes,
                               subtotal, discount, total, pay_mode, payment, confirmed_at, assigned_to, created_by, source, period_id, items)
  values (v_id, 'confirmed', c.vehicle_type,
          case when c.kind = 'society' then 'Society · ' || n || ' vehicle' || case when n = 1 then '' else 's' end else c.vehicle end,
          case when c.kind = 'society' then '' else c.plate end, c.package, p_day, coalesce(nullif(p_slot, ''), c.slot), c.address, c.area, c.pin,
          c.name, c.phone, c.notes, 0, 0, 0, 'after', 'covered', now(), c.assigned_to, auth.uid(), c.kind, p_period,
          case when c.kind = 'society' then veh end);
  return v_id;
end $$;

-- ---------------------------------------------------------------- owner functions
create or replace function public.owner_contract(p_id bigint) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare c public.contracts;
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  select * into c from public.contracts where id = p_id;
  if not found then raise exception 'not found' using errcode = '22023'; end if;
  return public.contract_json(c) || jsonb_build_object(
    'vehicle_list', (select coalesce(jsonb_agg(jsonb_build_object('flat', flat, 'vehicle', vehicle, 'plate', plate) order by position, id), '[]'::jsonb)
                     from public.contract_vehicles where contract_id = p_id),
    'periods', (select coalesce(jsonb_agg(to_jsonb(p) || jsonb_build_object(
                    'planned', (select count(*) from public.bookings x where x.period_id = p.id and x.status <> 'cancelled'),
                    'done',    (select count(*) from public.bookings x where x.period_id = p.id and x.status = 'done')) order by p.period_start desc), '[]'::jsonb)
                from public.contract_periods p where p.contract_id = p_id),
    'visits', (select coalesce(jsonb_agg(public.booking_json(b) order by b.wash_date, b.slot), '[]'::jsonb) from (
                 select x.* from public.bookings x join public.contract_periods p on p.id = x.period_id
                  where p.contract_id = p_id and x.wash_date >= public.ist_today() - 14 order by x.wash_date limit 80) b));
end $$;

create or replace function public.owner_contracts() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  return (select coalesce(jsonb_agg(public.contract_json(c) order by c.status, c.kind, c.name), '[]'::jsonb) from public.contracts c);
end $$;

-- Create or update a plan / society contract. p.vehicles (society) replaces the list: [{flat, vehicle, plate}].
create or replace function public.owner_save_contract(p jsonb) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare c public.contracts; cid bigint := nullif(p ->> 'id', '')::bigint; ph text := public.digits10(p ->> 'phone');
        wd int[]; v jsonb; i int := 0;
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  if p ->> 'kind' not in ('plan', 'society') then raise exception 'unknown kind' using errcode = '22023'; end if;
  if ph is null or ph !~ '^[6-9][0-9]{9}$' then raise exception 'Enter a 10-digit mobile number' using errcode = '22023'; end if;
  if public.clip(p ->> 'name', 80) = '' then raise exception 'Enter a name' using errcode = '22023'; end if;
  select coalesce(array_agg(distinct x::int order by x::int), '{}') into wd from jsonb_array_elements_text(coalesce(p -> 'weekdays', '[]')) x where x ~ '^[1-7]$';
  if coalesce(array_length(wd, 1), 0) = 0 then raise exception 'Pick at least one weekday' using errcode = '22023'; end if;
  if not exists (select 1 from public.slot_caps where slot = p ->> 'slot') then raise exception 'Pick a time slot' using errcode = '22023'; end if;
  if p ->> 'kind' = 'plan' and coalesce((p ->> 'washes')::int, 0) not between 1 and 31 then raise exception 'Washes a month must be 1 to 31' using errcode = '22023'; end if;
  if p ->> 'kind' = 'society' and jsonb_array_length(coalesce(p -> 'vehicles', '[]')) > 200 then raise exception 'Up to 200 vehicles' using errcode = '22023'; end if;
  if cid is null then
    insert into public.contracts (kind, name, phone, weekdays, slot, start_date, created_by)
    values (p ->> 'kind', public.clip(p ->> 'name', 80), ph, wd, p ->> 'slot', coalesce(nullif(p ->> 'start_date', '')::date, public.ist_today()), auth.uid())
    returning id into cid;
  elsif not exists (select 1 from public.contracts where id = cid) then raise exception 'not found' using errcode = '22023';
  end if;
  update public.contracts set
    name = public.clip(p ->> 'name', 80), contact_name = public.clip(p ->> 'contact_name', 80), phone = ph,
    address = public.clip(p ->> 'address', 300), area = public.clip(p ->> 'area', 60), pin = public.clip(p ->> 'pin', 6),
    vehicle_type = case when p ->> 'vehicle_type' = 'bike' then 'bike' else 'car' end,
    vehicle = public.clip(p ->> 'vehicle', 80), plate = upper(public.clip(p ->> 'plate', 20)),
    plan_name = public.clip(p ->> 'plan_name', 60), package = public.clip(p ->> 'package', 60),
    washes = case when kind = 'plan' then (p ->> 'washes')::int end, weekdays = wd, slot = p ->> 'slot',
    price = greatest(0, least(coalesce((p ->> 'price')::int, 0), 1000000)),
    assigned_to = nullif(p ->> 'assigned_to', '')::uuid,
    start_date = coalesce(nullif(p ->> 'start_date', '')::date, start_date),
    status = case when p ->> 'status' in ('active', 'ended') then p ->> 'status' else status end,
    notes = public.clip(p ->> 'notes', 500),
    lead_id = coalesce(nullif(p ->> 'lead_id', '')::bigint, lead_id)
  where id = cid returning * into c;
  if c.kind = 'society' and p ? 'vehicles' then
    delete from public.contract_vehicles where contract_id = cid;
    for v in select * from jsonb_array_elements(p -> 'vehicles') loop
      i := i + 1;
      if public.clip(v ->> 'flat', 30) || public.clip(v ->> 'vehicle', 60) || public.clip(v ->> 'plate', 20) <> '' then
        insert into public.contract_vehicles (contract_id, position, flat, vehicle, plate)
        values (cid, i, public.clip(v ->> 'flat', 30), public.clip(v ->> 'vehicle', 60), upper(public.clip(v ->> 'plate', 20)));
      end if;
    end loop;
  end if;
  if c.lead_id is not null then update public.society_leads set status = 'won' where id = c.lead_id; end if;
  return public.owner_contract(cid);
end $$;

-- Start the next month (or the first one) and create its visits.
create or replace function public.owner_contract_period(p_id bigint, p_start date) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare c public.contracts; d0 date; d1 date; pid bigint; d date; n int := 0;
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  select * into c from public.contracts where id = p_id for update;
  if not found then raise exception 'not found' using errcode = '22023'; end if;
  if c.status <> 'active' then raise exception 'This contract has ended. Turn it back on first.' using errcode = '22023'; end if;
  d0 := coalesce(p_start, (select max(period_end) + 1 from public.contract_periods where contract_id = p_id), c.start_date);
  d1 := (d0 + interval '1 month')::date - 1;
  if d1 < public.ist_today() then raise exception 'That month is already over' using errcode = '22023'; end if;
  if exists (select 1 from public.contract_periods where contract_id = p_id and daterange(period_start, period_end, '[]') && daterange(d0, d1, '[]')) then
    raise exception 'Those dates overlap a month already created' using errcode = '22023'; end if;
  insert into public.contract_periods (contract_id, period_start, period_end, price) values (p_id, d0, d1, c.price) returning id into pid;
  for d in select * from public.contract_days(c, d0, d1) loop
    perform public.contract_visit(c, pid, d, null); n := n + 1;
  end loop;
  return public.owner_contract(p_id) || jsonb_build_object('created', n, 'period', pid);
end $$;

-- Extra visit in a month (make-up after a cancelled one).
create or replace function public.owner_add_visit(p_period bigint, p_day date, p_slot text) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare c public.contracts; v_id text;
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  select x.* into c from public.contracts x join public.contract_periods p on p.contract_id = x.id where p.id = p_period;
  if not found then raise exception 'not found' using errcode = '22023'; end if;
  if p_day is null or p_day < public.ist_today() then raise exception 'Pick today or a later date' using errcode = '22023'; end if;
  if nullif(p_slot, '') is not null and not exists (select 1 from public.slot_caps where slot = p_slot) then raise exception 'Unknown time slot' using errcode = '22023'; end if;
  v_id := public.contract_visit(c, p_period, p_day, p_slot);
  return public.booking_json((select b from public.bookings b where b.id = v_id));
end $$;

create or replace function public.owner_pay_period(p_period bigint, p_how text) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare cid bigint;
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  if p_how not in ('pending', 'paid_upi', 'paid_cash') then raise exception 'unknown' using errcode = '22023'; end if;
  update public.contract_periods set payment = p_how, paid_at = case when p_how = 'pending' then null else coalesce(paid_at, now()) end
   where id = p_period returning contract_id into cid;
  if cid is null then raise exception 'not found' using errcode = '22023'; end if;
  return public.owner_contract(cid);
end $$;

-- End (keeps past visits) or delete (removes the contract and its months). Either way, upcoming visits go.
create or replace function public.owner_end_contract(p_id bigint, p_delete boolean) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare n int; files jsonb;
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  if not exists (select 1 from public.contracts where id = p_id) then raise exception 'not found' using errcode = '22023'; end if;
  select coalesce(jsonb_agg(f.path), '[]'::jsonb) into files from public.job_photos f join public.bookings b on b.id = f.booking_id join public.contract_periods p on p.id = b.period_id
   where p.contract_id = p_id and b.wash_date >= public.ist_today() and b.status in ('new', 'confirmed');
  delete from public.bookings b using public.contract_periods p
   where p.id = b.period_id and p.contract_id = p_id and b.wash_date >= public.ist_today() and b.status in ('new', 'confirmed');
  get diagnostics n = row_count;
  if p_delete then delete from public.contracts where id = p_id; else update public.contracts set status = 'ended' where id = p_id; end if;
  return jsonb_build_object('ok', true, 'removed', n, 'photos', files);
end $$;

-- Analytics: plan/society money counts when the month is marked paid; covered visits count as paid.
create or replace function public.range_numbers(p_from date, p_to date) returns jsonb
language sql stable security definer set search_path = public as $$
  with r as (select * from public.bookings where wash_date between p_from and p_to),
       firsts as (select phone, min(wash_date) f from public.bookings where status <> 'cancelled' group by phone),
       cost as (select coalesce(sum(c.amount * ((least(p_to, (c.month + interval '1 month')::date - 1) - greatest(p_from, c.month) + 1)::numeric
                       / ((c.month + interval '1 month')::date - c.month))), 0) amt
                from public.costs c where c.month <= p_to and (c.month + interval '1 month')::date - 1 >= p_from),
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
    'costs',      (select round(amt) from cost),
    'ads',        (select coalesce(round(sum(c.amount * ((least(p_to, (c.month + interval '1 month')::date - 1) - greatest(p_from, c.month) + 1)::numeric
                       / ((c.month + interval '1 month')::date - c.month)))), 0)
                   from public.costs c where c.category = 'ads' and c.month <= p_to and (c.month + interval '1 month')::date - 1 >= p_from));
$$;

-- ---------------------------------------------------------------- who may call what
revoke execute on function public.covered_guard(), public.contract_json(public.contracts), public.contract_days(public.contracts, date, date),
                           public.contract_visit(public.contracts, bigint, date, text) from public, anon, authenticated;
revoke execute on function public.owner_contract(bigint), public.owner_contracts(), public.owner_save_contract(jsonb), public.owner_contract_period(bigint, date),
                           public.owner_add_visit(bigint, date, text), public.owner_pay_period(bigint, text), public.owner_end_contract(bigint, boolean)
  from public, anon;
grant execute on function public.owner_contract(bigint), public.owner_contracts(), public.owner_save_contract(jsonb), public.owner_contract_period(bigint, date),
                          public.owner_add_visit(bigint, date, text), public.owner_pay_period(bigint, text), public.owner_end_contract(bigint, boolean)
  to authenticated;

notify pgrst, 'reload schema';
select 'Done: monthly plans and society contracts are ready' as result;

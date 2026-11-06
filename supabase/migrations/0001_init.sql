-- =============================================================================
-- Vroombrite — database (Supabase, Mumbai region)
-- Run once: Supabase dashboard → SQL Editor → New query → paste this file → Run.
--
-- How it is locked down
-- * Every table has row level security ON and no direct access for the public (anon).
-- * The website can only call the public functions below (create a booking, check an
--   offer, send an enquiry / society lead / review, read approved reviews).
-- * Staff sign in (Supabase Auth). The first login ever created becomes the owner;
--   every later login starts INACTIVE until the owner switches it on in the staff app.
-- =============================================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Staff (one row per login)
-- -----------------------------------------------------------------------------
create table public.staff (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text not null default '',
  email       text,
  role        text not null default 'washer' check (role in ('owner', 'washer')),
  active      boolean not null default false,
  created_at  timestamptz not null default now()
);

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.staff where id = auth.uid() and active);
$$;

create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.staff where id = auth.uid() and active and role = 'owner');
$$;

-- First account = active owner. Later accounts = inactive washers until the owner activates them.
create or replace function public.handle_new_staff() returns trigger
language plpgsql security definer set search_path = public as $$
declare first_one boolean := not exists (select 1 from public.staff);
begin
  insert into public.staff (id, name, email, role, active)
  values (new.id,
          coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''),
                   nullif(initcap(trim(regexp_replace(split_part(new.email, '@', 1), '[^A-Za-z]+', ' ', 'g'))), ''), 'Staff'),
          new.email,
          case when first_one then 'owner' else 'washer' end,
          first_one);
  return new;
end $$;

create trigger on_auth_user_created_vroombrite
  after insert on auth.users for each row execute function public.handle_new_staff();

-- -----------------------------------------------------------------------------
-- Offers (code WELCOME50 and the friend referral). Keep in step with PROMOS /
-- REFERRAL in src/app.js, which shows the same rules to customers.
-- -----------------------------------------------------------------------------
create table public.offers (
  code             text primary key,          -- 'REFERRAL' is the friend-referral rule
  amount           int  not null check (amount > 0),
  min_order        int  not null default 0,
  first_wash_only  boolean not null default true,
  referrer_credit  int  not null default 0,
  active           boolean not null default true
);
insert into public.offers (code, amount, min_order, first_wash_only, referrer_credit) values
  ('WELCOME50', 50, 299, true, 0),
  ('REFERRAL',  50, 299, true, 50);

-- -----------------------------------------------------------------------------
-- Bookings
-- -----------------------------------------------------------------------------
create table public.bookings (
  id                text primary key check (id ~ '^VB-[0-9]{6}-[A-Z0-9]{4,8}$'),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  status            text not null default 'new' check (status in ('new', 'confirmed', 'on_way', 'done', 'cancelled')),
  vehicle_type      text not null default 'car' check (vehicle_type in ('car', 'bike')),
  vehicle           text not null,
  plate             text not null default '',
  package           text not null,
  extras            text not null default '',
  wash_date         date not null,
  slot              text not null,
  address           text not null,
  area              text not null default '',
  pin               text not null default '',
  name              text not null,
  phone             text not null check (phone ~ '^[6-9][0-9]{9}$'),
  notes             text not null default '',
  subtotal          int  not null check (subtotal >= 0),
  discount          int  not null default 0 check (discount >= 0),
  total             int  not null check (total >= 0),
  promo             text not null default '',
  promo_note        text not null default '',
  referred_by       text not null default '',
  pay_mode          text not null default 'after' check (pay_mode in ('after', 'online')),
  payment           text not null default 'pending' check (payment in ('pending', 'paid_upi', 'paid_cash', 'refunded')),
  confirmed_at      timestamptz,
  on_way_at         timestamptz,
  done_at           timestamptz,
  paid_at           timestamptz,
  cancelled_at      timestamptz,
  reminder_sent_at  timestamptz,
  review_asked_at   timestamptz,
  updated_by        uuid references public.staff (id) on delete set null
);
create index bookings_wash_date_idx on public.bookings (wash_date);
create index bookings_phone_idx on public.bookings (phone);

create table public.referral_credits (
  id                 bigint generated always as identity primary key,
  created_at         timestamptz not null default now(),
  referrer_phone     text not null,
  friend_phone       text not null,
  friend_booking_id  text not null references public.bookings (id) on delete cascade,
  amount             int  not null,
  status             text not null default 'pending' check (status in ('pending', 'available', 'used')),
  used_on_booking    text references public.bookings (id) on delete set null
);
create index referral_credits_referrer_idx on public.referral_credits (referrer_phone);

create table public.enquiries (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  name        text not null,
  phone       text not null,
  message     text not null,
  status      text not null default 'new' check (status in ('new', 'replied', 'closed'))
);

create table public.society_leads (
  id            bigint generated always as identity primary key,
  created_at    timestamptz not null default now(),
  society       text not null,
  area          text not null default '',
  pin           text not null default '',
  contact_name  text not null,
  phone         text not null,
  role          text not null default '',
  cars          int  not null default 0,
  bikes         int  not null default 0,
  days          text not null default '',
  notes         text not null default '',
  status        text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'won', 'lost'))
);

create table public.reviews (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  booking_id  text references public.bookings (id) on delete cascade,
  name        text not null default '',
  rating      int  not null check (rating between 1 and 5),
  text        text not null default '',
  area        text not null default '',
  approved    boolean not null default false
);
create unique index reviews_one_per_booking on public.reviews (booking_id) where booking_id is not null;

-- Private settings (the Google Sheet copy key). Never readable from outside.
create table public.app_settings (key text primary key, value text not null);
insert into public.app_settings values ('sheet_copy_key', encode(gen_random_bytes(18), 'hex'));

-- -----------------------------------------------------------------------------
-- Lock everything down. All reads and writes go through the functions below,
-- except staff reading bookings directly (needed for live updates).
-- -----------------------------------------------------------------------------
alter table public.staff            enable row level security;
alter table public.offers           enable row level security;
alter table public.bookings         enable row level security;
alter table public.referral_credits enable row level security;
alter table public.enquiries        enable row level security;
alter table public.society_leads    enable row level security;
alter table public.reviews          enable row level security;
alter table public.app_settings     enable row level security;

revoke all on public.staff, public.offers, public.bookings, public.referral_credits, public.enquiries,
              public.society_leads, public.reviews, public.app_settings from anon, authenticated;
grant select on public.bookings to authenticated;
create policy "staff read bookings" on public.bookings for select to authenticated using (public.is_staff());

-- Live updates for the staff app (only if Supabase Realtime is present).
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.bookings;
  end if;
end $$;

-- =============================================================================
-- Helpers
-- =============================================================================
create or replace function public.ist_today() returns date
language sql stable as $$ select (now() at time zone 'Asia/Kolkata')::date $$;

create or replace function public.clip(t text, n int default 500) returns text
language sql immutable as $$ select left(btrim(coalesce(t, '')), n) $$;

create or replace function public.digits10(t text) returns text
language sql immutable as $$ select right(regexp_replace(coalesce(t, ''), '\D', '', 'g'), 10) $$;

-- Prior (non-cancelled) bookings for a phone; used for "first wash" rules.
create or replace function public.booking_count(p_phone text) returns int
language sql stable security definer set search_path = public as $$
  select count(*)::int from public.bookings where phone = p_phone and status <> 'cancelled';
$$;

-- One rule for offers, used by check_offer and create_booking.
-- Returns {valid, reason, off, min, referrer_credit}
create or replace function public.offer_verdict(p_phone text, p_code text, p_ref text, p_subtotal int default null)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare o public.offers; v_code text := upper(public.clip(p_code, 40)); v_ref text := public.digits10(p_ref);
begin
  if v_ref <> '' then
    select * into o from public.offers where offers.code = 'REFERRAL' and active;
    if not found then return jsonb_build_object('valid', false, 'reason', 'unknown'); end if;
    if v_ref = p_phone then return jsonb_build_object('valid', false, 'reason', 'self'); end if;
    if public.booking_count(v_ref) = 0 then return jsonb_build_object('valid', false, 'reason', 'unknown_ref'); end if;
  elsif v_code <> '' then
    select * into o from public.offers where offers.code = v_code and v_code <> 'REFERRAL' and active;
    if not found then return jsonb_build_object('valid', false, 'reason', 'unknown'); end if;
  else
    return jsonb_build_object('valid', false, 'reason', 'empty');
  end if;
  if o.first_wash_only and p_phone ~ '^[6-9][0-9]{9}$' and public.booking_count(p_phone) > 0 then
    return jsonb_build_object('valid', false, 'reason', 'not_first');
  end if;
  if p_subtotal is not null and p_subtotal < o.min_order then
    return jsonb_build_object('valid', false, 'reason', 'min', 'min', o.min_order);
  end if;
  return jsonb_build_object('valid', true, 'off', o.amount, 'min', o.min_order, 'referrer_credit', o.referrer_credit);
end $$;

-- How a booking row is sent to the staff app.
create or replace function public.booking_json(b public.bookings) returns jsonb
language sql stable security definer set search_path = public as $$
  select to_jsonb(b) - 'updated_by' || jsonb_build_object(
    'credit', coalesce((select sum(amount) from public.referral_credits
                        where referrer_phone = b.phone and status = 'available'), 0),
    'visits', (select count(*) from public.bookings x where x.phone = b.phone and x.status = 'done' and x.id <> b.id));
$$;

-- =============================================================================
-- PUBLIC functions (website, no login)
-- =============================================================================

-- Offer check while the customer types.  check_offer('9876543210', 'WELCOME50', null)
create or replace function public.check_offer(p_phone text, p_code text default null, p_ref text default null)
returns jsonb language sql stable security definer set search_path = public as $$
  select public.offer_verdict(public.digits10(p_phone), p_code, p_ref, null) || jsonb_build_object('ok', true);
$$;

-- Save a booking. p is the JSON the website builds (see src/app.js).
create or replace function public.create_booking(p jsonb) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare
  ph text := public.digits10(p ->> 'phone');
  sub int := greatest(coalesce((p ->> 'subtotal')::int, (p ->> 'total')::int + coalesce((p ->> 'discount')::int, 0)), 0);
  asked int := coalesce((p ->> 'discount')::int, 0);
  v jsonb; disc int := 0; note text := ''; v_code text := upper(public.clip(p ->> 'promo', 40));
  v_ref text := public.digits10(p ->> 'ref'); first_wash boolean;
  d date := (p ->> 'date')::date;
begin
  if ph !~ '^[6-9][0-9]{9}$' then raise exception 'invalid phone' using errcode = '22023'; end if;
  if d is null or d < public.ist_today() - 1 or d > public.ist_today() + 90 then raise exception 'invalid date' using errcode = '22023'; end if;
  if public.clip(p ->> 'name') = '' or public.clip(p ->> 'address') = '' then raise exception 'missing details' using errcode = '22023'; end if;
  if (select count(*) from public.bookings where phone = ph and created_at > now() - interval '1 day') >= 6 then
    raise exception 'too many bookings today' using errcode = '22023';
  end if;
  first_wash := public.booking_count(ph) = 0;

  -- The server decides the discount; what the browser asked for is only a hint.
  if asked > 0 or v_code not in ('', 'REFERRAL') or v_ref <> '' then
    v := public.offer_verdict(ph, case when v_ref <> '' then null else v_code end, v_ref, sub);
    if (v ->> 'valid')::boolean then disc := least((v ->> 'off')::int, sub);
    else note := 'Offer not applied: ' || coalesce(v ->> 'reason', 'invalid'); end if;
  end if;

  insert into public.bookings (id, vehicle_type, vehicle, plate, package, extras, wash_date, slot, address, area, pin,
                               name, phone, notes, subtotal, discount, total, promo, promo_note, referred_by, pay_mode)
  values (public.clip(p ->> 'id', 20),
          case when (p ->> 'vehicle') ilike 'bike%' then 'bike' else 'car' end,
          public.clip(p ->> 'vehicle', 80), public.clip(p ->> 'plate', 20), public.clip(p ->> 'package', 80),
          case when public.clip(p ->> 'addons', 300) = 'None' then '' else public.clip(p ->> 'addons', 300) end,
          d, public.clip(p ->> 'slot', 30), public.clip(p ->> 'address', 300), public.clip(p ->> 'area', 60),
          public.clip(p ->> 'pin', 6), public.clip(p ->> 'name', 80), ph, public.clip(p ->> 'notes', 500),
          sub, disc, sub - disc,
          case when disc > 0 then (case when v_ref <> '' then 'REFERRAL' else v_code end) else '' end,
          note, case when disc > 0 then v_ref else '' end,
          case when p ->> 'payment' ilike 'online%' or p ->> 'pay_mode' = 'online' then 'online' else 'after' end);

  if disc > 0 and v_ref <> '' and (v ->> 'referrer_credit')::int > 0 then
    insert into public.referral_credits (referrer_phone, friend_phone, friend_booking_id, amount)
    values (v_ref, ph, p ->> 'id', (v ->> 'referrer_credit')::int);
  end if;
  return jsonb_build_object('ok', true, 'id', p ->> 'id', 'first_wash', first_wash, 'discount', disc, 'total', sub - disc, 'note', note);
end $$;

create or replace function public.submit_enquiry(p jsonb) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare ph text := public.digits10(p ->> 'phone');
begin
  if ph !~ '^[6-9][0-9]{9}$' or public.clip(p ->> 'message') = '' then raise exception 'missing details' using errcode = '22023'; end if;
  if (select count(*) from public.enquiries where phone = ph and created_at > now() - interval '1 day') >= 5 then
    raise exception 'too many messages today' using errcode = '22023'; end if;
  insert into public.enquiries (name, phone, message) values (public.clip(p ->> 'name', 80), ph, public.clip(p ->> 'message', 1000));
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.submit_society_lead(p jsonb) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare ph text := public.digits10(p ->> 'phone');
begin
  if ph !~ '^[6-9][0-9]{9}$' or public.clip(p ->> 'society') = '' then raise exception 'missing details' using errcode = '22023'; end if;
  if (select count(*) from public.society_leads where phone = ph and created_at > now() - interval '1 day') >= 3 then
    raise exception 'too many requests today' using errcode = '22023'; end if;
  insert into public.society_leads (society, area, pin, contact_name, phone, role, cars, bikes, days, notes)
  values (public.clip(p ->> 'society', 120), public.clip(p ->> 'area', 60), public.clip(p ->> 'pin', 6), public.clip(p ->> 'name', 80), ph,
          public.clip(p ->> 'role', 60), least(greatest(coalesce(nullif(p ->> 'cars', '')::int, 0), 0), 2000),
          least(greatest(coalesce(nullif(p ->> 'bikes', '')::int, 0), 0), 2000), public.clip(p ->> 'days', 120), public.clip(p ->> 'notes', 1000));
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.submit_review(p jsonb) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare b public.bookings; r int := coalesce((p ->> 'rating')::int, 0); bid text := public.clip(p ->> 'id', 20);
begin
  if r < 1 or r > 5 then raise exception 'rating must be 1 to 5' using errcode = '22023'; end if;
  select * into b from public.bookings where id = bid;
  if not found then raise exception 'booking not found' using errcode = '22023'; end if;
  insert into public.reviews (booking_id, name, rating, text, area)
  values (bid, coalesce(nullif(public.clip(p ->> 'name', 40), ''), split_part(b.name, ' ', 1)), r, public.clip(p ->> 'text', 1000), b.area)
  on conflict (booking_id) where booking_id is not null
  do update set rating = excluded.rating, text = excluded.text, name = excluded.name, approved = false, created_at = now();
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.public_reviews() returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(x order by x.created_at desc), '[]'::jsonb) from (
    select split_part(name, ' ', 1) as name, rating, text, area, created_at::date as date, created_at
    from public.reviews where approved order by created_at desc limit 12) x;
$$;

-- =============================================================================
-- STAFF functions (signed in, active)
-- =============================================================================
create or replace function public.staff_me() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare s public.staff;
begin
  select * into s from public.staff where id = auth.uid();
  if not found then raise exception 'not staff' using errcode = '42501'; end if;
  return jsonb_build_object('id', s.id, 'name', s.name, 'role', s.role, 'active', s.active);
end $$;

-- Everything the Today screen needs in one call: the day's jobs and a 14-day strip of counts.
create or replace function public.staff_day(p_date date) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_staff() then raise exception 'not allowed' using errcode = '42501'; end if;
  return jsonb_build_object(
    'date', p_date,
    'jobs', coalesce((select jsonb_agg(public.booking_json(b) order by
               array_position(array['6–8 AM','8–10 AM','10 AM–1 PM','2–5 PM','5–8 PM'], b.slot), b.created_at)
             from public.bookings b where b.wash_date = p_date), '[]'::jsonb),
    'strip', (select jsonb_agg(jsonb_build_object('date', d::date,
               'count', (select count(*) from public.bookings b where b.wash_date = d::date and b.status <> 'cancelled'),
               'open',  (select count(*) from public.bookings b where b.wash_date = d::date and b.status in ('new','confirmed','on_way')))
             order by d)
             from generate_series(p_date - 3, p_date + 10, interval '1 day') d));
end $$;

-- One button = one call. Returns the updated booking.
create or replace function public.staff_update(p_id text, p_action text) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare b public.bookings; me uuid := auth.uid();
begin
  if not public.is_staff() then raise exception 'not allowed' using errcode = '42501'; end if;
  select * into b from public.bookings where id = p_id for update;
  if not found then raise exception 'booking not found' using errcode = '22023'; end if;
  case p_action
    when 'confirm'   then update public.bookings set status = case when status = 'new' then 'confirmed' else status end, confirmed_at = coalesce(confirmed_at, now()) where id = p_id;
    when 'on_way'    then update public.bookings set status = 'on_way', on_way_at = now(), confirmed_at = coalesce(confirmed_at, now()) where id = p_id;
    when 'done'      then update public.bookings set status = 'done', done_at = now() where id = p_id;
                          update public.referral_credits set status = 'available' where friend_booking_id = p_id and status = 'pending';
    when 'paid_upi'  then update public.bookings set payment = 'paid_upi', paid_at = now() where id = p_id;
    when 'paid_cash' then update public.bookings set payment = 'paid_cash', paid_at = now() where id = p_id;
    when 'unpaid'    then update public.bookings set payment = 'pending', paid_at = null where id = p_id;
    when 'cancel'    then update public.bookings set status = 'cancelled', cancelled_at = now() where id = p_id;
                          update public.referral_credits set status = 'used', used_on_booking = null where friend_booking_id = p_id and status = 'pending';
    when 'reopen'    then update public.bookings set status = case when confirmed_at is null then 'new' else 'confirmed' end, cancelled_at = null, done_at = null where id = p_id;
    when 'reminded'  then update public.bookings set reminder_sent_at = now() where id = p_id;
    when 'review_asked' then update public.bookings set review_asked_at = now() where id = p_id;
    when 'use_credit' then update public.referral_credits set status = 'used', used_on_booking = p_id
                           where referrer_phone = b.phone and status = 'available';
    else raise exception 'unknown action %', p_action using errcode = '22023';
  end case;
  update public.bookings set updated_at = now(), updated_by = me where id = p_id;
  select * into b from public.bookings where id = p_id;
  return public.booking_json(b);
end $$;

-- Search and upcoming list (both roles).
create or replace function public.staff_bookings(p_query text default '', p_from date default null, p_limit int default 60) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare q text := public.clip(p_query, 60);
begin
  if not public.is_staff() then raise exception 'not allowed' using errcode = '42501'; end if;
  return coalesce((select jsonb_agg(public.booking_json(b) order by b.wash_date, b.created_at) from (
    select * from public.bookings b
    where (q = '' and b.wash_date >= coalesce(p_from, public.ist_today()) and b.status <> 'cancelled')
       or (q <> '' and (b.name ilike '%' || q || '%' or b.phone like '%' || q || '%' or b.id ilike '%' || q || '%'
                        or b.plate ilike '%' || q || '%' or b.area ilike '%' || q || '%'))
    order by case when q = '' then b.wash_date end asc, case when q <> '' then b.wash_date end desc
    limit least(greatest(p_limit, 1), 200)) b), '[]'::jsonb);
end $$;

-- =============================================================================
-- OWNER functions
-- =============================================================================
create or replace function public.owner_overview() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare t date := public.ist_today();
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  return (
    with live as (select * from public.bookings where status <> 'cancelled')
    select jsonb_build_object(
      'today',          (select count(*) from live where wash_date = t),
      'upcoming',       (select count(*) from live where wash_date > t),
      'done_week',      (select count(*) from live where status = 'done' and wash_date between t - 6 and t),
      'collected_month',(select coalesce(sum(total), 0) from live where payment like 'paid%' and date_trunc('month', coalesce(paid_at, wash_date)) = date_trunc('month', t)),
      'collected_week', (select coalesce(sum(total), 0) from live where payment like 'paid%' and coalesce(paid_at::date, wash_date) between t - 6 and t),
      'unpaid_amount',  (select coalesce(sum(total), 0) from live where status = 'done' and payment = 'pending'),
      'unpaid_count',   (select count(*) from live where status = 'done' and payment = 'pending'),
      'customers',      (select count(distinct phone) from live),
      'repeat',         (select count(*) from (select phone from live group by phone having count(*) > 1) r),
      'avg_ticket',     (select coalesce(round(avg(total)), 0) from live where status = 'done'),
      'last14',         (select jsonb_agg(jsonb_build_object('date', d::date,
                          'count', (select count(*) from live where wash_date = d::date),
                          'amount', (select coalesce(sum(total), 0) from live where wash_date = d::date and payment like 'paid%')) order by d)
                         from generate_series(t - 13, t, interval '1 day') d),
      'packages',       (select coalesce(jsonb_agg(jsonb_build_object('name', package, 'count', n) order by n desc), '[]'::jsonb)
                         from (select package, count(*) n from live group by package order by n desc limit 5) p),
      'areas',          (select coalesce(jsonb_agg(jsonb_build_object('name', area, 'count', n) order by n desc), '[]'::jsonb)
                         from (select area, count(*) n from live where area <> '' group by area order by n desc limit 5) a),
      'new_leads',      (select count(*) from public.society_leads where status = 'new'),
      'new_enquiries',  (select count(*) from public.enquiries where status = 'new'),
      'pending_reviews',(select count(*) from public.reviews where not approved),
      'inactive_staff', (select count(*) from public.staff where not active)));
end $$;

-- Customers whose last finished wash was p_days+ days ago and who have nothing booked.
create or replace function public.owner_due(p_days int default 12) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare t date := public.ist_today();
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  return coalesce((select jsonb_agg(x order by x.days_ago desc) from (
    select distinct on (b.phone) b.id, b.name, b.phone, b.vehicle, b.package, b.area, b.wash_date as last_date,
           (t - b.wash_date) as days_ago, b.reminder_sent_at,
           (select count(*) from public.bookings z where z.phone = b.phone and z.status = 'done') as washes
    from public.bookings b
    where b.status = 'done'
      and not exists (select 1 from public.bookings u where u.phone = b.phone and u.status in ('new','confirmed','on_way') and u.wash_date >= t)
    order by b.phone, b.wash_date desc) x
    where x.days_ago >= p_days), '[]'::jsonb);
end $$;

create or replace function public.owner_inbox() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  return jsonb_build_object(
    'leads',     coalesce((select jsonb_agg(to_jsonb(l) order by l.created_at desc) from (select * from public.society_leads order by created_at desc limit 50) l), '[]'::jsonb),
    'enquiries', coalesce((select jsonb_agg(to_jsonb(e) order by e.created_at desc) from (select * from public.enquiries order by created_at desc limit 50) e), '[]'::jsonb),
    'reviews',   coalesce((select jsonb_agg(to_jsonb(r) || jsonb_build_object('customer', b.name) order by r.created_at desc)
                           from (select * from public.reviews order by approved, created_at desc limit 50) r
                           left join public.bookings b on b.id = r.booking_id), '[]'::jsonb));
end $$;

create or replace function public.owner_set(p_kind text, p_id bigint, p_value text) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  case p_kind
    when 'lead'    then update public.society_leads set status = p_value where id = p_id;
    when 'enquiry' then update public.enquiries set status = p_value where id = p_id;
    when 'review'  then update public.reviews set approved = (p_value = 'approved') where id = p_id;
    when 'review_delete' then delete from public.reviews where id = p_id;
    else raise exception 'unknown kind' using errcode = '22023';
  end case;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.owner_team() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  return jsonb_build_object(
    'staff', (select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'email', email, 'role', role, 'active', active) order by role, created_at) from public.staff),
    'sheet_copy_key', (select value from public.app_settings where key = 'sheet_copy_key'));
end $$;

create or replace function public.owner_set_staff(p_id uuid, p_active boolean, p_name text default null) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  if p_id = auth.uid() and not p_active then raise exception 'you cannot switch off your own login' using errcode = '22023'; end if;
  update public.staff set active = p_active, name = coalesce(nullif(public.clip(p_name, 60), ''), name) where id = p_id;
  return jsonb_build_object('ok', true);
end $$;

-- =============================================================================
-- Google Sheet copy (nightly). Needs the secret key shown to the owner in Team.
-- =============================================================================
create or replace function public.sheet_copy(p_key text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if p_key is null or p_key <> (select value from public.app_settings where key = 'sheet_copy_key') then
    raise exception 'wrong key' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'bookings',  coalesce((select jsonb_agg(to_jsonb(b) - 'updated_by' order by b.created_at) from public.bookings b), '[]'::jsonb),
    'leads',     coalesce((select jsonb_agg(to_jsonb(l) order by l.created_at) from public.society_leads l), '[]'::jsonb),
    'enquiries', coalesce((select jsonb_agg(to_jsonb(e) order by e.created_at) from public.enquiries e), '[]'::jsonb),
    'reviews',   coalesce((select jsonb_agg(to_jsonb(r) order by r.created_at) from public.reviews r), '[]'::jsonb),
    'credits',   coalesce((select jsonb_agg(to_jsonb(c) order by c.created_at) from public.referral_credits c), '[]'::jsonb));
end $$;

-- =============================================================================
-- Who may call what
-- =============================================================================
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.check_offer(text, text, text),
                          public.create_booking(jsonb),
                          public.submit_enquiry(jsonb),
                          public.submit_society_lead(jsonb),
                          public.submit_review(jsonb),
                          public.public_reviews(),
                          public.sheet_copy(text)
  to anon, authenticated;
grant execute on function public.is_staff(), public.is_owner(),
                          public.staff_me(), public.staff_day(date), public.staff_update(text, text),
                          public.staff_bookings(text, date, int),
                          public.owner_overview(), public.owner_due(int), public.owner_inbox(),
                          public.owner_set(text, bigint, text), public.owner_team(), public.owner_set_staff(uuid, boolean, text)
  to authenticated;

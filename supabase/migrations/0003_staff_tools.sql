-- =============================================================================
-- 0003 — Staff app tools (Nov 2026). Run after 0001 and 0002. Safe to run again.
-- Brings over the Studio CRM tools that fit a wash business:
--   * assign a washer to a job, where a booking came from, who added it
--   * booking history (who did what, when), notes, call outcomes
--   * add / edit / delete bookings from the staff app
--   * customer directory
--   * WhatsApp message wording, offers, team notice, monthly costs: owner edits in the app
--   * activity log for the owner (never stores customer details) and CSV export
--   * login management helpers used by the team-admin function (add, role, phone, delete)
-- =============================================================================

-- ---------------------------------------------------------------- columns
alter table public.staff    add column if not exists phone        text not null default '';
alter table public.staff    add column if not exists last_seen_at timestamptz;
alter table public.bookings add column if not exists assigned_to  uuid references public.staff (id) on delete set null;
alter table public.bookings add column if not exists created_by   uuid references public.staff (id) on delete set null;
alter table public.bookings add column if not exists source       text not null default 'website';
do $$ begin
  alter table public.bookings add constraint bookings_source_chk
    check (source in ('website', 'phone', 'whatsapp', 'walk_in', 'society', 'instagram', 'repeat', 'other'));
exception when duplicate_object then null; end $$;
create index if not exists bookings_assigned_idx on public.bookings (assigned_to);

-- Keep staff.email in step when a login's email is changed.
create or replace function public.handle_staff_email() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.staff set email = new.email where id = new.id;
  return new;
end $$;
drop trigger if exists on_auth_user_email_vroombrite on auth.users;
create trigger on_auth_user_email_vroombrite after update of email on auth.users
  for each row when (old.email is distinct from new.email) execute function public.handle_staff_email();

-- ---------------------------------------------------------------- new tables
create table if not exists public.booking_events (
  id          bigint generated always as identity primary key,
  booking_id  text not null references public.bookings (id) on delete cascade,
  at          timestamptz not null default now(),
  actor       uuid references public.staff (id) on delete set null,
  actor_name  text not null default '',
  kind        text not null check (kind in ('created','status','payment','edited','assigned','note','call','message','credit')),
  detail      text not null default '' check (length(detail) <= 500)
);
create index if not exists booking_events_booking_idx on public.booking_events (booking_id, at desc);

create table if not exists public.message_templates (
  key       text primary key check (key ~ '^[a-z_]{2,20}$'),
  title     text not null check (length(title) between 1 and 40),
  body      text not null check (length(body) between 1 and 1000),
  position  smallint not null default 0
);
insert into public.message_templates (key, title, body, position) values
  ('confirm', 'Confirm booking', 'Hi {first_name}, this is {brand}. Your {package} for your {vehicle} is confirmed for {date}, {slot}. We''ll message you when we''re on the way.
Booking ID: {id}', 0),
  ('remind',  'Reminder', 'Hi {first_name}, a reminder from {brand}: your {package} is on {date}, {slot}, at {address}. Please keep the vehicle accessible. Reply here to reschedule.', 1),
  ('onway',   'On my way', 'Hi {first_name}, your {brand} washer is on the way and will reach in about 20 minutes.', 2),
  ('review',  'Ask for a review', 'Hi {first_name}, thank you for choosing {brand}! How did we do? Rate your wash here, it takes 20 seconds: {review_link}', 3),
  ('rebook',  'Rebook (due customers)', 'Hi {first_name}, it''s been {days} days since your last {brand} wash. Shall we book your {package} again? Reply with a day and time that suits you, or book here: {book_link}', 4),
  ('lead',    'Society request', 'Hi {first_name}, this is {brand}. Thanks for your society quote request for {society}. When can we visit to see the parking and share a group price?', 5),
  ('enquiry', 'Reply to a message', 'Hi {first_name}, this is {brand}. Thanks for your message. ', 6),
  ('noanswer','Couldn''t reach you', 'Hi {first_name}, this is {brand}. We tried calling about your {package} on {date}. Please reply here or call us back when free.', 7)
on conflict (key) do nothing;

create table if not exists public.team_notice (
  id          smallint primary key default 1 check (id = 1),
  body        text check (body is null or length(body) <= 280),
  updated_at  timestamptz not null default now(),
  updated_by  uuid references public.staff (id) on delete set null
);
insert into public.team_notice (id, body) values (1, null) on conflict (id) do nothing;

create table if not exists public.costs (
  month     date not null check (extract(day from month) = 1),
  category  text not null check (category in ('ads', 'supplies', 'fuel', 'pay', 'other')),
  amount    int  not null default 0 check (amount >= 0 and amount <= 10000000),
  primary key (month, category)
);

-- Owner-only activity log. Never stores a customer's name, phone or address.
create table if not exists public.audit_log (
  id          bigint generated always as identity primary key,
  at          timestamptz not null default now(),
  actor       uuid references public.staff (id) on delete set null,
  actor_name  text not null default '',
  action      text not null check (action in ('export', 'booking_deleted', 'login_added', 'login_switched_on', 'login_switched_off',
                'login_role', 'login_password', 'login_edited', 'login_deleted', 'messages_saved', 'notice_posted', 'notice_cleared',
                'offers_saved', 'costs_saved')),
  detail      text not null default '' check (length(detail) <= 300)
);
create index if not exists audit_log_at_idx on public.audit_log (at desc);

alter table public.booking_events    enable row level security;
alter table public.message_templates enable row level security;
alter table public.team_notice       enable row level security;
alter table public.costs             enable row level security;
alter table public.audit_log         enable row level security;
revoke all on public.booking_events, public.message_templates, public.team_notice, public.costs, public.audit_log from anon, authenticated;

-- ---------------------------------------------------------------- helpers
create or replace function public.my_name() returns text
language sql stable security definer set search_path = public as $$
  select coalesce((select name from public.staff where id = auth.uid()), '');
$$;

create or replace function public.audit(p_action text, p_detail text default '') returns void
language sql volatile security definer set search_path = public as $$
  insert into public.audit_log (actor, actor_name, action, detail) values (auth.uid(), public.my_name(), p_action, left(coalesce(p_detail, ''), 300));
$$;

create or replace function public.ev(p_booking text, p_kind text, p_detail text default '') returns void
language sql volatile security definer set search_path = public as $$
  insert into public.booking_events (booking_id, actor, actor_name, kind, detail)
  values (p_booking, auth.uid(), public.my_name(), p_kind, left(coalesce(p_detail, ''), 500));
$$;

create or replace function public.new_booking_id() returns text
language plpgsql volatile as $$
declare a text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; s text; i int;
begin
  loop
    s := '';
    for i in 1..5 loop s := s || substr(a, 1 + floor(random() * length(a))::int, 1); end loop;
    s := 'VB-' || to_char(public.ist_today(), 'YYMMDD') || '-' || s;
    exit when not exists (select 1 from public.bookings where id = s);
  end loop;
  return s;
end $$;

-- Bookings now carry the washer's name too.
create or replace function public.booking_json(b public.bookings) returns jsonb
language sql stable security definer set search_path = public as $$
  select to_jsonb(b) - 'updated_by' || jsonb_build_object(
    'credit', coalesce((select sum(amount) from public.referral_credits
                        where referrer_phone = b.phone and status = 'available'), 0),
    'visits', (select count(*) from public.bookings x where x.phone = b.phone and x.status = 'done' and x.id <> b.id),
    'assigned_name', (select name from public.staff s where s.id = b.assigned_to));
$$;

-- Website bookings get a "created" line in their history.
create or replace function public.booking_created_event() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.booking_events (booking_id, actor, actor_name, kind, detail)
  values (new.id, auth.uid(), coalesce((select name from public.staff where id = auth.uid()), ''), 'created',
          case when new.source = 'website' then 'Booked on the website'
               else 'Added in the staff app · ' || case new.source when 'whatsapp' then 'WhatsApp' when 'walk_in' then 'Walk-in' when 'instagram' then 'Instagram'
                                                        when 'phone' then 'Phone' when 'society' then 'Society' when 'repeat' then 'Repeat' else 'Other' end end
          || case when new.discount > 0 then ' · ' || case new.promo when 'MANUAL' then 'discount' when 'REFERRAL' then 'referral' else new.promo end || ' −₹' || new.discount else '' end);
  return new;
end $$;
drop trigger if exists booking_created_event on public.bookings;
create trigger booking_created_event after insert on public.bookings for each row execute function public.booking_created_event();

-- ---------------------------------------------------------------- staff: me, settings
create or replace function public.staff_me() returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare s public.staff;
begin
  update public.staff set last_seen_at = now() where id = auth.uid() and active returning * into s;
  if not found then select * into s from public.staff where id = auth.uid(); end if;
  if not found then raise exception 'not staff' using errcode = '42501'; end if;
  return jsonb_build_object('id', s.id, 'name', s.name, 'role', s.role, 'active', s.active, 'email', s.email, 'phone', s.phone);
end $$;

-- Things every screen needs: message wording, team notice, the team's names (for "assigned to").
create or replace function public.staff_settings() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_staff() then raise exception 'not allowed' using errcode = '42501'; end if;
  return jsonb_build_object(
    'templates', coalesce((select jsonb_agg(to_jsonb(t) order by t.position) from public.message_templates t), '[]'::jsonb),
    'notice', (select jsonb_build_object('body', body, 'updated_at', updated_at, 'by', (select name from public.staff where id = n.updated_by))
               from public.team_notice n where id = 1 and body is not null),
    'team', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'role', role) order by role, name)
                      from public.staff where active), '[]'::jsonb));
end $$;

-- ---------------------------------------------------------------- staff: actions on a booking
create or replace function public.staff_update(p_id text, p_action text) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare b public.bookings; me uuid := auth.uid(); n int;
begin
  if not public.is_staff() then raise exception 'not allowed' using errcode = '42501'; end if;
  select * into b from public.bookings where id = p_id for update;
  if not found then raise exception 'booking not found' using errcode = '22023'; end if;
  case p_action
    when 'confirm'   then update public.bookings set status = case when status = 'new' then 'confirmed' else status end, confirmed_at = coalesce(confirmed_at, now()) where id = p_id;
                          perform public.ev(p_id, 'status', 'Confirmed');
    when 'on_way'    then update public.bookings set status = 'on_way', on_way_at = now(), confirmed_at = coalesce(confirmed_at, now()) where id = p_id;
                          perform public.ev(p_id, 'status', 'On the way');
    when 'done'      then update public.bookings set status = 'done', done_at = now() where id = p_id;
                          update public.referral_credits set status = 'available' where friend_booking_id = p_id and status = 'pending';
                          perform public.ev(p_id, 'status', 'Washed');
    when 'paid_upi'  then update public.bookings set payment = 'paid_upi', paid_at = now() where id = p_id;
                          perform public.ev(p_id, 'payment', 'Paid by UPI · ₹' || b.total);
    when 'paid_cash' then update public.bookings set payment = 'paid_cash', paid_at = now() where id = p_id;
                          perform public.ev(p_id, 'payment', 'Paid in cash · ₹' || b.total);
    when 'unpaid'    then update public.bookings set payment = 'pending', paid_at = null where id = p_id;
                          perform public.ev(p_id, 'payment', 'Marked not paid');
    when 'cancel'    then update public.bookings set status = 'cancelled', cancelled_at = now() where id = p_id;
                          update public.referral_credits set status = 'used', used_on_booking = null where friend_booking_id = p_id and status = 'pending';
                          perform public.ev(p_id, 'status', 'Cancelled');
    when 'reopen'    then update public.bookings set status = case when confirmed_at is null then 'new' else 'confirmed' end, cancelled_at = null, done_at = null where id = p_id;
                          perform public.ev(p_id, 'status', 'Reopened');
    when 'reminded'  then update public.bookings set reminder_sent_at = now() where id = p_id;
                          perform public.ev(p_id, 'message', 'Reminder sent on WhatsApp');
    when 'review_asked' then update public.bookings set review_asked_at = now() where id = p_id;
                          perform public.ev(p_id, 'message', 'Review request sent on WhatsApp');
    when 'use_credit' then update public.referral_credits set status = 'used', used_on_booking = p_id
                           where referrer_phone = b.phone and status = 'available';
                          get diagnostics n = row_count;
                          if n > 0 then perform public.ev(p_id, 'credit', 'Referral credit used'); end if;
    else raise exception 'unknown action %', p_action using errcode = '22023';
  end case;
  update public.bookings set updated_at = now(), updated_by = me where id = p_id;
  select * into b from public.bookings where id = p_id;
  return public.booking_json(b);
end $$;

-- A note, call outcome or sent message, added to the booking's history.
create or replace function public.staff_log(p_id text, p_kind text, p_detail text) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
begin
  if not public.is_staff() then raise exception 'not allowed' using errcode = '42501'; end if;
  if p_kind not in ('note', 'call', 'message') then raise exception 'unknown kind' using errcode = '22023'; end if;
  if public.clip(p_detail, 500) = '' then raise exception 'empty' using errcode = '22023'; end if;
  if not exists (select 1 from public.bookings where id = p_id) then raise exception 'booking not found' using errcode = '22023'; end if;
  perform public.ev(p_id, p_kind, public.clip(p_detail, 500));
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.booking_history(p_id text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_staff() then raise exception 'not allowed' using errcode = '42501'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('at', at, 'who', actor_name, 'kind', kind, 'detail', detail) order by at desc, id desc)
                   from public.booking_events where booking_id = p_id), '[]'::jsonb);
end $$;

-- Add a booking from the staff app (phone call, WhatsApp, walk-in, society...).
-- Prices are typed by staff; no offer engine, but a discount can be given with a reason.
create or replace function public.staff_add_booking(p jsonb) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare
  ph text := public.digits10(p ->> 'phone');
  d date := (p ->> 'date')::date;
  sub int := greatest(coalesce((p ->> 'subtotal')::int, 0), 0);
  disc int := least(greatest(coalesce((p ->> 'discount')::int, 0), 0), greatest(coalesce((p ->> 'subtotal')::int, 0), 0));
  v_id text := public.new_booking_id(); b public.bookings; src text := coalesce(nullif(p ->> 'source', ''), 'phone');
  who uuid := nullif(p ->> 'assigned_to', '')::uuid;
begin
  if not public.is_staff() then raise exception 'not allowed' using errcode = '42501'; end if;
  if ph !~ '^[6-9][0-9]{9}$' then raise exception 'Enter a 10-digit mobile number' using errcode = '22023'; end if;
  if d is null or d < public.ist_today() - 30 or d > public.ist_today() + 180 then raise exception 'Pick a date' using errcode = '22023'; end if;
  if public.clip(p ->> 'name') = '' or public.clip(p ->> 'address') = '' or public.clip(p ->> 'package') = '' or public.clip(p ->> 'slot') = '' then
    raise exception 'Fill in name, address, package and time' using errcode = '22023'; end if;
  if src not in ('phone', 'whatsapp', 'walk_in', 'society', 'instagram', 'repeat', 'other') then src := 'other'; end if;
  if who is not null and not exists (select 1 from public.staff where id = who and active) then who := null; end if;
  if not public.is_owner() then who := coalesce(who, auth.uid()); end if;
  insert into public.bookings (id, status, vehicle_type, vehicle, plate, package, extras, wash_date, slot, address, area, pin,
                               name, phone, notes, subtotal, discount, total, promo, promo_note, pay_mode, source, created_by, assigned_to,
                               confirmed_at, updated_by)
  values (v_id, case when coalesce((p ->> 'confirmed')::boolean, true) then 'confirmed' else 'new' end,
          case when (p ->> 'vehicle') ilike 'bike%' then 'bike' else 'car' end,
          public.clip(p ->> 'vehicle', 80), upper(public.clip(p ->> 'plate', 20)), public.clip(p ->> 'package', 80), public.clip(p ->> 'extras', 300),
          d, public.clip(p ->> 'slot', 30), public.clip(p ->> 'address', 300), public.clip(p ->> 'area', 60), public.clip(p ->> 'pin', 6),
          public.clip(p ->> 'name', 80), ph, public.clip(p ->> 'notes', 500), sub, disc, sub - disc,
          case when disc > 0 then 'MANUAL' else '' end, case when disc > 0 then public.clip(p ->> 'discount_reason', 120) else '' end,
          'after', src, auth.uid(), who,
          case when coalesce((p ->> 'confirmed')::boolean, true) then now() end, auth.uid())
  returning * into b;
  return public.booking_json(b);
end $$;

-- Change a booking. Washers can change the plate and notes; the owner can change everything.
create or replace function public.staff_edit_booking(p_id text, p jsonb) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare b public.bookings; n public.bookings; changed text[] := '{}'; ph text; own boolean := public.is_owner();
begin
  if not public.is_staff() then raise exception 'not allowed' using errcode = '42501'; end if;
  select * into b from public.bookings where id = p_id for update;
  if not found then raise exception 'booking not found' using errcode = '22023'; end if;
  n := b;
  if p ? 'plate' then n.plate := upper(public.clip(p ->> 'plate', 20)); end if;
  if p ? 'notes' then n.notes := public.clip(p ->> 'notes', 500); end if;
  if own then
    if p ? 'name'    then n.name := public.clip(p ->> 'name', 80); end if;
    if p ? 'phone'   then ph := public.digits10(p ->> 'phone');
                          if ph !~ '^[6-9][0-9]{9}$' then raise exception 'Enter a 10-digit mobile number' using errcode = '22023'; end if; n.phone := ph; end if;
    if p ? 'vehicle' then n.vehicle := public.clip(p ->> 'vehicle', 80);
                          n.vehicle_type := case when n.vehicle ilike 'bike%' then 'bike' else 'car' end; end if;
    if p ? 'package' then n.package := public.clip(p ->> 'package', 80); end if;
    if p ? 'extras'  then n.extras := public.clip(p ->> 'extras', 300); end if;
    if p ? 'date'    then n.wash_date := (p ->> 'date')::date; end if;
    if p ? 'slot'    then n.slot := public.clip(p ->> 'slot', 30); end if;
    if p ? 'address' then n.address := public.clip(p ->> 'address', 300); end if;
    if p ? 'area'    then n.area := public.clip(p ->> 'area', 60); end if;
    if p ? 'pin'     then n.pin := public.clip(p ->> 'pin', 6); end if;
    if p ? 'subtotal' then n.subtotal := greatest(coalesce((p ->> 'subtotal')::int, 0), 0); end if;
    if p ? 'discount' then n.discount := least(greatest(coalesce((p ->> 'discount')::int, 0), 0), n.subtotal); end if;
    if p ? 'discount_reason' and n.discount > 0 and n.promo in ('', 'MANUAL') then n.promo := 'MANUAL'; n.promo_note := public.clip(p ->> 'discount_reason', 120); end if;
    if n.discount = 0 and n.promo = 'MANUAL' then n.promo := ''; n.promo_note := ''; end if;
    n.discount := least(n.discount, n.subtotal);
    n.total := n.subtotal - n.discount;
  end if;
  if public.clip(n.name) = '' or public.clip(n.address) = '' or n.wash_date is null then raise exception 'Name, address and date are needed' using errcode = '22023'; end if;
  if n.wash_date <> b.wash_date or n.slot <> b.slot then changed := changed || ('moved to ' || to_char(n.wash_date, 'DD Mon') || ', ' || n.slot); end if;
  if n.total <> b.total then changed := changed || ('price ₹' || b.total || ' → ₹' || n.total); end if;
  if n.package <> b.package or n.extras <> b.extras or n.vehicle <> b.vehicle then changed := changed || 'package'::text; end if;
  if n.name <> b.name or n.phone <> b.phone then changed := changed || 'contact'::text; end if;
  if n.address <> b.address or n.area <> b.area or n.pin <> b.pin then changed := changed || 'address'::text; end if;
  if n.plate <> b.plate then changed := changed || 'plate'::text; end if;
  if n.notes <> b.notes then changed := changed || 'notes'::text; end if;
  if array_length(changed, 1) is null then return public.booking_json(b); end if;
  update public.bookings set name = n.name, phone = n.phone, vehicle = n.vehicle, vehicle_type = n.vehicle_type, plate = n.plate,
         package = n.package, extras = n.extras, wash_date = n.wash_date, slot = n.slot, address = n.address, area = n.area, pin = n.pin,
         notes = n.notes, subtotal = n.subtotal, discount = n.discount, total = n.total, promo = n.promo, promo_note = n.promo_note,
         updated_at = now(), updated_by = auth.uid()
   where id = p_id returning * into n;
  perform public.ev(p_id, 'edited', 'Changed: ' || array_to_string(changed, ', '));
  return public.booking_json(n);
end $$;

-- Month calendar: bookings per day.
create or replace function public.staff_month(p_month date) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare m date := date_trunc('month', p_month)::date;
begin
  if not public.is_staff() then raise exception 'not allowed' using errcode = '42501'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('date', wash_date, 'count', n, 'open', o, 'done', d) order by wash_date) from (
    select wash_date, count(*) filter (where status <> 'cancelled') n,
           count(*) filter (where status in ('new', 'confirmed', 'on_way')) o, count(*) filter (where status = 'done') d
    from public.bookings where wash_date >= m and wash_date < (m + interval '1 month')::date group by wash_date) x), '[]'::jsonb);
end $$;

-- ---------------------------------------------------------------- owner: bookings
create or replace function public.owner_assign(p_id text, p_staff uuid) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare b public.bookings; nm text;
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  if p_staff is not null then
    select name into nm from public.staff where id = p_staff and active;
    if not found then raise exception 'That login is switched off' using errcode = '22023'; end if;
  end if;
  update public.bookings set assigned_to = p_staff, updated_at = now(), updated_by = auth.uid() where id = p_id returning * into b;
  if not found then raise exception 'booking not found' using errcode = '22023'; end if;
  perform public.ev(p_id, 'assigned', coalesce('Given to ' || nm, 'Unassigned'));
  return public.booking_json(b);
end $$;

create or replace function public.owner_delete_booking(p_id text) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare b public.bookings;
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  delete from public.bookings where id = p_id returning * into b;
  if not found then raise exception 'booking not found' using errcode = '22023'; end if;
  perform public.audit('booking_deleted', b.id || ' · ' || b.status || ' · ' || to_char(b.wash_date, 'DD Mon YYYY') || ' · ₹' || b.total);
  return jsonb_build_object('ok', true);
end $$;

-- Customer directory: one row per mobile number.
create or replace function public.owner_customers(p_query text default '', p_limit int default 100) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare q text := public.clip(p_query, 60);
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  return coalesce((select jsonb_agg(c order by c.last_date desc nulls last) from (
    select b.phone,
           (array_agg(b.name order by b.created_at desc))[1] as name,
           (array_agg(b.area order by b.created_at desc))[1] as area,
           (array_agg(b.vehicle || case when b.plate <> '' then ' · ' || b.plate else '' end order by b.created_at desc))[1] as vehicle,
           count(*) filter (where b.status <> 'cancelled') as bookings,
           count(*) filter (where b.status = 'done') as washes,
           coalesce(sum(b.total) filter (where b.payment like 'paid%'), 0) as spent,
           max(b.wash_date) filter (where b.status = 'done') as last_date,
           min(b.wash_date) filter (where b.status in ('new', 'confirmed', 'on_way') and b.wash_date >= public.ist_today()) as next_date,
           coalesce((select sum(amount) from public.referral_credits r where r.referrer_phone = b.phone and r.status = 'available'), 0) as credit,
           (select count(*) from public.referral_credits r where r.referrer_phone = b.phone) as referred
    from public.bookings b
    where q = '' or b.phone like '%' || q || '%' or b.name ilike '%' || q || '%' or b.plate ilike '%' || q || '%' or b.area ilike '%' || q || '%'
    group by b.phone
    order by max(b.wash_date) desc
    limit least(greatest(p_limit, 1), 500)) c), '[]'::jsonb);
end $$;

create or replace function public.owner_customer(p_phone text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  return coalesce((select jsonb_agg(public.booking_json(b) order by b.wash_date desc, b.created_at desc)
                   from public.bookings b where b.phone = public.digits10(p_phone)), '[]'::jsonb);
end $$;

-- ---------------------------------------------------------------- owner: settings
create or replace function public.owner_save_templates(p jsonb) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare r jsonb;
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  for r in select * from jsonb_array_elements(p) loop
    if public.clip(r ->> 'body', 1000) = '' then raise exception 'A message can''t be empty' using errcode = '22023'; end if;
    update public.message_templates set body = public.clip(r ->> 'body', 1000) where key = r ->> 'key';
  end loop;
  perform public.audit('messages_saved');
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.owner_set_notice(p_body text) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare t text := nullif(public.clip(p_body, 280), '');
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  update public.team_notice set body = t, updated_at = now(), updated_by = auth.uid() where id = 1;
  perform public.audit(case when t is null then 'notice_cleared' else 'notice_posted' end);
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.owner_offers() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  return coalesce((select jsonb_agg(to_jsonb(o) || jsonb_build_object('used',
            (select count(*) from public.bookings b where b.promo = o.code and b.status <> 'cancelled'))
          order by (o.code = 'REFERRAL') desc, o.code) from public.offers o), '[]'::jsonb);
end $$;

create or replace function public.owner_save_offer(p jsonb) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare c text := upper(public.clip(p ->> 'code', 20));
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  if c !~ '^[A-Z0-9]{3,20}$' then raise exception 'Code: 3–20 letters or numbers' using errcode = '22023'; end if;
  if coalesce((p ->> 'amount')::int, 0) < 1 or coalesce((p ->> 'amount')::int, 0) > 5000 then raise exception 'Discount must be ₹1 to ₹5,000' using errcode = '22023'; end if;
  insert into public.offers (code, amount, min_order, first_wash_only, referrer_credit, active)
  values (c, (p ->> 'amount')::int, greatest(coalesce((p ->> 'min_order')::int, 0), 0),
          coalesce((p ->> 'first_wash_only')::boolean, true),
          case when c = 'REFERRAL' then greatest(coalesce((p ->> 'referrer_credit')::int, 0), 0) else 0 end,
          coalesce((p ->> 'active')::boolean, true))
  on conflict (code) do update set amount = excluded.amount, min_order = excluded.min_order, first_wash_only = excluded.first_wash_only,
                                  referrer_credit = excluded.referrer_credit, active = excluded.active;
  perform public.audit('offers_saved', c);
  return public.owner_offers();
end $$;

create or replace function public.owner_costs(p_month date) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare m date := date_trunc('month', p_month)::date;
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  return jsonb_build_object('month', m, 'costs', coalesce((select jsonb_object_agg(category, amount) from public.costs where month = m), '{}'::jsonb));
end $$;

create or replace function public.owner_save_costs(p_month date, p jsonb) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare m date := date_trunc('month', p_month)::date; k text;
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  foreach k in array array['ads', 'supplies', 'fuel', 'pay', 'other'] loop
    if p ? k then
      insert into public.costs (month, category, amount) values (m, k, greatest(coalesce(nullif(p ->> k, '')::int, 0), 0))
      on conflict (month, category) do update set amount = excluded.amount;
    end if;
  end loop;
  perform public.audit('costs_saved', to_char(m, 'Mon YYYY'));
  return public.owner_costs(m);
end $$;

create or replace function public.owner_audit(p_limit int default 100) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  return coalesce((select jsonb_agg(to_jsonb(a) - 'actor' order by a.at desc)
                   from (select * from public.audit_log order by at desc limit least(greatest(p_limit, 1), 500)) a), '[]'::jsonb);
end $$;

-- Bookings for the CSV download. The download itself is logged (without customer details).
create or replace function public.owner_export(p_from date, p_to date) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare r jsonb;
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  select coalesce(jsonb_agg(to_jsonb(b) - 'updated_by' - 'created_by' || jsonb_build_object('washer', (select name from public.staff s where s.id = b.assigned_to))
                            order by b.wash_date, b.created_at), '[]'::jsonb)
    into r from public.bookings b where b.wash_date between p_from and p_to;
  perform public.audit('export', jsonb_array_length(r) || ' bookings, ' || to_char(p_from, 'DD Mon YYYY') || ' to ' || to_char(p_to, 'DD Mon YYYY'));
  return r;
end $$;

-- Numbers screen: everything in one call (replaces 0001's version; same name).
create or replace function public.owner_overview() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare t date := public.ist_today(); m date := date_trunc('month', public.ist_today())::date;
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  return (
    with live as (select * from public.bookings where status <> 'cancelled'),
         mon  as (select * from public.bookings where wash_date >= m and wash_date < (m + interval '1 month')::date)
    select jsonb_build_object(
      'today',          (select count(*) from live where wash_date = t),
      'upcoming',       (select count(*) from live where wash_date > t),
      'done_week',      (select count(*) from live where status = 'done' and wash_date between t - 6 and t),
      'collected_month',(select coalesce(sum(total), 0) from live where payment like 'paid%' and date_trunc('month', coalesce(paid_at at time zone 'Asia/Kolkata', wash_date)) = m),
      'collected_week', (select coalesce(sum(total), 0) from live where payment like 'paid%' and coalesce((paid_at at time zone 'Asia/Kolkata')::date, wash_date) between t - 6 and t),
      'unpaid_amount',  (select coalesce(sum(total), 0) from live where status = 'done' and payment = 'pending'),
      'unpaid_count',   (select count(*) from live where status = 'done' and payment = 'pending'),
      'customers',      (select count(distinct phone) from live),
      'repeat',         (select count(*) from (select phone from live group by phone having count(*) > 1) r),
      'avg_ticket',     (select coalesce(round(avg(total)), 0) from live where status = 'done'),
      'month_done',     (select count(*) from mon where status = 'done'),
      'month_booked',   (select count(*) from mon where status <> 'cancelled'),
      'month_cancelled',(select count(*) from mon where status = 'cancelled'),
      'month_discounts',(select coalesce(sum(discount), 0) from mon where status <> 'cancelled'),
      'month_costs',    (select coalesce(sum(amount), 0) from public.costs where month = m),
      'month_ads',      (select coalesce(sum(amount), 0) from public.costs where month = m and category = 'ads'),
      'month_new_customers', (select count(*) from (select phone, min(wash_date) f from live group by phone) x where x.f >= m),
      'last14',         (select jsonb_agg(jsonb_build_object('date', d::date,
                          'count', (select count(*) from live where wash_date = d::date),
                          'amount', (select coalesce(sum(total), 0) from live where wash_date = d::date and payment like 'paid%')) order by d)
                         from generate_series(t - 13, t, interval '1 day') d),
      'packages',       (select coalesce(jsonb_agg(jsonb_build_object('name', package, 'count', n) order by n desc), '[]'::jsonb)
                         from (select package, count(*) n from live group by package order by n desc limit 5) p),
      'areas',          (select coalesce(jsonb_agg(jsonb_build_object('name', area, 'count', n) order by n desc), '[]'::jsonb)
                         from (select area, count(*) n from live where area <> '' group by area order by n desc limit 5) a),
      'sources',        (select coalesce(jsonb_agg(jsonb_build_object('name', source, 'count', n) order by n desc), '[]'::jsonb)
                         from (select source, count(*) n from mon where status <> 'cancelled' group by source) s),
      'washers',        (select coalesce(jsonb_agg(jsonb_build_object('name', coalesce(st.name, 'Not assigned'), 'count', w.n, 'amount', w.amt) order by w.n desc), '[]'::jsonb)
                         from (select assigned_to, count(*) n, coalesce(sum(total), 0) amt from mon where status = 'done' group by assigned_to) w
                         left join public.staff st on st.id = w.assigned_to),
      'new_leads',      (select count(*) from public.society_leads where status = 'new'),
      'new_enquiries',  (select count(*) from public.enquiries where status = 'new'),
      'pending_reviews',(select count(*) from public.reviews where not approved),
      'inactive_staff', (select count(*) from public.staff where not active)));
end $$;

-- ---------------------------------------------------------------- owner: team
create or replace function public.owner_team() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  return jsonb_build_object(
    'staff', (select jsonb_agg(jsonb_build_object('id', s.id, 'name', s.name, 'email', s.email, 'phone', s.phone, 'role', s.role,
                'active', s.active, 'last_seen_at', s.last_seen_at,
                'jobs', (select count(*) from public.bookings b where b.assigned_to = s.id and b.status in ('new','confirmed','on_way') and b.wash_date >= public.ist_today())
              ) order by s.active desc, s.role, s.created_at) from public.staff s),
    'sheet_copy_key', (select value from public.app_settings where key = 'sheet_copy_key'));
end $$;

create or replace function public.owner_set_staff(p_id uuid, p_active boolean, p_name text default null) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare s public.staff;
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  if p_id = auth.uid() and not p_active then raise exception 'You can''t switch off your own login' using errcode = '22023'; end if;
  select * into s from public.staff where id = p_id;
  if not found then raise exception 'Unknown login' using errcode = '22023'; end if;
  update public.staff set active = p_active, name = coalesce(nullif(public.clip(p_name, 60), ''), name) where id = p_id;
  if s.active is distinct from p_active then perform public.audit(case when p_active then 'login_switched_on' else 'login_switched_off' end, s.name); end if;
  if nullif(public.clip(p_name, 60), '') is not null and public.clip(p_name, 60) <> s.name then perform public.audit('login_edited', s.name || ' → ' || public.clip(p_name, 60)); end if;
  return jsonb_build_object('ok', true);
end $$;

-- Name, phone and role. Used by the staff app directly and by the team-admin function.
create or replace function public.owner_edit_staff(p_id uuid, p_name text, p_phone text, p_role text, p_active boolean default null) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare s public.staff; r text := coalesce(nullif(p_role, ''), 'washer'); ph text := public.digits10(p_phone);
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  select * into s from public.staff where id = p_id;
  if not found then raise exception 'Unknown login' using errcode = '22023'; end if;
  if r not in ('owner', 'washer') then raise exception 'Unknown role' using errcode = '22023'; end if;
  if p_id = auth.uid() and r <> 'owner' then raise exception 'You can''t remove your own owner access' using errcode = '22023'; end if;
  if p_id = auth.uid() and p_active = false then raise exception 'You can''t switch off your own login' using errcode = '22023'; end if;
  if ph <> '' and ph !~ '^[6-9][0-9]{9}$' then raise exception 'Enter a 10-digit mobile number' using errcode = '22023'; end if;
  if public.clip(p_name, 60) = '' then raise exception 'Enter a name' using errcode = '22023'; end if;
  update public.staff set name = public.clip(p_name, 60), phone = ph, role = r, active = coalesce(p_active, active) where id = p_id;
  if s.role <> r then perform public.audit('login_role', public.clip(p_name, 60) || ': ' || s.role || ' → ' || r); end if;
  if s.name <> public.clip(p_name, 60) or s.phone <> ph then perform public.audit('login_edited', public.clip(p_name, 60)); end if;
  if p_active is not null and s.active <> p_active then perform public.audit(case when p_active then 'login_switched_on' else 'login_switched_off' end, s.name); end if;
  return jsonb_build_object('ok', true);
end $$;

-- Called by team-admin before it deletes a login: hands back their open jobs and logs it.
create or replace function public.owner_prepare_delete(p_id uuid) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare s public.staff; n int;
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  if p_id = auth.uid() then raise exception 'You can''t delete your own login' using errcode = '22023'; end if;
  select * into s from public.staff where id = p_id;
  if not found then raise exception 'Unknown login' using errcode = '22023'; end if;
  update public.bookings set assigned_to = null where assigned_to = p_id and status in ('new', 'confirmed', 'on_way');
  get diagnostics n = row_count;
  update public.staff set active = false where id = p_id;
  perform public.audit('login_deleted', s.name || coalesce(' · ' || nullif(n, 0) || ' open job(s) unassigned', ''));
  return jsonb_build_object('ok', true, 'unassigned', n);
end $$;

-- team-admin logs password resets and new logins through this.
create or replace function public.owner_log(p_action text, p_detail text) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  if p_action not in ('login_added', 'login_password', 'login_edited') then raise exception 'unknown action' using errcode = '22023'; end if;
  perform public.audit(p_action, p_detail);
  return jsonb_build_object('ok', true);
end $$;

-- ---------------------------------------------------------------- who may call what
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.check_offer(text, text, text), public.create_booking(jsonb), public.submit_enquiry(jsonb),
                          public.submit_society_lead(jsonb), public.submit_review(jsonb), public.public_reviews(), public.sheet_copy(text)
  to anon, authenticated;
grant execute on function public.is_staff(), public.is_owner(),
                          public.staff_me(), public.staff_settings(), public.staff_day(date), public.staff_update(text, text),
                          public.staff_bookings(text, date, int), public.staff_log(text, text, text), public.booking_history(text),
                          public.staff_add_booking(jsonb), public.staff_edit_booking(text, jsonb), public.staff_month(date),
                          public.owner_overview(), public.owner_due(int), public.owner_inbox(), public.owner_set(text, bigint, text),
                          public.owner_team(), public.owner_set_staff(uuid, boolean, text), public.owner_edit_staff(uuid, text, text, text, boolean),
                          public.owner_prepare_delete(uuid), public.owner_log(text, text),
                          public.owner_assign(text, uuid), public.owner_delete_booking(text), public.owner_customers(text, int), public.owner_customer(text),
                          public.owner_save_templates(jsonb), public.owner_set_notice(text), public.owner_offers(), public.owner_save_offer(jsonb),
                          public.owner_costs(date), public.owner_save_costs(date, jsonb), public.owner_audit(int), public.owner_export(date, date)
  to authenticated;

notify pgrst, 'reload schema';
select 'Done: staff tools are ready' as result;

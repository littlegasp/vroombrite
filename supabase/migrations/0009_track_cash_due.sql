-- 0009 · Track & change page for customers, cash handover, due-for-a-wash fixes.
-- Run once in Supabase → SQL Editor (after 0001–0008). Safe to run again.
--
--  • Every booking gets a private track_key. track.html?b=<id>&k=<key> shows the customer their booking live
--    (Confirmed → On the way → Washing → Done) and lets them move or cancel it until 2 hours before the slot.
--    The website gets the key right after booking (public_track_link: same phone, within 30 minutes);
--    staff send it in the Confirm message ({track_link}).
--  • Cash handover: cash a washer collects (bookings assigned to them, marked Paid in cash from today on)
--    minus what the owner marks received = cash still with the washer.
--  • Due for a wash: leaves out plan and society visits and customers with an active plan;
--    Home's count leaves out anyone reminded in the last 7 days.

-- --------------------------------------------------------------------------- track key
alter table public.bookings add column if not exists track_key text;
alter table public.bookings alter column track_key set default replace(gen_random_uuid()::text, '-', '');
update public.bookings set track_key = replace(gen_random_uuid()::text, '-', '') where track_key is null;

-- When the slot starts (India time). Slots without a known start count from 6 AM.
create or replace function public.slot_starts_at(p_day date, p_slot text) returns timestamptz
language sql stable security definer set search_path = public as $$
  select ((p_day + make_interval(hours => coalesce((select starts from public.slot_caps where slot = p_slot), 6)))::timestamp
          at time zone 'Asia/Kolkata');
$$;

-- What the customer sees. No phone or full address.
create or replace function public.track_view(b public.bookings) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'id', b.id, 'name', split_part(b.name, ' ', 1), 'status', b.status, 'wash_date', b.wash_date, 'slot', b.slot,
    'vehicle', b.vehicle, 'plate', b.plate, 'package', b.package, 'extras', b.extras, 'area', b.area,
    'total', b.total, 'discount', b.discount, 'payment', b.payment, 'pay_mode', b.pay_mode, 'source', b.source,
    'created_at', b.created_at, 'confirmed_at', b.confirmed_at, 'on_way_at', b.on_way_at, 'started_at', b.started_at,
    'done_at', b.done_at, 'cancelled_at', b.cancelled_at,
    'cancelled_by_you', b.status = 'cancelled' and coalesce(b.cancel_reason, '') like 'Customer:%',
    'washer', (select split_part(s.name, ' ', 1) from public.staff s where s.id = b.assigned_to),
    'change_until', public.slot_starts_at(b.wash_date, b.slot) - interval '2 hours',
    'can_change', b.status in ('new', 'confirmed') and b.source not in ('plan', 'society')
                  and now() < public.slot_starts_at(b.wash_date, b.slot) - interval '2 hours',
    'receipt_key', case when b.payment like 'paid%' then b.receipt_key end,
    'reviewed', exists (select 1 from public.reviews r where r.booking_id = b.id));
$$;

-- Website, right after booking: the key for the booking just made (same phone, within 30 minutes).
drop function if exists public.public_track_link(text, text);
create or replace function public.public_track_link(p_id text, p_phone text) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('key', track_key) from public.bookings
   where id = p_id and phone = public.digits10(p_phone) and source = 'website' and created_at > now() - interval '30 minutes';
$$;

create or replace function public.public_track(p_id text, p_key text) returns jsonb
language sql stable security definer set search_path = public as $$
  select public.track_view(b) from public.bookings b where b.id = p_id and b.track_key is not null and b.track_key = p_key;
$$;

-- Move (p_action 'move', p_date, p_slot) or cancel (p_action 'cancel', p_reason) a booking from the track page.
create or replace function public.public_change(p_id text, p_key text, p_action text, p_date date default null,
                                                p_slot text default null, p_reason text default '') returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare b public.bookings; st text; r text := public.clip(p_reason, 60);
begin
  select * into b from public.bookings where id = p_id and track_key is not null and track_key = p_key for update;
  if not found then raise exception 'booking not found' using errcode = '22023'; end if;
  if b.source in ('plan', 'society') then
    raise exception 'not online' using errcode = 'P0001', hint = 'Plan visits are changed by our team. Please call or WhatsApp us.'; end if;
  if b.status not in ('new', 'confirmed') then
    raise exception 'too late' using errcode = 'P0001', hint = 'This booking can''t be changed online any more. Please call or WhatsApp us.'; end if;
  if now() >= public.slot_starts_at(b.wash_date, b.slot) - interval '2 hours' then
    raise exception 'too late' using errcode = 'P0001', hint = 'It''s less than 2 hours to your slot, so please call or WhatsApp us to change it.'; end if;

  if p_action = 'cancel' then
    update public.bookings set status = 'cancelled', cancelled_at = now(), cancel_reason = 'Customer: ' || coalesce(nullif(r, ''), 'no reason given'),
           updated_at = now() where id = p_id;
    update public.referral_credits set status = 'used', used_on_booking = null where friend_booking_id = p_id and status = 'pending';
    insert into public.booking_events (booking_id, actor_name, kind, detail)
    values (p_id, 'Customer', 'status', 'Cancelled by the customer online' || case when r <> '' then ' · ' || r else '' end);
  elsif p_action = 'move' then
    if p_date is null or p_date < public.ist_today() or p_date > public.ist_today() + 60 then
      raise exception 'bad date' using errcode = 'P0001', hint = 'Pick a day in the next 60 days.'; end if;
    if not exists (select 1 from public.slot_caps where slot = p_slot) then
      raise exception 'bad slot' using errcode = 'P0001', hint = 'Pick one of our time slots.'; end if;
    if p_date = b.wash_date and p_slot = b.slot then return public.track_view(b); end if;
    perform pg_advisory_xact_lock(hashtext('slot:' || p_date || ':' || p_slot));
    st := public.slot_state(p_date, p_slot);
    if st <> 'open' then
      raise exception 'slot %', st using errcode = 'P0001',
        hint = case st when 'full' then 'That time is fully booked. Please pick another time.'
                       when 'past' then 'That time has already started. Please pick a later one.'
                       else 'We are not washing at that time. Please pick another day or time.' end; end if;
    if public.slot_starts_at(p_date, p_slot) < now() + interval '2 hours' then
      raise exception 'too soon' using errcode = 'P0001', hint = 'Please pick a time at least 2 hours from now.'; end if;
    update public.bookings set wash_date = p_date, slot = p_slot, reminder_sent_at = null, updated_at = now() where id = p_id;
    insert into public.booking_events (booking_id, actor_name, kind, detail)
    values (p_id, 'Customer', 'edited', 'Moved online by the customer from ' || to_char(b.wash_date, 'DD Mon') || ', ' || b.slot
            || ' to ' || to_char(p_date, 'DD Mon') || ', ' || p_slot);
  else
    raise exception 'unknown action' using errcode = '22023';
  end if;
  select * into b from public.bookings where id = p_id;
  return public.track_view(b);
end $$;

-- --------------------------------------------------------------------------- cash handover
create table if not exists public.cash_handovers (
  id          bigserial primary key,
  staff_id    uuid not null references public.staff (id) on delete cascade,
  amount      int  not null check (amount between 1 and 1000000),
  expected    int  not null default 0,
  note        text not null default '' check (length(note) <= 200),
  received_by uuid references public.staff (id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists cash_handovers_staff_idx on public.cash_handovers (staff_id, created_at desc);
alter table public.cash_handovers enable row level security;
revoke all on public.cash_handovers from anon, authenticated;
revoke all on sequence public.cash_handovers_id_seq from anon, authenticated;
-- Cash counts from the day this was set up, so older jobs don't show as owed.
insert into public.app_settings values ('cash_from', public.ist_today()::text) on conflict (key) do nothing;

-- One washer's cash: collected (Paid in cash, assigned to them, since cash_from) minus received.
create or replace function public.cash_of(p_staff uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  with f as (select coalesce((select value from public.app_settings where key = 'cash_from'), '2000-01-01')::date d),
       c as (select b.id, b.name, b.total, b.paid_at from public.bookings b, f
              where b.assigned_to = p_staff and b.payment = 'paid_cash' and b.paid_at is not null
                and (b.paid_at at time zone 'Asia/Kolkata')::date >= f.d),
       h as (select * from public.cash_handovers where staff_id = p_staff)
  select jsonb_build_object(
    'id', p_staff, 'name', (select name from public.staff where id = p_staff),
    'collected', (select coalesce(sum(total), 0) from c),
    'received',  (select coalesce(sum(amount), 0) from h),
    'balance',   (select coalesce(sum(total), 0) from c) - (select coalesce(sum(amount), 0) from h),
    'today',     (select coalesce(sum(total), 0) from c where (paid_at at time zone 'Asia/Kolkata')::date = public.ist_today()),
    'today_jobs', (select coalesce(jsonb_agg(jsonb_build_object('id', id, 'name', name, 'total', total, 'paid_at', paid_at) order by paid_at), '[]'::jsonb)
                   from c where (paid_at at time zone 'Asia/Kolkata')::date = public.ist_today()),
    'handovers', (select coalesce(jsonb_agg(jsonb_build_object('id', x.id, 'amount', x.amount, 'expected', x.expected, 'note', x.note,
                    'by', (select name from public.staff where id = x.received_by), 'at', x.created_at) order by x.created_at desc), '[]'::jsonb)
                  from (select * from h order by created_at desc limit 10) x));
$$;

create or replace function public.staff_cash() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_staff() then raise exception 'not allowed' using errcode = '42501'; end if;
  return public.cash_of(auth.uid());
end $$;

create or replace function public.owner_cash() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  return coalesce((select jsonb_agg(public.cash_of(s.id) order by s.name) from public.staff s where s.role = 'washer'
                   and (s.active or exists (select 1 from public.bookings b where b.assigned_to = s.id and b.payment = 'paid_cash'))), '[]'::jsonb);
end $$;

-- Owner: cash received from a washer. expected = what the app said they had, so a short handover shows up.
create or replace function public.owner_cash_received(p_staff uuid, p_amount int, p_note text default '') returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare bal int;
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  if coalesce(p_amount, 0) < 1 then raise exception 'Enter the amount you received' using errcode = '22023'; end if;
  if not exists (select 1 from public.staff where id = p_staff) then raise exception 'not found' using errcode = '22023'; end if;
  bal := (public.cash_of(p_staff) ->> 'balance')::int;
  insert into public.cash_handovers (staff_id, amount, expected, note, received_by) values (p_staff, p_amount, greatest(bal, 0), public.clip(p_note, 200), auth.uid());
  return public.owner_cash();
end $$;

create or replace function public.owner_cash_undo(p_id bigint) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  delete from public.cash_handovers where id = p_id and created_at > now() - interval '2 days';
  if not found then raise exception 'Only handovers from the last 2 days can be undone' using errcode = '22023'; end if;
  return public.owner_cash();
end $$;

-- --------------------------------------------------------------------------- due for a wash
create or replace function public.owner_due(p_days int default 12) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare t date := public.ist_today();
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  return coalesce((select jsonb_agg(x order by (x.reminder_sent_at > now() - interval '7 days') nulls first, x.days_ago desc) from (
    select distinct on (b.phone) b.id, b.name, b.phone, b.vehicle, b.package, b.area, b.wash_date as last_date,
           (t - b.wash_date) as days_ago,
           (select max(z.reminder_sent_at) from public.bookings z where z.phone = b.phone) as reminder_sent_at,
           (select count(*) from public.bookings z where z.phone = b.phone and z.status = 'done') as washes
    from public.bookings b
    where b.status = 'done' and b.source not in ('plan', 'society')
      and not exists (select 1 from public.bookings u where u.phone = b.phone and u.status in ('new','confirmed','on_way') and u.wash_date >= t)
      and not exists (select 1 from public.contracts k where k.phone = b.phone and k.status = 'active')
    order by b.phone, b.wash_date desc) x
    where x.days_ago >= p_days), '[]'::jsonb);
end $$;

-- Home: same as before, plus the due count fix, customer changes and cash with washers.
create or replace function public.owner_attention() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare t date := public.ist_today();
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  return jsonb_build_object(
    'unconfirmed', coalesce((select jsonb_agg(public.booking_json(b) order by b.wash_date, b.created_at) from (
                     select * from public.bookings where status = 'new' and wash_date >= t order by wash_date limit 20) b), '[]'::jsonb),
    'unpaid',      coalesce((select jsonb_agg(public.booking_json(b) order by b.wash_date desc) from (
                     select * from public.bookings where status = 'done' and payment = 'pending' order by wash_date desc limit 20) b), '[]'::jsonb),
    'unassigned',  (select count(*) from public.bookings where assigned_to is null and status in ('new','confirmed') and wash_date between t and t + 2),
    'recent',      coalesce((select jsonb_agg(public.booking_json(b) order by b.created_at desc) from (
                     select * from public.bookings order by created_at desc limit 8) b), '[]'::jsonb),
    'due',         (select count(*) from jsonb_array_elements(public.owner_due(12)) d
                     where d ->> 'reminder_sent_at' is null or (d ->> 'reminder_sent_at')::timestamptz < now() - interval '7 days'),
    'changes',     coalesce((select jsonb_agg(jsonb_build_object('id', e.booking_id, 'at', e.at, 'detail', e.detail, 'name', b.name) order by e.at desc)
                     from (select * from public.booking_events where actor_name = 'Customer' and actor is null and at > now() - interval '3 days'
                           order by at desc limit 10) e join public.bookings b on b.id = e.booking_id), '[]'::jsonb),
    'cash',        coalesce((select jsonb_agg(c) from jsonb_array_elements(public.owner_cash()) c where (c ->> 'balance')::int > 0), '[]'::jsonb));
end $$;

-- --------------------------------------------------------------------------- messages
insert into public.message_templates (key, title, body, position) values
  ('moved_by_customer', 'Customer moved it', 'Hi {first_name}, got it, your {package} is now on {date}, {slot}. See or change it here: {track_link}', 12)
on conflict (key) do nothing;
-- The Confirm message now carries the link (added once, to your wording).
update public.message_templates set body = body || E'\nSee, move or cancel it here: {track_link}'
 where key = 'confirm' and body not like '%{track_link}%';

-- --------------------------------------------------------------------------- access
revoke execute on function public.slot_starts_at(date, text), public.track_view(public.bookings), public.cash_of(uuid) from public, anon, authenticated;
revoke execute on function public.public_track_link(text, text), public.public_track(text, text),
                           public.public_change(text, text, text, date, text, text) from public;
grant execute on function public.public_track_link(text, text), public.public_track(text, text),
                          public.public_change(text, text, text, date, text, text) to anon, authenticated;
revoke execute on function public.staff_cash(), public.owner_cash(), public.owner_cash_received(uuid, int, text), public.owner_cash_undo(bigint),
                           public.owner_due(int), public.owner_attention() from public, anon;
grant execute on function public.staff_cash(), public.owner_cash(), public.owner_cash_received(uuid, int, text), public.owner_cash_undo(bigint),
                          public.owner_due(int), public.owner_attention() to authenticated;

notify pgrst, 'reload schema';
select 'Done: track & change links, cash handover and the due-for-a-wash fix are ready' as result;

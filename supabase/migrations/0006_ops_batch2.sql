-- =============================================================================
-- Vroombrite 0006 — wash timer, job checklist, saved customer notes, moving a day.
-- Run once in Supabase → SQL Editor after 0001–0005. Safe to run again.
-- =============================================================================

alter table public.bookings add column if not exists started_at timestamptz;          -- "Start wash" tapped
alter table public.bookings add column if not exists checks jsonb not null default '[]'::jsonb;  -- ticked checklist items (their text)

-- Notes kept for a customer (by mobile) and shown on every booking of theirs: gate code, parking, "call before".
create table if not exists public.customer_notes (
  phone      text primary key,
  note       text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid references public.staff (id) on delete set null
);
alter table public.customer_notes enable row level security;
revoke all on public.customer_notes from anon, authenticated;

-- When a customer's last booking is deleted, their saved note goes too.
create or replace function public.customer_note_cleanup() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.bookings where phone = old.phone) then delete from public.customer_notes where phone = old.phone; end if;
  return null;
end $$;
drop trigger if exists customer_note_cleanup on public.bookings;
create trigger customer_note_cleanup after delete on public.bookings for each row execute function public.customer_note_cleanup();

-- Every booking the app gets now carries the customer's saved note.
create or replace function public.booking_json(b public.bookings) returns jsonb
language sql stable security definer set search_path = public as $$
  select to_jsonb(b) - 'updated_by' || jsonb_build_object(
    'credit', coalesce((select sum(amount) from public.referral_credits
                        where referrer_phone = b.phone and status = 'available'), 0),
    'visits', (select count(*) from public.bookings x where x.phone = b.phone and x.status = 'done' and x.id <> b.id),
    'assigned_name', (select name from public.staff s where s.id = b.assigned_to),
    'cust_note', coalesce((select note from public.customer_notes c where c.phone = b.phone), ''));
$$;

-- WhatsApp wording for a moved booking (owner can change it in Settings).
insert into public.message_templates (key, title, body, position) values
  ('moved', 'Moved (rain day)', 'Hi {first_name}, this is {brand}. Because of the weather we''ve moved your {package} to {date}, {slot}. If that doesn''t suit you, reply here with a better day and time. Sorry for the change!', 8)
on conflict (key) do nothing;

-- Start (or undo the start of) the wash timer.
create or replace function public.staff_timer(p_id text, p_what text) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare b public.bookings;
begin
  if not public.is_staff() then raise exception 'not allowed' using errcode = '42501'; end if;
  select * into b from public.bookings where id = p_id for update;
  if not found then raise exception 'booking not found' using errcode = '22023'; end if;
  if p_what = 'start' then
    if b.started_at is null then
      update public.bookings set started_at = now(), updated_at = now(), updated_by = auth.uid() where id = p_id;
      perform public.ev(p_id, 'status', 'Started the wash');
    end if;
  elsif p_what = 'reset' then
    if b.status = 'done' then raise exception 'The wash is already marked done' using errcode = '22023'; end if;
    update public.bookings set started_at = null, updated_at = now(), updated_by = auth.uid() where id = p_id;
    perform public.ev(p_id, 'status', 'Undid "Started the wash"');
  else raise exception 'unknown action' using errcode = '22023'; end if;
  select * into b from public.bookings where id = p_id;
  return public.booking_json(b);
end $$;

-- Tick or untick one checklist item.
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
    if jsonb_array_length(cur) >= 40 then raise exception 'Too many ticks' using errcode = '22023'; end if;
    cur := cur || to_jsonb(it);
  end if;
  update public.bookings set checks = cur, updated_at = now(), updated_by = auth.uid() where id = p_id;
  select * into b from public.bookings where id = p_id;
  return public.booking_json(b);
end $$;

create or replace function public.staff_save_customer_note(p_phone text, p_note text) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare n text := public.clip(p_note, 300);
begin
  if not public.is_staff() then raise exception 'not allowed' using errcode = '42501'; end if;
  if not exists (select 1 from public.bookings where phone = p_phone) then raise exception 'No bookings for that mobile' using errcode = '22023'; end if;
  if n = '' then delete from public.customer_notes where phone = p_phone;
  else insert into public.customer_notes (phone, note, updated_at, updated_by) values (p_phone, n, now(), auth.uid())
       on conflict (phone) do update set note = excluded.note, updated_at = now(), updated_by = auth.uid(); end if;
  return jsonb_build_object('ok', true, 'note', n);
end $$;

-- Rain day: move several bookings to another day (and optionally another time) in one go.
create or replace function public.owner_move_day(p_ids text[], p_date date, p_slot text, p_reason text) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare b public.bookings; s text := nullif(p_slot, ''); why text := public.clip(p_reason, 60); out jsonb := '[]'::jsonb;
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  if p_date is null or p_date < public.ist_today() then raise exception 'Pick today or a later date' using errcode = '22023'; end if;
  if s is not null and not exists (select 1 from public.slot_caps where slot = s) then raise exception 'Unknown time slot' using errcode = '22023'; end if;
  if coalesce(array_length(p_ids, 1), 0) = 0 or array_length(p_ids, 1) > 60 then raise exception 'Pick 1 to 60 bookings' using errcode = '22023'; end if;
  for b in select * from public.bookings where id = any (p_ids) and status not in ('done', 'cancelled') order by wash_date, slot for update loop
    update public.bookings set wash_date = p_date, slot = coalesce(s, b.slot), started_at = null, reminder_sent_at = null,
           updated_at = now(), updated_by = auth.uid() where id = b.id;
    perform public.ev(b.id, 'edited', 'Moved from ' || to_char(b.wash_date, 'DD Mon') || ', ' || b.slot || ' to ' || to_char(p_date, 'DD Mon') || ', ' || coalesce(s, b.slot)
                                     || case when why <> '' then ' · ' || why else '' end);
    out := out || public.booking_json((select x from public.bookings x where x.id = b.id));
  end loop;
  return out;
end $$;

-- How long washes take (Start wash → Washed), for Analytics. Ignores timers under 3 min or over 8 h.
create or replace function public.owner_durations(p_from date, p_to date) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  if p_to < p_from or p_to - p_from > 400 then raise exception 'Pick a shorter range' using errcode = '22023'; end if;
  return (with t as (
      select b.package, coalesce(s.name, 'Not assigned') washer, extract(epoch from (b.done_at - b.started_at)) / 60 m
        from public.bookings b left join public.staff s on s.id = b.assigned_to
       where b.wash_date between p_from and p_to and b.status = 'done' and b.started_at is not null and b.done_at is not null
         and b.done_at - b.started_at between interval '3 minutes' and interval '8 hours')
    select jsonb_build_object(
      'n', (select count(*) from t), 'avg', (select round(avg(m)) from t),
      'packages', (select coalesce(jsonb_agg(jsonb_build_object('name', package, 'n', n, 'avg', a) order by n desc), '[]'::jsonb)
                   from (select package, count(*) n, round(avg(m)) a from t group by package) x),
      'washers',  (select coalesce(jsonb_agg(jsonb_build_object('name', washer, 'n', n, 'avg', a) order by n desc), '[]'::jsonb)
                   from (select washer, count(*) n, round(avg(m)) a from t group by washer) x)));
end $$;

-- ---------------------------------------------------------------- who may call what
revoke execute on function public.customer_note_cleanup() from public, anon, authenticated;
revoke execute on function public.staff_timer(text, text), public.staff_check(text, text, boolean), public.staff_save_customer_note(text, text),
                           public.owner_move_day(text[], date, text, text), public.owner_durations(date, date)
  from public, anon;
grant execute on function public.staff_timer(text, text), public.staff_check(text, text, boolean), public.staff_save_customer_note(text, text),
                          public.owner_move_day(text[], date, text, text), public.owner_durations(date, date)
  to authenticated;

notify pgrst, 'reload schema';
select 'Done: wash timer, checklist, customer notes and moving a day are ready' as result;

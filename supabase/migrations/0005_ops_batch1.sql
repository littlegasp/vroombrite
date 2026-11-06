-- =============================================================================
-- Vroombrite 0005 — slot limits and days off, before/after job photos.
-- Run once in Supabase → SQL Editor after 0001–0004. Safe to run again.
-- =============================================================================

-- New kinds of history and activity entries.
alter table public.booking_events drop constraint if exists booking_events_kind_check;
alter table public.booking_events add constraint booking_events_kind_check
  check (kind in ('created','status','payment','edited','assigned','note','call','message','credit','photo'));
alter table public.audit_log drop constraint if exists audit_log_action_check;
alter table public.audit_log add constraint audit_log_action_check
  check (action in ('export', 'booking_deleted', 'login_added', 'login_switched_on', 'login_switched_off',
                    'login_role', 'login_password', 'login_edited', 'login_deleted', 'messages_saved', 'notice_posted', 'notice_cleared',
                    'offers_saved', 'costs_saved', 'slots_saved', 'day_closed', 'day_reopened'));

-- ---------------------------------------------------------------- slot limits
-- How many website bookings each time slot takes per day. Empty cap = no limit.
create table if not exists public.slot_caps (
  slot     text primary key,
  position int  not null default 0,
  starts   int  not null default 0 check (starts between 0 and 23),   -- hour the slot starts (IST)
  cap      int  check (cap between 0 and 50)
);
insert into public.slot_caps (slot, position, starts, cap) values
  ('6–8 AM', 1, 6, 3), ('8–10 AM', 2, 8, 3), ('10 AM–1 PM', 3, 10, 4), ('2–5 PM', 4, 14, 4), ('5–8 PM', 5, 17, 3)
on conflict (slot) do nothing;

-- Days (or single slots) the team is not working.
create table if not exists public.closures (
  id         bigserial primary key,
  day        date not null,
  slot       text references public.slot_caps (slot) on delete cascade,  -- null = the whole day
  reason     text not null default '',
  created_at timestamptz not null default now(),
  created_by uuid references public.staff (id) on delete set null
);
create unique index if not exists closures_day_slot on public.closures (day, coalesce(slot, ''));

-- Weekly days off, ISO weekday numbers (1 = Monday … 7 = Sunday), e.g. '7'. Empty = open every day.
insert into public.app_settings values ('closed_weekdays', '') on conflict (key) do nothing;

alter table public.slot_caps enable row level security;
alter table public.closures  enable row level security;
revoke all on public.slot_caps, public.closures from anon, authenticated;
revoke all on sequence public.closures_id_seq from anon, authenticated;

-- open | full | closed | past for one date and slot. Internal helper.
create or replace function public.slot_state(p_day date, p_slot text) returns text
language plpgsql stable security definer set search_path = public as $$
declare c public.slot_caps; n int; wd text := coalesce((select value from public.app_settings where key = 'closed_weekdays'), '');
begin
  select * into c from public.slot_caps where slot = p_slot;
  if exists (select 1 from public.closures where day = p_day and (slot is null or slot = p_slot))
     or (wd <> '' and extract(isodow from p_day)::text = any (string_to_array(wd, ','))) then return 'closed'; end if;
  if c.slot is not null and p_day = public.ist_today()
     and c.starts <= extract(hour from now() at time zone 'Asia/Kolkata')::int then return 'past'; end if;
  if c.slot is null or c.cap is null then return 'open'; end if;
  select count(*) into n from public.bookings where wash_date = p_day and slot = p_slot and status <> 'cancelled';
  return case when n >= c.cap then 'full' else 'open' end;
end $$;

-- Website: which slots can still be booked. Shows only open/full/closed/past, never counts or reasons.
create or replace function public.slot_availability(p_from date, p_days int default 14) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare d0 date := greatest(coalesce(p_from, public.ist_today()), public.ist_today()); n int := least(greatest(coalesce(p_days, 14), 1), 62);
begin
  return (select coalesce(jsonb_agg(jsonb_build_object('date', d::date,
            'slots', (select jsonb_object_agg(s.slot, public.slot_state(d::date, s.slot)) from public.slot_caps s)) order by d), '[]'::jsonb)
          from generate_series(d0, d0 + n - 1, interval '1 day') d);
end $$;

-- Website bookings may not go into a full or closed slot. Staff bookings are never blocked
-- (the staff app warns instead). A lock per date+slot stops two last-seat bookings at once.
create or replace function public.booking_slot_guard() returns trigger
language plpgsql security definer set search_path = public as $$
declare st text;
begin
  if new.source is distinct from 'website' then return new; end if;
  perform pg_advisory_xact_lock(hashtext('slot:' || new.wash_date || ':' || new.slot));
  st := public.slot_state(new.wash_date, new.slot);
  if st = 'full' then raise exception 'slot full' using errcode = 'P0001', hint = 'That time is fully booked. Please pick another time.'; end if;
  if st = 'closed' then raise exception 'slot closed' using errcode = 'P0001', hint = 'We are not washing at that time. Please pick another day or time.'; end if;
  return new;
end $$;
drop trigger if exists booking_slot_guard on public.bookings;
create trigger booking_slot_guard before insert on public.bookings for each row execute function public.booking_slot_guard();

-- Staff app: caps, weekly days off, closures and how many bookings each slot has.
create or replace function public.staff_slots(p_from date, p_to date) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_staff() then raise exception 'not allowed' using errcode = '42501'; end if;
  if p_to < p_from or p_to - p_from > 120 then raise exception 'Pick a shorter range' using errcode = '22023'; end if;
  return jsonb_build_object(
    'caps', (select coalesce(jsonb_agg(jsonb_build_object('slot', slot, 'cap', cap, 'starts', starts) order by position), '[]'::jsonb) from public.slot_caps),
    'closed_weekdays', (select coalesce(value, '') from public.app_settings where key = 'closed_weekdays'),
    'closures', (select coalesce(jsonb_agg(jsonb_build_object('id', c.id, 'day', c.day, 'slot', c.slot, 'reason', c.reason, 'by', s.name) order by c.day, c.slot nulls first), '[]'::jsonb)
                 from public.closures c left join public.staff s on s.id = c.created_by where c.day between p_from and p_to),
    'counts', (select coalesce(jsonb_agg(jsonb_build_object('date', wash_date, 'slot', slot, 'n', n)), '[]'::jsonb)
               from (select wash_date, slot, count(*) n from public.bookings where wash_date between p_from and p_to and status <> 'cancelled' group by wash_date, slot) x));
end $$;

create or replace function public.owner_save_slots(p jsonb) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare r jsonb; wd text;
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  for r in select * from jsonb_array_elements(coalesce(p -> 'caps', '[]'::jsonb)) loop
    update public.slot_caps set cap = case when nullif(r ->> 'cap', '') is null then null else least(greatest((r ->> 'cap')::int, 0), 50) end
     where slot = r ->> 'slot';
  end loop;
  if p ? 'closed_weekdays' then
    select coalesce(string_agg(distinct x, ',' order by x), '') into wd
      from jsonb_array_elements_text(p -> 'closed_weekdays') x where x ~ '^[1-7]$';
    update public.app_settings set value = wd where key = 'closed_weekdays';
  end if;
  perform public.audit('slots_saved', '');
  return public.staff_slots(public.ist_today(), public.ist_today() + 90);
end $$;

create or replace function public.owner_close_day(p_day date, p_slot text, p_reason text) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare s text := nullif(p_slot, '');
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  if p_day is null or p_day < public.ist_today() then raise exception 'Pick today or a later date' using errcode = '22023'; end if;
  if s is not null and not exists (select 1 from public.slot_caps where slot = s) then raise exception 'Unknown time slot' using errcode = '22023'; end if;
  insert into public.closures (day, slot, reason, created_by) values (p_day, s, public.clip(p_reason, 120), auth.uid())
  on conflict (day, coalesce(slot, '')) do update set reason = excluded.reason;
  perform public.audit('day_closed', to_char(p_day, 'DD Mon YYYY') || coalesce(' · ' || s, ' · whole day'));
  return jsonb_build_object('ok', true,
    'bookings', (select count(*) from public.bookings where wash_date = p_day and (s is null or slot = s) and status not in ('cancelled', 'done')));
end $$;

create or replace function public.owner_reopen_day(p_id bigint) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare c public.closures;
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  delete from public.closures where id = p_id returning * into c;
  if found then perform public.audit('day_reopened', to_char(c.day, 'DD Mon YYYY') || coalesce(' · ' || c.slot, ' · whole day')); end if;
  return jsonb_build_object('ok', true);
end $$;

-- ---------------------------------------------------------------- job photos
-- Files live in the private Storage bucket "job-photos" as <booking id>/<before|after>-<stamp>.jpg.
-- Rows go when the booking is deleted; the staff app deletes the files.
create table if not exists public.job_photos (
  id         bigserial primary key,
  booking_id text not null references public.bookings (id) on delete cascade,
  path       text not null unique,
  kind       text not null check (kind in ('before', 'after')),
  created_at timestamptz not null default now(),
  added_by   uuid references public.staff (id) on delete set null
);
create index if not exists job_photos_booking_idx on public.job_photos (booking_id);
alter table public.job_photos enable row level security;
revoke all on public.job_photos from anon, authenticated;
revoke all on sequence public.job_photos_id_seq from anon, authenticated;

do $$ begin
  if exists (select 1 from pg_namespace where nspname = 'storage') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('job-photos', 'job-photos', false, 3145728, array['image/jpeg'])
    on conflict (id) do update set public = false, file_size_limit = 3145728, allowed_mime_types = array['image/jpeg'];
    drop policy if exists "vb staff add job photos"    on storage.objects;
    drop policy if exists "vb staff view job photos"   on storage.objects;
    drop policy if exists "vb remove job photos"       on storage.objects;
    create policy "vb staff add job photos" on storage.objects for insert to authenticated
      with check (bucket_id = 'job-photos' and public.is_staff());
    create policy "vb staff view job photos" on storage.objects for select to authenticated
      using (bucket_id = 'job-photos' and public.is_staff());
    create policy "vb remove job photos" on storage.objects for delete to authenticated
      using (bucket_id = 'job-photos' and (public.is_owner()
             or exists (select 1 from public.job_photos p where p.path = name and p.added_by = auth.uid())
             or not exists (select 1 from public.job_photos p where p.path = name) and public.is_staff()));
  end if;
end $$;

create or replace function public.staff_photos(p_id text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_staff() then raise exception 'not allowed' using errcode = '42501'; end if;
  return (select coalesce(jsonb_agg(jsonb_build_object('id', p.id, 'path', p.path, 'kind', p.kind, 'at', p.created_at,
                    'who', s.name, 'mine', p.added_by = auth.uid()) order by p.kind desc, p.created_at), '[]'::jsonb)
          from public.job_photos p left join public.staff s on s.id = p.added_by where p.booking_id = p_id);
end $$;

create or replace function public.staff_add_photo(p_id text, p_path text, p_kind text) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
begin
  if not public.is_staff() then raise exception 'not allowed' using errcode = '42501'; end if;
  if not exists (select 1 from public.bookings where id = p_id) then raise exception 'booking not found' using errcode = '22023'; end if;
  if p_kind not in ('before', 'after') or p_path !~ ('^' || p_id || '/(before|after)-[0-9a-z-]{4,40}\.jpg$') then
    raise exception 'bad photo name' using errcode = '22023'; end if;
  if (select count(*) from public.job_photos where booking_id = p_id) >= 12 then
    raise exception 'This booking already has 12 photos. Delete one first.' using errcode = '22023'; end if;
  insert into public.job_photos (booking_id, path, kind, added_by) values (p_id, p_path, p_kind, auth.uid()) on conflict (path) do nothing;
  perform public.ev(p_id, 'photo', 'Added a photo (' || p_kind || ')');
  return public.staff_photos(p_id);
end $$;

create or replace function public.staff_delete_photo(p_photo bigint) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare p public.job_photos;
begin
  if not public.is_staff() then raise exception 'not allowed' using errcode = '42501'; end if;
  select * into p from public.job_photos where id = p_photo;
  if not found then return jsonb_build_object('ok', true); end if;
  if not public.is_owner() and p.added_by is distinct from auth.uid() then raise exception 'Only the owner can delete photos someone else added' using errcode = '42501'; end if;
  delete from public.job_photos where id = p_photo;
  perform public.ev(p.booking_id, 'photo', 'Deleted a photo (' || p.kind || ')');
  return public.staff_photos(p.booking_id);
end $$;

-- Deleting a booking now also returns its photo files so the app can remove them from Storage.
create or replace function public.owner_delete_booking(p_id text) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare b public.bookings; files jsonb;
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  select coalesce(jsonb_agg(path), '[]'::jsonb) into files from public.job_photos where booking_id = p_id;
  delete from public.bookings where id = p_id returning * into b;
  if not found then raise exception 'booking not found' using errcode = '22023'; end if;
  perform public.audit('booking_deleted', b.id || ' · ' || b.status || ' · ' || to_char(b.wash_date, 'DD Mon YYYY') || ' · ₹' || b.total);
  return jsonb_build_object('ok', true, 'photos', files);
end $$;

-- ---------------------------------------------------------------- who may call what
revoke execute on function public.slot_state(date, text), public.booking_slot_guard() from public, anon, authenticated;
revoke execute on function public.slot_availability(date, int), public.staff_slots(date, date), public.owner_save_slots(jsonb),
                           public.owner_close_day(date, text, text), public.owner_reopen_day(bigint),
                           public.staff_photos(text), public.staff_add_photo(text, text, text), public.staff_delete_photo(bigint)
  from public, anon;
grant execute on function public.slot_availability(date, int) to anon, authenticated;
grant execute on function public.staff_slots(date, date), public.owner_save_slots(jsonb), public.owner_close_day(date, text, text),
                          public.owner_reopen_day(bigint), public.staff_photos(text), public.staff_add_photo(text, text, text),
                          public.staff_delete_photo(bigint)
  to authenticated;

notify pgrst, 'reload schema';
select 'Done: slot limits, days off and job photos are ready' as result;

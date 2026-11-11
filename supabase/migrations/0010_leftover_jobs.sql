-- 0010 · Jobs left over from earlier days.
-- A booking from an earlier day that is still Booked, Confirmed or On the way (never marked washed or cancelled)
-- now shows on today's Jobs ("Left over from earlier days") and on Home ("Not finished"), until someone
-- marks it washed, moves it or cancels it. Looks back 60 days.
-- Run once in Supabase → SQL Editor (after 0009). Safe to run again.

create or replace function public.leftover_jobs() returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(public.booking_json(b) order by b.wash_date,
           array_position(array['6–8 AM','8–10 AM','10 AM–1 PM','2–5 PM','5–8 PM'], b.slot), b.created_at), '[]'::jsonb)
  from public.bookings b
  where b.status in ('new', 'confirmed', 'on_way') and b.wash_date < public.ist_today() and b.wash_date >= public.ist_today() - 60;
$$;
revoke execute on function public.leftover_jobs() from public, anon, authenticated;

-- Jobs: same as before, plus 'leftover' when the day asked for is today.
create or replace function public.staff_day(p_date date) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_staff() then raise exception 'not allowed' using errcode = '42501'; end if;
  return jsonb_build_object(
    'date', p_date,
    'jobs', coalesce((select jsonb_agg(public.booking_json(b) order by
               array_position(array['6–8 AM','8–10 AM','10 AM–1 PM','2–5 PM','5–8 PM'], b.slot), b.created_at)
             from public.bookings b where b.wash_date = p_date), '[]'::jsonb),
    'leftover', case when p_date = public.ist_today() then public.leftover_jobs() else '[]'::jsonb end,
    'strip', (select jsonb_agg(jsonb_build_object('date', d::date,
               'count', (select count(*) from public.bookings b where b.wash_date = d::date and b.status <> 'cancelled'),
               'open',  (select count(*) from public.bookings b where b.wash_date = d::date and b.status in ('new','confirmed','on_way')))
             order by d)
             from generate_series(p_date - 3, p_date + 10, interval '1 day') d));
end $$;

-- Home: same as 0009, plus 'overdue'.
create or replace function public.owner_attention() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare t date := public.ist_today();
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  return jsonb_build_object(
    'overdue',     public.leftover_jobs(),
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

revoke execute on function public.staff_day(date), public.owner_attention() from public, anon;
grant execute on function public.staff_day(date), public.owner_attention() to authenticated;

notify pgrst, 'reload schema';
select 'Done: jobs left over from earlier days now show on Jobs and Home' as result;

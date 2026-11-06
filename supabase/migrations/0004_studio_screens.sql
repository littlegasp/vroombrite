-- =============================================================================
-- 0004 — Data for the Studio-style screens (Nov 2026). Run after 0003. Safe to run again.
--   * staff_range: bookings between two dates, every status (Bookings board and table)
--   * owner_attention: what needs doing now (Home)
--   * owner_analytics: numbers for any date range, compared with the range before it
-- =============================================================================

create or replace function public.staff_range(p_from date, p_to date) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_staff() then raise exception 'not allowed' using errcode = '42501'; end if;
  if p_to < p_from or p_to - p_from > 400 then raise exception 'Pick a shorter range' using errcode = '22023'; end if;
  return coalesce((select jsonb_agg(public.booking_json(b) order by b.wash_date,
            array_position(array['6–8 AM','8–10 AM','10 AM–1 PM','2–5 PM','5–8 PM'], b.slot), b.created_at)
          from (select * from public.bookings where wash_date between p_from and p_to order by wash_date limit 600) b), '[]'::jsonb);
end $$;

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
    'due',         (select count(*) from (
                     select distinct on (b.phone) b.phone, b.wash_date from public.bookings b where b.status = 'done'
                       and not exists (select 1 from public.bookings u where u.phone = b.phone and u.status in ('new','confirmed','on_way') and u.wash_date >= t)
                     order by b.phone, b.wash_date desc) x where t - x.wash_date >= 12));
end $$;

-- One period's numbers (helper).
create or replace function public.range_numbers(p_from date, p_to date) returns jsonb
language sql stable security definer set search_path = public as $$
  with r as (select * from public.bookings where wash_date between p_from and p_to),
       firsts as (select phone, min(wash_date) f from public.bookings where status <> 'cancelled' group by phone),
       cost as (select coalesce(sum(c.amount * ((least(p_to, (c.month + interval '1 month')::date - 1) - greatest(p_from, c.month) + 1)::numeric
                       / ((c.month + interval '1 month')::date - c.month))), 0) amt
                from public.costs c where c.month <= p_to and (c.month + interval '1 month')::date - 1 >= p_from)
  select jsonb_build_object(
    'booked',     (select count(*) from r where status <> 'cancelled'),
    'cancelled',  (select count(*) from r where status = 'cancelled'),
    'confirmed',  (select count(*) from r where confirmed_at is not null),
    'washed',     (select count(*) from r where status = 'done'),
    'paid',       (select count(*) from r where status <> 'cancelled' and payment like 'paid%'),
    'collected',  (select coalesce(sum(total), 0) from r where status <> 'cancelled' and payment like 'paid%'),
    'booked_value',(select coalesce(sum(total), 0) from r where status <> 'cancelled'),
    'discounts',  (select coalesce(sum(discount), 0) from r where status <> 'cancelled'),
    'avg_ticket', (select coalesce(round(avg(total)), 0) from r where status = 'done'),
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

create or replace function public.owner_analytics(p_from date, p_to date) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare n int := p_to - p_from + 1;
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  if p_to < p_from or n > 400 then raise exception 'Pick a shorter range' using errcode = '22023'; end if;
  return (
    with r as (select * from public.bookings where wash_date between p_from and p_to and status <> 'cancelled')
    select jsonb_build_object(
      'from', p_from, 'to', p_to,
      'cur',  public.range_numbers(p_from, p_to),
      'prev', public.range_numbers(p_from - n, p_from - 1),
      'series', (select jsonb_agg(jsonb_build_object('date', d::date,
                   'count', (select count(*) from r where wash_date = d::date),
                   'amount', (select coalesce(sum(total), 0) from r where wash_date = d::date and payment like 'paid%')) order by d)
                 from generate_series(p_from, p_to, interval '1 day') d),
      'sources',  (select coalesce(jsonb_agg(jsonb_build_object('name', source, 'count', c) order by c desc), '[]'::jsonb) from (select source, count(*) c from r group by source) x),
      'packages', (select coalesce(jsonb_agg(jsonb_build_object('name', package, 'count', c, 'amount', a) order by c desc), '[]'::jsonb) from (select package, count(*) c, sum(total) a from r group by package order by c desc limit 8) x),
      'areas',    (select coalesce(jsonb_agg(jsonb_build_object('name', area, 'count', c) order by c desc), '[]'::jsonb) from (select area, count(*) c from r where area <> '' group by area order by c desc limit 8) x),
      'slots',    (select coalesce(jsonb_agg(jsonb_build_object('name', slot, 'count', c) order by array_position(array['6–8 AM','8–10 AM','10 AM–1 PM','2–5 PM','5–8 PM'], slot)), '[]'::jsonb) from (select slot, count(*) c from r group by slot) x),
      'vehicles', (select coalesce(jsonb_agg(jsonb_build_object('name', vehicle_type, 'count', c) order by c desc), '[]'::jsonb) from (select vehicle_type, count(*) c from r group by vehicle_type) x),
      'washers',  (select coalesce(jsonb_agg(jsonb_build_object('name', coalesce(s.name, 'Not assigned'), 'count', x.c, 'amount', x.a) order by x.c desc), '[]'::jsonb)
                   from (select assigned_to, count(*) c, coalesce(sum(total), 0) a from r where status = 'done' group by assigned_to) x left join public.staff s on s.id = x.assigned_to),
      'offers',   (select coalesce(jsonb_agg(jsonb_build_object('name', case promo when 'MANUAL' then 'Staff discount' when 'REFERRAL' then 'Referral' else promo end, 'count', c, 'amount', a) order by c desc), '[]'::jsonb)
                   from (select promo, count(*) c, sum(discount) a from r where discount > 0 group by promo) x)));
end $$;

revoke execute on function public.range_numbers(date, date) from public, anon, authenticated;
revoke execute on function public.staff_range(date, date), public.owner_attention(), public.owner_analytics(date, date) from public, anon;
grant execute on function public.staff_range(date, date), public.owner_attention(), public.owner_analytics(date, date) to authenticated;

notify pgrst, 'reload schema';
select 'Done: Studio screens are ready' as result;

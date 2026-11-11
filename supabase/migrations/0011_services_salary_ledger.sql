-- 0011 · Services & prices in the app, monthly salary, alerts for online changes, wash photos on the track page,
--        and a money ledger for the accountant.
-- Run once in Supabase → SQL Editor (after 0010). Safe to run again.

-- =========================================================================== services & prices
-- One saved list (packages with their prices, add-ons, detailing treatments, monthly plans). The website and staff app
-- read it; the owner edits it in Settings → Services & prices. Starts as today's list.
create table if not exists public.catalog (
  id         int primary key default 1 check (id = 1),
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.staff (id) on delete set null
);
alter table public.catalog enable row level security;
revoke all on public.catalog from anon, authenticated;
insert into public.catalog (id, data) values (1, $cat${"pkg":{"car":[{"n":"Essential wash","d":"A thorough exterior refresh to bring back that just-cleaned feel.","t":"~30 MIN","i":["Snow-foam pre-wash","Hand wash with microfibre mitt","Tyres and rims","Glass and mirrors"],"p":{"hatch":299,"sedan":349,"suv":399}},{"n":"Foam & glow","d":"Foam wash, careful rinse and finishing touches for a brilliant shine.","t":"~45 MIN","hl":1,"i":["Everything in Essential","Interior vacuum: seats, mats, boot","Dashboard and door wipe-down","Tyre dressing"],"p":{"hatch":499,"sedan":599,"suv":699}},{"n":"Deep refresh","d":"Extra attention for the details, inside and out. A complete reset.","t":"~90 MIN","i":["Everything in Foam & glow","Seat and roof shampoo","Spray wax coat","AC vents and crevices"],"p":{"hatch":999,"sedan":1199,"suv":1399}}],"bike":[{"n":"Quick bike wash","d":"A neat exterior clean for your everyday ride.","t":"~20 MIN","i":["Foam wash and rinse","Wheels and spokes","Seat wipe","Microfibre dry"],"p":{"bike":149}},{"n":"Foam & detail","d":"Foam wash with careful cleaning around the details.","t":"~35 MIN","hl":1,"i":["Everything in Quick","Body polish","Chain clean and lube","Plastic and tyre dressing"],"p":{"bike":249}},{"n":"Chain & shine","d":"A detailed clean for your bike's hardest-working parts.","t":"~50 MIN","i":["Everything in Foam & detail","Engine degrease","Wax coat on tank","Chrome and visor polish"],"p":{"bike":449}}]},"addons":{"car":[{"id":"vac","n":"Interior vacuum","d":"Seats, mats and boot. Included in Foam & glow and above.","p":199},{"id":"rim","n":"Tyre & rim deep clean","d":"Brake dust and road tar removed.","p":149},{"id":"odour","n":"Odour removal","d":"Cabin steam and fragrance treatment.","p":249},{"id":"wax","n":"Spray wax coat","d":"Extra gloss and water beading.","p":299}],"bike":[{"id":"brim","n":"Tyre & rim deep clean","d":"Brake dust and chain grime off the wheels.","p":99},{"id":"bwax","n":"Spray wax coat","d":"Extra gloss on tank and panels.","p":149},{"id":"helmet","n":"Helmet clean","d":"Shell, visor and liner freshened.","p":99}]},"detail":[{"id":"int","ic":"◫","n":"Interior deep clean","d":"For stained seats, sticky dashboards and that stale-cabin smell.","tags":["Seat & roof shampoo","Carpet extraction","Vents & crevices"],"t":"~3 hrs","p":1499},{"id":"pol","ic":"◎","n":"Paint polish & wax","d":"Machine polish to lift light swirls and dullness, finished with wax.","tags":["Machine polish","Wax coat","Trim dressing"],"t":"~4 hrs","p":2499},{"id":"cer","ic":"◇","n":"Ceramic spray sealant","d":"A slick protective layer for deep gloss and water beading.","tags":["Decontamination wash","Sealant coat","Glass treatment"],"t":"~2 hrs","p":1999},{"id":"eng","ic":"⚙","n":"Engine bay detailing","d":"Safe degrease and dressing of plastics and hoses.","tags":["Degrease","Low-pressure rinse","Plastic dressing"],"t":"~45 min","p":699},{"id":"san","ic":"✳","n":"Odour & sanitisation","d":"For pets, food spills, damp monsoon smells.","tags":["AC vent steam","Cabin fogging","Mat sanitise"],"t":"~45 min","p":599},{"id":"head","ic":"◐","n":"Headlight restoration","d":"Clears yellowed, cloudy lenses for better night visibility.","tags":["Wet sanding","Polish","UV protect"],"t":"~45 min","p":799}],"plans":{"car":[{"s":"STARTER","n":"Fresh Start","d":"For the occasional refresh.","p":599,"w":4,"i":["4 Essential washes a month","Fixed weekday slot","Same washer each visit"]},{"s":"EVERYDAY FAVOURITE","n":"Stay Sharp","d":"For cars that deserve regular care.","p":999,"w":8,"i":["8 Essential washes a month","1 interior vacuum","Priority slots"],"hl":1},{"s":"ALL IN","n":"Always Glossy","d":"For the truly clean-conscious.","p":1499,"w":12,"i":["12 Essential washes a month","2 interior vacuums","Free re-wash if it rains"]}],"bike":[{"s":"STARTER","n":"Fresh Start","d":"For the occasional refresh.","p":299,"w":4,"i":["4 Quick washes a month","Fixed weekday slot","Same washer each visit"]},{"s":"EVERYDAY FAVOURITE","n":"Stay Sharp","d":"For bikes that ride every day.","p":499,"w":8,"i":["8 Quick washes a month","Chain lube twice a month","Priority slots"],"hl":1},{"s":"ALL IN","n":"Always Glossy","d":"For the truly clean-conscious.","p":699,"w":12,"i":["12 Quick washes a month","Chain lube every week","Free re-wash if it rains"]}]}}$cat$::jsonb) on conflict (id) do nothing;

-- The JSON type, or 'missing' (so a missing value fails the checks below instead of slipping through).
create or replace function public.jt(x jsonb) returns text language sql immutable as $$ select coalesce(jsonb_typeof(x), 'missing') $$;

-- Checks a list before it is saved. Raises a plain-English message for the first problem found.
create or replace function public.catalog_check(c jsonb) returns void
language plpgsql immutable set search_path = public as $$
declare v text; x jsonb; i int; k text; ids text[] := '{}';
begin
  if public.jt(c) <> 'object' or length(c::text) > 60000 then raise exception 'The list is too long' using errcode = '22023'; end if;
  foreach v in array array['car', 'bike'] loop
    if public.jt(c #> array['pkg', v]) <> 'array' or jsonb_array_length(c #> array['pkg', v]) not between 1 and 6 then
      raise exception 'Keep between 1 and 6 % washes', v using errcode = '22023'; end if;
    i := 0;
    for x in select * from jsonb_array_elements(c #> array['pkg', v]) loop
      i := i + 1;
      if coalesce(length(trim(x ->> 'n')), 0) not between 1 and 60 then raise exception '% wash %: give it a name (up to 60 letters)', initcap(v), i using errcode = '22023'; end if;
      if length(coalesce(x ->> 'd', '')) > 300 or length(coalesce(x ->> 't', '')) > 20 then raise exception '%: the description or time is too long', x ->> 'n' using errcode = '22023'; end if;
      if public.jt(coalesce(x -> 'i', '[]')) <> 'array' or jsonb_array_length(coalesce(x -> 'i', '[]')) > 15 then raise exception '%: up to 15 lines under What''s included', x ->> 'n' using errcode = '22023'; end if;
      foreach k in array case when v = 'car' then array['hatch', 'sedan', 'suv'] else array['bike'] end loop
        if public.jt(x #> array['p', k]) <> 'number' or (x #>> array['p', k])::numeric not between 0 and 100000 then
          raise exception '%: enter a price (0 to 1,00,000)', x ->> 'n' using errcode = '22023'; end if;
      end loop;
    end loop;
    if public.jt(coalesce(c #> array['addons', v], '[]')) <> 'array' or jsonb_array_length(coalesce(c #> array['addons', v], '[]')) > 12 then
      raise exception 'Up to 12 % add-ons', v using errcode = '22023'; end if;
    if public.jt(coalesce(c #> array['plans', v], '[]')) <> 'array' or jsonb_array_length(coalesce(c #> array['plans', v], '[]')) > 6 then
      raise exception 'Up to 6 % plans', v using errcode = '22023'; end if;
    for x in select * from jsonb_array_elements(coalesce(c #> array['plans', v], '[]')) loop
      if coalesce(length(trim(x ->> 'n')), 0) not between 1 and 60 then raise exception 'Every plan needs a name' using errcode = '22023'; end if;
      if public.jt(x -> 'p') <> 'number' or (x ->> 'p')::numeric not between 0 and 1000000 then raise exception '%: enter the price a month', x ->> 'n' using errcode = '22023'; end if;
      if public.jt(x -> 'w') <> 'number' or (x ->> 'w')::numeric not between 1 and 62 then raise exception '%: washes a month must be 1 to 62', x ->> 'n' using errcode = '22023'; end if;
    end loop;
  end loop;
  if public.jt(coalesce(c -> 'detail', '[]')) <> 'array' or jsonb_array_length(coalesce(c -> 'detail', '[]')) > 15 then
    raise exception 'Up to 15 detailing treatments' using errcode = '22023'; end if;
  for x in select * from jsonb_array_elements(coalesce(c #> '{addons,car}', '[]') || coalesce(c #> '{addons,bike}', '[]') || coalesce(c -> 'detail', '[]')) loop
    if coalesce(length(trim(x ->> 'n')), 0) not between 1 and 60 then raise exception 'Every add-on and treatment needs a name' using errcode = '22023'; end if;
    if coalesce(x ->> 'id', '') !~ '^[a-z0-9_-]{1,24}$' or (x ->> 'id') = any (ids) then raise exception '%: something is wrong with its code, remove and add it again', x ->> 'n' using errcode = '22023'; end if;
    ids := ids || (x ->> 'id');
    if public.jt(x -> 'p') <> 'number' or (x ->> 'p')::numeric not between 0 and 100000 then raise exception '%: enter a price', x ->> 'n' using errcode = '22023'; end if;
  end loop;
end $$;

create or replace function public.public_catalog() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('data', data, 'updated_at', updated_at) from public.catalog where id = 1;
$$;

create or replace function public.owner_save_catalog(p jsonb) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  perform public.catalog_check(p);
  update public.catalog set data = p, updated_at = now(), updated_by = auth.uid() where id = 1;
  perform public.audit('catalog_saved', jsonb_array_length(p #> '{pkg,car}') || ' car, ' || jsonb_array_length(p #> '{pkg,bike}') || ' bike washes');
  return (select jsonb_build_object('data', data, 'updated_at', updated_at, 'by', (select name from public.staff where id = updated_by)) from public.catalog where id = 1);
end $$;

create or replace function public.owner_catalog_info() returns jsonb
language sql stable security definer set search_path = public as $$
  select case when public.is_owner() then (select jsonb_build_object('updated_at', updated_at, 'by', (select name from public.staff where id = updated_by)) from public.catalog where id = 1) end;
$$;

-- =========================================================================== monthly salary
alter table public.staff add column if not exists pay_type  text not null default 'per_wash';
alter table public.staff add column if not exists pay_month int  not null default 0;
alter table public.staff drop constraint if exists staff_pay_type_check;
alter table public.staff add constraint staff_pay_type_check check (pay_type in ('per_wash', 'monthly') and pay_month between 0 and 1000000);

-- Months (first day) from p_from to p_to that have started.
create or replace function public.pay_months(p_from date, p_to date) returns setof date
language sql stable set search_path = public as $$
  select m::date from generate_series(date_trunc('month', p_from), date_trunc('month', least(p_to, public.ist_today())), interval '1 month') m;
$$;
create or replace function public.month_paid(p_staff uuid, p_month date) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.payouts where staff_id = p_staff and date_from = p_month and date_to = (p_month + interval '1 month - 1 day')::date);
$$;

create or replace function public.owner_set_pay(p_staff uuid, p_type text, p_car int, p_bike int, p_month int) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  if p_type not in ('per_wash', 'monthly') then raise exception 'Pick per wash or monthly salary' using errcode = '22023'; end if;
  update public.staff set pay_type = p_type,
         pay_car = greatest(0, least(coalesce(p_car, 0), 100000)), pay_bike = greatest(0, least(coalesce(p_bike, 0), 100000)),
         pay_month = greatest(0, least(coalesce(p_month, 0), 1000000)) where id = p_staff;
  if not found then raise exception 'Unknown washer' using errcode = '22023'; end if;
  perform public.audit('pay_rates', (select name from public.staff where id = p_staff) || case when p_type = 'monthly' then ' · monthly salary' else ' · per wash' end);
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.owner_pay(p_from date, p_to date) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  if p_to < p_from or p_to - p_from > 120 then raise exception 'Pick a shorter range' using errcode = '22023'; end if;
  return (with j as (
      select b.*, public.pay_units(b) units,
             case when s.pay_type = 'monthly' then 0 else public.pay_units(b) * case when b.vehicle_type = 'bike' then s.pay_bike else s.pay_car end end amount
        from public.bookings b join public.staff s on s.id = b.assigned_to
       where b.status = 'done' and (b.done_at at time zone 'Asia/Kolkata')::date between p_from and p_to),
    m as (select s.id, pm as month, public.month_paid(s.id, pm) as paid from public.staff s, public.pay_months(p_from, p_to) pm where s.pay_type = 'monthly')
    select coalesce(jsonb_agg(x order by x ->> 'name'), '[]'::jsonb) from (
      select jsonb_build_object('id', s.id, 'name', s.name, 'role', s.role, 'phone', s.phone, 'active', s.active,
        'pay_type', s.pay_type, 'pay_car', s.pay_car, 'pay_bike', s.pay_bike, 'pay_month', s.pay_month,
        'washes', (select coalesce(sum(units), 0) from j where j.assigned_to = s.id),
        'earned', case when s.pay_type = 'monthly' then s.pay_month * (select count(*) from m where m.id = s.id)
                       else (select coalesce(sum(amount), 0) from j where j.assigned_to = s.id) end,
        'owed',   case when s.pay_type = 'monthly' then s.pay_month * (select count(*) from m where m.id = s.id and not m.paid)
                       else (select coalesce(sum(amount), 0) from j where j.assigned_to = s.id and j.payout_id is null) end,
        'months', (select coalesce(jsonb_agg(jsonb_build_object('month', month, 'paid', paid) order by month), '[]'::jsonb) from m where m.id = s.id),
        'jobs', (select coalesce(jsonb_agg(jsonb_build_object('id', id, 'day', (done_at at time zone 'Asia/Kolkata')::date, 'name', name, 'package', package,
                   'vehicle', vehicle, 'units', units, 'amount', amount, 'paid', payout_id is not null) order by done_at), '[]'::jsonb) from j where j.assigned_to = s.id),
        'payouts', (select coalesce(jsonb_agg(jsonb_build_object('id', p.id, 'from', p.date_from, 'to', p.date_to, 'washes', p.washes, 'amount', p.amount,
                   'note', p.note, 'paid_at', p.paid_at) order by p.paid_at desc), '[]'::jsonb)
                    from (select * from public.payouts where staff_id = s.id order by paid_at desc limit 6) p)) x
        from public.staff s where s.active or exists (select 1 from j where j.assigned_to = s.id)) z);
end $$;

-- Per wash: everything owed in the dates. Monthly: each unpaid month in the dates (one payment per month).
create or replace function public.owner_pay_out(p_staff uuid, p_from date, p_to date, p_note text) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare pid bigint; n int; amt int; s public.staff; mo date; tot int := 0; cnt int := 0;
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  select * into s from public.staff where id = p_staff;
  if not found then raise exception 'Unknown washer' using errcode = '22023'; end if;
  if s.pay_type = 'monthly' then
    if s.pay_month < 1 then raise exception 'Set the monthly salary first' using errcode = '22023'; end if;
    for mo in select * from public.pay_months(p_from, p_to) loop
      if public.month_paid(p_staff, mo) then continue; end if;
      select count(*) into n from public.bookings b where b.assigned_to = p_staff and b.status = 'done' and b.payout_id is null
         and (b.done_at at time zone 'Asia/Kolkata')::date between mo and (mo + interval '1 month - 1 day')::date;
      insert into public.payouts (staff_id, date_from, date_to, washes, amount, note, paid_by)
      values (p_staff, mo, (mo + interval '1 month - 1 day')::date, n, s.pay_month, public.clip(coalesce(nullif(p_note, ''), 'Salary ' || to_char(mo, 'Mon YYYY')), 120), auth.uid())
      returning id into pid;
      update public.bookings b set payout_id = pid where b.assigned_to = p_staff and b.status = 'done' and b.payout_id is null
         and (b.done_at at time zone 'Asia/Kolkata')::date between mo and (mo + interval '1 month - 1 day')::date;
      tot := tot + s.pay_month; cnt := cnt + 1;
    end loop;
    if cnt = 0 then raise exception 'The salary for these months is already paid' using errcode = '22023'; end if;
    perform public.audit('pay_out', s.name || ' · salary ₹' || tot);
    return jsonb_build_object('ok', true, 'months', cnt, 'amount', tot);
  end if;
  select coalesce(sum(public.pay_units(b)), 0), coalesce(sum(public.pay_units(b) * case when b.vehicle_type = 'bike' then s.pay_bike else s.pay_car end), 0)
    into n, amt
    from public.bookings b
   where b.assigned_to = p_staff and b.status = 'done' and b.payout_id is null and (b.done_at at time zone 'Asia/Kolkata')::date between p_from and p_to;
  if n = 0 then raise exception 'Nothing owed in these dates' using errcode = '22023'; end if;
  insert into public.payouts (staff_id, date_from, date_to, washes, amount, note, paid_by)
  values (p_staff, p_from, p_to, n, amt, public.clip(p_note, 120), auth.uid()) returning id into pid;
  update public.bookings b set payout_id = pid
   where b.assigned_to = p_staff and b.status = 'done' and b.payout_id is null and (b.done_at at time zone 'Asia/Kolkata')::date between p_from and p_to;
  perform public.audit('pay_out', s.name || ' · ₹' || amt);
  return jsonb_build_object('ok', true, 'id', pid, 'washes', n, 'amount', amt);
end $$;

create or replace function public.staff_my_pay() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare s public.staff; m0 date := date_trunc('month', public.ist_today())::date;
begin
  if not public.is_staff() then raise exception 'not allowed' using errcode = '42501'; end if;
  select * into s from public.staff where id = auth.uid();
  return (with j as (select b.*, public.pay_units(b) units, public.pay_units(b) * case when b.vehicle_type = 'bike' then s.pay_bike else s.pay_car end amount
                       from public.bookings b where b.assigned_to = s.id and b.status = 'done')
    select jsonb_build_object('pay_type', s.pay_type, 'pay_month', s.pay_month, 'pay_car', s.pay_car, 'pay_bike', s.pay_bike,
      'month_washes', (select coalesce(sum(units), 0) from j where (done_at at time zone 'Asia/Kolkata')::date >= m0),
      'month_earned', case when s.pay_type = 'monthly' then s.pay_month else (select coalesce(sum(amount), 0) from j where (done_at at time zone 'Asia/Kolkata')::date >= m0) end,
      'month_paid', s.pay_type = 'monthly' and public.month_paid(s.id, m0),
      'owed', case when s.pay_type = 'monthly' then 0 else (select coalesce(sum(amount), 0) from j where payout_id is null) end,
      'payouts', (select coalesce(jsonb_agg(jsonb_build_object('from', date_from, 'to', date_to, 'washes', washes, 'amount', amount, 'paid_at', paid_at) order by paid_at desc), '[]'::jsonb)
                  from (select * from public.payouts where staff_id = s.id order by paid_at desc limit 5) p)));
end $$;

-- =========================================================================== phone alert when a customer changes a booking online
create or replace function public.push_change(p_id text, p_kind text) returns void
language plpgsql volatile security definer set search_path = public as $$
begin
  if to_regproc('net.http_post') is null then return; end if;
  begin
    perform net.http_post(
      url := 'https://rcekecnigbtgicvntfbz.supabase.co/functions/v1/push',
      body := jsonb_build_object('change', p_id, 'kind', p_kind, 'secret', (select hook_secret from public.push_config where id = 1)),
      headers := '{"Content-Type": "application/json"}'::jsonb);
  exception when others then null;
  end;
end $$;

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
    perform public.push_change(p_id, 'cancelled');
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
    perform public.push_change(p_id, 'moved');
  else
    raise exception 'unknown action' using errcode = '22023';
  end if;
  select * into b from public.bookings where id = p_id;
  return public.track_view(b);
end $$;

-- =========================================================================== wash photos on the track page
-- The track page asks the push function, which checks the private link and gets short-lived photo links from Storage.
create or replace function public.track_photos(p_id text, p_key text) returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('kind', p.kind, 'path', p.path) order by p.kind desc, p.created_at), '[]'::jsonb)
    from public.job_photos p join public.bookings b on b.id = p.booking_id
   where b.id = p_id and b.track_key is not null and b.track_key = p_key and b.status in ('on_way', 'done');
$$;

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
    'reviewed', exists (select 1 from public.reviews r where r.booking_id = b.id),
    'photos', case when b.status in ('on_way', 'done') then (select count(*) from public.job_photos p where p.booking_id = b.id) else 0 end);
$$;

-- =========================================================================== money ledger (for the accountant)
-- Every rupee in and out in the dates. No customer names or phone numbers: bookings are shown by ID and package.
create or replace function public.owner_ledger(p_from date, p_to date) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_owner() then raise exception 'owner only' using errcode = '42501'; end if;
  if p_to < p_from or p_to - p_from > 400 then raise exception 'Pick up to about a year' using errcode = '22023'; end if;
  perform public.audit('export', 'Money ledger ' || p_from || ' to ' || p_to);
  return coalesce((select jsonb_agg(x order by x ->> 'date', x ->> 'type') from (
    select jsonb_build_object('date', (b.paid_at at time zone 'Asia/Kolkata')::date, 'type', 'Wash payment', 'ref', b.id,
             'detail', b.package || coalesce(nullif(' + ' || b.extras, ' + '), '') || ' · ' || b.vehicle, 'method', case b.payment when 'paid_upi' then 'UPI' else 'Cash' end,
             'in', b.total, 'out', 0) x
      from public.bookings b where b.payment in ('paid_upi', 'paid_cash') and b.total > 0 and (b.paid_at at time zone 'Asia/Kolkata')::date between p_from and p_to
    union all
    select jsonb_build_object('date', (p.paid_at at time zone 'Asia/Kolkata')::date, 'type', case c.kind when 'society' then 'Society contract' else 'Monthly plan' end,
             'ref', 'C' || c.id, 'detail', coalesce(c.plan_name, '') || ' · ' || to_char(p.period_start, 'DD Mon') || '–' || to_char(p.period_end, 'DD Mon'),
             'method', case p.payment when 'paid_upi' then 'UPI' else 'Cash' end, 'in', p.price, 'out', 0)
      from public.contract_periods p join public.contracts c on c.id = p.contract_id
     where p.payment in ('paid_upi', 'paid_cash') and (p.paid_at at time zone 'Asia/Kolkata')::date between p_from and p_to
    union all
    select jsonb_build_object('date', e.day, 'type', 'Expense · ' || initcap(e.category), 'ref', 'E' || e.id, 'detail', e.note || case when e.staff_name <> '' then ' (' || e.staff_name || ')' else '' end,
             'method', '', 'in', 0, 'out', e.amount)
      from public.expenses e where e.status = 'approved' and e.day between p_from and p_to
    union all
    select jsonb_build_object('date', (y.paid_at at time zone 'Asia/Kolkata')::date, 'type', 'Washer pay', 'ref', 'P' || y.id,
             'detail', (select name from public.staff where id = y.staff_id) || ' · ' || to_char(y.date_from, 'DD Mon') || '–' || to_char(y.date_to, 'DD Mon') || ' · ' || y.washes || ' washes' || case when y.note <> '' then ' · ' || y.note else '' end,
             'method', '', 'in', 0, 'out', y.amount)
      from public.payouts y where (y.paid_at at time zone 'Asia/Kolkata')::date between p_from and p_to
    union all
    select jsonb_build_object('date', k.month, 'type', 'Monthly cost · ' || case k.category when 'ads' then 'Ads' when 'supplies' then 'Supplies' when 'fuel' then 'Fuel & travel' when 'pay' then 'Washer pay (entered)' else 'Other' end,
             'ref', '', 'detail', 'Entered in Settings → Monthly costs for ' || to_char(k.month, 'Mon YYYY'), 'method', '', 'in', 0, 'out', k.amount)
      from public.costs k where k.amount > 0 and k.month between date_trunc('month', p_from)::date and p_to) z), '[]'::jsonb);
end $$;

-- =========================================================================== access
alter table public.audit_log drop constraint if exists audit_log_action_check;
alter table public.audit_log add constraint audit_log_action_check
  check (action in ('export', 'booking_deleted', 'login_added', 'login_switched_on', 'login_switched_off',
                    'login_role', 'login_password', 'login_edited', 'login_deleted', 'messages_saved', 'notice_posted', 'notice_cleared',
                    'offers_saved', 'costs_saved', 'slots_saved', 'day_closed', 'day_reopened', 'pay_rates', 'pay_out', 'pay_undone', 'catalog_saved'));

revoke execute on function public.jt(jsonb), public.catalog_check(jsonb), public.pay_months(date, date), public.month_paid(uuid, date),
                           public.push_change(text, text), public.track_photos(text, text), public.track_view(public.bookings) from public, anon, authenticated;
grant execute on function public.track_photos(text, text) to service_role;
revoke execute on function public.public_catalog() from public;
grant execute on function public.public_catalog() to anon, authenticated;
revoke execute on function public.public_change(text, text, text, date, text, text) from public;
grant execute on function public.public_change(text, text, text, date, text, text) to anon, authenticated;
revoke execute on function public.owner_save_catalog(jsonb), public.owner_catalog_info(), public.owner_set_pay(uuid, text, int, int, int),
                           public.owner_pay(date, date), public.owner_pay_out(uuid, date, date, text), public.staff_my_pay(), public.owner_ledger(date, date) from public, anon;
grant execute on function public.owner_save_catalog(jsonb), public.owner_catalog_info(), public.owner_set_pay(uuid, text, int, int, int),
                          public.owner_pay(date, date), public.owner_pay_out(uuid, date, date, text), public.staff_my_pay(), public.owner_ledger(date, date) to authenticated;

notify pgrst, 'reload schema';
select 'Done: services & prices, monthly salary, change alerts, track photos and the money ledger are ready' as result;

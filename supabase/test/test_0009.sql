-- Run after test.sql, test_0003…test_0008 on the same database (owner ...0a, washer ...0c).
\set ON_ERROR_STOP 0
\pset tuples_only on
\pset format unaligned
select public.ist_today() d0 \gset
update public.slot_caps set cap = null; delete from public.closures; update public.app_settings set value = '' where key = 'closed_weekdays';
-- a website booking made just now, two days ahead
set role anon; select set_config('request.jwt.claim.sub','',false);
select 'K create: ' || (public.create_booking(('{"id":"VB-261110-TRK1","vehicle":"Car · Sedan","package":"Essential wash","date":"'||(:'d0'::date+2)||'","slot":"8–10 AM","address":"Flat 9","area":"Powai","pin":"400076","name":"Tara Shah","phone":"9822200501","subtotal":349,"total":349}')::jsonb)->>'ok');
select public.public_track_link('VB-261110-TRK1', '9822200501')->>'key' tk \gset
select 'K link with phone: ' || (length(:'tk') = 32)::text;
select 'K link wrong phone: ' || coalesce(public.public_track_link('VB-261110-TRK1', '9822200599')->>'key', 'none');
select 'K track: ' || (select (x->>'name') || ' ' || (x->>'status') || ' can_change=' || (x->>'can_change') || ' phone=' || coalesce(x->>'phone','none') from (select public.public_track('VB-261110-TRK1', :'tk') x) z);
select 'K wrong key: ' || coalesce(public.public_track('VB-261110-TRK1', 'nope')::text, 'null');
select 'K anon cannot read table: ' || (select count(*) from public.bookings)::text;
select 'K move: ' || (select (x->>'wash_date') || ' ' || (x->>'slot') from (select public.public_change('VB-261110-TRK1', :'tk', 'move', (:'d0'::date+3), '2–5 PM', '') x) z);
select 'K move bad key: ' || public.public_change('VB-261110-TRK1', 'nope', 'move', (:'d0'::date+3), '2–5 PM', '')::text;
select 'K move bad slot: ' || public.public_change('VB-261110-TRK1', :'tk', 'move', (:'d0'::date+3), '3 AM', '')::text;
select 'K move far: ' || public.public_change('VB-261110-TRK1', :'tk', 'move', (:'d0'::date+90), '2–5 PM', '')::text;
reset role;
-- full slot refused
update public.slot_caps set cap = 0 where slot = '5–8 PM';
set role anon;
select 'K move to full: ' || public.public_change('VB-261110-TRK1', :'tk', 'move', (:'d0'::date+3), '5–8 PM', '')::text;
reset role;
update public.slot_caps set cap = null where slot = '5–8 PM';
select 'K history: ' || (select string_agg(actor_name || ': ' || detail, ' | ') from public.booking_events where booking_id = 'VB-261110-TRK1' and actor_name = 'Customer');
-- too close to the slot
insert into public.bookings (id,vehicle_type,vehicle,package,wash_date,slot,address,name,phone,subtotal,total,source,status)
values ('VB-261110-TRK2','car','Car · Sedan','Essential wash',:'d0','6–8 AM','x','Late Lal','9822200502',349,349,'website','confirmed');
select track_key tk2 from public.bookings where id='VB-261110-TRK2' \gset
set role anon;
select 'K too late: ' || public.public_change('VB-261110-TRK2', :'tk2', 'cancel', null, null, 'x')::text;
select 'K too late view: can_change=' || (public.public_track('VB-261110-TRK2', :'tk2')->>'can_change');
select 'K cancel: ' || (select (x->>'status') || ' by_you=' || (x->>'cancelled_by_you') from (select public.public_change('VB-261110-TRK1', :'tk', 'cancel', null, null, 'Change of plans') x) z);
select 'K cancel twice: ' || public.public_change('VB-261110-TRK1', :'tk', 'cancel', null, null, '')::text;
reset role;
select 'K reason: ' || cancel_reason from public.bookings where id = 'VB-261110-TRK1';
-- owner sees the change on Home
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000a',false);
select 'K home changes: ' || jsonb_array_length(public.owner_attention()->'changes');
reset role;
-- cash handover
insert into public.bookings (id,vehicle_type,vehicle,package,wash_date,slot,address,name,phone,subtotal,total,source,status,done_at,assigned_to,payment,paid_at) values
 ('VB-261110-CSH1','car','Car · Sedan','Essential wash',:'d0','8–10 AM','x','Cash One','9822200511',349,349,'phone','done',now(),'00000000-0000-0000-0000-00000000000c','paid_cash',now()),
 ('VB-261110-CSH2','car','Car · SUV','Foam & glow',:'d0','2–5 PM','x','Cash Two','9822200512',599,599,'phone','done',now(),'00000000-0000-0000-0000-00000000000c','paid_cash',now()),
 ('VB-261110-CSH3','car','Car · SUV','Foam & glow',:'d0','2–5 PM','x','UPI One','9822200513',599,599,'phone','done',now(),'00000000-0000-0000-0000-00000000000c','paid_upi',now());
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000c',false);
select 'C washer cash: ' || (select (x->>'balance') || ' today ' || (x->>'today') || ' jobs ' || jsonb_array_length(x->'today_jobs') from (select public.staff_cash() x) z);
select 'C washer cannot mark received: ' || public.owner_cash_received('00000000-0000-0000-0000-00000000000c', 100, '')::text;
reset role;
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000a',false);
select 'C owner list: ' || (select string_agg((x->>'name') || ' ' || (x->>'balance'), ', ') from jsonb_array_elements(public.owner_cash()) x);
select 'C home cash: ' || jsonb_array_length(public.owner_attention()->'cash');
select 'C received short: ' || (select (x->>'balance') from jsonb_array_elements(public.owner_cash_received('00000000-0000-0000-0000-00000000000c', 900, 'Short 48')) x where x->>'id'='00000000-0000-0000-0000-00000000000c');
select 'C zero refused: ' || public.owner_cash_received('00000000-0000-0000-0000-00000000000c', 0, '')::text;
reset role;
select (select id from public.cash_handovers order by id desc limit 1) hid \gset
select 'C expected kept: ' || (select expected || '/' || amount from public.cash_handovers where id = :hid);
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000a',false);
select 'C undo: ' || (select (x->>'balance') from jsonb_array_elements(public.owner_cash_undo(:hid)) x where x->>'id'='00000000-0000-0000-0000-00000000000c');
reset role;
-- due for a wash leaves out plan / society visits
insert into public.bookings (id,vehicle_type,vehicle,package,wash_date,slot,address,name,phone,subtotal,total,source,status,done_at,payment) values
 ('VB-261010-DUE1','car','Car · Sedan','Essential wash',:'d0'::date-20,'8–10 AM','x','Due Person','9822200521',349,349,'phone','done',now(),'paid_upi'),
 ('VB-261010-DUE2','car','Society · 3 vehicles','Society wash',:'d0'::date-20,'6–8 AM','x','Some Society','9822200522',0,0,'society','done',now(),'covered');
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000a',false);
select 'D due has person: ' || (public.owner_due(12)::text like '%9822200521%')::text;
select 'D due skips society: ' || (public.owner_due(12)::text like '%9822200522%')::text;
select 'D home count before reminder: ' || (public.owner_attention()->>'due');
reset role;
update public.bookings set reminder_sent_at = now() where id = 'VB-261010-DUE1';
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000a',false);
select 'D home count after reminder: ' || (public.owner_attention()->>'due');
select 'D still listed (last): ' || (public.owner_due(12)::text like '%9822200521%')::text;
reset role;

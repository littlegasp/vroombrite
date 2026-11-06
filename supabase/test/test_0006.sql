-- Run after test.sql, test_0003/4/5 on the same database (needs owner ...0a and washer ...0c from test_0005).
\set ON_ERROR_STOP 0
\pset tuples_only on
\pset format unaligned
select public.ist_today() d0, public.ist_today()-1 dm1, public.ist_today()+25 d25, public.ist_today()+26 d26 \gset
insert into public.bookings (id,vehicle,package,wash_date,slot,address,name,phone,subtotal,total,source,status) values
 ('VB-261130-RN01','Car · Sedan','Foam & glow',:'d25','8–10 AM','x','Rain One','9822200101',599,599,'phone','confirmed'),
 ('VB-261130-RN02','Car · SUV','Essential wash',:'d25','10 AM–1 PM','x','Rain Two','9822200102',399,399,'phone','new'),
 ('VB-261130-RN03','Bike / Scooter','Quick bike wash',:'d25','2–5 PM','x','Rain Done','9822200103',149,149,'phone','done');
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000c',false);
-- timer
select 'T start: ' || ((public.staff_timer('VB-261130-RN01','start')->>'started_at') is not null)::text;
select 'T start twice keeps first: ' || ((public.staff_timer('VB-261130-RN01','start')->>'started_at') = (select (public.staff_timer('VB-261130-RN01','start')->>'started_at')))::text;
select 'T bad action: ' || public.staff_timer('VB-261130-RN01','pause')::text;
select 'T reset: ' || coalesce(public.staff_timer('VB-261130-RN01','reset')->>'started_at','null');
select 'T start again: ' || ((public.staff_timer('VB-261130-RN01','start')->>'started_at') is not null)::text;
-- checklist
select 'C tick: ' || (public.staff_check('VB-261130-RN01','Snow-foam pre-wash',true)->'checks')::text;
select 'C tick 2: ' || (public.staff_check('VB-261130-RN01','Interior vacuum: seats, mats, boot',true)->'checks')::text;
select 'C tick same again: ' || jsonb_array_length(public.staff_check('VB-261130-RN01','Snow-foam pre-wash',true)->'checks');
select 'C untick: ' || (public.staff_check('VB-261130-RN01','Snow-foam pre-wash',false)->'checks')::text;
select 'C empty refused: ' || public.staff_check('VB-261130-RN01','  ',true)::text;
-- customer note (washer can save)
select 'N save: ' || public.staff_save_customer_note('9822200101','Gate code 4512 · park in B2')::text;
select 'N on booking: ' || (public.staff_timer('VB-261130-RN01','start')->>'cust_note');
select 'N unknown mobile refused: ' || public.staff_save_customer_note('9000000000','x')::text;
select 'N washer cannot read table: ' || (select count(*) from public.customer_notes)::text;
-- washer cannot move a day or see durations
select 'M washer refused: ' || public.owner_move_day(array['VB-261130-RN01'], :'d26', null, 'Rain')::text;
select 'D washer refused: ' || public.owner_durations(:'d0', :'d26')::text;
reset role;
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000a',false);
select 'M past refused: ' || public.owner_move_day(array['VB-261130-RN01'], :'dm1', null, 'Rain')::text;
select 'M move: ' || (select string_agg((x->>'id') || '@' || (x->>'wash_date') || ' ' || (x->>'slot') || ' started=' || coalesce(x->>'started_at','null'), ', ' order by x->>'id')
                     from jsonb_array_elements(public.owner_move_day(array['VB-261130-RN01','VB-261130-RN02','VB-261130-RN03'], :'d26', null, 'Rain')) x);
select 'M history: ' || (select x->>'detail' from jsonb_array_elements(public.booking_history('VB-261130-RN02')) x where x->>'kind'='edited' limit 1);
select 'M new slot: ' || (public.owner_move_day(array['VB-261130-RN02'], :'d26', '5–8 PM', '')->0->>'slot');
select 'M template: ' || (select count(*) from jsonb_array_elements(public.staff_settings()->'templates') x where x->>'key'='moved');
reset role;
-- a finished, timed wash for durations
update public.bookings set status='done', started_at=now()-interval '42 minutes', done_at=now(), assigned_to='00000000-0000-0000-0000-00000000000c' where id='VB-261130-RN01';
update public.bookings set status='done', started_at=now()-interval '1 minute', done_at=now() where id='VB-261130-RN02';
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000a',false);
select 'D durations: ' || public.owner_durations(:'d0', :'d26')::text;
-- deleting a customer's only booking removes their note
select 'N delete booking: ' || (public.owner_delete_booking('VB-261130-RN01')->>'ok');
reset role;
select 'N note gone: ' || (select count(*) from public.customer_notes where phone='9822200101');

-- Run after test.sql, test_0003.sql and test_0004.sql on the same database (needs owner ...0a / washer ...0b).
\set ON_ERROR_STOP 0
\pset tuples_only on
\pset format unaligned
-- a fresh washer for these checks, and the dates used below
insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000c', 'w5@vb.test') on conflict do nothing;
update public.staff set active = true where id = '00000000-0000-0000-0000-00000000000c';
select public.ist_today() d0, public.ist_today()-1 dm1, public.ist_today()+1 d1, public.ist_today()+20 d20, public.ist_today()+21 d21, public.ist_today()+22 d22, public.ist_today()+30 d30 \gset
-- website: availability is visible, details are not
set role anon;
select 'W availability days: ' || jsonb_array_length(public.slot_availability(:'d20', 7));
select 'W availability open: ' || (public.slot_availability(:'d20', 1)->0->'slots'->>'8–10 AM');
select 'W anon cannot read caps: ' || (select count(*) from public.slot_caps)::text;
select 'W anon cannot call staff_slots: ' || public.staff_slots(:'d0', :'d1')::text;
select 'W anon cannot call slot_state: ' || public.slot_state(:'d0', '8–10 AM');
reset role;
-- owner sets a cap of 1 and closes a day
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000a',false);
select 'W owner save caps: ' || (select string_agg((x->>'slot') || '=' || coalesce(x->>'cap','none'), ',') from jsonb_array_elements(public.owner_save_slots('{"caps":[{"slot":"8–10 AM","cap":1},{"slot":"5–8 PM","cap":""}],"closed_weekdays":["7","9","7"]}')->'caps') x);
select 'W weekdays: ' || (public.staff_slots(:'d0', :'d1')->>'closed_weekdays');
select 'W close day: ' || public.owner_close_day(:'d21', null, 'Diwali')::text;
select 'W close slot: ' || public.owner_close_day(:'d22', '2–5 PM', 'Society job')::text;
select 'W close past refused: ' || public.owner_close_day(:'dm1', null, '')::text;
select 'W closures listed: ' || jsonb_array_length(public.staff_slots(:'d0', :'d30')->'closures');
reset role;
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000c',false);
select 'W washer cannot change caps: ' || public.owner_save_slots('{"caps":[]}')::text;
select 'W washer sees slots: ' || jsonb_array_length(public.staff_slots(:'d0', :'d1')->'caps');
reset role;
-- website booking: first takes the last seat, second is refused, closed day refused, staff can still add
set role anon;
select 'W book 1: ' || (public.create_booking(jsonb_build_object('id','VB-261127-SLT1','name','A','phone','9822200001','address','x','vehicle','Car · Sedan','package','Essential wash','date',:'d20','slot','8–10 AM','subtotal',349))->>'ok');
select 'W now full: ' || (public.slot_availability(:'d20', 1)->0->'slots'->>'8–10 AM');
select 'W book 2 refused: ' || (public.create_booking(jsonb_build_object('id','VB-261127-SLT2','name','B','phone','9822200002','address','x','vehicle','Car · Sedan','package','Essential wash','date',:'d20','slot','8–10 AM','subtotal',349))->>'ok');
select 'W closed day: ' || (public.slot_availability(:'d21', 1)->0->'slots'->>'6–8 AM');
select 'W closed day refused: ' || (public.create_booking(jsonb_build_object('id','VB-261127-SLT3','name','C','phone','9822200003','address','x','vehicle','Car · Sedan','package','Essential wash','date',:'d21','slot','6–8 AM','subtotal',349))->>'ok');
select 'W closed slot only: ' || (select (s->>'2–5 PM') || '/' || (s->>'5–8 PM') from (select public.slot_availability(:'d22', 1)->0->'slots' s) z);
select 'W no-limit slot: ' || (public.create_booking(jsonb_build_object('id','VB-261127-SLT4','name','D','phone','9822200004','address','x','vehicle','Car · Sedan','package','Essential wash','date',:'d20','slot','5–8 PM','subtotal',349))->>'ok');
reset role;
select 'W sunday closed: ' || (select string_agg(distinct (d->'slots'->>'8–10 AM'), ',') from jsonb_array_elements(public.slot_availability(:'d0', 14)) d where extract(isodow from (d->>'date')::date) = 7);
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000c',false);
select 'W staff can overbook: ' || (public.staff_add_booking(jsonb_build_object('name','E','phone','9822200005','address','x','vehicle','Car · Sedan','package','Essential wash','date',:'d20','slot','8–10 AM','subtotal',349))->>'status');
select 'W counts: ' || (select x->>'n' from jsonb_array_elements(public.staff_slots(:'d20', :'d20')->'counts') x where x->>'slot'='8–10 AM');
-- photos
select 'P washer add: ' || jsonb_array_length(public.staff_add_photo('VB-261127-SLT1','VB-261127-SLT1/before-k3x9a1.jpg','before'));
select 'P bad path refused: ' || public.staff_add_photo('VB-261127-SLT1','VB-261106-AAAA/before-k3x9a1.jpg','before')::text;
select 'P bad kind refused: ' || public.staff_add_photo('VB-261127-SLT1','VB-261127-SLT1/during-k3x9a1.jpg','during')::text;
select 'P list: ' || (select string_agg((x->>'kind') || ':' || (x->>'mine'), ',') from jsonb_array_elements(public.staff_photos('VB-261127-SLT1')) x);
select 'P washer cannot read table: ' || (select count(*) from public.job_photos)::text;
reset role;
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000a',false);
select 'P owner add after: ' || jsonb_array_length(public.staff_add_photo('VB-261127-SLT1','VB-261127-SLT1/after-k3x9b2.jpg','after'));
reset role;
select (select id from public.job_photos where path like '%after-k3x9b2.jpg') ph_after, (select id from public.closures where reason='Diwali') cl_diwali \gset
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000c',false);
select 'P washer cannot delete owner photo: ' || public.staff_delete_photo(:ph_after)::text;
reset role;
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000a',false);
select 'P history: ' || (select count(*) from jsonb_array_elements(public.booking_history('VB-261127-SLT1')) x where x->>'kind'='photo');
select 'P delete booking returns files: ' || (public.owner_delete_booking('VB-261127-SLT1')->'photos')::text;
select 'W reopen: ' || public.owner_reopen_day(:cl_diwali)::text;
select 'W reopened day: ' || (public.slot_availability(:'d21', 1)->0->'slots'->>'6–8 AM');
select 'W audit: ' || (select string_agg(x->>'action', ',') from jsonb_array_elements(public.owner_audit(6)) x);
reset role;
select 'P rows gone with booking: ' || (select count(*) from public.job_photos where booking_id='VB-261127-SLT1');

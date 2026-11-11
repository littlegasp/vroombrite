-- Run after test.sql, test_0003…test_0010 on the same database (owner ...0a, washer ...0c).
\set ON_ERROR_STOP 0
\pset tuples_only on
\pset format unaligned
select public.ist_today() d0, date_trunc('month', public.ist_today())::date m0 \gset
-- services & prices
set role anon;
select 'S anon reads: ' || jsonb_array_length(public.public_catalog()->'data'->'pkg'->'car') || ' car washes, Foam & glow hatch ' || (public.public_catalog()#>>'{data,pkg,car,1,p,hatch}');
select 'S anon cannot save: ' || public.owner_save_catalog('{}')::text;
reset role;
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000c',false);
select 'S washer cannot save: ' || public.owner_save_catalog((select data from public.catalog))::text;
reset role;
select data cat from public.catalog \gset
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000a',false);
select 'S save new price: ' || (public.owner_save_catalog(jsonb_set(:'cat'::jsonb, '{pkg,car,1,p,hatch}', '549'))#>>'{data,pkg,car,1,p,hatch}');
select 'S add a 4th wash: ' || jsonb_array_length(public.owner_save_catalog(jsonb_set(:'cat'::jsonb, '{pkg,car}', (:'cat'::jsonb #> '{pkg,car}') || jsonb_build_array(jsonb_build_object('n','Showroom','d','x','t','~2 HRS','i',jsonb_build_array('Everything in Deep refresh'),'p',jsonb_build_object('hatch',1999,'sedan',2199,'suv',2499)))))#>'{data,pkg,car}');
select 'S no name refused: ' || public.owner_save_catalog(jsonb_set(:'cat'::jsonb, '{pkg,car,0,n}', '""'))::text;
select 'S missing price refused: ' || public.owner_save_catalog(jsonb_set(:'cat'::jsonb, '{pkg,bike,0,p}', '{}'))::text;
select 'S no washes refused: ' || public.owner_save_catalog(jsonb_set(:'cat'::jsonb, '{pkg,bike}', '[]'))::text;
select 'S duplicate code refused: ' || public.owner_save_catalog(jsonb_set(:'cat'::jsonb, '{addons,bike,0,id}', '"vac"'))::text;
select 'S plan washes refused: ' || public.owner_save_catalog(jsonb_set(:'cat'::jsonb, '{plans,car,0,w}', '0'))::text;
select 'S info: ' || (public.owner_catalog_info()->>'by');
reset role;
-- monthly salary
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000a',false);
select 'M set monthly: ' || (public.owner_set_pay('00000000-0000-0000-0000-00000000000c', 'monthly', 0, 0, 12000)->>'ok');
select 'M bad type: ' || public.owner_set_pay('00000000-0000-0000-0000-00000000000c', 'daily', 0, 0, 1)::text;
select 'M owed this month: ' || (select (x->>'pay_type') || ' owed ' || (x->>'owed') || ' months ' || jsonb_array_length(x->'months') from jsonb_array_elements(public.owner_pay(:'m0', :'d0')) x where x->>'id'='00000000-0000-0000-0000-00000000000c');
select 'M pay out: ' || (public.owner_pay_out('00000000-0000-0000-0000-00000000000c', :'m0', :'d0', '')->>'amount');
select 'M twice refused: ' || public.owner_pay_out('00000000-0000-0000-0000-00000000000c', :'m0', :'d0', '')::text;
select 'M now owed: ' || (select x->>'owed' from jsonb_array_elements(public.owner_pay(:'m0', :'d0')) x where x->>'id'='00000000-0000-0000-0000-00000000000c');
reset role;
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000c',false);
select 'M washer sees: ' || (select (x->>'pay_type') || ' ' || (x->>'month_earned') || ' paid=' || (x->>'month_paid') from (select public.staff_my_pay() x) z);
reset role;
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000a',false);
select 'M back to per wash: ' || (public.owner_set_pay('00000000-0000-0000-0000-00000000000c', 'per_wash', 80, 40, 0)->>'ok');
-- ledger
select 'L ledger rows: ' || (select count(*) || ' types ' || string_agg(distinct split_part(x->>'type', ' ·', 1), ', ') from jsonb_array_elements(public.owner_ledger(:'d0'::date - 40, :'d0')) x);
select 'L no names or phones: ' || not (public.owner_ledger(:'d0'::date - 40, :'d0')::text ~ '98222|Pay One|Cash One');
reset role;
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000c',false);
select 'L washer refused: ' || public.owner_ledger(:'d0', :'d0')::text;
reset role;
-- photos for the track page
insert into public.job_photos (booking_id, path, kind) values ('VB-261107-PAY1', 'VB-261107-PAY1/after-1.jpg', 'after');
select track_key tk from public.bookings where id = 'VB-261107-PAY1' \gset
select 'T photos count: ' || (public.track_view(b)->>'photos') from public.bookings b where id = 'VB-261107-PAY1';
select 'T photo paths: ' || public.track_photos('VB-261107-PAY1', :'tk')::text;
select 'T wrong key: ' || public.track_photos('VB-261107-PAY1', 'x')::text;
set role anon;
select 'T anon cannot list photos: ' || public.track_photos('VB-261107-PAY1', :'tk')::text;
reset role;

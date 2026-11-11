-- Run after test.sql, test_0003…test_0009 on the same database (owner ...0a, washer ...0c).
\set ON_ERROR_STOP 0
\pset tuples_only on
\pset format unaligned
select public.ist_today() d0 \gset
insert into public.bookings (id,vehicle_type,vehicle,package,wash_date,slot,address,name,phone,subtotal,total,source,status,assigned_to) values
 ('VB-261108-LEFT','car','Car · Sedan','Essential wash',:'d0'::date-3,'8–10 AM','x','Left Over','9822200601',349,349,'phone','confirmed','00000000-0000-0000-0000-00000000000c'),
 ('VB-261108-LDON','car','Car · Sedan','Essential wash',:'d0'::date-3,'8–10 AM','x','Was Done','9822200602',349,349,'phone','done',null),
 ('VB-260801-OLD1','car','Car · Sedan','Essential wash',:'d0'::date-90,'8–10 AM','x','Too Old','9822200603',349,349,'phone','confirmed',null);
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000c',false);
select 'L washer today leftover: ' || (select string_agg(x->>'id', ',') from jsonb_array_elements(public.staff_day(:'d0')->'leftover') x where x->>'id' like 'VB-26%-L%' or x->>'id' like 'VB-260801%');
select 'L other day has none: ' || jsonb_array_length(public.staff_day((:'d0'::date+1))->'leftover');
select 'L washer cannot read home: ' || public.owner_attention()::text;
reset role;
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000a',false);
select 'L home overdue has it: ' || ((public.owner_attention()->'overdue')::text like '%VB-261108-LEFT%')::text;
select 'L home skips done and 90-day-old: ' || not ((public.owner_attention()->'overdue')::text ~ 'LDON|OLD1');
select 'L washed: ' || (public.staff_update('VB-261108-LEFT','done')->>'status');
select 'L then gone from Home: ' || not ((public.owner_attention()->'overdue')::text like '%VB-261108-LEFT%');
reset role;

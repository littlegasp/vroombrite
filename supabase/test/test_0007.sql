-- Run after test.sql, test_0003…test_0006 on the same database (owner ...0a, washer ...0c).
\set ON_ERROR_STOP 0
\pset tuples_only on
\pset format unaligned
select public.ist_today() d0, public.ist_today()+1 d1, public.ist_today()-40 dm40 \gset
insert into public.society_leads (society, contact_name, phone, cars) values ('Green Acres', 'Mr Rao', '9822200201', 3) returning id as lead \gset
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000c',false);
select 'C washer refused: ' || public.owner_contracts()::text;
reset role;
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000a',false);
-- validation
select 'C no weekday: ' || public.owner_save_contract('{"kind":"plan","name":"A","phone":"9822200200","weekdays":[],"slot":"8–10 AM","washes":4}')::text;
select 'C bad phone: ' || public.owner_save_contract('{"kind":"plan","name":"A","phone":"123","weekdays":[1],"slot":"8–10 AM","washes":4}')::text;
select 'C plan needs washes: ' || public.owner_save_contract('{"kind":"plan","name":"A","phone":"9822200200","weekdays":[1],"slot":"8–10 AM"}')::text;
-- a plan: 8 washes on Mon + Thu, from today
select (public.owner_save_contract(jsonb_build_object('kind','plan','name','Plan Person','phone','98222 00200','address','Flat 1','area','Powai','pin','400076',
  'vehicle','Car · Sedan','plate','mh02ab1','plan_name','Stay Sharp','package','Essential wash','washes',8,'weekdays',jsonb_build_array(1,4,4),'slot','8–10 AM',
  'price',999,'start_date',:'d0','assigned_to','00000000-0000-0000-0000-00000000000c'))->>'id') pid \gset
select 'P saved: ' || (select x->>'plate' || ' ' || (x->>'weekdays') || ' renew=' || (x->>'renew') from (select public.owner_contract(:pid) x) z);
select 'P month: ' || (select (x->>'created') || ' visits' from (select public.owner_contract_period(:pid, null) x) z);
reset role;
select 'P all on Mon/Thu: ' || (select bool_and(extract(isodow from wash_date) in (1,4))::text || ' covered=' || bool_and(b.payment='covered')::text || ' total=' || sum(total)
                                 from public.bookings b join public.contract_periods p on p.id=b.period_id where p.contract_id=:pid);
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000a',false);
select 'P overlap refused: ' || public.owner_contract_period(:pid, :'d1')::text;
reset role;
select 'P visit json: ' || (select (j->'plan'->>'name') || ' ' || (j->'plan'->>'n') || '/' || (j->'plan'->>'of') || ' left ' || (j->'plan'->>'left') || ' pay ' || (j->'plan'->>'pay')
                            from (select public.booking_json(b) j from public.bookings b join public.contract_periods p on p.id=b.period_id where p.contract_id=:pid order by b.wash_date limit 1) z);
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000a',false);
reset role;
select (select b.id from public.bookings b join public.contract_periods p on p.id=b.period_id where p.contract_id=:pid order by wash_date limit 1) h1 \gset
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000a',false);
select 'P history: ' || (select x->>'detail' from jsonb_array_elements(public.booking_history(:'h1')) x limit 1);
reset role;
select (select b.id from public.bookings b join public.contract_periods p on p.id=b.period_id where p.contract_id=:pid order by wash_date limit 1) v1,
       (select id from public.contract_periods where contract_id=:pid) per \gset
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000c',false);
select 'P washer done: ' || (public.staff_update(:'v1','done')->>'status');
select 'P covered stays: ' || (public.staff_update(:'v1','paid_cash')->>'payment');
reset role;
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000a',false);
select 'P left after one: ' || (select (x->'cur'->>'done') || ' done, ' || (x->'cur'->>'left') || ' left, due ' || (x->>'due') from (select public.owner_contract(:pid) x) z);
select 'P pay: ' || (select (x->'cur'->>'payment') || ' due ' || (x->>'due') from (select public.owner_pay_period(:per, 'paid_upi') x) z);
select 'P analytics collected: ' || (public.owner_analytics(:'d0', :'d0')->'cur'->>'plans_collected');
select 'P make-up: ' || (public.owner_add_visit(:per, :'d1', '5–8 PM')->>'slot');
-- society from a lead
select (public.owner_save_contract(jsonb_build_object('kind','society','name','Green Acres','contact_name','Mr Rao','phone','9822200201','area','Thane','lead_id',:lead,
  'plan_name','Society contract','package','Society wash','weekdays',jsonb_build_array(1,2,3,4,5,6,7),'slot','6–8 AM','price',12000,'start_date',:'d0',
  'vehicles',jsonb_build_array(jsonb_build_object('flat','A-101','vehicle','Swift','plate','mh04 x 1'),jsonb_build_object('flat','A-102','vehicle','Activa','plate',''),jsonb_build_object('flat','','vehicle','','plate',''))))->>'id') sid \gset
select 'S vehicles: ' || (public.owner_contract(:sid)->'vehicle_list')::text;
select 'S month: ' || (public.owner_contract_period(:sid, null)->>'created');
reset role;
select 'S visit: ' || (select vehicle || ' items=' || items::text from public.bookings b join public.contract_periods p on p.id=b.period_id where p.contract_id=:sid order by wash_date limit 1);
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000a',false);
reset role;
select (select b.id from public.bookings b join public.contract_periods p on p.id=b.period_id where p.contract_id=:sid order by wash_date limit 1) s1 \gset
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000a',false);
select 'S many ticks ok: ' || jsonb_array_length(public.staff_check(:'s1', 'A-101 · Swift · MH04 X 1', true)->'checks');
select 'S list: ' || (select string_agg((x->>'kind') || ':' || (x->>'name'), ', ') from jsonb_array_elements(public.owner_contracts()) x);
-- end / delete
select 'E end plan: ' || (public.owner_end_contract(:pid, false)->>'removed') || ' upcoming removed';
select 'E ended month refused: ' || public.owner_contract_period(:pid, null)::text;
select 'E delete society: ' || (public.owner_end_contract(:sid, true)->>'ok');
reset role;
select 'E lead won: ' || (select status from public.society_leads where id = :lead);
select 'E done visit kept: ' || (select count(*) from public.bookings where id = :'v1')::text || ' period kept: ' || (select count(*) from public.contract_periods where contract_id = :pid);
select 'E society gone: ' || (select count(*) from public.contracts where id = :sid) || ' visits left: ' || (select count(*) from public.bookings where name = 'Green Acres');

-- Run after test.sql, test_0003…test_0007 on the same database (owner ...0a, washer ...0c).
\set ON_ERROR_STOP 0
\pset tuples_only on
\pset format unaligned
select public.ist_today() d0, public.ist_today()-30 dm30 \gset
insert into public.bookings (id,vehicle_type,vehicle,package,wash_date,slot,address,name,phone,subtotal,total,source,status,done_at,assigned_to,payment,paid_at) values
 ('VB-261107-PAY1','car','Car · Sedan','Essential wash',:'d0','8–10 AM','x','Pay One','9822200401',349,349,'phone','done',now(),'00000000-0000-0000-0000-00000000000c','paid_upi',now()),
 ('VB-261107-PAY2','bike','Bike / Scooter','Quick bike wash',:'d0','8–10 AM','x','Pay Two','9822200402',149,149,'phone','done',now(),'00000000-0000-0000-0000-00000000000c','pending',null),
 ('VB-261107-PAY3','car','Car · SUV','Essential wash',:'d0','2–5 PM','x','Pay Three','9822200403',399,399,'phone','confirmed',null,'00000000-0000-0000-0000-00000000000c','pending',null);
insert into public.bookings (id,vehicle_type,vehicle,package,wash_date,slot,address,name,phone,subtotal,total,source,status,done_at,assigned_to,payment,items,checks) values
 ('VB-261107-SOC1','car','Society · 3 vehicles','Society wash',:'d0','6–8 AM','x','Soc','9822200404',0,0,'society','done',now(),'00000000-0000-0000-0000-00000000000c','covered','["a","b","c"]','["a","b"]');
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000c',false);
select 'W washer cannot see pay: ' || public.owner_pay(:'d0', :'d0')::text;
reset role;
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000a',false);
select 'W rates: ' || (public.owner_set_rates('00000000-0000-0000-0000-00000000000c', 80, 40)->>'ok');
select 'W pay: ' || (select (x->>'washes') || ' washes, earned ' || (x->>'earned') || ', owed ' || (x->>'owed') from jsonb_array_elements(public.owner_pay(:'d0', :'d0')) x where x->>'id'='00000000-0000-0000-0000-00000000000c');
select 'W pay out: ' || (public.owner_pay_out('00000000-0000-0000-0000-00000000000c', :'d0', :'d0', 'Cash')->>'amount');
select 'W nothing left: ' || public.owner_pay_out('00000000-0000-0000-0000-00000000000c', :'d0', :'d0', '')::text;
reset role;
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000c',false);
select 'W my pay: ' || (select (x->>'month_washes') || ' washes, ' || (x->>'month_earned') || ' earned, owed ' || (x->>'owed') || ', payouts ' || jsonb_array_length(x->'payouts')) from (select public.staff_my_pay() x) z;
-- expenses
select 'E add: ' || (public.staff_add_expense('{"category":"fuel","amount":250,"note":"Petrol","photo":"bills/k3x9-ab12.jpg"}')->>'status');
select 'E bad photo: ' || public.staff_add_expense('{"category":"fuel","amount":250,"photo":"../x.jpg"}')::text;
select 'E future refused: ' || public.staff_add_expense(jsonb_build_object('category','fuel','amount',10,'day',(:'d0'::date+1)))::text;
select 'E washer sees own: ' || jsonb_array_length(public.staff_expenses());
select 'E washer cannot approve: ' || public.owner_review_expense(1, 'approved')::text;
reset role;
select (select id from public.expenses order by id desc limit 1) ex \gset
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000a',false);
select 'E owner add is approved: ' || (public.staff_add_expense('{"category":"supplies","amount":500,"note":"Shampoo"}')->>'status');
select 'E approve: ' || (public.owner_review_expense(:ex, 'approved')->>'status');
select 'E analytics costs: ' || (select (x->>'expenses') || ' expenses, ' || (x->>'wages') || ' wages' from (select public.owner_analytics(:'d0', :'d0')->'cur' x) z);
reset role;
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000c',false);
select 'E washer cannot delete approved: ' || public.staff_delete_expense(:ex)::text;
-- supplies
select 'S list: ' || jsonb_array_length(public.staff_supplies());
reset role;
select (select id from public.supplies where name='Car shampoo') sh \gset
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000a',false);
select 'S owner set: ' || (select (x->>'qty') || '/' || (x->>'low') || ' low=' || (x->>'is_low') from jsonb_array_elements(public.owner_save_supplies(jsonb_build_array(jsonb_build_object('id',:sh,'name','Car shampoo','unit','litre','qty',3,'low',2), jsonb_build_object('name','Pressure washer nozzle','unit','pcs','qty',1,'low',0)))) x where x->>'name'='Car shampoo');
reset role;
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000c',false);
select 'S washer used: ' || (select (x->>'qty') || ' low=' || (x->>'is_low') from jsonb_array_elements(public.staff_use_supply(:sh, -1.5)) x where x->>'name'='Car shampoo');
select 'S washer cannot edit list: ' || public.owner_save_supplies('[]')::text;
-- receipt
select 'R unpaid refused: ' || public.staff_receipt('VB-261107-PAY2')::text;
select (public.staff_receipt('VB-261107-PAY1')->>'key') rk \gset
select 'R same key again: ' || ((public.staff_receipt('VB-261107-PAY1')->>'key') = :'rk')::text;
reset role;
set role anon;
select 'R public: ' || (select (x->>'name') || ' ' || (x->>'total') || ' ' || (x->>'payment') || ' phone=' || coalesce(x->>'phone','none') from (select public.public_receipt('VB-261107-PAY1', :'rk') x) z);
select 'R wrong key: ' || coalesce(public.public_receipt('VB-261107-PAY1', 'nope')::text, 'null');
select 'R anon cannot cancel: ' || public.staff_cancel('VB-261107-PAY3', 'x')::text;
reset role;
-- cancel with reason
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000c',false);
select 'C cancel: ' || (select (x->>'status') || ' / ' || (x->>'cancel_reason') from (select public.staff_cancel('VB-261107-PAY3', 'Rain') x) z);
reset role;
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000a',false);
select 'C reasons: ' || public.owner_cancel_reasons(:'dm30', :'d0')::text;
-- push
select 'P subscribe: ' || (public.staff_push_subscribe('{"endpoint":"https://push.example/abc","p256dh":"k","auth":"a","device":"iPhone"}')->>'devices');
select 'P bad sub: ' || public.staff_push_subscribe('{"endpoint":"http://x","p256dh":"k","auth":"a"}')::text;
select 'P user cannot read keys: ' || public.push_keys()::text;
select 'P user cannot run hook: ' || public.push_hook('VB-261107-PAY1', 'x')::text;
reset role;
select 'P hook wrong secret: ' || coalesce(public.push_hook('VB-261107-PAY1', 'nope')::text, 'null');
select 'P hook: ' || (select (x->'booking'->>'name') || ' subs=' || jsonb_array_length(x->'subs') from (select public.push_hook('VB-261107-PAY1', (select hook_secret from public.push_config)) x) z);
select 'P save keys once: ' || (public.push_save_keys('PUB1','PRIV1')->>'public_key') || ' ' || (public.push_save_keys('PUB2','PRIV2')->>'public_key');
select 'W undo payout: ' || (select count(*) from public.bookings where payout_id is not null)::text;

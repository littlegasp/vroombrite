-- Run after test.sql on the same database (needs its owner/washer and bookings).
\set ON_ERROR_STOP 0
\pset tuples_only on
\pset format unaligned
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000b',false);
select 'U washer settings templates: ' || jsonb_array_length(public.staff_settings()->'templates') || ' team ' || jsonb_array_length(public.staff_settings()->'team');
select 'U washer add booking (self-assigned): ' || (public.staff_add_booking('{"name":"Walk In","phone":"9811122233","vehicle":"Car · Sedan","package":"Essential wash","slot":"8–10 AM","date":"2026-12-01","address":"Shop 4","subtotal":349,"discount":49,"discount_reason":"Regular","source":"walk_in"}')->>'assigned_name');
select 'U washer edit price ignored: ' || (public.staff_edit_booking('VB-261106-AAAA','{"subtotal":1,"notes":"Gate 2"}')->>'total') ;
select 'U washer log call: ' || public.staff_log('VB-261106-AAAA','call','No answer')::text;
select 'U washer history: ' || (select string_agg(x->>'kind', ',') from jsonb_array_elements(public.booking_history('VB-261106-AAAA')) x);
select 'U washer cannot assign: ' || public.owner_assign('VB-261106-AAAA', null)::text;
select 'U washer cannot delete: ' || public.owner_delete_booking('VB-261106-AAAA')::text;
select 'U washer no audit: ' || public.owner_audit(10)::text;
select 'U washer cannot read events table: ' || (select count(*) from public.booking_events)::text;
select 'U washer history has note+call: ' || (select string_agg(x->>'kind', ',') from jsonb_array_elements(public.booking_history('VB-261106-AAAA')) x);
reset role;
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000a',false);
select 'U owner assign: ' || (public.owner_assign('VB-261106-AAAA','00000000-0000-0000-0000-00000000000b')->>'assigned_name');
select 'U owner reschedule + price: ' || (select (r->>'wash_date') || ' ' || (r->>'slot') || ' ₹' || (r->>'total') from (select public.staff_edit_booking('VB-261106-AAAA','{"date":"2026-12-05","slot":"5–8 PM","subtotal":599,"discount":100,"discount_reason":"Loyal"}') r) z);
select 'U edit history: ' || (public.booking_history('VB-261106-AAAA')->0->>'detail');
select 'U customers: ' || jsonb_array_length(public.owner_customers('',100)) || ' search ravi ' || jsonb_array_length(public.owner_customers('ravi',100));
select 'U customer bookings: ' || jsonb_array_length(public.owner_customer('9876500001'));
select 'U templates save: ' || public.owner_save_templates('[{"key":"onway","body":"Coming in 10 min, {first_name}!"}]')::text || ' ' || (select x->>'body' from jsonb_array_elements(public.staff_settings()->'templates') x where x->>'key'='onway');
select 'U empty template refused: ' || public.owner_save_templates('[{"key":"onway","body":"  "}]')::text;
select 'U notice: ' || public.owner_set_notice('Rain today, carry covers')::text || ' ' || (public.staff_settings()->'notice'->>'body');
select 'U offer new: ' || (select string_agg(x->>'code' || '=' || (x->>'amount'), ',') from jsonb_array_elements(public.owner_save_offer('{"code":"diwali100","amount":100,"min_order":499,"first_wash_only":false}')) x);
select 'U offer used on site: ' || public.check_offer('9876500001','DIWALI100',null)::text;
select 'U bad offer code: ' || public.owner_save_offer('{"code":"x","amount":10}')::text;
select 'U costs: ' || (public.owner_save_costs('2026-11-17','{"ads":2000,"supplies":1500,"fuel":""}')->'costs')::text;
select 'U overview costs: ' || (public.owner_overview()->>'month_costs');
select 'U export: ' || jsonb_array_length(public.owner_export('2026-01-01','2026-12-31'));
select 'U role self demote refused: ' || public.owner_edit_staff('00000000-0000-0000-0000-00000000000a','Owner','','washer')::text;
select 'U edit washer: ' || public.owner_edit_staff('00000000-0000-0000-0000-00000000000b','Raju Patil','9820011122','washer')::text || ' ' || (select (x->>'name')||'/'||(x->>'phone') from jsonb_array_elements(public.owner_team()->'staff') x where x->>'id'='00000000-0000-0000-0000-00000000000b');
select 'U team jobs: ' || (select string_agg((x->>'name')||':'||(x->>'jobs'), ',') from jsonb_array_elements(public.owner_team()->'staff') x);
select 'U prepare delete: ' || public.owner_prepare_delete('00000000-0000-0000-0000-00000000000b')::text;
select 'U self delete refused: ' || public.owner_prepare_delete('00000000-0000-0000-0000-00000000000a')::text;
select 'U delete booking: ' || public.owner_delete_booking('VB-261106-DDDD')::text;
select 'U audit: ' || (select string_agg(x->>'action', ',') from jsonb_array_elements(public.owner_audit(50)) x);
reset role;
select 'U deleted booking left no events: ' || (select count(*) from public.booking_events where booking_id='VB-261106-DDDD');
select 'U audit has no customer names: ' || (select count(*) from public.audit_log where detail ilike '%ravi%' or detail ilike '%9876%' or detail ilike '%priya%');
set role anon; select set_config('request.jwt.claim.sub','',false);
select 'U anon cannot add booking: ' || public.staff_add_booking('{}')::text;
select 'U anon cannot read templates: ' || public.staff_settings()::text;
reset role;
delete from auth.users where id='00000000-0000-0000-0000-00000000000b';
select 'U deleted login gone, bookings kept: ' || (select count(*) from public.staff where id='00000000-0000-0000-0000-00000000000b') || ' / ' || (select count(*) from public.bookings);

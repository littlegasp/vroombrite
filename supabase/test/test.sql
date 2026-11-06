\set ON_ERROR_STOP 0
\pset tuples_only on
\pset format unaligned
-- helpers to act as someone
create or replace function pg_temp.as_anon() returns void language plpgsql as $$ begin perform set_config('request.jwt.claim.sub','',false); end $$;
insert into auth.users (id,email) values ('00000000-0000-0000-0000-00000000000a','owner@vb.test'),('00000000-0000-0000-0000-00000000000b','washer@vb.test'),('00000000-0000-0000-0000-00000000000c','stranger@vb.test');
select 'T staff roles: ' || string_agg(email||'='||role||'/'||active, ', ' order by email) from public.staff;
-- ===== anon =====
set role anon;
select 'T anon booking select blocked: ' || (select count(*) from public.bookings)::text;
select 'T anon offer new: ' || public.check_offer('9811100001','welcome50',null)::text;
select 'T create A: ' || public.create_booking(('{"id":"VB-261106-AAAA","vehicle":"Car · Hatchback","package":"Foam & glow","addons":"None","date":"'||(current_date+1)||'","slot":"8–10 AM","address":"A-wing","area":"Powai","pin":"400076","name":"Ravi Kumar","phone":"9876500001","subtotal":499,"total":499,"payment":"After service"}')::jsonb)::text;
select 'T offer repeat: ' || public.check_offer('9876500001','WELCOME50',null)::text;
select 'T create B welcome below min: ' || public.create_booking(('{"id":"VB-261106-BBBB","vehicle":"Bike / Scooter","package":"Quick bike wash","date":"'||(current_date+1)||'","slot":"6–8 AM","address":"B-wing","area":"Powai","pin":"400076","name":"Neha","phone":"9811100001","subtotal":149,"discount":50,"total":99,"promo":"WELCOME50"}')::jsonb)::text;
select 'T create C referral ok: ' || public.create_booking(('{"id":"VB-261106-CCCC","vehicle":"Car · SUV / MUV","package":"Deep refresh","date":"'||(current_date+1)||'","slot":"10 AM–1 PM","address":"C-wing","area":"Powai","pin":"400076","name":"Amit","phone":"9811100002","subtotal":1399,"discount":50,"total":1349,"promo":"Referral","ref":"9876500001","payment":"Online UPI · pending"}')::jsonb)::text;
select 'T forged discount without code: ' || public.create_booking(('{"id":"VB-261106-DDDD","vehicle":"Car · Sedan","package":"Essential wash","date":"'||(current_date+1)||'","slot":"5–8 PM","address":"D","name":"X","phone":"9811100003","subtotal":349,"discount":300,"total":49,"promo":"FREE"}')::jsonb)::text;
select 'T bad phone: ' || public.create_booking(('{"id":"VB-261106-EEEE","vehicle":"Car","package":"x","date":"'||(current_date+1)||'","slot":"x","address":"x","name":"x","phone":"12345","subtotal":1,"total":1}')::jsonb)::text;
select 'T anon staff fn blocked: ' || public.staff_day(current_date)::text;
select 'T anon overview blocked: ' || public.owner_overview()::text;
select 'T review: ' || public.submit_review('{"id":"VB-261106-AAAA","rating":5,"text":"Great"}')::text;
select 'T public reviews (none approved): ' || public.public_reviews()::text;
select 'T society: ' || public.submit_society_lead('{"society":"Lake Homes","name":"Iyer","phone":"9811100009","cars":"18","bikes":""}')::text;
select 'T enquiry: ' || public.submit_enquiry('{"name":"Q","phone":"9811100010","message":"Hi"}')::text;
select 'T sheet copy wrong key: ' || public.sheet_copy('nope')::text;
reset role;
-- ===== stranger (signed up, inactive) =====
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000c',false);
select 'T inactive staff blocked: ' || public.staff_day(current_date+1)::text;
select 'T inactive select bookings: ' || (select count(*) from public.bookings)::text;
-- ===== washer (inactive until owner activates) =====
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000a',false);
select 'T owner activates washer: ' || public.owner_set_staff('00000000-0000-0000-0000-00000000000b', true, 'Raju')::text;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000b',false);
select 'T washer me: ' || public.staff_me()::text;
select 'T washer day count: ' || jsonb_array_length(public.staff_day(current_date+1)->'jobs')::text || ' strip ' || jsonb_array_length(public.staff_day(current_date+1)->'strip');
select 'T washer select bookings (RLS): ' || (select count(*) from public.bookings)::text;
select 'T washer overview blocked: ' || public.owner_overview()::text;
do $$ begin update public.bookings set total = 1 where id='VB-261106-AAAA'; raise notice 'T washer direct update: ALLOWED (bad)'; exception when others then raise notice 'T washer direct update blocked: %', sqlerrm; end $$;
select 'T done C: ' || (public.staff_update('VB-261106-CCCC','done')->>'status');
select 'T paid C: ' || (public.staff_update('VB-261106-CCCC','paid_upi')->>'payment');
select 'T referrer credit visible on A: ' || (public.staff_update('VB-261106-AAAA','confirm')->>'credit');
select 'T use credit: ' || (public.staff_update('VB-261106-AAAA','use_credit')->>'credit');
select 'T search: ' || jsonb_array_length(public.staff_bookings('amit'))::text;
select 'T upcoming: ' || jsonb_array_length(public.staff_bookings(''))::text;
-- ===== owner =====
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000a',false);
select 'T overview: ' || (public.owner_overview() - 'last14' - 'packages' - 'areas')::text;
select 'T inbox counts: ' || jsonb_array_length(public.owner_inbox()->'leads') || ' leads, ' || jsonb_array_length(public.owner_inbox()->'reviews') || ' reviews';
select 'T approve review: ' || public.owner_set('review', (select (public.owner_inbox()->'reviews'->0->>'id')::bigint), 'approved')::text;
reset role;
set role anon; select 'T public reviews after approve: ' || public.public_reviews()::text; reset role;
-- due: move A into the past and mark done
update public.bookings set wash_date = current_date - 20, status='done' where id='VB-261106-AAAA';
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000a',false);
select 'T due: ' || public.owner_due(12)::text;
select 'T team key present: ' || (length(public.owner_team()->>'sheet_copy_key') > 20)::text;
reset role;
select set_config('vb.key',(select value from public.app_settings where key='sheet_copy_key'),false);
set role anon; select 'T sheet copy right key: ' || jsonb_array_length(public.sheet_copy(current_setting('vb.key'))->'bookings')::text; reset role;

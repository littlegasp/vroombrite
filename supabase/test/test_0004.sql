-- Run on a database with 0001–0004 and an owner ...0a / washer ...0b (see test.sql).
\set ON_ERROR_STOP 0
\pset tuples_only on
\pset format unaligned
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000b',false);
select 'V washer range: ' || jsonb_array_length(public.staff_range('2026-09-27','2026-11-13'));
select 'V washer attention blocked: ' || public.owner_attention()::text;
select 'V washer analytics blocked: ' || public.owner_analytics('2026-11-01','2026-11-06')::text;
select 'V range too long: ' || public.staff_range('2020-01-01','2026-01-01')::text;
reset role;
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000a',false);
select 'V attention: ' || (select jsonb_array_length(a->'unconfirmed') || ' unconfirmed, ' || jsonb_array_length(a->'unpaid') || ' unpaid, ' || (a->>'unassigned') || ' unassigned, due ' || (a->>'due') || ', recent ' || jsonb_array_length(a->'recent')) from (select public.owner_attention() a) x;
select 'V analytics cur: ' || (public.owner_analytics('2026-11-01','2026-11-30')->'cur')::text;
select 'V analytics prev: ' || (public.owner_analytics('2026-11-01','2026-11-30')->'prev'->>'collected');
select 'V series days: ' || jsonb_array_length(public.owner_analytics('2026-10-31','2026-11-06')->'series');
select 'V helper not callable: ' || public.range_numbers('2026-11-01','2026-11-06')::text;
reset role;

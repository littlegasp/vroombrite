-- 0002: small fixes after 0001. Safe to run more than once.
-- 1) visit count no longer counts the booking itself  2) staff names made from the email look tidy
create or replace function public.handle_new_staff() returns trigger
language plpgsql security definer set search_path = public as $$
declare first_one boolean := not exists (select 1 from public.staff);
begin
  insert into public.staff (id, name, email, role, active)
  values (new.id,
          coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''),
                   nullif(initcap(trim(regexp_replace(split_part(new.email, '@', 1), '[^A-Za-z]+', ' ', 'g'))), ''), 'Staff'),
          new.email,
          case when first_one then 'owner' else 'washer' end,
          first_one);
  return new;
end $$;

create or replace function public.booking_json(b public.bookings) returns jsonb
language sql stable security definer set search_path = public as $$
  select to_jsonb(b) - 'updated_by' || jsonb_build_object(
    'credit', coalesce((select sum(amount) from public.referral_credits
                        where referrer_phone = b.phone and status = 'available'), 0),
    'visits', (select count(*) from public.bookings x where x.phone = b.phone and x.status = 'done' and x.id <> b.id));
$$;
update public.staff set name = initcap(trim(regexp_replace(name, '[^A-Za-z]+', ' ', 'g'))) where name = lower(name) and name ~ '[a-z]';

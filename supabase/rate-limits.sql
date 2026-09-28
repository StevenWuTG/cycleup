-- Rate limits for posting listings and sending messages. Run once in the
-- Supabase SQL Editor, after editing.sql and messaging.sql. Safe to re-run.
--
-- Same shape as the report cap in reports.sql: a BEFORE INSERT trigger counts
-- the caller's own recent rows and refuses the insert past a threshold, with
-- a plain-language error the app already shows as-is (ListingForm and
-- Conversation.jsx both display err.message on a failed insert/RPC). Both
-- functions check auth.uid() rather than trusting the row's own user_id/
-- sender_id column, consistent with the rest of the schema.
--
-- Limits, adjust the numbers below to taste:
--   Listings: 20 new listings per hour per user (generous for someone
--   bulk-listing their shop; well below anything a real spammer would want).
--   Messages: 60 per hour per user (about one a minute -- comfortable for a
--   real back-and-forth, and it covers the first message of a new
--   conversation too, since start_conversation() just inserts a normal row
--   here and the trigger fires regardless of who/what performs the insert).

create or replace function public.check_listing_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from public.listings
       where user_id = auth.uid() and created_at > now() - interval '1 hour') >= 20 then
    raise exception 'You''re posting a lot right now. Please slow down and try again in a bit.';
  end if;
  return new;
end;
$$;

drop trigger if exists listings_rate_limit on public.listings;
create trigger listings_rate_limit
  before insert on public.listings
  for each row execute function public.check_listing_rate_limit();

create or replace function public.check_message_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from public.messages
       where sender_id = auth.uid() and created_at > now() - interval '1 hour') >= 60 then
    raise exception 'You''re sending messages quickly. Please slow down and try again in a bit.';
  end if;
  return new;
end;
$$;

drop trigger if exists messages_rate_limit on public.messages;
create trigger messages_rate_limit
  before insert on public.messages
  for each row execute function public.check_message_rate_limit();

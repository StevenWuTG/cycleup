-- Reports: people can flag a listing, a person, or a conversation. Run once in
-- the Supabase SQL Editor, after photos.sql. Safe to re-run.
--
-- Nobody can read or write this table from the app. Reports go in only through
-- submit_report() below, which enforces the rules; you read and update them in
-- the Supabase dashboard (Table Editor -> reports). See the queries at the end.

create table if not exists public.reports (
  id bigint generated always as identity primary key,
  reporter_id uuid not null references auth.users (id) on delete cascade,
  target_type text not null check (target_type in ('listing', 'user', 'conversation')),
  -- e.g. 'listing:12', 'user:<uuid>', 'conversation:5'; used to stop duplicates
  target_key text not null,
  -- These may become null if the thing reported is later deleted (a report must
  -- never block a deletion), so the snapshots below keep it understandable.
  listing_id bigint references public.listings (id) on delete set null,
  conversation_id bigint references public.conversations (id) on delete set null,
  reported_user_id uuid references auth.users (id) on delete set null,
  listing_title text,
  reported_username text,
  reason text not null check (reason in ('spam', 'prohibited', 'misleading', 'harassment', 'other')),
  details text check (details is null or char_length(details) <= 1000),
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

-- One open report per person per target.
create unique index if not exists reports_one_open_per_target
  on public.reports (reporter_id, target_key) where status = 'open';
create index if not exists reports_status_created_idx
  on public.reports (status, created_at desc);

-- Row-level security on with NO policies: the app cannot touch the table
-- directly. (The dashboard and this function's owner bypass it.)
alter table public.reports enable row level security;

create or replace function public.submit_report(
  p_reason text,
  p_details text default null,
  p_listing_id bigint default null,
  p_user_id uuid default null,
  p_conversation_id bigint default null
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := auth.uid();
  v_details text := nullif(btrim(coalesce(p_details, '')), '');
  v_type text;
  v_reported uuid;
  v_title text;
  v_listing public.listings%rowtype;
  v_conv public.conversations%rowtype;
  v_id bigint;
begin
  if v_me is null then
    raise exception 'Sign in to report something.';
  end if;
  if p_reason is null or p_reason not in ('spam', 'prohibited', 'misleading', 'harassment', 'other') then
    raise exception 'Choose a reason for your report.';
  end if;
  if v_details is not null and char_length(v_details) > 1000 then
    raise exception 'Please keep the details under 1000 characters.';
  end if;
  if num_nonnulls(p_listing_id, p_user_id, p_conversation_id) <> 1 then
    raise exception 'There is nothing to report.';
  end if;

  if p_listing_id is not null then
    v_type := 'listing';
    select * into v_listing from public.listings where id = p_listing_id;
    if not found then
      raise exception 'That listing no longer exists.';
    end if;
    if v_listing.user_id is null then
      raise exception 'This is a sample listing, so there is nobody to report.';
    end if;
    if v_listing.user_id = v_me then
      raise exception 'You can''t report your own listing.';
    end if;
    v_reported := v_listing.user_id;
    v_title := v_listing.title;

  elsif p_user_id is not null then
    v_type := 'user';
    if p_user_id = v_me then
      raise exception 'You can''t report yourself.';
    end if;
    if not exists (select 1 from public.profiles where id = p_user_id) then
      raise exception 'That person no longer exists.';
    end if;
    v_reported := p_user_id;

  else
    v_type := 'conversation';
    select * into v_conv from public.conversations where id = p_conversation_id;
    -- Same answer whether it doesn't exist or isn't yours, so ids can't be probed.
    if not found or v_me not in (v_conv.buyer_id, v_conv.seller_id) then
      raise exception 'That conversation isn''t available.';
    end if;
    v_reported := case when v_conv.buyer_id = v_me then v_conv.seller_id else v_conv.buyer_id end;
    v_title := v_conv.listing_title;
  end if;

  if (select count(*) from public.reports
       where reporter_id = v_me and created_at > now() - interval '1 hour') >= 10 then
    raise exception 'You''ve sent a lot of reports recently. Please try again later.';
  end if;

  begin
    insert into public.reports (
      reporter_id, target_type, target_key, listing_id, conversation_id, reported_user_id,
      listing_title, reported_username, reason, details
    )
    values (
      v_me, v_type,
      case v_type
        when 'listing' then 'listing:' || p_listing_id
        when 'user' then 'user:' || p_user_id
        else 'conversation:' || p_conversation_id
      end,
      p_listing_id, p_conversation_id, v_reported,
      v_title,
      (select username from public.profiles where id = v_reported),
      p_reason, v_details
    )
    returning id into v_id;
  exception when unique_violation then
    raise exception 'You''ve already reported this. We''ll take a look.';
  end;

  return v_id;
end;
$$;

revoke all on function public.submit_report(text, text, bigint, uuid, bigint) from public, anon;
grant execute on function public.submit_report(text, text, bigint, uuid, bigint) to authenticated;

-- ---------------------------------------------------------------------------
-- Handy queries for you, in the SQL Editor (not part of the migration):
--
--   -- open reports, newest first
--   select id, created_at, target_type, reason, reported_username, listing_title, details
--     from public.reports where status = 'open' order by created_at desc;
--
--   -- mark one as dealt with
--   update public.reports set status = 'resolved' where id = 1;   -- or 'dismissed'
--
--   -- read a reported conversation
--   select sender_id, body, created_at from public.messages
--    where conversation_id = <conversation_id> order by id;
--
--   -- take down a listing / remove a person (also removes their listings and photos' rows)
--   delete from public.listings where id = <listing_id>;
--   -- users: Authentication -> Users -> Delete user (then delete their Storage folder)

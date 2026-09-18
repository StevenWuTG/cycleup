-- Buyer <-> seller messaging. Run once in the Supabase SQL Editor, after
-- editing.sql. Safe to re-run.

-- One conversation per buyer per listing. If the listing is later deleted the
-- conversation survives (listing_id becomes null) so neither side loses the
-- history; listing_title is a snapshot for display.
create table if not exists public.conversations (
  id bigint generated always as identity primary key,
  listing_id bigint references public.listings (id) on delete set null,
  listing_title text not null,
  buyer_id uuid not null references auth.users (id) on delete cascade,
  seller_id uuid not null references auth.users (id) on delete cascade,
  last_message text,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  check (buyer_id <> seller_id),
  unique (listing_id, buyer_id)
);
create index if not exists conversations_buyer_idx on public.conversations (buyer_id);
create index if not exists conversations_seller_idx on public.conversations (seller_id);

create table if not exists public.messages (
  id bigint generated always as identity primary key,
  conversation_id bigint not null references public.conversations (id) on delete cascade,
  sender_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- ------------------------------------------------------------------ policies
-- Only the two participants can see a conversation or its messages.
-- Conversations have NO insert/update/delete policy: they are created only by
-- start_conversation() below, which enforces the business rules.
drop policy if exists "Participants read conversations" on public.conversations;
create policy "Participants read conversations"
  on public.conversations for select
  to authenticated
  using (auth.uid() in (buyer_id, seller_id));

drop policy if exists "Participants read messages" on public.messages;
create policy "Participants read messages"
  on public.messages for select
  to authenticated
  using (exists (
    select 1 from public.conversations c
    where c.id = conversation_id and auth.uid() in (c.buyer_id, c.seller_id)
  ));

-- Participants can send messages as themselves, unread. There is no update
-- policy, so a message's text can never be edited; read state changes only
-- through mark_conversation_read().
drop policy if exists "Participants send messages" on public.messages;
create policy "Participants send messages"
  on public.messages for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and read_at is null
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and auth.uid() in (c.buyer_id, c.seller_id)
    )
  );

-- ----------------------------------------------------------------- functions
-- Starts (or continues) the caller's conversation about a listing and sends
-- the first message, atomically.
create or replace function public.start_conversation(p_listing_id bigint, p_body text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_listing public.listings%rowtype;
  v_conv_id bigint;
  v_body text := btrim(p_body);
begin
  if auth.uid() is null then
    raise exception 'Sign in to send a message.';
  end if;
  if v_body is null or char_length(v_body) not between 1 and 2000 then
    raise exception 'Messages must be between 1 and 2000 characters.';
  end if;

  select * into v_listing from public.listings where id = p_listing_id;
  if not found then
    raise exception 'That listing no longer exists.';
  end if;
  if v_listing.user_id is null then
    raise exception 'This is a demo listing with no seller account to message.';
  end if;
  if v_listing.user_id = auth.uid() then
    raise exception 'You can''t message yourself about your own listing.';
  end if;

  insert into public.conversations (listing_id, listing_title, buyer_id, seller_id)
  values (v_listing.id, v_listing.title, auth.uid(), v_listing.user_id)
  on conflict (listing_id, buyer_id) do update set listing_title = excluded.listing_title
  returning id into v_conv_id;

  insert into public.messages (conversation_id, sender_id, body)
  values (v_conv_id, auth.uid(), v_body);

  return v_conv_id;
end;
$$;

-- Marks the other person's messages in a conversation as read.
create or replace function public.mark_conversation_read(p_conversation_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.messages m
     set read_at = now()
   where m.conversation_id = p_conversation_id
     and m.sender_id <> auth.uid()
     and m.read_at is null
     and exists (
       select 1 from public.conversations c
       where c.id = m.conversation_id and auth.uid() in (c.buyer_id, c.seller_id)
     );
end;
$$;

revoke all on function public.start_conversation(bigint, text) from public, anon;
revoke all on function public.mark_conversation_read(bigint) from public, anon;
grant execute on function public.start_conversation(bigint, text) to authenticated;
grant execute on function public.mark_conversation_read(bigint) to authenticated;

-- Keeps the inbox preview/ordering fields on the conversation current.
create or replace function public.touch_conversation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
     set last_message = left(new.body, 120), last_message_at = new.created_at
   where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists messages_touch_conversation on public.messages;
create trigger messages_touch_conversation
  after insert on public.messages
  for each row execute function public.touch_conversation();

-- ------------------------------------------------------------------ realtime
-- Lets the app receive new messages live (still filtered by the RLS above).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end;
$$;

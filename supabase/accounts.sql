-- User accounts. Run once in the Supabase SQL Editor, after schema.sql + seed.sql.
-- Safe to re-run.

-- ---------------------------------------------------------------- profiles
-- One row per auth user, created automatically at signup. Usernames are
-- lowercase so uniqueness checks are a plain equality (no LIKE wildcards).
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,20}$'),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Public read profiles" on public.profiles;
create policy "Public read profiles"
  on public.profiles for select
  using (true);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'username', ''), 'user_' || substr(new.id::text, 1, 8))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- listings
alter table public.listings
  add column if not exists user_id uuid references auth.users (id) on delete set null;

-- The owner and seller name come from the logged-in user, never from the
-- client, so nobody can post as someone else. Seed rows keep user_id null.
create or replace function public.set_listing_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.user_id := auth.uid();
  select username into new.seller from public.profiles where id = auth.uid();
  return new;
end;
$$;

drop trigger if exists listings_set_owner on public.listings;
create trigger listings_set_owner
  before insert on public.listings
  for each row execute function public.set_listing_owner();

drop policy if exists "Public insert listings" on public.listings;
drop policy if exists "Users insert own listings" on public.listings;
create policy "Users insert own listings"
  on public.listings for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Owners update listings" on public.listings;
create policy "Owners update listings"
  on public.listings for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Owners delete listings" on public.listings;
create policy "Owners delete listings"
  on public.listings for delete
  to authenticated
  using (user_id = auth.uid());

-- ----------------------------------------------------------------- storage
-- Photos are uploaded under a folder named after the uploader's user id.
drop policy if exists "Public upload listing images" on storage.objects;
drop policy if exists "Users upload own listing images" on storage.objects;
create policy "Users upload own listing images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users delete own listing images" on storage.objects;
create policy "Users delete own listing images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

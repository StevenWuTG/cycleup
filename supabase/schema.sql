-- CycleUp initial schema.
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

create table if not exists public.listings (
  id bigint generated always as identity primary key,
  title text not null,
  price numeric not null check (price >= 0),
  category text[] not null default '{}',
  seller text not null default 'You',
  location text,
  condition text,
  description text,
  story text,
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.listings enable row level security;

-- No auth/accounts yet (matches the current prototype, where every
-- seller is just "You") — anyone can read or create listings. Once
-- real user accounts exist, replace the insert policy with one scoped
-- to auth.uid() and add an update/delete policy scoped to the owner.
create policy "Public read listings"
  on public.listings for select
  using (true);

create policy "Public insert listings"
  on public.listings for insert
  with check (true);

-- Storage bucket for listing photos, publicly readable.
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

create policy "Public read listing images"
  on storage.objects for select
  using (bucket_id = 'listing-images');

create policy "Public upload listing images"
  on storage.objects for insert
  with check (bucket_id = 'listing-images');

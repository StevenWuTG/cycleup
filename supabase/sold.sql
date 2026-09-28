-- "Mark as sold" for listings. Run once in the Supabase SQL Editor, after
-- editing.sql. Safe to re-run.
--
-- No new policy or trigger is needed: owners can already update their own
-- listings (the "Owners update listings" policy from accounts.sql), and
-- lock_listing_identity() (editing.sql) only locks id/user_id/seller/
-- created_at, not this column.

alter table public.listings
  add column if not exists sold boolean not null default false;

create index if not exists listings_sold_idx on public.listings (sold);

-- Listing editing. Run once in the Supabase SQL Editor, after accounts.sql.
-- Safe to re-run.

-- Owners may update their own listings (policy from accounts.sql), but the
-- fields that identify the listing and its owner must never change. Without
-- this, an owner could rewrite `seller` to impersonate another user.
create or replace function public.lock_listing_identity()
returns trigger
language plpgsql
as $$
begin
  new.id := old.id;
  new.user_id := old.user_id;
  new.seller := old.seller;
  new.created_at := old.created_at;
  return new;
end;
$$;

drop trigger if exists listings_lock_identity on public.listings;
create trigger listings_lock_identity
  before update on public.listings
  for each row execute function public.lock_listing_identity();

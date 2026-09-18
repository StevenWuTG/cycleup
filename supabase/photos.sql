-- Multiple photos per listing. Run once in the Supabase SQL Editor, after
-- deletion.sql. Safe to re-run.
--
-- `image_urls` is an ordered list; the first entry is the cover photo. It
-- replaces the old single `image_url` column, whose value is copied across.

alter table public.listings
  add column if not exists image_urls text[] not null default '{}';

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'listings' and column_name = 'image_url'
  ) then
    update public.listings
       set image_urls = array[image_url]
     where image_url is not null and cardinality(image_urls) = 0;
    alter table public.listings drop column image_url;
  end if;
end;
$$;

-- At most five photos.
alter table public.listings drop constraint if exists listings_image_count;
alter table public.listings
  add constraint listings_image_count check (cardinality(image_urls) <= 5);

-- Every photo must be a public storage address on supabase.co, inside the
-- listing owner's own folder of our bucket, and nothing else. The whole URL is
-- matched (anchored at both ends) so text can't be smuggled into a query string:
-- without that, a seller could point a listing at their own server and use the
-- image as a tracking pixel to see who views it. (The built site's
-- Content-Security-Policy additionally limits images to this project's own
-- Supabase host.) Triggers on one table fire in name order, so
-- listings_set_owner has already filled in user_id when this runs on insert.
create or replace function public.validate_listing_images()
returns trigger
language plpgsql
as $$
declare
  photo text;
begin
  foreach photo in array new.image_urls loop
    if new.user_id is null
       or photo !~ (
         '^https://[a-z0-9-]+\.supabase\.co/storage/v1/object/public/listing-images/'
         || new.user_id::text || '/[A-Za-z0-9._-]+$'
       ) then
      raise exception 'Photos must be uploaded through CycleUp.';
    end if;
  end loop;
  return new;
end;
$$;

drop trigger if exists listings_validate_images on public.listings;
create trigger listings_validate_images
  before insert or update of image_urls on public.listings
  for each row execute function public.validate_listing_images();

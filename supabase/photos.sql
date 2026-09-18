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

-- Every photo must live in the listing owner's own folder of our storage
-- bucket. Without this a seller could point a listing at any web address on the
-- internet, and use it to see who views their listing. (Triggers on one table
-- fire in name order, so listings_set_owner has already filled in user_id when
-- this runs on insert.)
create or replace function public.validate_listing_images()
returns trigger
language plpgsql
as $$
declare
  photo text;
begin
  foreach photo in array new.image_urls loop
    if new.user_id is null
       or position('/storage/v1/object/public/listing-images/' || new.user_id::text || '/' in photo) = 0 then
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

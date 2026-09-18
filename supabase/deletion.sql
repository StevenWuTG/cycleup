-- Deleting a user should delete their listings. Run once in the Supabase SQL
-- Editor, after locations.sql. Safe to re-run.
--
-- Originally a deleted user's listings were kept with no owner ("on delete set
-- null"), leaving orphaned public listings nobody could edit or remove. The
-- privacy policy promises account deletion removes them, so cascade instead.
-- (Conversations and messages, and the profile, already cascade.)
--
-- NOTE: photos live in Storage, which is not removed by this. After deleting a
-- user, delete their folder (named with the user's id) from
-- Storage -> listing-images.
alter table public.listings drop constraint if exists listings_user_id_fkey;
alter table public.listings
  add constraint listings_user_id_fkey
  foreign key (user_id) references auth.users (id) on delete cascade;

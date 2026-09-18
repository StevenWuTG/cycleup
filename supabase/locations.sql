-- Listing coordinates, for sorting by distance. Run once in the Supabase SQL
-- Editor, after messaging.sql. Safe to re-run.

-- `location` stays as the human-readable label ("Portland, Oregon"); these two
-- columns hold the map position. Sellers pick a city from a search list, so
-- the coordinates are the city's centre, never a street address.
alter table public.listings
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

-- Either both are set and valid, or neither is. Both branches spell out their
-- null checks on purpose: a CHECK passes when it evaluates to NULL, so without
-- "is not null" a lone latitude (longitude null) would slip through.
alter table public.listings drop constraint if exists listings_coordinates_valid;
alter table public.listings add constraint listings_coordinates_valid check (
  (latitude is null and longitude is null)
  or (
    latitude is not null and longitude is not null
    and latitude between -90 and 90
    and longitude between -180 and 180
  )
);

-- Give the demo listings coordinates for their cities.
update public.listings l
   set latitude = c.lat, longitude = c.lng
  from (values
    ('Portland, OR',       45.5152, -122.6784),
    ('Austin, TX',         30.2672,  -97.7431),
    ('Brooklyn, NY',       40.6782,  -73.9442),
    ('Denver, CO',         39.7392, -104.9903),
    ('Seattle, WA',        47.6062, -122.3321),
    ('Chicago, IL',        41.8781,  -87.6298),
    ('San Francisco, CA',  37.7749, -122.4194),
    ('Nashville, TN',      36.1627,  -86.7816),
    ('Miami, FL',          25.7617,  -80.1918)
  ) as c(label, lat, lng)
 where l.user_id is null
   and l.location = c.label
   and l.latitude is null;

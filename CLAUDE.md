# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

CycleUp — a marketplace for upcycled/repurposed goods, connecting independent makers with eco-conscious buyers. React frontend backed directly by Supabase (Postgres + Auth + Storage); there is no custom server.

## Commands

- `npm run dev` — start the Vite dev server (HMR)
- `npm run build` — production build
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint

No test suite is configured.

## Setup

Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Supabase dashboard → Project Settings → API). `.env.local` is gitignored (`.env*` is ignored except `.env.example`); never commit real keys, and never put the `service_role` key in this frontend. Vite reads env at startup, so restart the dev server after changing it. The database is created by running [supabase/schema.sql](supabase/schema.sql) then [supabase/seed.sql](supabase/seed.sql), then [supabase/accounts.sql](supabase/accounts.sql) in the Supabase SQL Editor (in that order; accounts.sql is re-runnable) — there is no migration tooling. Auth is Supabase email + password. In the dashboard (Authentication), "Confirm email" can be turned off for local dev; if it's on, the confirmation link redirects to the project's Site URL, which must be set to the dev URL (`http://localhost:5173`).

## Architecture

- **Stack**: React 19 + Vite + React Router v7 (client-side routing, `BrowserRouter`) + Tailwind CSS v4 (via `@tailwindcss/vite`, no `tailwind.config.js` — v4 is CSS-first) + `lucide-react` for icons.
- **Routing** lives in [src/App.jsx](src/App.jsx): `/`, `/marketplace`, `/post` (wrapped in `RequireAuth`), `/item/:id`, `/login`, `/signup` (both render `pages/Auth.jsx` with a `mode` prop), under a persistent `Navbar`. Provider order matters: `AuthProvider` outside `ListingsProvider`, because the listings provider reads the current user. `vite.config.js` sets `historyApiFallback: true` so client-side routes work on refresh in dev.
- **Listings state**: [src/context/listings-context.js](src/context/listings-context.js) defines `ListingsContext` and `useListings()` (`{ listings, loading, error, addListing, deleteListing }`); [src/context/ListingsContext.jsx](src/context/ListingsContext.jsx) holds the `ListingsProvider`. Context hooks and providers are split into separate files throughout (also `auth-context.js` / `AuthContext.jsx`) only because `react-refresh/only-export-components` forbids exporting a component and a hook from one file. The provider fetches the whole `listings` table once on mount (newest id first) — pages read from that in-memory array, so `ItemDetail` looks items up locally rather than querying by id, and a direct load of `/item/:id` must wait on `loading`. `addListing({ imageFile, ...fields })` uploads the optional photo to the public `listing-images` bucket under a `<user id>/` folder, inserts the row, prepends it to state, and throws on failure. `deleteListing` treats an empty delete result as "not yours" (RLS filters silently) and removes the photo best-effort. The Supabase client is in [src/lib/supabaseClient.js](src/lib/supabaseClient.js), which throws at import if the env vars are missing.
- **Data shape**: a `listings` row has `id` (identity, higher = newer — `Marketplace`'s "Newest" sort relies on this), `title`, `price`, `category[]`, `seller`, `user_id`, `location`, `condition`, `description`, `story`, `image_url`, `created_at`. One photo per listing. The category taxonomy (`categories`) and badge colors (`tagColors`) are static in [src/data/categories.js](src/data/categories.js); categories are stored as plain text, not a table, so adding one is a code change only. Seed rows have `user_id` null, so no one can edit or delete them.
- **Marketplace filtering** ([src/pages/Marketplace.jsx](src/pages/Marketplace.jsx)) is done client-side in-component: search/category/sort state filters `useListings().listings` directly — there's no separate derived-state hook.
- **Post Item** ([src/pages/PostItem.jsx](src/pages/PostItem.jsx)) validates client-side (photo must be an image ≤ 5MB), awaits `addListing`, and shows a success screen with a "View Listing" link; on failure it keeps the form and shows the error. It sends no `seller` or `user_id` — see Auth.
- **Design language**: no Tailwind config — colors are hardcoded hex values inline via arbitrary-value classes (e.g. `bg-[#1b4332]`, `text-[#52b788]`) rather than theme tokens. The palette is forest green / cream, with `'Fraunces'` (serif, Google Fonts, loaded in [index.html](index.html)) for headings and `'Inter'` for body text, both applied via inline `style={{ fontFamily }}` rather than Tailwind font classes. Keep new UI consistent with these same literal color values and font-family pattern unless doing a deliberate design pass.
- **Listing images**: [src/components/ListingImage.jsx](src/components/ListingImage.jsx) renders the uploaded `image_url` if present, otherwise falls back to [ImagePlaceholder](src/components/ImagePlaceholder.jsx) (deterministic gradient + initials keyed off `id`). Both take a `className` for sizing; used by `ListingCard` (grid) and `ItemDetail` (hero).
- **Auth & security model**: [src/context/AuthContext.jsx](src/context/AuthContext.jsx) wraps Supabase Auth (`user`, `username`, `loading`, `signUp`, `signIn`, `signOut`); the username is read from the `profiles` table (created by a trigger on `auth.users` from signup metadata, or a generated `user_xxxxxxxx` name for users made in the Supabase dashboard) so the UI always matches what the database stamps on listings. Usernames are lowercase `[a-z0-9_]{3,20}` so uniqueness is a plain equality check. Ownership is enforced in the database, not the client: a `BEFORE INSERT` trigger on `listings` overwrites `user_id` (from `auth.uid()`) and `seller` (from the profile), so a client can't post as someone else. RLS: anyone can read listings/profiles/images; only signed-in users can insert their own listings; only owners can update/delete them (no update UI yet); storage writes are limited to the uploader's own folder. Reading is public, so the anon key in the frontend is safe — never use the `service_role` key here.

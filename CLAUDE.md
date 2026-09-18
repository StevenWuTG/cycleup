# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

CycleUp — a marketplace for upcycled/repurposed goods, connecting independent makers with eco-conscious buyers. React frontend backed directly by Supabase (Postgres + Storage); there is no custom server and no user auth yet.

## Commands

- `npm run dev` — start the Vite dev server (HMR)
- `npm run build` — production build
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint

No test suite is configured.

## Setup

Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Supabase dashboard → Project Settings → API). `.env.local` is gitignored (`.env*` is ignored except `.env.example`); never commit real keys, and never put the `service_role` key in this frontend. Vite reads env at startup, so restart the dev server after changing it. The database is created by running [supabase/schema.sql](supabase/schema.sql) then [supabase/seed.sql](supabase/seed.sql) in the Supabase SQL Editor — there is no migration tooling.

## Architecture

- **Stack**: React 19 + Vite + React Router v7 (client-side routing, `BrowserRouter`) + Tailwind CSS v4 (via `@tailwindcss/vite`, no `tailwind.config.js` — v4 is CSS-first) + `lucide-react` for icons.
- **Routing** lives in [src/App.jsx](src/App.jsx): routes `/`, `/marketplace`, `/post`, and `/item/:id` mapped to `src/pages/*`, with a persistent `Navbar` above the `Routes` outlet, all wrapped in `ListingsProvider`. `vite.config.js` sets `historyApiFallback: true` so client-side routes work on refresh in dev.
- **Listings state**: [src/context/listings-context.js](src/context/listings-context.js) defines `ListingsContext` and the `useListings()` hook (`{ listings, loading, error, addListing }`); [src/context/ListingsContext.jsx](src/context/ListingsContext.jsx) holds the `ListingsProvider`, split in two only because `react-refresh/only-export-components` forbids exporting a component and a hook from one file. The provider fetches the whole `listings` table once on mount (newest id first) — pages read from that in-memory array, so `ItemDetail` looks items up locally rather than querying by id, and a direct load of `/item/:id` must wait on `loading`. `addListing({ imageFile, ...fields })` uploads the optional photo to the public `listing-images` Storage bucket, inserts the row with the resulting `image_url`, prepends it to state, and throws on failure (callers surface the error). The Supabase client is created in [src/lib/supabaseClient.js](src/lib/supabaseClient.js), which throws at import if the env vars are missing.
- **Data shape**: a `listings` row has `id` (identity, higher = newer — `Marketplace`'s "Newest" sort relies on this), `title`, `price`, `category[]`, `seller`, `location`, `condition`, `description`, `story`, `image_url`, `created_at`. One photo per listing. The category taxonomy (`categories`) and badge colors (`tagColors`) are static in [src/data/categories.js](src/data/categories.js), shared by `Marketplace`, `PostItem`, `ListingCard`, and `ItemDetail`; categories are stored as plain text, not a table, so adding one is a code change only.
- **Marketplace filtering** ([src/pages/Marketplace.jsx](src/pages/Marketplace.jsx)) is done client-side in-component: search/category/sort state filters `useListings().listings` directly — there's no separate derived-state hook.
- **Post Item** ([src/pages/PostItem.jsx](src/pages/PostItem.jsx)) validates client-side (photo must be an image ≤ 5MB), awaits `addListing`, and shows a success screen with a "View Listing" link; on failure it keeps the form and shows the error. Sellers are always the literal string "You" until auth exists.
- **Design language**: no Tailwind config — colors are hardcoded hex values inline via arbitrary-value classes (e.g. `bg-[#1b4332]`, `text-[#52b788]`) rather than theme tokens. The palette is forest green / cream, with `'Fraunces'` (serif, Google Fonts, loaded in [index.html](index.html)) for headings and `'Inter'` for body text, both applied via inline `style={{ fontFamily }}` rather than Tailwind font classes. Keep new UI consistent with these same literal color values and font-family pattern unless doing a deliberate design pass.
- **Listing images**: [src/components/ListingImage.jsx](src/components/ListingImage.jsx) renders the uploaded `image_url` if present, otherwise falls back to [ImagePlaceholder](src/components/ImagePlaceholder.jsx) (deterministic gradient + initials keyed off `id`). Both take a `className` for sizing; used by `ListingCard` (grid) and `ItemDetail` (hero).
- **Security model**: the RLS policies in `schema.sql` currently let anyone read and insert listings and upload images (no accounts yet). Nothing can update or delete. When auth is added, scope inserts to `auth.uid()` and add owner-only update/delete policies.

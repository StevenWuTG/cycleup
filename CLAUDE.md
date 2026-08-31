# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

CycleUp — a marketplace for upcycled/repurposed goods, connecting independent makers with eco-conscious buyers. Currently a frontend-only prototype: listing state lives in `localStorage` (via `ListingsContext`), not a real backend/API — see Architecture below.

## Commands

- `npm run dev` — start the Vite dev server (HMR)
- `npm run build` — production build
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint

No test suite is configured.

## Architecture

- **Stack**: React 19 + Vite + React Router v7 (client-side routing, `BrowserRouter`) + Tailwind CSS v4 (via `@tailwindcss/vite`, no `tailwind.config.js` — v4 is CSS-first) + `lucide-react` for icons.
- **Routing** lives in [src/App.jsx](src/App.jsx): routes `/`, `/marketplace`, `/post`, and `/item/:id` mapped to `src/pages/*`, with a persistent `Navbar` above the `Routes` outlet, all wrapped in `ListingsProvider`. `vite.config.js` sets `historyApiFallback: true` so client-side routes work on refresh in dev.
- **Listings state**: [src/context/listings-context.js](src/context/listings-context.js) defines the `ListingsContext` and `useListings()` hook (`{ listings, addListing }`); [src/context/ListingsContext.jsx](src/context/ListingsContext.jsx) has the `ListingsProvider` component, split into two files only because `react-refresh/only-export-components` forbids mixing a component export with a hook export in one file. State is seeded from [src/data/mockListings.js](src/data/mockListings.js) on first load, then persisted to `localStorage` (key `cycleup:listings`) on every change — there is no backend, so this is per-browser only and won't sync across devices or users. `addListing(data)` assigns `id: Date.now()` and prepends to the list; `Marketplace`'s "Newest" sort relies on higher `id` = more recent, so keep using timestamp-like ids if this changes.
- **Data shape**: a listing has `id`, `title`, `price`, `category[]`, `seller`, `location`, plus optional `condition`, `description`, `story` — all seed items in `mockListings.js` now carry these too, so `ItemDetail` (which conditionally renders each) has real content to show. The category taxonomy (`categories`) and per-category badge colors (`tagColors`) are also exported from `mockListings.js` and shared by `Marketplace`, `ListingCard`, and `ItemDetail`.
- **Marketplace filtering** ([src/pages/Marketplace.jsx](src/pages/Marketplace.jsx)) is done client-side in-component: search/category/sort state filters `useListings().listings` directly — there's no separate derived-state hook.
- **Post Item** ([src/pages/PostItem.jsx](src/pages/PostItem.jsx)) calls `addListing` on valid submit and shows a success screen with a "View Listing" link to `/item/:id` using the id `addListing` returned — it does not navigate automatically.
- **Design language**: no Tailwind config — colors are hardcoded hex values inline via arbitrary-value classes (e.g. `bg-[#1b4332]`, `text-[#52b788]`) rather than theme tokens. The palette is forest green / cream, with `'Fraunces'` (serif, Google Fonts, loaded in [index.html](index.html)) for headings and `'Inter'` for body text, both applied via inline `style={{ fontFamily }}` rather than Tailwind font classes. Keep new UI consistent with these same literal color values and font-family pattern unless doing a deliberate design pass.
- **Listing images** are not real photos — the shared [src/components/ImagePlaceholder.jsx](src/components/ImagePlaceholder.jsx) generates a deterministic gradient + initials avatar per listing (keyed off `id`), sized via a `className` prop; used by both `ListingCard` (grid) and `ItemDetail` (large hero).

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

CycleUp — a marketplace for upcycled/repurposed goods, connecting independent makers with eco-conscious buyers. Currently a frontend-only prototype: all listing data is hardcoded, and forms (e.g. "Post an Item") validate and show a success state but don't persist anything — there's no backend or API yet.

## Commands

- `npm run dev` — start the Vite dev server (HMR)
- `npm run build` — production build
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint

No test suite is configured.

## Architecture

- **Stack**: React 19 + Vite + React Router v7 (client-side routing, `BrowserRouter`) + Tailwind CSS v4 (via `@tailwindcss/vite`, no `tailwind.config.js` — v4 is CSS-first) + `lucide-react` for icons.
- **Routing** lives in [src/App.jsx](src/App.jsx): three routes (`/`, `/marketplace`, `/post`) mapped to `src/pages/*`, with a persistent `Navbar` above the `Routes` outlet. `vite.config.js` sets `historyApiFallback: true` so client-side routes work on refresh in dev.
- **Data**: all listings and the category list are static exports from [src/data/mockListings.js](src/data/mockListings.js) — this is the single source of truth for "what a listing looks like" (`id`, `title`, `price`, `category[]`, `seller`, `location`) and for the shared category taxonomy used by both the marketplace filters and the post-item form.
- **Marketplace filtering** ([src/pages/Marketplace.jsx](src/pages/Marketplace.jsx)) is done client-side in-component: search/category/sort state filters the in-memory `mockListings` array directly — there's no separate store or hook.
- **Design language**: no Tailwind config — colors are hardcoded hex values inline via arbitrary-value classes (e.g. `bg-[#1b4332]`, `text-[#52b788]`) rather than theme tokens. The palette is forest green / cream, with `'Fraunces'` (serif, Google Fonts, loaded in [index.html](index.html)) for headings and `'Inter'` for body text, both applied via inline `style={{ fontFamily }}` rather than Tailwind font classes. Keep new UI consistent with these same literal color values and font-family pattern unless doing a deliberate design pass.
- **Listing images** are not real photos — `ListingCard`'s `ImagePlaceholder` generates a deterministic gradient + initials avatar per listing (keyed off `id`) as a stand-in.

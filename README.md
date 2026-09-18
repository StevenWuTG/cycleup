# CycleUp

A marketplace where makers list upcycled and repurposed goods and shoppers find them near them.

A React + Vite single-page app that talks directly to [Supabase](https://supabase.com) (Postgres, Auth, Storage). There is no custom server.

## Features

- Browse, search and filter listings by category, and sort by newest, price, or distance from you
- Listings with up to five photos, an origin story, and a city-level location
- Email + password accounts, public seller pages, and live in-app messaging between buyers and sellers
- Privacy Policy and Terms of Service

## Getting started

Requires Node 22 (see `.node-version`).

```bash
npm install
cp .env.example .env.local   # then fill in the two values below
npm run dev
```

`.env.local` needs your Supabase project's URL and public (anon) key, from Project Settings → API:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Never put the `service_role` key in this project, and never commit `.env.local` (it is gitignored).

## Database setup

In the Supabase dashboard's SQL Editor, run the files in [`supabase/`](supabase/) **in this order**:

1. `schema.sql`
2. `seed.sql` (optional demo listings)
3. `accounts.sql`
4. `editing.sql`
5. `messaging.sql`
6. `locations.sql`
7. `deletion.sql`
8. `photos.sql`

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |

## More

[`CLAUDE.md`](CLAUDE.md) is the detailed developer guide: architecture, how each feature works, security model, deployment, and pitfalls.

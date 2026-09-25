# SpatialFlow

A proof-of-concept marketing site for a fictional micro-office / studio
layout planner product. It's a single static `index.html` (no build step,
no framework) combining a cinematic, scroll-driven marketing shell with a
fully interactive room-planning tool, plus optional user accounts for
saving layouts across devices.

**Live**: https://spatialflow-poc.vercel.app/

## What it does

- **Marketing shell** — a dark, jeskojets.com-inspired scroll experience:
  a portal hero with a scroll zoom-through, a per-section palette journey,
  an accordion, a spec table, and a dark finale.
- **Interactive planner** — drag furniture onto a scaled floor plan and get
  live feedback:
  - Hard invariants: items can't leave the room or overlap.
  - Soft invariant: a clearance warning for furniture placed too close
    together (non-blocking).
  - Live utilization %, estimated power draw and outlet count, an itemized
    shopping list with running total, and a JSON blueprint export.
- **Accounts (optional)** — sign up or log in with email/password to save
  your layout to your account and pick it up from any device. Without an
  account, the planner still works and saves your layout locally to that
  one browser.

## Tech stack

- **Frontend**: plain HTML/CSS/JS, Tailwind CSS (CDN) for styling, Lucide
  for icons, Space Grotesk (Google Fonts) for display type. No bundler, no
  package.json, no framework.
- **Auth + database**: [Supabase](https://supabase.com) — Auth for
  email/password sign-up and login, Postgres for per-user layout storage.
  The browser talks to Supabase directly via its public anon key; a Row
  Level Security policy on the `layouts` table (`user_id = auth.uid()`)
  ensures each account can only ever read or write its own row.
- **Hosting**: [Vercel](https://vercel.com) (free tier), deployed from this
  GitHub repo. A `vercel.json` build step writes `supabase-config.js` from
  Vercel environment variables at deploy time, so no key is ever committed.

## Running it locally

This is a static site — any local file server works:

```bash
python3 -m http.server 8123
```

Then open `http://localhost:8123`. (Serving over `http://` rather than
`file://` is required for `localStorage` to work.)

To exercise the sign-up/login/save features locally, copy
[`supabase-config.example.js`](supabase-config.example.js) to
`supabase-config.js` and fill in your own Supabase project's URL and anon
public key (Supabase dashboard → Project Settings → API). That file is
gitignored and never gets committed.

## Deploying your own copy

1. Create a Supabase project, then run the SQL in
   [`openspec/changes/archive/`](openspec/changes/archive/) (see the
   `add-user-auth-persistence` change) to create the `layouts` table and
   its Row Level Security policies.
2. Import this repo into Vercel and set `SUPABASE_URL` and
   `SUPABASE_ANON_KEY` as environment variables in the Vercel project
   settings — `vercel.json`'s build command injects them into the deployed
   `supabase-config.js` automatically.
3. Deploy.

## Project structure

```
index.html    — the entire site: markup, styles, and app logic
images/       — marketing and furniture-catalog images (see CREDITS.md)
docs/         — the categorical architecture model and its status
openspec/     — change proposals/specs/designs/tasks (OpenSpec workflow)
```

This project documents its own architecture as a formal model (objects,
morphisms, locations, transmissions) rather than free-form prose — see
[`docs/site/ARCHITECTURE.md`](docs/site/ARCHITECTURE.md) for what the system
is, and [`docs/site/STATUS.md`](docs/site/STATUS.md) for what's built,
verified, and outstanding.

## Known gaps

- No automated test suite — all invariants and calculations are verified
  manually (see `docs/site/reviews/`).
- No account-recovery flow (password reset) or email verification beyond
  Supabase's defaults — minimum-viable auth for a proof of concept.
- An anonymous, signed-out layout does not carry over into a new account
  once you sign up.

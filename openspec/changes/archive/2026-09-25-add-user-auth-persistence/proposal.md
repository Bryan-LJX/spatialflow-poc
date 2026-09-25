# Proposal

## Why

SpatialFlow's planner is currently anonymous and single-machine: one layout is
stored under a fixed `localStorage` key (`spatialflow.layout.v2`), so it is
lost on a new device or browser, cannot be recovered after clearing site
data, and there is no concept of "whose" layout it is. To let visitors create
an account, save their own layouts, and come back to them from anywhere, the
site needs real user identity and server-side persistence — not a bigger
localStorage key. This is also the first change to introduce a backend
dependency (Supabase) and a production deployment target (Vercel), moving the
project from a local-only PoC to a hosted product.

## What Changes

- Add email/password registration, login, and logout via Supabase Auth,
  rendered in the existing site shell (no separate app shell/framework).
- Add a signed-in identity: the app knows which user is active and scopes
  data access to that user.
- **BREAKING**: Replace the single anonymous `localStorage` layout
  (`spatialflow.layout.v2`) with a per-user layout stored in Supabase
  Postgres. Signed-out visitors keep the existing local, ephemeral,
  single-device planner (unchanged `persist`/`restore` to `localStorage`) so
  the demo still works with zero setup; signing in switches the same planner
  UI to load/save that user's row in Supabase instead. There is no migration
  path from an old anonymous `localStorage` layout into a new account — a
  first-time signed-in user starts from the default empty layout.
- Add a Supabase table (`layouts`) keyed by `user_id`, protected by Row Level
  Security so a user can only read/write their own row. Credentials
  themselves are never stored in application tables — Supabase Auth owns
  them.
- Introduce two new `Loc`s: a Supabase-hosted Postgres + Auth service
  (identity and per-user layout storage) and a Vercel-hosted static origin
  (production hosting for `index.html` and assets), plus a Supabase
  JS-SDK-mediated `Trm` between the browser runtime and that service.
- Deploy the site to Vercel's free tier as the production site once the above
  is implemented and verified.

## Capabilities

### New Capabilities

- `user-auth`: registration, login, logout, and session identification for
  SpatialFlow visitors.
- `layout-persistence`: per-user, server-side storage and retrieval of a
  visitor's planner layout, replacing anonymous `localStorage` as the
  source of truth for signed-in users.

### Modified Capabilities

(none — `layout-persistence` is new; the existing anonymous
`localStorage` behavior for signed-out visitors is preserved as-is, not
changed)

## Impact

- **Code**: `index.html` — new auth UI (sign-up/sign-in/sign-out controls,
  session-aware nav state), a Supabase JS client (loaded via CDN, no build
  step change), and new `Trn`/`Trm` (`loadLayoutForUser`,
  `saveLayoutForUser`) alongside the existing `persist`/`restore` pair, gated
  on signed-in vs. signed-out state.
- **New dependency**: `@supabase/supabase-js` (CDN `<script>`, matching the
  project's no-build-step convention — same pattern as Tailwind/Lucide).
- **New external services**: a Supabase project (Auth + Postgres, free tier)
  and a Vercel project (static hosting, free tier). Both require the user's
  own accounts/credentials to provision — this proposal covers the app-side
  integration; provisioning the Supabase project and Vercel account happens
  in the design/tasks phase with the user.
- **Docs**: `docs/site/ARCHITECTURE.md` (new `Dat`/`Trn`/`Loc`/`Trm`),
  `docs/site/IMPLEMENTATION.md` (new rows), `docs/STATUS.md` /
  `docs/site/STATUS.md` (new "deployed" state).
- **No change** to the planner's core model (`FurnitureItem`, `Layout`,
  `compute*` deductions, bounds/overlap/clearance invariants) — this change
  only adds identity and swaps *where* a `Layout` is stored for signed-in
  users.

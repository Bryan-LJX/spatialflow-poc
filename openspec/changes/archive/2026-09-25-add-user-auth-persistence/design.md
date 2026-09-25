# Design

## Context

See proposal.md - Why/What Changes. Current state: `index.html` is a single
static file (Tailwind/Lucide CDN, vanilla JS, no build step, no backend). The
only existing `Trm`s are `persist`/`restore` to `localStorage` and
`downloadBlueprint` to the OS downloads folder (`docs/site/ARCHITECTURE.md`
§7). There is no server, no identity, and no cross-device state.

Constraints carried over from the existing model (must keep holding):
- `FurnitureItem`/`Layout`/`StoredLayoutJSON` shape and the bounds/overlap
  invariants (`docs/site/ARCHITECTURE.md` §6, rules 1-2) are unchanged.
- The planner-fence invariant (presentation code never touches
  `state.layout`) is unchanged and now additionally means auth/session UI
  must not run inside `#planner`'s dynamic subtree either.
- No build step: any new dependency must be loadable as a CDN `<script>`,
  matching how Tailwind/Lucide are already loaded.

## Goals / Non-Goals

**Goals:**
- Add real identity (Supabase Auth) and per-user server-side layout storage
  (Supabase Postgres) without introducing a custom backend server.
- Keep the signed-out experience exactly as it is today (anonymous,
  `localStorage`-backed, zero setup).
- Ship to a real production URL (Vercel free tier).

**Non-Goals:**
- No social/OAuth login, password reset flow polish, or email verification
  UX beyond Supabase's defaults — email/password only, minimum viable auth.
- No migration of an existing anonymous `localStorage` layout into a new
  account (proposal.md already calls this out as accepted PoC-level scope).
- No multi-layout-per-user (folders, named layouts, sharing) — one layout row
  per user, same as today's one layout per browser.
- No custom Express/Node API layer — the browser talks to Supabase directly
  via its JS SDK and RLS policies; Vercel serves static files only.

## Decisions

### 1. New `Dat`: `User` and `StoredLayoutRow`

**§3 Consolidation check**: `User` is a genuinely new object — nothing in the
existing category represents identity. `StoredLayoutRow` is `StoredLayoutJSON`
plus a `user_id` key and a server-assigned timestamp; it is a new object
(different `Loc`, different shape) rather than a new morphism on the existing
`StoredLayoutJSON`, because `StoredLayoutJSON` remains exactly as-is for the
signed-out/`localStorage` path.

| Object | Form / shape | Loc |
| --- | --- | --- |
| `User` | Supabase Auth user record `{ id, email }` (managed entirely by Supabase Auth; the app never stores a password) | Supabase Auth service |
| `StoredLayoutRow` | `{ user_id: uuid (PK, FK to auth.users), layout: jsonb (= StoredLayoutJSON), updated_at: timestamptz }` | Supabase Postgres (`layouts` table) |

### 2. New `Trn`/`Trm`

| Name | Signature | Kind | Partiality |
| --- | --- | --- | --- |
| `signUp` | `(email, password) → User` | `Trm` (browser → Supabase Auth) | Partial — fails on duplicate email or weak password |
| `signIn` | `(email, password) → User` | `Trm` (browser → Supabase Auth) | Partial — fails on bad credentials |
| `signOut` | `User → ()` | `Trm` (browser → Supabase Auth) | Total |
| `saveLayoutForUser` | `(User, Layout) → StoredLayoutRow` | `Trm` (browser → Supabase Postgres), via `serialize` first | Partial — fails if unreachable or RLS denies (never for a user's own row) |
| `loadLayoutForUser` | `User → StoredLayoutRow?` | `Trm` (Supabase Postgres → browser), then `deserialize` | Partial — `None` for a first-time user, falls back to default `Layout` exactly like today's missing-`localStorage`-key case |

`persist`/`restore` (existing, `localStorage`) are unchanged and remain the
only path for signed-out visitors — they are not replaced, only bypassed when
a `User` is present. This is the isolation-behind-ports decision (§4
below).

### 3. New `Loc`

- **Supabase-hosted service** (Auth + Postgres, one project) — holds `User`
  and `StoredLayoutRow`. Reached only via the Supabase JS SDK using the
  project's public anon key; Row Level Security (`user_id = auth.uid()` on
  both `select` and `update`/`insert`) is the enforcement point for
  "Requirement: A visitor can only access their own saved layout" — there is
  no other access path, since there is no custom server to also gate it.
- **Vercel-hosted static origin** — serves `index.html` and `images/` in
  production. Carries no state of its own (it is a pure static-file `Loc`,
  like the CDN assets already noted in ARCHITECTURE.md §9); it is a
  deployment target, not a new data-bearing location.

### 4. Isolating the effect behind a port: `layoutStore`

Rather than branching `if (user) supabase... else localStorage...` at every
call site, `renderGrid`/edit handlers keep calling one seam,
`layoutStore.save(layout)` / `layoutStore.load()`, and that seam picks
`persist`/`restore` or `saveLayoutForUser`/`loadLayoutForUser` based on the
current session. This keeps `compute*` and the edit pipeline (`addItem`,
`moveItem`, ...) exactly as they are today — they never learn that storage
moved. Alternative considered: thread `user` through every storage call
directly — rejected because it would leak identity into functions
(`addItem`, `moveItem`) that have nothing to do with storage, violating "one
source of truth for shared structure."

### 5. Client-only Supabase access, no custom backend

Alternative considered: a small Node/Express (or Vercel Serverless Function)
API layer between the browser and Supabase. Rejected for this PoC: Supabase's
anon-key + RLS model is designed for exactly this (public client, server-side
row-level enforcement), it keeps the "no build step" constraint intact, and
it avoids introducing a second runtime (Node backend) for a project whose
entire reason for being is a single static file. If a future need arises for
logic that must never run client-side (e.g., paid-tier gating), that would be
a new change, not implied by this one.

### 6. Auth UI placement

Sign-up/sign-in/sign-out controls go in the fixed nav (`#site-nav`), outside
`#planner`'s dynamic subtree, consistent with the planner-fence invariant
(`docs/site/ARCHITECTURE.md` §10). Signing in/out triggers a `layoutStore`
reload, re-rendering `#board`/`#catalog-list`/the metrics `<aside>` exactly as
a room-preset switch already does today — no new render path.

## §4.5 Coherence laws this change must keep satisfied

- **Law 1 (placement honesty)**: the two new `Loc`s above are named
  explicitly and are the only new locations; nothing is claimed to live
  anywhere else (e.g., no claim that layouts are cached in a CDN edge or a
  service worker — there is neither).
- **Law 2 (transmission well-typing)**: `saveLayoutForUser`/`loadLayoutForUser`
  carry `StoredLayoutRow`/`StoredLayoutJSON` only, never a raw in-memory
  `Layout` with live references — same discipline as the existing
  `persist`/`restore`.
- **Law 5 (composition soundness)**: `loadLayoutForUser ∘ saveLayoutForUser =
  id` on any `Layout` satisfying the bounds/overlap invariants, mirroring the
  existing `deserialize ∘ serialize = id` law — enforced the same way
  (`deserialize` still validates on the way back in, regardless of which
  `Trm` produced the JSON).

## Risks / Trade-offs

- **[Risk] Anon key + RLS is the only access control.** A misconfigured RLS
  policy would expose all users' layouts. → Mitigation: write the policy as
  `user_id = auth.uid()` for both `select` and `insert`/`update`, and verify
  it in tasks.md with a live cross-account read attempt (per the
  "Attempt to access another account's layout" scenario), not just by reading
  the policy text.
- **[Risk] Free-tier limits (Supabase pauses inactive free projects; Vercel
  free tier has usage caps).** → Mitigation: acceptable for a PoC; note in
  STATUS.md as a named, accepted gap rather than solving it now.
- **[Risk] No email verification means an account can be created with an
  email the registrant doesn't own.** → Mitigation: acceptable for a PoC per
  Non-Goals; Supabase's default flow can add verification later without a
  data-model change.
- **[Trade-off] No custom backend means all storage authorization logic lives
  in RLS policy text, not application code** → accepted per Decision 5; RLS
  is the standard, supported mechanism for this pattern.

## Migration Plan

1. Provision the Supabase project (Auth enabled, `layouts` table, RLS
   policies) and the Vercel project — both require the user's own accounts;
   done interactively with the user during tasks, not automated.
2. Add the Supabase JS SDK and `layoutStore` seam to `index.html`; land and
   verify locally (existing `python3 -m http.server` preview) before touching
   deployment.
3. Verify every spec scenario locally (registration, login, cross-device
   restore via two browser profiles, RLS denial, signed-out fallback
   unchanged) before deploying.
4. Deploy to Vercel; re-verify the same scenarios against the production URL,
   since Supabase project URL/anon key must be the production values there.
5. **Rollback**: Vercel keeps prior deployments addressable; reverting is
   pointing production traffic at the previous deployment. No data migration
   to roll back since signed-out `localStorage` behavior is untouched and the
   `layouts` table is additive.

## Open Questions

None — the one real ambiguity (whether signed-out use of the planner should
still work) was resolved in proposal.md ("What Changes") by keeping it
unchanged, since removing it would regress the zero-setup demo that is the
site's current selling point.

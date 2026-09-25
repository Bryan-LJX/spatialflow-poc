# Review — add-user-auth-persistence

> §4.5 coherence checklist run against `index.html` after adding email/
> password auth (Supabase Auth) and per-user layout persistence (Supabase
> Postgres + RLS), per FRAMEWORK.md. See `openspec/changes/
> add-user-auth-persistence/design.md` for the full model.

1. **Placement honesty** — ✅ pass. Exactly two new `Loc`s are claimed: a
   Supabase-hosted Auth/Postgres service and a Vercel-hosted static origin
   (deployment target, no state of its own). No third location is claimed —
   no CDN edge cache, no service worker, no custom backend server (there is
   none; the browser talks to Supabase directly via the anon key + RLS,
   design.md Decision 5).
2. **Transmission well-typing** — ✅ pass. `saveLayoutForUser`/
   `loadLayoutForUser` carry `StoredLayoutRow`/`StoredLayoutJSON` only — a
   direct REST read (`select=*` on `layouts`) confirmed the stored `layout`
   column round-trips as `{room, items}`, the same shape `persist`/`restore`
   already used. No live in-memory `Layout` reference or DOM node crosses a
   `Loc` boundary.
3. **Placement totality** — ✅ pass. Every new morphism (`signUp`, `signIn`,
   `signOut`, `saveLayoutForUser`, `loadLayoutForUser`, `layoutStore`,
   `updateAuthUI`, `bootLayout`) has a `built` row in `site/IMPLEMENTATION.md`
   with a real `index.html:<symbol>`.
4. **Dependency mediation** — ✅ pass. The one new external dependency
   (`@supabase/supabase-js`, CDN `<script>`) is only ever called from the six
   new `Trm` functions; no other code touches `window.supabase` directly.
5. **Composition soundness** — ✅ pass, verified live end-to-end:
   - **Registration**: a fresh email/password created an account and signed
     the visitor in immediately (after disabling Supabase's default "Confirm
     email", which otherwise blocks/rate-limits signup on a brand-new
     free-tier project with no custom SMTP — an infra gotcha, not a code
     defect).
   - **Duplicate/invalid input**: registering a second time with the same
     credentials and logging in with a wrong password each surfaced their
     spec'd error scenarios without a page reload.
   - **Save + restore round-trip**: placed an item while signed in, reloaded
     the page (session restored via `INITIAL_SESSION`), and the item was
     still there — read back with a direct authenticated REST call, not just
     eyeballed in the UI.
   - **RLS cross-account denial**: created a second account and, using
     *its* access token, ran an **unfiltered** `select=*` on `layouts` — it
     returned only the second account's own (empty) row — and an explicit
     query for the first account's `user_id` returned zero rows. This proves
     the server-side policy enforces isolation; the app's own `.eq(user_id,
     ...)` filter is not what's protecting the data.
   - **Save failure is non-blocking**: intercepted `window.fetch` to reject
     Supabase's `layouts` endpoint, made an edit, and got the toast "Couldn't
     save to your account — check your connection. Your change is still
     shown here." — the edit stayed on screen, nothing was reverted.
   - **Signed-out fallback untouched**: `localStorage`'s
     `spatialflow.layout.v2` entry was inspected before and after every
     signed-in save/load in this session and never changed — confirming
     `layoutStore` never crosses into the signed-out path while a user is
     signed in, and vice versa.
6. **runsAt is a relation** — n/a. No placements introduced by this change.

## Correctness issue found during implementation (fixed before shipping)

Live testing surfaced a real race condition, not a hypothetical one:
`currentUser` was originally set only by the async
`supabaseClient.auth.onAuthStateChange` callback. An edit made in the short
window between a successful `signUp`/`signIn` resolving and that event firing
could read a stale `currentUser` and save to `localStorage` instead of
Supabase (or the reverse on sign-out) — silently breaking the `layoutStore`
port's isolation guarantee for that one edit. Fixed by setting `currentUser`
synchronously inside the `signUp`/`signIn`/`signOut` promise handlers
themselves; `onAuthStateChange` is now used only for the one-time
`INITIAL_SESSION` restore on page load. Re-verified after the fix: signed-in
saves never touched `localStorage` (confirmed by diffing its stored value
across the whole test session), and the originally-reported successful
round-trip was re-run and re-confirmed with a direct authenticated REST read
rather than trusted at face value.

## Infra note (not a code defect)

Supabase's default "Confirm email" setting, combined with the very low send
rate of its shared/unconfigured email sender, makes brand-new free-tier
projects reject or rate-limit `signUp` for any address other than the
project owner's own. This is a dashboard setting
(Authentication → Sign In / Providers → Email → "Confirm email"), not
something the app can detect or work around client-side. Documented here so
a future session (or a fresh Supabase project) doesn't mistake it for a bug
in `signUp`.

## Verdict

All checkable laws pass. No FAILs to record in `architecture-map.md` §5.
Deployed to production at https://spatialflow-poc.vercel.app/ and every
scenario above was re-verified there (login + saved-layout restore, session
persistence across reload, a fresh write confirmed via a direct authenticated
REST read against Supabase, sign-out) — not assumed to carry over from local
testing. Only closeout (drift check + archive) remains.

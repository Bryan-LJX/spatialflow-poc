# 2026-09-25 — add-user-auth-persistence

## 0. Continuation brief

Current state: `add-user-auth-persistence` is fully implemented, deployed to
production, and verified — every scenario in both spec files was verified
live, first locally then re-verified against the production Vercel URL
(including a direct authenticated REST read against Supabase, not just
trusting the UI). 25/26 tasks were done before this log; writing this log
completes task 5.4 (the last one), so the change is ready to archive
immediately after this log is written.

Next step: archive `add-user-auth-persistence`
(`openspec-archive-change` / `/opsx:archive add-user-auth-persistence`).
After archiving, there is no other known open work on this repo.

Resume command/check: `openspec list` (should show no active changes after
archiving); production site: https://spatialflow-poc.vercel.app/.

## 1. Work completed

- Added a new OpenSpec change (`add-user-auth-persistence`, spec-driven
  schema, specs **not** skipped this time since real user-facing behavior
  changed) with two capabilities: `user-auth` and `layout-persistence`.
- Implemented email/password auth (Supabase Auth): `signUp`, `signIn`,
  `signOut`, session restore, and nav-based sign-up/sign-in modal UI, kept
  entirely outside `#planner`'s dynamic subtree (planner-fence invariant
  verified by grep).
- Implemented per-user layout persistence: a `layoutStore` port that
  dispatches to the existing `persist`/`restore` (`localStorage`) when
  signed out, or to new `saveLayoutForUser`/`loadLayoutForUser` (Supabase
  Postgres, `layouts` table) when signed in — the planner's edit pipeline
  (`addItem`/`moveItem`/...) never learned storage moved.
- User provisioned the Supabase project (Auth + `layouts` table + RLS
  policies restricting `select`/`insert`/`update` to `user_id = auth.uid()`)
  and a Vercel project, connected to a new GitHub repo
  (`Bryan-LJX/spatialflow-poc`) for auto-deploy on push.
- Added `vercel.json` (build command injects `SUPABASE_URL`/
  `SUPABASE_ANON_KEY` from Vercel env vars into a generated
  `supabase-config.js` at deploy time — the key is never committed) and
  `supabase-config.example.js` (placeholder template; the real
  `supabase-config.js` is gitignored and was never read by Claude, per the
  user's explicit request to keep key contents out of this session).
- Fixed a real Vercel deploy failure (`outputDirectory` defaulted to
  `public/`; the site is served from the repo root) and a real UI bug (auth
  modal input text was invisible — white text inherited from the dark body
  theme onto the white modal card).
- Found and fixed a genuine race condition during live verification:
  `currentUser` was originally set only by the async
  `onAuthStateChange` listener, so an edit made right after sign-in/out
  could race and land in the wrong store. Fixed by setting `currentUser`
  synchronously in the `signUp`/`signIn`/`signOut` promise handlers;
  `onAuthStateChange` now only drives the one-time `INITIAL_SESSION`
  restore.
- Verified every scenario in `specs/user-auth/spec.md` and
  `specs/layout-persistence/spec.md` live — locally first, then again
  against the production URL — including a genuine RLS cross-account
  isolation test with two real Supabase accounts (an unfiltered `select`
  and a targeted query for the other account's `user_id` both correctly
  returned nothing).
- Wrote `README.md` at the repo root (tech stack, local dev, deployment
  steps, project structure, known gaps) and pushed it.
- Reconciled `docs/site/ARCHITECTURE.md` (new §11: `User`/`StoredLayoutRow`
  `Dat`, new `Trm`, new `Loc`s, the `layoutStore` port, §4.5 notes),
  `docs/site/IMPLEMENTATION.md` (new rows + a divergence note for the race
  fix), both `STATUS.md` files, and wrote
  `docs/site/reviews/review-add-user-auth-persistence.md`.
- Committed and pushed in 6 commits (see §10); production redeployed
  automatically on each push via the GitHub-Vercel connection.

## 2. Decisions

| Decision | Verdict | Why |
| --- | --- | --- |
| Write real specs for this change vs. `skip_specs: true` (prior changes' convention) | kept: real specs | Prior changes were presentation-only; this one genuinely changes consumer-facing behavior (accounts, cross-device persistence) — specs describe behavior, so behavior changing means specs should exist |
| Signed-out visitors keep the anonymous local `localStorage` planner unchanged vs. requiring an account to use the planner at all | kept: keep it, unchanged | Preserves the zero-setup demo; stated explicitly in proposal.md rather than left as an unstated assumption |
| Client-only Supabase access (anon key + RLS) vs. a custom backend/serverless API layer | kept: client-only | Matches the "no build step" constraint and is Supabase's designed pattern for this; a backend would add a second runtime for no stated benefit |
| `currentUser` set only via `onAuthStateChange` vs. set synchronously in the triggering action's own promise handler | changed mid-implementation to: set synchronously in the handler | Live testing found a real race window where an edit right after sign-in could land in the wrong store; `onAuthStateChange` now only handles the one-time page-load session restore |
| Disable Supabase's "Confirm email" | kept: disabled | Free-tier shared email sender only allows sending to the project owner's own address / has a very low rate limit, which blocked `signUp` for any other address; not something app code can work around, and out of scope per design.md's Non-Goals (no email verification UX beyond defaults) |
| GitHub-connected Vercel auto-deploy vs. `vercel` CLI deploys from this machine | kept: GitHub-connected | User did not want to run/host anything locally for deployment; GitHub connection means every `git push` auto-deploys with no local Vercel CLI step |

## 3. Tests, checks, benchmarks

| Check | Result | What it proved |
| --- | --- | --- |
| Registration (fresh email) | account created, signed in immediately | "Successful registration" scenario |
| Registration (same email again) | `"User already registered"`, stays signed out | "Registration with an already-registered email" scenario |
| Login (correct password) | signed in | "Successful login" scenario |
| Login (wrong password) | `"Invalid login credentials"`, stays signed out | "Login with incorrect credentials" scenario |
| Logout | UI reverts to signed-out state | "Successful logout" scenario |
| Reload while signed in | session + layout restored via `INITIAL_SESSION` | "Reload while signed in" scenario |
| Reload after logout | stays signed out | "Reload after logout" scenario |
| Place an item while signed in, reload | item still present | "Layout saved while signed in" + round-trip |
| First sign-in on a fresh account | 0 items (default layout) | "First-time signed-in visitor with no saved layout yet" scenario |
| Intercepted `window.fetch` to reject the `layouts` endpoint, then edited | toast "Couldn't save to your account..." shown, edit stayed on screen | "Save fails while offline" scenario, non-blocking |
| Second real account's unfiltered `select=*` on `layouts` | returned only its own (empty) row | RLS isolation — not just the app's own `.eq()` filter |
| Second account's targeted query for the first account's `user_id` | zero rows, HTTP 200 | RLS silently and correctly denies cross-account reads |
| `localStorage.spatialflow.layout.v2` diffed before/after every signed-in save | unchanged throughout | Signed-in saves never touch the signed-out storage path (§3.6) |
| Production URL (`https://spatialflow-poc.vercel.app/`) — full scenario re-run | all of the above re-confirmed, including a fresh write verified via direct authenticated REST read | Production deployment is genuinely functional, not just "builds without error" |
| `supercharge-drift` | `0 dead / 0 refs` | Same known ceiling (bare-filename `IMPLEMENTATION.md` refs) as prior sessions; no new symbols needed hand-verification beyond what was already checked above |
| `openspec validate add-user-auth-persistence --strict` | valid | Proposal/specs/design/tasks are internally consistent |

## 4. Live handoff state

| Type | Handle / location | State | Inspect / resume | Stop / cleanup |
| --- | --- | --- | --- | --- |
| branch | `master` | clean (all work committed and pushed) | `git status` | none |
| remote | `https://github.com/Bryan-LJX/spatialflow-poc` | up to date with `master` | `git log --oneline -8` | none |
| deployment | Vercel project `spatialflow-poc` → https://spatialflow-poc.vercel.app/ | live, auto-deploys on push to `master` | open the URL | none — keep |
| process | `python3 -m http.server 8123` (pid 21352) | running | `ss -ltnp \| grep 8123` | `kill 21352` or leave it (stateless static server) |
| external service | Supabase project (Auth + Postgres `layouts` table + RLS) | provisioned, `SUPABASE_URL`/`SUPABASE_ANON_KEY` present in Vercel env vars and in local gitignored `supabase-config.js` (never read by Claude) | Supabase dashboard | keep |
| data | Two real Supabase test accounts: `spatialflow.test.user@gmail.com`, `spatialflow.test.user2@gmail.com`, each with a small test layout (1 item) | created during verification | Supabase dashboard → Authentication → Users / Table Editor → `layouts` | user may want to delete these test accounts/rows before real users sign up |
| artifact | `openspec/changes/add-user-auth-persistence/` | all 26/26 tasks done, ready to archive | `openspec status --change add-user-auth-persistence --json` | archive next (see §5) |

## 5. In-flight changes (from OpenSpec)

| Change | Tasks | Status | Next ready artifact |
| --- | --- | --- | --- |
| `add-user-auth-persistence` | 26/26 | all_done | ready to archive |

## 6. Open items

| Priority | Item | Doc/code reference | Next action | Done when |
| --- | --- | --- | --- | --- |
| P2 | Two real test accounts + test layout rows exist in the production Supabase project | Supabase dashboard | Ask the user whether to delete them before real users sign up | user deletes them or says to leave them |
| P3 | No automated test suite | whole repo | Unchanged, long-standing accepted PoC gap | out of scope unless the project grows past demo scope |
| P3 | `graphify` produces an empty graph for this repo | n/a | Unchanged, documented ceiling (no JS-in-HTML AST support) | graphify adds that capability, or the JS is ever extracted to its own file |
| P3 | No password-reset / email-verification flow beyond Supabase defaults | `docs/site/reviews/review-add-user-auth-persistence.md` | Named Non-Goal in design.md; revisit only if the project moves past PoC scope | a future change explicitly adds it |

## 7. Architecture / model changes

Real model change (not presentation-only), documented in
`docs/site/ARCHITECTURE.md` §11: new `Dat` (`User`, `StoredLayoutRow`), new
`Trm` (`signUp`, `signIn`, `signOut`, `saveLayoutForUser`,
`loadLayoutForUser`), two new `Loc` (Supabase-hosted Auth/Postgres, a
Vercel-hosted static origin), and a new port (`layoutStore`) isolating the
storage-backend choice from the planner's edit pipeline. All three
checkable §4.5 laws (placement honesty, transmission well-typing,
composition soundness) verified — see the review doc for the one-line
rationale per law, including the race-condition finding and fix.

## 8. Docs reconciled

| Doc | Change |
| --- | --- |
| `openspec/changes/add-user-auth-persistence/{proposal,design,tasks}.md`, `specs/*/spec.md` | Created this session |
| `docs/site/ARCHITECTURE.md` | New §11 (User/persistence layer model), §7 `Loc`/`Trm` tables updated |
| `docs/site/IMPLEMENTATION.md` | New object/morphism rows, a divergence note for the `currentUser` race fix |
| `docs/site/reviews/review-add-user-auth-persistence.md` | Created — full §4.5 checklist, correctness finding, infra note, production re-verification |
| `docs/STATUS.md`, `docs/site/STATUS.md` | Updated to reflect in-flight → deployed-and-verified, production URL added |
| `README.md` | Created at repo root |

## 9. Drift check

`supercharge-drift` → `0 dead / 0 refs`. Unchanged, known ceiling (bare
`index.html:<symbol>` refs). No new symbols this session needed hand-
verification beyond the live scenario testing already recorded in §3.

## 10. Files changed

- `index.html` — auth UI (nav widget + modal), `signUp`/`signIn`/`signOut`/
  `saveLayoutForUser`/`loadLayoutForUser`/`layoutStore`/`bootLayout`/
  `updateAuthUI`, Supabase JS SDK + config script tags, input text-color fix
- `vercel.json` — new (build command injects Supabase env vars)
- `supabase-config.example.js` — new (placeholder template)
- `.gitignore` — added `supabase-config.js`, `.gbrain-owner.json`, `inbox/`
- `README.md` — new
- `openspec/changes/add-user-auth-persistence/` — new change, all tasks
  complete, ready to archive
- `docs/site/ARCHITECTURE.md`, `docs/site/IMPLEMENTATION.md`,
  `docs/STATUS.md`, `docs/site/STATUS.md` — updated
- `docs/site/reviews/review-add-user-auth-persistence.md` — new
- 6 commits pushed to `Bryan-LJX/spatialflow-poc` (`master`):
  `4612ca6` (prior redesign work), `4ce5d57`, `2fb3767`, `a3d7cca`,
  `292d701`, `9b72820`

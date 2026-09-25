# AI Performance Report — SpatialFlow PoC

> Objective assessment of Claude's performance across this repository's build
> history. Sourced exclusively from `docs/sessions/*.md` (as indexed by
> gbrain) and the OpenSpec change records under
> `openspec/changes/archive/*/{proposal,design,tasks}.md`. Covers all eight
> sessions from 2026-09-23 (`init`) through 2026-09-25 (`readme-cicd-docs`),
> spanning six archived OpenSpec changes.

## 1. Scope and method

Six OpenSpec changes were built end-to-end in this repo:

| Change | Date | Spec mode |
| --- | --- | --- |
| `build-index-html` | 2026-09-23 | `skip_specs: true` |
| `redesign-tailwind-planner` | 2026-09-23 | `skip_specs: true` |
| `redesign-jesko-aesthetic` | 2026-09-24–25 | `skip_specs: true` |
| `add-user-auth-persistence` | 2026-09-25 | real specs (`user-auth`, `layout-persistence`) |
| `redesign-threejs-planner-split` | 2026-09-25 | real spec (`planner-page`) |
| `add-showcase-chair-spin` | 2026-09-25 | `skip_specs: true` |

Two sessions did not produce a change: `init` (2026-09-23, scaffolding only)
and `readme-cicd-docs` (2026-09-25, documentation only). Every claim below
cites the session log and, where applicable, the change it belongs to.

## 2. Successes

Work that shipped correctly, was verified against real behavior (not just
"builds without error"), and required no post-hoc correction:

- **`build-index-html`** (2026-09-23): the initial planner — Pointer-Events
  drag/drop, integer-cell bounds/overlap invariants, `localStorage`
  round-trip — worked on first implementation. All manual tests passed
  without a fix cycle.
- **`redesign-tailwind-planner`** (2026-09-23): the full catalog/metrics/
  shopping-list/export rebuild passed every one of nine manual test
  categories (hard invariants, soft invariant, power formula, utilization,
  shopping list, export modal, persistence, responsive, console-clean) on
  first verification, including exact hand-computed matches for the power
  and utilization formulas.
- **`add-user-auth-persistence`** (2026-09-25): the auth/persistence
  capability passed all scenarios in both `user-auth` and
  `layout-persistence` specs, both locally and re-verified against
  production, including a genuine RLS cross-account isolation test with two
  real Supabase accounts (not just an app-level filter check).
- **`redesign-threejs-planner-split`** (2026-09-25): the Three.js/Lenis/GSAP
  reskin and the `index.html`→`planner.html` extraction preserved planner
  behavior byte-for-byte (verified via `localStorage` round-trip on the
  extracted page) and correctly identified an implicit spec requirement
  (the `planner-page` spec's "no embedded interactive tool in scroll flow")
  that the written `tasks.md` had not explicitly called out.
- **`add-showcase-chair-spin`** (2026-09-25): converged to an accepted result
  in three iterations, with the failure of iterations 1–2 diagnosed
  correctly from user feedback each time (see §4).
- Image/licensing discipline (Wikimedia Commons only, `CREDITS.md` maintained
  per image) was established in the discarded `add-scroll-animations` work
  and reused verbatim, without being asked again, across every later image
  addition (`redesign-jesko-aesthetic`, its post-review fixes, and the
  furniture-photo re-sourcing).

## 3. Hallucinations and incorrect technical assumptions

Cases where Claude asserted or built against a technical premise that turned
out to be false, discovered only by live testing rather than caught before
implementation:

| Assumption | Reality | Session |
| --- | --- | --- |
| CSS `animation-timeline: scroll()` would drive the hero portal's scroll-zoom transform | Never applied in the target browser engine — the hero stayed at rest at every scroll position tested | `cinematic-jesko-redesign` (2026-09-24) |
| CSS `animation-timeline: view()` + `animation-range: entry` would drive scroll reveals | Left the last screenful (finale + blueprint summary) permanently stuck at `opacity: 0`, because those elements can never finish their entry range before the page's scroll limit | `cinematic-jesko-redesign` (2026-09-24) |
| Tailwind `ring-dashed` arbitrary value would produce a dashed outline for the soft-spacing warning | `ring-*` utilities are `box-shadow`-based and cannot render dashed — had to fall back to a plain CSS `outline: dashed` class | `redesign-tailwind-planner` (2026-09-23) |
| `mix-blend-mode: difference` on the fixed nav would auto-invert legibly over any section background | Illegible in practice over the cream/gold/white sections; replaced with an explicit scroll-spy class toggle (`initNavContrast`) | `cinematic-jesko-redesign` (2026-09-24) |
| `mix-blend-mode: multiply` was a durable fix for the showcase image's white background box | Worked only because that specific image had a pure-white (255/255/255) backdrop; the replacement showcase image's near-white (~238–250/255) backdrop caused the same defect to recur faintly under the same technique | `jesko-post-review-fixes` (2026-09-25) |
| "Scroll-driven animations" meant tasteful fade-in reveals layered onto the existing warm-wood design | User's actual intent was a full dark, cinematic, jeskojets.com-style reskin — the entire `add-scroll-animations` change (proposal, design, tasks, images, review, code) was built, then discarded in full once the user clarified | `cinematic-jesko-redesign` (2026-09-24) |

Five of these six are narrow technical misjudgments about browser/CSS
behavior, each caught only through direct browser verification (computed
timing/opacity inspection, `getBoundingClientRect`, pixel sampling) rather
than anticipated at design time. The sixth (the scroll-animation
misinterpretation) is a scope-level misread of intent that cost a full
discarded implementation cycle before the correct direction was built.

## 4. Manual interventions required during code generation

Points where forward progress depended on the user acting, correcting
direction, or supplying something Claude could not obtain or decide alone:

- **Redirected scope** — the user had to explicitly name the target
  aesthetic (jeskojets.com) after the first `add-scroll-animations`
  implementation missed the intended direction (`cinematic-jesko-redesign`).
- **Rejected two iterations of the showcase chair-spin animation live**
  before accepting a third: a full 360° rotation ("looks weird") and a small
  parallax rise ("not obvious enough") were both built, shown, and rejected
  before the diagonal-glide version was approved (`redesign-threejs-planner-split`,
  `add-showcase-chair-spin`).
- **Re-requested furniture photos** a second time after they were lost when
  the discarded `add-scroll-animations` change was rolled back — Claude had
  to re-source the same five images rather than the user needing to
  remember to ask once (`cinematic-jesko-redesign`).
- **Provisioned external infrastructure Claude cannot self-serve**: the
  Supabase project (Auth, `layouts` table, RLS policies) and the Vercel
  project + GitHub repo connection were set up by the user, not Claude
  (`add-user-auth-persistence`).
- **Withheld credentials by explicit instruction**: the real
  `supabase-config.js` was kept gitignored and never read by Claude at the
  user's request; env-var injection at Vercel build time was used instead
  (`add-user-auth-persistence`).
- **Explicit "do not commit" instruction**: after the cinematic reskin was
  fully built and verified, the user instructed Claude not to commit or
  publish it yet; the working tree was left dirty on purpose for a full
  session (`jesko-post-review-fixes`).
- **Confirmed a recovered untracked file before committing**: a session log
  from an earlier session had never been committed; Claude found it
  untracked and asked for confirmation before adding it to history
  (`readme-cicd-docs`).
- **Rejected a diagram format after seeing it rendered**: a Mermaid diagram
  in the README rendered too small on GitHub; the user reported this after
  it shipped, requiring a replacement with a hand-authored static SVG
  (`readme-cicd-docs`).
- **Explicit content-removal instruction**: the user directly removed the
  README's "Known gaps" section themselves rather than asking Claude to
  (`redesign-threejs-planner-split`).

## 5. Mistakes the user caught post-implementation that Claude did not catch first

These are defects that passed Claude's own manual verification pass and
were only found once the user inspected the result directly (via
screenshots or live use), rather than being caught by Claude's own testing
before being shown:

| Defect | How the user found it | How it was found not to have been caught first | Session |
| --- | --- | --- | --- |
| Workbench metrics sidebar bled ~5.7px past the panel's rounded border at wide viewports | User-supplied screenshots of the uncommitted build | Fixed with `min-w-0` on the grid column, then measured (`getBoundingClientRect`) to confirm — the measurement was taken *after* the user flagged it, not as part of the original verification pass | `jesko-post-review-fixes` (2026-09-25) |
| Showcase chair+ottoman image visually collided with the "Design … in luxe" split headline | User-supplied screenshots | Same pattern — root-caused and fixed only after the user's report | `jesko-post-review-fixes` (2026-09-25) |
| Scroll reveals not persisting, illegible nav contrast, and missing furniture photos | The session log records these as three of "four user-reported defects" fixed in the same review pass | All three were logged as user-reported, meaning Claude's own live-verification pass in the original `redesign-jesko-aesthetic` build did not surface them | `cinematic-jesko-redesign` (2026-09-24) |
| Chair-spin animation "looks weird" (full rotation) and "not obvious enough" (small rise) | Live user review of each iteration | Both were presented as finished before the user's aesthetic judgment overrode Claude's own assessment that each was acceptable | `redesign-threejs-planner-split` / `add-showcase-chair-spin` (2026-09-25) |
| Mermaid CI/CD diagram rendered too small on GitHub | User viewed the rendered README on GitHub | Claude verified the diagram only in the browser pane at authoring time, not GitHub's actual Mermaid renderer/container width, so the sizing problem shipped before being caught | `readme-cicd-docs` (2026-09-25) |

This is the single clearest pattern in the record: **all four defects in the
cinematic reskin, both layout bugs in the post-review pass, both rejected
spin iterations, and the diagram sizing issue were found by the user, not by
Claude's own testing**, even though Claude's manual test passes for the
*data/logic* layer (invariants, deductions, persistence, RLS) reliably
caught real bugs before being shown. The gap is consistently visual/
aesthetic judgment and cross-environment rendering fidelity (GitHub's
renderer vs. the browser pane), not functional correctness.

## 6. Edge cases where actual implementation differed from baseline predictions

Cases where live testing surfaced behavior the initial design/implementation
did not anticipate, requiring a mid-implementation change:

- **Lenis + GSAP double-`requestAnimationFrame` desync**: the original
  implementation let Lenis run its own default rAF loop alongside GSAP's
  ticker. This double-drove scroll updates and visually desynced the pinned
  hero from the fixed nav — not predicted at design time, only found via
  `getBoundingClientRect`/`elementFromPoint` checks showing correct layout
  while paint drifted. Fixed with `{ autoRaf: false }`, ticking Lenis only
  from `gsap.ticker` (`redesign-threejs-planner-split`).
- **Duplicate Supabase client race**: the initial design called for a
  separate Supabase client per page. Live testing surfaced the SDK's own
  "Multiple GoTrueClient instances" warning — two `createClient()` calls on
  one page race over the same auth-token storage key. Changed mid-
  implementation to one shared client via `site-auth.js:getSupabaseClient`
  (`redesign-threejs-planner-split`).
- **`currentUser` race condition**: the original design set `currentUser`
  only via the async `onAuthStateChange` listener. Live testing found a real
  race window where an edit made immediately after sign-in/out could land in
  the wrong storage backend. Fixed by setting `currentUser` synchronously in
  the `signUp`/`signIn`/`signOut` promise handlers, demoting
  `onAuthStateChange` to handling only the one-time `INITIAL_SESSION`
  restore (`add-user-auth-persistence`).
- **Vercel deploy failure from a wrong default assumption**: `outputDirectory`
  defaulted to `public/`, but the site is served from the repo root — a real
  deploy failure discovered post-configuration, not predicted during design
  (`add-user-auth-persistence`).
- **Auth modal input text invisible**: white input text was inherited from
  the dark body theme onto the modal's white card background — a real UI
  bug found only through live interaction with the form, not anticipated in
  the design (`add-user-auth-persistence`).
- **Browser-pane rAF/IntersectionObserver reliability**: `requestAnimationFrame`
  and `IntersectionObserver` callbacks were found not to fire reliably while
  the testing environment's browser pane window was backgrounded/not
  painted, causing synthetic `scrollTo()` jumps to under-report reveal/nav
  state. This was an environment quirk discovered mid-session and had to be
  cross-checked multiple times before any "stuck" result could be trusted as
  a real bug rather than a measurement artifact (`cinematic-jesko-redesign`).
- **Screenshot pipeline artifact isolated, not a real bug**: automated
  screenshot capture produced blank/offset images at large scroll depths on
  *both* `index.html` and the dependency-free `planner.html`. Because it
  reproduced on a page with no shared dependencies, it was correctly
  isolated to the Browser pane's own screenshot pipeline rather than misread
  as an application defect — the inverse of the other edge cases, i.e. a
  correct negative diagnosis (`redesign-threejs-planner-split`).
- **Image backdrop tone assumption**: the fix for one showcase image
  (pure-white backdrop, `mix-blend-mode: multiply`) was assumed to be a
  general pattern; the next image sourced for the same slot had a near-white
  (not pure white) backdrop, and the same blend-mode technique reproduced a
  fainter version of the original defect — see §3 (`jesko-post-review-fixes`).

## 7. Summary

| Category | Count (this record) |
| --- | --- |
| Changes fully built and verified with no post-hoc fix | 3 of 6 (`build-index-html`, `redesign-tailwind-planner`, `add-user-auth-persistence` shipped clean; the other three each needed at least one correction cycle) |
| Incorrect technical assumptions (hallucinations) caught only by live testing | 6 |
| Sessions requiring a user-side manual intervention (redirection, external provisioning, explicit instruction, or rejection) | 7 of 8 |
| Defects found by the user after Claude's own verification pass had already declared the work done | 6 |
| Implementation-vs-design divergences (edge cases) surfaced only by live testing | 7 |

**Pattern:** Claude's manual verification of *logic-layer* correctness
(invariants, deductions, persistence round-trips, RLS isolation, race
conditions once specifically tested for) was reliable and consistently
caught real defects before shipping. Its blind spots were concentrated in
(a) initial technical assumptions about CSS/browser-engine behavior that
were asserted before being verified, and (b) *visual/aesthetic* correctness
and cross-renderer fidelity (GitHub's Mermaid renderer, live animation feel)
— five of six defects in §5 were caught by the user's eyes, not by any of
Claude's own automated or measurement-based checks. The one clear scope-level
miss (§3, "scroll-driven animations") was a misread of ambiguous instruction
that cost a fully-built, fully-discarded implementation before the user gave
an unambiguous reference point.

---

*Sources: `docs/sessions/2026-09-23-init.md`,
`docs/sessions/2026-09-23-build-index-html.md`,
`docs/sessions/2026-09-23-redesign-tailwind-planner.md`,
`docs/sessions/2026-09-24-cinematic-jesko-redesign.md`,
`docs/sessions/2026-09-25-add-user-auth-persistence.md`,
`docs/sessions/2026-09-25-jesko-post-review-fixes.md`,
`docs/sessions/2026-09-25-threejs-redesign-planner-split.md`,
`docs/sessions/2026-09-25-readme-cicd-docs.md`;
`openspec/changes/archive/*/{proposal,design,tasks}.md` for the six changes
listed in §1.*

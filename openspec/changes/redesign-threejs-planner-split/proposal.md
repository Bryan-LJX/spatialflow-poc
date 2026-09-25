# Proposal

## Why

The current marketing shell (`redesign-jesko-aesthetic`) approximates
jeskojets.com's cinematic feel with CSS/JS scroll tricks (a JS-driven hero
scale+fade, `IntersectionObserver` reveals), but the user wants it to match
jeskojets.com more closely — which relies on real WebGL scenes and
GSAP-grade scroll choreography, not CSS approximations. At the same time,
`index.html` is already 1699 lines with the planner's full interactive
markup, JS state machine, and auth/persistence logic all inlined alongside
the marketing shell, and growing the marketing layer with a 3D/animation
stack on top makes that single file harder to reason about and slower to
load for visitors who only want the planner tool. Splitting the planner onto
its own page lets the marketing shell carry the heavier visual stack without
forcing planner visitors to download it, and vice versa.

## What Changes

- **Adopt Three.js (WebGL) + Lenis (smooth scroll) + GSAP/ScrollTrigger** as
  the animation stack for the marketing shell, replacing the current
  JS-driven hero zoom and `IntersectionObserver` reveals with real
  scroll-synced WebGL scenes and GSAP-timeline-driven reveals/pinning. All
  three are MIT-licensed and free for commercial use (GSAP's Club plugins,
  including ScrollTrigger, became free for everyone in 2025 after Webflow's
  acquisition of GreenSock); all three ship browser-ready ESM builds
  reachable via `<script type="importmap">` + CDN (unpkg/jsDelivr), so the
  project's no-build-step constraint is preserved. **BREAKING** (internal
  only): removes `initHeroZoom`/`initScrollReveal`'s current CSS-driven
  implementations in favor of GSAP/ScrollTrigger-driven equivalents — no
  externally observable requirement changes, but the realizing code does.
- **Re-skin the marketing shell** to track jeskojets.com more closely using
  this stack: a WebGL hero scene (replacing the flat portal-image zoom) with
  a Lenis-smoothed, ScrollTrigger-pinned zoom-through into the workspace, and
  GSAP-timeline reveals for the palette-journey sections, in place of the
  current IO-based reveals. Presentation-only — no change to any modeled
  `Dat`/`Trn`/invariant, same as `redesign-jesko-aesthetic` (§10 of
  `docs/site/ARCHITECTURE.md`).
- **Extract the Micro-Office Layout Builder onto its own page** —
  `planner.html` — moving `#planner`'s markup, the `layoutStore` port, the
  full planner state machine (`addItem`/`moveItem`/`rotateItem`/
  `removeItem`/`selectRoom`/render/compute/export), and the auth/session
  wiring it depends on out of `index.html`. `index.html` keeps the marketing
  shell plus a nav link ("Start Planning" / equivalent) to `planner.html`,
  replacing today's in-page scroll-to-`#planner` anchor.
- **Auth remains fully shared across both pages** — sign-up/sign-in/sign-out,
  session restore, and the nav auth widget are unchanged in behavior and
  present on both `index.html` and `planner.html` (a visitor can sign in from
  either page and stay signed in on the other), backed by the same Supabase
  project. No requirement in `user-auth` or `layout-persistence` changes —
  both specs already describe behavior in page-agnostic terms ("the site",
  "the planner"), so a two-page site already satisfies them; see
  `openspec/specs/user-auth/spec.md` and
  `openspec/specs/layout-persistence/spec.md`.

## Capabilities

### New Capabilities
- `planner-page`: the Micro-Office Layout Builder is reachable at its own
  page (`planner.html`), linked from the marketing site's nav/CTA, rather
  than embedded as an in-page section.

### Modified Capabilities
(none — `user-auth` and `layout-persistence` requirements are already
page-agnostic and are unaffected by the split; see "What Changes" above)

## Impact

- **Affected files:** `index.html` (marketing shell rewritten with Three.js/
  Lenis/GSAP, planner markup/JS removed, nav CTA changed); new `planner.html`
  (planner markup + state machine + auth/layoutStore JS, sharing nav/auth
  styling with `index.html`); `supabase-config.js`/`supabase-config.example.js`
  referenced from both pages unchanged; no changes to `vercel.json` or the
  Supabase schema.
- **New dependencies (all free, CDN-delivered, no build step):** Three.js,
  Lenis, GSAP core + ScrollTrigger — exact CDN URLs and pinned versions
  decided in `design.md`.
- **No backend/infra change:** Supabase Auth/Postgres and the Vercel static
  origin are unchanged; both pages are still served statically from the repo
  root.
- **Docs:** `docs/site/ARCHITECTURE.md` gains a component split (or an
  explicit two-page note within the existing single component, decided in
  design.md) and updates §10's presentation-layer functions; `docs/site/
  IMPLEMENTATION.md` and both `STATUS.md` files get reconciled per the
  project's standing rule.

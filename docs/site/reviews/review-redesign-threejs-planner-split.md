# Review — redesign-threejs-planner-split

> §4.5 coherence checklist run against `index.html`/`planner.html` after
> reskinning the marketing shell onto Three.js/Lenis/GSAP and moving the
> Micro-Office Layout Builder onto its own page, per FRAMEWORK.md. See
> `openspec/changes/redesign-threejs-planner-split/design.md` for the full
> model.

1. **Placement honesty** — ✅ pass. No new `Loc` is claimed. `index.html` and
   `planner.html` are two documents in the one existing browser-runtime
   `Loc` (design.md Decision 4); the WebGL canvas, Lenis, and GSAP all run
   there too, carrying no `Layout` data, same reasoning as the pre-existing
   Tailwind/Lucide CDN assets. Confirmed live: `getComputedStyle` on
   `<html>`/`<body>` showed no `transform`/`overflow` change from Lenis, and
   only one `.pin-spacer` (the hero's) exists in the DOM at any scroll
   position.
2. **Transmission well-typing** — ✅ pass. No `Trm` signature changed.
   `saveLayoutForUser`/`loadLayoutForUser` still carry `StoredLayoutRow`/
   `StoredLayoutJSON` only, unchanged from `add-user-auth-persistence`; only
   their file location (`index.html` → `planner.html`) and their Supabase
   client (now shared via `site-auth.js:getSupabaseClient`, see the
   correctness note below) changed.
3. **Placement totality** — ✅ pass. Every relocated or new morphism has a
   `built` row in `site/IMPLEMENTATION.md` with a real `file:symbol`:
   `signUp`/`signIn`/`signOut`/`getCurrentUser`/`onAuthChange`/
   `renderAuthNav`/`getSupabaseClient` at `assets/js/site-auth.js`;
   `initScrollReveal`/`initHeroScrub`/`initHeroScene`/`initLenis` at
   `assets/js/marketing-scene.js`; everything planner-side at `planner.html`.
4. **Dependency mediation** — ✅ pass. The three new dependencies (Three.js,
   GSAP/ScrollTrigger, Lenis) are only ever touched inside
   `assets/js/marketing-scene.js`; no other file imports them. The Supabase
   JS SDK is now instantiated in exactly one place per browser context
   (`assets/js/site-auth.js`) instead of once per page, closing the gap
   found in point 5.
5. **Composition soundness** — ✅ pass, verified live (`static-preview` on
   `localhost:8123`, production Supabase project):
   - **Planner invariants unchanged**: placed an "Ergonomic Standing Desk" on
     `planner.html` — space utilization, power draw (90 W / 1 outlet), and
     the shopping-list total ($449) all matched the catalog entry's own
     numbers; `localStorage`'s `spatialflow.layout.v2` held the exact
     `{room, items}` JSON after the edit and again after a full page reload
     (signed-out round-trip, byte-identical).
   - **Export modal**: `btn-export` opened the modal with a summary matching
     the placed item (room size, item count, utilization, power, spacing
     warnings, total cost) — `buildBlueprint`'s deduced snapshot is unaffected
     by the relocation.
   - **Auth wiring reaches production Supabase**: submitted a deliberately
     wrong email/password on `index.html`'s sign-in modal and got "Invalid
     login credentials" back from the real Auth endpoint — proves
     `site-auth.js`'s `signIn` → `renderAuthNav`'s error-rendering path is
     wired correctly end to end, not just that the modal opens.
   - **Accordion / nav contrast**: toggled an `.acc-item` via
     `initAccordion` and confirmed `.is-open` flips; `#site-nav.nav-dark`
     correctly reflects the section under the nav band while scrolled into
     `#manifesto` (light section).
   - **Reveal timeline**: at a scroll position past the hero, 6 of 15
     `[data-reveal]` nodes carried `.is-revealed` — exactly the ones already
     scrolled into view — confirming `ScrollTrigger`'s one-shot reveal
     replaced `IntersectionObserver` without changing the contract.
6. **runsAt is a relation** — n/a. No placements introduced by this change.

## Correctness issues found during implementation (fixed before shipping)

**Lenis/GSAP double-rAF desync.** `Lenis` runs its own
`requestAnimationFrame` loop by default. The standard GSAP integration ticks
Lenis a second time from `gsap.ticker` — but only after disabling Lenis's own
loop with `{ autoRaf: false }`. The first implementation omitted that option,
so Lenis and `gsap.ticker` both drove scroll updates independently every
frame. The visible symptom: scrolled past the pinned hero, the fixed nav
appeared to drift down the page with the content instead of staying pinned
to the viewport — but `header.getBoundingClientRect()` reported the correct
`{top: 0}` the whole time, and `document.elementFromPoint(x, 0)` hit-tested
to the real nav, proving this was a compositor paint desync, not a layout
bug. Fixed by passing `{ autoRaf: false }` to `new Lenis(...)` in
`assets/js/marketing-scene.js:initLenis`; re-verified the nav stays visually
pinned through the full pin/scrub/release cycle.

**Duplicate Supabase client.** `planner.html`'s `saveLayoutForUser`/
`loadLayoutForUser` were first implemented against a second,
independently-instantiated Supabase client (mirroring the pre-split
`index.html` code exactly, per design.md Decision 3's original wording).
Every `createClient()` call spins up its own `GoTrueClient` managing the
shared `sb-<project>-auth-token` `localStorage` key — even for a client that
never calls `.auth` — so two clients on one page raced over that key and the
SDK logged its own "Multiple GoTrueClient instances ... may produce
undefined behavior" warning. Fixed by adding
`assets/js/site-auth.js:getSupabaseClient` and having `planner.html` reuse
that one client instead of creating a second; re-verified the warning no
longer appears on a fresh `planner.html` load.

## Note: screenshot-capture artifact, not a page bug

While verifying, the automated Browser pane's pixel screenshots went blank
(solid color) at some scroll depths on **both** `index.html` and the
unrelated, stack-free `planner.html`, and (before the Lenis fix above) showed
the nav offset in a way `getBoundingClientRect`/`elementFromPoint` never
confirmed. Reproducing it on `planner.html` — which has no Three.js/GSAP/
Lenis at all — isolated this to the pane's screenshot pipeline at large
scroll offsets, not the pages themselves; every scroll-position claim in
this review was cross-checked against `getBoundingClientRect`,
`elementFromPoint`, and `get_page_text`, not screenshots alone.

## Verdict

All checkable laws pass. No FAILs to record in `architecture-map.md` §5. Not
yet redeployed to production (`https://spatialflow-poc.vercel.app/` still
serves the pre-split build) — verified locally only in this session. Two
real correctness issues were found and fixed live, both documented above and
in `IMPLEMENTATION.md`'s Notes/divergences. Remaining: closeout (drift check
+ archive) and a push to deploy.

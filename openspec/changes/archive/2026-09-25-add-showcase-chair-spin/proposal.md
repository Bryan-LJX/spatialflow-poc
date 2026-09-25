# Proposal

## Why

The `#showcase` section's chair image is currently static. The user wants a
scroll-driven spin on the chair as the visitor scrolls past that section,
matching the cinematic, scroll-reactive feel `redesign-threejs-planner-split`
already gave the hero (GSAP `ScrollTrigger`, scrubbed to scroll position).

## What Changes

- Add a GSAP `ScrollTrigger`-scrubbed rotation to the `#showcase` chair
  `<img>` (`images/showcase-chair.png`), spinning it as the visitor scrolls
  through the section — same mechanism and library already loaded for the
  hero (`assets/js/marketing-scene.js`), no new dependency.
- Presentation-only: no `Dat`/`Trn`/invariant changes, no observable
  capability change — same category as `redesign-jesko-aesthetic`'s reveal/
  hero-zoom work (`docs/site/ARCHITECTURE.md` §10).

## Capabilities

(none — presentation-only; `skip_specs: true`, no spec-level behavior changes)

## Impact

- **Affected files:** `assets/js/marketing-scene.js` (new `initShowcaseSpin`
  function), `index.html` (no markup change expected — the existing
  `<img class="relative z-10 ...">` in `#showcase` gets the scroll trigger).
- No new dependency: GSAP + ScrollTrigger are already imported on
  `index.html` via the import map from `redesign-threejs-planner-split`.
- No change to `planner.html`, Supabase, or any modeled object.

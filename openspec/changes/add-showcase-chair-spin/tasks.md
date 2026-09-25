# Tasks

## 1. Implement

- [x] 1.1 Add `initShowcaseSpin` to `assets/js/marketing-scene.js` per
      design.md Decision 1 (`gsap.to` with a scrubbed `ScrollTrigger`,
      `start: "top bottom"`, `end: "bottom top"`), gated by the existing
      `prefersReducedMotion` flag, and call it from the module's bootstrap.
      Verify: scrolling `#showcase` into and through view rotates the chair
      image smoothly in sync with scroll position, and it stays static under
      `prefers-reduced-motion`.
- [x] 1.2 Verify no regression to the hero scrub/scene, reveals, or planner
      link — `index.html` end to end, console clean.

## 2. Docs reconciliation

- [x] 2.1 Add a row for `initShowcaseSpin` in `docs/site/IMPLEMENTATION.md`'s
      Morphisms table (presentation, `assets/js/marketing-scene.js:
      initShowcaseSpin`) and a line in `docs/site/ARCHITECTURE.md` §10's
      presentation-layer list.
- [x] 2.2 Run `supercharge-drift` and fix any dead rows before archiving.

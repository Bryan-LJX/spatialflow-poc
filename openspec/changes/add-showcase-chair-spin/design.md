# Design

## Context

See `proposal.md` - Why. `assets/js/marketing-scene.js` already imports GSAP
+ ScrollTrigger (via the import map added by `redesign-threejs-planner-split`)
and already owns every scroll-reactive presentation effect on `index.html`
(hero scrub/scene, reveals). This is one more function in that same file,
not a new file or dependency.

## Goals / Non-Goals

**Goals:**
- The `#showcase` chair image rotates in sync with scroll position while its
  section is in view — a scrub, not a one-shot animation.

**Non-Goals:**
- No pinning of the `#showcase` section (unlike the hero) — the section keeps
  scrolling normally; only the image's `rotation` is tied to scroll progress.
- No 3D/WebGL — this is a flat PNG, so a CSS `rotate` transform (via GSAP) is
  the whole effect, not a new Three.js scene.

## Decisions

### Decision 1: `gsap.fromTo` diagonal parallax glide + scale, scrubbed, not pinned

Two iterations, both rejected live on real scroll feedback:
1. A full 360° `rotation` scrub — a flat product photo doing a complete
   rotation looks like it's flipping/glitching, not turning; no third
   dimension backs the motion.
2. A small parallax rise (`y: 70→-70`, `rotation: -6°→6°`,
   `scale: 0.94→1.02`) — correct mechanism, but the visitor said it "isn't
   obvious enough": the travel and scale range were too subtle to register
   as intentional motion while actively reading the section's text.

Settled on a **diagonal parallax glide**: bigger travel on both axes plus a
larger scale swing, no rotation (rotation was the least legible axis in
iteration 2 and the most "spin-adjacent" — dropping it removes that risk
while the position/scale motion alone is already clearly visible):

```js
gsap.fromTo(chairImg,
  { x: -70, y: 130, scale: 0.78 },
  {
    x: 70, y: -130, scale: 1.12,
    ease: "none",
    scrollTrigger: {
      trigger: showcaseSection,
      start: "top bottom",
      end: "bottom top",
      scrub: true
    }
  }
);
```

`start: "top bottom"` / `end: "bottom top"` still spans the section's entire
time on screen. The chair enters lower-left and noticeably smaller, glides
up and to the right while growing to slightly larger than its resting size,
and exits upper-right — a clear, continuous diagonal drift tied to scroll
position, easily readable without a full rotation.

**Alternatives considered:** (a) both prior iterations, rejected as above.
(b) pinning `#showcase` (like the hero) — still rejected, same reasoning as
before: this section shouldn't hold the visitor's scroll hostage the way the
hero intentionally does. (c) re-adding a small rotation on top of the glide —
rejected for now to keep the motion unambiguous; can revisit if the glide
alone still under-delivers.

### Decision 2: New `initShowcaseSpin` function, same file, same pattern

Added to `assets/js/marketing-scene.js` alongside `initHeroScrub`/
`initScrollReveal`, called from the same top-level bootstrap. Respects the
existing module-level `prefersReducedMotion` flag (no-op, image stays at its
resting rotation) exactly like every other effect in that file — no new
reduced-motion branch needed.

## Risks / Trade-offs

- **[Risk]** None beyond what the hero scrub already carries (same library,
  same integration pattern, already verified working with Lenis in
  `redesign-threejs-planner-split`) → **Mitigation:** n/a, reusing a proven
  pattern.

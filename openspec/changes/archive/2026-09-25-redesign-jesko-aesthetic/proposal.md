# Proposal

## Why

The user's actual intent for "improving" the SpatialFlow site is to give it the
**same feel and look as jeskojets.com** — a dark, cinematic, luxury,
scroll-driven experience — not the modest fade-in reveals + real furniture
images layered onto the existing warm wood/stone design (the previous
`add-scroll-animations` change, which misread the intent and is being
discarded). Scroll motion was only ever a means to that cinematic end; the
real ask is a full visual-identity reskin of the marketing shell, with the
interactive planner preserved as a usable tool inside it.

Reference aesthetic (jeskojets.com), observed directly:
- Full-bleed cinematic hero with a scroll-linked *zoom-through* transition (an
  airplane window that you scroll into, opening onto clouds).
- A per-section palette journey (sepia → sky-blue → gold → cream → near-black),
  each section a full-bleed background image/color.
- Very large, lightweight display typography; some headlines split around the
  product imagery ("Fly in … luxury").
- A persistent floating pill CTA (bottom-center) and a fixed, minimal top nav.
- Accordion "advantages", large spec tables, and a dark globe "Global" finale.

## What Changes

- **Full reskin of `index.html`'s marketing shell** to the jeskojets cinematic
  language, translated to SpatialFlow's domain (designing a micro-office /
  studio space rather than chartering a jet):
  - A full-bleed cinematic hero built on a *portal* metaphor (looking through
    a doorway/window into a designed studio space) with a **scroll-linked
    zoom-through** transition into the workspace — the analogue of jesko's
    window→clouds zoom.
  - A **per-section palette journey** grounded in the existing `wood`/`stone`
    tokens but pushed to full-bleed cinematic ranges (deep espresso hero →
    warm cream → a "blueprint" cool section → near-black finale).
  - **Large lightweight display type** via a Google-Fonts grotesque loaded by
    `<link>` (no build step), with at least one headline split around a
    furniture/room render.
  - A **persistent floating pill CTA** ("Start Planning") pinned bottom-center,
    and a **fixed minimal top nav**.
  - The existing three feature points restyled as an **accordion**; a **spec
    table** for a featured room preset / furniture piece; a **dark cinematic
    finale** section before the footer.
  - **Scroll-driven reveals and parallax** as the storytelling spine
    (CSS `animation-timeline` where supported, `IntersectionObserver`
    fallback, `prefers-reduced-motion` honored) — the *reusable idea* from the
    discarded change, re-authored to serve the new palette/scenes.
- **The interactive planner stays a clean, usable tool** (user's explicit
  choice): it is lightly restyled to sit within the cinematic shell — framed
  as a bright, high-contrast "studio workbench" panel that intentionally
  contrasts the dark cinematic sections — but its layout, controls, and
  legibility are preserved. Its category model is untouched.
- **No change to the planner's behavior**: room presets, drag/click placement,
  hard bounds/overlap invariants, soft spacing warnings, live utilization/
  power metrics, shopping list, blueprint export, and `localStorage`
  persistence all keep working exactly as today.
- **Precondition (task 1): discard the uncommitted `add-scroll-animations`
  work** and return to the committed baseline `9de3ff3` before building the
  redesign, per the user's decision.
- Real cinematic imagery (hero portal/space, section backgrounds, a featured
  furniture/room render) sourced from openly-licensed libraries and downloaded
  locally, credited — same sourcing discipline as before.

## Capabilities

### New Capabilities

(none — `skip_specs: true`, same repo-wide §4 choice A: no external
consumer/API surface, `docs/site/ARCHITECTURE.md` is the only contract.)

### Modified Capabilities

(none — this is a presentation-layer reskin. It introduces no new stored or
deduced domain data and changes no existing morphism's signature, partiality,
or semantics; the planner's `Layout` category in `docs/site/ARCHITECTURE.md`
is unaffected. `ARCHITECTURE.md` §10 (presentation layer) will be rewritten to
describe the new cinematic scroll-scene mechanism as ambient presentation
`Trn`, per this project's "no imagined architecture" rule — additive
documentation, not a modified capability.)

## Impact

- Affected code: `index.html` only (full rework of markup/CSS for the
  marketing shell + light restyle of the planner container; new
  scroll-scene/reveal JS; a Google-Fonts `<link>`). The planner's logic
  (`FURNITURE_CATALOG`, `compute*`, `addItem`/`moveItem`/…, `serialize`/
  `deserialize`, `persist`/`restore`) is not modified.
- **BREAKING (visual only, no data)**: the site's entire look changes; there
  is no runtime/behavioral break and no storage-schema change
  (`spatialflow.layout.v2` untouched).
- New local assets: cinematic imagery under `images/` (hero/section
  backgrounds, a featured render) plus an `images/CREDITS.md` recording
  source + license per file. One new external stylesheet dependency: Google
  Fonts via `<link>` (no build step, consistent with the existing CDN
  approach).
- New runtime constraint carried over unchanged: still exactly one
  `index.html`, still zero backend/server.
- Docs to reconcile after apply: `docs/site/ARCHITECTURE.md` (rewrite §10
  presentation layer), `docs/site/IMPLEMENTATION.md`, `docs/site/STATUS.md`,
  `docs/STATUS.md`, `docs/site/reviews/` (new §4.5 review).
- Manual verification only (no automated suite, named gap, unchanged): confirm
  the cinematic scroll journey renders across sections, reduced-motion
  degrades gracefully, and the planner's full regression suite still passes
  unmodified.
- **Second review pass (before commit)** surfaced two more defects, folded
  into this same change rather than a new one: a CSS grid sizing bug that
  let the workbench's metrics sidebar bleed past the panel's rounded white
  border at larger room presets, and a showcase image (chair + ottoman) that
  visually collided with the split headline. Both are presentation-only
  fixes — see design.md §12a/§12b.

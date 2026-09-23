# Proposal

## Why

The user supplied a detailed, prescriptive redesign spec for the SpatialFlow
PoC: a Tailwind/Lucide-based visual identity, real-world room dimensions with
selectable presets, per-item cost and power draw, a live utilization/power/
spacing dashboard, an itemized shopping list with running total cost, and a
blueprint export flow. This goes well beyond the original build's scope
(vanilla CSS, no cost/power modeling, no export) — it's a full replacement of
`index.html`, not an incremental patch.

## What Changes

- Replace `index.html` entirely with a new build: Tailwind CSS (CDN) +
  Lucide icons (CDN) + vanilla JS, still zero build step, zero backend.
- New landing hero with a "Launch Studio Planner" CTA that smooth-scrolls
  into the planner.
- Room dimensions become a `RoomPreset → RoomConfig` selection (e.g. 8×10 ft,
  10×12 ft) instead of one fixed 20×12-cell room.
- Furniture catalog replaced with the five named items (Ergonomic Standing
  Desk, Acoustic Pod Panel, Studio Lighting Rig, Bookshelf, Ergonomic Chair),
  each carrying real-world cost (`$`), power draw (`watts`), and a clearance
  buffer (`clearanceFt`) — none of which the old `FurnitureCatalogEntry`
  tracked.
- New deduced (never-stored) morphisms: `computeUtilization`,
  `computePower`, `computeSpacing` (soft warning, does not block placement),
  `computeShoppingList`, `buildBlueprint`.
- New export flow: "Export / Save Blueprint" → `buildBlueprint` → success
  modal + client-side `.json` file download (`downloadBlueprint`, a Blob +
  anchor-click — no backend).
- **Reversal of a prior design decision**: the original `design.md`
  (archived under `build-index-html`) set "no external JS libraries/CDNs" as
  a non-goal. This change explicitly reverses that — Tailwind and Lucide CDN
  tags are now required by the user. Recorded here rather than silently
  overwritten.
- Room-bounds and item-overlap remain **hard** invariants (unchanged from the
  prior build); the new clearance/spacing check is **soft** — flagged, not
  blocked.

## Capabilities

### New Capabilities

(none — `skip_specs: true`. Same repo-wide §4 choice A: no external
consumer/API surface, `docs/site/ARCHITECTURE.md` is the only contract.)

### Modified Capabilities

(none — no `openspec/specs/` capabilities exist in this repo to modify.)

## Impact

- Affected code: `index.html` (full rewrite, same single file).
- New external runtime dependencies (CDN-loaded, no install step): Tailwind
  CSS CDN script, Lucide icons CDN script.
- Docs to reconcile after apply: `docs/site/IMPLEMENTATION.md` (all rows
  rewritten against the new `index.html`), `docs/site/STATUS.md`,
  `docs/STATUS.md`, `docs/site/reviews/` (new §4.5 review for this change).
- `docs/site/ARCHITECTURE.md` was already updated in this session ahead of
  this proposal — this change's job is to make the code match it, not to
  change the model further.

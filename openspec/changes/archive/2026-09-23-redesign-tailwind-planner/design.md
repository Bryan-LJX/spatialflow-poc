# Design

## Context

Full replacement of the existing `index.html` (built under the archived
`build-index-html` change). Still a single file, zero backend, zero build
step — but the user now mandates Tailwind CSS (CDN) and Lucide icons (CDN),
real-world room/furniture dimensions with cost and power data, and a
shopping-list/export flow. `docs/site/ARCHITECTURE.md` already models every
object and morphism this design needs to realise; this file picks the
concrete DOM/JS/CSS shape.

## Goals / Non-Goals

**Goals:**
- Match every `Trn`/`Trm` in ARCHITECTURE.md §7 with a named JS function of
  the same signature shape (same discipline as the prior build, extended).
- Tailwind utility classes for all layout/visual styling; a small `<style>`
  block only for things Tailwind's utility set can't express directly
  (custom CSS grid background for the floor plan, drag-ghost positioning,
  keyframe transitions).
- Lucide icons loaded via CDN, rendered via `lucide.createIcons()` after any
  DOM mutation that introduces new `<i data-lucide="...">` nodes.
- Real-time recompute of utilization/power/spacing/shopping-list on every
  `Layout` mutation — no cached/stale values, per ARCHITECTURE.md §6 rule 8.
- Fully responsive: sidebar catalog collapses to a horizontal scroll strip
  or accordion below Tailwind's `md` breakpoint; grid canvas scales down
  proportionally.

**Non-Goals:**
- No bundler, no npm, no local copies of Tailwind/Lucide — CDN only, per the
  user's explicit requirement (this reverses the prior build's "no CDN"
  non-goal, see proposal.md).
- No true drag-and-drop file/library (e.g. SortableJS, interact.js) — native
  Pointer Events again, now driving Tailwind-styled elements instead of
  hand-rolled CSS.
- No real payment/checkout for the shopping list — it's a cost estimate and
  a JSON export, not a cart.
- No multi-room, no undo/redo — same PoC scope boundary as before.

## Decisions

1. **Room presets.** `ROOM_PRESETS = [{id, label:"8×10 ft", widthFt:8,
   heightFt:10}, {id, label:"10×12 ft", widthFt:10, heightFt:12}, {id,
   label:"12×14 ft", widthFt:12, heightFt:14}]`. `selectRoom` swaps
   `state.layout.room` and re-validates existing placed items against the
   new bounds, dropping (with a toast-style notice) any that no longer fit —
   simplest correct behavior, avoids silently leaving out-of-bounds items on
   the canvas.
2. **Grid scale.** 1 ft = one CSS grid cell, cell size in `px` computed at
   render time from the container width (`clamp`-like: `min(48, containerW /
   room.widthFt)`) so the same model renders full-size on desktop and
   shrinks to fit on mobile without changing `Layout` units.
3. **Furniture catalog** (`FURNITURE_CATALOG`, extends the old shape with
   `costUsd`, `watts`, `clearanceFt`):
   | type | wFt×hFt | costUsd | watts | clearanceFt |
   | --- | --- | --- | --- | --- |
   | standing-desk | 3×2 | 449 | 90 | 1 |
   | acoustic-panel | 2×1 | 189 | 0 | 0 |
   | lighting-rig | 2×1 | 129 | 60 | 0 |
   | bookshelf | 3×1 | 219 | 0 | 0 |
   | ergo-chair | 1×1 | 259 | 0 | 1 |

   `watts: 0` items are non-powered — `computePower` only sums powered
   items, matching ARCHITECTURE.md §4's "sums watts of powered items."
4. **Power outlet heuristic constants**, named exactly as ARCHITECTURE.md §6
   rule 5: `OUTLETS_PER_STRIP = 4`, `CIRCUIT_WATT_CAP = 1800`.
5. **Spacing warning rendering.** `computeSpacing` returns a list of
   colliding-clearance item-id pairs; the canvas outlines each flagged item
   with a dashed amber ring (Tailwind `ring-2 ring-amber-400 ring-offset-2
   ring-dashed` via an arbitrary-value class) and the summary panel shows a
   count + short text ("2 items closer than recommended clearance") — never
   blocks `addItem`/`moveItem`.
6. **Shopping list.** `computeShoppingList` groups `state.layout.items` by
   `catalogId`, returns `[{catalogId, label, qty, unitCost, subtotal}]` plus
   a grand total; rendered as a table in the summary panel, recomputed on
   every render call (same function powers both the live panel and
   `buildBlueprint`'s snapshot — no duplication).
7. **Export flow.** "Export / Save Blueprint" click → `buildBlueprint(state.layout)`
   → open a modal (Tailwind `fixed inset-0` overlay) rendering the room,
   item count, total cost, outlet count, and utilization % → a
   "Download JSON" button inside the modal calls `downloadBlueprint`, which
   creates a `Blob([JSON.stringify(blueprint)], {type:'application/json'})`,
   an object URL, and a hidden `<a download>` click — pure client-side, no
   network call, satisfies "Export / Save" without a backend.
8. **Persistence unchanged in kind**: `serialize`/`deserialize`/`persist`/
   `restore` and the `spatialflow.layout.v1` `localStorage` key carry over
   from the prior build, extended to include the selected `RoomPreset` id so
   a reload restores the same room size too.
9. **Aesthetic tokens** (Tailwind config via inline `tailwind.config` on the
   CDN script tag, so custom colors are still utility classes, not raw CSS):
   `stone` neutrals for structure, a custom `wood` color scale (`#8b5e3c`
   family) for accents (buttons, active states, the CTA), `slate` for text.
   Typography: Tailwind's default sans stack, `tracking-tight` on headings
   for the "crisp" requirement.

## Risks / Trade-offs

- CDN dependency means the page needs network access on first load for
  Tailwind/Lucide (Non-Goal accepted this explicitly — the user asked for
  CDN, not an offline-first file). Documented in STATUS.md as a known
  characteristic, not a defect.
- Dropping out-of-bounds items on room-preset switch is a lossy operation;
  acceptable for a PoC, called out to the user via an on-canvas notice
  rather than done silently.
- Still no automated test suite — verification is manual in-browser, same as
  the prior build. The round-trip and invariant checks from the prior review
  apply again here plus new ones for cost/power/spacing.

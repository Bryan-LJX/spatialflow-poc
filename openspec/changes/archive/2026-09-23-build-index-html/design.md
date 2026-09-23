# Design

## Context

Greenfield, single-file PoC. No build step, no backend, no framework — the
constraint from the user is absolute: one `index.html`. `docs/site/ARCHITECTURE.md`
already fixes the model (`RoomConfig`, `FurnitureItem`, `Layout`,
`StoredLayoutJSON`, and the `addItem`/`moveItem`/`rotateItem`/`removeItem`/
`serialize`/`deserialize` morphisms); this design just picks the concrete DOM/JS
shape that realises it.

## Goals / Non-Goals

**Goals:**
- Realise every `Trn`/`Trm` in ARCHITECTURE.md §7 with a named JS function of
  the same signature shape, so IMPLEMENTATION.md rows map cleanly.
- Enforce the two composition rules (bounds, no-overlap) at the same call
  sites the model names (`addItem`/`moveItem`), not scattered elsewhere.
- Keep the planner demo genuinely interactive (pointer drag, not just click-
  to-place) so it reads as a believable PoC of the product.

**Non-Goals:**
- No backend, no build tooling, no external JS libraries/CDNs (keeps it a
  true single-file artifact with no network dependency at load time).
- No multi-room support, no undo/redo, no collision-avoidance pathfinding —
  out of scope for a PoC.
- No automated test runner — this is a static file; verification is manual
  in-browser plus the round-trip check noted below.

## Decisions

1. **State shape.** `Layout = { room: {widthCells, heightCells}, items: [{id,
   type, x, y, w, h, rotation}] }`, held in one JS object (`state.layout`),
   matching ARCHITECTURE.md §3 exactly — one object, not split across DOM
   attributes and JS state.
2. **Grid coordinates in cells, not pixels.** `x`/`y`/`w`/`h` are integer grid
   cells; rendering multiplies by a fixed `CELL_PX` constant. Keeps
   bounds/overlap checks integer comparisons, not float pixel math.
3. **Catalog is a static const array** (`FURNITURE_CATALOG`), not fetched —
   satisfies "no backend."
4. **Persistence key:** a single fixed `localStorage` key
   (`spatialflow.layout.v1`). `serialize`/`deserialize` are pure functions;
   `persist`/`restore` are the only two places that touch `localStorage`,
   keeping the Trm boundary real per ARCHITECTURE.md §9 Law 2.
5. **`deserialize` failure mode:** try/catch around `JSON.parse` plus a
   bounds/overlap re-validation pass; on any failure, fall back to a default
   empty `Layout` and clear the bad key — matches the "Partial" marking in
   ARCHITECTURE.md §4.
6. **Drag implementation:** native Pointer Events (`pointerdown`/
   `pointermove`/`pointerup`) on catalog entries and placed items, no
   external drag-and-drop library — keeps the no-dependency constraint.

## Risks / Trade-offs

- Single inline `<script>` in one HTML file will read as "one big file" —
  acceptable per the user's explicit single-file requirement; internal
  organisation (clearly commented sections per Dat/Trn) keeps it navigable.
- No automated tests means the round-trip law (`deserialize ∘ serialize =
  id`) is verified manually in-browser (save → reload → compare), not by a
  test suite. Acceptable for a PoC; noted as a gap in STATUS.md.

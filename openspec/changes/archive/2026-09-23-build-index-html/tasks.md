# Tasks

## 1. Page shell + marketing content

- [x] 1.1 `index.html` skeleton: doctype, head (title, meta, inline `<style>`), body sections
- [x] 1.2 Hero section: SpatialFlow name, tagline, CTA to the demo
- [x] 1.3 Product pitch section: what the Micro-Office / Studio Layout Planner does
- [x] 1.4 Features section (3–4 feature cards)
- [x] 1.5 Footer

## 2. Planner data model (Dat, ARCHITECTURE.md §3)

- [x] 2.1 `FURNITURE_CATALOG` const (`FurnitureCatalogEntry[]`)
- [x] 2.2 `state.layout` initial value (`RoomConfig` + empty `items[]`)
- [x] 2.3 `serialize` / `deserialize` functions, with bounds/overlap re-validation on deserialize

## 3. Planner rendering + interaction (Trn, ARCHITECTURE.md §5/§7)

- [x] 3.1 `renderGrid`: draw room grid + placed items from `state.layout`
- [x] 3.2 `instantiate` + `addItem`: drag a catalog entry onto the grid, clamp to bounds, reject overlap
- [x] 3.3 `moveItem`: drag a placed item to a new cell, clamp to bounds, reject overlap
- [x] 3.4 `rotateItem`, `removeItem` controls on a placed item
- [x] 3.5 Reset-layout control (back to default empty `Layout`)

## 4. Persistence (Trm, ARCHITECTURE.md §7/§9)

- [x] 4.1 `persist`: save current layout to `localStorage` (key `spatialflow.layout.v1`) on every edit
- [x] 4.2 `restore`: load on page init, fall back to default `Layout` on missing/invalid data

## 5. Verify + reconcile

- [x] 5.1 Manual round-trip check: build a layout, reload the page, confirm it restores identically (`deserialize ∘ serialize = id`) — verified in-browser via local HTTP preview: placed a desk, reloaded, `localStorage` restored it at identical coordinates.
- [x] 5.2 Manual bounds/overlap check: attempt to drag an item off-grid or onto an occupied cell, confirm it's rejected — verified: dragging a chair onto an occupied cell was silently rejected, item count stayed at 1.
- [x] 5.3 Update `docs/site/IMPLEMENTATION.md` rows to `built` with `index.html` symbol refs
- [x] 5.4 Update `docs/site/STATUS.md` and `docs/STATUS.md` to reflect built state
- [x] 5.5 Run `supercharge-drift` and fix any dead rows
- [x] 5.6 Write `docs/site/reviews/review-build-index-html.md` (§4.5 checklist run)

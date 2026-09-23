# Site — implementation map

> The functor ARCHITECTURE.md → code. Each object/morphism → the file:symbol that
> realises it. Keep in sync WITH the code (§6.3): a new morphism gets a row here in
> the same change that adds its code.

## Objects (Dat) → code

| Object | Form / shape | Realised at | State |
| --- | --- | --- | --- |
| `RoomPreset` | `{ id, label, widthFt, heightFt }` | `index.html:ROOM_PRESETS` | built |
| `RoomConfig` | `{ presetId, widthFt, heightFt }` | `index.html:defaultLayout` | built |
| `FurnitureCatalogEntry` | `{ type, label, icon, w, h, costUsd, watts, clearanceFt, color }` | `index.html:FURNITURE_CATALOG` | built |
| `FurnitureItem` | `{ id, type, x, y, w, h, rotation }` | `index.html:instantiate` | built |
| `Layout` | `{ room: RoomConfig, items: FurnitureItem[] }` | `index.html:defaultLayout` | built |
| `StoredLayoutJSON` | `JSON.stringify(Layout)` under `localStorage` key `spatialflow.layout.v2` | `index.html:STORAGE_KEY` | built |
| `UtilizationMetrics` | `{ usedSqFt, totalSqFt, pct }` | `index.html:computeUtilization` | built |
| `PowerEstimate` | `{ totalWatts, poweredCount, outlets }` | `index.html:computePower` | built |
| `SpacingWarnings` | `{ pairs, flaggedIds }` | `index.html:computeSpacing` | built |
| `ShoppingList` | `{ rows, total }` | `index.html:computeShoppingList` | built |
| `Blueprint` | `{ room, items, utilization, power, spacing, shoppingList, exportedAt }` | `index.html:buildBlueprint` | built |

## Morphisms (Trn / relations) → code

| Morphism | Signature | Realising code | State |
| --- | --- | --- | --- |
| `selectRoom` | `RoomPreset → RoomConfig` | `index.html:selectRoom` | built |
| `renderGrid` | `Layout → DOM` | `index.html:renderGrid` | built |
| `instantiate` | `(FurnitureCatalogEntry, x, y) → FurnitureItem` | `index.html:instantiate` | built |
| `addItem` | `(Layout, FurnitureCatalogEntry, x, y) → Layout` | `index.html:addItem` | built |
| `moveItem` | `(Layout, id, x, y) → Layout` | `index.html:moveItem` | built |
| `rotateItem` | `(Layout, id) → Layout` | `index.html:rotateItem` | built |
| `removeItem` | `(Layout, id) → Layout` | `index.html:removeItem` | built |
| `serialize` | `Layout → StoredLayoutJSON` | `index.html:serialize` | built |
| `deserialize` | `StoredLayoutJSON → Layout` | `index.html:deserialize` | built |
| `computeUtilization` | `Layout → UtilizationMetrics` | `index.html:computeUtilization` | built |
| `computePower` | `Layout → PowerEstimate` | `index.html:computePower` | built |
| `computeSpacing` | `Layout → SpacingWarnings` | `index.html:computeSpacing` | built |
| `computeShoppingList` | `Layout → ShoppingList` | `index.html:computeShoppingList` | built |
| `buildBlueprint` | `Layout → Blueprint` | `index.html:buildBlueprint` | built |
| `persist` (Trm) | `Layout(runtime) → StoredLayoutJSON(localStorage)` | `index.html:persist` | built |
| `restore` (Trm) | `StoredLayoutJSON(localStorage) → Layout(runtime)` | `index.html:restore` | built |
| `downloadBlueprint` (Trm) | `Blueprint(runtime) → JSON file(downloads)` | `index.html:downloadBlueprint` | built |

## Composition rules → where enforced

| Rule (ARCHITECTURE §6) | Enforced at | Tested at |
| --- | --- | --- |
| bounds invariant (hard) | `index.html:withinBounds`, called from `index.html:placementValid` | manual, see review |
| no-overlap invariant (hard) | `index.html:hasCollision` / `index.html:overlaps`, called from `index.html:placementValid` | manual, see review |
| `deserialize ∘ serialize = id` | `index.html:deserialize` (re-validates via bounds/collision on load) | manual, see review |
| power outlet formula (`OUTLETS_PER_STRIP=4`, `CIRCUIT_WATT_CAP=1800`) | `index.html:computePower` | manual, see review |
| spacing/clearance invariant (soft) | `index.html:computeSpacing` | manual, see review |
| shopping-list total = Σ subtotal | `index.html:computeShoppingList` | manual, see review |

## Notes / divergences

- `addItem`/`moveItem`/`rotateItem` reject an invalid placement **silently**
  (return without mutating; `addItem` additionally shows a toast via
  `index.html:flashInvalid` when a catalog item has nowhere to go) — same
  PoC-level choice as the prior build, still recorded rather than left
  implicit per §6.6.
- `localStorage` key bumped from `spatialflow.layout.v1` (prior build) to
  `spatialflow.layout.v2` here because the stored shape changed (`room` now
  carries `presetId`) — a `v1` reader would otherwise misparse `v2` data.
  Old `v1` entries are simply orphaned, not migrated; acceptable for a PoC.
  See `openspec/changes/archive/2026-09-23-redesign-tailwind-planner/tasks.md`
  §7.1.
- Design's planned `ring-dashed` Tailwind arbitrary value was replaced with a
  plain `.spacing-warning { outline: dashed }` CSS class — `ring-*` utilities
  are box-shadow based and can't render a dashed line; same visual intent,
  substitution noted per §6.6.
- No automated test suite exists; verification is manual in-browser (see
  `reviews/review-redesign-tailwind-planner.md`). Named gap, not a silent
  one — unchanged from the prior build.

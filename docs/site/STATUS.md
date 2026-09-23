# Site — status

> Reconciles ARCHITECTURE.md (intent) vs IMPLEMENTATION.md (code). Updated whenever
> code changes what is done (§6.5).

## Headline

✅ built — `index.html` fully rebuilt (Tailwind CSS + Lucide icons via CDN,
vanilla JS) per the current `docs/site/ARCHITECTURE.md`: landing hero,
room-preset-driven layout builder, live utilization/power/spacing metrics,
itemized shopping list, and blueprint export. Supersedes the prior plain-CSS
build (archived under `openspec/changes/archive/2026-09-23-build-index-html/`).

## Completeness

| Object / morphism | State | Notes |
| --- | --- | --- |
| `RoomPreset` / `RoomConfig` / `FurnitureCatalogEntry` / `FurnitureItem` / `Layout` / `StoredLayoutJSON` | ✅ built | |
| `UtilizationMetrics` / `PowerEstimate` / `SpacingWarnings` / `ShoppingList` / `Blueprint` | ✅ built | all deduced, recomputed every render — verified manually |
| `selectRoom` / `renderGrid` | ✅ built | preset switch drops out-of-bounds items with notice |
| `addItem` / `moveItem` / `rotateItem` / `removeItem` | ✅ built | hard bounds + overlap invariants verified manually (off-grid drag and item-on-item drag both rejected) |
| `serialize` / `deserialize` | ✅ built | round-trip verified manually via browser reload |
| `persist` / `restore` (Trm) | ✅ built | key `spatialflow.layout.v2` |
| `computeUtilization` / `computePower` | ✅ built | verified against hand-computed values for a known layout |
| `computeSpacing` | ✅ built | soft warning confirmed non-blocking |
| `computeShoppingList` / `buildBlueprint` / `downloadBlueprint` (Trm) | ✅ built | modal contents verified to match canvas; download click ran with no console errors |

## Needs work

1. No automated test suite — invariant, round-trip, and cost/power checks
   are manual only. Same accepted gap as the prior build.
2. Room-preset switch drops out-of-bounds items with a notice, but there's
   no undo — acceptable for a PoC, could be revisited if this grows past
   demo scope.

## Coherence

§4.5 checklist run in `reviews/review-redesign-tailwind-planner.md` — all
checkable laws pass; see that file for the one-line rationale per law.

## Where to dig

- Model: [ARCHITECTURE.md](ARCHITECTURE.md) · Code map: [IMPLEMENTATION.md](IMPLEMENTATION.md)
- In flight: `openspec/changes/` (none — `redesign-tailwind-planner` archived)
- Reviews: [reviews/review-redesign-tailwind-planner.md](reviews/review-redesign-tailwind-planner.md) · Notes: `general/`

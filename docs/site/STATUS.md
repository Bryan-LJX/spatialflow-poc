# Site — status

> Reconciles ARCHITECTURE.md (intent) vs IMPLEMENTATION.md (code). Updated whenever
> code changes what is done (§6.5).

## Headline

✅ built — `index.html` realises the full ARCHITECTURE.md model: marketing
content plus an interactive planner (drag-drop, rotate, remove, persist).

## Completeness

| Object / morphism | State | Notes |
| --- | --- | --- |
| `RoomConfig` / `FurnitureCatalogEntry` / `FurnitureItem` / `Layout` / `StoredLayoutJSON` | ✅ built | |
| `renderGrid` | ✅ built | |
| `addItem` / `moveItem` / `rotateItem` / `removeItem` | ✅ built | bounds + no-overlap invariants enforced, verified manually |
| `serialize` / `deserialize` | ✅ built | round-trip verified manually via browser reload |
| `persist` / `restore` (Trm) | ✅ built | verified: `localStorage` key `spatialflow.layout.v1` |

## Needs work

1. No automated test suite — invariant and round-trip checks are manual only.
   Acceptable for this PoC's scope; would need `deserialize ∘ serialize = id`
   as an actual assertion before this became more than a demo.

## Coherence

§4.5 checklist run in `reviews/review-build-index-html.md` — all checkable
laws pass; see that file for the one-line rationale per law.

## Where to dig

- Model: [ARCHITECTURE.md](ARCHITECTURE.md) · Code map: [IMPLEMENTATION.md](IMPLEMENTATION.md)
- In flight: `openspec/changes/` (none — `build-index-html` archived)
- Reviews: [reviews/review-build-index-html.md](reviews/review-build-index-html.md) · Notes: `general/`

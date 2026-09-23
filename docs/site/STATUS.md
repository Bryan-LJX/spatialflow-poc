# Site — status

> Reconciles ARCHITECTURE.md (intent) vs IMPLEMENTATION.md (code). Updated whenever
> code changes what is done (§6.5).

## Headline

⬜ unbuilt — model is written, no code yet. Next: build `index.html` per an
OpenSpec change.

## Completeness

| Object / morphism | State | Notes |
| --- | --- | --- |
| `RoomConfig` / `FurnitureCatalogEntry` / `FurnitureItem` / `Layout` / `StoredLayoutJSON` | ⬜ unbuilt | modeled, not coded |
| `renderGrid` | ⬜ unbuilt | |
| `addItem` / `moveItem` / `rotateItem` / `removeItem` | ⬜ unbuilt | |
| `serialize` / `deserialize` | ⬜ unbuilt | |
| `persist` / `restore` (Trm) | ⬜ unbuilt | |

## Needs work

1. Build `index.html` — marketing sections + the interactive planner grid,
   per ARCHITECTURE.md §3–§7.

## Coherence

Not yet checkable — no code to run the §4.5 checklist against.

## Where to dig

- Model: [ARCHITECTURE.md](ARCHITECTURE.md) · Code map: [IMPLEMENTATION.md](IMPLEMENTATION.md)
- In flight: `openspec/changes/<slug>/` · Reviews: `reviews/` · Notes: `general/`

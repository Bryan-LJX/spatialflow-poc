# Site — implementation map

> The functor ARCHITECTURE.md → code. Each object/morphism → the file:symbol that
> realises it. Keep in sync WITH the code (§6.3): a new morphism gets a row here in
> the same change that adds its code.

## Objects (Dat) → code

| Object | Form / shape | Realised at | State |
| --- | --- | --- | --- |
| `RoomConfig` | `{ widthCells, heightCells }` | `index.html:defaultLayout` | built |
| `FurnitureCatalogEntry` | `{ type, label, w, h, color }` | `index.html:FURNITURE_CATALOG` | built |
| `FurnitureItem` | `{ id, type, x, y, w, h, rotation }` | `index.html:instantiate` | built |
| `Layout` | `{ room: RoomConfig, items: FurnitureItem[] }` | `index.html:defaultLayout` | built |
| `StoredLayoutJSON` | `JSON.stringify(Layout)` under `localStorage` key `spatialflow.layout.v1` | `index.html:STORAGE_KEY` | built |

## Morphisms (Trn / relations) → code

| Morphism | Signature | Realising code | State |
| --- | --- | --- | --- |
| `renderGrid` | `Layout → DOM` | `index.html:renderGrid` | built |
| `instantiate` | `(FurnitureCatalogEntry, x, y) → FurnitureItem` | `index.html:instantiate` | built |
| `addItem` | `(Layout, FurnitureCatalogEntry, x, y) → Layout` | `index.html:addItem` | built |
| `moveItem` | `(Layout, id, x, y) → Layout` | `index.html:moveItem` | built |
| `rotateItem` | `(Layout, id) → Layout` | `index.html:rotateItem` | built |
| `removeItem` | `(Layout, id) → Layout` | `index.html:removeItem` | built |
| `serialize` | `Layout → StoredLayoutJSON` | `index.html:serialize` | built |
| `deserialize` | `StoredLayoutJSON → Layout` | `index.html:deserialize` | built |
| `persist` (Trm) | `Layout(runtime) → StoredLayoutJSON(localStorage)` | `index.html:persist` | built |
| `restore` (Trm) | `StoredLayoutJSON(localStorage) → Layout(runtime)` | `index.html:restore` | built |

## Composition rules → where enforced

| Rule (ARCHITECTURE §6) | Enforced at | Tested at |
| --- | --- | --- |
| bounds invariant | `index.html:withinBounds`, called from `index.html:placementValid` | manual, see review |
| no-overlap invariant | `index.html:hasCollision` / `index.html:overlaps`, called from `index.html:placementValid` | manual, see review |
| `deserialize ∘ serialize = id` | `index.html:deserialize` (re-validates via `placementValid` on load) | manual, see review |

## Notes / divergences

- `addItem`/`moveItem`/`rotateItem` reject an invalid placement **silently**
  (return the layout unchanged) rather than surfacing an error to the user —
  acceptable at PoC level (ARCHITECTURE.md doesn't require user-facing error
  messaging), noted here per §6.6 rather than left implicit.
- No automated test suite exists; the round-trip and invariant checks were run
  manually in-browser (see `reviews/review-build-index-html.md`). This is a
  named gap, not a silent one.

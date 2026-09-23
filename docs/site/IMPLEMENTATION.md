# Site — implementation map

> The functor ARCHITECTURE.md → code. Each object/morphism → the file:symbol that
> realises it. Keep in sync WITH the code (§6.3): a new morphism gets a row here in
> the same change that adds its code.

## Objects (Dat) → code

| Object | Form / shape | Realised at | State |
| --- | --- | --- | --- |
| `RoomConfig` | `{ widthCells, heightCells }` | planned — `index.html` inline script | planned |
| `FurnitureCatalogEntry` | `{ type, label, w, h, icon }` | planned — `index.html` inline script | planned |
| `FurnitureItem` | `{ id, type, x, y, w, h, rotation }` | planned — `index.html` inline script | planned |
| `Layout` | `{ room: RoomConfig, items: FurnitureItem[] }` | planned — `index.html` inline script | planned |
| `StoredLayoutJSON` | `JSON.stringify(Layout)` under a fixed `localStorage` key | planned — `index.html` inline script | planned |

## Morphisms (Trn / relations) → code

| Morphism | Signature | Realising code | State |
| --- | --- | --- | --- |
| `renderGrid` | `Layout → DOM` | planned | planned |
| `addItem` | `(Layout, FurnitureCatalogEntry, x, y) → Layout` | planned | planned |
| `moveItem` | `(Layout, id, x, y) → Layout` | planned | planned |
| `rotateItem` | `(Layout, id) → Layout` | planned | planned |
| `removeItem` | `(Layout, id) → Layout` | planned | planned |
| `serialize` | `Layout → StoredLayoutJSON` | planned | planned |
| `deserialize` | `StoredLayoutJSON → Layout` | planned | planned |
| `persist` (Trm) | `Layout(runtime) → StoredLayoutJSON(localStorage)` | planned | planned |
| `restore` (Trm) | `StoredLayoutJSON(localStorage) → Layout(runtime)` | planned | planned |

## Composition rules → where enforced

| Rule (ARCHITECTURE §6) | Enforced at | Tested at |
| --- | --- | --- |
| bounds invariant | planned — `addItem`/`moveItem` | planned |
| no-overlap invariant | planned — `addItem`/`moveItem` | planned |
| `deserialize ∘ serialize = id` | planned | planned |

## Notes / divergences

None yet — nothing is built.

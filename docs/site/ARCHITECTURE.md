# Site — categorical model

> Model-first (FRAMEWORK §2/§4). Intended specification for this component; the
> code realises it (see IMPLEMENTATION.md). Source of record: `index.html`.

## 1. Overview

The entire SpatialFlow PoC: a single `index.html` file (Tailwind CSS + Lucide
icons via CDN `<script>`/`<link>` tags, vanilla JS, no build step, no backend)
that markets "small-space productivity pods and custom micro-studio layouts"
and demonstrates the concept with a client-side interactive planner — a
feet-scaled room floor plan onto which the visitor places modular furniture,
with real-time utilization/power/clearance calculations, an itemized
shopping-list-and-cost summary, and a blueprint export. There is only one
component because there is only one deployable artifact and no service
boundary to split on.

## 2. Why

Beyond the runtime/storage split (unchanged from the original model), this
revision adds a second real seam: **stored vs. deduced** state. Utilization,
power-outlet count, spacing warnings, shopping-list totals and blueprint
export are all *computable from* `Layout` — none of them may become a second
place that "what's on the grid" is stored, or they will drift from the
canvas the moment an item moves. Naming them as deduced morphisms up front is
what stops that drift before any code exists.

## 3. Core category

```mermaid
graph LR
    RP["RoomPreset"]
    RC["RoomConfig"]
    FI["FurnitureItem"]
    CAT["FurnitureCatalogEntry"]
    LO["Layout"]
    SJ["StoredLayoutJSON"]
    UM["UtilizationMetrics"]
    PE["PowerEstimate"]
    SW["SpacingWarnings"]
    SL["ShoppingList"]
    BP["Blueprint"]

    RP -->|"selectRoom (total)"| RC
    RC -->|"layoutRoom (total)"| LO
    FI -->|"placedIn (total)"| LO
    CAT -->|"instantiate (total)"| FI
    LO -->|"serialize (total)"| SJ
    SJ -.->|"deserialize (partial)"| LO
    LO -.->|"computeUtilization (deduced)"| UM
    LO -.->|"computePower (deduced)"| PE
    LO -.->|"computeSpacing (deduced)"| SW
    LO -.->|"computeShoppingList (deduced)"| SL
    LO -.->|"buildBlueprint (deduced)"| BP

    style RP fill:#f7c04f,color:#000
    style RC fill:#4f8cf7,color:#fff
    style FI fill:#4f8cf7,color:#fff
    style CAT fill:#f7c04f,color:#000
    style LO fill:#4f8cf7,color:#fff
    style SJ fill:#4f8cf7,color:#fff
    style UM fill:#9a9a9a,color:#fff
    style PE fill:#9a9a9a,color:#fff
    style SW fill:#9a9a9a,color:#fff
    style SL fill:#9a9a9a,color:#fff
    style BP fill:#9a9a9a,color:#fff
```

## 4. Morphism table

| Morphism | Signature | Partiality | Semantics |
| --- | --- | --- | --- |
| `selectRoom` | `RoomPreset → RoomConfig` | Total | picking a preset (e.g. 8×10 ft) fixes the room's working dimensions |
| `layoutRoom` | `RoomConfig → Layout` | Total | a layout always has exactly one room config |
| `placedIn` | `FurnitureItem → Layout` | Total | every placed item belongs to the current layout |
| `instantiate` | `FurnitureCatalogEntry → FurnitureItem` | Total | placing a catalog entry creates a placed item at default rotation |
| `serialize` | `Layout → StoredLayoutJSON` | Total | any in-memory layout can be turned into storable JSON |
| `deserialize` | `StoredLayoutJSON → Layout` | Partial | fails/falls back to default on malformed or missing storage |
| `computeUtilization` | `Layout → UtilizationMetrics` | Deduced | `usedSqFt / totalSqFt`; never stored, recomputed on every edit |
| `computePower` | `Layout → PowerEstimate` | Deduced | sums `watts` of powered items; outlets from item-count and wattage caps (§6) |
| `computeSpacing` | `Layout → SpacingWarnings` | Deduced | flags item pairs whose clearance buffers intersect (soft — does not block placement) |
| `computeShoppingList` | `Layout → ShoppingList` | Deduced | groups placed items by catalog type, sums quantity × unit cost |
| `buildBlueprint` | `Layout → Blueprint` | Deduced | snapshots room, items, and all four metrics above into one exportable record |

## 5. Functors

**Edit pipeline** — unchanged in shape from the original model, still the
spine everything else hangs off:

```mermaid
graph LR
    A["Pointer/click gesture"] -->|"addItem / moveItem / rotateItem / removeItem"| B["Layout (in memory)"]
    B -->|"serialize"| C["StoredLayoutJSON"]
    C -->|"persist (Trm)"| D["localStorage"]
    D -->|"restore (Trm)"| E["StoredLayoutJSON"]
    E -->|"deserialize"| B
    B -.->|"compute*"| F["Metrics (deduced, re-run every edit)"]
```

| Step | Signature | Partiality |
| --- | --- | --- |
| `addItem` | `(Layout, FurnitureCatalogEntry, x, y) → Layout` | Total (clamped to grid bounds) |
| `moveItem` | `(Layout, id, x, y) → Layout` | Partial — no-op if `id` absent or target cell occupied |
| `rotateItem` | `(Layout, id) → Layout` | Partial — no-op if `id` absent |
| `removeItem` | `(Layout, id) → Layout` | Partial — no-op if `id` absent |

**Export pipeline** — new. `Layout → Blueprint → JSON file`, the second arrow
a real cross-`Loc` transmission (§7):

```mermaid
graph LR
    B["Layout (in memory)"] -->|"buildBlueprint"| BP["Blueprint"]
    BP -->|"downloadBlueprint (Trm)"| DL["Downloads folder (.json)"]
    BP -->|"renderSuccessModal"| DOM["Confirmation modal (DOM)"]
```

## 6. Composition rules

1. `invariant: every FurnitureItem.x,y,w,h stays within RoomConfig bounds` — enforced at `addItem`/`moveItem`, never at render time. **Hard** — a violating placement is rejected outright, because it is physically impossible.
2. `invariant: no two FurnitureItem footprints in the same Layout overlap` — enforced at `addItem`/`moveItem`. **Hard**, same reason.
3. `deduction: deserialize = validate ∘ JSON.parse` — a `StoredLayoutJSON` that fails rules 1–2 is rejected, not repaired; `deserialize` falls back to the default empty `Layout`.
4. `deduction: computeUtilization = (Σ item.wFt·item.hFt) / (room.widthFt·room.heightFt)` — never stored; recomputed from `Layout.items` on every render.
5. `deduction: computePower = { totalWatts: Σ item.watts, outlets: max(⌈poweredCount / OUTLETS_PER_STRIP⌉, ⌈totalWatts / CIRCUIT_WATT_CAP⌉) }` where `OUTLETS_PER_STRIP = 4` and `CIRCUIT_WATT_CAP = 1800` (a standard 15A/120V circuit) — both constants named in code, not magic numbers.
6. `invariant (soft): spacing clearance` — each catalog entry declares a `clearanceFt` buffer; `computeSpacing` flags (but does not block) any pair of items whose *expanded* footprints (footprint + clearance) intersect. Soft because blocking on clearance near walls would make the demo unusable; the warning is the point, not a hard gate.
7. `deduction: computeShoppingList = groupBy(catalogId) ∘ map(item ↦ {qty: 1, unitCost: catalog[item.catalogId].cost})` then `Σ subtotal` for the total — never hand-maintained, always derived from current `Layout.items`.
8. `deduction: buildBlueprint = { room, items, computeUtilization, computePower, computeSpacing, computeShoppingList, timestamp: now() }` — the *only* place all four metrics are snapshotted together; the live summary panel calls the four `compute*` functions independently on every render instead of reading a stale `Blueprint`.

## 7. Atoms owned (FRAMEWORK §4)

**Trn** —

| `Trn` | `t_from → t_to` | Realising code |
| --- | --- | --- |
| `addItem` | `Layout → Layout` | planned |
| `moveItem` | `Layout → Layout` | planned |
| `rotateItem` | `Layout → Layout` | planned |
| `removeItem` | `Layout → Layout` | planned |
| `serialize` | `Layout → StoredLayoutJSON` | planned |
| `deserialize` | `StoredLayoutJSON → Layout` | planned |
| `renderGrid` | `Layout → DOM` | planned |
| `computeUtilization` | `Layout → UtilizationMetrics` | planned |
| `computePower` | `Layout → PowerEstimate` | planned |
| `computeSpacing` | `Layout → SpacingWarnings` | planned |
| `computeShoppingList` | `Layout → ShoppingList` | planned |
| `buildBlueprint` | `Layout → Blueprint` | planned |
| `downloadBlueprint` | `Blueprint → JSON file` | planned |

**Loc** — three: the **browser runtime** (in-memory `Layout`, DOM, event
handlers, Tailwind/Lucide CDN assets fetched once at load), **`localStorage`**
(persisted `StoredLayoutJSON`), and the **OS downloads folder** (exported
`.json` blueprint file). No server — this PoC has no backend by requirement.

**Trm** — `persist : Layout(runtime) → StoredLayoutJSON(localStorage)`,
`restore : StoredLayoutJSON(localStorage) → Layout(runtime)`, and
`downloadBlueprint : Blueprint(runtime) → JSON file(downloads)`. These are the
only three real cross-`Loc` transmissions; everything else (rendering,
editing, computing metrics) is same-`Loc` `Trn`.

**Placements (§4.2)** — none. Nothing here is placed at more than one `Loc`
simultaneously; the runtime, storage and download copies are distinct objects
related by `serialize`/`deserialize`/`buildBlueprint`, not shared placements
of one object.

## 8. Bridges to other components (ports)

None — this is the only component in the system.

## 9. Coherence notes

- **Law 1 (placement honesty):** no `Loc` claim beyond browser runtime,
  `localStorage`, and the downloads folder — the CDN fetches for Tailwind/
  Lucide happen once at page load and are not part of the app's own state
  model (they carry no `Layout` data), so they don't need a `Loc` of their
  own here.
- **Law 2 (transmission well-typing):** `persist`/`restore` carry
  `StoredLayoutJSON` only; `downloadBlueprint` carries a `Blueprint`, never a
  raw `Layout` — the exported file's shape is the deduced snapshot, not the
  live mutable state.
- **Law 5 (composition soundness):** `deserialize ∘ serialize = id` on any
  `Layout` satisfying rules 1–2 (unchanged from before); additionally, every
  `compute*` function must be a pure function of `Layout.items` with no
  hidden state — verified by construction (no `compute*` function reads or
  writes anything but its `Layout` argument).

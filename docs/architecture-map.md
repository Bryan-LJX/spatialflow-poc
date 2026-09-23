# Whole-system categorical map (Dat/Trn/Loc/Trm)

> Top-level architecture doc (§4). Names the four atoms, lists components (each
> linking to its ARCHITECTURE.md), reifies placement where it is a relation, and
> runs the §4.5 coherence checklist against the code. Detail lives in the linked
> component docs. Source of record: `index.html`.

## 1. Why

SpatialFlow's PoC is a single static file, so the value of modeling it
categorically isn't decomposition (there's only one component) — it's making
the in-memory/persisted-state split, the stored-vs-deduced split (metrics and
the shopping list are never a second place "what's on the grid" is stored),
and the invariants on furniture placement explicit *before* code exists, so
the interactive planner doesn't turn into unstructured DOM event spaghetti.

## 2. The four atoms (at a glance)

**Dat** — `RoomPreset`, `RoomConfig`, `FurnitureCatalogEntry`,
`FurnitureItem`, `Layout`, `StoredLayoutJSON`, plus the deduced
`UtilizationMetrics`, `PowerEstimate`, `SpacingWarnings`, `ShoppingList`,
`Blueprint` — all owned by the `site` component; see
[site/ARCHITECTURE.md](site/ARCHITECTURE.md) §3–4.

**Trn** — `selectRoom`, `renderGrid`, `addItem`, `moveItem`, `rotateItem`,
`removeItem`, `serialize`, `deserialize`, `computeUtilization`,
`computePower`, `computeSpacing`, `computeShoppingList`, `buildBlueprint` —
all owned by `site`; see [site/ARCHITECTURE.md](site/ARCHITECTURE.md) §5, §7.

**Loc** — three: the browser runtime (DOM + in-memory `Layout`),
`localStorage`, and the OS downloads folder (exported blueprint `.json`). No
server — the PoC has no backend by requirement.

**Trm** — `persist`, `restore`, and `downloadBlueprint`, all `site`-owned;
carry `StoredLayoutJSON` / `Blueprint` across the three `Loc`s. See
[site/ARCHITECTURE.md](site/ARCHITECTURE.md) §7.

## 3. Components

| Component | Owned `Trn` | Built/active when | Doc |
| --- | --- | --- | --- |
| `site` | selectRoom, renderGrid, addItem, moveItem, rotateItem, removeItem, serialize, deserialize, computeUtilization, computePower, computeSpacing, computeShoppingList, buildBlueprint | always (the whole app) | [site/ARCHITECTURE.md](site/ARCHITECTURE.md) |

## 4. Placement (only where runsAt is a relation, §4.2)

None — nothing in this system is placed at more than one `Loc` simultaneously.

## 5. Coherence checklist (§4.5 / §8) against the implementation

- [x] 1. Placement honesty — no `Loc` claim beyond browser runtime, localStorage, and the downloads folder; matches code
- [x] 2. Transmission well-typing — `persist`/`restore` carry `StoredLayoutJSON`, `downloadBlueprint` carries `Blueprint`, never raw `Layout`
- [x] 3. Placement totality — every modeled `Dat`/`Trn`/`Trm` has a `built` row in `site/IMPLEMENTATION.md`
- [x] 4. Dependency mediation — n/a, single component, no external deps (CDN assets are presentation-only)
- [x] 5. Composition soundness — bounds/overlap/spacing/power/cost/round-trip all verified manually, see `site/reviews/review-redesign-tailwind-planner.md`
- [x] 6. runsAt is a relation — n/a, no placements

## 6. Modeling smells swept (§3)

- No parallel objects — one `Layout`, related to its persisted form by
  `serialize`/`deserialize` rather than duplicated.
- Deduced not copied — `StoredLayoutJSON` and every metric
  (`UtilizationMetrics`, `PowerEstimate`, `SpacingWarnings`, `ShoppingList`,
  `Blueprint`) are derived from `Layout` on every render, never
  hand-maintained separately.
- One source of truth per shared `Dat` — n/a, single component owns
  everything.

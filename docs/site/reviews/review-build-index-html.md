# Review — build-index-html

> §4.5 coherence checklist run against the built `index.html`, per FRAMEWORK.md.

1. **Placement honesty** — ✅ pass. Every `Loc` claim in ARCHITECTURE.md
   (`browser runtime`, `localStorage`) is real; no code claims a server
   round-trip anywhere, matching the "no backend" requirement.
2. **Transmission well-typing** — ✅ pass. `persist`/`restore` (`index.html:persist`,
   `index.html:restore`) only ever carry `StoredLayoutJSON` (a string) across
   the runtime↔localStorage boundary — verified by reading the code: neither
   function touches a raw `Layout` object.
3. **Placement totality** — ✅ pass. Every `Dat`/`Trn` named in ARCHITECTURE.md
   §3/§7 has a `built` row in IMPLEMENTATION.md; no orphaned model objects.
4. **Dependency mediation** — n/a. Single component, no external dependencies.
5. **Composition soundness** — ✅ pass, verified manually:
   - Bounds invariant: dragging an item toward the grid edge clamps it inside
     `RoomConfig` bounds (`index.html:addItem`'s `Math.max/Math.min` clamp).
   - No-overlap invariant: dragging a Chair onto an already-occupied cell was
     rejected in-browser (item count stayed at 1) — see tasks.md §5.2.
   - Round-trip: placed a Desk, reloaded over `http://localhost:8123`,
     `localStorage` held byte-identical JSON and the layout restored at the
     same coordinates — see tasks.md §5.1.
6. **runsAt is a relation** — n/a. No placements in this component
   (ARCHITECTURE.md §7 "Placements: none").

## Verdict

All checkable laws pass. No FAILs to record in `architecture-map.md` §5.

## Drift-check note

`supercharge-drift` reports `0 dead / 0 refs` here — not because the rows are
unverified, but because every `IMPLEMENTATION.md` ref is `index.html:<symbol>`
with no directory component (the whole project is one root-level file), and
`drift-check.sh` deliberately skips bare-filename refs to avoid matching
prose (its documented ceiling). The refs were verified by hand instead: every
`file:symbol` in `docs/site/IMPLEMENTATION.md` was checked against an actual
`function <symbol>` (or `var <symbol>`) definition in `index.html` via grep
before being written. If this repo ever grows a second file, moving planner
logic into a subdirectory (e.g. `js/planner.js:addItem`) would let
drift-check verify it mechanically going forward.

# Proposal

## Why

SpatialFlow's `docs/site/ARCHITECTURE.md` models a PoC marketing site with an
embedded interactive layout-planner demo, but no code exists yet. This change
builds the first (and only) deliverable, `index.html`, realising that model.

## What Changes

- New static `index.html` at the project root: inline/linked CSS + JS, no
  build step, no backend.
- Marketing sections for the fictional "SpatialFlow" product (hero, product
  pitch for the Micro-Office / Studio Layout Planner, features, CTA).
- An embedded interactive planner demo: a grid-based room the visitor can drag
  furniture (desk, chair, meeting table, plant, etc.) onto, move, rotate,
  remove, and reset.
- Client-side persistence: the current layout saves to and restores from
  `localStorage` (`serialize`/`deserialize`/`persist`/`restore` per
  ARCHITECTURE.md §5/§7).
- Bounds and no-overlap invariants (ARCHITECTURE.md §6) enforced in
  `addItem`/`moveItem`.

## Capabilities

### New Capabilities

(none — `skip_specs: true`, this change has no spec-level external-consumer
surface; `docs/site/ARCHITECTURE.md` is the only contract per the repo's §4
choice A.)

### Modified Capabilities

(none)

## Impact

- Affected code: new file `index.html` only.
- No dependencies, no build tooling, no backend/API surface.
- Docs to reconcile after apply: `docs/site/IMPLEMENTATION.md`,
  `docs/site/STATUS.md`, `docs/STATUS.md` (State columns move from `planned`
  to `built`).

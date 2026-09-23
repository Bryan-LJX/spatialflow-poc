# Tasks

## 1. Page shell + CDN setup

- [x] 1.1 `index.html` head: Tailwind CDN `<script>` with inline `tailwind.config` (stone/wood/slate palette), Lucide CDN `<script>`, meta/title/description
- [x] 1.2 Minimal `<style>` block for what Tailwind can't express: grid-line background, drag-ghost, keyframe transitions, `ring-dashed` arbitrary value — implemented as a plain `outline: dashed` `.spacing-warning` class instead of a Tailwind arbitrary `ring-dashed` value (`ring-*` utilities are box-shadow based and can't render dashed; noted as a design substitution, same visual intent)
- [x] 1.3 Sticky header with brand + nav to Demo section

## 2. Landing hero

- [x] 2.1 Hero copy: value proposition around small-space productivity pods and custom micro-studio layouts
- [x] 2.2 "Launch Studio Planner" CTA — smooth-scrolls to `#planner` (`scrollIntoView` via native anchor + `html{scroll-behavior:smooth}`), verified with a real click in-browser
- [x] 2.3 Supporting visual/feature teasers, warm-wood-accented section

## 3. Planner data model (Dat, ARCHITECTURE.md §3–4)

- [x] 3.1 `ROOM_PRESETS` const + room-preset selector UI (pills)
- [x] 3.2 `FURNITURE_CATALOG` const with `costUsd`, `watts`, `clearanceFt` per design.md §Decisions 3
- [x] 3.3 `state.layout` shape: `{ room: {presetId, widthFt, heightFt}, items: [] }`
- [x] 3.4 `selectRoom`: swap room, drop + notify on now-out-of-bounds items
- [x] 3.5 `serialize` / `deserialize` (extended to carry `presetId`), with bounds/overlap re-validation on deserialize

## 4. Canvas + interaction (Trn, ARCHITECTURE.md §5/§7)

- [x] 4.1 `renderGrid`: draw feet-scaled room grid + placed items, cell size responsive to container width
- [x] 4.2 Sidebar catalog UI (Lucide icon per item, label, dims, cost, watts badge)
- [x] 4.3 `instantiate` + `addItem`: place a catalog entry onto the grid (click-to-place primary, pointer-drag secondary), clamp to bounds, **hard**-reject overlap
- [x] 4.4 `moveItem`: drag a placed item, **hard**-reject out-of-bounds and overlap (no-op, snaps back) — verified in-browser: dragging off the top-left edge and dragging onto another item both left the item at its last valid position
- [x] 4.5 `rotateItem`, `removeItem` controls on a placed item
- [x] 4.6 Reset-layout control

## 5. Real-time metrics (deduced Trn, ARCHITECTURE.md §4/§6)

- [x] 5.1 `computeUtilization`: usedSqFt / totalSqFt, rendered as a % with a progress bar — verified 8/80 sq ft for a 3×2 + 2×1 layout
- [x] 5.2 `computePower`: totalWatts + outlets via `OUTLETS_PER_STRIP=4` / `CIRCUIT_WATT_CAP=1800` — verified 150 W / 1 outlet for desk (90W) + lighting rig (60W)
- [x] 5.3 `computeSpacing`: soft clearance-overlap check, dashed-amber-outline highlight on flagged items + warning count in panel — verified placement still succeeds when flagged
- [x] 5.4 Wire all three into `afterEdit()` so they recompute on every mutation, never cached

## 6. Blueprint & shopping list (deduced Trn + Trm, ARCHITECTURE.md §5/§7)

- [x] 6.1 `computeShoppingList`: group by catalogId, qty/unitCost/subtotal + grand total, rendered as a table — verified $449 + $259 = $708 for a desk + chair layout
- [x] 6.2 `buildBlueprint`: snapshot room + items + all four metrics + timestamp
- [x] 6.3 "Export / Save Blueprint" button → success/confirmation modal showing the blueprint summary — verified modal figures match the canvas exactly
- [x] 6.4 `downloadBlueprint`: Blob + object URL + hidden `<a download>` click, triggered from the modal — click executed with no console errors

## 7. Persistence (Trm, ARCHITECTURE.md §7)

- [x] 7.1 `persist` on every edit, `restore` on page init with fallback to default. **Divergence from this task's original wording**: key is `spatialflow.layout.v1` in the old build; deliberately bumped to `spatialflow.layout.v2` here since the stored shape changed (added `presetId`) — a `v1` reader would otherwise misparse `v2` data. Recorded per §6.6 rather than silently keeping the stale task text.

## 8. Responsive + micro-interactions

- [x] 8.1 Responsive layout: sidebar/canvas/summary reflow correctly at `lg` breakpoint (catalog becomes a horizontal scroll strip below it), verified at 375×812 mobile viewport — no horizontal overflow
- [x] 8.2 Transitions: hover/active states on buttons and catalog items, smooth modal open/close (fade-in-up), smooth item-placement feedback

## 9. Verify + reconcile

- [x] 9.1 Manual round-trip check: placed items, reloaded, confirmed exact restore (`document.querySelectorAll('.placed-item').length` matched before/after, coordinates identical)
- [x] 9.2 Manual hard-invariant check: off-grid drag and overlap both rejected — verified separately, both snap back to last valid position
- [x] 9.3 Manual soft-invariant check: placed desk + chair within each other's clearance — warning appeared, placement still succeeded
- [x] 9.4 Manual cost/power check: verified against hand-computed values (see 5.1/5.2/6.1 above)
- [x] 9.5 Manual export check: modal contents matched canvas; download click ran with no console errors
- [x] 9.6 Manual responsive check: resized to mobile width, confirmed layout usable and no overflow
- [x] 9.7 Rewrite `docs/site/IMPLEMENTATION.md` rows to `built` with `index.html` symbol refs for every ARCHITECTURE.md §7 Trn/Trm
- [x] 9.8 Update `docs/site/STATUS.md` and `docs/STATUS.md`
- [x] 9.9 Run `supercharge-drift` (same bare-filename ceiling as before, documented again in this change's review)
- [x] 9.10 Write `docs/site/reviews/review-redesign-tailwind-planner.md` (§4.5 checklist run)

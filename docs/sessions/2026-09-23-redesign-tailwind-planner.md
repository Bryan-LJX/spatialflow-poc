# 2026-09-23 — redesign-tailwind-planner

> Immutable handoff log. Do not edit after today — new findings get a new log.

## Decisions made

- Full rebuild of `index.html` on a detailed user-supplied design spec:
  Tailwind CSS + Lucide icons via CDN, real-world room presets (8×10, 10×12,
  12×14 ft), a priced/powered furniture catalog, live utilization/power/
  spacing metrics, an itemized shopping list, and a blueprint export flow.
  Went through the full loop: `docs/site/ARCHITECTURE.md` updated first
  (model-before-code, §6.1), then `/opsx:propose` for
  proposal/design/tasks (`skip_specs: true`, same repo choice), implement,
  verify in-browser, reconcile, drift-check, archive.
- **Explicit reversal of a prior decision**: the original build's
  `design.md` (archived under `build-index-html`) set "no external JS
  libraries/CDNs" as a non-goal. This change reverses that because the user
  now explicitly requires Tailwind and Lucide CDN tags. Recorded in this
  change's `proposal.md` rather than silently overwritten.
- Bounds and item-overlap remain **hard** invariants (unchanged); the new
  clearance/spacing check is **soft** — flagged via a dashed amber outline
  and a panel warning, never blocks placement. Verified this distinction
  holds in-browser (see Tests run).
- `localStorage` key bumped `v1 → v2` because the stored `Layout` shape
  changed (added `room.presetId`); old `v1` entries are orphaned, not
  migrated.
- Power-outlet heuristic: `outlets = max(⌈poweredCount / 4⌉, ⌈totalWatts /
  1800⌉)` — named constants `OUTLETS_PER_STRIP` and `CIRCUIT_WATT_CAP` in
  code, matching a real 15A/120V circuit cap.
- Design's planned `ring-dashed` Tailwind arbitrary value swapped for a
  plain CSS `outline: dashed` class (`ring-*` is box-shadow based, can't be
  dashed) — same visual intent, recorded in IMPLEMENTATION.md Notes.

## Kept / discarded

- Kept: native Pointer Events for drag (no external drag library), same
  choice as the prior build — now driving Tailwind-styled elements and
  extended with click-to-place as the touch-friendly primary interaction.
- Discarded: nothing carried over unmodified from the old build — this was
  a full replacement, not a patch, per the user's request.

## Tests run

No automated suite (named gap, unchanged from prior build). Manual
verification in the built-in browser pane, served over `http://localhost:8123`:

- Click-to-place, rotate, remove — all correct.
- **Hard invariant — bounds**: dragged the standing desk off the room's
  top-left edge; snapped back to `(0,0)`.
- **Hard invariant — overlap**: dragged the acoustic panel onto the
  standing desk; stayed at its prior position, no overlap occurred.
- **Soft invariant — spacing**: placed a chair adjacent to the desk
  (`clearanceFt: 1`); both items got a dashed amber outline and the panel
  showed "1 item pair closer than recommended clearance — layout still
  allowed" — placement succeeded, confirming it's non-blocking.
- **Power formula**: desk (90W) + lighting rig (60W) = 150W, 2 powered
  items → panel showed exactly 1 outlet, matching
  `max(⌈2/4⌉, ⌈150/1800⌉) = 1`.
- **Utilization**: desk (6 sq ft) + lighting rig (2 sq ft) = 8/80 sq ft,
  matched the panel exactly.
- **Shopping list**: desk ($449) + chair ($259) = $708, matched both the
  live panel and the export modal exactly.
- **Export modal**: opened, figures matched canvas; "Download JSON" click
  ran with no console errors.
- **Persistence round-trip**: placed items, reloaded, `localStorage` held
  byte-identical JSON, items restored at identical coordinates.
- **Responsive**: resized to 375×812 (mobile) — hero, nav, and planner all
  reflowed correctly, catalog became a horizontal scroll strip, no
  horizontal overflow.
- No console errors at any point in the session (only the expected Tailwind
  CDN "should not be used in production" advisory warning).

Full §4.5 coherence-law run: `docs/site/reviews/review-redesign-tailwind-planner.md`.

## Open ends

- No automated tests — see `docs/site/STATUS.md` → Needs work.
- `graphify .` still produces an empty graph (one HTML file, no cross-file
  imports) — unchanged from the prior build, not re-run this session since
  nothing about that changed.
- `supercharge-drift` still reports `0 dead / 0 refs` (bare-filename
  ceiling, documented again in this change's review). Refs verified by
  hand instead.
- `gbrain` still has no brain configured — capture step skipped again.
- Room-preset switch drops out-of-bounds items with a notice but no undo —
  acceptable for a PoC, flagged in `docs/site/STATUS.md` → Needs work.

## Live execution state

- Git: prior commits (scaffold, first build) plus this session's changes
  not yet committed at the time this log was written — see resume commands.
- `openspec/changes/redesign-tailwind-planner/` archived to
  `openspec/changes/archive/2026-09-23-redesign-tailwind-planner/`.
- `index.html` fully replaced at repo root; opens standalone in a browser
  (needs network access on first load for the Tailwind/Lucide CDN scripts —
  by explicit design, not an oversight).
- `.claude/launch.json`'s `static-preview` config (`python3 -m http.server
  8123`) still valid for re-testing with working `localStorage`.

## Resume commands

```bash
cd /home/bryan-lieu/Documents/vibecoding/websites_proj/website_3
export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
export PATH="$HOME/.local/bin:$HOME/.bun/bin:$PATH"
supercharge-preflight
openspec list --json          # should show no in-flight changes
python3 -m http.server 8123   # to re-test with localStorage working
```

Next step: whatever the user wants next — more furniture types, additional
room presets, undo on preset switch, or a genuine automated test pass over
the invariant/deduction functions. The model in `docs/site/ARCHITECTURE.md`
already has room for new morphisms without restructuring.

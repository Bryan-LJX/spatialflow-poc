# Review — redesign-jesko-aesthetic

> §4.5 coherence checklist run against `index.html` after the cinematic
> (jeskojets.com-style) reskin of the marketing shell, per FRAMEWORK.md.

1. **Placement honesty** — ✅ pass. No new `Loc`. The cinematic layer
   (`initScrollReveal`/`initHeroZoom`/`initAccordion`), the Google-Fonts
   stylesheet, and the local `images/` assets are all fetched once by the
   existing browser runtime and carry no `Layout` data — same category as the
   Tailwind/Lucide CDN assets already excluded from `Loc` claims (§9).
   Documented as ambient same-`Loc` `Trn` in ARCHITECTURE.md §10, not invented
   as `Dat`.
2. **Transmission well-typing** — ✅ pass, unaffected. `persist`/`restore`/
   `downloadBlueprint` signatures unchanged; `localStorage` still holds exactly
   `{room, items}` (verified: desk(0,0)+chair(3,0) after the reskin). No
   presentation state is ever serialized.
3. **Placement totality** — ✅ pass. The three new presentation `Trn`
   (`initScrollReveal`, `initHeroZoom`, `initAccordion`) each have a `built`
   row in `site/IMPLEMENTATION.md`. All planner objects/morphisms remain
   `built` and unchanged.
4. **Dependency mediation** — n/a. Single component; the one new external
   dependency (Google Fonts stylesheet) is presentation-only, no data
   dependency to mediate.
5. **Composition soundness** — ✅ pass, re-verified in-browser via real UI /
   synthetic pointer events after the reskin:
   - Hard bounds: desk dragged far off the board's top-left → stayed at
     `(0,0)` (rejected).
   - Hard no-overlap: chair dragged onto the desk's cells → stayed clear
     (rejected); item count remained 2; `localStorage` confirmed no overlap.
   - Soft spacing: desk + adjacent chair (`clearanceFt: 1`) raised "1 item
     pair closer than recommended clearance — layout still allowed" and both
     stayed placed (non-blocking, per §6 rule 6).
   - Power: desk (90 W), 1 powered item → `max(⌈1/4⌉, ⌈90/1800⌉) = 1` outlet —
     matched the panel.
   - Utilization: desk (6) + chair (1) = 7 / 80 sq ft → 9% — matched.
   - Shopping list: desk ($449) + chair ($259) = $708 — matched the panel and
     the export modal.
   - Round-trip: reload restored both items and the 90 W total.
   - `compute*` purity preserved (no planner code changed).
6. **runsAt is a relation** — n/a. No placements in this component.

## Effect-isolation / planner-fence check (this change's own invariant)

The planner's internal markup is unchanged: `id="room-presets"`,
`id="catalog-list"` (exact class string), `id="board"` (exact class string),
and `id="metric-util-bar"` are each present verbatim (`grep -c` = 1). The only
change to the planner section is its wrapper/framing (a light "studio
workbench" panel) and a new section heading. `grep` confirms no
`data-reveal`/`data-scene` hook inside any of the four planner containers —
the only planner-adjacent `data-reveal`s are on the section heading (marketing
framing). The reveal/scene functions read scroll/intersection signals and
write `class`/`style` only; none reference `state.layout`.

## Hero-zoom enhancement outcome

The plan's hero "zoom-through" was specified as progressive enhancement over a
legible baseline. As anticipated (and as the prior change found),
`animation-timeline: scroll()` was **inert** in the target engine — the portal
stayed `scale(1)` mid-scroll. Outcome: shipped a JS rAF-throttled scroll
handler (`initHeroZoom`) that scales + fades the portal, verified working
(`scale 1.98 / opacity 0.45` at `scrollY 306`). The `view()`-based
`[data-reveal]` reveals *do* work natively (progress reaches 1) and are used
as-is. Under `prefers-reduced-motion`, both are disabled and content is shown
statically. The hero is fully legible at `scale(1)` if the JS never runs.

## Verdict

All checkable laws pass. No FAILs to record in `architecture-map.md` §5.

## Post-review fixes (defects found on the built page)

Three defects were fixed after the first build (task groups 9–11); all
re-verified with a real computer-scroll, since a backgrounded app window
starves both `requestAnimationFrame` and `IntersectionObserver` and makes
synthetic scroll jumps under-report.

- **Reveals didn't persist to the page bottom.** `[data-reveal]` used CSS
  `animation-timeline: view()` / `animation-range: entry`; elements in the
  final screenful can't complete their entry range before the scroll limit, so
  the finale + blueprint summary rendered blank. Fixed by making
  `IntersectionObserver` the sole reveal driver and removing the `view()` path.
  Verified: at max scroll every finale/summary reveal reaches opacity 1.
- **Fixed-nav illegible over light sections.** `mix-blend-mode: difference`
  gave poor contrast on cream/gold/white. Fixed with `initNavContrast`
  (scroll-spy toggling `#site-nav.nav-dark`). Verified: dark text over
  cream/gold/planner, white over hero/summary/finale.
- **Showcase image showed a white box.** The product photo's white background
  slabbed over the gold section. Fixed with `mix-blend-mode: multiply` on the
  showcase `<img>`. Verified: the box is gone and the chair layers over the
  split headline.
- **Furniture catalog photos restored** (user request). Re-added
  `FurnitureCatalogEntry.image` + `<img>` rendering with `onerror` fallback in
  catalog/canvas/drag-ghost/shopping-list. Re-verified the planner regression
  with images in place: bounds + overlap rejected, 7/80 sq ft, 90 W, $708, and
  `localStorage` stores items by `type`/coords only (no `image` leak) — the
  data model is unchanged.

## Second-round post-review fixes (defects found before commit/archive)

Two more defects surfaced in a second review pass, before this change was
committed or archived (task group 12); both verified live in the browser
pane, not just by inspection.

- **Metrics sidebar bled past the workbench panel's white border.** The
  workbench grid (`grid-cols-[220px_1fr_340px]`) gave its canvas column no
  `min-w-0`, so the middle `1fr` track couldn't shrink below the board's
  min-content width; at larger room presets the grid's intrinsic width
  exceeded the panel, and since the panel has no `overflow-hidden`, the fixed
  340px metrics `<aside>` rendered outside the rounded card. Fixed by adding
  `min-w-0` to the canvas column. Verified via `getBoundingClientRect`
  (panel vs. metrics-aside right edges) across all three room presets with
  items placed: overflow went from +5.66px (bleeding) at the 12×14 preset to
  a consistent −32px (safely inside) everywhere.
- **Showcase image collided with the split headline.** The Eames lounge
  chair + ottoman photo was wider than the negative-space gap between
  "Design" and "in luxe" — the ottoman clipped into the "i", the headrest
  crossed into "Design". Replaced with a single-chair product photo
  (Steelcase Leap, CC BY 3.0) with generous built-in negative space. Its
  swap-in also resurfaced the §9b "white-box" defect in a fainter form
  (`mix-blend-multiply` only fully drops out a *pure*-white background; this
  source's backdrop was a near-white studio gray), so it was fixed at the
  root this time — a real transparency cutout — instead of re-applying the
  blend-mode workaround. Verified in-browser at desktop (clean split, no
  overlap, no box) and at 375px (stacked mobile headline, no overflow), with
  zero console errors at both sizes.

## Drift-check note

Same structural ceiling as prior reviews: `IMPLEMENTATION.md` refs are bare
`index.html:<symbol>`, so `supercharge-drift` reports `0 dead / 0 refs`. The
new symbols (`initScrollReveal`, `initHeroZoom`, `initAccordion`) were each
verified by hand against a real `function <symbol>` definition in
`index.html` via grep before being written.

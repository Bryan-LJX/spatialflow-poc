# 2026-09-24 — cinematic-jesko-redesign

> Immutable handoff log. Do not edit after today — new findings get a new log.

## Decisions made

- **Set up gbrain for this project**: registered this repo as a source on the
  existing host-level PGLite brain (`gbrain sync --repo .`), imported 17
  markdown files (docs/openspec), ran `gbrain extract --stale`. Keyword search
  confirmed working; semantic search is unavailable because embeddings are
  disabled at the host-brain config level (`embedding_disabled: true`) —
  pre-existing host setting, not something changed or that should be changed
  without being asked.
- **First interpretation was wrong, and the user corrected it explicitly**:
  "scroll-driven animations" was initially built as tasteful fade-in reveals +
  real furniture photos layered onto the existing warm wood/stone design
  (`add-scroll-animations` change — fully implemented, verified, documented).
  The user then clarified the actual ask: make the site look and feel like
  **jeskojets.com** — a dark, cinematic, luxury, scroll-driven aesthetic. Per
  their explicit choice, the `add-scroll-animations` work was **discarded**
  (`git restore` + removal of its untracked artifacts) back to the last
  committed baseline (`9de3ff3`) before starting over.
- **Full cinematic reskin built as a new change, `redesign-jesko-aesthetic`**:
  portal hero with a scroll zoom-through, a per-section palette journey
  (espresso → cream → gold → light workbench → dark blueprint → near-black
  finale), oversized Space Grotesk display type, a split headline around a
  showcase object, an accordion, a spec table, a floating pill CTA, a fixed
  nav, and a dark finale — translated to SpatialFlow's domain, not a literal
  jet theme. Per the user's explicit choice, the interactive planner was kept
  as a bright, legible "studio workbench" panel rather than pulled into the
  dark palette — only its section container/heading changed; its internal
  catalog/canvas/metrics markup and classes are byte-identical to baseline.
- **No model change anywhere in this session.** Every visual addition
  (scroll scenes, reveals, hero zoom, accordion, nav contrast, furniture
  images) is presentation-layer only: ambient same-`Loc` `Trn`, never a new
  `Dat`, never touching `state.layout`, never read by any `compute*`. Recorded
  as `docs/site/ARCHITECTURE.md` §10.
- **User asked (again) for the planner's furniture catalog to show real
  photos**, having lost them when the first change was discarded. Re-sourced
  the same five Wikimedia Commons images into `images/furniture/` and wired
  them into the catalog cards, placed canvas items, the drag-ghost, and the
  shopping-list rows — `FurnitureCatalogEntry` gained an `image` field
  resolved at render time via the existing `catalogEntry(type)` lookup; no
  `FurnitureItem`/`Layout`/`StoredLayoutJSON` shape change.
- **Two engine-reliability lessons, discovered by live verification, not by
  reading docs**: CSS `animation-timeline: scroll()` never applied to the hero
  portal's transform in the target browser engine (stayed at rest at every
  scroll position tested), and CSS `animation-timeline: view()` with
  `animation-range: entry` left the last screenful (the finale + blueprint
  summary) permanently stuck at `opacity: 0`, because those elements can never
  finish their entry range before the page's scroll limit. Both were replaced
  with JS: `initHeroZoom` (a rAF-throttled scroll handler that scales/fades
  the portal directly) and `initScrollReveal` made `IntersectionObserver` the
  sole reveal driver (the CSS `view()` path was removed outright, not kept as
  a parallel path — running both would double-drive elements where `view()`
  *does* fire).
- **Fixed-nav contrast**: `mix-blend-mode: difference` on the nav (the
  original approach, chosen to auto-invert over any background) was illegible
  over the cream/gold/white sections in practice. Replaced with a scroll-spy
  (`initNavContrast`) that tags each section `data-nav="light"`/`"dark"` and
  toggles a `.nav-dark` class on the header — a deliberate, verified choice
  over the "clever" blend-mode trick.
- **Showcase image white-box fix**: the Eames-chair product photo has a white
  background, which rendered as a hard rectangle over the gold showcase
  section and broke the "Design … in luxe" split-headline device. Fixed with
  `mix-blend-mode: multiply` on that one `<img>` rather than re-sourcing or
  editing the image file — noted in `design.md` that this only works because
  the showcase section is light; would need revisiting if that section's
  background ever goes dark.

## Kept / discarded

- Kept: the `skip_specs: true` / Wikimedia-Commons-only / `CREDITS.md`
  sourcing discipline established in the discarded change — reused verbatim
  for both the cinematic-shell imagery and the restored furniture images.
- Kept: the planner-fence invariant (no presentation hook — `data-reveal`,
  `data-nav`, images — ever touches `#room-presets`/`#catalog-list`/`#board`/
  the metrics `<aside>`), verified by grep at every stage of both changes.
- Discarded: the entire `add-scroll-animations` change (proposal/design/tasks,
  its `images/`, its review, and its `index.html`/docs edits) — wrong
  direction per the user, replaced by `redesign-jesko-aesthetic`.
- Discarded: CSS `animation-timeline: scroll()` for the hero zoom (inert in
  this engine) → JS rAF handler.
- Discarded: CSS `animation-timeline: view()` for scroll reveals (left the
  final screenful permanently hidden) → `IntersectionObserver` only.
- Discarded: `mix-blend-mode: difference` for nav contrast (illegible over
  light sections) → scroll-spy `data-nav` class toggle.

## Tests run

No automated suite (long-standing, accepted PoC gap, unchanged). All manual,
re-run multiple times across both changes and every post-review fix, served
over `http://localhost:8123`:

- **Hard invariants**, verified via real UI interaction and via synthetic
  `PointerEvent` sequences replaying the actual `attachCatalogDrag`/
  `attachPlacedItemDrag` handlers (not by calling internal functions
  directly): off-grid drag clamped to `(0,0)`; overlap drag onto an existing
  item rejected, item count unchanged.
- **Soft invariant**: adjacent desk+chair (clearanceFt) raised the spacing
  warning and both items stayed placed (non-blocking).
- **Deductions**: power (`90 W` / `1 outlet`), utilization (`7/80 sq ft`,
  `9%`), shopping list (`$708`) all matched hand-calculated values, the live
  panel, and the export modal, before and after every visual change.
- **Persistence round-trip**: reload restores items; `localStorage` inspected
  directly and confirmed it stores `{room, items}` with items keyed by `type`
  only — no `image` field ever leaks into stored state.
- **Scroll-reveal correctness**: verified via
  `element.getAnimations()[0].effect.getComputedTiming()` during the CSS
  `view()` attempt (caught the stuck-at-progress-0 bug), and via
  `getComputedStyle(...).opacity` at max scroll after switching to IO (all
  reveals reach `1`, including the finale).
- **Nav contrast**: sampled `#site-nav.classList.contains('nav-dark')` over
  every section after a *real* `computer{action:"scroll"}` interaction —
  dark text over cream/gold/planner, white over hero/summary/finale.
- **Image fallback**: forced a broken `src` at all three furniture-image
  render sites (catalog swatch, canvas item, shopping-list row) and confirmed
  each `onerror` handler correctly swapped in the original icon/color
  fallback with no effect on canvas rendering or any invariant.
- **Responsive**: 375×812 — no horizontal overflow at any section; the
  showcase's split headline (which requires two flanking text blocks) was
  found to clip on mobile and was given a stacked-headline variant instead
  (`sm:hidden` vs `hidden sm:flex`).
- **Console**: zero errors across every session, every interaction, every
  fix — confirmed via `read_network_requests`/`read_console_messages`, with
  stale entries from deliberate `onerror` tests distinguished from real new
  errors by request-ID cross-checking.
- **Environment quirk discovered and worked around**: `requestAnimationFrame`
  and `IntersectionObserver` callbacks do not fire reliably while the Claude
  desktop app's browser pane window is backgrounded/not painted — synthetic
  `scrollTo()` jumps under-report reveal/nav state as a result. Real
  `computer{action:"scroll"}` interactions force a paint and give trustworthy
  readings; this was cross-checked multiple times before trusting any
  "stuck" result as a real bug versus a measurement artifact.

Full §4.5 reviews:
`docs/site/reviews/review-redesign-tailwind-planner.md` (prior session) and
`docs/site/reviews/review-redesign-jesko-aesthetic.md` (this session, includes
the post-review-fixes section for all four defects above).

## Open ends

- **Work is fully built and verified (44/44 OpenSpec tasks, `all_done`) but
  is NOT committed and NOT archived.** This is the single most important
  thing for the next session to know — see Live execution state below.
- No automated test suite anywhere in the repo — unchanged accepted gap.
- `graphify .` still produces an empty graph for this single-HTML-file repo
  (confirmed again this session, both with and without `--code-only`) —
  unchanged, documented ceiling.
- `supercharge-drift` still reports `0 dead / 0 refs` (bare-filename ceiling)
  — every `file:symbol` this session added was verified by hand via grep
  against a real `function <symbol>` definition instead.
- Hero zoom-through is JS-driven, not native CSS scroll-timeline, because
  `animation-timeline: scroll()` doesn't apply in this engine — works
  correctly, but should be revisited if/when that engine gap closes.
- Room-preset switch still drops out-of-bounds items with no undo —
  long-standing accepted PoC gap, unchanged.
- gbrain's embeddings are disabled at the host-brain level (keyword search
  only) — a pre-existing host setting, flagged but not changed.

## Live execution state

- **Git**: working tree has the full `redesign-jesko-aesthetic` change
  uncommitted:
  - Modified (tracked): `docs/STATUS.md`, `docs/site/ARCHITECTURE.md`,
    `docs/site/IMPLEMENTATION.md`, `docs/site/STATUS.md`, `index.html`.
  - Untracked: `docs/site/reviews/review-redesign-jesko-aesthetic.md`,
    `images/` (`hero-workspace.jpg`, `showcase-chair.jpg`,
    `furniture/{standing-desk.jpg,acoustic-panel.jpg,lighting-rig.jpg,
    bookshelf.jpg,ergo-chair.svg}`, `CREDITS.md`),
    `openspec/changes/redesign-jesko-aesthetic/` (`proposal.md`, `design.md`,
    `tasks.md`, `.openspec.yaml`).
  - The user was asked at the end of the work turn whether to commit and/or
    archive; no answer was given before this session ended — **do not assume
    either action, ask again at the start of the next session.**
- `openspec status --change redesign-jesko-aesthetic` → all 3 artifacts done
  (specs skipped), 44/44 tasks complete, apply state `all_done`.
- A static file server is running in the background on port 8123
  (`python3 -m http.server 8123`, PID visible via `ss -ltnp | grep 8123`),
  started via the built-in browser pane's `static-preview` launch config —
  needed because `localStorage` doesn't work under `file://`. It may or may
  not still be running by the next session; restart if not.
- gbrain: this repo is registered as a source on the host PGLite brain
  (`~/.gbrain/brain.pglite`); 17 files synced from the pre-cinematic-redesign
  state. **Not yet re-synced** with this session's doc changes or this log.

## Resume commands

```bash
cd /home/bryan-lieu/Documents/vibecoding/websites_proj/website_3
git status                                            # review the full uncommitted diff first
openspec status --change redesign-jesko-aesthetic --json   # should show all_done, 44/44
ss -ltnp | grep 8123 || python3 -m http.server 8123   # re-serve if not already running
```

Next step: ask the user whether to commit the `redesign-jesko-aesthetic`
change and archive it (`/opsx:archive redesign-jesko-aesthetic`), or continue
iterating on the cinematic redesign first. Nothing about the current build is
known-broken — all four user-reported defects (reveals not persisting, white
image box, illegible nav, missing furniture photos) were fixed and verified
in this session.

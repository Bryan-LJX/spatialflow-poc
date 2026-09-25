# Design

## Context

See `proposal.md` — Why/What Changes. Constraints that shape the approach:
`index.html` is a single static file (Tailwind CDN + Lucide CDN + vanilla JS,
no build step, no backend); the interactive planner (`#planner` — catalog,
`#board` canvas, live-metrics asides) is governed by
`docs/site/ARCHITECTURE.md` and its `Layout` category, invariants, and
`compute*` deductions must not change. The redesign is scoped to the
presentation layer: markup structure, CSS, imagery, typography, and
scroll-driven motion. Baseline is the committed `9de3ff3` (the uncommitted
`add-scroll-animations` work is discarded first, per the user's decision).

Reference: jeskojets.com — a dark, cinematic, luxury, scroll-driven single
page. Its defining devices (observed directly) are translated to SpatialFlow's
domain, not copied literally, because SpatialFlow markets a micro-office layout
planner, not a jet charter.

## Goals / Non-Goals

**Goals:**
- Reproduce the *feel* of the reference: full-bleed cinematic sections, a
  per-section palette journey, scroll-linked zoom/parallax, oversized
  lightweight display type, a floating pill CTA, a fixed minimal nav, an
  accordion, and a dark finale.
- Keep the interactive planner fully usable and legible — restyled to fit the
  shell, not absorbed into the dark palette (user's explicit choice).
- Stay within one `index.html`, no backend, no build step.

**Non-Goals:**
- Any change to the planner's `Layout` model, invariants, `compute*`
  deductions, storage schema (`spatialflow.layout.v2`), or export flow.
- Pushing the dark cinematic palette *into* the planner's canvas/catalog/
  metrics UI (explicitly out of scope — the planner stays a bright,
  high-contrast "workbench").
- A literal jet/aviation theme — only the aesthetic *language* is borrowed.
- Pixel-perfect cross-browser parity of scroll-linked effects (progressive
  enhancement instead, see Decisions).

## Decisions

1. **Model delta: none. Consolidation check (§3) ⟹ no new `Dat`, no new
   morphism on the planner category.** Everything this change adds —
   scroll-scene state, which section is in view, reveal/parallax progress,
   accordion open/closed — is ephemeral DOM/CSS presentation state. It is
   never serialized, never read by any `compute*`, never affects an invariant.
   Per FRAMEWORK §2/§4, it is ambient same-`Loc` `Trn` (browser runtime →
   browser runtime DOM), documented in `ARCHITECTURE.md` §10, not invented as a
   category object. This keeps the change honest: a big *visual* change that is
   a *small* model change (essentially zero).

2. **Cinematic layer is built as a re-authorable presentation module, isolated
   from the planner (effect isolation / §4.5 Law 1).** All new scroll/scene JS
   only reads scroll/intersection signals and writes `class`/`style`/CSS
   custom properties on marketing-shell nodes it is explicitly given; it never
   reads or writes `state.layout` and never runs inside `#planner`'s
   dynamically re-rendered subtree (`#room-presets`, `#catalog-list`,
   `#board`, metrics `<aside>`). Enforced structurally via a `[data-scene]` /
   `[data-reveal]` allowlist that is simply never authored onto planner-internal
   elements — the same fence the discarded change used, kept because it was the
   one part worth keeping.

3. **Palette journey via section-scoped CSS, grounded in existing tokens.**
   Each full-bleed section sets its own background (image or color) and text
   color; the journey runs deep-espresso hero → warm cream → a cool "blueprint"
   section → near-black finale. Colors extend the existing Tailwind `wood`/
   `stone` scale (already defined in `tailwind.config`) rather than
   introducing an unrelated palette, so the result reads as "SpatialFlow, gone
   cinematic," not a jet site. One source of truth for each color: Tailwind
   tokens + a small set of CSS custom properties for the scene backgrounds.

4. **Scroll-linked motion: CSS `animation-timeline` (`view()`/`scroll()`) as
   the primary mechanism, `IntersectionObserver` reveal as the fallback, no
   animation library.** Rationale: the no-build/no-dependency constraint. The
   hero zoom-through uses a `scroll()` timeline scaling a portal layer;
   per-section reveals use `view()` with `animation-range: entry` (the range
   value learned to work reliably in the discarded change's verification — a
   mixed `entry/cover` range left elements stuck, so use a single named range).
   Feature-detect once with `CSS.supports("animation-timeline","view()")`;
   only attach the `IntersectionObserver` fallback when unsupported, so the two
   mechanisms never double-drive the same element.
   - **Risk flagged from prior verification:** a `scroll()`-timeline transform
     did *not* reliably apply in the built-in browser last time. This change
     therefore treats the hero zoom-through as **progressive enhancement**: the
     hero must be fully legible and correct with the zoom reduced to a plain
     cross-fade/opacity reveal if the `scroll()` transform does not render.
     Verify the enhanced path in-browser; if it again fails to apply, ship the
     fallder and record it (do not block the change on a decorative transform).

5. **`prefers-reduced-motion: reduce` short-circuits all motion to final
   state.** Both the CSS path (media query forcing `animation:none` + resting
   visible state) and the JS fallback (`matchMedia` check → reveal-all,
   no observer). Accessibility parity with the reference's spirit and existing
   practice.

6. **Typography: one lightweight display grotesque via Google Fonts `<link>`,
   plus the existing system sans for body.** Google Fonts stylesheets are on
   the allowed list and need no build step, consistent with the current CDN
   approach. A single display family (e.g. a wide/geometric grotesque) used at
   large sizes for headlines carries most of the "feel"; body copy stays on the
   current system stack for performance and legibility.

7. **The planner is reframed, not restyled into the dark theme.** It lives in a
   bright "studio workbench" section — a light, high-contrast panel — that is a
   deliberate beat in the palette journey (the calm, functional center between
   cinematic sections). Only its container/framing changes; its internal
   catalog/canvas/metrics markup and classes are left as-is so all interaction
   and legibility are preserved and the regression surface is minimal.

8. **Imagery sourced from openly-licensed libraries only, downloaded locally,
   credited.** Same discipline as the discarded change (Wikimedia Commons /
   Pexels / Unsplash free / CC0), recorded per file in `images/CREDITS.md`
   with source URL + license. Real cinematic photos/renders for hero portal,
   section backgrounds, and one featured furniture/room render; each `<img>` or
   CSS background paired with a graceful fallback (solid token color) so a
   missing file never breaks layout or the planner. Keep each image small
   (target < ~200 KB for full-bleed backgrounds; the page is a PoC with no
   prior perf budget but full-bleed images are heavier than the last set).

## Post-review fixes (defects found after first implementation)

Two defects surfaced when reviewing the built page; both are addressed in task
group 9.

9a. **Reveals near the page bottom never appear (the animation "does not
   persist" to the end of the page).** Root cause: `[data-reveal]` used a CSS
   `animation-timeline: view()` with `animation-range: entry`. An element in
   the *final screenful* can never travel through its whole `entry` range —
   the page hits its scroll limit first — so its animation stays at progress 0
   and the element stays at `opacity: 0`. Confirmed: at max scroll the entire
   finale and blueprint-summary sections render blank. **Fix:** make
   `IntersectionObserver` the *primary* reveal driver for every `[data-reveal]`
   (not just an unsupported-browser fallback), toggling `.is-revealed`, and
   drop the `view()`-timeline path. IO only needs an element to cross a
   visibility threshold — which the last screenful does — so reveals complete
   everywhere. Validated in-browser: forcing the `.is-revealed`/transition path
   makes the finale fully visible. Reduced-motion handling (reveal-all, no
   observer) is unchanged. This mirrors the hero-zoom lesson: the CSS
   scroll-driven timelines are unreliable in the target engine, so JS drives
   the motion.

9b. **The showcase furniture image renders as a hard white rectangle** (its
   source is a product photo on a white background), which looks unfinished on
   the gold section and makes the split headline read as a sliced word rather
   than layered type. **Fix:** apply `mix-blend-mode: multiply` to the showcase
   `<img>` so the near-white background drops out over the light gold section
   and the chair floats over the "Design … in luxe" headline as intended
   layering. Validated in-browser. (No re-sourcing needed; the blend keeps the
   local, license-clean asset.)

## Second-round post-review fixes (defects found before commit/archive)

12a. **Metrics sidebar bleeds past the workbench panel's white border.**
   Root cause: the workbench grid (`grid-cols-[220px_1fr_340px]`) gives the
   canvas column no `min-w-0`, so its `1fr` track cannot shrink below the
   board's min-content width. Confirmed live via `getBoundingClientRect`: at
   the 12×14 team-pod preset, with zero items placed, the grid's intrinsic
   width already exceeds the panel by ~6px, growing further as the room
   preset size or item count increases. The panel has no `overflow-hidden`,
   so the fixed 340px metrics `<aside>` renders outside the rounded white
   card instead of triggering the board wrapper's existing
   `overflow-x-auto`. **Fix:** add `min-w-0` to the canvas grid column so it
   participates in track-sizing correctly and the existing horizontal
   scroll takes over internally. No markup restructuring, no change to the
   metrics `<aside>` itself.

12b. **Showcase image collides with the split headline.**
   `images/showcase-chair.jpg` depicts a lounge chair *and* its separate
   ottoman, together wider than the negative-space gap between "Design" and
   "in luxe." Confirmed live: the ottoman sits under "in luxe" and clips
   into the "i"; the headrest crosses into "Design." **Fix:** source a
   single-chair (no ottoman) replacement from Wikimedia Commons under the
   same free/open-license discipline as `images/CREDITS.md`, swap the `src`,
   and re-verify the desktop split-headline and the `sm:hidden` stacked
   mobile variant both read cleanly, re-checking the existing
   `mix-blend-multiply` fix against the new image.

   **Outcome (implementation deviated from plan):** the sourced replacement's
   backdrop is a near-white studio gray (~238–250/255), not pure white, so
   `mix-blend-multiply` left a faint but visible dimmed rectangle — the same
   underlying defect as §9b, just less severe. Rather than re-apply a blend
   mode known to only work for pure-white backgrounds, the backdrop was keyed
   out to true transparency (a flood-fill cutout grown from the image
   border), and `mix-blend-multiply` was removed from the `<img>` entirely.
   This is more robust than the blend-mode approach for any future showcase
   image regardless of its backdrop's exact tone. The display width was also
   narrowed (`70vw/520px` → `60vw/420px`) because the new image is portrait,
   not landscape, and would otherwise render disproportionately tall.

## Risks / Trade-offs

- **[The cinematic dark aesthetic fights the planner's need to be a bright,
  legible tool]** → Mitigation: Decision 7 — the planner is a deliberate light
  "workbench" beat, not forced into the dark palette; the contrast is designed,
  not accidental.
- **[`mix-blend-multiply` only cleans a white background over a *light*
  section]** → the showcase is gold (light), so multiply works; if that
  section's background ever goes dark, the blend would need revisiting. Noted
  so a future palette change doesn't silently reintroduce the white box.
- **[`scroll()`-timeline transforms may not render in the target browser, as
  seen in the prior change]** → Mitigation: Decision 4 — hero zoom-through is
  progressive enhancement over a legible static/opacity baseline; verify, and
  ship the fallback if the transform doesn't apply, recorded in the review.
- **[Full-bleed imagery adds significant page weight]** → Mitigation: cap image
  sizes, prefer compressed JP/WebP, lazy-load below-the-fold section
  backgrounds, and provide solid-color fallbacks so first paint never blocks on
  a large image.
- **[A large reskin risks regressing the planner]** → Mitigation: Decision 7
  keeps the planner's internal markup/classes unchanged; re-run the full
  planner regression suite (bounds/overlap/spacing/power/utilization/shopping/
  export/persistence/responsive) against the reskinned page before archiving.
- **[Mis-licensed imagery]** → Mitigation: Decision 8 — openly-licensed sources
  only, license verified per file before download, recorded in
  `images/CREDITS.md`.
- **[Scope creep — "same feel" is subjective]** → Mitigation: the proposal
  enumerates the concrete reference devices to reproduce; the plan builds each
  as a discrete task and verifies it in-browser, rather than chasing an
  open-ended "make it feel luxe."

## Migration Plan

Task 1 discards the uncommitted `add-scroll-animations` changes and returns to
`9de3ff3`: `git restore` the modified tracked files (`index.html`,
`docs/STATUS.md`, `docs/site/ARCHITECTURE.md`, `docs/site/IMPLEMENTATION.md`,
`docs/site/STATUS.md`) and remove the untracked artifacts of that change
(`images/`, `docs/site/reviews/review-add-scroll-animations.md`,
`openspec/changes/add-scroll-animations/`). `git status` is checked first so
nothing unexpected is lost. This `redesign-jesko-aesthetic` change folder is
untracked and survives the restore. No data migration — no storage-schema
change (`spatialflow.layout.v2` untouched). Deploy is the existing "commit the
edited `index.html`" flow. Rollback is a plain revert of the redesign commit
back to `9de3ff3`.

## Open Questions

None that block the plan. Specific font family, exact per-section colors, and
final image choices are implementation-time selections constrained by
Decisions 3/6/8; they don't change scope, approach, or the task breakdown.

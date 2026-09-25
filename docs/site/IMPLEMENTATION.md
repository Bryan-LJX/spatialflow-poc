# Site — implementation map

> The functor ARCHITECTURE.md → code. Each object/morphism → the file:symbol that
> realises it. Keep in sync WITH the code (§6.3): a new morphism gets a row here in
> the same change that adds its code.

## Objects (Dat) → code

| Object | Form / shape | Realised at | State |
| --- | --- | --- | --- |
| `RoomPreset` | `{ id, label, widthFt, heightFt }` | `planner.html:ROOM_PRESETS` | built |
| `RoomConfig` | `{ presetId, widthFt, heightFt }` | `planner.html:defaultLayout` | built |
| `FurnitureCatalogEntry` | `{ type, label, icon, w, h, costUsd, watts, clearanceFt, color, image }` | `planner.html:FURNITURE_CATALOG` | built |
| `FurnitureItem` | `{ id, type, x, y, w, h, rotation }` | `planner.html:instantiate` | built |
| `Layout` | `{ room: RoomConfig, items: FurnitureItem[] }` | `planner.html:defaultLayout` | built |
| `StoredLayoutJSON` | `JSON.stringify(Layout)` under `localStorage` key `spatialflow.layout.v2` | `planner.html:STORAGE_KEY` | built |
| `UtilizationMetrics` | `{ usedSqFt, totalSqFt, pct }` | `planner.html:computeUtilization` | built |
| `PowerEstimate` | `{ totalWatts, poweredCount, outlets }` | `planner.html:computePower` | built |
| `SpacingWarnings` | `{ pairs, flaggedIds }` | `planner.html:computeSpacing` | built |
| `ShoppingList` | `{ rows, total }` | `planner.html:computeShoppingList` | built |
| `Blueprint` | `{ room, items, utilization, power, spacing, shoppingList, exportedAt }` | `planner.html:buildBlueprint` | built |
| `User` | Supabase Auth user record `{ id, email }` | Supabase Auth service (no local realisation — read from `session.user`) | built |
| `StoredLayoutRow` | `{ user_id, layout: jsonb, updated_at }` | Supabase Postgres `layouts` table (SQL migration, not app code) | built |

## Morphisms (Trn / relations) → code

| Morphism | Signature | Realising code | State |
| --- | --- | --- | --- |
| `selectRoom` | `RoomPreset → RoomConfig` | `planner.html:selectRoom` | built |
| `renderGrid` | `Layout → DOM` | `planner.html:renderGrid` | built |
| `instantiate` | `(FurnitureCatalogEntry, x, y) → FurnitureItem` | `planner.html:instantiate` | built |
| `addItem` | `(Layout, FurnitureCatalogEntry, x, y) → Layout` | `planner.html:addItem` | built |
| `moveItem` | `(Layout, id, x, y) → Layout` | `planner.html:moveItem` | built |
| `rotateItem` | `(Layout, id) → Layout` | `planner.html:rotateItem` | built |
| `removeItem` | `(Layout, id) → Layout` | `planner.html:removeItem` | built |
| `serialize` | `Layout → StoredLayoutJSON` | `planner.html:serialize` | built |
| `deserialize` | `StoredLayoutJSON → Layout` | `planner.html:deserialize` | built |
| `computeUtilization` | `Layout → UtilizationMetrics` | `planner.html:computeUtilization` | built |
| `computePower` | `Layout → PowerEstimate` | `planner.html:computePower` | built |
| `computeSpacing` | `Layout → SpacingWarnings` | `planner.html:computeSpacing` | built |
| `computeShoppingList` | `Layout → ShoppingList` | `planner.html:computeShoppingList` | built |
| `buildBlueprint` | `Layout → Blueprint` | `planner.html:buildBlueprint` | built |
| `persist` (Trm) | `Layout(runtime) → StoredLayoutJSON(localStorage)` | `planner.html:persist` | built |
| `restore` (Trm) | `StoredLayoutJSON(localStorage) → Layout(runtime)` | `planner.html:restore` | built |
| `downloadBlueprint` (Trm) | `Blueprint(runtime) → JSON file(downloads)` | `planner.html:downloadBlueprint` | built |
| `initScrollReveal` (presentation) | `DOM(marketing subtree) → DOM` — one-shot `ScrollTrigger` per `[data-reveal]` node | `assets/js/marketing-scene.js:initScrollReveal` | built |
| `initHeroScrub` (presentation) | `scroll signal → DOM(hero portal transform)` — GSAP `ScrollTrigger` (`pin`+`scrub`) | `assets/js/marketing-scene.js:initHeroScrub` | built |
| `initHeroScene` (presentation) | `scroll progress → WebGL canvas` — Three.js scene, feature-detected, paused off-screen | `assets/js/marketing-scene.js:initHeroScene` | built |
| `initLenis` (presentation) | `wheel/touch input → smoothed scroll position` | `assets/js/marketing-scene.js:initLenis` | built |
| `initShowcaseSpin` (presentation) | `scroll signal → DOM(#showcase chair img transform)` — diagonal parallax glide (`x`/`y`/`scale`), scrubbed `ScrollTrigger`, not pinned | `assets/js/marketing-scene.js:initShowcaseSpin` | built |
| `initAccordion` (presentation) | `click → DOM(.acc-item.is-open)` | `index.html:initAccordion` | built |
| `initNavContrast` (presentation) | `scroll signal → DOM(#site-nav.nav-dark)` | `index.html:initNavContrast` | built |
| `signUp` (Trm) | `(email, password) → User` | `assets/js/site-auth.js:signUp` | built |
| `signIn` (Trm) | `(email, password) → User` | `assets/js/site-auth.js:signIn` | built |
| `signOut` (Trm) | `User → ()` | `assets/js/site-auth.js:signOut` | built |
| `getCurrentUser` | `() → User \| null` | `assets/js/site-auth.js:getCurrentUser` | built |
| `onAuthChange` | `(User \| null → ()) → ()` — listener registration, fires on every identity change | `assets/js/site-auth.js:onAuthChange` | built |
| `renderAuthNav` (presentation) | `DOM(nav root) → DOM` — wires the nav auth widget + shared auth modal | `assets/js/site-auth.js:renderAuthNav` | built |
| `saveLayoutForUser` (Trm) | `(User, Layout) → StoredLayoutRow` | `planner.html:saveLayoutForUser` | built |
| `loadLayoutForUser` (Trm) | `User → Layout` | `planner.html:loadLayoutForUser` | built |
| `layoutStore` (port) | `save: Layout → ()`, `load: () → Promise<Layout>` — dispatches to `persist`/`restore` or `saveLayoutForUser`/`loadLayoutForUser` by `getCurrentUser()` | `planner.html:layoutStore` | built |
| `bootLayout` (Trn) | `() → Layout` via `layoutStore.load`, then `afterEdit`; re-run on every `onAuthChange` | `planner.html:bootLayout` | built |

## Composition rules → where enforced

| Rule (ARCHITECTURE §6) | Enforced at | Tested at |
| --- | --- | --- |
| bounds invariant (hard) | `planner.html:withinBounds`, called from `planner.html:placementValid` | manual, see review |
| no-overlap invariant (hard) | `planner.html:hasCollision` / `planner.html:overlaps`, called from `planner.html:placementValid` | manual, see review |
| `deserialize ∘ serialize = id` | `planner.html:deserialize` (re-validates via bounds/collision on load) | manual, see review |
| power outlet formula (`OUTLETS_PER_STRIP=4`, `CIRCUIT_WATT_CAP=1800`) | `planner.html:computePower` | manual, see review |
| spacing/clearance invariant (soft) | `planner.html:computeSpacing` | manual, see review |
| shopping-list total = Σ subtotal | `planner.html:computeShoppingList` | manual, see review |

## Notes / divergences

- `addItem`/`moveItem`/`rotateItem` reject an invalid placement **silently**
  (return without mutating; `addItem` additionally shows a toast via
  `index.html:flashInvalid` when a catalog item has nowhere to go) — same
  PoC-level choice as the prior build, still recorded rather than left
  implicit per §6.6.
- `localStorage` key bumped from `spatialflow.layout.v1` (prior build) to
  `spatialflow.layout.v2` here because the stored shape changed (`room` now
  carries `presetId`) — a `v1` reader would otherwise misparse `v2` data.
  Old `v1` entries are simply orphaned, not migrated; acceptable for a PoC.
  See `openspec/changes/archive/2026-09-23-redesign-tailwind-planner/tasks.md`
  §7.1.
- Design's planned `ring-dashed` Tailwind arbitrary value was replaced with a
  plain `.spacing-warning { outline: dashed }` CSS class — `ring-*` utilities
  are box-shadow based and can't render a dashed line; same visual intent,
  substitution noted per §6.6.
- No automated test suite exists; verification is manual in-browser (see
  `reviews/review-redesign-tailwind-planner.md`). Named gap, not a silent
  one — unchanged from the prior build.
- **Cinematic redesign (`redesign-jesko-aesthetic`)**: `index.html`'s
  marketing shell was reskinned to a dark, scroll-driven, jeskojets.com-style
  aesthetic (Space Grotesk display via Google Fonts, `espresso` palette tokens,
  full-bleed sections, portal hero, split headline, accordion, spec table,
  dark finale, floating pill CTA). The planner (`FURNITURE_CATALOG`,
  `compute*`, `addItem`/`moveItem`/…, `serialize`/`deserialize`,
  `persist`/`restore`, and all internal markup/classes) is **unchanged** — it
  is only wrapped in a light "studio workbench" panel and given a new section
  heading. Presentation `Trn` (`initScrollReveal`/`initHeroZoom`/
  `initAccordion`) never touch `state.layout` and never run inside the planner
  subtree (ARCHITECTURE.md §10, planner-fence invariant).
- **Scroll motion is JS-driven, not CSS** (post-review fix): `animation-timeline:
  scroll()` AND `view()` both proved unreliable in the target engine — `scroll()`
  was inert (hero zoom), and `view()` with `animation-range: entry` left the
  final screenful (finale + blueprint summary) permanently hidden because those
  elements can't complete their entry range before the page's scroll limit. So
  `initHeroZoom` drives the hero via a rAF scroll handler, and `initScrollReveal`
  now drives ALL `[data-reveal]` reveals via `IntersectionObserver` (the CSS
  `view()` path was removed). Reduced-motion still reveals everything immediately.
- **Fixed-nav contrast** (post-review fix): the nav's `mix-blend-mode: difference`
  was illegible over the light (cream/gold/planner) sections; replaced by
  `initNavContrast`, a scroll-spy that toggles `#site-nav.nav-dark` (dark text)
  when a `data-nav="light"` section is under the nav band, defaulting to white
  text over dark sections.
- **Furniture catalog images** (restored on user request): each
  `FURNITURE_CATALOG` entry has an `image` (path into `images/furniture/`),
  rendered as `<img>` in the catalog swatch (`renderCatalog`), placed canvas
  items + drag-ghost (`renderGrid`/`attachCatalogDrag`), and shopping-list rows
  (`renderMetrics`), each with an `onerror` fallback to the Lucide icon + color.
  Resolved at render time via `catalogEntry(type)` — no `Layout`/`FurnitureItem`/
  `StoredLayoutJSON` change (verified: `localStorage` stores items by `type`/
  coords only, no `image` leak). Credited in `images/CREDITS.md`.
- **Imagery**: `images/hero-workspace.jpg` (CC BY-SA 4.0) and
  `images/showcase-chair.jpg` (public domain), sourced from Wikimedia Commons,
  credited in `images/CREDITS.md`; each `<img>` has an `onerror`/fallback so a
  missing file never breaks layout.
- **User auth + persistence (`add-user-auth-persistence`)**: `signUp`/
  `signIn`/`signOut`/`saveLayoutForUser`/`loadLayoutForUser` and the
  `layoutStore` port added per ARCHITECTURE.md §11. **Deviation from the
  initial design**: `currentUser` is set synchronously inside the
  `signUp`/`signIn`/`signOut` promise handlers (`index.html`'s auth-form
  submit handler and `btn-nav-signout` click handler), not solely by
  `supabaseClient.auth.onAuthStateChange` as first sketched — live testing
  found that relying only on the async event left a real race window where an
  edit made right after signing in could be saved to the wrong store before
  the event fired. `onAuthStateChange` is now used only for the one-time
  `INITIAL_SESSION` restore on page load. Verified live: RLS cross-account
  denial (a second account's unfiltered `select` on `layouts` returns only
  its own row, and an explicit query for the first account's `user_id`
  returns empty), signed-in save/reload/restore round-trip, the non-blocking
  save-failure warning (verified by intercepting `window.fetch`), and that
  the signed-out `localStorage` path is untouched by any signed-in save.
- **Reskin + planner split (`redesign-threejs-planner-split`)**: the planner
  (markup, state machine, `layoutStore`, `saveLayoutForUser`/
  `loadLayoutForUser`) moved from `index.html`'s `#planner`/`#summary`
  sections into a new `planner.html`, alongside the `#export-modal` its
  export button opens. `index.html`'s marketing shell was reskinned onto
  Three.js (hero WebGL scene) + Lenis (smooth scroll) + GSAP/ScrollTrigger
  (pin/scrub/reveal timelines, replacing the prior rAF/IntersectionObserver
  code), all pinned-version CDN + `<script type="importmap">`, no bundler.
  `assets/js/site-auth.js` (a native ES module) is the one piece of code
  shared by both pages — `signUp`/`signIn`/`signOut`/`getCurrentUser`/
  `onAuthChange`/`renderAuthNav`/`getSupabaseClient`, moved out of
  `index.html`'s inline script. **Deviation from the initial design**:
  `planner.html`'s `saveLayoutForUser`/`loadLayoutForUser` were first
  implemented against a second, independently-instantiated Supabase client
  (mirroring the pre-split code); live testing surfaced the Supabase SDK's
  "Multiple GoTrueClient instances" warning (two clients racing over the same
  `localStorage` auth-token key), so `planner.html` now reuses `site-auth.js`'s
  one client via `getSupabaseClient()` instead. Verified live: `index.html`'s
  auth wiring (a real failed sign-in against production Supabase shows
  "Invalid login credentials"), `planner.html` standalone (catalog render,
  click-to-place, live metrics/shopping-list, `localStorage` round-trip across
  reload, export-modal blueprint summary), the fixed nav's `position: fixed`
  staying correctly pinned to the viewport through the hero's `ScrollTrigger`
  pin (see next note), and the accordion.
- **Lenis/GSAP integration bug (found live while verifying):** `Lenis`
  defaults to running its own `requestAnimationFrame` loop. Ticking it a
  second time from `gsap.ticker` (the documented integration pattern) without
  disabling that default — i.e. omitting `{ autoRaf: false }` — double-drives
  scroll updates per frame, which desynced `ScrollTrigger`'s pinned hero from
  the rest of the page (visually, the fixed nav appeared to scroll away with
  the page instead of staying put, confirmed via `getBoundingClientRect`
  showing the correct `{top:0}` while the compositor painted it elsewhere).
  Fixed by passing `{ autoRaf: false }` to `new Lenis(...)` in
  `assets/js/marketing-scene.js:initLenis`.
- **Showcase chair motion (`add-showcase-chair-spin`)**: `initShowcaseSpin`
  (`assets/js/marketing-scene.js`) animates the `#showcase` chair `<img>` via
  a scrubbed `ScrollTrigger` (`start: "top bottom"`, `end: "bottom top"`,
  `scrub: true`) — no pin, reusing GSAP/ScrollTrigger already loaded for the
  hero. **Deviation from the initial design, two rounds of live user
  feedback**: (1) a full 360° `rotation` scrub ("spin as you scroll") was
  rejected as "looks weird" — a flat product photo doing a complete
  end-over-end turn has no third dimension to sell the rotation, so it read
  as glitching rather than turning. (2) replaced with a small parallax rise
  (`y: 70→-70`, `rotation: -6°→6°`, `scale: 0.94→1.02`), rejected as "not
  obvious enough" — correct mechanism, too subtle a range to register while
  reading the section. Settled on a **diagonal parallax glide**: `x: -70→70`,
  `y: 130→-130`, `scale: 0.78→1.12`, no rotation (dropped — it was the least
  legible axis in round 2 and the most spin-adjacent) — the chair enters
  lower-left and smaller, glides to upper-right while growing ~44%, clearly
  visible without reading as a spin. Presentation only, gated by the existing
  `prefersReducedMotion` flag. Verified live via real (wheel-driven) scroll:
  the image's computed `transform` matrix changed continuously with scroll
  position — note that driving scroll with `window.scrollTo()` directly does
  **not** trigger this (or any other `ScrollTrigger` on this page), because
  Lenis owns scroll position and only fires its `scroll` event — which
  drives `ScrollTrigger.update()` — on wheel/touch/its-own-API input, not on
  bare native `scrollTo` calls.

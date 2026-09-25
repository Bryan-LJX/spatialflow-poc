# Site — implementation map

> The functor ARCHITECTURE.md → code. Each object/morphism → the file:symbol that
> realises it. Keep in sync WITH the code (§6.3): a new morphism gets a row here in
> the same change that adds its code.

## Objects (Dat) → code

| Object | Form / shape | Realised at | State |
| --- | --- | --- | --- |
| `RoomPreset` | `{ id, label, widthFt, heightFt }` | `index.html:ROOM_PRESETS` | built |
| `RoomConfig` | `{ presetId, widthFt, heightFt }` | `index.html:defaultLayout` | built |
| `FurnitureCatalogEntry` | `{ type, label, icon, w, h, costUsd, watts, clearanceFt, color, image }` | `index.html:FURNITURE_CATALOG` | built |
| `FurnitureItem` | `{ id, type, x, y, w, h, rotation }` | `index.html:instantiate` | built |
| `Layout` | `{ room: RoomConfig, items: FurnitureItem[] }` | `index.html:defaultLayout` | built |
| `StoredLayoutJSON` | `JSON.stringify(Layout)` under `localStorage` key `spatialflow.layout.v2` | `index.html:STORAGE_KEY` | built |
| `UtilizationMetrics` | `{ usedSqFt, totalSqFt, pct }` | `index.html:computeUtilization` | built |
| `PowerEstimate` | `{ totalWatts, poweredCount, outlets }` | `index.html:computePower` | built |
| `SpacingWarnings` | `{ pairs, flaggedIds }` | `index.html:computeSpacing` | built |
| `ShoppingList` | `{ rows, total }` | `index.html:computeShoppingList` | built |
| `Blueprint` | `{ room, items, utilization, power, spacing, shoppingList, exportedAt }` | `index.html:buildBlueprint` | built |
| `User` | Supabase Auth user record `{ id, email }` | Supabase Auth service (no local realisation — read from `session.user`) | built |
| `StoredLayoutRow` | `{ user_id, layout: jsonb, updated_at }` | Supabase Postgres `layouts` table (SQL migration, not `index.html`) | built |

## Morphisms (Trn / relations) → code

| Morphism | Signature | Realising code | State |
| --- | --- | --- | --- |
| `selectRoom` | `RoomPreset → RoomConfig` | `index.html:selectRoom` | built |
| `renderGrid` | `Layout → DOM` | `index.html:renderGrid` | built |
| `instantiate` | `(FurnitureCatalogEntry, x, y) → FurnitureItem` | `index.html:instantiate` | built |
| `addItem` | `(Layout, FurnitureCatalogEntry, x, y) → Layout` | `index.html:addItem` | built |
| `moveItem` | `(Layout, id, x, y) → Layout` | `index.html:moveItem` | built |
| `rotateItem` | `(Layout, id) → Layout` | `index.html:rotateItem` | built |
| `removeItem` | `(Layout, id) → Layout` | `index.html:removeItem` | built |
| `serialize` | `Layout → StoredLayoutJSON` | `index.html:serialize` | built |
| `deserialize` | `StoredLayoutJSON → Layout` | `index.html:deserialize` | built |
| `computeUtilization` | `Layout → UtilizationMetrics` | `index.html:computeUtilization` | built |
| `computePower` | `Layout → PowerEstimate` | `index.html:computePower` | built |
| `computeSpacing` | `Layout → SpacingWarnings` | `index.html:computeSpacing` | built |
| `computeShoppingList` | `Layout → ShoppingList` | `index.html:computeShoppingList` | built |
| `buildBlueprint` | `Layout → Blueprint` | `index.html:buildBlueprint` | built |
| `persist` (Trm) | `Layout(runtime) → StoredLayoutJSON(localStorage)` | `index.html:persist` | built |
| `restore` (Trm) | `StoredLayoutJSON(localStorage) → Layout(runtime)` | `index.html:restore` | built |
| `downloadBlueprint` (Trm) | `Blueprint(runtime) → JSON file(downloads)` | `index.html:downloadBlueprint` | built |
| `initScrollReveal` (presentation) | `DOM(marketing subtree) → DOM` — IntersectionObserver-driven | `index.html:initScrollReveal` | built |
| `initHeroZoom` (presentation) | `scroll signal → DOM(hero portal transform)` | `index.html:initHeroZoom` | built |
| `initAccordion` (presentation) | `click → DOM(.acc-item.is-open)` | `index.html:initAccordion` | built |
| `initNavContrast` (presentation) | `scroll signal → DOM(#site-nav.nav-dark)` | `index.html:initNavContrast` | built |
| `signUp` (Trm) | `(email, password) → User` | `index.html:signUp` | built |
| `signIn` (Trm) | `(email, password) → User` | `index.html:signIn` | built |
| `signOut` (Trm) | `User → ()` | `index.html:signOut` | built |
| `saveLayoutForUser` (Trm) | `(User, Layout) → StoredLayoutRow` | `index.html:saveLayoutForUser` | built |
| `loadLayoutForUser` (Trm) | `User → Layout` | `index.html:loadLayoutForUser` | built |
| `layoutStore` (port) | `save: Layout → ()`, `load: () → Promise<Layout>` — dispatches to `persist`/`restore` or `saveLayoutForUser`/`loadLayoutForUser` by `currentUser` | `index.html:layoutStore` | built |
| `updateAuthUI` (presentation) | `User? → DOM(#auth-widget)` | `index.html:updateAuthUI` | built |
| `bootLayout` (Trn) | `() → Layout` via `layoutStore.load`, then `afterEdit` | `index.html:bootLayout` | built |

## Composition rules → where enforced

| Rule (ARCHITECTURE §6) | Enforced at | Tested at |
| --- | --- | --- |
| bounds invariant (hard) | `index.html:withinBounds`, called from `index.html:placementValid` | manual, see review |
| no-overlap invariant (hard) | `index.html:hasCollision` / `index.html:overlaps`, called from `index.html:placementValid` | manual, see review |
| `deserialize ∘ serialize = id` | `index.html:deserialize` (re-validates via bounds/collision on load) | manual, see review |
| power outlet formula (`OUTLETS_PER_STRIP=4`, `CIRCUIT_WATT_CAP=1800`) | `index.html:computePower` | manual, see review |
| spacing/clearance invariant (soft) | `index.html:computeSpacing` | manual, see review |
| shopping-list total = Σ subtotal | `index.html:computeShoppingList` | manual, see review |

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

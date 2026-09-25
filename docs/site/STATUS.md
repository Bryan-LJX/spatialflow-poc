# Site — status

> Reconciles ARCHITECTURE.md (intent) vs IMPLEMENTATION.md (code). Updated whenever
> code changes what is done (§6.5).

## Headline

✅ built — `redesign-threejs-planner-split`: the marketing shell
(`index.html`) is reskinned onto Three.js (WebGL hero scene) + Lenis (smooth
scroll) + GSAP/ScrollTrigger (pin/scrub/reveal timelines), all free/MIT,
CDN-only via `<script type="importmap">`, no bundler. The Micro-Office Layout
Builder moved off `index.html` onto its own `planner.html`, linked from the
marketing site's nav/CTA/finale; `assets/js/site-auth.js` (a native ES
module) is the one piece of auth/session code shared by both pages. Two bugs
found and fixed live during verification — see IMPLEMENTATION.md's
Notes/divergences (a Lenis/GSAP double-rAF desync, and a duplicate-Supabase-
client warning). Deployed and re-verified in production.

✅ built — `add-showcase-chair-spin`: a scroll-driven diagonal parallax glide
on the `#showcase` chair image (`assets/js/marketing-scene.js:
initShowcaseSpin`), reusing the GSAP/ScrollTrigger already loaded for the
hero. Two earlier iterations (a full 360° rotation, then a small parallax
rise) were tried and rejected on live user feedback before landing on this
one — see IMPLEMENTATION.md's Notes/divergences. Deployed and verified in
production.

✅ built — `add-user-auth-persistence`: email/password auth and per-user
Supabase-backed layout storage, implemented and verified both locally and in
production (registration, login, logout, session restore, save/restore
round-trip, RLS cross-account denial, non-blocking save-failure warning,
unchanged signed-out local fallback). Deployed at
**https://spatialflow-poc.vercel.app/**.

✅ built (baseline) — a room-preset-driven layout planner (live
utilization/power/spacing metrics, itemized shopping list, blueprint export)
per `docs/site/ARCHITECTURE.md`. The cinematic marketing-shell reskin
(`redesign-jesko-aesthetic`) replaced the earlier warm-wood look; the
scroll-animation + furniture-image change was discarded before it (see that
change's proposal).

## Completeness

| Object / morphism | State | Notes |
| --- | --- | --- |
| `RoomPreset` / `RoomConfig` / `FurnitureCatalogEntry` / `FurnitureItem` / `Layout` / `StoredLayoutJSON` | ✅ built | |
| `UtilizationMetrics` / `PowerEstimate` / `SpacingWarnings` / `ShoppingList` / `Blueprint` | ✅ built | all deduced, recomputed every render — verified manually |
| `selectRoom` / `renderGrid` | ✅ built | preset switch drops out-of-bounds items with notice |
| `addItem` / `moveItem` / `rotateItem` / `removeItem` | ✅ built | hard bounds + overlap invariants verified manually (off-grid drag and item-on-item drag both rejected) |
| `serialize` / `deserialize` | ✅ built | round-trip verified manually via browser reload |
| `persist` / `restore` (Trm) | ✅ built | key `spatialflow.layout.v2` |
| `computeUtilization` / `computePower` | ✅ built | verified against hand-computed values for a known layout |
| `computeSpacing` | ✅ built | soft warning confirmed non-blocking |
| `computeShoppingList` / `buildBlueprint` / `downloadBlueprint` (Trm) | ✅ built | modal contents verified to match canvas; download click ran with no console errors; re-verified unchanged after the cinematic reskin |
| `initScrollReveal` / `initHeroScrub` / `initHeroScene` / `initLenis` / `initAccordion` / `initNavContrast` (presentation, not `Dat`) | ✅ built | cinematic scroll shell on Three.js/Lenis/GSAP; verified live (hero WebGL scene + pin/scrub, reveals, accordion, nav contrast); `index.html` contains no planner code at all post-split |
| `User` / `StoredLayoutRow` | ✅ built | Supabase Auth + Postgres (`layouts` table, RLS by `user_id = auth.uid()`) |
| `signUp` / `signIn` / `signOut` (Trm) | ✅ built | verified live: successful + duplicate-email registration, successful + wrong-password login, logout, session restore across reload |
| `saveLayoutForUser` / `loadLayoutForUser` (Trm) / `layoutStore` (port) | ✅ built | verified live: save/reload round-trip, first-time-user default, non-blocking save-failure warning (simulated via `fetch` interception), RLS cross-account denial (unfiltered + targeted queries both return no other account's row), signed-out `localStorage` path unaffected |

## Needs work

1. No automated test suite — invariant, round-trip, and cost/power checks
   are manual only. Same accepted gap as the prior build.
2. Room-preset switch drops out-of-bounds items with a notice, but there's
   no undo — acceptable for a PoC, could be revisited if this grows past
   demo scope.
3. `index.html` and `planner.html` duplicate their nav/footer/auth-modal
   markup (only the auth/session *code* is shared, via `assets/js/
   site-auth.js`) — an accepted gap of the no-build-step, no-templating
   constraint (design.md Risks), not a silent one.
4. No open items from `redesign-threejs-planner-split` or
   `add-showcase-chair-spin` — both deployed and verified in production.

## Coherence

§4.5 checklists run in `reviews/review-redesign-tailwind-planner.md` (planner),
`reviews/review-redesign-jesko-aesthetic.md` (cinematic reskin),
`reviews/review-add-user-auth-persistence.md` (auth + persistence), and
`reviews/review-redesign-threejs-planner-split.md` (Three.js/Lenis/GSAP
reskin + planner split) — all checkable laws pass; see those files for the
one-line rationale per law.

## Where to dig

- Model: [ARCHITECTURE.md](ARCHITECTURE.md) · Code map: [IMPLEMENTATION.md](IMPLEMENTATION.md)
- In flight: none
- Reviews: [reviews/review-redesign-tailwind-planner.md](reviews/review-redesign-tailwind-planner.md), [reviews/review-redesign-jesko-aesthetic.md](reviews/review-redesign-jesko-aesthetic.md), [reviews/review-add-user-auth-persistence.md](reviews/review-add-user-auth-persistence.md), [reviews/review-redesign-threejs-planner-split.md](reviews/review-redesign-threejs-planner-split.md) · Notes: `general/`
- Image credits: `images/CREDITS.md`
